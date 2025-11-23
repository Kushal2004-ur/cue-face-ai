-- Fix find_similar_suspects to query suspect_embeddings table instead of suspects.photo_embedding
DROP FUNCTION IF EXISTS public.find_similar_suspects(vector, double precision, integer);

CREATE OR REPLACE FUNCTION public.find_similar_suspects(
  sketch_embedding vector(768),
  similarity_threshold double precision DEFAULT 0.7,
  max_results integer DEFAULT 10
)
RETURNS TABLE(
  suspect_id uuid,
  suspect_name text,
  suspect_photo_url text,
  similarity_score double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    s.id as suspect_id,
    s.name as suspect_name,
    s.photo_url as suspect_photo_url,
    1 - (se.vector <=> sketch_embedding) as similarity_score
  FROM public.suspect_embeddings se
  JOIN public.suspects s ON s.id = se.suspect_id
  WHERE se.vector IS NOT NULL
    AND 1 - (se.vector <=> sketch_embedding) >= similarity_threshold
  ORDER BY se.vector <=> sketch_embedding ASC
  LIMIT max_results;
$$;