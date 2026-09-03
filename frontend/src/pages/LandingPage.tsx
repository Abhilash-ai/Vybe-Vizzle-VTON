import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Layers, Shirt, Cpu, CheckCircle2, SplitSquareVertical } from 'lucide-react';
import { useTryOn } from '../context/TryOnContext';
import { SAMPLE_MODELS, SAMPLE_GARMENTS } from '../services/sampleData';

export const LandingPage: React.FC = () => {
  const { setActivePage, quickTryOn } = useTryOn();

  const samplePair = {
    model: SAMPLE_MODELS[0],
    garment: SAMPLE_GARMENTS[0]
  };

  return (
    <div className="space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 text-center space-y-8">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {/* Studio Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121622] border border-[#D4AF37]/30 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] shadow-glow-gold animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5" />
          AM Studio Presents
        </div>

        {/* Main Title */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white leading-[1.1]">
            Virtual Fashion Try-On,{' '}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38F25] bg-clip-text text-transparent">
              Redefined by AI
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-[#94A3B8] max-w-2xl mx-auto font-normal leading-relaxed">
            Experience photorealistic virtual fitting with modular latent diffusion, precise body contour alignment, and seamless garment harmonization across 10+ apparel categories.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActivePage('studio')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#B38F25] text-[#0B0D14] font-bold text-xs uppercase tracking-widest hover:opacity-95 shadow-glow-gold hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Try It Now · Free
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActivePage('explore')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#121622] border border-white/[0.1] text-white hover:border-[#D4AF37]/40 hover:text-[#D4AF37] font-semibold text-xs uppercase tracking-widest transition-all"
          >
            Explore Lookbook
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#64748B] pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Zero Biometric Storage
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> 10+ Categories (Tops, Dresses, Ethnic Sarees & Kurtas)
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-blue-400" /> Modular AI Architecture
          </span>
        </div>
      </section>

      {/* Interactive 3-Step Flow Presentation */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Effortless Virtual Fitting in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
            Intuitive workflow designed for luxury fashion discovery without complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono font-bold text-sm">
              01
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">Select or Upload Portrait</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Choose from calibrated studio models or upload your personal portrait photo.
              </p>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-[#0B0D14] overflow-hidden border border-white/[0.06] p-2 flex items-center justify-center">
              <img src={SAMPLE_MODELS[0].image_url} alt="Model Preview" className="h-full object-cover rounded-xl" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono font-bold text-sm">
              02
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">Pick or Upload Garment</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Select from our curated wardrobe or upload your own shirts, dresses, hoodies, or traditional drapes.
              </p>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-[#0B0D14] overflow-hidden border border-white/[0.06] p-3 flex items-center justify-center">
              <img src={SAMPLE_GARMENTS[0].image_url} alt="Garment Preview" className="h-full object-contain" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 rounded-3xl border border-[#D4AF37]/30 space-y-4 shadow-glow-gold">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] text-[#0B0D14] flex items-center justify-center font-mono font-bold text-sm shadow">
              03
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">Generate & Compare</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Instant virtual try-on with interactive Before/After split slider, look saving, and HD export.
              </p>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#121622] to-[#0B0D14] overflow-hidden border border-white/[0.06] p-4 flex flex-col items-center justify-center text-center space-y-2">
              <SplitSquareVertical className="w-8 h-8 text-[#D4AF37]" />
              <span className="text-xs font-semibold text-white">Interactive Split View</span>
              <button
                onClick={() => quickTryOn(SAMPLE_GARMENTS[0], SAMPLE_MODELS[0].image_url)}
                className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#0B0D14] text-[10px] font-bold uppercase tracking-wider"
              >
                Launch Studio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Curated Garments */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Trending Apparel For Try-On
            </h2>
          </div>
          <button
            onClick={() => setActivePage('explore')}
            className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
          >
            View All Garments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {SAMPLE_GARMENTS.slice(0, 4).map((g) => (
            <div key={g.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between">
              <div className="relative aspect-square bg-[#0B0D14] p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={g.image_url}
                  alt={g.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#0B0D14]/80 backdrop-blur text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                  {g.category}
                </span>
              </div>
              <div className="p-4 bg-[#121622]/90 border-t border-white/[0.04] space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-white truncate">{g.name}</h4>
                  <p className="text-[10px] text-[#94A3B8]">{g.brand}</p>
                </div>
                <button
                  onClick={() => quickTryOn(g)}
                  className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-[#D4AF37] hover:text-[#0B0D14] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Try On Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="glass-panel-gold rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-luxury border border-[#D4AF37]/30">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white max-w-2xl mx-auto">
          Ready to experience the future of AI fashion fitting?
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto">
          No credit card or complex setup required. Start trying on luxury garments immediately.
        </p>
        <button
          onClick={() => setActivePage('studio')}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#B38F25] text-[#0B0D14] font-bold text-xs uppercase tracking-widest hover:opacity-95 shadow-glow-gold hover:scale-105 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Enter Try-On Studio
        </button>
      </section>
    </div>
  );
};
