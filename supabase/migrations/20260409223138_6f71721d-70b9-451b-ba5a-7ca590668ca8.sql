INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-covers', 'challenge-covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Challenge covers are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'challenge-covers');

CREATE POLICY "Authenticated users can upload challenge covers"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'challenge-covers' AND auth.role() = 'authenticated');