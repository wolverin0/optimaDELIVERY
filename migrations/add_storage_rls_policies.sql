-- Migration: Add Storage RLS Policies for tenant-assets bucket
-- This fixes the error: "new row violates row-level security policy" when uploading images
--
-- ============================================================
-- OPTION 1: Run this SQL in Supabase SQL Editor
-- ============================================================

-- First, ensure the bucket exists and is public (for reading images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Tenant users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view tenant assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Tenant users can update" ON storage.objects;

-- Policy 1: Allow any authenticated user to upload files to tenant-assets bucket
CREATE POLICY "Tenant users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tenant-assets');

-- Policy 2: Allow public access to read all files (images need to be publicly viewable)
CREATE POLICY "Anyone can view tenant assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tenant-assets');

-- Policy 3: Allow authenticated users to delete files
CREATE POLICY "Tenant users can delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tenant-assets');

-- Policy 4: Allow authenticated users to update files
CREATE POLICY "Tenant users can update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tenant-assets');

-- ============================================================
-- OPTION 2: Manual Setup via Supabase Dashboard (RECOMMENDED)
-- ============================================================
--
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket" if tenant-assets doesn't exist
--    - Name: tenant-assets
--    - Check "Public bucket"
-- 3. Click on the bucket > Policies tab
-- 4. Create these policies:
--
--    INSERT policy:
--    - Name: "Allow authenticated uploads"
--    - Target roles: authenticated
--    - WITH CHECK: true
--
--    SELECT policy:
--    - Name: "Allow public reads"
--    - Target roles: public (or anon)
--    - USING: true
--
--    DELETE policy:
--    - Name: "Allow authenticated deletes"
--    - Target roles: authenticated
--    - USING: true
--
--    UPDATE policy:
--    - Name: "Allow authenticated updates"
--    - Target roles: authenticated
--    - USING: true
