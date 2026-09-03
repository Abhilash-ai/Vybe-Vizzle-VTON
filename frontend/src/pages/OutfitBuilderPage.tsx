import React from 'react';
import { OutfitBuilder } from '../components/outfit/OutfitBuilder';

export const OutfitBuilderPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <OutfitBuilder />
    </div>
  );
};
