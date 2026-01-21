-- Rate limiting for tenant creation
-- Track tenant creation attempts by IP/user
-- Run this in Supabase SQL Editor

-- Create a table to track creation attempts
CREATE TABLE IF NOT EXISTS public.tenant_creation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tenant_creation_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own logs
CREATE POLICY "Users can log their creation attempts" ON public.tenant_creation_log
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Only service role can read (for admin purposes)
CREATE POLICY "Service role can read logs" ON public.tenant_creation_log
FOR SELECT TO service_role
USING (true);

-- Function to check rate limit (max 3 tenants per user per day)
CREATE OR REPLACE FUNCTION public.check_tenant_creation_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Count tenants created by this user in the last 24 hours
    SELECT COUNT(*) INTO v_count
    FROM public.tenant_creation_log
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours';

    -- Allow if under limit (3 per day)
    RETURN v_count < 3;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.check_tenant_creation_rate_limit(UUID) TO authenticated;

-- Function to log creation attempt
CREATE OR REPLACE FUNCTION public.log_tenant_creation(p_user_id UUID, p_ip TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.tenant_creation_log (user_id, ip_address)
    VALUES (p_user_id, p_ip);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_tenant_creation(UUID, TEXT) TO authenticated;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_creation_log_user_created
ON public.tenant_creation_log(user_id, created_at DESC);
