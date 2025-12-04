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
    const { filePath, mediaId, bucket = 'case-evidence' } = await req.json();
    
    console.log('Generating signed URL for:', { filePath, mediaId, bucket });

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
    let caseIdForAuth: string | null = null;

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
      caseIdForAuth = mediaData.case_id;

      // Verify user has access to this case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('created_by')
        .eq('id', caseIdForAuth)
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
