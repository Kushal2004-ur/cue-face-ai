import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Save, TestTube } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AlertSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['telegram-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'telegram_alerts')
        .single();

      if (error) throw error;

      const config = data.value as { enabled: boolean; chat_id: string };
      setChatId(config.chat_id || '');
      setEnabled(config.enabled || false);

      return config;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: { enabled, chat_id: chatId }
        })
        .eq('key', 'telegram_alerts');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
      toast({
        title: "Settings Updated",
        description: "Telegram alert settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testAlert = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-alert', {
        body: {
          suspectName: 'Test Suspect',
          similarityScore: 0.95,
          caseId: 'test-case-id',
          caseTitle: 'Test Alert from Admin Dashboard'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Test Alert Sent",
          description: "Check your Telegram chat for the test message.",
        });
      } else {
        throw new Error(data.message || 'Failed to send test alert');
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Failed to send test alert',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Telegram Bot Alert Configuration
          </CardTitle>
          <CardDescription>
            Configure Telegram bot to receive instant alerts for high-confidence suspect matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Setup Instructions */}
          <Alert>
            <AlertDescription className="space-y-2">
              <p className="font-semibold">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open Telegram and search for <code className="bg-muted px-1 rounded">@BotFather</code></li>
                <li>Send <code className="bg-muted px-1 rounded">/newbot</code> and follow the prompts to create your bot</li>
                <li>Copy the bot token and add it to Supabase secrets as <code className="bg-muted px-1 rounded">TELEGRAM_BOT_TOKEN</code></li>
                <li>Start a chat with your bot and send any message</li>
                <li>Get your chat ID by visiting: <code className="bg-muted px-1 rounded text-xs">https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates</code></li>
                <li>Copy the <code className="bg-muted px-1 rounded">chat.id</code> value and paste it below</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts-enabled">Enable Telegram Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications for high-confidence matches
              </p>
            </div>
            <Switch
              id="alerts-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Chat ID Input */}
          <div className="space-y-2">
            <Label htmlFor="chat-id">Telegram Chat ID</Label>
            <Input
              id="chat-id"
              type="text"
              placeholder="Enter your Telegram chat ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              disabled={!enabled}
            />
            <p className="text-xs text-muted-foreground">
              This is the chat where alerts will be sent
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => updateSettings.mutate()}
              disabled={updateSettings.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={testAlert}
              disabled={!enabled || !chatId || isTesting}
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTesting ? 'Sending...' : 'Send Test Alert'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
