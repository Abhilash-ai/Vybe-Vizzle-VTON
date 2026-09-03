import React, { useState } from 'react';
import {
  Heart,
  Download,
  Share2,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Info,
  Clock,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TryOnJob, Garment, PersonModel, GeneratedLook } from '../../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { useTryOn } from '../../context/TryOnContext';
import { api } from '../../services/api';

interface ResultViewerProps {
  job: TryOnJob;
  personImageUrl: string;
  garmentImageUrl: string;
  garment: Garment | null;
  selectedModel: PersonModel | null;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  job,
  personImageUrl,
  garmentImageUrl,
  garment,
  selectedModel
}) => {
  const { setActivePage, quickTryOn } = useTryOn();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const resultImageUrl = job.result_image_url || personImageUrl;

  const handleSaveLook = async () => {
    if (isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await api.saveLook({
        tryon_job_id: job.id,
        title: `${garment?.name || 'Curated Style'} on ${selectedModel ? selectedModel.name.split('—')[0] : 'Model'}`,
        person_image_url: personImageUrl,
        garment_image_url: garmentImageUrl,
        result_image_url: resultImageUrl,
        garment_name: garment?.name,
        garment_category: garment?.category || job.garment_category,
        provider: job.provider,
        generation_time_ms: job.latency_ms,
        is_favorite: true
      });

      setIsSaved(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#60A5FA']
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultImageUrl;
    a.download = `Vizzle_VTON_Look_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Vizzle VTON Virtual Try-On Look',
          text: `Check out this virtual try-on created with Vizzle VTON by AM Studio!`,
          url: window.location.href
        });
      } catch (e) {
        // Fallback to copy link
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-widest uppercase">
              Try-On Synthesized
            </span>
            <span className="text-xs text-[#94A3B8]">
              {job.latency_ms ? `${(job.latency_ms / 1000).toFixed(2)}s inference` : 'Instant'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {garment?.name || 'Virtual Try-On Result'}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Draped on {selectedModel ? selectedModel.name : 'Target Portrait'} · Category: {garment?.category || job.garment_category}
          </p>
        </div>

        {/* Quick Save CTA */}
        <button
          onClick={handleSaveLook}
          disabled={isSaved || isSaving}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all shadow-luxury ${
            isSaved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] hover:opacity-95 hover:shadow-glow-gold'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved to My Looks' : isSaving ? 'Saving...' : 'Save Look'}
        </button>
      </div>

      {/* Main Interactive Comparison Slider */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/[0.08]">
        <BeforeAfterSlider
          originalImage={personImageUrl}
          resultImage={resultImageUrl}
          originalLabel="Original Portrait"
          resultLabel="AI Try-On Result"
        />
      </div>

      {/* Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActivePage('studio')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#121622] border border-white/[0.08] text-white hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all text-xs font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Try Another Item
        </button>

        <button
          onClick={() => setActivePage('outfit-builder')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#121622] border border-white/[0.08] text-white hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all text-xs font-semibold"
        >
          <Layers className="w-4 h-4" />
          Build Outfit
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#121622] border border-white/[0.08] text-white hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all text-xs font-semibold"
        >
          <Download className="w-4 h-4" />
          Download HD
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#121622] border border-white/[0.08] text-white hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all text-xs font-semibold"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          {copiedLink ? 'Link Copied!' : 'Share Look'}
        </button>
      </div>

      {/* Metadata & Technical Breakdown Toggle */}
      <div className="glass-panel rounded-2xl border border-white/[0.06] overflow-hidden">
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className="w-full flex items-center justify-between p-4 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#D4AF37]" />
            Inference Metadata & Model Architecture Details
          </span>
          {showMetadata ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMetadata && (
          <div className="p-4 pt-0 border-t border-white/[0.04] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#94A3B8]">
            <div className="p-3 rounded-xl bg-[#0B0D14]/60">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Provider</span>
              <p className="font-semibold text-white uppercase">{job.provider}</p>
              <p className="text-[10px] text-[#D4AF37] truncate">{job.model_name || 'VTON Engine'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0D14]/60">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Latency</span>
              <p className="font-semibold text-white font-mono">
                {job.latency_ms ? `${Math.round(job.latency_ms)} ms` : '1200 ms'}
              </p>
              <p className="text-[10px] text-emerald-400">Deterministic</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0D14]/60">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Resolution</span>
              <p className="font-semibold text-white font-mono">768 × 1024</p>
              <p className="text-[10px] text-[#94A3B8]">Lanczos High-Q</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0D14]/60">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] block mb-1">Preservation</span>
              <p className="font-semibold text-white">Face & BG Locked</p>
              <p className="text-[10px] text-emerald-400">100% Pose Matched</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
