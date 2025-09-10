import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();

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
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
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
              <div className="text-3xl font-bold mb-2">0</div>
              <p className="text-sm text-muted-foreground">No active cases</p>
              <Button className="mt-4 w-full">View Cases</Button>
            </CardContent>
          </Card>

          {/* Suspects Card */}
          <Card>
            <CardHeader>
              <CardTitle>Suspects Database</CardTitle>
              <CardDescription>Search and manage suspects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">0</div>
              <p className="text-sm text-muted-foreground">No suspects in database</p>
              <Button className="mt-4 w-full" disabled={userRole === 'officer'}>
                {userRole === 'officer' ? 'Access Restricted' : 'Manage Suspects'}
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
              <div className="text-3xl font-bold mb-2">0</div>
              <p className="text-sm text-muted-foreground">No recent matches</p>
              <Button className="mt-4 w-full">View Matches</Button>
            </CardContent>
          </Card>

          {/* Admin Panel - Only for admins */}
          {userRole === 'admin' && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>System administration and audit logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">User Management</Button>
                  <Button variant="outline">Audit Logs</Button>
                  <Button variant="outline">System Settings</Button>
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