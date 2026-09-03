import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import type { BenchmarkMatrixResponse } from '../../types';

export const BenchmarkMatrix: React.FC = () => {
  const [data, setData] = useState<BenchmarkMatrixResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/eval/matrix');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleExportCSV = () => {
    window.location.href = 'http://localhost:8000/api/v1/eval/export-csv';
  };

  if (loading || !data) {
    return (
      <div className="bg-[#12151E] border border-gray-800 rounded-xl p-8 text-center text-gray-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
        <p className="text-xs uppercase font-mono">Aggregating 10-Category Benchmark Matrix Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            2. VTON Model Comparison & 10-Category Benchmark Matrix
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Empirical test results evaluated across all 10 mandated clothing types. Hard limits: Latency &lt; 15s, Unit Cost &lt; ₹4.0.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-[#1A1F2E] hover:bg-gray-800 border border-gray-700 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all shadow"
        >
          <FileSpreadsheet className="w-4 h-4 text-green-400" />
          Export All Experiments (.CSV)
        </button>
      </div>

      {/* Summary Rankings Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Production Feasibility Summary & Rankings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-gray-800 font-mono">
            <thead>
              <tr className="bg-[#0B0D14] text-gray-400 border-b border-gray-800 uppercase text-[11px]">
                <th className="p-3 border-r border-gray-800">Model Name</th>
                <th className="p-3 border-r border-gray-800">Avg Accuracy (0-4)</th>
                <th className="p-3 border-r border-gray-800">Avg Latency</th>
                <th className="p-3 border-r border-gray-800">Unit Cost (INR)</th>
                <th className="p-3 border-r border-gray-800">Categories Passed</th>
                <th className="p-3 border-r border-gray-800">License Type</th>
                <th className="p-3">Production Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {data.summary_rankings.map((rank, idx) => {
                const isTop = rank.model === 'CatVTON';
                return (
                  <tr
                    key={idx}
                    className={`border-b border-gray-800 ${
                      isTop ? 'bg-blue-950/20 font-semibold text-white' : 'hover:bg-white/[0.02] text-gray-300'
                    }`}
                  >
                    <td className="p-3 border-r border-gray-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-gray-800 text-[10px] flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <span>{rank.model}</span>
                    </td>
                    <td className="p-3 border-r border-gray-800 text-blue-400 font-bold">
                      {rank.avg_accuracy_score} / 4.0
                    </td>
                    <td className="p-3 border-r border-gray-800">
                      {rank.avg_generation_time_sec}s{' '}
                      {rank.meets_time_constraint ? (
                        <span className="text-[10px] text-green-400 font-bold ml-1">(&lt;15s)</span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold ml-1">(&gt;15s)</span>
                      )}
                    </td>
                    <td className="p-3 border-r border-gray-800">
                      ₹{rank.cost_per_gen_inr}{' '}
                      {rank.meets_cost_constraint ? (
                        <span className="text-[10px] text-green-400 font-bold ml-1">(&lt;₹4)</span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold ml-1">(&gt;₹4)</span>
                      )}
                    </td>
                    <td className="p-3 border-r border-gray-800 font-bold text-white">
                      {rank.categories_passed}
                    </td>
                    <td className="p-3 border-r border-gray-800 text-[11px] text-gray-400">
                      {rank.license}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          rank.recommendation_status.includes('RECOMMENDED FOR PRODUCTION')
                            ? 'bg-green-900/40 text-green-300 border border-green-700'
                            : rank.recommendation_status.includes('COMMERCIAL BACKUP')
                            ? 'bg-blue-900/40 text-blue-300 border border-blue-700'
                            : rank.recommendation_status.includes('RESEARCH ONLY')
                            ? 'bg-amber-900/40 text-amber-300 border border-amber-700'
                            : 'bg-red-900/40 text-red-300 border border-red-700'
                        }`}
                      >
                        {rank.recommendation_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full 10 Categories x Models Benchmark Matrix */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Granular Category Performance Matrix (Accuracy | Time | Cost)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-gray-800 font-mono">
            <thead>
              <tr className="bg-[#0B0D14] text-gray-400 border-b border-gray-800 uppercase text-[10px]">
                <th className="p-2.5 text-left border-r border-gray-800 w-48">Model</th>
                {data.categories.map((c) => (
                  <th key={c} className="p-2 border-r border-gray-800 min-w-[90px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.models.map((modelName) => (
                <tr key={modelName} className="border-b border-gray-800 hover:bg-white/[0.02]">
                  <td className="p-2.5 text-left font-bold text-white border-r border-gray-800 text-[11px] bg-[#0E111A]">
                    {modelName}
                  </td>
                  {data.categories.map((cat) => {
                    const cell = data.matrix[modelName]?.[cat];
                    if (!cell || !cell.tested) {
                      return (
                        <td key={cat} className="p-2 border-r border-gray-800 text-gray-600 text-[10px]">
                          Untested
                        </td>
                      );
                    }

                    const isPass = cell.meets_all_reqs;
                    return (
                      <td
                        key={cat}
                        className={`p-2 border-r border-gray-800 text-[10px] ${
                          isPass ? 'bg-green-950/10' : 'bg-red-950/10'
                        }`}
                      >
                        <div className="font-bold text-white">{cell.accuracy_score?.toFixed(1)}/4</div>
                        <div className="text-gray-400 text-[9px]">{cell.generation_time_sec?.toFixed(1)}s · ₹{cell.cost_inr?.toFixed(2)}</div>
                        <div className="mt-0.5">
                          {isPass ? (
                            <span className="text-green-400 text-[9px] font-bold">PASS</span>
                          ) : (
                            <span className="text-red-400 text-[9px] font-bold">FAIL</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
