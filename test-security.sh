#!/bin/bash

echo "=== SECURITY TESTS FOR create-subscription-payment ===" echo ""

# Test 1: CORS Headers
echo "TEST 1: CORS and Security Headers"
echo "Expected: Access-Control-Allow-Origin should be https://optimadelivery.vercel.app"
echo "Expected: x-content-type-options: nosniff"
echo "Expected: x-frame-options: DENY"
echo ""
curl -X OPTIONS https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Origin: https://optimadelivery.vercel.app" \
  -i 2>&1 | grep -E "(Access-Control-Allow-Origin|x-content-type-options|x-frame-options|x-xss-protection)"
echo ""
echo "---"
echo ""

# Test 2: Invalid UUID
echo "TEST 2: Input Validation - Invalid UUID"
echo "Expected: 400 Bad Request with 'Invalid tenant ID'"
echo ""
curl -s -X POST https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"tenantId":"not-a-uuid","planType":"monthly","email":"test@example.com","name":"Test"}'
echo ""
echo "---"
echo ""

# Test 3: Invalid Plan Type
echo "TEST 3: Input Validation - Invalid Plan Type"
echo "Expected: 400 Bad Request with 'Invalid plan type'"
echo ""
curl -s -X POST https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"tenantId":"550e8400-e29b-41d4-a716-446655440000","planType":"hacker-plan","email":"test@example.com","name":"Test"}'
echo ""
echo "---"
echo ""

# Test 4: Invalid Email
echo "TEST 4: Input Validation - Invalid Email"
echo "Expected: 400 Bad Request with 'Invalid email address'"
echo ""
curl -s -X POST https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"tenantId":"550e8400-e29b-41d4-a716-446655440000","planType":"monthly","email":"not-an-email","name":"Test"}'
echo ""
echo "---"
echo ""

# Test 5: XSS Attempt in Name
echo "TEST 5: Input Validation - XSS Attempt"
echo "Expected: 400 Bad Request with 'Invalid name'"
echo ""
curl -s -X POST https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"tenantId":"550e8400-e29b-41d4-a716-446655440000","planType":"monthly","email":"test@example.com","name":"<script>alert(1)</script>"}'
echo ""
echo "---"
echo ""

# Test 6: SQL Injection Attempt
echo "TEST 6: Input Validation - SQL Injection Attempt"
echo "Expected: 400 Bad Request with 'Invalid name'"
echo ""
curl -s -X POST https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d "{\"tenantId\":\"550e8400-e29b-41d4-a716-446655440000\",\"planType\":\"monthly\",\"email\":\"test@example.com\",\"name\":\"'; DROP TABLE users; --\"}"
echo ""
echo "---"
echo ""

# Test 7: No Authorization Header
echo "TEST 7: Missing Authorization Header"
echo "Expected: 401 Unauthorized with 'Unauthorized'"
echo ""
curl -s -X POST https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"550e8400-e29b-41d4-a716-446655440000","planType":"monthly","email":"test@example.com","name":"Test"}'
echo ""
echo "---"
echo ""

# Test 8: Invalid Auth Token
echo "TEST 8: Invalid Auth Token"
echo "Expected: 401 Unauthorized with 'Unauthorized'"
echo ""
curl -s -X POST https://nzqnibcdgqjporarwlzx.supabase.co/functions/v1/create-subscription-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-12345" \
  -d '{"tenantId":"550e8400-e29b-41d4-a716-446655440000","planType":"monthly","email":"test@example.com","name":"Test User"}'
echo ""
echo "---"
echo ""

echo "=== TESTS COMPLETE ==="
