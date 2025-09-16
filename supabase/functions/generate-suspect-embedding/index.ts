import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { suspectId, photoUrl, description } = await req.json();

    if (!suspectId || !photoUrl) {
      throw new Error('Suspect ID and photo URL are required');
    }

    console.log('Generating embedding for suspect:', suspectId);

    // Generate embedding using Gemini's text embedding model
    // We'll use a description of the suspect's appearance as a proxy for visual embedding
    const embeddingText = description || `Suspect photo facial features for identification`;
    
    const embeddingResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          parts: [{
            text: embeddingText
          }]
        },
        taskType: "SEMANTIC_SIMILARITY",
        outputDimensionality: 768
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      console.error('Gemini embedding API error:', error);
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.embedding.values;
    console.log('Generated embedding for suspect');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update suspect with embedding
    const { data: suspectData, error: updateError } = await supabase
      .from('suspects')
      .update({
        photo_embedding: embedding
      })
      .eq('id', suspectId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update suspect with embedding');
    }

    console.log('Suspect embedding updated successfully:', suspectData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suspectId: suspectData.id,
        message: 'Suspect embedding generated and saved successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-suspect-embedding function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});