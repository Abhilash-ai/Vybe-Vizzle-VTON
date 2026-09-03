import React, { createContext, useContext, useState } from 'react';
import { Garment, PersonModel, TryOnJob, TryOnOptions, GeneratedLook } from '../types';
import { SAMPLE_MODELS, SAMPLE_GARMENTS } from '../services/sampleData';
import { api } from '../services/api';

export type ActivePage =
  | 'evaluation'
  | 'landing'
  | 'studio'
  | 'result'
  | 'looks'
  | 'outfit-builder'
  | 'wardrobe'
  | 'explore'
  | 'benchmarks'
  | 'profile'
  | 'how-it-works';

interface TryOnContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedPersonImage: string;
  setSelectedPersonImage: (url: string) => void;
  selectedModel: PersonModel | null;
  setSelectedModel: (model: PersonModel | null) => void;
  selectedGarment: Garment | null;
  setSelectedGarment: (garment: Garment | null) => void;
  category: string;
  setCategory: (cat: string) => void;
  options: TryOnOptions;
  setOptions: React.Dispatch<React.SetStateAction<TryOnOptions>>;
  currentJob: TryOnJob | null;
  isGenerating: boolean;
  generationError: string | null;
  startTryOn: () => Promise<void>;
  resetStudio: () => void;
  quickTryOn: (garment: Garment, modelUrl?: string) => void;
}

const TryOnContext = createContext<TryOnContextType | undefined>(undefined);

export const TryOnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('evaluation');
  const [selectedPersonImage, setSelectedPersonImage] = useState<string>(SAMPLE_MODELS[0].image_url);
  const [selectedModel, setSelectedModel] = useState<PersonModel | null>(SAMPLE_MODELS[0]);
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(SAMPLE_GARMENTS[0]);
  const [category, setCategory] = useState<string>(SAMPLE_GARMENTS[0].category);

  const [options, setOptions] = useState<TryOnOptions>({
    preserve_face: true,
    preserve_background: true,
    garment_fit: 'regular',
    generation_quality: 'high'
  });

  const [currentJob, setCurrentJob] = useState<TryOnJob | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const startTryOn = async () => {
    if (!selectedPersonImage || !selectedGarment) {
      setGenerationError('Please select both a portrait and a garment before generating.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // 1. Submit try-on job to backend
      const job = await api.submitTryOnJob({
        person_image_url: selectedPersonImage,
        garment_image_url: selectedGarment.image_url,
        garment_category: category || selectedGarment.category,
        garment_name: selectedGarment.name,
        options
      });

      setCurrentJob(job);

      // 2. Poll job status
      const pollInterval = setInterval(async () => {
        try {
          const updated = await api.getTryOnJob(job.id);
          setCurrentJob(updated);

          if (updated.status === 'completed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setActivePage('result');
          } else if (updated.status === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setGenerationError(updated.error_message || 'Virtual try-on generation failed.');
          }
        } catch (e) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGenerationError('Error checking generation progress.');
        }
      }, 750);
    } catch (err: any) {
      setIsGenerating(false);
      setGenerationError(err.message || 'Failed to submit virtual try-on job.');
    }
  };

  const quickTryOn = (garment: Garment, modelUrl?: string) => {
    setSelectedGarment(garment);
    setCategory(garment.category);
    if (modelUrl) {
      setSelectedPersonImage(modelUrl);
    }
    setActivePage('studio');
  };

  const resetStudio = () => {
    setCurrentJob(null);
    setGenerationError(null);
    setIsGenerating(false);
  };

  return (
    <TryOnContext.Provider
      value={{
        activePage,
        setActivePage,
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
        quickTryOn
      }}
    >
      {children}
    </TryOnContext.Provider>
  );
};

export const useTryOn = () => {
  const context = useContext(TryOnContext);
  if (!context) throw new Error('useTryOn must be used within a TryOnProvider');
  return context;
};
