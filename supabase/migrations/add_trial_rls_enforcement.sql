-- Migration: Add Server-Side Trial Enforcement via RLS
-- This prevents expired trial users from accessing data even if they bypass client-side checks

-- Helper function to check if a tenant has active access
CREATE OR REPLACE FUNCTION has_active_subscription_or_trial(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM tenants
    WHERE id = tenant_uuid
    AND (
      -- Has active paid subscription
      subscription_status = 'active'
      -- OR trial hasn't expired yet
      OR (trial_ends_at IS NULL OR trial_ends_at > NOW())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_active_subscription_or_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription_or_trial(UUID) TO anon;

-- Add trial enforcement to menu_items table
DROP POLICY IF EXISTS "Users can view own tenant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert own tenant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can update own tenant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete own tenant menu items" ON menu_items;

-- View policy (public can view for customer-facing menu, but tenant must have active access)
CREATE POLICY "trial_enforce_menu_items_select" ON menu_items
  FOR SELECT
  USING (
    has_active_subscription_or_trial(tenant_id)
  );

-- Insert policy (only authenticated users with active subscription can add items)
CREATE POLICY "trial_enforce_menu_items_insert" ON menu_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = menu_items.tenant_id
    )
    AND has_active_subscription_or_trial(tenant_id)
  );

-- Update policy
CREATE POLICY "trial_enforce_menu_items_update" ON menu_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = menu_items.tenant_id
    )
    AND has_active_subscription_or_trial(tenant_id)
  );

-- Delete policy
CREATE POLICY "trial_enforce_menu_items_delete" ON menu_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = menu_items.tenant_id
    )
    AND has_active_subscription_or_trial(tenant_id)
  );

-- Add trial enforcement to orders table
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Users can update own tenant orders" ON orders;

CREATE POLICY "trial_enforce_orders_select" ON orders
  FOR SELECT
  USING (
    has_active_subscription_or_trial(tenant_id)
  );

CREATE POLICY "trial_enforce_orders_insert" ON orders
  FOR INSERT
  WITH CHECK (
    has_active_subscription_or_trial(tenant_id)
  );

CREATE POLICY "trial_enforce_orders_update" ON orders
  FOR UPDATE
  USING (
    has_active_subscription_or_trial(tenant_id)
    AND (
      -- Owner can update
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.tenant_id = orders.tenant_id
      )
      -- Or no auth (kitchen view via pin)
      OR auth.uid() IS NULL
    )
  );

-- Add trial enforcement to categories table
DROP POLICY IF EXISTS "Users can view own tenant categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own tenant categories" ON categories;
DROP POLICY IF EXISTS "Users can update own tenant categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own tenant categories" ON categories;

CREATE POLICY "trial_enforce_categories_select" ON categories
  FOR SELECT
  USING (
    has_active_subscription_or_trial(tenant_id)
  );

CREATE POLICY "trial_enforce_categories_insert" ON categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = categories.tenant_id
    )
    AND has_active_subscription_or_trial(tenant_id)
  );

CREATE POLICY "trial_enforce_categories_update" ON categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = categories.tenant_id
    )
    AND has_active_subscription_or_trial(tenant_id)
  );

CREATE POLICY "trial_enforce_categories_delete" ON categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = categories.tenant_id
    )
    AND has_active_subscription_or_trial(tenant_id)
  );

-- Add index for performance on trial_ends_at lookups
CREATE INDEX IF NOT EXISTS idx_tenants_trial_status ON tenants(subscription_status, trial_ends_at)
  WHERE trial_ends_at IS NOT NULL OR subscription_status = 'active';

-- Add comment
COMMENT ON FUNCTION has_active_subscription_or_trial IS 'Checks if a tenant has an active subscription or unexpired trial';
