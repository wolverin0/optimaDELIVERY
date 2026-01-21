-- ================================================
-- CLEAN RLS FIX - OPTIMADELIVERY
-- ================================================
-- This fixes all RLS issues with minimal, non-recursive policies
-- Run in Supabase SQL Editor
-- ================================================

-- Helper function to get user's tenant_id without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT tenant_id INTO v_tenant_id
    FROM public.users
    WHERE id = auth.uid();
    RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ================================================
-- USERS TABLE - Clean slate
-- ================================================
-- Drop ALL existing policies
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        WHERE cls.relname = 'users' AND cls.relnamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_name);
    END LOOP;
END $$;

-- Simple policies for users
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR tenant_id = public.get_user_tenant_id());

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ================================================
-- TENANTS TABLE - Clean slate
-- ================================================
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        WHERE cls.relname = 'tenants' AND cls.relnamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tenants', policy_name);
    END LOOP;
END $$;

-- Public read for active tenants (menu pages)
CREATE POLICY "tenants_select_public" ON public.tenants
    FOR SELECT
    USING (is_active = true);

-- Authenticated insert (handled by create_tenant_for_user function)
CREATE POLICY "tenants_insert_auth" ON public.tenants
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Update own tenant
CREATE POLICY "tenants_update_own" ON public.tenants
    FOR UPDATE TO authenticated
    USING (id = public.get_user_tenant_id())
    WITH CHECK (id = public.get_user_tenant_id());

-- ================================================
-- CATEGORIES TABLE - Clean slate
-- ================================================
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        WHERE cls.relname = 'categories' AND cls.relnamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', policy_name);
    END LOOP;
END $$;

-- Public read
CREATE POLICY "categories_select_public" ON public.categories
    FOR SELECT USING (true);

-- Insert/Update/Delete for tenant members
CREATE POLICY "categories_insert_tenant" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "categories_update_tenant" ON public.categories
    FOR UPDATE TO authenticated
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "categories_delete_tenant" ON public.categories
    FOR DELETE TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

-- ================================================
-- MENU_ITEMS TABLE - Clean slate
-- ================================================
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        WHERE cls.relname = 'menu_items' AND cls.relnamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.menu_items', policy_name);
    END LOOP;
END $$;

-- Public read
CREATE POLICY "menu_items_select_public" ON public.menu_items
    FOR SELECT USING (true);

-- Insert/Update/Delete for tenant members
CREATE POLICY "menu_items_insert_tenant" ON public.menu_items
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "menu_items_update_tenant" ON public.menu_items
    FOR UPDATE TO authenticated
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "menu_items_delete_tenant" ON public.menu_items
    FOR DELETE TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

-- ================================================
-- ORDERS TABLE - Clean slate
-- ================================================
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        WHERE cls.relname = 'orders' AND cls.relnamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', policy_name);
    END LOOP;
END $$;

-- Anyone can insert orders (customers)
CREATE POLICY "orders_insert_public" ON public.orders
    FOR INSERT WITH CHECK (tenant_id IS NOT NULL);

-- Public can read (for order tracking)
CREATE POLICY "orders_select_public" ON public.orders
    FOR SELECT USING (true);

-- Tenant members can update
CREATE POLICY "orders_update_tenant" ON public.orders
    FOR UPDATE TO authenticated
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ================================================
-- ORDER_ITEMS TABLE - Clean slate
-- ================================================
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        WHERE cls.relname = 'order_items' AND cls.relnamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', policy_name);
    END LOOP;
END $$;

-- Anyone can insert
CREATE POLICY "order_items_insert_public" ON public.order_items
    FOR INSERT WITH CHECK (order_id IS NOT NULL);

-- Public can read
CREATE POLICY "order_items_select_public" ON public.order_items
    FOR SELECT USING (true);

-- ================================================
-- VERIFICATION
-- ================================================
SELECT
    cls.relname as table_name,
    COUNT(*) as policy_count
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relnamespace = 'public'::regnamespace
AND cls.relname IN ('users', 'tenants', 'categories', 'menu_items', 'orders', 'order_items')
GROUP BY cls.relname
ORDER BY cls.relname;
