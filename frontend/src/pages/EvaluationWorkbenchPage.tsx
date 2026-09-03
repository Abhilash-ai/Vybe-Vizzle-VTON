import React, { useState } from 'react';
import { EvaluationRunner } from '../components/evaluation/EvaluationRunner';
import { BenchmarkMatrix } from '../components/evaluation/BenchmarkMatrix';
import { OptimizationStudy } from '../components/evaluation/OptimizationStudy';
import { DatasetManifestViewer } from '../components/evaluation/DatasetManifestViewer';
import { ShieldCheck, Cpu, Clock, DollarSign, Award, ArrowDown, FileText } from 'lucide-react';

export const EvaluationWorkbenchPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleExperimentSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] text-gray-100 font-sans p-4 sm:p-8 space-y-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" /> VIZZLE · Virtual Try-On Model Evaluation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Production VTON Model Evaluation Workbench
            </h1>
            <p className="text-xs text-gray-400 max-w-3xl mt-1">
              Objective: Empirically identify the best-performing virtual try-on model for e-commerce production based on Accuracy across 10 clothing categories, Speed (&lt;15s), and Unit Cost (&lt;₹4.00/gen).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-green-950/40 text-green-300 border border-green-800 text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Empirical Testing Mode Active
            </span>
          </div>
        </div>

        {/* Hard Requirements Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#12151E] border border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-950/60 text-blue-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase">Hard Constraint 1: Speed</span>
              <p className="font-bold text-white">&lt; 15.0 Seconds / Image</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#12151E] border border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-950/60 text-green-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase">Hard Constraint 2: Unit Cost</span>
              <p className="font-bold text-white">&lt; ₹4.00 INR / Generation</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#12151E] border border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-950/60 text-purple-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase">Hard Constraint 3: Accuracy</span>
              <p className="font-bold text-white">10 Categories Mandated (Saree, Kurti...)</p>
            </div>
          </div>
        </div>

        {/* Section 1: Live Evaluation Runner */}
        <EvaluationRunner onExperimentSaved={handleExperimentSaved} />

        {/* Section 2: 10-Category Benchmark Matrix & Summary Rankings */}
        <BenchmarkMatrix key={refreshKey} />

        {/* Section 3: IDM-VTON Saree & Kurti Optimization Deep Dive */}
        <OptimizationStudy />

        {/* Section 4: Standardized Dataset Manifest */}
        <DatasetManifestViewer />

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 py-6 border-t border-gray-800 font-mono">
          Vizzle AI Virtual Try-On Evaluation System · Standardized 10-Category Benchmark Suite · All costs calculated in INR
        </div>
      </div>
    </div>
  );
};
