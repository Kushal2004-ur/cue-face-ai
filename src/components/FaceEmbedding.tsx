import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';

interface FaceEmbeddingProps {
  mediaId: string;
  mediaUrl: string;
  mediaType?: string;
  onEmbeddingGenerated?: () => void;
}

interface MatchResult {
  id: string;
  url: string;
  type: string;
  case_id: string;
  similarity: number;
}

const FaceEmbedding = ({ mediaId, mediaUrl, mediaType, onEmbeddingGenerated }: FaceEmbeddingProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const handleGenerateEmbedding = async () => {
    setIsGenerating(true);
    setMatches([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-sketch-embedding', {
        body: { media_id: mediaId }
      });

      if (error) throw error;

      if (data?.success) {
        setEmbedding(data.embedding_sample || []);
        toast({
          title: "Embedding Generated",
          description: `Successfully generated ${data.embedding_length}-dimensional embedding`,
        });
        
        onEmbeddingGenerated?.();
        
        // Auto-trigger matching
        await handleMatchFace(data.embedding_sample);
      }
    } catch (error) {
      console.error('Error generating embedding:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate embedding",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMatchFace = async (embeddingData?: number[]) => {
    if (!embeddingData && !embedding) {
      toast({
        title: "No Embedding",
        description: "Please generate an embedding first",
        variant: "destructive",
      });
      return;
    }

    setIsMatching(true);
    
    try {
      // Fetch the full embedding from the database
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('embedding')
        .eq('id', mediaId)
        .single();

      if (mediaError) throw mediaError;
      if (!mediaData?.embedding) throw new Error('No embedding found');

      // Call the match_face function
      const { data, error } = await supabase.rpc('match_face', {
        embedding_input: mediaData.embedding
      });

      if (error) throw error;

      setMatches(data || []);
      
      if (data && data.length > 0) {
        toast({
          title: "Matches Found",
          description: `Found ${data.length} similar faces`,
        });
      } else {
        toast({
          title: "No Matches",
          description: "No similar faces found in the database",
        });
      }
    } catch (error) {
      console.error('Error matching faces:', error);
      toast({
        title: "Matching Failed",
        description: error instanceof Error ? error.message : "Failed to match faces",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const openMedia = async (mediaId: string, url: string) => {
    try {
      let filePath = url;
      if (filePath.startsWith('http')) {
        const match = filePath.match(/case-evidence\/(.+)$/);
        if (match) filePath = match[1];
      }

      const { data, error } = await supabase.functions.invoke('get-media-url', {
        body: { filePath, mediaId }
      });

      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening media:', error);
      toast({
        title: "Error",
        description: "Failed to open media file",
        variant: "destructive",
      });
    }
  };

  // Only show for image types
  if (!mediaType?.startsWith('image/')) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2">
        <Button
          onClick={handleGenerateEmbedding}
          disabled={isGenerating || isMatching}
          size="sm"
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Embedding
            </>
          )}
        </Button>
      </div>

      {embedding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Embedding Generated</CardTitle>
            <CardDescription className="text-xs">
              Vector representation (first 8 values): [{embedding.slice(0, 8).map(v => v.toFixed(4)).join(', ')}...]
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Similar Faces</CardTitle>
            <CardDescription className="text-xs">
              Top {matches.length} matches based on facial similarity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => openMedia(match.id, match.url)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {match.type?.startsWith('image/') ? (
                        <img 
                          src={match.url} 
                          alt="Match preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No preview</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {match.url.split('/').pop()?.slice(0, 30)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Case ID: {match.case_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {Math.round(match.similarity * 100)}% Match
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FaceEmbedding;