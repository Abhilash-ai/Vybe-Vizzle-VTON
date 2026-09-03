import React from 'react';
import { WardrobeGrid } from '../components/wardrobe/WardrobeGrid';

export const WardrobePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <WardrobeGrid />
    </div>
  );
};
