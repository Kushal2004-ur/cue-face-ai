import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatClarification from './ChatClarification';
import { detectAmbiguousTerms, buildRefinedDescription, Clarification } from '@/lib/ambiguousTerms';

interface SketchGeneratorProps {
  caseId: string;
  onSketchGenerated?: () => void;
}

const SketchGenerator = ({ caseId, onSketchGenerated }: SketchGeneratorProps) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSketch, setGeneratedSketch] = useState<string | null>(null);
  const [showClarification, setShowClarification] = useState(false);
  const [detectedTerms, setDetectedTerms] = useState<any[]>([]);
  const [originalDescription, setOriginalDescription] = useState('');
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

    // Detect ambiguous terms
    const ambiguous = detectAmbiguousTerms(description.trim());
    
    if (ambiguous.length > 0) {
      setOriginalDescription(description.trim());
      setDetectedTerms(ambiguous);
      setShowClarification(true);
    } else {
      // No ambiguous terms, generate directly
      await generateSketch(description.trim(), description.trim());
    }
  };

  const handleClarificationsComplete = async (clarifications: Clarification[]) => {
    const refinedDescription = buildRefinedDescription(originalDescription, clarifications);
    setShowClarification(false);
    await generateSketch(originalDescription, refinedDescription, clarifications);
  };

  const generateSketch = async (
    original: string,
    refined: string,
    clarifications?: Clarification[]
  ) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-sketch', {
        body: {
          description: refined,
          caseId,
          originalDescription: original,
          clarifications: clarifications || []
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setGeneratedSketch(data.sketchUrl);
        toast({
          title: "Sketch Generated",
          description: "AI sketch has been generated and saved to case evidence.",
        });
        onSketchGenerated?.();
        setDescription('');
        setOriginalDescription('');
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
        ambiguousTerms={detectedTerms}
        onClarificationsComplete={handleClarificationsComplete}
        onCancel={() => {
          setShowClarification(false);
          setDetectedTerms([]);
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
              <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <Image className="h-4 w-4" />
                Latest generated sketch
              </div>
              <img 
                src={generatedSketch} 
                alt="AI Generated Sketch" 
                className="w-full max-w-md mx-auto rounded-lg border"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SketchGenerator;