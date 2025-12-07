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
    
    console.log('Generating signed URL for:', { filePath, mediaId, suspectId, bucket });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    let targetFilePath = filePath;

    // If suspectId is provided, look up the suspect's photo
    if (suspectId) {
      console.log('Looking up suspect photo for suspectId:', suspectId);
      const { data: suspectData, error: suspectError } = await supabase
        .from('suspects')
        .select('photo_url, photo_media_id')
        .eq('id', suspectId)
        .single();

      if (suspectError) {
        console.error('Suspect lookup error:', suspectError);
        return new Response(
          JSON.stringify({
            success: true,
            signedUrl: null,
            message: 'Suspect has no photo'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // If suspect has a public URL (starts with http), return it directly
      if (suspectData?.photo_url?.startsWith('http')) {
        console.log('Returning public URL for suspect');
        return new Response(
          JSON.stringify({
            success: true,
            signedUrl: suspectData.photo_url,
            expiresIn: null,
            isPublic: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // If suspect has photo_media_id, look up that media record
      if (suspectData?.photo_media_id) {
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('url')
          .eq('id', suspectData.photo_media_id)
          .single();

        if (!mediaError && mediaData) {
          targetFilePath = mediaData.url;
        }
      } else if (suspectData?.photo_url) {
        // Use photo_url as storage path
        targetFilePath = suspectData.photo_url;
      } else {
        return new Response(
          JSON.stringify({
            success: true,
            signedUrl: null,
            message: 'Suspect has no photo'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // If mediaId is provided, look up the file path from the media table
    if (mediaId) {
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('url, case_id')
        .eq('id', mediaId)
        .single();

      if (mediaError || !mediaData) {
        console.error('Media lookup error:', mediaError);
        throw new Error('Media not found');
      }

      targetFilePath = mediaData.url;

      // Verify user has access to this case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('created_by')
        .eq('id', mediaData.case_id)
        .single();

      if (caseError || !caseData) {
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
        throw new Error('Access denied');
      }
    }

    if (!targetFilePath) {
      throw new Error('No file path provided');
    }

    // Check if it's already a public URL
    if (targetFilePath.startsWith('http')) {
      console.log('Returning existing public URL');
      return new Response(
        JSON.stringify({
          success: true,
          signedUrl: targetFilePath,
          expiresIn: null,
          isPublic: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate signed URL valid for 2 minutes (120 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(targetFilePath, 120);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw signedUrlError;
    }

    console.log('Successfully generated signed URL for:', targetFilePath);

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl: signedUrlData.signedUrl,
        expiresIn: 120
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-media-url:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: error instanceof Error && error.message === 'Access denied' ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});