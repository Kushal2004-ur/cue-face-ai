import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Link2, 
  X,
  AlertTriangle,
  Loader2,
  ImageOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sketchUrl: string;
  sketchId: string;
  sketchDate: string;
  suspectPhotoUrl?: string;
  suspectPhotoMediaId?: string;
  suspectId: string;
  suspectName: string;
  suspectPhotoDate?: string;
  similarityScore: number;
  modelName?: string;
  caseId: string;
}

export const ComparisonModal = ({
  isOpen,
  onClose,
  sketchUrl,
  sketchId,
  sketchDate,
  suspectPhotoUrl,
  suspectPhotoMediaId,
  suspectId,
  suspectName,
  suspectPhotoDate,
  similarityScore,
  modelName = 'text-embedding-004',
  caseId,
}: ComparisonModalProps) => {
  const [overlayMode, setOverlayMode] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState([50]);
  const [swipePosition, setSwipePosition] = useState([50]);
  const [isLinking, setIsLinking] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const { toast } = useToast();

  // Signed URL state
  const [signedSketchUrl, setSignedSketchUrl] = useState<string | null>(null);
  const [signedSuspectUrl, setSignedSuspectUrl] = useState<string | null>(null);
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Fetch signed URLs when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSignedSketchUrl(null);
      setSignedSuspectUrl(null);
      setUrlError(null);
      return;
    }

    const fetchSignedUrls = async () => {
      setIsLoadingUrls(true);
      setUrlError(null);

      try {
        const promises: Promise<void>[] = [];

        // Fetch sketch signed URL
        const isSketchSigned = sketchUrl?.startsWith('http');
        if (!isSketchSigned && sketchUrl) {
          promises.push(
            (async () => {
              console.log('Fetching signed URL for sketch:', sketchId, sketchUrl);
              const { data, error } = await supabase.functions.invoke('get-media-url', {
                body: { mediaId: sketchId }
              });

              if (error) {
                console.error('Error fetching sketch URL:', error);
                throw new Error(`Failed to load sketch: ${error.message}`);
              }

              if (data?.signedUrl) {
                console.log('Got signed sketch URL');
                setSignedSketchUrl(data.signedUrl);
              } else {
                throw new Error('No signed URL returned for sketch');
              }
            })()
          );
        } else if (isSketchSigned) {
          setSignedSketchUrl(sketchUrl);
        }

        // Fetch suspect photo signed URL using suspectId
        // This calls the edge function which looks up the suspect's photo_url or photo_media_id
        promises.push(
          (async () => {
            console.log('Fetching signed URL for suspect:', suspectId);
            const { data, error } = await supabase.functions.invoke('get-media-url', {
              body: { suspectId }
            });

            if (error) {
              console.error('Error fetching suspect photo URL:', error);
              // Don't throw - suspect may not have a photo
              return;
            }

            if (data?.signedUrl) {
              console.log('Got signed suspect URL:', data.isPublic ? '(public)' : '(signed)');
              setSignedSuspectUrl(data.signedUrl);
            } else {
              console.log('Suspect has no photo:', data?.message);
            }
          })()
        );

        await Promise.all(promises);

      } catch (error) {
        console.error('Error fetching signed URLs:', error);
        setUrlError(error instanceof Error ? error.message : 'Failed to load images');
        toast({
          title: "Failed to load images",
          description: error instanceof Error ? error.message : "Could not retrieve image URLs",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUrls(false);
      }
    };

    fetchSignedUrls();
  }, [isOpen, sketchUrl, sketchId, suspectId, toast]);

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) {
      return <Badge className="bg-green-600 text-white">High Confidence ≥80%</Badge>;
    } else if (score >= 0.6) {
      return <Badge className="bg-amber-500 text-white">Medium Confidence 60-79%</Badge>;
    } else {
      return <Badge className="bg-red-600 text-white">Low Confidence &lt;60%</Badge>;
    }
  };

  const handleDownload = async (url: string | null, filename: string) => {
    if (!url) {
      toast({
        title: "Download Failed",
        description: "Image URL not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const handleLinkSuspect = async () => {
    setIsLinking(true);
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          case_id: caseId,
          suspect_id: suspectId,
          score: similarityScore,
          source: 'manual_comparison',
          status: 'under_review',
          evidence: {
            sketch_id: sketchId,
            model: modelName,
            compared_at: new Date().toISOString(),
          },
        });

      if (error) throw error;

      toast({
        title: "Suspect Linked",
        description: `${suspectName} has been linked to this case`,
      });

      onClose();
    } catch (error) {
      console.error('Error linking suspect:', error);
      toast({
        title: "Linking Failed",
        description: error instanceof Error ? error.message : "Failed to link suspect",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleMarkNotMatch = async () => {
    setIsMarking(true);
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          case_id: caseId,
          suspect_id: suspectId,
          score: similarityScore,
          source: 'manual_comparison',
          status: 'false_positive',
          evidence: {
            sketch_id: sketchId,
            model: modelName,
            marked_false_at: new Date().toISOString(),
            reason: 'Manual comparison review',
          },
        });

      if (error) throw error;

      toast({
        title: "Marked as Not a Match",
        description: "This match has been recorded as a false positive",
      });

      onClose();
    } catch (error) {
      console.error('Error marking false positive:', error);
      toast({
        title: "Failed to Mark",
        description: error instanceof Error ? error.message : "Failed to mark as false positive",
        variant: "destructive",
      });
    } finally {
      setIsMarking(false);
    }
  };

  // Image placeholder component
  const ImagePlaceholder = ({ label }: { label: string }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
      <ImageOff className="h-12 w-12 mb-2" />
      <p className="text-sm">{label}</p>
    </div>
  );

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading images...</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 space-y-2">
          <DialogTitle className="text-2xl">Sketch vs Suspect Comparison</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-3 items-center">
            <span className="text-base font-semibold text-foreground">
              Similarity: {Math.round(similarityScore * 100)}%
            </span>
            {getConfidenceBadge(similarityScore)}
            <Badge variant="outline">Model: {modelName}</Badge>
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Controls Bar */}
        <div className="px-6 py-3 bg-muted/30 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={overlayMode ? "default" : "outline"}
              size="sm"
              onClick={() => setOverlayMode(!overlayMode)}
              disabled={isLoadingUrls}
            >
              <Layers className="h-4 w-4 mr-2" />
              {overlayMode ? "Split View" : "Overlay Mode"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(signedSketchUrl, `sketch_${sketchId}.png`)}
              disabled={!signedSketchUrl || isLoadingUrls}
            >
              <Download className="h-4 w-4 mr-2" />
              Sketch
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(signedSuspectUrl, `suspect_${suspectName}.png`)}
              disabled={!signedSuspectUrl || isLoadingUrls}
            >
              <Download className="h-4 w-4 mr-2" />
              Photo
            </Button>
          </div>
        </div>

        {/* Image Comparison Area */}
        <div className="flex-1 overflow-auto p-6 relative">
          {isLoadingUrls && <LoadingOverlay />}
          
          {urlError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
              <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertTriangle className="h-8 w-8" />
                <p className="text-sm">{urlError}</p>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {overlayMode ? (
            /* Overlay Mode with Opacity Control */
            <div className="space-y-4">
              <div className="flex items-center gap-4 max-w-md mx-auto">
                <span className="text-sm font-medium whitespace-nowrap">Opacity:</span>
                <Slider
                  value={overlayOpacity}
                  onValueChange={setOverlayOpacity}
                  max={100}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">{overlayOpacity[0]}%</span>
              </div>

              <div className="relative max-w-4xl mx-auto aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <TransformWrapper>
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                    {/* Base layer: Suspect photo */}
                    {signedSuspectUrl ? (
                      <img
                        src={signedSuspectUrl}
                        alt={suspectName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                        <ImageOff className="h-12 w-12 mb-2" />
                        <p className="text-sm">No suspect photo</p>
                      </div>
                    )}
                  </TransformComponent>
                </TransformWrapper>
                
                {/* Overlay layer: Sketch with opacity */}
                {signedSketchUrl && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ opacity: overlayOpacity[0] / 100 }}
                  >
                    <img
                      src={signedSketchUrl}
                      alt="Generated Sketch"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Side-by-Side Mode with Swipe Diff */
            <div className="space-y-4">
              <div className="flex items-center gap-4 max-w-md mx-auto">
                <span className="text-sm font-medium whitespace-nowrap">Swipe:</span>
                <Slider
                  value={swipePosition}
                  onValueChange={setSwipePosition}
                  max={100}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">{swipePosition[0]}%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sketch Side */}
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Generated Sketch</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(sketchDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-muted aspect-[3/4] relative">
                    {signedSketchUrl ? (
                      <TransformWrapper>
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 rounded-md p-1">
                              <Button size="icon" variant="ghost" onClick={() => zoomIn()}>
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => zoomOut()}>
                                <ZoomOut className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => resetTransform()}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                              <img
                                src={signedSketchUrl}
                                alt="Generated Sketch"
                                className="w-full h-full object-contain"
                              />
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    ) : (
                      <ImagePlaceholder label="Sketch loading..." />
                    )}
                  </div>
                </div>

                {/* Suspect Photo Side */}
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{suspectName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {suspectPhotoDate ? `Photo: ${new Date(suspectPhotoDate).toLocaleString()}` : 'Suspect Photo'}
                    </p>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-muted aspect-[3/4] relative">
                    {signedSuspectUrl ? (
                      <TransformWrapper>
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 rounded-md p-1">
                              <Button size="icon" variant="ghost" onClick={() => zoomIn()}>
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => zoomOut()}>
                                <ZoomOut className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => resetTransform()}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                              <img
                                src={signedSuspectUrl}
                                alt={suspectName}
                                className="w-full h-full object-contain"
                              />
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    ) : (
                      <ImagePlaceholder label="No suspect photo available" />
                    )}
                  </div>
                </div>
              </div>

              {/* Swipe Diff Visualization */}
              <div className="max-w-4xl mx-auto">
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  <div className="relative w-full h-full">
                    {signedSuspectUrl ? (
                      <img
                        src={signedSuspectUrl}
                        alt={suspectName}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    ) : (
                      <ImagePlaceholder label="No suspect photo" />
                    )}
                    {signedSketchUrl && (
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - swipePosition[0]}% 0 0)` }}
                      >
                        <img
                          src={signedSketchUrl}
                          alt="Generated Sketch"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg"
                      style={{ left: `${swipePosition[0]}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="p-6 pt-4 flex flex-wrap gap-3 justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>

          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={handleMarkNotMatch}
              disabled={isMarking || isLinking}
            >
              {isMarking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark Not a Match
                </>
              )}
            </Button>

            <Button
              onClick={handleLinkSuspect}
              disabled={isLinking || isMarking}
            >
              {isLinking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Link Suspect to Case
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
