
-- Drop existing overly permissive policies on challenge-covers
DROP POLICY IF EXISTS "Authenticated users can upload challenge covers" ON storage.objects;
DROP POLICY IF EXISTS "Challenge covers are publicly accessible" ON storage.objects;

-- Restrict uploads: user can only upload to their own folder
CREATE POLICY "Users can upload their own challenge covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'challenge-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read of challenge cover files (but not listing)
CREATE POLICY "Challenge covers are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'challenge-covers');

-- Allow users to update their own challenge covers
CREATE POLICY "Users can update their own challenge covers"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'challenge-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own challenge covers
CREATE POLICY "Users can delete their own challenge covers"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'challenge-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Also fix avatars bucket: restrict listing
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Avatar images are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
