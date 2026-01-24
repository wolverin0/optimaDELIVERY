// Platform Subscription Webhook Handler
// Handles MercadoPago payment notifications for platform subscriptions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Secure logging - only log details in development
const isDev = Deno.env.get('ENVIRONMENT') === 'development'

function secureLog(message: string) {
  console.log(message)
}
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts'

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do comparison to maintain constant time for same-length check
    // but return false for length mismatch
    let result = 1
    const maxLen = Math.max(a.length, b.length)
    for (let i = 0; i < maxLen; i++) {
      const charA = i < a.length ? a.charCodeAt(i) : 0
      const charB = i < b.length ? b.charCodeAt(i) : 0
      result |= charA ^ charB
    }
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
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

  // SECURITY: Use constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(expectedHash, hash)) {
    secureLog('Signature mismatch')
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

    secureLog('Subscription webhook received')

    // CRITICAL: Verify webhook signature to prevent fake payments
    if (!MERCADOPAGO_WEBHOOK_SECRET) {
      secureLog('CRITICAL: Webhook secret not configured')
      return new Response('Server configuration error', {
        status: 500,
        headers: {
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      })
    }

    const verification = await verifyWebhookSignature(req, MERCADOPAGO_WEBHOOK_SECRET)
    if (!verification.valid) {
      secureLog('Webhook signature verification failed')
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      })
    }
    secureLog('Webhook signature verified')

    if (!topic || !id) {
      return new Response('Missing parameters', {
        status: 400,
        headers: {
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      })
    }

    // We only care about payment notifications
    if (topic !== 'payment') {
      secureLog('Ignoring non-payment topic')
      return new Response('OK', {
        status: 200,
        headers: {
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      })
    }

    // Get payment details from MercadoPago
    secureLog('Fetching payment details from MercadoPago')
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${PLATFORM_MP_ACCESS_TOKEN}`,
      },
    })

    if (!mpResponse.ok) {
      secureLog('Failed to fetch payment')
      return new Response('Failed to fetch payment', {
        status: 500,
        headers: {
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      })
    }

    const payment = await mpResponse.json()
    secureLog('Payment details received')

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Extract tenant info from metadata or external_reference
    const tenantId = payment.metadata?.tenant_id
    const planType = payment.metadata?.plan_type
    const externalRef = payment.external_reference

    if (!tenantId || !planType) {
      secureLog('Missing tenant or plan info in payment metadata')
      return new Response('Invalid payment metadata', {
        status: 400,
        headers: {
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      })
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
      secureLog('Error updating subscription payment')
    }

    // If payment approved, activate subscription
    if (payment.status === 'approved') {
      secureLog('Payment approved, activating subscription')

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
        secureLog('Error activating subscription')
      } else {
        secureLog('Subscription activated successfully')
      }
    }

    return new Response('OK', {
      status: 200,
      headers: {
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    })

  } catch (err) {
    secureLog('Webhook error occurred')
    return new Response('Internal server error', {
      status: 500,
      headers: {
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    })
  }
})
