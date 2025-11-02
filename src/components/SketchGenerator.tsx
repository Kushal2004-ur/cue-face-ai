import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ChatClarification from './ChatClarification';

interface SketchGeneratorProps {
  caseId: string;
  onSketchGenerated?: () => void;
}

const SketchGenerator = ({ caseId, onSketchGenerated }: SketchGeneratorProps) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSketch, setGeneratedSketch] = useState<string | null>(null);
  const [showClarification, setShowClarification] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [originalDescription, setOriginalDescription] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState<'none' | 'generating' | 'ready'>('none');
  const { toast } = useToast();

  const initiateGeneration = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description to generate a sketch.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setOriginalDescription(description.trim());

    try {
      // Generate clarifying questions using AI
      const { data, error } = await supabase.functions.invoke('generate-clarifying-questions', {
        body: { description: description.trim() }
      });

      if (error) throw error;

      if (data.questions && data.questions.length > 0) {
        setAiQuestions(data.questions);
        setShowClarification(true);
      } else {
        // No questions generated, proceed directly
        await generateSketch(description.trim(), description.trim(), []);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate clarifying questions. Proceeding with sketch generation.",
        variant: "destructive",
      });
      await generateSketch(description.trim(), description.trim(), []);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClarificationsComplete = async (questionsAndAnswers: Array<{ question: string; answer: string; category: string }>) => {
    setShowClarification(false);
    setIsGenerating(true);

    try {
      // Refine description using AI
      const { data, error } = await supabase.functions.invoke('refine-description', {
        body: {
          originalDescription,
          questionsAndAnswers
        }
      });

      if (error) throw error;

      const refinedDescription = data.refinedDescription || originalDescription;
      
      // Save conversation to database
      const { data: convData, error: convError } = await supabase
        .from('sketch_conversations')
        .insert({
          case_id: caseId,
          initial_description: originalDescription,
          refined_description: refinedDescription,
          conversation_data: questionsAndAnswers
        })
        .select()
        .single();

      if (convError) {
        console.error('Error saving conversation:', convError);
      } else {
        setConversationId(convData.id);
      }

      // Generate sketch with refined description
      await generateSketch(originalDescription, refinedDescription, questionsAndAnswers);
    } catch (error) {
      console.error('Error refining description:', error);
      toast({
        title: "Error",
        description: "Failed to refine description. Using original description.",
        variant: "destructive",
      });
      await generateSketch(originalDescription, originalDescription, questionsAndAnswers);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchMatches = async (mediaId: string) => {
    setIsMatching(true);
    try {
      // Wait a moment for the edge function to process matches
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          suspects (
            id,
            name,
            photo_url
          )
        `)
        .eq('evidence->>sketch_id', mediaId)
        .order('score', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching matches:', error);
      } else {
        setMatchResults(matches || []);
        if (matches && matches.length > 0) {
          toast({
            title: "Matches Found",
            description: `Found ${matches.length} potential suspect matches`,
          });
        } else {
          toast({
            title: "No Matches",
            description: "No suspect matches found for this sketch",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsMatching(false);
    }
  };

  const generateSketch = async (
    original: string,
    refined: string,
    questionsAndAnswers: any[]
  ) => {
    setIsGenerating(true);
    setMatchResults([]);
    setEmbeddingStatus('none');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-sketch', {
        body: {
          description: refined,
          caseId,
          originalDescription: original,
          clarifications: questionsAndAnswers
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        // Update conversation with media_id if we have a conversationId
        if (conversationId && data.mediaId) {
          await supabase
            .from('sketch_conversations')
            .update({ media_id: data.mediaId })
            .eq('id', conversationId);
        }

        setGeneratedSketch(data.sketchUrl);
        setEmbeddingStatus('generating');
        
        toast({
          title: "Sketch Generated",
          description: "Generating embedding and finding suspect matches...",
        });
        
        // Wait for embedding generation (give it some time)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if embedding was created
        const { data: mediaData } = await supabase
          .from('media')
          .select('embedding')
          .eq('id', data.mediaId)
          .single();
        
        if (mediaData?.embedding) {
          setEmbeddingStatus('ready');
          toast({
            title: "Embedding Ready",
            description: "Starting suspect matching...",
          });
        } else {
          setEmbeddingStatus('none');
        }
        
        // Automatically fetch matches after sketch generation
        await fetchMatches(data.mediaId);
        
        onSketchGenerated?.();
        setDescription('');
        setOriginalDescription('');
        setConversationId(null);
      } else {
        throw new Error(data.error || 'Failed to generate sketch');
      }
    } catch (error) {
      console.error('Error generating sketch:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate sketch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (showClarification) {
    return (
      <ChatClarification
        questions={aiQuestions}
        onClarificationsComplete={handleClarificationsComplete}
        onCancel={() => {
          setShowClarification(false);
          setAiQuestions([]);
          setOriginalDescription('');
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Sketch Generator
        </CardTitle>
        <CardDescription>
          Generate forensic sketches from eyewitness descriptions using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Eyewitness Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the suspect's appearance: facial features, hair, build, distinctive marks, etc. Be as detailed as possible for better results."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={isGenerating}
          />
        </div>
        
        <Button 
          onClick={initiateGeneration}
          disabled={isGenerating || !description.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Sketch...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate AI Sketch
            </>
          )}
        </Button>

        {generatedSketch && (
          <div className="space-y-2">
            <Label>Generated Sketch</Label>
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Image className="h-4 w-4" />
                  Latest generated sketch - Click to view full size
                </div>
                {embeddingStatus === 'generating' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-muted-foreground">Generating embedding...</span>
                  </div>
                )}
                {embeddingStatus === 'ready' && (
                  <Badge variant="default" className="text-xs">
                    ✅ Embedding ready
                  </Badge>
                )}
              </div>
              <img 
                src={generatedSketch} 
                alt="AI Generated Sketch" 
                className="w-full max-w-md mx-auto rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowImageDialog(true)}
              />
            </div>

            {isMatching && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Matching in progress...
                  </span>
                </div>
              </div>
            )}

            {matchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold">Suspect Matches</h3>
                {matchResults.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {match.suspects?.photo_url && (
                        <img
                          src={match.suspects.photo_url}
                          alt={match.suspects.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {match.suspects?.name || 'Unknown Suspect'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Match: {Math.round(match.score * 100)}%
                        </p>
                      </div>
                    </div>
                    <Badge variant={match.score >= 0.9 ? 'default' : 'secondary'}>
                      {match.score >= 0.9 ? 'High' : 'Medium'} Confidence
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Generated Forensic Sketch</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={generatedSketch || ''} 
                alt="AI Generated Sketch - Full Size" 
                className="max-w-full rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SketchGenerator;