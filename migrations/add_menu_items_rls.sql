-- RLS Policies for menu_items table
-- Run this in Supabase SQL Editor

-- Ensure RLS is enabled on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read menu items for active tenants" ON public.menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their tenant" ON public.menu_items;
DROP POLICY IF EXISTS "Users can update menu items for their tenant" ON public.menu_items;
DROP POLICY IF EXISTS "Users can delete menu items for their tenant" ON public.menu_items;

-- SELECT: Anyone can read menu items for active tenants (public menu)
CREATE POLICY "Public read menu items for active tenants"
ON public.menu_items
FOR SELECT
USING (
    tenant_id IN (
        SELECT id FROM public.tenants WHERE is_active = true
    )
);

-- INSERT: Authenticated users can insert menu items for their tenant
CREATE POLICY "Users can insert menu items for their tenant"
ON public.menu_items
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
);

-- UPDATE: Authenticated users can update menu items for their tenant
CREATE POLICY "Users can update menu items for their tenant"
ON public.menu_items
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
)
WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- DELETE: Authenticated users can delete menu items for their tenant
CREATE POLICY "Users can delete menu items for their tenant"
ON public.menu_items
FOR DELETE
TO authenticated
USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Verify policies were created
SELECT pol.polname, pol.polcmd
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'menu_items';
