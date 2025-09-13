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
    const { caseId, sketchId, threshold = 0.7 } = await req.json();

    if (!caseId || !sketchId) {
      throw new Error('Case ID and sketch ID are required');
    }

    console.log('Finding suspect matches for case:', caseId, 'sketch:', sketchId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the sketch embedding
    const { data: sketchData, error: sketchError } = await supabase
      .from('media')
      .select('embedding, meta')
      .eq('id', sketchId)
      .eq('type', 'sketch')
      .single();

    if (sketchError) {
      console.error('Error fetching sketch:', sketchError);
      throw new Error('Failed to fetch sketch data');
    }

    if (!sketchData.embedding) {
      throw new Error('Sketch does not have an embedding for comparison');
    }

    console.log('Found sketch embedding, searching for matches...');

    // Use the database function to find similar suspects
    const { data: matches, error: matchError } = await supabase
      .rpc('find_similar_suspects', {
        sketch_embedding: sketchData.embedding,
        similarity_threshold: threshold,
        max_results: 10
      });

    if (matchError) {
      console.error('Error finding matches:', matchError);
      throw new Error('Failed to find suspect matches');
    }

    console.log(`Found ${matches?.length || 0} potential matches`);

    // Create match records in the database for high-confidence matches
    const highConfidenceMatches = matches?.filter(m => m.similarity_score >= 0.8) || [];
    
    if (highConfidenceMatches.length > 0) {
      const matchRecords = highConfidenceMatches.map(match => ({
        case_id: caseId,
        suspect_id: match.suspect_id,
        score: match.similarity_score,
        threshold: threshold,
        evidence: {
          sketch_id: sketchId,
          match_type: 'ai_facial_similarity',
          generated_at: new Date().toISOString()
        }
      }));

      const { error: insertError } = await supabase
        .from('matches')
        .insert(matchRecords);

      if (insertError) {
        console.error('Error saving matches:', insertError);
        // Don't throw here, just log the error
      } else {
        console.log(`Saved ${matchRecords.length} high-confidence matches`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        matches: matches || [],
        total_matches: matches?.length || 0,
        high_confidence_matches: highConfidenceMatches.length,
        threshold_used: threshold
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in find-suspect-matches function:', error);
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