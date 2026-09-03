import React, { useState } from 'react';
import { Sliders, Sparkles, RotateCcw, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { Garment, PersonModel, TryOnOptions } from '../../types';

interface StudioControlsProps {
  selectedPersonImage: string;
  selectedModel: PersonModel | null;
  selectedGarment: Garment | null;
  category: string;
  options: TryOnOptions;
  setOptions: React.Dispatch<React.SetStateAction<TryOnOptions>>;
  isGenerating: boolean;
  onGenerate: () => void;
  onReset: () => void;
  error: string | null;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  selectedPersonImage,
  selectedModel,
  selectedGarment,
  category,
  options,
  setOptions,
  isGenerating,
  onGenerate,
  onReset,
  error
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isReady = !!selectedPersonImage && !!selectedGarment;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">3. Synthesis Parameters</h3>
            <p className="text-[11px] text-[#94A3B8]">Review styling options & trigger neural warp</p>
          </div>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-[#D4AF37] hover:underline font-medium"
        >
          {showAdvanced ? 'Hide Advanced' : 'Tune Settings'}
        </button>
      </div>

      {/* Selection Summary Cards */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0B0D14]/80 border border-white/[0.06]">
        <div>
          <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Target Portrait
          </span>
          <p className="text-xs font-medium text-white truncate">
            {selectedModel ? selectedModel.name.split('—')[0] : selectedPersonImage ? 'Custom Portrait' : 'Not selected'}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Selected Apparel
          </span>
          <p className="text-xs font-medium text-white truncate">
            {selectedGarment ? selectedGarment.name : 'Not selected'}
          </p>
          {selectedGarment && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] uppercase font-mono mt-0.5 inline-block">
              {category || selectedGarment.category}
            </span>
          )}
        </div>
      </div>

      {/* Advanced Settings Accordion */}
      {showAdvanced && (
        <div className="p-4 rounded-xl bg-[#121622] border border-white/[0.06] space-y-4 text-xs">
          {/* Toggles */}
          <div className="space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-white font-medium">Preserve Original Face & Pose</span>
              <input
                type="checkbox"
                checked={options.preserve_face}
                onChange={(e) => setOptions((prev) => ({ ...prev, preserve_face: e.target.checked }))}
                className="w-4 h-4 rounded bg-[#0B0D14] border-white/20 text-[#D4AF37] focus:ring-0 focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-white font-medium">Preserve Background Environment</span>
              <input
                type="checkbox"
                checked={options.preserve_background}
                onChange={(e) => setOptions((prev) => ({ ...prev, preserve_background: e.target.checked }))}
                className="w-4 h-4 rounded bg-[#0B0D14] border-white/20 text-[#D4AF37] focus:ring-0 focus:ring-offset-0"
              />
            </label>
          </div>

          {/* Garment Fit Selector */}
          <div>
            <label className="text-[11px] font-medium text-[#94A3B8] block mb-1.5">Garment Drape & Fit</label>
            <div className="grid grid-cols-3 gap-2">
              {(['tight', 'regular', 'loose'] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => setOptions((prev) => ({ ...prev, garment_fit: fit }))}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize border transition-all ${
                    options.garment_fit === fit
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#0B0D14] border-white/[0.08] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Generation Quality */}
          <div>
            <label className="text-[11px] font-medium text-[#94A3B8] block mb-1.5">Resolution & Quality</label>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'high', 'ultra'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setOptions((prev) => ({ ...prev, generation_quality: q }))}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize border transition-all ${
                    options.generation_quality === q
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#0B0D14] border-white/[0.08] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onGenerate}
          disabled={!isReady || isGenerating}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-luxury ${
            isReady && !isGenerating
              ? 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#B38F25] text-[#0B0D14] hover:opacity-95 hover:shadow-glow-gold hover:scale-[1.01]'
              : 'bg-white/[0.06] text-[#64748B] cursor-not-allowed border border-white/[0.04]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Synthesizing Look...' : 'Generate Virtual Try-On'}
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 text-xs text-[#94A3B8] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Selections
        </button>
      </div>
    </div>
  );
};
