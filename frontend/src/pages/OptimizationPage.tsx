import React, { useEffect, useState } from 'react';

interface Finding {
  category: string;
  has_data: boolean;
  status_note?: string;
  baseline?: {
    experiment_id: string;
    generation_time_sec: number;
    cost_inr: number;
    overall?: number;
    result_image_url: string;
    notes?: string;
  } | null;
  optimized?: {
    experiment_id: string;
    generation_time_sec: number;
    cost_inr: number;
    overall?: number;
    result_image_url: string;
    technique?: string;
    notes?: string;
  } | null;
  accuracy_improvement_pct?: number | null;
}

export const OptimizationPage: React.FC = () => {
  const [data, setData] = useState<{ comparison: Finding[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOpt = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/eval/optimization-report', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOpt();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
          IDM-VTON Saree & Kurti Optimization Study
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Investigating and resolving out-of-the-box segmentation and drape failures on continuous ethnic silhouettes.
        </p>
      </div>

      {/* Problem & Solution Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2 shadow-sm">
          <span className="font-bold text-red-700 uppercase">
            Baseline Limitation (Out-of-the-Box)
          </span>
          <p className="text-gray-600 leading-relaxed text-[11px]">
            Standard IDM-VTON models segment upper body (torso) and lower body (legs) independently. Continuous fabrics like Saree pallus and long Kurtis get truncated at the waist/hip line, causing severe border tearing and hallucination artifacts.
          </p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2 shadow-sm">
          <span className="font-bold text-green-700 uppercase">
            Implemented Optimization Pipeline
          </span>
          <p className="text-gray-600 leading-relaxed text-[11px]">
            Integrated adaptive full-body semantic mask dilation with Gaussian edge-softening and neckline preservation, allowing continuous diagonal fabric flow across shoulders, waist, and floor-length hems.
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Empirical A/B Comparison (Baseline vs Optimized)
        </h2>

        {loading || !data ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Loading optimization data...
          </div>
        ) : (
          <div className="space-y-6">
            {data.comparison.map((item) => (
              <div key={item.category} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="font-bold text-gray-900 text-sm uppercase">
                    {item.category} Try-On
                  </span>

                  {item.accuracy_improvement_pct !== null && item.accuracy_improvement_pct !== undefined ? (
                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                      Delta: {item.accuracy_improvement_pct > 0 ? `+${item.accuracy_improvement_pct}%` : `${item.accuracy_improvement_pct}%`}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      Insufficient experimental data
                    </span>
                  )}
                </div>

                {item.has_data && item.baseline && item.optimized ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Baseline */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-red-700 uppercase">
                        Baseline Result
                      </span>
                      <div className="w-full aspect-[3/4] max-h-64 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
                        <img src={item.baseline.result_image_url} alt="Baseline" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                        <div>Measured Time: {item.baseline.generation_time_sec}s</div>
                        <div>Score: {item.baseline.overall !== null ? `${item.baseline.overall}/4.0` : 'Ungraded'}</div>
                      </div>
                    </div>

                    {/* Optimized */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-green-700 uppercase">
                        Optimized Result
                      </span>
                      <div className="w-full aspect-[3/4] max-h-64 bg-gray-100 border border-green-400 rounded overflow-hidden flex items-center justify-center">
                        <img src={item.optimized.result_image_url} alt="Optimized" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                        <div>Measured Time: {item.optimized.generation_time_sec}s</div>
                        <div>Score: {item.optimized.overall !== null ? `${item.optimized.overall}/4.0` : 'Ungraded'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded">
                    {item.status_note || 'Both IDM-VTON (Baseline) and IDM-VTON (Optimized) experiments are required in the TEST tab to compute empirical delta.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
