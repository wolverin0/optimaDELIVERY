// Platform Subscription Webhook Handler
// Handles MercadoPago payment notifications for platform subscriptions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

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
    console.error('Signature mismatch:', {
      expected: expectedHash,
      received: hash,
      manifest,
    })
    return { valid: false, error: 'Invalid signature' }
  }

  return { valid: true }
}

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const PLATFORM_MP_ACCESS_TOKEN = Deno.env.get('PLATFORM_MP_ACCESS_TOKEN')!
    const MERCADOPAGO_WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')

    // MercadoPago sends notifications as query parameters
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic')
    const id = url.searchParams.get('id')

    console.log('Subscription webhook received:', { topic, id })

    // CRITICAL: Verify webhook signature to prevent fake payments
    if (MERCADOPAGO_WEBHOOK_SECRET) {
      const verification = await verifyWebhookSignature(req, MERCADOPAGO_WEBHOOK_SECRET)

      if (!verification.valid) {
        console.error('Webhook signature verification failed:', verification.error)
        return new Response('Unauthorized', { status: 401 })
      }

      console.log('Webhook signature verified ✓')
    } else {
      console.warn('WARNING: MERCADOPAGO_WEBHOOK_SECRET not set - webhook verification disabled!')
    }

    if (!topic || !id) {
      return new Response('Missing parameters', { status: 400 })
    }

    // We only care about payment notifications
    if (topic !== 'payment') {
      console.log('Ignoring non-payment topic:', topic)
      return new Response('OK', { status: 200 })
    }

    // Get payment details from MercadoPago
    console.log('Fetching payment details from MercadoPago...')
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${PLATFORM_MP_ACCESS_TOKEN}`,
      },
    })

    if (!mpResponse.ok) {
      console.error('Failed to fetch payment:', await mpResponse.text())
      return new Response('Failed to fetch payment', { status: 500 })
    }

    const payment = await mpResponse.json()
    console.log('Payment details:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
    })

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Extract tenant info from metadata or external_reference
    const tenantId = payment.metadata?.tenant_id
    const planType = payment.metadata?.plan_type
    const externalRef = payment.external_reference

    if (!tenantId || !planType) {
      console.error('Missing tenant or plan info in payment metadata')
      return new Response('Invalid payment metadata', { status: 400 })
    }

    // Update subscription payment record
    const { error: updateError } = await supabase
      .from('subscription_payments')
      .update({
        payment_id: payment.id.toString(),
        status: payment.status,
        payment_method: payment.payment_method_id || null,
        payer_email: payment.payer?.email || null,
        approved_at: payment.status === 'approved' ? new Date().toISOString() : null,
        metadata: payment,
      })
      .eq('external_reference', externalRef)

    if (updateError) {
      console.error('Error updating subscription payment:', updateError)
    }

    // If payment approved, activate subscription
    if (payment.status === 'approved') {
      console.log('Payment approved! Activating subscription...')

      const now = new Date()
      const subscriptionEnds = planType === 'monthly'
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365 days

      const { error: tenantError } = await supabase
        .from('tenants')
        .update({
          subscription_status: 'active',
          plan_type: planType,
          subscription_started_at: now.toISOString(),
          subscription_ends_at: subscriptionEnds.toISOString(),
        })
        .eq('id', tenantId)

      if (tenantError) {
        console.error('Error activating subscription:', tenantError)
      } else {
        console.log('Subscription activated successfully!')
      }
    }

    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(`Error: ${err.message}`, { status: 500 })
  }
})
