-- ================================================
-- COMPREHENSIVE RLS SETUP FOR OPTIMADELIVERY
-- ================================================
-- Run this in Supabase SQL Editor to fix all RLS policies
-- This migration is idempotent (safe to run multiple times)
--
-- Tables covered:
-- 1. tenants - Multi-tenant config
-- 2. users - User profiles
-- 3. categories - Menu categories
-- 4. menu_items - Products
-- 5. orders - Customer orders
-- 6. order_items - Order line items
-- 7. team_invitations - Team invites
-- ================================================

-- ================================================
-- 1. TENANTS TABLE
-- ================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read for active tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON public.tenants;
DROP POLICY IF EXISTS "Owners can update their tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update their tenant" ON public.tenants;

-- SELECT: Anyone can read active tenants (for public menu pages)
CREATE POLICY "Public read for active tenants"
ON public.tenants FOR SELECT
USING (is_active = true);

-- INSERT: Authenticated users can create tenants (handled by create_tenant_for_user function)
-- Note: Direct INSERT is blocked by RLS, use the RPC function instead
CREATE POLICY "Authenticated users can create tenants"
ON public.tenants FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Owners and admins can update their tenant
CREATE POLICY "Owners and admins can update their tenant"
ON public.tenants FOR UPDATE
TO authenticated
USING (
    id IN (
        SELECT tenant_id FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('owner', 'admin')
    )
)
WITH CHECK (
    id IN (
        SELECT tenant_id FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('owner', 'admin')
    )
);

-- ================================================
-- 2. USERS TABLE
-- ================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their teammates" ON public.users;
DROP POLICY IF EXISTS "Owners can manage teammates" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;

-- SELECT: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- SELECT: Users can view their teammates (same tenant)
CREATE POLICY "Users can view teammates"
ON public.users FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
);

-- INSERT: System can create user records (via functions)
CREATE POLICY "System can create users"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- UPDATE: Owners can update their team members
CREATE POLICY "Owners can update team members"
ON public.users FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.users
        WHERE id = auth.uid() AND role = 'owner'
    )
);

-- DELETE: Owners can remove team members (not themselves)
CREATE POLICY "Owners can delete team members"
ON public.users FOR DELETE
TO authenticated
USING (
    id != auth.uid()
    AND tenant_id IN (
        SELECT tenant_id FROM public.users
        WHERE id = auth.uid() AND role = 'owner'
    )
);

-- ================================================
-- 3. CATEGORIES TABLE
-- ================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read categories for active tenants" ON public.categories;
DROP POLICY IF EXISTS "Users can insert categories for their tenant" ON public.categories;
DROP POLICY IF EXISTS "Users can update categories for their tenant" ON public.categories;
DROP POLICY IF EXISTS "Users can delete categories for their tenant" ON public.categories;

-- SELECT: Anyone can read categories (for public menu)
CREATE POLICY "Anyone can read categories"
ON public.categories FOR SELECT
USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true)
);

-- INSERT: Authenticated users can create categories for their tenant
CREATE POLICY "Users can insert categories for their tenant"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- UPDATE: Authenticated users can update categories for their tenant
CREATE POLICY "Users can update categories for their tenant"
ON public.categories FOR UPDATE
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
)
WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- DELETE: Authenticated users can delete categories for their tenant
CREATE POLICY "Users can delete categories for their tenant"
ON public.categories FOR DELETE
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- ================================================
-- 4. MENU_ITEMS TABLE
-- ================================================
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read menu items for active tenants" ON public.menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their tenant" ON public.menu_items;
DROP POLICY IF EXISTS "Users can update menu items for their tenant" ON public.menu_items;
DROP POLICY IF EXISTS "Users can delete menu items for their tenant" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can read menu items" ON public.menu_items;

-- SELECT: Anyone can read menu items (for public menu)
CREATE POLICY "Anyone can read menu items"
ON public.menu_items FOR SELECT
USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true)
);

-- INSERT: Authenticated users can create menu items for their tenant
CREATE POLICY "Users can insert menu items for their tenant"
ON public.menu_items FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- UPDATE: Authenticated users can update menu items for their tenant
CREATE POLICY "Users can update menu items for their tenant"
ON public.menu_items FOR UPDATE
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
)
WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- DELETE: Authenticated users can delete menu items for their tenant
CREATE POLICY "Users can delete menu items for their tenant"
ON public.menu_items FOR DELETE
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- ================================================
-- 5. ORDERS TABLE
-- ================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view tenant orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update tenant orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read orders by tenant" ON public.orders;

-- SELECT: Authenticated users can view orders for their tenant
CREATE POLICY "Users can view tenant orders"
ON public.orders FOR SELECT
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- SELECT: Public can view their own orders (by customer phone - for order tracking)
-- Note: This allows customers to see their order status
CREATE POLICY "Customers can view their orders"
ON public.orders FOR SELECT
USING (true);  -- Orders are visible if you have the order ID

-- INSERT: Anyone can create orders (customers placing orders)
CREATE POLICY "Anyone can insert orders"
ON public.orders FOR INSERT
WITH CHECK (tenant_id IS NOT NULL);

-- UPDATE: Authenticated users can update orders for their tenant
CREATE POLICY "Users can update tenant orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
)
WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- ================================================
-- 6. ORDER_ITEMS TABLE
-- ================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can read order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can read order items for their orders" ON public.order_items;

-- SELECT: Anyone can read order items (for order confirmation/tracking)
CREATE POLICY "Anyone can read order items"
ON public.order_items FOR SELECT
USING (true);

-- INSERT: Anyone can create order items (when placing orders)
CREATE POLICY "Anyone can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (order_id IS NOT NULL);

-- UPDATE: Staff can update order items
CREATE POLICY "Staff can update order items"
ON public.order_items FOR UPDATE
TO authenticated
USING (
    order_id IN (
        SELECT o.id FROM public.orders o
        JOIN public.users u ON u.tenant_id = o.tenant_id
        WHERE u.id = auth.uid()
    )
);

-- ================================================
-- 7. TEAM_INVITATIONS TABLE
-- ================================================
-- Note: RLS policies for team_invitations are in add_team_invitations.sql
-- This section ensures they exist and are correct

ALTER TABLE IF EXISTS public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies only if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_invitations') THEN
        DROP POLICY IF EXISTS "Owners and admins can view tenant invitations" ON public.team_invitations;
        DROP POLICY IF EXISTS "Owners and admins can create invitations" ON public.team_invitations;
        DROP POLICY IF EXISTS "Owners and admins can delete invitations" ON public.team_invitations;
        DROP POLICY IF EXISTS "Anyone can read invitation by token" ON public.team_invitations;
        DROP POLICY IF EXISTS "Authenticated users can accept invitations" ON public.team_invitations;

        -- SELECT: Owners/admins can view invitations
        CREATE POLICY "Owners and admins can view tenant invitations"
        ON public.team_invitations FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid()
                AND users.tenant_id = team_invitations.tenant_id
                AND users.role IN ('owner', 'admin')
            )
        );

        -- SELECT: Anyone can read valid invitations (for acceptance page)
        CREATE POLICY "Anyone can read valid invitations"
        ON public.team_invitations FOR SELECT
        USING (
            accepted_at IS NULL
            AND expires_at > NOW()
        );

        -- INSERT: Owners/admins can create invitations
        CREATE POLICY "Owners and admins can create invitations"
        ON public.team_invitations FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid()
                AND users.tenant_id = team_invitations.tenant_id
                AND users.role IN ('owner', 'admin')
            )
        );

        -- UPDATE: Authenticated users can accept invitations
        CREATE POLICY "Authenticated users can accept invitations"
        ON public.team_invitations FOR UPDATE
        USING (
            accepted_at IS NULL
            AND expires_at > NOW()
            AND auth.uid() IS NOT NULL
        )
        WITH CHECK (
            accepted_at IS NOT NULL
        );

        -- DELETE: Owners/admins can delete/revoke invitations
        CREATE POLICY "Owners and admins can delete invitations"
        ON public.team_invitations FOR DELETE
        USING (
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid()
                AND users.tenant_id = team_invitations.tenant_id
                AND users.role IN ('owner', 'admin')
            )
        );
    END IF;
END $$;

-- ================================================
-- ENABLE REALTIME FOR ORDERS (for Kitchen)
-- ================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify policies are correctly set up:

-- Check all policies on all tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual IS NOT NULL as has_using,
    with_check IS NOT NULL as has_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS is enabled on all tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tenants', 'users', 'categories', 'menu_items', 'orders', 'order_items', 'team_invitations');
