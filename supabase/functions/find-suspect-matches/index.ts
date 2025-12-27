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

    // Initialize Supabase client with service role for DB operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ====== AUTHENTICATION & AUTHORIZATION ======
    // Get and verify the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User authentication failed:', userError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Verify user has access to this case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('created_by, title')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      console.error('Case not found:', caseId);
      return new Response(
        JSON.stringify({ success: false, error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user owns case or is analyst/admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAuthorized = caseData.created_by === user.id || 
                        userData?.role === 'admin' || 
                        userData?.role === 'analyst';

    if (!isAuthorized) {
      console.error('Access denied for user:', user.id, 'to case:', caseId);
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authorization verified for user:', user.id, 'role:', userData?.role);
    // ====== END AUTHENTICATION & AUTHORIZATION ======

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
        status: 'pending',
        source: 'auto_match',
        evidence: {
          sketch_id: sketchId,
          match_type: 'ai_facial_similarity',
          generated_at: new Date().toISOString(),
          model: 'gemini_text_embedding_004'
        }
      }));

      const { error: insertError } = await supabase
        .from('matches')
        .insert(matchRecords);

      if (insertError) {
        console.error('Error saving matches:', insertError);
      } else {
        console.log(`Saved ${matchRecords.length} high-confidence matches`);
      }

      // Send Telegram alerts for high-confidence matches
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      for (const match of highConfidenceMatches) {
        try {
          const alertResponse = await fetch(`${supabaseUrl}/functions/v1/send-telegram-alert`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              suspectName: match.suspect_name,
              similarityScore: match.similarity_score,
              caseId: caseId,
              caseTitle: caseData?.title
            })
          });
          
          if (!alertResponse.ok) {
            const errorText = await alertResponse.text();
            console.error(`Telegram alert failed for suspect:`, errorText);
          } else {
            console.log(`Telegram alert sent successfully`);
          }
        } catch (alertError) {
          console.error('Error sending Telegram alert:', alertError);
          // Don't fail the whole request if alert fails
        }
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in find-suspect-matches function:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
