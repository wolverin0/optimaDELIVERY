-- Team Invitations Table
-- Allows owners/admins to invite staff members via secure links

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
    token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate pending invitations for same email/tenant
    CONSTRAINT unique_pending_invitation UNIQUE (tenant_id, email)
);

-- Create index for token lookups (used when accepting invitations)
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);

-- Create index for tenant lookups (list invitations)
CREATE INDEX IF NOT EXISTS idx_team_invitations_tenant ON public.team_invitations(tenant_id);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Owners and admins can view invitations for their tenant
CREATE POLICY "Owners and admins can view tenant invitations"
    ON public.team_invitations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.tenant_id = team_invitations.tenant_id
            AND users.role IN ('owner', 'admin')
        )
    );

-- Policy: Owners and admins can create invitations for their tenant
CREATE POLICY "Owners and admins can create invitations"
    ON public.team_invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.tenant_id = team_invitations.tenant_id
            AND users.role IN ('owner', 'admin')
        )
    );

-- Policy: Owners and admins can delete/revoke invitations
CREATE POLICY "Owners and admins can delete invitations"
    ON public.team_invitations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.tenant_id = team_invitations.tenant_id
            AND users.role IN ('owner', 'admin')
        )
    );

-- Policy: Anyone can read invitation by token (for accepting)
-- This allows the invitation page to validate and display invitation details
CREATE POLICY "Anyone can read invitation by token"
    ON public.team_invitations
    FOR SELECT
    USING (
        -- Allow reading if invitation hasn't been accepted and hasn't expired
        accepted_at IS NULL
        AND expires_at > NOW()
    );

-- Policy: Authenticated users can accept invitations (update accepted_at)
CREATE POLICY "Authenticated users can accept invitations"
    ON public.team_invitations
    FOR UPDATE
    USING (
        -- Can only update unaccepted, non-expired invitations
        accepted_at IS NULL
        AND expires_at > NOW()
        AND auth.uid() IS NOT NULL
    )
    WITH CHECK (
        -- Can only set accepted_at (not modify other fields)
        accepted_at IS NOT NULL
    );

-- Function to generate secure URL-safe invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
BEGIN
    -- Generate a URL-safe random token (32 bytes)
    -- Replace base64 chars that aren't URL-safe: + -> -, / -> _, remove =
    v_token := encode(gen_random_bytes(32), 'base64');
    v_token := replace(v_token, '+', '-');
    v_token := replace(v_token, '/', '_');
    v_token := replace(v_token, '=', '');
    RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Function to create invitation and return token
CREATE OR REPLACE FUNCTION create_team_invitation(
    p_tenant_id UUID,
    p_email TEXT,
    p_role TEXT DEFAULT 'staff'
)
RETURNS TABLE (
    invitation_id UUID,
    token TEXT,
    expires_at TIMESTAMPTZ
) AS $$
DECLARE
    v_token TEXT;
    v_invitation_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Generate token
    v_token := generate_invitation_token();
    v_expires_at := NOW() + INTERVAL '7 days';

    -- Insert invitation (will fail if duplicate email/tenant due to constraint)
    INSERT INTO public.team_invitations (tenant_id, email, role, token, invited_by, expires_at)
    VALUES (p_tenant_id, LOWER(TRIM(p_email)), p_role, v_token, auth.uid(), v_expires_at)
    RETURNING id INTO v_invitation_id;

    RETURN QUERY SELECT v_invitation_id, v_token, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation and add user to tenant
CREATE OR REPLACE FUNCTION accept_team_invitation(p_token TEXT)
RETURNS TABLE (
    success BOOLEAN,
    tenant_id UUID,
    tenant_name TEXT,
    role TEXT,
    message TEXT
) AS $$
DECLARE
    v_invitation RECORD;
    v_user_id UUID;
    v_existing_user RECORD;
BEGIN
    v_user_id := auth.uid();

    -- Check if user is authenticated
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, 'User not authenticated'::TEXT;
        RETURN;
    END IF;

    -- Find the invitation
    SELECT i.*, t.name as tenant_name
    INTO v_invitation
    FROM public.team_invitations i
    JOIN public.tenants t ON t.id = i.tenant_id
    WHERE i.token = p_token
    AND i.accepted_at IS NULL
    AND i.expires_at > NOW();

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Invitation not found, expired, or already used'::TEXT;
        RETURN;
    END IF;

    -- Check if user already belongs to a tenant
    SELECT * INTO v_existing_user
    FROM public.users
    WHERE id = v_user_id;

    IF FOUND AND v_existing_user.tenant_id IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, 'User already belongs to a team'::TEXT;
        RETURN;
    END IF;

    -- Add user to tenant (update existing user record or create new one)
    IF FOUND THEN
        -- Update existing user record
        UPDATE public.users
        SET tenant_id = v_invitation.tenant_id,
            role = v_invitation.role,
            updated_at = NOW()
        WHERE id = v_user_id;
    ELSE
        -- Create new user record
        INSERT INTO public.users (id, tenant_id, email, role)
        VALUES (v_user_id, v_invitation.tenant_id, v_invitation.email, v_invitation.role);
    END IF;

    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET accepted_at = NOW()
    WHERE id = v_invitation.id;

    RETURN QUERY SELECT TRUE, v_invitation.tenant_id, v_invitation.tenant_name, v_invitation.role, 'Successfully joined team'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
