-- Create function to match faces against media table
CREATE OR REPLACE FUNCTION public.match_face(embedding_input vector)
RETURNS TABLE(
  id uuid,
  url text,
  type text,
  case_id uuid,
  similarity double precision
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id,
    url,
    type,
    case_id,
    1 - (embedding <=> embedding_input) AS similarity
  FROM public.media
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> embedding_input ASC
  LIMIT 5;
$$;