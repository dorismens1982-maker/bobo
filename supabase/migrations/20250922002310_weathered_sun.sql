/*
  # Add logo support to users table

  1. Changes
    - Add `logo_url` column to `users` table to store business logo URL
    - Column is nullable as not all users will upload a logo

  2. Storage
    - Create storage bucket for logos in Supabase dashboard
    - Set up RLS policies for user-specific logo management
*/

-- Add logo_url column to users table
ALTER TABLE users ADD COLUMN logo_url text;

-- Create storage bucket and policies (run these in Supabase dashboard)
-- Bucket name: 'logos'
-- RLS policies needed:
-- 1. Allow authenticated users to upload: bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]
-- 2. Allow public read access: bucket_id = 'logos'
-- 3. Allow users to delete their own: bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]