import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import type { TryOnJob } from '../../types';

interface GenerationProgressProps {
  job: TryOnJob | null;
  personImageUrl: string;
  garmentImageUrl: string;
  garmentName?: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  job,
  personImageUrl,
  garmentImageUrl,
  garmentName
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { title: 'Human Anatomy & Pose Analysis', desc: 'Isolating body landmarks, shoulder alignment & torso contours' },
    { title: 'Garment Geometry Warping', desc: 'Mapping fabric drape, texture coordinates & seam boundaries' },
    { title: 'Latent Diffusion Inpainting', desc: 'Synthesizing photorealistic folds and lighting balance' },
    { title: 'Boundary Harmonization', desc: 'Refining neckline, skin tone transitions and natural shadows' }
  ];

  const currentStepText = job?.current_step || 'Initializing Virtual Try-On Pipeline...';
  const progressPercent = job?.progress || Math.min(Math.floor(elapsed * 30), 92);

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto rounded-3xl border border-white/[0.1] shadow-2xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-white text-[11px] font-medium tracking-wide">
          <Loader2 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
          Processing Virtual Try-On · {elapsed.toFixed(1)}s
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
          Fitting {garmentName || 'Garment'} onto Model
        </h2>
        <p className="text-xs text-[#94A3B8]">
          Executing neural drape alignment and photometric color harmonization
        </p>
      </div>

      {/* Visual Dual Portrait Alignment */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <div className="w-28 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.12] bg-[#0B0D14] shadow-md relative">
          <img src={personImageUrl} alt="Model Portrait" className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-[9px] text-center text-white font-medium uppercase tracking-wider">
            Model
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#D4AF37]">
          <ArrowRight className="w-4 h-4" />
        </div>

        <div className="w-28 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.12] bg-[#0B0D14] shadow-md relative flex items-center justify-center p-2">
          <img src={garmentImageUrl} alt="Garment" className="w-full h-full object-contain" />
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-[9px] text-center text-white font-medium uppercase tracking-wider">
            Garment
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
            {currentStepText}
          </span>
          <span className="text-[#D4AF37] font-mono font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#0B0D14] rounded-full overflow-hidden border border-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Steps Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {steps.map((st, idx) => {
          const isDone = progressPercent >= (idx + 1) * 25;
          const isCurrent = progressPercent >= idx * 25 && progressPercent < (idx + 1) * 25;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition-all ${
                isDone
                  ? 'bg-[#121622] border-emerald-500/30 text-white'
                  : isCurrent
                  ? 'bg-white/[0.04] border-[#D4AF37]/40 text-white'
                  : 'bg-transparent border-white/[0.04] text-[#64748B]'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isDone ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isCurrent ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'border border-white/20'
                }`}>
                  {idx + 1}
                </span>
                <span>{st.title}</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-1 pl-6">{st.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
