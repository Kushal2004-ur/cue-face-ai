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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from('case-evidence')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (listError) {
      throw listError;
    }

    console.log('Files in storage:', files);

    // Get all media records
    const { data: mediaRecords, error: mediaError } = await supabase
      .from('media')
      .select('id, url, case_id, type');

    if (mediaError) {
      throw mediaError;
    }

    console.log('Media records:', mediaRecords);

    return new Response(
      JSON.stringify({
        success: true,
        filesInStorage: files,
        mediaRecords: mediaRecords,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});