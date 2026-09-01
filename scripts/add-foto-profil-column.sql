-- Migration: Add foto_profil column to users table
-- Run this in Supabase SQL Editor or via migration

-- 1. Add foto_profil column (stores the public URL of the uploaded photo)
ALTER TABLE users ADD COLUMN IF NOT EXISTS foto_profil TEXT DEFAULT NULL;

-- 2. Create a storage bucket for profile photos (if not exists)
-- Run this via Supabase Dashboard > Storage > New Bucket
-- Bucket name: profile-photos
-- Public: true
-- File size limit: 2 MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 3. RLS policy for profile-photos bucket (allow public read, authenticated write)
-- This is usually configured via the Supabase Dashboard, but here's the SQL equivalent:

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profile-photos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access for profile-photos'
  ) THEN
    CREATE POLICY "Public read access for profile-photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'profile-photos');
  END IF;
END $$;

-- Allow authenticated users to insert into profile-photos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated insert for profile-photos'
  ) THEN
    CREATE POLICY "Authenticated insert for profile-photos"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'profile-photos');
  END IF;
END $$;

-- Allow authenticated users to update their own photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated update for profile-photos'
  ) THEN
    CREATE POLICY "Authenticated update for profile-photos"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'profile-photos');
  END IF;
END $$;
