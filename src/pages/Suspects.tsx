import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, Eye, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import NewSuspectDialog from '@/components/NewSuspectDialog';
import { toast } from 'sonner';

const Suspects = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [showNewSuspectDialog, setShowNewSuspectDialog] = useState(false);

  const { data: suspects, isLoading, refetch } = useQuery({
    queryKey: ['suspects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suspects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const canManageSuspects = userRole === 'admin' || userRole === 'analyst';

  const handleDeleteSuspect = async (suspectId: string) => {
    if (!canManageSuspects) {
      toast.error('You do not have permission to delete suspects');
      return;
    }

    try {
      const { error } = await supabase
        .from('suspects')
        .delete()
        .eq('id', suspectId);

      if (error) throw error;

      toast.success('Suspect deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting suspect:', error);
      toast.error('Failed to delete suspect');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              ← Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Suspects Database</h1>
          </div>
          {canManageSuspects && (
            <Button onClick={() => setShowNewSuspectDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Suspect
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!canManageSuspects && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Eye className="h-5 w-5" />
                <p className="font-medium">View-only access</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You can view suspects but cannot add, edit, or delete them. Contact an administrator for access.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading suspects...</p>
          </div>
        ) : suspects && suspects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suspects.map((suspect) => (
              <Card key={suspect.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    {suspect.photo_url ? (
                      <img 
                        src={suspect.photo_url} 
                        alt={suspect.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{suspect.name}</CardTitle>
                      <CardDescription>
                        Added: {new Date(suspect.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {suspect.notes && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {suspect.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {suspect.photo_embedding ? 'AI Ready' : 'No Embedding'}
                    </Badge>
                    
                    {canManageSuspects && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            toast.info('Edit functionality coming soon');
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteSuspect(suspect.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suspects in database</h3>
            <p className="text-muted-foreground mb-4">
              {canManageSuspects 
                ? 'Get started by adding your first suspect to the database'
                : 'No suspects have been added to the database yet'
              }
            </p>
            {canManageSuspects && (
              <Button onClick={() => setShowNewSuspectDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Suspect
              </Button>
            )}
          </div>
        )}
      </main>

      {canManageSuspects && (
        <NewSuspectDialog 
          open={showNewSuspectDialog} 
          onOpenChange={setShowNewSuspectDialog}
          onSuspectCreated={() => {
            refetch();
            setShowNewSuspectDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default Suspects;