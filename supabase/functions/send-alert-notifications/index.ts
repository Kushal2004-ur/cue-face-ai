import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailTemplate {
  subject: string;
  body: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alertIds } = await req.json();

    if (!alertIds || !Array.isArray(alertIds)) {
      throw new Error('Alert IDs array is required');
    }

    console.log('Processing notifications for alerts:', alertIds);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch alert details with related data
    const { data: alerts, error: fetchError } = await supabase
      .from('alerts')
      .select(`
        *,
        cases(id, title, description),
        suspects(id, name, photo_url),
        police_stations(id, name, contact_email, contact_phone),
        matches(score)
      `)
      .in('id', alertIds)
      .eq('status', 'pending');

    if (fetchError) {
      console.error('Error fetching alerts:', fetchError);
      throw new Error('Failed to fetch alert details');
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No alerts to process',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notifications = [];

    for (const alert of alerts) {
      try {
        // Generate email content
        const emailTemplate = generateAlertEmail(alert);
        
        // In a production system, this would integrate with an email service like SendGrid, AWS SES, etc.
        // For now, we'll simulate sending the email and log it
        const emailResult = await simulateEmailNotification({
          to: alert.police_stations.contact_email,
          subject: emailTemplate.subject,
          body: emailTemplate.body,
          alertId: alert.id,
          stationName: alert.police_stations.name
        });

        notifications.push(emailResult);

        // Update alert status to 'sent'
        const { error: updateError } = await supabase
          .from('alerts')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', alert.id);

        if (updateError) {
          console.error('Error updating alert status:', updateError);
        }

      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
        notifications.push({
          alertId: alert.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = notifications.filter(n => n.success).length;
    const failureCount = notifications.filter(n => !n.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications.length,
        successful: successCount,
        failed: failureCount,
        notifications: notifications
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-alert-notifications function:', error);
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

function generateAlertEmail(alert: any): EmailTemplate {
  const similarity = alert.metadata?.similarity_score 
    ? `${(alert.metadata.similarity_score * 100).toFixed(1)}%` 
    : 'N/A';

  const subject = `[${alert.priority.toUpperCase()}] Suspect Match Alert - Case: ${alert.cases.title}`;
  
  const body = `
FORENSIC FACIAL RECONSTRUCTION SYSTEM ALERT

Alert Details:
- Case: ${alert.cases.title}
- Suspect: ${alert.suspects.name}
- Similarity Score: ${similarity}
- Priority: ${alert.priority.toUpperCase()}
- Generated: ${new Date(alert.created_at).toLocaleString()}

Case Description:
${alert.cases.description || 'No description provided'}

Action Required:
This automated alert indicates a potential suspect match has been found through AI facial recognition analysis. Please review the case details and coordinate with the investigating team if necessary.

Case ID: ${alert.cases.id}
Suspect ID: ${alert.suspects.id}
Alert ID: ${alert.id}

---
This is an automated message from the Forensic Face AI System.
Do not reply to this email.
  `.trim();

  return { subject, body };
}

async function simulateEmailNotification(params: {
  to: string;
  subject: string;
  body: string;
  alertId: string;
  stationName: string;
}): Promise<any> {
  // In production, this would use a real email service
  // For demonstration, we'll log the email and return success
  
  console.log('=== SIMULATED EMAIL NOTIFICATION ===');
  console.log('To:', params.to);
  console.log('Subject:', params.subject);
  console.log('Station:', params.stationName);
  console.log('Alert ID:', params.alertId);
  console.log('Body length:', params.body.length, 'characters');
  console.log('=====================================');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    alertId: params.alertId,
    success: true,
    recipient: params.to,
    stationName: params.stationName,
    sentAt: new Date().toISOString(),
    messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`
  };
}