-- Create function to automatically generate embeddings for new sketches
CREATE OR REPLACE FUNCTION public.auto_generate_sketch_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url text;
BEGIN
  -- Only process sketches that don't have embeddings yet
  IF NEW.type = 'sketch' AND NEW.embedding IS NULL THEN
    -- Get Supabase URL from environment
    SELECT current_setting('app.settings.supabase_url', true) INTO v_supabase_url;
    
    -- Trigger async edge function call to generate embedding
    -- This will be handled by the generate-sketch edge function
    -- We just mark it as pending in metadata
    NEW.meta = jsonb_set(
      COALESCE(NEW.meta, '{}'::jsonb),
      '{ai_status}',
      '"generating_embedding"'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_generate_sketch_embedding ON public.media;

-- Create trigger that runs before insert
CREATE TRIGGER trigger_auto_generate_sketch_embedding
  BEFORE INSERT ON public.media
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_sketch_embedding();