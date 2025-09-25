import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  cases: { title: string };
  suspects: { name: string };
  police_stations: { name: string };
  metadata: any;
}

const AlertNotifications = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unacknowledged alerts
  const { data: alerts, refetch } = useQuery({
    queryKey: ['alert-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          cases(title),
          suspects(name),
          police_stations(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Alert[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = alerts?.length || 0;

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as acknowledged.",
      });

      refetch();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Suspect Match Alerts</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
        </DropdownMenuLabel>
        
        {!alerts || alerts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No pending alerts</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4" style={{
                borderLeftColor: getPriorityColor(alert.priority).replace('bg-', '#'),
              }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {alert.cases.title}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Suspect: {alert.suspects.name}
                  </p>
                  {alert.metadata?.similarity_score && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Match: {(alert.metadata.similarity_score * 100).toFixed(1)}%
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Station: {alert.police_stations.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AlertNotifications;