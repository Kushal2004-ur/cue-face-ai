-- Add embedding column to media table for sketch embeddings
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create HNSW index for efficient similarity search on media embeddings
CREATE INDEX IF NOT EXISTS media_embedding_idx ON public.media USING hnsw (embedding vector_cosine_ops);