import React from 'react';
import { Sparkles, Layers, ArrowLeft, RotateCcw } from 'lucide-react';
import { useTryOn } from '../context/TryOnContext';
import { PersonSelector } from '../components/studio/PersonSelector';
import { GarmentSelector } from '../components/studio/GarmentSelector';
import { StudioControls } from '../components/studio/StudioControls';
import { GenerationProgress } from '../components/studio/GenerationProgress';

export const StudioPage: React.FC = () => {
  const {
    selectedPersonImage,
    setSelectedPersonImage,
    selectedModel,
    setSelectedModel,
    selectedGarment,
    setSelectedGarment,
    category,
    setCategory,
    options,
    setOptions,
    currentJob,
    isGenerating,
    generationError,
    startTryOn,
    resetStudio,
    setActivePage
  } = useTryOn();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 tracking-widest uppercase">
              Workspace
            </span>
            <span className="text-xs text-[#94A3B8]">· AM Studio Inference Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Try-On Studio</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Select portrait and garment to generate a photorealistic virtual try-on
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white rounded-lg border border-white/[0.08] hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <button
            onClick={resetStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white rounded-lg border border-white/[0.08] hover:border-white/20 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Main Studio 3-Panel Layout */}
      {isGenerating ? (
        /* Generation Processing View */
        <div className="py-12">
          <GenerationProgress
            job={currentJob}
            personImageUrl={selectedPersonImage}
            garmentImageUrl={selectedGarment?.image_url || ''}
            garmentName={selectedGarment?.name}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Person / Model Selector (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <PersonSelector
              selectedPersonImage={selectedPersonImage}
              onSelectPersonImage={setSelectedPersonImage}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>

          {/* Right Column: Garment Selector & Category (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <GarmentSelector
              selectedGarment={selectedGarment}
              onSelectGarment={setSelectedGarment}
              selectedCategory={category}
              onSelectCategory={setCategory}
            />
          </div>

          {/* Controls & Generation Panel (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <StudioControls
              selectedPersonImage={selectedPersonImage}
              selectedModel={selectedModel}
              selectedGarment={selectedGarment}
              category={category}
              options={options}
              setOptions={setOptions}
              isGenerating={isGenerating}
              onGenerate={startTryOn}
              onReset={resetStudio}
              error={generationError}
            />
          </div>
        </div>
      )}
    </div>
  );
};
