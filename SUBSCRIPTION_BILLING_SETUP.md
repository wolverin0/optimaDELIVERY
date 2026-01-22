# Subscription Billing System Setup Guide

This guide explains how to configure and deploy the platform subscription billing system that charges tenants for using optimaDELIVERY.

## Overview

**Two MercadoPago Integrations:**

1. **Tenant → Customer** (Already working)
   - Tenants connect their MP accounts
   - Receive payments from their customers

2. **Platform → Tenant** (NEW - this guide)
   - optimaDELIVERY charges tenants for subscriptions
   - Monthly: $25,000 ARS
   - Annual: $240,000 ARS

---

## Step 1: Get Platform MercadoPago Access Token

You need to get an **access token** for the platform's MercadoPago account (not tenants' accounts).

### Option A: OAuth Flow (Recommended)

1. Go to: https://www.mercadopago.com.ar/developers/panel/app
2. Create a new application
3. Note your `APP_ID` and `CLIENT_SECRET`
4. Authorize the app to get an access token:

```bash
# 1. Get authorization code
https://auth.mercadopago.com.ar/authorization?client_id=YOUR_APP_ID&response_type=code&platform_id=mp&redirect_uri=YOUR_REDIRECT_URI

# 2. Exchange code for access token
curl -X POST \
  https://api.mercadopago.com/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=YOUR_APP_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET' \
  -d 'grant_type=authorization_code' \
  -d 'code=AUTHORIZATION_CODE' \
  -d 'redirect_uri=YOUR_REDIRECT_URI'
```

### Option B: Use Existing Credentials

If you already have a production access token from MercadoPago, use that.

---

## Step 2: Add Environment Variable to Supabase

### Via Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Navigate to **Edge Functions** → **Environment Variables**
3. Add new secret:
   - Name: `PLATFORM_MP_ACCESS_TOKEN`
   - Value: `YOUR_MERCADOPAGO_ACCESS_TOKEN`

### Via Supabase CLI:

```bash
supabase secrets set PLATFORM_MP_ACCESS_TOKEN=YOUR_TOKEN
```

---

## Step 3: Add to Local .env (Optional - for testing)

Add to `.env.local`:

```bash
PLATFORM_MP_ACCESS_TOKEN=YOUR_MERCADOPAGO_ACCESS_TOKEN
FRONTEND_URL=http://localhost:5173
```

---

## Step 4: Run Database Migration

Apply the subscription_payments table migration:

```bash
# Using Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Paste contents of migrations/create_subscription_payments_table.sql
# 3. Run query

# OR using Supabase CLI:
supabase db push
```

Verify the table was created:

```sql
SELECT * FROM subscription_payments LIMIT 1;
```

---

## Step 5: Deploy Edge Functions

Deploy the three subscription billing functions:

```bash
# Deploy all functions
supabase functions deploy create-subscription-payment
supabase functions deploy subscription-webhook

# Verify deployment
supabase functions list
```

---

## Step 6: Test the Payment Flow

### 1. Complete Registration
- Go to landing page
- Click "Comenzar Ahora"
- Login with Google
- Complete business setup

### 2. You Should Be Redirected to `/checkout`
- See two plans: Mensual ($25k) and Anual ($240k)
- Select a plan
- Click "Pagar"

### 3. MercadoPago Checkout
- Redirected to MercadoPago
- Use test cards:
  - **Approved**: 5031 7557 3453 0604 (CVV: 123, Exp: 11/25)
  - **Rejected**: 5031 4332 1540 6351

### 4. Payment Confirmation
- After payment → Webhook updates subscription
- Redirected to `/dashboard?payment=success`
- Subscription status = 'active' in database

---

## Step 7: Verify in SuperAdmin

1. Go to `/super-admin`
2. Find the test tenant
3. Check subscription status shows "active"
4. Verify `subscription_ends_at` is set correctly:
   - Monthly: +30 days from now
   - Annual: +365 days from now

---

## Payment Flow Diagram

```
User Registration Flow:
┌─────────────────┐
│ Landing Page    │
│ "Comenzar Ahora"│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RegisterSetup   │
│ (Business Info) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /checkout       │◄── NEW PAGE
│ Select Plan     │
└────────┬────────┘
         │ Click "Pagar"
         ▼
┌─────────────────┐
│ Edge Function   │
│ create-sub-pay  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MercadoPago     │
│ Checkout        │
└────────┬────────┘
         │ User Pays
         ▼
┌─────────────────┐
│ Webhook         │
│ subscription-   │
│ webhook         │
└────────┬────────┘
         │ Update DB
         ▼
┌─────────────────┐
│ Dashboard       │
│ ✅ Active       │
└─────────────────┘
```

---

## Troubleshooting

### "Platform MercadoPago access token not configured"
- Make sure `PLATFORM_MP_ACCESS_TOKEN` is set in Supabase secrets
- Redeploy functions after adding the secret

### Payment created but subscription not activated
- Check webhook logs in Supabase Dashboard → Edge Functions → Logs
- Verify webhook URL in MercadoPago notification settings
- Make sure notification_url is publicly accessible

### "Error al crear preferencia de pago"
- Check MercadoPago access token is valid
- Verify token has necessary permissions
- Check Supabase function logs for detailed error

---

## Production Checklist

- [ ] Production MercadoPago access token obtained
- [ ] `PLATFORM_MP_ACCESS_TOKEN` added to Supabase secrets
- [ ] `FRONTEND_URL` set to production URL
- [ ] Database migration applied
- [ ] Edge functions deployed
- [ ] Test payment flow works
- [ ] Webhook receives notifications
- [ ] Subscription status updates correctly
- [ ] SuperAdmin can see subscription data

---

## Next Steps (Future Enhancements)

1. **Automated Renewal Reminders**
   - Cron job to check subscriptions expiring in 7 days
   - Send email with payment link

2. **Self-Service Subscription Management**
   - Cancel subscription from dashboard
   - Upgrade/downgrade plans
   - View payment history

3. **Failed Payment Handling**
   - Retry logic for failed payments
   - Grace period before suspension
   - Email notifications

4. **Invoicing**
   - Generate PDF invoices
   - Email invoices after payment
   - Invoice history in dashboard
