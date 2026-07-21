-- Enforce MIME allowlists on the career upload buckets at the storage layer.
-- The signed-URL mint route (/api/career-upload-url) validates the DECLARED
-- type when minting, but nothing previously stopped a caller from PUTting a
-- different content-type to the signed URL. With allowed_mime_types set,
-- Supabase rejects uploads whose Content-Type falls outside this list.
--
-- Must stay in sync with ALLOWED_MIME in app/api/career-upload-url/route.ts
-- and the per-file schemas in lib/validations/career-application.ts.
--
-- NOTE: this validates the upload's Content-Type header, not the actual
-- bytes — byte-level sniffing isn't possible in the direct-to-storage flow.
-- It still closes the "declare application/pdf at mint, upload anything to
-- the signed URL" gap.

UPDATE storage.buckets
  SET allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  WHERE id = 'career_resumes';

UPDATE storage.buckets
  SET allowed_mime_types = ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
  WHERE id = 'career_portfolios';
