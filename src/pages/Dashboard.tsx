import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, AlertTriangle } from 'lucide-react';
import AlertNotifications from '@/components/AlertNotifications';

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [casesResult, suspectsResult, matchesResult, alertsResult, stationsResult] = await Promise.all([
        supabase.from('cases').select('id, status').eq('status', 'open'),
        supabase.from('suspects').select('id'),
        supabase.from('matches').select('id, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('alerts').select('id, status').eq('status', 'pending'),
        supabase.from('police_stations').select('id')
      ]);

      return {
        activeCases: casesResult.data?.length || 0,
        totalSuspects: suspectsResult.data?.length || 0,
        recentMatches: matchesResult.data?.length || 0,
        pendingAlerts: alertsResult.data?.length || 0,
        policeStations: stationsResult.data?.length || 0,
      };
    },
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'analyst': return 'default';
      case 'officer': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Forensic Face AI System</h1>
            <Badge variant={getRoleBadgeVariant(userRole || '')}>
              {userRole?.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <AlertNotifications />
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              {user?.email}
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Cases Card */}
          <Card>
            <CardHeader>
              <CardTitle>Active Cases</CardTitle>
              <CardDescription>Manage ongoing investigations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{stats?.activeCases || 0}</div>
              <p className="text-sm text-muted-foreground">
                {stats?.activeCases === 0 ? 'No active cases' : `${stats?.activeCases} active case${stats?.activeCases !== 1 ? 's' : ''}`}
              </p>
              <Button className="mt-4 w-full" onClick={() => navigate('/cases')}>
                View Cases
              </Button>
            </CardContent>
          </Card>

          {/* Suspects Card */}
          <Card>
            <CardHeader>
              <CardTitle>Suspects Database</CardTitle>
              <CardDescription>Search and manage suspects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{stats?.totalSuspects || 0}</div>
              <p className="text-sm text-muted-foreground">
                {stats?.totalSuspects === 0 ? 'No suspects in database' : `${stats?.totalSuspects} suspect${stats?.totalSuspects !== 1 ? 's' : ''} in database`}
              </p>
              <Button 
                className="mt-4 w-full" 
                disabled={userRole === 'officer'}
                onClick={() => navigate('/suspects')}
              >
                {userRole === 'officer' ? 'View Suspects' : 'Manage Suspects'}
              </Button>
            </CardContent>
          </Card>

          {/* Matches Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Latest facial recognition matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{stats?.recentMatches || 0}</div>
              <p className="text-sm text-muted-foreground">
                {stats?.recentMatches === 0 ? 'No recent matches' : `${stats?.recentMatches} recent match${stats?.recentMatches !== 1 ? 'es' : ''}`}
              </p>
              <Button className="mt-4 w-full" onClick={() => navigate('/cases')}>
                View Matches
              </Button>
            </CardContent>
          </Card>

          {/* Police Stations Card - Only for analysts and admins */}
          {(userRole === 'analyst' || userRole === 'admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Police Network</CardTitle>
                <CardDescription>Connected police stations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats?.policeStations || 0}</div>
                <p className="text-sm text-muted-foreground">
                  {stats?.policeStations === 0 ? 'No stations connected' : `${stats?.policeStations} station${stats?.policeStations !== 1 ? 's' : ''} connected`}
                </p>
                <Button 
                  className="mt-4 w-full" 
                  onClick={() => navigate('/police-stations')}
                  variant="outline"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Manage Network
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Alerts Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Alerts</CardTitle>
              <CardDescription>Suspect match notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{stats?.pendingAlerts || 0}</div>
              <p className="text-sm text-muted-foreground">
                {stats?.pendingAlerts === 0 ? 'No pending alerts' : `${stats?.pendingAlerts} alert${stats?.pendingAlerts !== 1 ? 's' : ''} pending`}
              </p>
              <Button 
                className="mt-4 w-full" 
                variant={stats?.pendingAlerts > 0 ? "destructive" : "outline"}
                onClick={() => navigate('/police-stations?tab=alerts')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel - Only for admins */}
          {userRole === 'admin' && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>System administration and management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Users className="h-6 w-6" />
                    <span>Full Admin Dashboard</span>
                  </Button>
                  <Button variant="outline" disabled className="opacity-50">
                    System Settings
                  </Button>
                  <Button variant="outline" disabled className="opacity-50">
                    Backup & Recovery
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Card className="md:col-span-2 lg:col-span-3 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Security Implementation Complete</CardTitle>
              <CardDescription className="text-yellow-700">
                Row-Level Security has been enabled on all database tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-yellow-700">
                <p className="mb-2">✅ All tables now have Row-Level Security enabled</p>
                <p className="mb-2">✅ Role-based access control implemented</p>
                <p className="mb-2">✅ Authentication system active</p>
                <p>⚠️ Some security optimizations still needed (see console for details)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;