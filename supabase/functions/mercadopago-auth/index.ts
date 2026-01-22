// MercadoPago OAuth Callback Handler
// This Edge Function handles the OAuth callback after a user authorizes their MercadoPago account

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
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is the tenant_id
    const error = url.searchParams.get('error')

    // Get environment variables
    const MP_CLIENT_ID = Deno.env.get('MP_CLIENT_ID')!
    const MP_CLIENT_SECRET = Deno.env.get('MP_CLIENT_SECRET')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/mercadopago-auth`
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://optimadelivery.vercel.app'

    // Handle error from MercadoPago
    if (error) {
      console.error('MercadoPago OAuth error:', error)
      return Response.redirect(`${FRONTEND_URL}/dashboard?mp_error=${error}`, 302)
    }

    // Validate required params
    if (!code || !state) {
      console.error('Missing code or state parameter')
      return Response.redirect(`${FRONTEND_URL}/dashboard?mp_error=missing_params`, 302)
    }

    // Validate state is a valid UUID format (basic protection)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(state)) {
      console.error('Invalid state parameter format')
      return Response.redirect(`${FRONTEND_URL}/dashboard?mp_error=invalid_state`, 302)
    }

    console.log('Exchanging code for tokens, tenant_id:', state.substring(0, 8) + '...')

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: MP_CLIENT_ID,
        client_secret: MP_CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errorData)
      return Response.redirect(`${FRONTEND_URL}/dashboard?mp_error=token_exchange_failed`, 302)
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful')

    // Create Supabase client with service role (to bypass RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Update the tenant with MercadoPago credentials
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        mercadopago_access_token: tokenData.access_token,
        mercadopago_refresh_token: tokenData.refresh_token,
        mercadopago_user_id: tokenData.user_id?.toString(),
        mercadopago_public_key: tokenData.public_key,
        mercadopago_connected_at: new Date().toISOString(),
      })
      .eq('id', state)

    if (updateError) {
      console.error('Failed to update tenant:', updateError)
      return Response.redirect(`${FRONTEND_URL}/dashboard?mp_error=db_update_failed`, 302)
    }

    console.log('Tenant updated successfully')

    // Redirect back to dashboard with success
    return Response.redirect(`${FRONTEND_URL}/dashboard?mp_success=true`, 302)

  } catch (err) {
    console.error('Unexpected error:', err)
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://optimadelivery.vercel.app'
    return Response.redirect(`${FRONTEND_URL}/dashboard?mp_error=internal_error`, 302)
  }
})
