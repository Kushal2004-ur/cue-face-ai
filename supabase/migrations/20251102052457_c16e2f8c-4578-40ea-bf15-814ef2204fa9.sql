-- Add status and source columns to matches table for auto-matching
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Add index for faster querying by status
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- Add index for faster querying by source
CREATE INDEX IF NOT EXISTS idx_matches_source ON public.matches(source);
