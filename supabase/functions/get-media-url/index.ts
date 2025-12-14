import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, mediaId, suspectId, bucket = 'case-evidence' } = await req.json();
    
    console.log('get-media-url request:', { filePath, mediaId, suspectId, bucket });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication failed:', userError?.message);
      throw new Error('Unauthorized');
    }

    console.log('Authenticated user:', user.id);

    let targetFilePath: string | null = null;
    let source: string = 'unknown';

    // BRANCH 1: If suspectId is provided, look up the suspect's photo
    if (suspectId) {
      console.log('Looking up suspect photo for suspectId:', suspectId);
      
      const { data: suspectData, error: suspectError } = await supabase
        .from('suspects')
        .select('id, name, photo_url, photo_media_id')
        .eq('id', suspectId)
        .single();

      if (suspectError) {
        console.error('Suspect lookup error:', suspectError.message);
        return new Response(
          JSON.stringify({
            signedUrl: null,
            message: 'Suspect not found',
            source: 'error'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Found suspect:', { 
        id: suspectData.id, 
        name: suspectData.name,
        photo_media_id: suspectData.photo_media_id,
        photo_url: suspectData.photo_url?.substring(0, 50) + '...'
      });

      // Priority 1: Use photo_media_id if available
      if (suspectData.photo_media_id) {
        console.log('Suspect has photo_media_id, looking up media record:', suspectData.photo_media_id);
        
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('id, url')
          .eq('id', suspectData.photo_media_id)
          .single();

        if (mediaError) {
          console.error('Media lookup error for photo_media_id:', mediaError.message);
        } else if (mediaData?.url) {
          targetFilePath = mediaData.url;
          source = 'media';
          console.log('Found media record, url:', targetFilePath);
        }
      }
      
      // Priority 2: If no media found, check photo_url for absolute URL
      if (!targetFilePath && suspectData.photo_url) {
        const photoUrl = suspectData.photo_url;
        
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
          console.log('Suspect has absolute photo_url, returning directly');
          return new Response(
            JSON.stringify({
              signedUrl: photoUrl,
              source: 'photo_url',
              isPublic: true,
              expiresIn: null
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Treat as storage path
          targetFilePath = photoUrl;
          source = 'photo_url_path';
          console.log('Treating photo_url as storage path:', targetFilePath);
        }
      }

      // No photo found for suspect
      if (!targetFilePath) {
        console.log('Suspect has no photo (both photo_media_id and photo_url are null or invalid)');
        return new Response(
          JSON.stringify({
            signedUrl: null,
            message: 'No suspect photo available',
            source: 'none'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // BRANCH 2: If mediaId is provided, look up the file path from the media table
    if (mediaId && !targetFilePath) {
      console.log('Looking up media by mediaId:', mediaId);
      
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('url, case_id')
        .eq('id', mediaId)
        .single();

      if (mediaError || !mediaData) {
        console.error('Media lookup error:', mediaError?.message);
        return new Response(
          JSON.stringify({
            signedUrl: null,
            message: 'Media not found',
            source: 'error'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetFilePath = mediaData.url;
      source = 'media';
      console.log('Found media record by mediaId, url:', targetFilePath);

      // Verify user has access to this case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('created_by')
        .eq('id', mediaData.case_id)
        .single();

      if (caseError || !caseData) {
        console.error('Case not found for media');
        throw new Error('Case not found');
      }

      // Check if user is the case creator or has analyst/admin role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAuthorized = 
        caseData.created_by === user.id || 
        userData?.role === 'admin' || 
        userData?.role === 'analyst';

      if (!isAuthorized) {
        console.error('User not authorized to access this media');
        throw new Error('Access denied');
      }
    }

    // BRANCH 3: Use direct filePath if provided
    if (filePath && !targetFilePath) {
      targetFilePath = filePath;
      source = 'direct_path';
      console.log('Using direct filePath:', targetFilePath);
    }

    // No file path resolved
    if (!targetFilePath) {
      console.error('No file path could be determined from inputs');
      return new Response(
        JSON.stringify({
          signedUrl: null,
          message: 'No file path provided',
          source: 'error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if it's already a public URL
    if (targetFilePath.startsWith('http://') || targetFilePath.startsWith('https://')) {
      console.log('Target path is already a public URL, returning directly');
      return new Response(
        JSON.stringify({
          signedUrl: targetFilePath,
          source,
          isPublic: true,
          expiresIn: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove bucket prefix if accidentally included
    const bucketPrefix = `${bucket}/`;
    if (targetFilePath.startsWith(bucketPrefix)) {
      targetFilePath = targetFilePath.substring(bucketPrefix.length);
      console.log('Removed bucket prefix, new path:', targetFilePath);
    }

    // Generate signed URL valid for 2 minutes (120 seconds)
    console.log('Generating signed URL for storage path:', targetFilePath, 'in bucket:', bucket);
    
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(targetFilePath, 120);

    if (signedUrlError) {
      console.error('Signed URL generation error:', signedUrlError.message);
      return new Response(
        JSON.stringify({
          signedUrl: null,
          message: `Failed to generate signed URL: ${signedUrlError.message}`,
          source: 'error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated signed URL for:', targetFilePath, 'source:', source);

    return new Response(
      JSON.stringify({
        signedUrl: signedUrlData.signedUrl,
        source,
        expiresIn: 120,
        mediaPath: targetFilePath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-media-url:', error);
    return new Response(
      JSON.stringify({
        signedUrl: null,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'error'
      }),
      {
        status: error instanceof Error && error.message === 'Access denied' ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
