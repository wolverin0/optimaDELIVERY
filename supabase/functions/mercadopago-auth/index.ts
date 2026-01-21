// MercadoPago OAuth Callback Handler
// This Edge Function handles the OAuth callback after a user authorizes their MercadoPago account

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
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

    console.log('Exchanging code for tokens, tenant_id:', state)
    console.log('Using REDIRECT_URI:', REDIRECT_URI)
    console.log('MP_CLIENT_ID present:', !!MP_CLIENT_ID)
    console.log('MP_CLIENT_SECRET present:', !!MP_CLIENT_SECRET)

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
      // Include more details in the redirect for debugging
      const errorInfo = encodeURIComponent(`${tokenResponse.status}: ${errorData.substring(0, 100)}`)
      return Response.redirect(`${FRONTEND_URL}/dashboard?mp_error=token_exchange_failed&details=${errorInfo}`, 302)
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful, user_id:', tokenData.user_id)

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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
