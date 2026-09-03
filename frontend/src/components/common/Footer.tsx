import React from 'react';
import { ShieldCheck, Cpu, Sparkles, Heart } from 'lucide-react';
import { useTryOn } from '../../context/TryOnContext';

export const Footer: React.FC = () => {
  const { setActivePage } = useTryOn();

  return (
    <footer className="border-t border-white/[0.08] bg-[#07090F] text-[#94A3B8] text-xs mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-white">VIZZLE</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                VTON
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Original AI-powered virtual fashion platform architected by <strong>AM Studio</strong>.
              Delivering high-fidelity virtual try-on, modular diffusion pipelines, and garment harmonization.
            </p>
            <p className="text-[11px] text-[#D4AF37] font-medium">
              &copy; {new Date().getFullYear()} AM Studio. All rights reserved.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActivePage('studio')} className="hover:text-[#D4AF37] transition-colors">
                  Try-On Studio
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('wardrobe')} className="hover:text-[#D4AF37] transition-colors">
                  My Wardrobe
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('outfit-builder')} className="hover:text-[#D4AF37] transition-colors">
                  Outfit Builder
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('looks')} className="hover:text-[#D4AF37] transition-colors">
                  Curated Looks
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('explore')} className="hover:text-[#D4AF37] transition-colors">
                  Explore Catalog
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & AI */}
          <div className="space-y-2">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">AI Architecture</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActivePage('benchmarks')} className="hover:text-[#D4AF37] transition-colors">
                  Model Benchmarking Hub
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('how-it-works')} className="hover:text-[#D4AF37] transition-colors">
                  VTON Pipeline Architecture
                </button>
              </li>
              <li className="text-[11px] text-[#64748B]">
                Supported: CatVTON, IDM-VTON, OOTDiffusion, FASHN API
              </li>
            </ul>
          </div>

          {/* Col 4: Privacy & Ethics */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Privacy & Trust</h4>
            <div className="flex items-start gap-2 text-xs text-[#94A3B8]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Zero permanent biometric storage. All uploaded portraits can be wiped with 1-click in Profile Settings.</span>
            </div>
            <button
              onClick={() => setActivePage('profile')}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
            >
              Manage Data & Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
