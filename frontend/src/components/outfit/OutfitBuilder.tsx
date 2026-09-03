import React, { useState } from 'react';
import { Layers, Plus, Sparkles, AlertCircle, Trash2, Check, ArrowRight } from 'lucide-react';
import { Garment, Outfit } from '../../types';
import { SAMPLE_GARMENTS } from '../../services/sampleData';
import { useTryOn } from '../../context/TryOnContext';
import { api } from '../../services/api';

export const OutfitBuilder: React.FC = () => {
  const { quickTryOn, setActivePage } = useTryOn();
  const [outfitTitle, setOutfitTitle] = useState('Autumn Editorial Look');
  const [selectedTop, setSelectedTop] = useState<Garment | null>(SAMPLE_GARMENTS[0]);
  const [selectedBottom, setSelectedBottom] = useState<Garment | null>(SAMPLE_GARMENTS[7]);
  const [selectedOuterwear, setSelectedOuterwear] = useState<Garment | null>(SAMPLE_GARMENTS[2]);
  const [selectedAccessory, setSelectedAccessory] = useState<Garment | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  const slots = [
    {
      title: 'Top / Shirt / Tee',
      type: 'top',
      garment: selectedTop,
      setGarment: setSelectedTop,
      candidates: SAMPLE_GARMENTS.filter((g) => ['shirt', 't-shirt', 'hoodie', 'kurta'].includes(g.category))
    },
    {
      title: 'Outerwear / Jacket',
      type: 'outerwear',
      garment: selectedOuterwear,
      setGarment: setSelectedOuterwear,
      candidates: SAMPLE_GARMENTS.filter((g) => g.category === 'jacket')
    },
    {
      title: 'Bottom / Trousers',
      type: 'bottom',
      garment: selectedBottom,
      setGarment: setSelectedBottom,
      candidates: SAMPLE_GARMENTS.filter((g) => ['pants', 'skirt'].includes(g.category))
    },
    {
      title: 'Dress / Traditional Drape',
      type: 'full_body',
      garment: selectedAccessory,
      setGarment: setSelectedAccessory,
      candidates: SAMPLE_GARMENTS.filter((g) => ['dress', 'saree'].includes(g.category))
    }
  ];

  const handleSaveOutfit = async () => {
    const garmentIds: string[] = [];
    if (selectedTop) garmentIds.push(selectedTop.id);
    if (selectedBottom) garmentIds.push(selectedBottom.id);
    if (selectedOuterwear) garmentIds.push(selectedOuterwear.id);
    if (selectedAccessory) garmentIds.push(selectedAccessory.id);

    try {
      await api.createOutfit({
        title: outfitTitle,
        description: 'Multi-garment editorial style board',
        garment_ids: garmentIds,
        preview_image_url: selectedTop?.image_url
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 tracking-widest uppercase">
              Style Board
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Outfit Builder</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Coordinate multi-piece ensembles across tops, outerwear, trousers, and ethnic drapes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={outfitTitle}
            onChange={(e) => setOutfitTitle(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#121622] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
            placeholder="Outfit Name"
          />
          <button
            onClick={handleSaveOutfit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] font-semibold text-xs uppercase tracking-wider hover:opacity-95 shadow-glow-gold transition-all shrink-0"
          >
            {isSaved ? 'Outfit Saved!' : 'Save Outfit'}
          </button>
        </div>
      </div>

      {/* Honest Multi-Garment Synthesis Notice */}
      <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#F3E5AB] flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">Neural Multi-Garment Synthesis Status: Experimental</p>
          <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
            Most open-source diffusion models (IDM-VTON, CatVTON) specialize in single upper/lower body inpainting at one time. Sequential multi-garment composition is available as an experimental pipeline or piece-by-piece try-on.
          </p>
        </div>
      </div>

      {/* Outfit Slots Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slot, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">{slot.title}</span>
                {slot.garment && (
                  <button
                    onClick={() => slot.setGarment(null)}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Active Slot Preview */}
              <div className="aspect-square bg-[#0B0D14] rounded-xl border border-white/[0.08] p-3 flex items-center justify-center relative group overflow-hidden">
                {slot.garment ? (
                  <>
                    <img
                      src={slot.garment.image_url}
                      alt={slot.garment.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <p className="text-[11px] font-semibold text-white text-center">{slot.garment.name}</p>
                      <button
                        onClick={() => quickTryOn(slot.garment!)}
                        className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#0B0D14] text-[10px] font-bold uppercase tracking-wider"
                      >
                        Try On Piece
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-[#64748B] space-y-1">
                    <Layers className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-[11px]">Select {slot.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Picker Carousel */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] block">Available Options</span>
              <div className="grid grid-cols-3 gap-1.5">
                {slot.candidates.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => slot.setGarment(c)}
                    className={`aspect-square p-1 rounded-lg border bg-[#0B0D14] transition-all overflow-hidden ${
                      slot.garment?.id === c.id
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                        : 'border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
