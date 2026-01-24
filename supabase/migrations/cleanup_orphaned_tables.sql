-- Migration: Remove orphaned tables from database contamination
-- These tables are from another project and have 0 rows, no code references
-- Safe to drop

-- First drop tables with foreign key dependencies (child tables first)
DROP TABLE IF EXISTS gift_card_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS draft_items CASCADE;
DROP TABLE IF EXISTS order_item_modifiers CASCADE;
DROP TABLE IF EXISTS menu_item_modifiers CASCADE;

-- Then drop parent tables
DROP TABLE IF EXISTS gift_cards CASCADE;
DROP TABLE IF EXISTS loyalty_members CASCADE;
DROP TABLE IF EXISTS stock_items CASCADE;
DROP TABLE IF EXISTS modifier_options CASCADE;
DROP TABLE IF EXISTS modifier_groups CASCADE;
DROP TABLE IF EXISTS drafts CASCADE;

-- Drop standalone orphaned tables
DROP TABLE IF EXISTS ai_settings CASCADE;
DROP TABLE IF EXISTS mobile_devices CASCADE;
DROP TABLE IF EXISTS void_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS staff_schedules CASCADE;
DROP TABLE IF EXISTS tenant_creation_log CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS online_orders CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS printers CASCADE;
DROP TABLE IF EXISTS tables CASCADE;

-- Clean up any orphaned sequences
DROP SEQUENCE IF EXISTS draft_items_id_seq CASCADE;
DROP SEQUENCE IF EXISTS loyalty_transactions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS stock_movements_id_seq CASCADE;
DROP SEQUENCE IF EXISTS order_item_modifiers_id_seq CASCADE;
DROP SEQUENCE IF EXISTS menu_item_modifiers_id_seq CASCADE;
DROP SEQUENCE IF EXISTS gift_card_transactions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS audit_logs_id_seq CASCADE;
DROP SEQUENCE IF EXISTS printers_id_seq CASCADE;

-- Verify remaining tables match expected schema
-- Expected tables after cleanup:
-- - tenants (core)
-- - users (core)
-- - categories (core)
-- - menu_items (core)
-- - orders (core)
-- - order_items (core)
-- - team_invitations (feature)
-- - subscription_payments (feature)
-- - design_requests (feature)
-- - kitchen_pin_attempts (security)

COMMENT ON SCHEMA public IS 'optimadelivery schema - cleaned up orphaned tables from database contamination';
