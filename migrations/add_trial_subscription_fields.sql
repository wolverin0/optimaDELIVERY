-- Trial and Subscription fields for tenants
-- Run this in Supabase SQL Editor
-- This enables the 7-day free trial with hard lockout after expiration

-- Create subscription status enum if not exists
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create plan type enum if not exists
DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('free', 'basic', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add trial/subscription fields to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS plan_type plan_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.tenants.trial_ends_at IS 'When the 7-day free trial expires';
COMMENT ON COLUMN public.tenants.subscription_status IS 'Current subscription status: trial, active, past_due, cancelled, expired';
COMMENT ON COLUMN public.tenants.plan_type IS 'Current plan: free, basic, pro';
COMMENT ON COLUMN public.tenants.subscription_started_at IS 'When the paid subscription started';
COMMENT ON COLUMN public.tenants.subscription_ends_at IS 'When the current subscription period ends';

-- Update existing tenants: give them trial from now if they don't have trial_ends_at
UPDATE public.tenants
SET trial_ends_at = NOW() + INTERVAL '7 days',
    subscription_status = 'trial'
WHERE trial_ends_at IS NULL;

-- Function to check if a tenant's trial is expired
-- Returns TRUE if trial is expired and no active subscription
CREATE OR REPLACE FUNCTION public.is_trial_expired(tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant tenants%ROWTYPE;
BEGIN
    SELECT * INTO v_tenant FROM public.tenants WHERE id = tenant_id;

    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;

    -- If subscription is active, trial doesn't matter
    IF v_tenant.subscription_status = 'active' THEN
        RETURN FALSE;
    END IF;

    -- If no trial end date set, allow access (shouldn't happen)
    IF v_tenant.trial_ends_at IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if trial has expired
    RETURN v_tenant.trial_ends_at < NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_trial_expired(UUID) TO authenticated;

-- Function to get days remaining in trial
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(tenant_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trial_ends_at TIMESTAMPTZ;
    v_days INTEGER;
BEGIN
    SELECT trial_ends_at INTO v_trial_ends_at
    FROM public.tenants
    WHERE id = tenant_id;

    IF v_trial_ends_at IS NULL THEN
        RETURN 0;
    END IF;

    v_days := CEIL(EXTRACT(EPOCH FROM (v_trial_ends_at - NOW())) / 86400);

    RETURN GREATEST(0, v_days);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_trial_days_remaining(UUID) TO authenticated;

-- Function to activate subscription for a tenant
CREATE OR REPLACE FUNCTION public.activate_subscription(
    p_tenant_id UUID,
    p_plan_type plan_type,
    p_duration_months INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.tenants
    SET subscription_status = 'active',
        plan_type = p_plan_type,
        subscription_started_at = NOW(),
        subscription_ends_at = NOW() + (p_duration_months || ' months')::INTERVAL
    WHERE id = p_tenant_id;

    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_subscription(UUID, plan_type, INTEGER) TO authenticated;

-- Index for faster queries on trial status
CREATE INDEX IF NOT EXISTS idx_tenants_trial_ends_at
ON public.tenants(trial_ends_at)
WHERE subscription_status = 'trial';

CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status
ON public.tenants(subscription_status);
