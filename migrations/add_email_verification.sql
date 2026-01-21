-- Email verification for tenants
-- Require email verification before a tenant can go "live"
-- Run this in Supabase SQL Editor

-- Add verification columns to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add comment explaining the columns
COMMENT ON COLUMN public.tenants.email_verified IS 'Whether the tenant owner has verified their email';
COMMENT ON COLUMN public.tenants.verification_token IS 'Token sent via email for verification';
COMMENT ON COLUMN public.tenants.verification_sent_at IS 'When the verification email was last sent';
COMMENT ON COLUMN public.tenants.verified_at IS 'When the email was verified';

-- Function to generate verification token
CREATE OR REPLACE FUNCTION public.generate_verification_token(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token TEXT;
BEGIN
    -- Generate a random token
    v_token := encode(gen_random_bytes(32), 'hex');

    -- Update the tenant with the new token
    UPDATE public.tenants
    SET verification_token = v_token,
        verification_sent_at = NOW()
    WHERE id = p_tenant_id;

    RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_verification_token(UUID) TO authenticated;

-- Function to verify email with token
CREATE OR REPLACE FUNCTION public.verify_tenant_email(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Find tenant with this token (valid for 24 hours)
    SELECT id INTO v_tenant_id
    FROM public.tenants
    WHERE verification_token = p_token
    AND verification_sent_at > NOW() - INTERVAL '24 hours'
    AND email_verified = FALSE;

    IF v_tenant_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Mark as verified
    UPDATE public.tenants
    SET email_verified = TRUE,
        verified_at = NOW(),
        verification_token = NULL
    WHERE id = v_tenant_id;

    RETURN TRUE;
END;
$$;

-- Allow anonymous users to verify (they click link from email)
GRANT EXECUTE ON FUNCTION public.verify_tenant_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_tenant_email(TEXT) TO authenticated;

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_tenants_verification_token
ON public.tenants(verification_token) WHERE verification_token IS NOT NULL;
