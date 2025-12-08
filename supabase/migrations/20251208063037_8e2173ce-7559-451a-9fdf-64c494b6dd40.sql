-- Fix the media URL to remove the bucket prefix (non-destructive - just correcting the path)
UPDATE public.media 
SET url = 'sketch-c2904fe6-b142-4ec7-a622-a41b70af1ab0-1764003038372.png',
    meta = jsonb_set(COALESCE(meta, '{}'::jsonb), '{source}', '"lovable_test"')
WHERE id = '8b740007-9503-44b2-924b-b7ca8265f557';