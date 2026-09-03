import React, { useEffect, useState } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, Cpu } from 'lucide-react';

interface OptimizationData {
  title: string;
  problem_statement: string;
  solution_applied: string;
  findings: Array<{
    category: string;
    baseline: {
      fit: number;
      drape: number;
      overall: number;
      meets_accuracy: boolean;
      result_image_url: string;
      notes: string;
    };
    optimized: {
      fit: number;
      drape: number;
      overall: number;
      meets_accuracy: boolean;
      result_image_url: string;
      notes: string;
      technique: string;
    };
    accuracy_improvement_pct: number;
  }>;
}

export const OptimizationStudy: React.FC = () => {
  const [data, setData] = useState<OptimizationData | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/eval/optimization-report')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-6 space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Cpu className="w-4 h-4" /> Specific Model Requirement Study
        </div>
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">
          3. IDM-VTON Saree, Kurti & Lehenga Optimization Analysis
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Evaluation and resolution of IDM-VTON's documented failure mode on ethnic drape garments.
        </p>
      </div>

      {/* Diagnosis Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 bg-red-950/20 border border-red-800/50 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase">
            <AlertTriangle className="w-4 h-4" /> Root Cause of Baseline IDM-VTON Failure
          </div>
          <p className="text-gray-300 leading-relaxed text-[11px]">
            {data.problem_statement} Standard bounding-box cropping strictly parses Western tops (torso) or bottoms (legs) independently. Continuous continuous fabrics like Saree pallus and long Kurti slits get truncated at the hip line with severe boundary hallucination artifacts.
          </p>
        </div>

        <div className="p-4 bg-green-950/20 border border-green-800/50 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-green-400 font-bold uppercase">
            <CheckCircle2 className="w-4 h-4" /> Implemented Optimization Pipeline
          </div>
          <p className="text-gray-300 leading-relaxed text-[11px]">
            {data.solution_applied} Dynamic continuous body-parsing mask expansion with 18% multi-stage Gaussian dilation, preserving necklines while allowing natural fabric drape over the shoulder, waist, and floor-length hemline.
          </p>
        </div>
      </div>

      {/* Comparative Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {data.findings.map((item) => (
          <div key={item.category} className="bg-[#0B0D14] border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-sm uppercase">{item.category} Try-On Comparison</h3>
              <span className="text-xs font-mono text-green-400 font-bold flex items-center gap-1 bg-green-950/40 px-2 py-0.5 rounded border border-green-800">
                <TrendingUp className="w-3.5 h-3.5" /> +{item.accuracy_improvement_pct}%
              </span>
            </div>

            {/* Visual Before vs After */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold text-red-400">Baseline (Out of box)</span>
                <div className="aspect-[3/4] bg-gray-900 rounded overflow-hidden border border-red-900/60 relative">
                  <img src={item.baseline.result_image_url} alt="Baseline" className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-red-900/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                    {item.baseline.overall} / 4.0
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold text-green-400">Optimized Pipeline</span>
                <div className="aspect-[3/4] bg-gray-900 rounded overflow-hidden border-2 border-green-500 relative">
                  <img src={item.optimized.result_image_url} alt="Optimized" className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-green-800 text-white text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                    {item.optimized.overall} / 4.0
                  </div>
                </div>
              </div>
            </div>

            {/* Quantitative Comparison Table */}
            <div className="text-[11px] font-mono space-y-1 bg-[#12151E] p-2.5 rounded border border-gray-800">
              <div className="flex justify-between text-gray-400">
                <span>Garment Fit Score:</span>
                <span>{item.baseline.fit} → <strong className="text-green-400">{item.optimized.fit}</strong></span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Drape & Fall Score:</span>
                <span>{item.baseline.drape} → <strong className="text-green-400">{item.optimized.drape}</strong></span>
              </div>
              <div className="flex justify-between text-gray-400 border-t border-gray-800 pt-1">
                <span>Overall Quality:</span>
                <span>{item.baseline.overall} → <strong className="text-green-400">{item.optimized.overall}</strong></span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-snug">
              <strong className="text-gray-300">Engineering Note:</strong> {item.optimized.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
