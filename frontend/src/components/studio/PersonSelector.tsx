import React, { useState } from 'react';
import { User, Upload, Sparkles, Check } from 'lucide-react';
import { SAMPLE_MODELS } from '../../services/sampleData';
import { PersonModel } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { api } from '../../services/api';

interface PersonSelectorProps {
  selectedPersonImage: string;
  onSelectPersonImage: (url: string) => void;
  selectedModel: PersonModel | null;
  onSelectModel: (model: PersonModel | null) => void;
}

export const PersonSelector: React.FC<PersonSelectorProps> = ({
  selectedPersonImage,
  onSelectPersonImage,
  selectedModel,
  onSelectModel
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">1. Model / Portrait</h3>
            <p className="text-[11px] text-[#94A3B8]">Choose a studio model or upload your photo</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#0B0D14] border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'presets'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Studio Models
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'upload'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Upload Photo
          </button>
        </div>
      </div>

      {activeTab === 'presets' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_MODELS.map((m) => {
              const isSelected = selectedPersonImage === m.image_url;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectPersonImage(m.image_url);
                    onSelectModel(m);
                  }}
                  className={`group relative cursor-pointer rounded-xl overflow-hidden border transition-all ${
                    isSelected
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-glow-gold'
                      : 'border-white/[0.08] hover:border-white/25 bg-[#121622]'
                  }`}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#0B0D14]">
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#D4AF37] text-[#0B0D14] flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="p-2.5 bg-[#121622]/90 backdrop-blur-sm">
                    <p className="text-xs font-medium text-white truncate">{m.name.split('—')[0]}</p>
                    <p className="text-[10px] text-[#94A3B8] truncate">{m.name.split('—')[1] || m.gender}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[#64748B] italic">
            Tip: Studio models have calibrated neutral poses for optimal virtual try-on alignment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <ImageUploader
            label="Upload Full-Body or Torso Portrait"
            sublabel="Clear lighting, neutral standing pose recommended"
            currentImageUrl={selectedModel ? undefined : selectedPersonImage}
            onImageUploaded={(url) => {
              onSelectPersonImage(url);
              onSelectModel(null);
            }}
            uploadHandler={async (file) => {
              const res = await api.uploadPersonImage(file);
              return { url: res.url };
            }}
          />
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-[#94A3B8] space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Portrait Best Practices
            </p>
            <p>• Stand facing the camera with arms slightly away from the torso.</p>
            <p>• Avoid cluttered backgrounds or heavily occluded garments.</p>
          </div>
        </div>
      )}
    </div>
  );
};
