import React from 'react';
import { Cpu, Sparkles, Layers, ShieldCheck, ArrowRight, Eye, RefreshCw, Scissors, Palette } from 'lucide-react';
import { useTryOn } from '../context/TryOnContext';

export const HowItWorksPage: React.FC = () => {
  const { setActivePage } = useTryOn();

  const pipelineStages = [
    {
      icon: <Eye className="w-6 h-6 text-[#D4AF37]" />,
      title: '1. Human Parsing & Landmark Segmentation',
      subtitle: 'Body Pose & Semantic Contour Analysis',
      desc: 'The pipeline decomposes the uploaded portrait into semantic segmentations (head, face, torso, upper arms, lower arms, legs) and 18 DensePose keypoints to accurately track human anatomy and posture.'
    },
    {
      icon: <Scissors className="w-6 h-6 text-[#60A5FA]" />,
      title: '2. Cloth-Agnostic Representation',
      subtitle: 'Non-Destructive Background & Skin Masking',
      desc: 'Original clothing is removed while precisely preserving the wearer’s head, face, skin tone, hands, and background environment to prevent identity drift or anatomical warping.'
    },
    {
      icon: <Layers className="w-6 h-6 text-[#34D399]" />,
      title: '3. Geometric Feature Warping',
      subtitle: 'Thin-Plate Spline & Garment Deformation',
      desc: 'The target garment image is extracted and warped to align naturally with the person’s torso curvature, sleeve angles, and body proportions before feeding into neural latent space.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#F472B6]" />,
      title: '4. Latent Diffusion Inpainting',
      subtitle: 'UNet Cross-Attention & Texture Generation',
      desc: 'A specialized latent diffusion model (e.g. IDM-VTON, CatVTON, or FASHN) synthesizes photorealistic fabric folds, shadows, realistic neck drapes, and lighting matching in the masked latent space.'
    },
    {
      icon: <Palette className="w-6 h-6 text-[#FBBF24]" />,
      title: '5. Lighting & Color Harmonization',
      subtitle: 'Photometric Consistency & Edge Feathering',
      desc: 'The synthesized result undergoes high-frequency edge feathering and ambient lighting harmonization to ensure natural integration between skin, fabric seams, and background highlights.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5" />
          Technical Architecture
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          How VTON Diffusion Works
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Inside the multi-stage generative computer vision pipeline powering Vizzle VTON.
        </p>
      </div>

      {/* Pipeline Diagram Cards */}
      <div className="space-y-4">
        {pipelineStages.map((stage, idx) => (
          <div
            key={idx}
            className="glass-card p-6 sm:p-8 rounded-3xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:border-[#D4AF37]/40 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#0B0D14] border border-white/[0.1] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              {stage.icon}
            </div>

            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">
                {stage.subtitle}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                {stage.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {stage.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy & Safety Note */}
      <div className="glass-panel-gold p-8 rounded-3xl border border-[#D4AF37]/30 text-center space-y-4 shadow-luxury">
        <h3 className="text-xl font-serif font-bold text-white">
          Designed for Privacy & Ethical AI
        </h3>
        <p className="text-xs text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
          Vizzle VTON enforces strict ephemeral processing. No biometric facial models or proprietary user photographs are retained without explicit consent, and full data deletion is available with 1-click in your profile settings.
        </p>
        <button
          onClick={() => setActivePage('studio')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] font-bold text-xs uppercase tracking-widest shadow-glow-gold hover:opacity-95 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Test in Try-On Studio
        </button>
      </div>
    </div>
  );
};
