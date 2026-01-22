// Platform Subscription Payment Handler
// Creates MercadoPago payment for tenant subscriptions using PLATFORM credentials

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionPaymentRequest {
  tenantId: string;
  planType: 'monthly' | 'annual';
  email: string;
  name: string;
}

Deno.serve(async (req) => {
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

    // Parse request body
    const body: SubscriptionPaymentRequest = await req.json()
    const { tenantId, planType, email, name } = body

    console.log('Creating subscription payment:', { tenantId, planType, email })

    // Validate auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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

      return new Response(JSON.stringify({
        error: 'Error al crear preferencia de pago',
        details: errorText,
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
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: err.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
