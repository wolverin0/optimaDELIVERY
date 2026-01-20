// MercadoPago Payment Creation Handler
// Creates a payment preference for checkout

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Parse request body
    const body: PaymentRequest = await req.json()
    const { orderId, tenantId, items, payer, externalReference, backUrls } = body

    console.log('Creating payment for order:', orderId, 'tenant:', tenantId)

    // Create Supabase client to get tenant's MercadoPago credentials
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('mercadopago_access_token, mercadopago_public_key, name')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantError)
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
      console.log('Tenant has no MercadoPago connected, returning demo mode')
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
    console.log('Creating MercadoPago preference...')

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
      const errorText = await mpResponse.text()
      console.error('MercadoPago API error:', mpResponse.status, errorText)

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
    console.log('Preference created:', preference.id)

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
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      demo: true,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
