-- Migration: Security Hardening for Super Admin and OAuth
-- Fixes CRITICAL and HIGH security issues

-- ============================================
-- CRITICAL FIX: Server-side Super Admin Table
-- ============================================

-- Create super_admins table for server-side authorization
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Enable RLS on super_admins table
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can read the super_admins table
CREATE POLICY "Super admins can read super_admins" ON super_admins
    FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM super_admins WHERE user_id IS NOT NULL)
    );

-- Only existing super admins can insert new super admins
CREATE POLICY "Super admins can insert super_admins" ON super_admins
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM super_admins WHERE user_id IS NOT NULL)
    );

-- Only existing super admins can delete super admins
CREATE POLICY "Super admins can delete super_admins" ON super_admins
    FOR DELETE
    USING (
        auth.uid() IN (SELECT user_id FROM super_admins WHERE user_id IS NOT NULL)
    );

-- Create function to check if current user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM super_admins
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;

-- Create function to check super admin by email (for initial setup/seeding)
CREATE OR REPLACE FUNCTION is_super_admin_by_email(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM super_admins
        WHERE LOWER(email) = LOWER(check_email)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin_by_email(TEXT) TO authenticated;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins(LOWER(email));

-- Add comment
COMMENT ON TABLE super_admins IS 'Server-side super admin authorization. Client-side checks alone are bypassable.';
COMMENT ON FUNCTION is_super_admin() IS 'Returns true if the current authenticated user is a super admin';

-- ============================================
-- HIGH FIX: OAuth State Validation Table
-- ============================================

-- Create oauth_states table for CSRF protection
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'mercadopago',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    used_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OAuth states
CREATE POLICY "Users can view own oauth states" ON oauth_states
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create OAuth states for their tenants
CREATE POLICY "Users can create oauth states" ON oauth_states
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.tenant_id = oauth_states.tenant_id
        )
    );

-- Users can update their own oauth states (mark as used)
CREATE POLICY "Users can update own oauth states" ON oauth_states
    FOR UPDATE
    USING (user_id = auth.uid());

-- Create function to generate and store OAuth state
CREATE OR REPLACE FUNCTION create_oauth_state(
    p_tenant_id UUID,
    p_provider TEXT DEFAULT 'mercadopago',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_state_token UUID;
BEGIN
    -- Verify user owns the tenant
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND tenant_id = p_tenant_id
    ) THEN
        RAISE EXCEPTION 'User does not belong to this tenant';
    END IF;

    -- Generate state token
    v_state_token := gen_random_uuid();

    -- Insert the state
    INSERT INTO oauth_states (state_token, tenant_id, user_id, provider, ip_address, user_agent)
    VALUES (v_state_token, p_tenant_id, auth.uid(), p_provider, p_ip_address, p_user_agent);

    RETURN v_state_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_oauth_state(UUID, TEXT, INET, TEXT) TO authenticated;

-- Create function to validate and consume OAuth state (for edge functions)
CREATE OR REPLACE FUNCTION validate_oauth_state(
    p_state_token UUID,
    p_provider TEXT DEFAULT 'mercadopago'
)
RETURNS TABLE (
    is_valid BOOLEAN,
    tenant_id UUID,
    user_id UUID,
    error_message TEXT
) AS $$
DECLARE
    v_state oauth_states%ROWTYPE;
BEGIN
    -- Find the state
    SELECT * INTO v_state
    FROM oauth_states
    WHERE state_token = p_state_token
    AND provider = p_provider;

    -- Check if state exists
    IF v_state.id IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Invalid state token'::TEXT;
        RETURN;
    END IF;

    -- Check if already used
    IF v_state.used_at IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'State token already used'::TEXT;
        RETURN;
    END IF;

    -- Check if expired
    IF v_state.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'State token expired'::TEXT;
        RETURN;
    END IF;

    -- Mark as used
    UPDATE oauth_states
    SET used_at = NOW()
    WHERE id = v_state.id;

    -- Return valid result
    RETURN QUERY SELECT TRUE, v_state.tenant_id, v_state.user_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role only (for edge functions)
REVOKE EXECUTE ON FUNCTION validate_oauth_state(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION validate_oauth_state(UUID, TEXT) FROM authenticated;
-- Service role has access by default

-- Create cleanup function for expired states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM oauth_states
    WHERE expires_at < NOW() - INTERVAL '1 hour'
    OR used_at < NOW() - INTERVAL '1 hour';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_state_token ON oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_states_tenant_id ON oauth_states(tenant_id);

-- Add comments
COMMENT ON TABLE oauth_states IS 'Stores OAuth state tokens for CSRF protection during OAuth flows';
COMMENT ON FUNCTION create_oauth_state IS 'Creates a new OAuth state token for the given tenant';
COMMENT ON FUNCTION validate_oauth_state IS 'Validates and consumes an OAuth state token (service role only)';

-- ============================================
-- Seed initial super admin (if needed)
-- ============================================
-- NOTE: Run this manually after migration with your actual email:
-- INSERT INTO super_admins (email, user_id)
-- SELECT 'your-email@example.com', id
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (email) DO NOTHING;
