import React, { useState, useEffect } from 'react';
import { Shirt, Plus, Trash2, Sparkles, Search, Filter } from 'lucide-react';
import { Garment } from '../../types';
import { CATEGORIES, SAMPLE_GARMENTS } from '../../services/sampleData';
import { api } from '../../services/api';
import { useTryOn } from '../../context/TryOnContext';
import { ImageUploader } from '../common/ImageUploader';

export const WardrobeGrid: React.FC = () => {
  const { quickTryOn } = useTryOn();
  const [garments, setGarments] = useState<Garment[]>(SAMPLE_GARMENTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState('shirt');
  const [newItemColor, setNewItemColor] = useState('');

  const loadWardrobe = async () => {
    try {
      setIsLoading(true);
      const data = await api.listGarments(activeCategory);
      if (data && data.length > 0) {
        setGarments(data);
      } else {
        setGarments(SAMPLE_GARMENTS);
      }
    } catch (e) {
      setGarments(SAMPLE_GARMENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWardrobe();
  }, [activeCategory]);

  const handleDeleteGarment = async (id: string) => {
    try {
      await api.deleteGarment(id);
      setGarments((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      setGarments((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const filtered = garments.filter((g) => {
    const matchesCat = activeCategory === 'all' || g.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || (g.brand && g.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Digital Wardrobe</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage your personal clothing collection and curated sample garments
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] font-semibold text-xs uppercase tracking-wider hover:opacity-95 shadow-glow-gold transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Garment
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#D4AF37] text-[#0B0D14] font-semibold shadow-glow-gold'
                  : 'bg-[#121622] text-[#94A3B8] border border-white/[0.06] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apparel..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#121622] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-white/[0.08] space-y-3">
          <Shirt className="w-12 h-12 text-[#64748B] mx-auto" />
          <h3 className="text-base font-semibold text-white">No garments found</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Try adjusting your search or category filter, or upload a new garment to your wardrobe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((garment) => (
            <div key={garment.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between">
              <div className="relative aspect-square bg-[#0B0D14] p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={garment.image_url}
                  alt={garment.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#0B0D14]/80 backdrop-blur text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                    {garment.category}
                  </span>
                </div>
                {!garment.is_sample && (
                  <button
                    onClick={() => handleDeleteGarment(garment.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#0B0D14]/80 backdrop-blur text-[#94A3B8] hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-4 bg-[#121622]/90 border-t border-white/[0.04] space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-white truncate">{garment.name}</h4>
                  <p className="text-[10px] text-[#94A3B8] truncate">{garment.brand || garment.color || 'Custom Item'}</p>
                </div>

                <button
                  onClick={() => quickTryOn(garment)}
                  className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-[#D4AF37] hover:text-[#0B0D14] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Try On Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Garment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-gold rounded-3xl p-6 max-w-md w-full border border-[#D4AF37]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-serif font-bold text-white">Add Apparel to Wardrobe</h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-[#94A3B8] hover:text-white">
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Item Title</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Midnight Wool Coat"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Category</label>
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Color / Tone</label>
                  <input
                    type="text"
                    value={newItemColor}
                    onChange={(e) => setNewItemColor(e.target.value)}
                    placeholder="e.g. Emerald"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <ImageUploader
                label="Garment Photo"
                sublabel="Flat-lay or ghost mannequin recommended"
                aspectRatio="square"
                onImageUploaded={(url) => {
                  const g: Garment = {
                    id: `custom_${Date.now()}`,
                    name: newItemName || 'New Garment',
                    category: newItemCat,
                    color: newItemColor,
                    image_url: url,
                    is_sample: false
                  };
                  setGarments((prev) => [g, ...prev]);
                  setShowAddModal(false);
                }}
                uploadHandler={async (file) => {
                  const res = await api.uploadGarment(file, newItemName, newItemCat, newItemColor);
                  return { url: res.image_url };
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
