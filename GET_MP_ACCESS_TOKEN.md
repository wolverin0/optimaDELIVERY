# Get MercadoPago Platform Access Token

## Quick Guide

You need to get an **access token** for the platform's MercadoPago account to charge tenants.

### Option 1: OAuth Flow (Recommended)

1. **Open this URL in your browser:**

```
https://auth.mercadopago.com.ar/authorization?client_id=8283236698213961&response_type=code&platform_id=mp&redirect_uri=https://optimadelivery.vercel.app/callback
```

2. **Login with your MercadoPago account** and authorize

3. **Copy the authorization code** from the redirected URL (it will look like: `?code=TG-XXXXXXXXXXXX`)

4. **Get your access token** by running this in your terminal:

```bash
curl -X POST https://api.mercadopago.com/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=8283236698213961' \
  -d 'client_secret=XNiCw1KfM8Q6lyMWc4TAtNi9jndB7ZDg' \
  -d 'grant_type=authorization_code' \
  -d 'code=YOUR_CODE_HERE' \
  -d 'redirect_uri=https://optimadelivery.vercel.app/callback'
```

Replace `YOUR_CODE_HERE` with the code from step 3.

5. **Copy the `access_token`** from the response

6. **Tell me the token** and I'll add it to Supabase secrets

---

### Option 2: Use Existing Token

If you already have a production MercadoPago access token, just give it to me and I'll set it up in Supabase.

---

### What Happens Next

Once you give me the token, I'll:
1. Add `PLATFORM_MP_ACCESS_TOKEN` to Supabase secrets
2. Verify the functions can access it
3. Test the payment flow
4. You'll be ready to charge tenants!
