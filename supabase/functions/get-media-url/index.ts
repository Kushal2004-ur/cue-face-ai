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
    const { filePath, mediaId } = await req.json();
    
    console.log('Generating signed URL for:', { filePath, mediaId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user has access to this media by checking the case
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

    // Verify user has access to this media through the case
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('case_id')
      .eq('id', mediaId)
      .single();

    if (mediaError || !mediaData) {
      throw new Error('Media not found');
    }

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

    // Generate signed URL using service role
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('case-evidence')
      .createSignedUrl(filePath, 3600);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw signedUrlError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl: signedUrlData.signedUrl
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