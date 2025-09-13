-- Add embedding column to media table for AI-generated sketches
ALTER TABLE public.media 
ADD COLUMN embedding vector(1536);

-- Create index for vector similarity search on media embeddings
CREATE INDEX media_embedding_idx ON public.media 
USING hnsw (embedding vector_cosine_ops);

-- Add embedding column to suspects table for their photos
ALTER TABLE public.suspects 
ADD COLUMN photo_embedding vector(1536);

-- Create index for vector similarity search on suspect embeddings
CREATE INDEX suspects_photo_embedding_idx ON public.suspects 
USING hnsw (photo_embedding vector_cosine_ops);

-- Create function to find similar suspects based on sketch embedding
CREATE OR REPLACE FUNCTION public.find_similar_suspects(
  sketch_embedding vector(1536),
  similarity_threshold double precision DEFAULT 0.7,
  max_results integer DEFAULT 10
)
RETURNS TABLE (
  suspect_id uuid,
  suspect_name text,
  suspect_photo_url text,
  similarity_score double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id as suspect_id,
    s.name as suspect_name,
    s.photo_url as suspect_photo_url,
    1 - (s.photo_embedding <=> sketch_embedding) as similarity_score
  FROM public.suspects s
  WHERE s.photo_embedding IS NOT NULL
    AND 1 - (s.photo_embedding <=> sketch_embedding) >= similarity_threshold
  ORDER BY s.photo_embedding <=> sketch_embedding ASC
  LIMIT max_results;
$$;