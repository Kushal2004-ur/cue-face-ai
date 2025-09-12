import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SketchGeneratorProps {
  caseId: string;
  onSketchGenerated?: () => void;
}

const SketchGenerator = ({ caseId, onSketchGenerated }: SketchGeneratorProps) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSketch, setGeneratedSketch] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSketch = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description to generate a sketch.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-sketch', {
        body: {
          description: description.trim(),
          caseId
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
        setDescription(''); // Clear the input
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
          onClick={generateSketch}
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