-- Fix vector dimension mismatch: Change from 1536 (OpenAI) to 768 (Gemini)
-- This alters the media.embedding column to accept 768-dimensional vectors

ALTER TABLE media 
ALTER COLUMN embedding TYPE vector(768);

-- Also update suspects table if it has embeddings
ALTER TABLE suspects 
ALTER COLUMN photo_embedding TYPE vector(768);

-- Update suspect_embeddings table
ALTER TABLE suspect_embeddings 
ALTER COLUMN vector TYPE vector(768);