import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { suspectName, similarityScore, caseId, caseTitle } = await req.json();

    console.log('Sending Telegram alert for:', { suspectName, similarityScore, caseId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Telegram settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'telegram_alerts')
      .single();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw new Error('Failed to fetch Telegram settings');
    }

    const telegramConfig = settings.value as { enabled: boolean; chat_id: string };

    if (!telegramConfig.enabled || !telegramConfig.chat_id) {
      console.log('Telegram alerts disabled or chat_id not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'Telegram alerts not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Construct dashboard link
    const dashboardUrl = `https://inamnmxmxayyojuajddm.lovableproject.com/cases/${caseId}`;

    // Format message with markdown
    const message = `🚨 *High-Confidence Suspect Match Detected*\n\n` +
      `*Suspect:* ${suspectName}\n` +
      `*Similarity Score:* ${Math.round(similarityScore * 100)}%\n` +
      `*Case:* ${caseTitle || 'Untitled'}\n` +
      `*Case ID:* \`${caseId}\`\n\n` +
      `[View Case Dashboard](${dashboardUrl})`;

    // Send message via Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramConfig.chat_id,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', responseData);
      throw new Error(`Telegram API error: ${responseData.description || 'Unknown error'}`);
    }

    console.log('Telegram alert sent successfully:', responseData);

    return new Response(
      JSON.stringify({ success: true, message: 'Alert sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-telegram-alert function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
