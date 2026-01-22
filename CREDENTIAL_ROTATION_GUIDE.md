# Credential Rotation Guide

**CRITICAL**: The following credentials were exposed in git history and MUST be rotated before production launch.

**Date Created**: 2026-01-22
**Priority**: URGENT - Required before production

---

## Exposed Credentials

The following credentials were committed in `setup-mp-secrets.sh`:

1. **Supabase Access Token**: [REDACTED - rotated]
2. **MercadoPago Platform Token**: [REDACTED - rotated]

These remain in git history even though the file was deleted. Anyone with access to your repository history can retrieve these credentials.

---

## Why This Matters

- **Supabase Token**: Full database access, can read/write/delete any data
- **MercadoPago Token**: Can create payments, access financial transactions

**Risk Level**: CRITICAL - Unauthorized access to database and payment system

---

## Rotation Steps

### 1. Rotate Supabase Access Token

**Time Required**: 5 minutes

#### Steps:

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `nzqnibcdgqjporarwlzx`

2. **Navigate to Settings → API**
   - Click "Settings" in left sidebar
   - Click "API" tab

3. **Generate New Service Role Key**
   - Find "Service Role (secret)" section
   - Click "Reveal" to see current key
   - Click "Reset" or "Generate New"
   - **IMPORTANT**: Copy the new token immediately (it won't be shown again)

4. **Update in Supabase Secrets**
   ```bash
   # Using Supabase CLI
   npx supabase secrets set ACCESS_TOKEN="YOUR_NEW_TOKEN_HERE"
   ```

   Or via Supabase Dashboard:
   - Go to Project Settings → Edge Functions → Secrets
   - Update `ACCESS_TOKEN` with new value

5. **Verify Edge Functions Still Work**
   - Test creating a subscription payment
   - Check webhook can access database

---

### 2. Rotate MercadoPago Platform Token

**Time Required**: 10 minutes

#### Steps:

1. **Login to MercadoPago Developer Dashboard**
   - Go to https://www.mercadopago.com.ar/developers
   - Login with your account

2. **Navigate to Credentials**
   - Click "Your integrations" → "Test" or "Production"
   - Find your application

3. **Create New Access Token** (or Regenerate)

   **Option A - Create New Application**:
   - Create a new application for production
   - Get the new Access Token
   - This is safer as it doesn't break existing integrations immediately

   **Option B - Regenerate Token**:
   - Find "Access Token" section
   - Click "Regenerate" or "Revoke and Create New"
   - **WARNING**: This immediately invalidates the old token

4. **Update in Supabase Secrets**
   ```bash
   npx supabase secrets set PLATFORM_MP_ACCESS_TOKEN="YOUR_NEW_MP_TOKEN"
   ```

   Or via Supabase Dashboard:
   - Go to Project Settings → Edge Functions → Secrets
   - Update `PLATFORM_MP_ACCESS_TOKEN` with new value

5. **Get Webhook Secret** (for signature verification)
   - In MercadoPago dashboard, go to Webhooks section
   - Find your webhook URL configuration
   - Copy the "Secret" key
   - Set it in Supabase:
     ```bash
     npx supabase secrets set MERCADOPAGO_WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"
     ```

6. **Test Payment Flow**
   - Create a test subscription payment
   - Verify MercadoPago checkout loads
   - Complete test payment (in test mode)
   - Verify webhook receives and processes notification

---

### 3. Verify All Systems After Rotation

**Checklist**:

- [ ] Edge Function `create-subscription-payment` works
  - Go to /checkout
  - Click "Pagar" button
  - MercadoPago checkout loads

- [ ] Edge Function `subscription-webhook` works
  - Complete a test payment
  - Check Supabase logs for webhook success
  - Verify subscription activated in `tenants` table

- [ ] No 500 errors in Edge Function logs
  - Check Supabase Dashboard → Edge Functions → Logs

- [ ] Frontend can create payments
  - No 401/403 errors

---

## Setting Secrets via Supabase Dashboard (Alternative)

If you don't have Supabase CLI installed:

1. Go to https://supabase.com/dashboard
2. Select project: `nzqnibcdgqjporarwlzx`
3. Click "Edge Functions" in left sidebar
4. Click "Manage secrets" button
5. Update these secrets:
   - `ACCESS_TOKEN` → Your new Supabase token
   - `PLATFORM_MP_ACCESS_TOKEN` → Your new MercadoPago token
   - `MERCADOPAGO_WEBHOOK_SECRET` → MercadoPago webhook secret (NEW)
6. Click "Save"

---

## Post-Rotation Checklist

After rotating credentials, verify:

- [ ] **Supabase Access Token** rotated
- [ ] **MercadoPago Platform Token** rotated
- [ ] **Webhook Secret** configured (NEW)
- [ ] **All secrets updated** in Supabase Edge Function secrets
- [ ] **Payment creation tested** and working
- [ ] **Webhook tested** and working
- [ ] **No errors in logs**

---

## Additional Security Measures

### Immediately After Rotation:

1. **Add `.gitignore` Entry** (already done)
   ```
   *.sh
   .env*
   ```

2. **Check for Other Exposed Secrets**
   ```bash
   # Search for potential secrets in git history
   git log --all --full-history -- "**/setup*.sh"
   git log --all --full-history -- "**/*.env"
   ```

3. **Enable Branch Protection** (GitHub)
   - Go to repo Settings → Branches
   - Add protection rule for `main`
   - Require pull request reviews
   - Prevent force pushes

### Long Term:

1. **Use Environment Variables Properly**
   - Never commit secrets to git
   - Always use Supabase secrets or `.env.local` (gitignored)

2. **Rotate Credentials Regularly**
   - MercadoPago tokens: Every 90 days
   - Supabase tokens: Every 90 days

3. **Monitor for Unauthorized Access**
   - Check Supabase logs regularly
   - Set up alerts for unusual database activity
   - Monitor MercadoPago transaction logs

---

## Emergency: Suspected Compromise

If you suspect credentials have been compromised:

1. **Immediately rotate ALL credentials** (both Supabase and MercadoPago)
2. **Check database for unauthorized changes**
   ```sql
   SELECT * FROM tenants ORDER BY updated_at DESC LIMIT 50;
   SELECT * FROM subscription_payments ORDER BY created_at DESC LIMIT 50;
   SELECT * FROM users ORDER BY created_at DESC LIMIT 50;
   ```
3. **Check MercadoPago for unauthorized payments**
4. **Review Supabase auth logs** for unauthorized logins
5. **Consider contacting Supabase support** if needed

---

## Questions?

**Supabase Support**: https://supabase.com/support
**MercadoPago Support**: https://www.mercadopago.com.ar/developers/panel/support

---

## Summary

**What needs to be done RIGHT NOW**:

1. ✅ Rotate Supabase Access Token (5 minutes)
2. ✅ Rotate MercadoPago Platform Token (10 minutes)
3. ✅ Add MercadoPago Webhook Secret (5 minutes)
4. ✅ Test payment flow (5 minutes)

**Total Time**: ~25 minutes

**After this, you're safe to launch to production.**

---

**Remember**: Even after rotation, the old credentials remain in git history. If your repository is public or becomes public, consider these credentials permanently compromised. The rotation ensures they can't be used, but they're still visible in history.
