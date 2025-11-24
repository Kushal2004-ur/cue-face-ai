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

    // Get secrets directly from environment
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    // Log secret availability
    console.log('Secrets loaded - bot:', !!botToken, 'chat:', !!chatId);

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    if (!chatId) {
      console.error('TELEGRAM_CHAT_ID not configured');
      throw new Error('TELEGRAM_CHAT_ID not configured');
    }

    // Construct dashboard link
    const dashboardUrl = `https://inamnmxmxayyojuajddm.lovableproject.com/cases/${caseId}`;

    // Format message with HTML (safer than Markdown for escaping)
    const message = `🚨 <b>High-Confidence Suspect Match Detected</b>\n\n` +
      `<b>Suspect:</b> ${suspectName}\n` +
      `<b>Similarity Score:</b> ${Math.round(similarityScore * 100)}%\n` +
      `<b>Case:</b> ${caseTitle || 'Untitled'}\n` +
      `<b>Case ID:</b> <code>${caseId}</code>\n\n` +
      `<a href="${dashboardUrl}">View Case Dashboard</a>`;

    // Send message via Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
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
