-- Enable HTTP extension for making API calls
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Drop the mock version
DROP FUNCTION IF EXISTS public.generate_face_embedding(uuid);

-- Update the text-based version to use Gemini API
CREATE OR REPLACE FUNCTION public.generate_face_embedding(description text)
RETURNS vector
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_embedding vector(768);
  v_response jsonb;
  v_api_key text;
  v_http_response extensions.http_response;
  v_embedding_array float[];
  v_sum_abs float;
  v_retry_count int := 0;
BEGIN
  -- Validate input
  IF description IS NULL OR trim(description) = '' THEN
    RAISE EXCEPTION 'Description cannot be empty';
  END IF;

  -- Get API key from vault/environment
  SELECT decrypted_secret INTO v_api_key
  FROM vault.decrypted_secrets
  WHERE name = 'GEMINI_API_KEY'
  LIMIT 1;

  IF v_api_key IS NULL THEN
    RAISE EXCEPTION 'GEMINI_API_KEY not configured in vault';
  END IF;

  <<retry_loop>>
  LOOP
    -- Call Gemini text-embedding-004 API
    SELECT * INTO v_http_response
    FROM extensions.http((
      'POST',
      'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=' || v_api_key,
      ARRAY[extensions.http_header('Content-Type', 'application/json')],
      'application/json',
      jsonb_build_object(
        'content', jsonb_build_object(
          'parts', jsonb_build_array(
            jsonb_build_object('text', description)
          )
        ),
        'taskType', 'SEMANTIC_SIMILARITY',
        'outputDimensionality', 768
      )::text
    )::extensions.http_request);

    -- Check HTTP status
    IF v_http_response.status != 200 THEN
      IF v_retry_count = 0 THEN
        v_retry_count := v_retry_count + 1;
        RAISE NOTICE 'Gemini API call failed (status %), retrying...', v_http_response.status;
        PERFORM pg_sleep(1);
        CONTINUE retry_loop;
      ELSE
        RAISE EXCEPTION 'Gemini API failed after retry: % %', v_http_response.status, v_http_response.content;
      END IF;
    END IF;

    -- Parse response
    v_response := v_http_response.content::jsonb;
    v_embedding_array := ARRAY(
      SELECT jsonb_array_elements_text(v_response->'embedding'->'values')::float
    );

    -- Validate embedding
    IF array_length(v_embedding_array, 1) IS NULL THEN
      IF v_retry_count = 0 THEN
        v_retry_count := v_retry_count + 1;
        RAISE NOTICE 'Empty embedding returned, retrying...';
        PERFORM pg_sleep(1);
        CONTINUE retry_loop;
      ELSE
        RAISE EXCEPTION 'Failed to generate embedding: empty result after retry';
      END IF;
    END IF;

    -- Check for all zeros
    SELECT SUM(ABS(val)) INTO v_sum_abs FROM unnest(v_embedding_array) AS val;
    IF v_sum_abs = 0 THEN
      IF v_retry_count = 0 THEN
        v_retry_count := v_retry_count + 1;
        RAISE NOTICE 'All-zero embedding returned, retrying...';
        PERFORM pg_sleep(1);
        CONTINUE retry_loop;
      ELSE
        RAISE EXCEPTION 'Generated embedding is all zeros after retry';
      END IF;
    END IF;

    -- Valid embedding, exit loop
    EXIT retry_loop;
  END LOOP;

  -- Convert to vector type (768 dimensions for Gemini)
  v_embedding := v_embedding_array::vector(768);
  RETURN v_embedding;

EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Embedding generation failed: %', SQLERRM;
END;
$$;

-- Create media-based version that fetches description and updates the record
CREATE OR REPLACE FUNCTION public.generate_face_embedding(p_media_id uuid)
RETURNS vector
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_description text;
  v_embedding vector(768);
BEGIN
  -- Get description from media meta
  SELECT meta->>'description' INTO v_description
  FROM public.media
  WHERE id = p_media_id;

  IF v_description IS NULL THEN
    RAISE EXCEPTION 'Media record not found or description missing for ID: %', p_media_id;
  END IF;

  -- Generate embedding
  v_embedding := public.generate_face_embedding(v_description);

  -- Update media record
  UPDATE public.media
  SET embedding = v_embedding
  WHERE id = p_media_id;

  RETURN v_embedding;
END;
$$;