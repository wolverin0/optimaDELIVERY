// MercadoPago Webhook Handler
// Receives payment notifications and updates order payment_status

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

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
  }
}

// Verify MercadoPago webhook signature
async function verifyWebhookSignature(
  req: Request,
  secret: string
): Promise<{ valid: boolean; error?: string }> {
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  if (!xSignature || !xRequestId) {
    return { valid: false, error: 'Missing signature headers' }
  }

  // Parse signature header (format: "ts=1234567890,v1=abc123...")
  const parts: Record<string, string> = {}
  xSignature.split(',').forEach(part => {
    const [key, value] = part.split('=')
    parts[key.trim()] = value.trim()
  })

  const ts = parts.ts
  const hash = parts.v1

  if (!ts || !hash) {
    return { valid: false, error: 'Invalid signature format' }
  }

  // Check timestamp is recent (within 5 minutes)
  const now = Date.now()
  const signatureTime = parseInt(ts) * 1000
  const timeDiff = Math.abs(now - signatureTime)

  if (timeDiff > 5 * 60 * 1000) {
    return { valid: false, error: 'Signature expired' }
  }

  // Get query parameters
  const url = new URL(req.url)
  const dataId = url.searchParams.get('data.id') || url.searchParams.get('id')

  // Construct signed data (MercadoPago format)
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  // Calculate expected signature
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(manifest)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const expectedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Compare signatures
  if (expectedHash !== hash) {
    console.error('Signature mismatch')
    return { valid: false, error: 'Invalid signature' }
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
    const MERCADOPAGO_WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')

    // CRITICAL: Verify webhook signature to prevent fake payments
    if (!MERCADOPAGO_WEBHOOK_SECRET) {
      console.error('CRITICAL: MERCADOPAGO_WEBHOOK_SECRET not configured')
      return new Response('Server configuration error', { status: 500, headers: corsHeaders })
    }

    const verification = await verifyWebhookSignature(req, MERCADOPAGO_WEBHOOK_SECRET)
    if (!verification.valid) {
      console.error('Webhook signature verification failed:', verification.error)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }
    console.log('Webhook signature verified ✓')

    // Create Supabase client with service role to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get orderId from query params (set in notification_url)
    const url = new URL(req.url)
    const orderIdFromQuery = url.searchParams.get('orderId')

    // Parse webhook body
    let body: any = {}
    try {
      body = await req.json()
    } catch (e) {
      // Some notifications come as form data
      console.log('Could not parse JSON body, checking query params')
    }

    console.log('Webhook received for order:', orderIdFromQuery)

    // MercadoPago sends different notification formats:
    // 1. IPN: { topic: 'payment', id: '123' } or { topic: 'merchant_order', id: '123' }
    // 2. Webhook v2: { action: 'payment.updated', data: { id: '123' } }

    let paymentId: string | null = null
    let topic = body.topic || body.type || body.action

    // Handle different notification formats
    if (body.data?.id) {
      // Webhook v2 format
      paymentId = body.data.id
    } else if (body.id && body.topic === 'payment') {
      // IPN format for payment
      paymentId = body.id
    } else if (body.id && body.topic === 'merchant_order') {
      // IPN format for merchant_order - need to fetch order to get payment
      console.log('Received merchant_order notification, fetching order details...')
    }

    // Also check query params (MercadoPago sometimes sends id there)
    if (!paymentId) {
      paymentId = url.searchParams.get('data.id') || url.searchParams.get('id')
    }

    console.log('Payment ID:', paymentId, 'Topic:', topic)

    if (!paymentId) {
      console.log('No payment ID found, returning OK')
      return new Response('OK', {
        status: 200,
        headers: corsHeaders
      })
    }

    // Get order to find tenant's access token
    let orderId = orderIdFromQuery

    if (!orderId) {
      // If no orderId in query, we need to fetch payment to get external_reference
      console.log('No orderId in query, will try to find from payment data')
    }

    // If we have orderId, get the tenant's access token
    let accessToken: string | null = null

    if (orderId) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('tenant_id, tenants(mercadopago_access_token)')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        console.error('Order not found:', orderId)
        return new Response('Order not found', { status: 200, headers: corsHeaders })
      }

      accessToken = (order.tenants as any)?.mercadopago_access_token
    }

    // Fetch payment details from MercadoPago
    if (accessToken && paymentId) {
      console.log('Fetching payment details from MercadoPago...')

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!paymentResponse.ok) {
        console.error('Error fetching payment:', paymentResponse.status)
        return new Response('Payment fetch error', { status: 200, headers: corsHeaders })
      }

      const payment = await paymentResponse.json()
      console.log('Payment status:', payment.status)

      // Use external_reference if we don't have orderId
      const finalOrderId = orderId || payment.external_reference

      if (!finalOrderId) {
        console.error('Could not determine order ID')
        return new Response('Order ID unknown', { status: 200, headers: corsHeaders })
      }

      // Map MercadoPago status to our payment_status
      let newPaymentStatus: string | null = null

      switch (payment.status) {
        case 'approved':
          newPaymentStatus = 'paid'
          break
        case 'pending':
        case 'in_process':
        case 'in_mediation':
          newPaymentStatus = 'processing'
          break
        case 'rejected':
        case 'cancelled':
          newPaymentStatus = 'failed'
          break
        case 'refunded':
        case 'charged_back':
          newPaymentStatus = 'refunded'
          break
      }

      if (newPaymentStatus) {
        console.log('Updating order', finalOrderId, 'payment_status to:', newPaymentStatus)

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: newPaymentStatus,
            mercadopago_payment_id: paymentId,
          })
          .eq('id', finalOrderId)

        if (updateError) {
          console.error('Error updating order:', updateError)
        } else {
          console.log('Order payment status updated successfully!')
        }
      }
    }

    // Always return 200 OK to MercadoPago to acknowledge receipt
    return new Response('OK', {
      status: 200,
      headers: corsHeaders
    })

  } catch (err) {
    console.error('Webhook error:', err)
    // Still return 200 to avoid MercadoPago retrying
    return new Response('Error processed', {
      status: 200,
      headers: corsHeaders
    })
  }
})
