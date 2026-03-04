-- Allow public read access to exercise images in Supabase Storage
-- Run this in the Supabase SQL Editor

-- Ensure the bucket exists and is public
UPDATE storage.buckets
SET public = true
WHERE id = 'exercise-images';

-- Allow anyone to read (download) from the exercise-images bucket
CREATE POLICY "exercise_images_public_read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'exercise-images');
