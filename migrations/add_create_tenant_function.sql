-- Function to create a new tenant and associate the current user
-- This function uses SECURITY DEFINER to bypass RLS with proper validation
-- It ensures a user can only create ONE tenant and becomes the owner

-- Drop existing function if return type changed
DROP FUNCTION IF EXISTS public.create_tenant_for_user(TEXT, TEXT, TEXT, JSONB);

-- Create the function
CREATE OR REPLACE FUNCTION public.create_tenant_for_user(
    p_name TEXT,
    p_slug TEXT,
    p_phone TEXT DEFAULT NULL,
    p_theme JSONB DEFAULT '{"templateId": "classic", "primaryColor": "#f97316"}'::JSONB
)
RETURNS TABLE (
    success BOOLEAN,
    out_tenant_id UUID,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_user_name TEXT;
    v_user_avatar TEXT;
    v_existing_tenant UUID;
    v_new_tenant_id UUID;
BEGIN
    -- Get the current user's ID from auth
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'User not authenticated'::TEXT;
        RETURN;
    END IF;

    -- Get user info from auth.users
    SELECT au.raw_user_meta_data->>'full_name',
           au.raw_user_meta_data->>'avatar_url',
           au.email
    INTO v_user_name, v_user_avatar, v_user_email
    FROM auth.users au
    WHERE au.id = v_user_id;

    -- Check if user already has a tenant
    SELECT u.tenant_id INTO v_existing_tenant
    FROM public.users u
    WHERE u.id = v_user_id AND u.tenant_id IS NOT NULL;

    IF v_existing_tenant IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, v_existing_tenant, 'User already has a tenant'::TEXT;
        RETURN;
    END IF;

    -- Check if slug is already taken
    IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = LOWER(TRIM(p_slug))) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Slug already taken'::TEXT;
        RETURN;
    END IF;

    -- Create the tenant
    INSERT INTO public.tenants (
        name,
        slug,
        business_phone,
        theme,
        is_active,
        settings,
        trial_ends_at,
        subscription_status,
        plan_type
    )
    VALUES (
        p_name,
        LOWER(TRIM(p_slug)),
        p_phone,
        p_theme,
        TRUE,
        '{"currency": "ARS", "deliveryEnabled": true, "pickupEnabled": true}'::JSONB,
        NOW() + INTERVAL '7 days',
        'trial',
        'free'
    )
    RETURNING id INTO v_new_tenant_id;

    -- Create or update the user record
    INSERT INTO public.users (
        id,
        tenant_id,
        email,
        full_name,
        avatar_url,
        role,
        is_active
    )
    VALUES (
        v_user_id,
        v_new_tenant_id,
        v_user_email,
        COALESCE(v_user_name, SPLIT_PART(v_user_email, '@', 1)),
        v_user_avatar,
        'owner',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET tenant_id = v_new_tenant_id,
        role = 'owner',
        is_active = TRUE,
        updated_at = NOW();

    -- Create default categories
    INSERT INTO public.categories (tenant_id, name, slug, sort_order)
    VALUES
        (v_new_tenant_id, 'Comida', 'comida', 0),
        (v_new_tenant_id, 'Bebidas', 'bebidas', 1),
        (v_new_tenant_id, 'Postres', 'postres', 2);

    RETURN QUERY SELECT TRUE, v_new_tenant_id, NULL::TEXT;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_tenant_for_user(TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- Also ensure proper RLS policies exist for orders (needed for kitchen to see orders)
-- Policy: Anyone can insert orders for a tenant (customers placing orders)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (
        tenant_id IS NOT NULL
    );

-- Policy: Authenticated users can view orders for their tenant
DROP POLICY IF EXISTS "Users can view tenant orders" ON public.orders;
CREATE POLICY "Users can view tenant orders"
    ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.tenant_id = orders.tenant_id
        )
    );

-- Policy: Authenticated users can update orders for their tenant
DROP POLICY IF EXISTS "Users can update tenant orders" ON public.orders;
CREATE POLICY "Users can update tenant orders"
    ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.tenant_id = orders.tenant_id
        )
    );

-- Enable realtime for orders table (skip if already exists)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
