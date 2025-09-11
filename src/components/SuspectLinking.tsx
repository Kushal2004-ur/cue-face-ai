import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SuspectLinkingProps {
  caseId: string;
  onLinkingComplete: () => void;
}

const SuspectLinking = ({ caseId, onLinkingComplete }: SuspectLinkingProps) => {
  const { userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState<string>('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const { data: suspects, isLoading } = useQuery({
    queryKey: ['suspects', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('suspects')
        .select('*')
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedSuspects } = useQuery({
    queryKey: ['linked-suspects', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('suspect_id')
        .eq('case_id', caseId);

      if (error) throw error;
      return data.map(match => match.suspect_id);
    },
  });

  const linkSuspect = async () => {
    if (!selectedSuspect) {
      toast.error('Please select a suspect to link');
      return;
    }

    setIsLinking(true);

    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          case_id: caseId,
          suspect_id: selectedSuspect,
          score: null, // Manual linking, no AI score
          threshold: null,
          evidence: { type: 'manual_link', linked_by: 'user' },
        });

      if (error) throw error;

      toast.success('Suspect linked successfully');
      onLinkingComplete();
      setShowLinkDialog(false);
      setSelectedSuspect('');
    } catch (error) {
      console.error('Error linking suspect:', error);
      toast.error('Failed to link suspect. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const availableSuspects = suspects?.filter(
    suspect => !linkedSuspects?.includes(suspect.id)
  ) || [];

  const canLinkSuspects = userRole === 'analyst' || userRole === 'admin';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Link Suspects</CardTitle>
            <CardDescription>
              Connect suspects from the database to this case
            </CardDescription>
          </div>
          {canLinkSuspects && (
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Link className="mr-2 h-4 w-4" />
                  Link Suspect
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Link Suspect to Case</DialogTitle>
                  <DialogDescription>
                    Search and select a suspect to link to this case
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search suspects by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Suspect Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Suspect</label>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading suspects...</p>
                    ) : availableSuspects.length > 0 ? (
                      <Select value={selectedSuspect} onValueChange={setSelectedSuspect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a suspect..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSuspects.map((suspect) => (
                            <SelectItem key={suspect.id} value={suspect.id}>
                              <div className="flex items-center space-x-3">
                                {suspect.photo_url ? (
                                  <img 
                                    src={suspect.photo_url} 
                                    alt={suspect.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <span>{suspect.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'No suspects found matching your search' : 'No available suspects to link'}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLinkDialog(false)}
                      disabled={isLinking}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={linkSuspect} 
                      disabled={isLinking || !selectedSuspect}
                    >
                      {isLinking ? 'Linking...' : 'Link Suspect'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!canLinkSuspects ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Only analysts and administrators can link suspects to cases.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Use the "Link Suspect" button above to connect suspects from the database to this case.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuspectLinking;