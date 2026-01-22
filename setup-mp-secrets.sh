#!/bin/bash

# Setup MercadoPago secrets in Supabase
# Run this script to add the platform MercadoPago credentials

PROJECT_REF="nzqnibcdgqjporarwlzx"
ACCESS_TOKEN="sbp_7caae16b4b18537419cc153b3399c48c0952d1f3"

echo "Setting up MercadoPago platform credentials in Supabase..."

# Set PLATFORM_MP_ACCESS_TOKEN
curl -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/secrets" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PLATFORM_MP_ACCESS_TOKEN",
    "value": "APP_USR-94784851446684-012123-779a287985579f0e26ba675e3071f841-60104869"
  }'

echo ""
echo "Setting FRONTEND_URL..."

# Set FRONTEND_URL
curl -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/secrets" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FRONTEND_URL",
    "value": "https://optimadelivery.vercel.app"
  }'

echo ""
echo "✅ Secrets configured! Edge Functions will now use your MercadoPago credentials."
echo ""
echo "Next steps:"
echo "1. Test the payment flow by going to /checkout"
echo "2. Use test card: 5031 7557 3453 0604"
echo "3. Check SuperAdmin to verify subscription activation"
