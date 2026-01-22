# Security Fixes Validation Checklist

## Deployment Info
- **Function**: create-subscription-payment
- **Version**: 5
- **Deployed**: 2025-01-22
- **Status**: ACTIVE

## Critical Fixes Implemented

### ✅ 1. Authorization Bypass - Fixed
**What was fixed**: Users can now ONLY create payments for their own tenants

**Test Cases**:
- [ ] **Valid Case**: User can create payment for their own tenant
  - Login as user
  - Get their tenant_id from profile
  - Call payment endpoint with their tenant_id
  - Expected: 200 OK, payment created

- [ ] **Attack Case**: User CANNOT create payment for someone else's tenant
  - Login as user A
  - Get tenant_id from user B (different tenant)
  - Call payment endpoint with user B's tenant_id
  - Expected: 403 Forbidden, error message "Forbidden"

**Code Location**: Lines 145-170 in index.ts
```typescript
// Verify user owns this tenant (CRITICAL SECURITY CHECK)
const { data: userProfile } = await supabase
  .from('users')
  .select('tenant_id')
  .eq('id', user.id)
  .single()

if (userProfile.tenant_id !== tenantId) {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
  })
}
```

---

### ✅ 2. Input Validation - Fixed
**What was fixed**: All request fields are now validated before processing

**Test Cases**:
- [ ] **Valid Input**: Properly formatted request succeeds
  ```json
  {
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "planType": "monthly",
    "email": "test@example.com",
    "name": "Juan Pérez"
  }
  ```
  Expected: 200 OK

- [ ] **Invalid UUID**: Malformed tenant ID rejected
  ```json
  { "tenantId": "not-a-uuid", ... }
  ```
  Expected: 400 Bad Request, error "Invalid tenant ID"

- [ ] **Invalid Plan Type**: Invalid plan rejected
  ```json
  { "planType": "hacker-plan", ... }
  ```
  Expected: 400 Bad Request, error "Invalid plan type"

- [ ] **Invalid Email**: Malformed email rejected
  ```json
  { "email": "not-an-email", ... }
  ```
  Expected: 400 Bad Request, error "Invalid email address"

- [ ] **Invalid Name**: Name with SQL injection attempt rejected
  ```json
  { "name": "'; DROP TABLE users; --", ... }
  ```
  Expected: 400 Bad Request, error "Invalid name"

- [ ] **XSS Attempt**: Name with script tags rejected
  ```json
  { "name": "<script>alert('xss')</script>", ... }
  ```
  Expected: 400 Bad Request, error "Invalid name"

**Code Location**: Lines 34-72 in index.ts

---

### ✅ 3. Information Disclosure - Fixed
**What was fixed**: Internal error details no longer exposed to clients

**Test Cases**:
- [ ] **MercadoPago API Error**: Internal API errors not leaked
  - Force MercadoPago API to fail (invalid token, rate limit, etc.)
  - Check response
  - Expected: Generic message "Error al crear preferencia de pago"
  - NOT Expected: MercadoPago error details, stack traces, API responses

- [ ] **General Error**: Internal errors sanitized
  - Trigger any internal error
  - Check response
  - Expected: Generic message "Internal server error"
  - NOT Expected: Stack traces, file paths, env variables

**Code Location**: Lines 237-248, 275-285 in index.ts

---

### ✅ 4. CORS Restrictions - Fixed
**What was fixed**: Only whitelisted origins can access the endpoint

**Test Cases**:
- [ ] **Allowed Origin**: Production domain works
  - Make request from https://optimadelivery.vercel.app
  - Expected: CORS headers include origin, request succeeds

- [ ] **Allowed Origin**: Localhost works (development)
  - Make request from http://localhost:5173
  - Expected: CORS headers include origin, request succeeds

- [ ] **Blocked Origin**: Random domains blocked
  - Make request from https://evil-site.com
  - Expected: CORS headers use default origin (not evil-site.com)

**Code Location**: Lines 6-25 in index.ts

---

## Additional Security Headers Validated

- [ ] **X-Content-Type-Options**: Response includes `nosniff`
- [ ] **X-Frame-Options**: Response includes `DENY`
- [ ] **X-XSS-Protection**: Response includes `1; mode=block`

Check in browser DevTools → Network → Response Headers

---

## Automated Validation

### Test Script
You can test the security fixes with curl:

```bash
# Get your auth token first
TOKEN="your-supabase-auth-token"
TENANT_ID="your-tenant-id"

# Test 1: Valid request (should succeed)
curl -X POST "https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: https://optimadelivery.vercel.app" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "planType": "monthly",
    "email": "test@example.com",
    "name": "Test User"
  }'

# Test 2: Invalid tenant ID (should fail with 400)
curl -X POST "https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "not-a-uuid",
    "planType": "monthly",
    "email": "test@example.com",
    "name": "Test User"
  }'

# Test 3: Someone else's tenant (should fail with 403)
OTHER_TENANT_ID="some-other-tenant-uuid"
curl -X POST "https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$OTHER_TENANT_ID'",
    "planType": "monthly",
    "email": "test@example.com",
    "name": "Test User"
  }'

# Test 4: XSS attempt (should fail with 400)
curl -X POST "https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "planType": "monthly",
    "email": "test@example.com",
    "name": "<script>alert(1)</script>"
  }'
```

---

## Manual Browser Testing

### Test Authorization Bypass Fix

1. Open DevTools Console
2. Get your tenant ID:
   ```javascript
   // In dashboard, run:
   console.log(window.location)
   // Find tenant ID in context
   ```

3. Test with YOUR tenant (should work):
   ```javascript
   const response = await fetch('/api/create-payment', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       tenantId: 'your-tenant-id',
       planType: 'monthly',
       email: 'you@example.com',
       name: 'Your Name'
     })
   });
   console.log(await response.json());
   ```

4. Test with SOMEONE ELSE's tenant (should fail with 403):
   ```javascript
   const response = await fetch('/api/create-payment', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       tenantId: 'different-tenant-id',
       planType: 'monthly',
       email: 'you@example.com',
       name: 'Your Name'
     })
   });
   console.log(await response.json()); // Should see { error: 'Forbidden' }
   ```

---

## Production Validation Checklist

### Before Marking as Complete:

- [ ] All critical fixes deployed (version 5 active)
- [ ] Test valid payment creation still works
- [ ] Test authorization bypass prevention (403 on wrong tenant)
- [ ] Test input validation (400 on invalid data)
- [ ] Test error messages don't leak internal details
- [ ] Test CORS headers restrict origins
- [ ] Test security headers present in responses
- [ ] No breaking changes to normal user flow

---

## Security Improvements Summary

| Issue | Severity | Status | Impact |
|-------|----------|--------|--------|
| Authorization Bypass | CRITICAL | ✅ Fixed | Users can only pay for their own tenants |
| Input Validation | CRITICAL | ✅ Fixed | Protected against injection/XSS |
| Information Disclosure | CRITICAL | ✅ Fixed | No internal errors exposed |
| CORS Misconfiguration | IMPORTANT | ✅ Fixed | Only whitelisted domains allowed |
| Missing Security Headers | MODERATE | ✅ Fixed | XSS/clickjacking protection |

---

## Remaining Recommendations (Future Work)

These are less critical but should be addressed:

1. **Rate Limiting** - Add Redis/Upstash rate limiting
2. **Webhook Signature Verification** - Verify MercadoPago webhooks
3. **Server-side Trial Enforcement** - Add RLS policies for expired trials
4. **Idempotency Keys** - Prevent duplicate payments on double-click
5. **Audit Logging** - Enhanced security event logging

---

## Deployment Verification

```bash
# Check function is active
curl https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -X OPTIONS \
  -H "Origin: https://optimadelivery.vercel.app" \
  -v

# Should see:
# - HTTP 200 OK
# - Access-Control-Allow-Origin: https://optimadelivery.vercel.app
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
```

---

## Sign-off

- [x] All critical security fixes implemented
- [x] Edge Function deployed (version 5)
- [ ] Manual testing completed
- [ ] Production validation passed
- [ ] User confirmed fixes working

**Next Steps**: Run through manual test cases and mark completed items.
