import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, RefreshCw, Database, Trash2 } from 'lucide-react';
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

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all experiment logs from the database?')) {
      await fetch('http://localhost:8000/api/v1/eval/clear-all', { method: 'POST' });
      fetchMatrix();
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-[#12151E] border border-gray-800 rounded-xl p-8 text-center text-gray-400 space-y-3 font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
        <p className="text-xs uppercase">Loading Experiment Records from Database...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            2. VTON Model Benchmark Matrix & Production Comparison
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Populated exclusively from verified experiment records. Hard constraints: Latency &lt; 15s, Unit Cost &lt; ₹4.0.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.total_experiments_recorded > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition"
              title="Purge all experiment records"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear DB
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#1A1F2E] hover:bg-gray-800 border border-gray-700 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition shadow font-mono"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-400" />
            Export Experiments ({data.total_experiments_recorded}) (.CSV)
          </button>
        </div>
      </div>

      {/* Production Feasibility Summary & Rankings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
            Production Feasibility Summary & Rankings (Data-Driven)
          </h3>
          <span className="text-[11px] font-mono text-gray-400">
            Total Logged Experiments: <strong className="text-white">{data.total_experiments_recorded}</strong>
          </span>
        </div>

        {data.summary_rankings.length === 0 ? (
          <div className="bg-[#0B0D14] border border-gray-800 rounded-lg p-6 text-center text-gray-400 font-mono text-xs space-y-1">
            <p className="text-gray-300 font-bold uppercase">No empirical results available yet</p>
            <p className="text-[11px] text-gray-400">Execute test generations using the runner above to compute model rankings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-gray-800 font-mono">
              <thead>
                <tr className="bg-[#0B0D14] text-gray-400 border-b border-gray-800 uppercase text-[10px]">
                  <th className="p-3 border-r border-gray-800">Model Name</th>
                  <th className="p-3 border-r border-gray-800">Tests Run</th>
                  <th className="p-3 border-r border-gray-800">Avg Accuracy (0-4)</th>
                  <th className="p-3 border-r border-gray-800">Avg Latency</th>
                  <th className="p-3 border-r border-gray-800">Avg Unit Cost</th>
                  <th className="p-3 border-r border-gray-800">Categories Passed</th>
                  <th className="p-3 border-r border-gray-800">License</th>
                  <th className="p-3">Production Verdict</th>
                </tr>
              </thead>
              <tbody>
                {data.summary_rankings.map((rank, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-white/[0.02] text-gray-300">
                    <td className="p-3 border-r border-gray-800 font-bold text-white flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-gray-800 text-[10px] flex items-center justify-center font-bold text-gray-400">
                        #{idx + 1}
                      </span>
                      <span>{rank.model}</span>
                    </td>
                    <td className="p-3 border-r border-gray-800 text-center font-bold text-blue-400">
                      {rank.tests_completed}
                    </td>
                    <td className="p-3 border-r border-gray-800 text-blue-400 font-bold">
                      {rank.avg_accuracy_score !== null ? `${rank.avg_accuracy_score} / 4.0` : 'Pending Scoring'}
                    </td>
                    <td className="p-3 border-r border-gray-800">
                      {rank.avg_generation_time_sec !== null ? `${rank.avg_generation_time_sec}s` : 'N/A'}{' '}
                      {rank.meets_time_constraint ? (
                        <span className="text-[10px] text-green-400 font-bold ml-1">(&lt;15s)</span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold ml-1">(&gt;15s)</span>
                      )}
                    </td>
                    <td className="p-3 border-r border-gray-800">
                      {rank.avg_cost_inr !== null ? `₹${rank.avg_cost_inr} (${rank.cost_type})` : 'N/A'}{' '}
                      {rank.meets_cost_constraint ? (
                        <span className="text-[10px] text-green-400 font-bold ml-1">(&lt;₹4)</span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold ml-1">(&gt;₹4)</span>
                      )}
                    </td>
                    <td className="p-3 border-r border-gray-800 font-bold text-white">
                      {rank.categories_passed}
                    </td>
                    <td className="p-3 border-r border-gray-800 text-[10px] text-gray-400">
                      {rank.license}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                          rank.production_verdict.includes('PRODUCTION-READY')
                            ? 'bg-green-900/40 text-green-300 border border-green-700'
                            : rank.production_verdict.includes('NON-COMMERCIAL')
                            ? 'bg-amber-900/40 text-amber-300 border border-amber-700'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {rank.production_verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Granular 10-Category Performance Matrix */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
          Granular 10-Category Performance Matrix (Accuracy | Measured Time | Cost)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-gray-800 font-mono">
            <thead>
              <tr className="bg-[#0B0D14] text-gray-400 border-b border-gray-800 uppercase text-[10px]">
                <th className="p-2.5 text-left border-r border-gray-800 w-48">Model</th>
                {data.categories.map((c) => (
                  <th key={c} className="p-2 border-r border-gray-800 min-w-[95px]">
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
                        <td key={cat} className="p-2 border-r border-gray-800 text-gray-600 text-[10px] bg-black/30">
                          <span className="text-[9px] text-gray-600 uppercase tracking-wider font-mono">NOT TESTED</span>
                        </td>
                      );
                    }

                    const isPass = cell.meets_all_reqs;
                    return (
                      <td
                        key={cat}
                        className={`p-2 border-r border-gray-800 text-[10px] ${
                          isPass ? 'bg-green-950/20' : 'bg-blue-950/20'
                        }`}
                      >
                        <div className="font-bold text-white">
                          {cell.accuracy_score !== null ? `${cell.accuracy_score}/4` : 'Ungraded'}
                        </div>
                        <div className="text-gray-400 text-[9px]">
                          {cell.generation_time_sec?.toFixed(2)}s · ₹{cell.cost_inr?.toFixed(2)}
                        </div>
                        <div className="mt-0.5">
                          {cell.is_evaluated ? (
                            isPass ? (
                              <span className="text-green-400 text-[9px] font-bold">PASS</span>
                            ) : (
                              <span className="text-amber-400 text-[9px] font-bold">SUB-PAR</span>
                            )
                          ) : (
                            <span className="text-blue-400 text-[9px] font-semibold">TESTED</span>
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
