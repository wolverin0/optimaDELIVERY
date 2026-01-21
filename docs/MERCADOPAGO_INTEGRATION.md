# MercadoPago OAuth Integration Guide

Complete guide for integrating MercadoPago OAuth in this application.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  MercadoPago     │────▶│ Supabase Edge   │
│   (Dashboard)   │     │  Authorization   │     │ Function        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                │
        │                                                ▼
        │                                        ┌─────────────────┐
        │◀───────────────────────────────────────│   Database      │
        │           (redirect + refresh)         │   (tenants)     │
        └────────────────────────────────────────┴─────────────────┘
```

## Components

### 1. Frontend (Dashboard.tsx)
- Initiates OAuth flow with authorization URL
- Handles redirect callbacks (`mp_success`, `mp_error`)
- Refreshes tenant data after successful connection

### 2. Supabase Edge Function (mercadopago-auth)
- Receives OAuth callback from MercadoPago
- Exchanges authorization code for access tokens
- Stores tokens in tenant record
- Redirects user back to frontend

### 3. Database (tenants table)
- Stores MercadoPago credentials per tenant
- Fields: `mercadopago_access_token`, `mercadopago_refresh_token`, `mercadopago_user_id`, `mercadopago_public_key`, `mercadopago_connected_at`

---

## Setup Checklist

### Step 1: MercadoPago Application Setup

1. Go to [MercadoPago Developers](https://www.mercadopago.com.ar/developers/panel/app)
2. Create a new application or select existing one
3. In **"Redirect URLs"**, add your Edge Function URL:
   ```
   https://<project-ref>.supabase.co/functions/v1/mercadopago-auth
   ```
4. Note down:
   - **Client ID** (public, used in frontend)
   - **Client Secret** (private, NEVER expose in frontend)

### Step 2: Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_MP_CLIENT_ID=<your-mercadopago-client-id>
VITE_MP_REDIRECT_URI=https://<project-ref>.supabase.co/functions/v1/mercadopago-auth
```

#### Supabase Edge Function Secrets

Go to: **Supabase Dashboard > Edge Functions > mercadopago-auth > Secrets**

Set these secrets:
| Secret Name | Value | Description |
|-------------|-------|-------------|
| `MP_CLIENT_ID` | `8283236698213961` | MercadoPago App Client ID |
| `MP_CLIENT_SECRET` | `<secret>` | MercadoPago App Client Secret |
| `FRONTEND_URL` | `https://optimadelivery.vercel.app` | Where to redirect after OAuth |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service-role-key>` | For bypassing RLS when saving tokens |

**IMPORTANT:** `SUPABASE_URL` is auto-injected by Supabase Edge Functions.

### Step 3: Database Columns

Ensure these columns exist in the `tenants` table:

```sql
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS mercadopago_access_token TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_user_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_public_key TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_connected_at TIMESTAMPTZ;
```

### Step 4: Deploy Edge Function

```bash
supabase functions deploy mercadopago-auth --project-ref <project-ref>
```

Or via Supabase Dashboard: **Edge Functions > Deploy**

---

## OAuth Flow Explained

### 1. User Clicks "Connect MercadoPago"

Frontend builds authorization URL:
```javascript
const mpAuthUrl = `https://auth.mercadopago.com.ar/authorization?` +
  `client_id=${MP_CLIENT_ID}` +
  `&response_type=code` +
  `&platform_id=mp` +
  `&redirect_uri=${MP_REDIRECT_URI}` +
  `&state=${tenant.id}`;  // Pass tenant ID for later
```

### 2. User Authorizes on MercadoPago

MercadoPago redirects to your Edge Function with:
- `code` - Authorization code (one-time use)
- `state` - Your tenant ID

### 3. Edge Function Exchanges Code for Tokens

```typescript
const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: MP_CLIENT_ID,
    client_secret: MP_CLIENT_SECRET,
    code: code,
    redirect_uri: REDIRECT_URI,  // MUST match exactly!
  }),
});
```

### 4. Tokens Saved to Database

```typescript
await supabase.from('tenants').update({
  mercadopago_access_token: tokenData.access_token,
  mercadopago_refresh_token: tokenData.refresh_token,
  mercadopago_user_id: tokenData.user_id,
  mercadopago_public_key: tokenData.public_key,
  mercadopago_connected_at: new Date().toISOString(),
}).eq('id', state);  // state = tenant_id
```

### 5. Redirect Back to Frontend

```typescript
return Response.redirect(`${FRONTEND_URL}/dashboard?mp_success=true`, 302);
```

### 6. Frontend Handles Success

```typescript
useEffect(() => {
  if (searchParams.get('mp_success') === 'true') {
    refreshTenant();  // Reload tenant to get new credentials
    toast({ title: 'MercadoPago conectado' });
    // Clean URL
    searchParams.delete('mp_success');
    setSearchParams(searchParams, { replace: true });
  }
}, [searchParams]);
```

---

## Troubleshooting

### Error: "token_exchange_failed"

**Cause:** The token exchange POST to MercadoPago failed.

**Solutions:**
1. **Check redirect_uri match** - Must be EXACTLY the same in:
   - MercadoPago dashboard redirect URLs
   - Frontend `VITE_MP_REDIRECT_URI`
   - Edge function token exchange request

2. **Check secrets are set** - Go to Supabase Edge Functions > Secrets
   - `MP_CLIENT_ID` ✓
   - `MP_CLIENT_SECRET` ✓
   - `FRONTEND_URL` ✓
   - `SUPABASE_SERVICE_ROLE_KEY` ✓

3. **Check authorization code** - Codes expire quickly (~10 minutes)

### Error: "missing_params"

**Cause:** No `code` or `state` in callback URL.

**Solutions:**
- Ensure state parameter is passed in authorization URL
- Check MercadoPago app configuration

### Error: "db_update_failed"

**Cause:** Failed to save tokens to database.

**Solutions:**
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify tenants table has required columns
- Check tenant ID (state) exists in database

### Dashboard doesn't show "Conectado" after success

**Cause:** Tenant data not refreshed.

**Solutions:**
- Ensure `refreshTenant()` is called on `mp_success=true`
- Check that tenant context properly reloads from database

### Redirects to localhost instead of production

**Cause:** `FRONTEND_URL` not set or incorrect.

**Solutions:**
- Set `FRONTEND_URL` secret in Edge Function
- Should be `https://optimadelivery.vercel.app` for production

---

## File Locations

| File | Purpose |
|------|---------|
| `src/pages/Dashboard.tsx` | OAuth initiation + callback handling |
| `supabase/functions/mercadopago-auth/index.ts` | Token exchange + DB update |
| `.env` | Frontend environment variables |
| `migrations/add_mercadopago_columns.sql` | Database schema |

---

## Security Notes

1. **NEVER expose `MP_CLIENT_SECRET`** in frontend code
2. **Use HTTPS** for all redirect URIs
3. **Validate state parameter** to prevent CSRF
4. **Store tokens encrypted** if possible (Supabase Vault)
5. **Implement token refresh** for long-term access

---

## Current Configuration (optimadelivery)

```
Supabase Project: nzqnibcdgqjporarwlzx
Edge Function URL: https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/mercadopago-auth
Frontend URL: https://optimadelivery.vercel.app
MP Client ID: 8283236698213961
```
