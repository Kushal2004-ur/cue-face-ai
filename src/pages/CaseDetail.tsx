import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Upload, Users, FileImage, Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MediaUpload from '@/components/MediaUpload';
import FaceEmbedding from '@/components/FaceEmbedding';
import SuspectLinking from '@/components/SuspectLinking';
import SketchGenerator from '@/components/SketchGenerator';
import AIMatching from '@/components/AIMatching';

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug storage on mount
  useEffect(() => {
    const debugStorage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-storage');
        console.log('Storage verification:', data);
      } catch (error) {
        console.error('Storage verification error:', error);
      }
    };
    debugStorage();
  }, []);

  const { data: caseData, isLoading: caseLoading, refetch: refetchCase } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      if (!id) throw new Error('Case ID is required');
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          users!cases_created_by_fkey(name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: mediaData, isLoading: mediaLoading, refetch: refetchMedia } = useQuery({
    queryKey: ['case-media', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('case_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: matchesData, isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ['case-matches', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          suspects(name, photo_url)
        `)
        .eq('case_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };


  const handleDeleteCase = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Case Deleted",
        description: "The case has been successfully deleted.",
      });
      
      navigate('/cases');
    } catch (error) {
      console.error('Error deleting case:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) return FileImage;
    return Paperclip;
  };

  if (caseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading case details...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Case not found</h2>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/cases')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cases
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{caseData.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Created by {caseData.users?.name || caseData.users?.email} • {new Date(caseData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusVariant(caseData.status)}>
                {caseData.status}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Case
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this case and all associated evidence, sketches, and suspect links. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteCase}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Case'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Case Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Case Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {caseData.description || 'No description provided'}
            </p>
          </CardContent>
        </Card>

        {/* Tabs for Evidence and Suspects */}
        <Tabs defaultValue="evidence" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evidence" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Evidence & Media</span>
            </TabsTrigger>
            <TabsTrigger value="suspects" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Linked Suspects</span>
            </TabsTrigger>
            <TabsTrigger value="ai-matching" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>AI Suspect Match</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evidence" className="space-y-6">
            {/* AI Sketch Generator */}
            <SketchGenerator 
              caseId={id!} 
              onSketchGenerated={() => {
                refetchMedia();
                refetchCase();
              }}
            />
            
            {/* Media Upload */}
            <MediaUpload 
              caseId={id!} 
              onUploadComplete={() => {
                refetchMedia();
                refetchCase();
              }}
            />

            {/* Media Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Evidence</CardTitle>
                <CardDescription>
                  {mediaData?.length || 0} files uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mediaLoading ? (
                  <p className="text-muted-foreground">Loading media...</p>
                ) : mediaData && mediaData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediaData.map((media) => {
                      const Icon = getFileIcon(media.type || '');
                      const handleOpenMedia = async () => {
                        try {
                          // Extract file path from URL (handle both old full URLs and new file paths)
                          let filePath = media.url;
                          
                          // If it's a full URL, extract just the file path
                          if (filePath.startsWith('http')) {
                            // Extract the path after 'case-evidence/'
                            const match = filePath.match(/case-evidence\/(.+)$/);
                            if (match) {
                              filePath = match[1];
                            }
                          }
                          
                          console.log('Getting signed URL for file:', filePath);
                          
                          // Call edge function to get signed URL with proper authorization
                          const { data, error } = await supabase.functions.invoke('get-media-url', {
                            body: {
                              filePath,
                              mediaId: media.id
                            }
                          });
                          
                          console.log('Signed URL response:', { data, error });
                          
                          if (error) {
                            throw new Error(error.message || 'Failed to get file URL');
                          }
                          
                          if (data?.signedUrl) {
                            console.log('Opening signed URL');
                            window.open(data.signedUrl, '_blank');
                          } else {
                            throw new Error('No signed URL returned');
                          }
                        } catch (error) {
                          console.error('Full error:', error);
                          toast({
                            title: "Error Opening File",
                            description: error instanceof Error ? error.message : "Failed to open file. Please try again.",
                            variant: "destructive",
                          });
                        }
                      };

                      return (
                        <div 
                          key={media.id} 
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div 
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={handleOpenMedia}
                          >
                            <Icon className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {(media.meta as any)?.filename || media.url.split('/').pop()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(media.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <FaceEmbedding 
                            mediaId={media.id}
                            mediaUrl={media.url}
                            mediaType={media.type || undefined}
                            onEmbeddingGenerated={refetchMedia}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No evidence uploaded yet. Use the upload section above to add files.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suspects" className="space-y-6">
            {/* Suspect Linking */}
            <SuspectLinking 
              caseId={id!}
              onLinkingComplete={() => {
                refetchMatches();
                refetchCase();
              }}
            />

            {/* Linked Suspects */}
            <Card>
              <CardHeader>
                <CardTitle>Linked Suspects</CardTitle>
                <CardDescription>
                  {matchesData?.length || 0} suspects linked to this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchesLoading ? (
                  <p className="text-muted-foreground">Loading linked suspects...</p>
                ) : matchesData && matchesData.length > 0 ? (
                  <div className="space-y-4">
                    {matchesData.map((match) => (
                      <div key={match.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {match.suspects?.photo_url ? (
                            <img 
                              src={match.suspects.photo_url} 
                              alt={match.suspects.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{match.suspects?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              Linked: {new Date(match.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {match.score && (
                          <Badge variant="secondary">
                            {Math.round(match.score * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No suspects linked yet. Use the linking section above to connect suspects to this case.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-matching" className="space-y-6">
            <AIMatching caseId={id!} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CaseDetail;