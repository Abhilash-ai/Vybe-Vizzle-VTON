import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp, Cpu, HelpCircle } from 'lucide-react';

interface OptimizationFinding {
  category: string;
  has_data: boolean;
  status_note?: string;
  baseline?: {
    experiment_id: string;
    generation_time_sec: number;
    cost_inr: number;
    fit?: number;
    drape?: number;
    overall?: number;
    is_evaluated: boolean;
    result_image_url: string;
    notes?: string;
  } | null;
  optimized?: {
    experiment_id: string;
    generation_time_sec: number;
    cost_inr: number;
    fit?: number;
    drape?: number;
    overall?: number;
    is_evaluated: boolean;
    result_image_url: string;
    technique?: string;
    notes?: string;
  } | null;
  accuracy_improvement_pct?: number | null;
  time_delta_sec?: number;
  cost_delta_inr?: number;
}

interface OptimizationData {
  title: string;
  assignment_note: string;
  comparison: OptimizationFinding[];
  has_complete_data: boolean;
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
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
          <Cpu className="w-4 h-4" /> Specific Model Requirement Study
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          3. IDM-VTON Saree, Kurti & Lehenga Optimization Study
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {data.assignment_note}
        </p>
      </div>

      {/* Diagnosis Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 bg-red-950/20 border border-red-800/50 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase">
            <AlertTriangle className="w-4 h-4" /> Root Cause of Baseline IDM-VTON Failure
          </div>
          <p className="text-gray-300 leading-relaxed text-[11px]">
            Standard bounding-box cropping strictly parses Western tops (torso) or bottoms (legs) independently. Continuous fabrics like Saree pallus and long Kurti slits get truncated at the hip line with severe boundary hallucination artifacts.
          </p>
        </div>

        <div className="p-4 bg-green-950/20 border border-green-800/50 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-green-400 font-bold uppercase">
            <CheckCircle2 className="w-4 h-4" /> Implemented Optimization Pipeline
          </div>
          <p className="text-gray-300 leading-relaxed text-[11px]">
            Dynamic continuous body-parsing mask expansion with multi-stage Gaussian dilation, preserving necklines while allowing natural fabric drape over the shoulder, waist, and floor-length hemline.
          </p>
        </div>
      </div>

      {/* Comparative Cards or Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {data.comparison.map((item) => (
          <div key={item.category} className="bg-[#0B0D14] border border-gray-800 rounded-xl p-4 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-xs uppercase">{item.category} Try-On Comparison</h3>
              {item.accuracy_improvement_pct !== null && item.accuracy_improvement_pct !== undefined ? (
                <span className="text-xs text-green-400 font-bold flex items-center gap-1 bg-green-950/40 px-2 py-0.5 rounded border border-green-800">
                  <TrendingUp className="w-3.5 h-3.5" /> {item.accuracy_improvement_pct > 0 ? `+${item.accuracy_improvement_pct}%` : `${item.accuracy_improvement_pct}%`}
                </span>
              ) : (
                <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded">
                  Insufficient Data
                </span>
              )}
            </div>

            {item.has_data && item.baseline && item.optimized ? (
              <>
                {/* Visual Before vs After */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-center">
                    <span className="text-[9px] uppercase font-bold text-red-400">Baseline (Out of box)</span>
                    <div className="aspect-[3/4] bg-gray-900 rounded overflow-hidden border border-red-900/60 relative">
                      <img src={item.baseline.result_image_url} alt="Baseline" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-red-900/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        {item.baseline.overall !== null ? `${item.baseline.overall}/4` : 'Ungraded'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[9px] uppercase font-bold text-green-400">Optimized Pipeline</span>
                    <div className="aspect-[3/4] bg-gray-900 rounded overflow-hidden border-2 border-green-500 relative">
                      <img src={item.optimized.result_image_url} alt="Optimized" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-green-800 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        {item.optimized.overall !== null ? `${item.optimized.overall}/4` : 'Ungraded'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantitative Comparison Table */}
                <div className="text-[11px] space-y-1 bg-[#12151E] p-2.5 rounded border border-gray-800">
                  <div className="flex justify-between text-gray-400">
                    <span>Measured Latency:</span>
                    <span>{item.baseline.generation_time_sec}s → <strong className="text-white">{item.optimized.generation_time_sec}s</strong></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Overall Score:</span>
                    <span>
                      {item.baseline.overall !== null ? item.baseline.overall : 'N/A'} →{' '}
                      <strong className="text-green-400">{item.optimized.overall !== null ? item.optimized.overall : 'N/A'}</strong>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-gray-500 space-y-2">
                <HelpCircle className="w-5 h-5 mx-auto text-gray-600" />
                <p className="text-[10px] text-gray-400 uppercase">
                  {item.status_note || 'Both Baseline and Optimized tests required'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
