import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Filter, Trash2, ArrowRight } from 'lucide-react';
import { GeneratedLook } from '../types';
import { api } from '../services/api';
import { LookCard } from '../components/looks/LookCard';
import { useTryOn } from '../context/TryOnContext';

export const LooksPage: React.FC = () => {
  const { setActivePage } = useTryOn();
  const [looks, setLooks] = useState<GeneratedLook[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLooks = async () => {
    try {
      setIsLoading(true);
      const data = await api.listLooks(favoriteOnly);
      setLooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLooks();
  }, [favoriteOnly]);

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.toggleFavoriteLook(id);
      setLooks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_favorite: !l.is_favorite } : l))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLook = async (id: string) => {
    try {
      await api.deleteLook(id);
      setLooks((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 tracking-widest uppercase">
              Curated Wardrobe
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">My Saved Looks</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Your personal lookbook of AI-synthesized virtual try-on outfits
          </p>
        </div>

        {/* Favorite Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              favoriteOnly
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-[#121622] border-white/[0.08] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-rose-500' : ''}`} />
            {favoriteOnly ? 'Favorites Only' : 'All Looks'}
          </button>
        </div>
      </div>

      {/* Looks Grid */}
      {looks.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-white/[0.08] space-y-4 max-w-lg mx-auto">
          <Heart className="w-12 h-12 text-[#64748B] mx-auto" />
          <h3 className="text-lg font-serif font-bold text-white">No saved looks yet</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Generate virtual try-on outfits in the Try-On Studio and click "Save Look" to curate your digital portfolio.
          </p>
          <button
            onClick={() => setActivePage('studio')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] font-semibold text-xs uppercase tracking-wider shadow-glow-gold hover:opacity-95"
          >
            Launch Try-On Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {looks.map((look) => (
            <LookCard
              key={look.id}
              look={look}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteLook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
