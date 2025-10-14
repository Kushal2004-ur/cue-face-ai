-- Update old media records that have full URLs to just store file paths
-- This extracts the filename from the public URL format
UPDATE media 
SET url = regexp_replace(url, '^https?://[^/]+/storage/v1/object/public/case-evidence/', '')
WHERE url LIKE '%storage/v1/object/public/case-evidence/%';