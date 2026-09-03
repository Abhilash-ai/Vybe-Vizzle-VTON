import React from 'react';
import { BenchmarkHub } from '../components/benchmark/BenchmarkHub';

export const BenchmarkPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BenchmarkHub />
    </div>
  );
};
