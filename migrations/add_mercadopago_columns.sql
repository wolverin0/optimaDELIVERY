-- Add missing MercadoPago columns to tenants table
-- Run this in Supabase SQL Editor or via migration script

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS mercadopago_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_user_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_connected_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN public.tenants.mercadopago_access_token IS 'MercadoPago OAuth access token for creating payments';
COMMENT ON COLUMN public.tenants.mercadopago_refresh_token IS 'MercadoPago OAuth refresh token for renewing access';
COMMENT ON COLUMN public.tenants.mercadopago_user_id IS 'MercadoPago user ID of the connected account';
COMMENT ON COLUMN public.tenants.mercadopago_public_key IS 'MercadoPago public key for frontend SDK';
COMMENT ON COLUMN public.tenants.mercadopago_connected_at IS 'When the MercadoPago account was connected';
