// MercadoPago Payment Creation Handler
// Creates a payment preference for checkout

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
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

// Check if we're in development mode
const isDev = Deno.env.get('ENVIRONMENT') === 'development'

function secureLog(message: string, data?: Record<string, unknown>) {
  if (isDev) {
    console.log(message, data || '')
  } else {
    // In production, only log non-sensitive info
    console.log(message)
  }
}

// Input validation helpers
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function isValidName(str: string): boolean {
  if (!str || str.length < 1 || str.length > 100) return false
  // Allow letters, numbers, spaces, and common Spanish characters
  // Block potential XSS/SQL injection characters
  const dangerousChars = /[<>'"`;\\]/
  return !dangerousChars.test(str)
}

function isValidPhone(str: string): boolean {
  if (!str || str.length < 6 || str.length > 20) return false
  // Allow digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/
  return phoneRegex.test(str)
}

interface PaymentItem {
  name: string;
  quantity: number;
  unit_price: number;
}

interface PaymentRequest {
  orderId: string;
  tenantId: string;
  items: PaymentItem[];
  payer: {
    name: string;
    phone: string;
    email?: string;
  };
  externalReference: string;
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
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
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

    // Parse request body
    const body: PaymentRequest = await req.json()
    const { orderId, tenantId, items, payer, externalReference, backUrls } = body

    // Input validation
    if (!orderId || !isValidUUID(orderId)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid order ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!tenantId || !isValidUUID(tenantId)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid tenant ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!payer?.name || !isValidName(payer.name)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid payer name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!payer?.phone || !isValidPhone(payer.phone)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid phone number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid items' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || !isValidName(item.name)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid item name' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 999) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid item quantity' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (typeof item.unit_price !== 'number' || item.unit_price < 0 || item.unit_price > 10000000) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid item price' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    secureLog('Creating payment for order', { orderId: orderId.substring(0, 8) + '...' })

    // Create Supabase client to get tenant's MercadoPago credentials
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // RATE LIMITING: Check recent payment attempts per tenant (max 20 per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const { data: recentOrders, error: rateError } = await supabase
      .from('orders')
      .select('id')
      .eq('tenant_id', tenantId)
      .not('mercadopago_preference_id', 'is', null)
      .gte('created_at', oneHourAgo)

    if (!rateError && recentOrders && recentOrders.length >= 20) {
      secureLog('Rate limit exceeded for tenant')
      return new Response(JSON.stringify({
        success: false,
        error: 'Too many payment requests. Please try again later.',
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the order exists and belongs to the tenant
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, tenant_id, mercadopago_preference_id')
      .eq('id', orderId)
      .eq('tenant_id', tenantId)
      .single()

    if (orderError || !order) {
      secureLog('Order validation failed')
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found',
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Prevent duplicate payment preference creation
    if (order.mercadopago_preference_id) {
      secureLog('Payment preference already exists for order')
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment already initiated for this order',
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('mercadopago_access_token, mercadopago_public_key, name')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      secureLog('Tenant not found')
      return new Response(JSON.stringify({
        success: false,
        error: 'Tenant not found',
        demo: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If tenant doesn't have MercadoPago connected, return demo mode
    if (!tenant.mercadopago_access_token) {
      secureLog('Tenant has no MercadoPago connected, returning demo mode')
      return new Response(JSON.stringify({
        success: true,
        demo: true,
        message: 'MercadoPago no conectado - modo demo',
        sandboxUrl: null,
        checkoutUrl: null,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create MercadoPago preference using tenant's access token
    secureLog('Creating MercadoPago preference')

    const preferenceData = {
      items: items.map(item => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS',
      })),
      payer: {
        name: payer.name,
        phone: { number: payer.phone },
        email: payer.email || undefined,
      },
      external_reference: externalReference,
      back_urls: backUrls,
      auto_return: 'approved',
      notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook?orderId=${orderId}`,
      statement_descriptor: tenant.name?.substring(0, 22) || 'Pedido Online',
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tenant.mercadopago_access_token}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!mpResponse.ok) {
      secureLog('MercadoPago API error', { status: mpResponse.status })

      // If token expired, return demo mode with message
      if (mpResponse.status === 401) {
        return new Response(JSON.stringify({
          success: false,
          demo: true,
          error: 'Token de MercadoPago expirado. Reconecta tu cuenta.',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({
        success: false,
        demo: true,
        error: 'Error al crear preferencia de pago',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const preference = await mpResponse.json()
    secureLog('Preference created successfully')

    // Update order with preference ID
    await supabase
      .from('orders')
      .update({
        mercadopago_preference_id: preference.id,
        payment_status: 'processing',
      })
      .eq('id', orderId)

    return new Response(JSON.stringify({
      success: true,
      demo: false,
      preferenceId: preference.id,
      checkoutUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    // Log error details only in development
    if (isDev) {
      console.error('Unexpected error:', err)
    } else {
      console.error('Payment creation failed')
    }
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      demo: true,
    }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
