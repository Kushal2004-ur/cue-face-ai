import { useRef, useEffect, useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Loader2, ImageOff } from 'lucide-react';

interface ComparisonCanvasProps {
  sketchUrl: string | null;
  suspectUrl: string | null;
  mode: 'overlay' | 'swipe';
  overlayOpacity: number;
  swipePosition: number;
  onOverlayOpacityChange: (value: number) => void;
  onSwipePositionChange: (value: number) => void;
  suspectName: string;
}

export const ComparisonCanvas = ({
  sketchUrl,
  suspectUrl,
  mode,
  overlayOpacity,
  swipePosition,
  onOverlayOpacityChange,
  onSwipePositionChange,
  suspectName,
}: ComparisonCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sketchImg, setSketchImg] = useState<HTMLImageElement | null>(null);
  const [suspectImg, setSuspectImg] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Load images
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    setSketchImg(null);
    setSuspectImg(null);

    let loadedCount = 0;
    const totalToLoad = (sketchUrl ? 1 : 0) + (suspectUrl ? 1 : 0);

    if (totalToLoad === 0) {
      setIsLoading(false);
      return;
    }

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        setIsLoading(false);
      }
    };

    // Load sketch image
    if (sketchUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSketchImg(img);
        checkComplete();
      };
      img.onerror = (e) => {
        console.error('Failed to load sketch image:', e);
        setLoadError('Failed to load sketch image');
        checkComplete();
      };
      img.src = sketchUrl;
    }

    // Load suspect image
    if (suspectUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSuspectImg(img);
        checkComplete();
      };
      img.onerror = (e) => {
        console.error('Failed to load suspect image:', e);
        setLoadError('Failed to load suspect image');
        checkComplete();
      };
      img.src = suspectUrl;
    }
  }, [sketchUrl, suspectUrl]);

  // Update canvas size on container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Maintain 4:3 aspect ratio
        const aspectRatio = 4 / 3;
        let width = rect.width;
        let height = width / aspectRatio;
        
        // If height exceeds available space, constrain by height
        if (height > rect.height) {
          height = rect.height;
          width = height * aspectRatio;
        }
        
        setCanvasSize({ 
          width: Math.floor(width * window.devicePixelRatio), 
          height: Math.floor(height * window.devicePixelRatio) 
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw to canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'hsl(var(--muted))';
    ctx.fillRect(0, 0, width, height);

    // Helper to draw image centered and contained
    const drawImageContained = (img: HTMLImageElement, alpha: number = 1, clipX?: number) => {
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      
      let drawWidth: number, drawHeight: number, drawX: number, drawY: number;
      
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawWidth = width;
        drawHeight = width / imgAspect;
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      } else {
        // Image is taller than canvas
        drawHeight = height;
        drawWidth = height * imgAspect;
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (clipX !== undefined) {
        // Clip to left portion for swipe mode
        ctx.beginPath();
        ctx.rect(0, 0, clipX, height);
        ctx.clip();
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    };

    if (mode === 'overlay') {
      // Overlay mode: suspect as base, sketch on top with opacity
      if (suspectImg) {
        drawImageContained(suspectImg, 1);
      } else if (!suspectUrl) {
        // Draw placeholder for no suspect photo
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No suspect photo', width / 2, height / 2);
      }
      
      if (sketchImg) {
        drawImageContained(sketchImg, overlayOpacity / 100);
      }
    } else {
      // Swipe mode: suspect as base, sketch clipped to left portion
      const swipeX = (swipePosition / 100) * width;
      
      if (suspectImg) {
        drawImageContained(suspectImg, 1);
      } else if (!suspectUrl) {
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No suspect photo', width / 2, height / 2);
      }
      
      if (sketchImg) {
        drawImageContained(sketchImg, 1, swipeX);
      }
      
      // Draw swipe line
      ctx.save();
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(swipeX, 0);
      ctx.lineTo(swipeX, height);
      ctx.stroke();
      ctx.restore();
    }
  }, [canvasSize, sketchImg, suspectImg, mode, overlayOpacity, swipePosition, suspectUrl]);

  // Redraw when dependencies change
  useEffect(() => {
    if (!isLoading) {
      drawCanvas();
    }
  }, [drawCanvas, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading images...</p>
      </div>
    );
  }

  if (loadError && !sketchImg && !suspectImg) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-muted rounded-lg">
        <ImageOff className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slider control */}
      <div className="flex items-center gap-4 max-w-md mx-auto">
        <span className="text-sm font-medium whitespace-nowrap">
          {mode === 'overlay' ? 'Sketch Opacity:' : 'Swipe Position:'}
        </span>
        <Slider
          value={[mode === 'overlay' ? overlayOpacity : swipePosition]}
          onValueChange={(v) => 
            mode === 'overlay' 
              ? onOverlayOpacityChange(v[0]) 
              : onSwipePositionChange(v[0])
          }
          max={100}
          min={0}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-12">
          {mode === 'overlay' ? overlayOpacity : swipePosition}%
        </span>
      </div>

      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="relative max-w-4xl mx-auto aspect-[4/3] bg-muted rounded-lg overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'auto' }}
        />
        
        {/* Labels */}
        {mode === 'swipe' && (
          <>
            <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
              Sketch
            </div>
            <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
              {suspectName || 'Suspect'}
            </div>
          </>
        )}
        
        {mode === 'overlay' && (
          <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
            Overlay Mode (Sketch: {overlayOpacity}% opacity)
          </div>
        )}
      </div>
    </div>
  );
};
