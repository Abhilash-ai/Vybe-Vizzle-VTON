import React from 'react';
import { Heart, Trash2, Sparkles, Download, Calendar } from 'lucide-react';
import { GeneratedLook } from '../../types';

interface LookCardProps {
  look: GeneratedLook;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenInStudio?: (look: GeneratedLook) => void;
}

export const LookCard: React.FC<LookCardProps> = ({
  look,
  onToggleFavorite,
  onDelete,
  onOpenInStudio
}) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between">
      <div className="relative aspect-[3/4] bg-[#0B0D14] overflow-hidden">
        <img
          src={look.result_image_url}
          alt={look.title || 'Curated Look'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#0B0D14]/80 backdrop-blur text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
            {look.garment_category || 'Style'}
          </span>
          <button
            onClick={() => onToggleFavorite(look.id)}
            className="p-1.5 rounded-full bg-[#0B0D14]/80 backdrop-blur text-white hover:text-rose-400 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${look.is_favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Hover Action Drawer */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
          <a
            href={look.result_image_url}
            download={`Vizzle_Look_${look.id}.jpg`}
            className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center justify-center gap-1.5 backdrop-blur transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download HD
          </a>
          <button
            onClick={() => onDelete(look.id)}
            className="w-full py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Look
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#121622]/90 border-t border-white/[0.04] space-y-1">
        <h4 className="text-xs font-semibold text-white truncate">{look.title || look.garment_name}</h4>
        <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
          <span className="truncate">{look.garment_name || 'Virtual Try-On'}</span>
          <span className="font-mono text-[#64748B]">
            {new Date(look.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};
