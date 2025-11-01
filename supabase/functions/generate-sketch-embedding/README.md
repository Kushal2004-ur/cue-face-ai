# Generate Sketch Embedding

Generates a 1536-dimensional vector embedding for a forensic sketch or image and stores it in the database.

## How It Works

1. Fetches the image from Supabase Storage (generates signed URL for private buckets)
2. Uses Lovable AI (Gemini vision model) to create a detailed forensic description of the image
3. Generates a 1536-d embedding from the description using OpenAI's text-embedding-3-small
4. Stores the embedding in `public.media.embedding` column

## API

### Input (JSON)

```json
{
  "media_id": "uuid-of-media-record"
}
```

OR

```json
{
  "image_url": "https://example.com/image.jpg"
}
```

### Output (JSON)

```json
{
  "success": true,
  "media_id": "uuid",
  "embedding_length": 1536,
  "embedding_sample": [0.123, -0.456, 0.789, ...],
  "description_preview": "Detailed facial description..."
}
```

## Security

- JWT protected (verify_jwt = true)
- Requires valid Supabase authentication
- Uses SUPABASE_SERVICE_ROLE_KEY for database writes

## Manual Testing

### 1. Call the function with Supabase CLI

First, find a media record ID from your database:

```sql
SELECT id, url, type FROM public.media WHERE type = 'sketch' LIMIT 1;
```

Then invoke the function:

```bash
supabase functions invoke generate-sketch-embedding \
  --data '{"media_id":"<your-media-id-here>"}'
```

### 2. Verify embedding was saved

```sql
SELECT 
  id, 
  embedding IS NOT NULL AS has_embedding,
  array_length(embedding::real[], 1) AS embedding_dimensions
FROM public.media 
WHERE id = '<your-media-id-here>';
```

Expected result:
```
id                  | has_embedding | embedding_dimensions
--------------------+---------------+--------------------
<your-media-id>     | t             | 1536
```

### 3. Check embedding values (first 8 dimensions)

```sql
SELECT 
  id,
  (embedding::real[])[1:8] AS first_8_dimensions
FROM public.media 
WHERE id = '<your-media-id-here>';
```

## Example Response

```json
{
  "success": true,
  "media_id": "550e8400-e29b-41d4-a716-446655440000",
  "embedding_length": 1536,
  "embedding_sample": [0.0234, -0.0156, 0.0423, -0.0189, 0.0312, -0.0078, 0.0267, -0.0145],
  "description_preview": "The forensic sketch depicts a male subject, approximately 30-40 years of age. The face is oval-shaped with a medium complexion. Notable features include dark brown eyes set..."
}
```

## Error Handling

If the embedding API fails, the function returns status 500 with:

```json
{
  "success": false,
  "error": "Failed to generate embedding"
}
```

The database is not modified if any step fails.

## Dependencies

Required environment variables (configured in Supabase secrets):
- `LOVABLE_API_KEY` - for vision analysis
- `OPENAI_API_KEY` - for embedding generation
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
