import React, { useState } from 'react';
import { Sparkles, Tag, ArrowUpRight, Filter, Info } from 'lucide-react';
import { SAMPLE_GARMENTS, CATEGORIES } from '../../services/sampleData';
import { Garment } from '../../types';
import { useTryOn } from '../../context/TryOnContext';

export const ExploreCatalog: React.FC = () => {
  const { quickTryOn } = useTryOn();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? SAMPLE_GARMENTS
    : SAMPLE_GARMENTS.filter((g) => g.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Editorial Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-gold border border-[#D4AF37]/30 p-8 sm:p-12 text-center sm:text-left shadow-luxury">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Editorial Lookbook
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Explore Haute Tech Couture
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Discover precision-tailored virtual garments engineered for neural latent diffusion. Test instant virtual try-on on our studio models.
          </p>
        </div>
      </div>

      {/* Honest Labeling Notice */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#94A3B8] flex items-center gap-2">
        <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />
        <span>
          All apparel items displayed below are studio sample concepts provided for virtual try-on demonstration.
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-[#D4AF37] text-[#0B0D14] font-bold shadow-glow-gold'
                : 'bg-[#121622] text-[#94A3B8] border border-white/[0.06] hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Editorial Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-3xl overflow-hidden group flex flex-col justify-between border border-white/[0.08]"
          >
            <div className="relative aspect-[4/5] bg-[#0B0D14] p-6 flex items-center justify-center overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#0B0D14]/80 backdrop-blur text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 backdrop-blur text-white font-medium">
                  {item.brand || 'AM Atelier'}
                </span>
              </div>
            </div>

            <div className="p-6 bg-[#121622]/90 border-t border-white/[0.04] space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-xs font-mono text-[#D4AF37]">{item.color}</span>
                <button
                  onClick={() => quickTryOn(item)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95 shadow-glow-gold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Try On Look
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
