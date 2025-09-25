import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Phone, Mail, MapPin, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PoliceStation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact_email: string;
  contact_phone: string;
  jurisdiction_area?: string;
}

interface Alert {
  id: string;
  case_id: string;
  suspect_id: string;
  police_station_id: string;
  alert_type: string;
  status: 'pending' | 'sent' | 'acknowledged' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: any;
  sent_at?: string;
  acknowledged_at?: string;
  created_at: string;
  police_stations: PoliceStation;
  cases: { title: string };
  suspects: { name: string };
}

const PoliceStations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('stations');

  // Fetch police stations
  const { data: stations, isLoading: stationsLoading } = useQuery({
    queryKey: ['police-stations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('police_stations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PoliceStation[];
    },
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          police_stations(name),
          cases(title),
          suspects(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    },
  });

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as acknowledged.",
      });

      refetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Dismissed",
        description: "The alert has been dismissed.",
      });

      refetchAlerts();
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'sent': return 'default';
      case 'acknowledged': return 'secondary';
      case 'dismissed': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Police Network</h1>
          <p className="text-muted-foreground">
            Manage police stations and suspect match alerts
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stations" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Police Stations</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Active Alerts ({alerts?.filter(a => a.status === 'pending').length || 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Police Stations Network</CardTitle>
              <CardDescription>
                {stations?.length || 0} stations connected to the forensic system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stationsLoading ? (
                <p className="text-muted-foreground">Loading stations...</p>
              ) : stations && stations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stations.map((station) => (
                    <Card key={station.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{station.name}</CardTitle>
                            <CardDescription>{station.jurisdiction_area}</CardDescription>
                          </div>
                          <Building className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {station.address}, {station.city}, {station.state} {station.zip_code}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{station.contact_phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{station.contact_email}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No police stations found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suspect Match Alerts</CardTitle>
              <CardDescription>
                Automated alerts sent to police stations when suspect matches are found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <p className="text-muted-foreground">Loading alerts...</p>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className={`border-l-4 ${
                      alert.priority === 'critical' ? 'border-l-red-500' :
                      alert.priority === 'high' ? 'border-l-orange-500' :
                      alert.priority === 'medium' ? 'border-l-yellow-500' :
                      'border-l-blue-500'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4" />
                            <CardTitle className="text-base">{alert.cases.title}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getPriorityColor(alert.priority)}>
                              {alert.priority.toUpperCase()}
                            </Badge>
                            <Badge variant={getStatusColor(alert.status)}>
                              {alert.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          Sent to: {alert.police_stations.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{alert.message}</p>
                        
                        {alert.metadata && (
                          <div className="text-xs text-muted-foreground">
                            <p>Suspect: {alert.suspects.name}</p>
                            {alert.metadata.similarity_score && (
                              <p>Similarity Score: {(alert.metadata.similarity_score * 100).toFixed(1)}%</p>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          <p>Created: {new Date(alert.created_at).toLocaleString()}</p>
                          {alert.acknowledged_at && (
                            <p>Acknowledged: {new Date(alert.acknowledged_at).toLocaleString()}</p>
                          )}
                        </div>

                        {alert.status === 'pending' && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => dismissAlert(alert.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No alerts found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PoliceStations;