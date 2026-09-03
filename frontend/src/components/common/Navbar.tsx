import React, { useState } from 'react';
import { Sparkles, Layers, Shirt, Heart, Grid, Cpu, User, HelpCircle, Menu, X, Shield } from 'lucide-react';
import { useTryOn, ActivePage } from '../../context/TryOnContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { activePage, setActivePage } = useTryOn();
  const { user, isGuest } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'studio', label: 'Try-On Studio', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'wardrobe', label: 'Wardrobe', icon: <Shirt className="w-4 h-4" /> },
    { id: 'outfit-builder', label: 'Outfit Builder', icon: <Layers className="w-4 h-4" /> },
    { id: 'looks', label: 'My Looks', icon: <Heart className="w-4 h-4" /> },
    { id: 'explore', label: 'Explore', icon: <Grid className="w-4 h-4" /> },
    { id: 'benchmarks', label: 'Benchmarks', icon: <Cpu className="w-4 h-4" /> },
    { id: 'how-it-works', label: 'How It Works', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.06] bg-[#0B0D14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#8C7426] to-[#121622] p-[1px] shadow-glow-gold">
            <div className="w-full h-full bg-[#0B0D14] rounded-[11px] flex items-center justify-center">
              <span className="font-serif font-bold text-lg text-[#D4AF37] group-hover:scale-110 transition-transform">
                V
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xl tracking-wider text-white">
                VIZZLE
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 tracking-widest">
                VTON
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] font-medium tracking-widest uppercase">
              By AM Studio
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121622] border border-white/[0.08] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[#94A3B8]">Offline Harmonization</span>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => handleNavClick('profile')}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
              activePage === 'profile'
                ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]'
                : 'bg-[#121622] border-white/[0.08] text-[#94A3B8] hover:text-white hover:border-white/20'
            }`}
            title="Profile & Privacy Settings"
          >
            <User className="w-4 h-4" />
          </button>

          {/* CTA Studio Button */}
          {activePage !== 'studio' && (
            <button
              onClick={() => handleNavClick('studio')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] font-semibold text-xs tracking-wider uppercase hover:opacity-95 shadow-glow-gold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Launch Studio
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => handleNavClick('profile')}
            className="p-2 rounded-lg bg-[#121622] border border-white/[0.08] text-[#94A3B8]"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#121622] border border-white/[0.08] text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-white/[0.08] px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activePage === item.id
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('studio')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] font-semibold text-sm uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              Launch Try-On Studio
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
