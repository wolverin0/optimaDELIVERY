// Platform Subscription Payment Handler
// Creates MercadoPago payment for tenant subscriptions using PLATFORM credentials

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://optimadelivery.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  }
}

interface SubscriptionPaymentRequest {
  tenantId: string;
  planType: 'monthly' | 'annual';
  email: string;
  name: string;
}

// Input validation functions
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-Z0-9\s\-\.áéíóúñÁÉÍÓÚÑüÜ]+$/
  return nameRegex.test(name) && name.length >= 1 && name.length <= 255
}

function validatePaymentRequest(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  if (!body.tenantId || !isValidUUID(body.tenantId)) {
    return { valid: false, error: 'Invalid tenant ID' }
  }

  if (!body.planType || !['monthly', 'annual'].includes(body.planType)) {
    return { valid: false, error: 'Invalid plan type' }
  }

  if (!body.email || !isValidEmail(body.email)) {
    return { valid: false, error: 'Invalid email address' }
  }

  if (!body.name || !isValidName(body.name)) {
    return { valid: false, error: 'Invalid name' }
  }

  return { valid: true }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const PLATFORM_MP_ACCESS_TOKEN = Deno.env.get('PLATFORM_MP_ACCESS_TOKEN')!

    if (!PLATFORM_MP_ACCESS_TOKEN) {
      throw new Error('Platform MercadoPago access token not configured')
    }

    // Validate auth token first
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No Authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client with user's auth token to verify they're logged in
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('User authenticated:', user.id)

    // Parse and validate request body
    const body: SubscriptionPaymentRequest = await req.json()

    const validation = validatePaymentRequest(body)
    if (!validation.valid) {
      console.error('Validation failed:', validation.error)
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { tenantId, planType, email, name } = body

    console.log('Creating subscription payment:', { tenantId, planType, userId: user.id })

    // Create Supabase client with service role for database operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // RATE LIMITING: Check recent payment attempts (max 5 per hour per user)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('subscription_payments')
      .select('id')
      .eq('tenant_id', tenantId)
      .gte('created_at', oneHourAgo)

    if (!attemptsError && recentAttempts && recentAttempts.length >= 5) {
      console.error('Rate limit exceeded:', {
        userId: user.id,
        tenantId,
        attempts: recentAttempts.length,
      })
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify user owns this tenant (CRITICAL SECURITY CHECK)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('User profile not found:', profileError)
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (userProfile.tenant_id !== tenantId) {
      console.error('Authorization failed: User does not own tenant', {
        userId: user.id,
        userTenantId: userProfile.tenant_id,
        requestedTenantId: tenantId,
      })
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantError)
      return new Response(JSON.stringify({ error: 'Tenant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Determine price based on plan
    const prices = {
      monthly: 25000, // $25,000 ARS/month
      annual: 240000,  // $240,000 ARS/year (12 months × $20k/month)
    }

    const price = prices[planType]
    const description = planType === 'monthly'
      ? 'Suscripción Mensual - optimaDELIVERY'
      : 'Suscripción Anual - optimaDELIVERY (12 meses)'

    // Create MercadoPago preference using PLATFORM credentials
    const preferenceData = {
      items: [{
        title: description,
        quantity: 1,
        unit_price: price,
        currency_id: 'ARS',
      }],
      payer: {
        name: name,
        email: email,
      },
      external_reference: `subscription_${tenantId}_${planType}_${Date.now()}`,
      back_urls: {
        success: `${Deno.env.get('FRONTEND_URL') || 'https://optimadelivery.vercel.app'}/dashboard?payment=success`,
        failure: `${Deno.env.get('FRONTEND_URL') || 'https://optimadelivery.vercel.app'}/checkout?payment=failure`,
        pending: `${Deno.env.get('FRONTEND_URL') || 'https://optimadelivery.vercel.app'}/checkout?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: `${SUPABASE_URL}/functions/v1/subscription-webhook`,
      statement_descriptor: 'optimaDELIVERY',
      metadata: {
        tenant_id: tenantId,
        plan_type: planType,
        tenant_name: tenant.name,
      },
    }

    console.log('Creating MercadoPago preference with platform credentials...')

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLATFORM_MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text()
      console.error('MercadoPago API error:', mpResponse.status, errorText)

      // Do NOT expose internal API errors to client
      return new Response(JSON.stringify({
        error: 'Error al crear preferencia de pago',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const preference = await mpResponse.json()
    console.log('Subscription preference created:', preference.id)

    // Store pending subscription payment
    await supabase
      .from('subscription_payments')
      .insert({
        tenant_id: tenantId,
        plan_type: planType,
        amount: price,
        preference_id: preference.id,
        status: 'pending',
        external_reference: preferenceData.external_reference,
      })

    return new Response(JSON.stringify({
      success: true,
      preferenceId: preference.id,
      checkoutUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Unexpected error:', err)

    // Do NOT expose internal error messages to client
    return new Response(JSON.stringify({
      error: 'Internal server error',
    }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
