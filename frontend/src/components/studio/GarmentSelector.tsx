import React, { useState, useEffect } from 'react';
import { Shirt, Plus, Check, Filter, Upload, Sparkles } from 'lucide-react';
import { Garment, CategoryInfo } from '../../types';
import { CATEGORIES, SAMPLE_GARMENTS } from '../../services/sampleData';
import { api } from '../../services/api';
import { ImageUploader } from '../common/ImageUploader';

interface GarmentSelectorProps {
  selectedGarment: Garment | null;
  onSelectGarment: (garment: Garment) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const GarmentSelector: React.FC<GarmentSelectorProps> = ({
  selectedGarment,
  onSelectGarment,
  selectedCategory,
  onSelectCategory
}) => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'upload'>('wardrobe');
  const [garments, setGarments] = useState<Garment[]>(SAMPLE_GARMENTS);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Upload form state
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('t-shirt');
  const [uploadColor, setUploadColor] = useState('');

  const fetchGarments = async () => {
    try {
      setIsLoading(true);
      const data = await api.listGarments(filterCategory);
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
    fetchGarments();
  }, [filterCategory]);

  const filteredGarments = filterCategory === 'all'
    ? garments
    : garments.filter((g) => g.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Shirt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">2. Clothing & Garment</h3>
            <p className="text-[11px] text-[#94A3B8]">Pick from curated wardrobe or upload custom apparel</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#0B0D14] border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'wardrobe'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'upload'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Upload Item
          </button>
        </div>
      </div>

      {activeTab === 'wardrobe' ? (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setFilterCategory(cat.id);
                  if (cat.id !== 'all') onSelectCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filterCategory === cat.id
                    ? 'bg-[#D4AF37] text-[#0B0D14] font-semibold shadow-glow-gold'
                    : 'bg-[#121622] text-[#94A3B8] border border-white/[0.06] hover:text-white hover:border-white/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Garment Grid */}
          <div className="grid grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
            {filteredGarments.map((g) => {
              const isSelected = selectedGarment?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => {
                    onSelectGarment(g);
                    onSelectCategory(g.category);
                  }}
                  className={`group relative cursor-pointer rounded-xl overflow-hidden border transition-all ${
                    isSelected
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-glow-gold'
                      : 'border-white/[0.08] hover:border-white/25 bg-[#121622]'
                  }`}
                >
                  <div className="aspect-square bg-[#0B0D14] flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={g.image_url}
                      alt={g.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0B0D14] flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="p-2 bg-[#121622]/90 border-t border-white/[0.04]">
                    <p className="text-[11px] font-medium text-white truncate">{g.name}</p>
                    <p className="text-[9px] text-[#94A3B8] uppercase tracking-wider truncate">{g.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Item Name</label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g. Vintage Silk Blazer"
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ImageUploader
            label="Upload Garment Image"
            sublabel="Transparent PNG or flat-lay on clean background"
            aspectRatio="square"
            onImageUploaded={(url) => {
              const newGarm: Garment = {
                id: `custom_${Date.now()}`,
                name: uploadName || 'Custom Uploaded Garment',
                category: uploadCategory,
                image_url: url,
                color: uploadColor || 'Custom',
                is_sample: false
              };
              setGarments((prev) => [newGarm, ...prev]);
              onSelectGarment(newGarm);
              onSelectCategory(uploadCategory);
              setActiveTab('wardrobe');
            }}
            uploadHandler={async (file) => {
              const res = await api.uploadGarment(file, uploadName, uploadCategory, uploadColor);
              return { url: res.image_url };
            }}
          />
        </div>
      )}
    </div>
  );
};
