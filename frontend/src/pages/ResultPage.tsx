import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useTryOn } from '../context/TryOnContext';
import { ResultViewer } from '../components/result/ResultViewer';

export const ResultPage: React.FC = () => {
  const {
    currentJob,
    selectedPersonImage,
    selectedGarment,
    selectedModel,
    setActivePage
  } = useTryOn();

  if (!currentJob) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-[#64748B] mx-auto" />
        <h2 className="text-xl font-serif font-bold text-white">No Try-On Result Active</h2>
        <p className="text-xs text-[#94A3B8]">
          Head to the Try-On Studio to select an apparel item and generate a fresh look.
        </p>
        <button
          onClick={() => setActivePage('studio')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F25] text-[#0B0D14] font-semibold text-xs uppercase tracking-wider"
        >
          Open Try-On Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ResultViewer
        job={currentJob}
        personImageUrl={selectedPersonImage}
        garmentImageUrl={selectedGarment?.image_url || ''}
        garment={selectedGarment}
        selectedModel={selectedModel}
      />
    </div>
  );
};
