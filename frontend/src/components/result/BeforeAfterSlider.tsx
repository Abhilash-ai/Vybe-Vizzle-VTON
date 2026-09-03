import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, SplitSquareVertical, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalImage: string;
  resultImage: string;
  originalLabel?: string;
  resultLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalImage,
  resultImage,
  originalLabel = 'Original Portrait',
  resultLabel = 'Virtual Try-On'
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="space-y-3 select-none">
      {/* View Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0B0D14] border border-white/[0.08]">
          <button
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Split Slider
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side by Side
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
            disabled={zoomLevel <= 1}
            className="p-1.5 rounded-lg bg-[#121622] border border-white/[0.08] text-[#94A3B8] hover:text-white disabled:opacity-40"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-[#94A3B8] px-1">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
            disabled={zoomLevel >= 2}
            className="p-1.5 rounded-lg bg-[#121622] border border-white/[0.08] text-[#94A3B8] hover:text-white disabled:opacity-40"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        /* Dual-Layer Split Slider */
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onClick={(e) => handleMove(e.clientX)}
          className="relative w-full aspect-[3/4] max-h-[580px] rounded-2xl overflow-hidden cursor-ew-resize border border-white/[0.12] bg-[#0B0D14] shadow-luxury group"
        >
          {/* Base Layer: Result Virtual Try-On */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            <img
              src={resultImage}
              alt={resultLabel}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* Top Layer: Original Portrait clipped */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden transition-transform duration-200"
            style={{
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          >
            <img
              src={originalImage}
              alt={originalLabel}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* Split Handle Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Circular Handle Pill */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#D4AF37] text-[#0B0D14] font-bold text-xs flex items-center justify-center shadow-luxury border-2 border-white">
              ⇄
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-full bg-[#0B0D14]/80 backdrop-blur border border-white/10 text-[10px] text-white font-medium uppercase tracking-wider">
            {originalLabel}
          </div>
          <div className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-full bg-[#D4AF37]/90 text-[#0B0D14] font-bold text-[10px] uppercase tracking-wider shadow">
            {resultLabel}
          </div>
        </div>
      ) : (
        /* Side by Side Comparison */
        <div className="grid grid-cols-2 gap-3 aspect-[3/4] max-h-[580px]">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0B0D14] shadow-md">
            <img src={originalImage} alt={originalLabel} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0B0D14]/80 backdrop-blur border border-white/10 text-[10px] text-white font-medium uppercase">
              {originalLabel}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-[#0B0D14] shadow-glow-gold">
            <img src={resultImage} alt={resultLabel} className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#0B0D14] font-bold text-[10px] uppercase shadow">
              {resultLabel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
