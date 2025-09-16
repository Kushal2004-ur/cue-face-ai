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
    const { description, caseId } = await req.json();

    if (!description || !caseId) {
      throw new Error('Description and case ID are required');
    }

    console.log('Generating sketch for case:', caseId, 'with description:', description);

    // Enhanced prompt for forensic sketch generation
    const enhancedPrompt = `Create a detailed forensic sketch drawing of a person based on this eyewitness description: "${description}". 
    Style: Professional police sketch, black and white pencil drawing, realistic facial features, clear and identifiable, 
    front-facing portrait view, clean background. Focus on accuracy and detail for identification purposes.`;

    // Generate image using Gemini's image generation
    const imageResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        safetySettings: [
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ],
        generationConfig: {
          responseMimeType: "image/png"
        }
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      console.error('Gemini API error:', error);
      throw new Error(error.error?.message || 'Failed to generate sketch');
    }

    const imageData = await imageResponse.json();
    console.log('Generated sketch successfully');

    // Extract base64 image data
    const base64Image = imageData.generatedImages[0].bytesBase64Encoded;
    
    // Generate embedding for the sketch using Gemini's text embedding
    const embeddingResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          parts: [{
            text: `Forensic sketch of person: ${description}`
          }]
        },
        taskType: "SEMANTIC_SIMILARITY",
        outputDimensionality: 768
      }),
    });

    let embedding = null;
    if (embeddingResponse.ok) {
      try {
        const embeddingData = await embeddingResponse.json();
        embedding = embeddingData.embedding.values;
        console.log('Generated embedding for sketch');
      } catch (error) {
        console.error('Error processing embedding:', error);
      }
    } else {
      console.error('Embedding generation failed, proceeding without embedding');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert base64 to blob for storage
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    const fileName = `sketch-${Date.now()}.png`;
    const filePath = `${caseId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('case-evidence')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to upload sketch to storage');
    }

    console.log('Sketch uploaded to storage:', uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('case-evidence')
      .getPublicUrl(filePath);

    // Save media record to database with embedding
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .insert({
        case_id: caseId,
        url: urlData.publicUrl,
        type: 'sketch',
        embedding: embedding,
        meta: {
          description,
          generated_by: 'ai',
          model: 'imagen-3.0-generate-001',
          embedding_model: embedding ? 'text-embedding-004' : null,
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (mediaError) {
      console.error('Database insert error:', mediaError);
      throw new Error('Failed to save sketch record');
    }

    console.log('Sketch saved to database:', mediaData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sketchUrl: urlData.publicUrl,
        mediaId: mediaData.id,
        message: 'Sketch generated successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-sketch function:', error);
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