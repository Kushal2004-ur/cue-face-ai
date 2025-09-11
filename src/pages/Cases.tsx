import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import NewCaseDialog from '@/components/NewCaseDialog';

const Cases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);

  const { data: cases, isLoading, refetch } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          users!cases_created_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Case Management</h1>
          </div>
          <Button onClick={() => setShowNewCaseDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading cases...</p>
          </div>
        ) : cases && cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((case_) => (
              <Card key={case_.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{case_.title}</CardTitle>
                    <Badge variant={getStatusVariant(case_.status)}>
                      {case_.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created by: {case_.users?.name || case_.users?.email || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {case_.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(case_.created_at).toLocaleDateString()}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/cases/${case_.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No cases found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first case
            </p>
            <Button onClick={() => setShowNewCaseDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Case
            </Button>
          </div>
        )}
      </main>

      <NewCaseDialog 
        open={showNewCaseDialog} 
        onOpenChange={setShowNewCaseDialog}
        onCaseCreated={() => {
          refetch();
          setShowNewCaseDialog(false);
        }}
      />
    </div>
  );
};

export default Cases;