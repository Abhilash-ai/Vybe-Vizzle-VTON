import React, { useEffect, useState } from 'react';
import type { BenchmarkMatrixResponse } from '../types';

export const ComparisonPage: React.FC = () => {
  const [data, setData] = useState<BenchmarkMatrixResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/eval/matrix', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-center text-xs font-mono text-gray-500">
        Loading benchmark comparison matrix...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
          Model Comparison & Category Benchmark Matrix
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Dynamic evaluation matrix comparing candidate VTON models across all 10 mandated clothing categories.
        </p>
      </div>

      {/* 10-Category Performance Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            10-Category Benchmark Matrix (Score / Latency)
          </h2>
          <span className="text-[11px] text-gray-500">
            Total Logged Experiments: <strong className="text-gray-900">{data.total_experiments_recorded}</strong>
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] border-b border-gray-200">
                  <th className="p-3 text-left w-48 font-bold">Model</th>
                  {data.categories.map((cat) => (
                    <th key={cat} className="p-2.5 min-w-[85px] font-bold">
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {data.models.map((modelName) => (
                  <tr key={modelName} className="hover:bg-gray-50">
                    <td className="p-3 text-left font-bold text-gray-900 bg-gray-50/50">
                      {modelName}
                    </td>
                    {data.categories.map((cat) => {
                      const cell = data.matrix[modelName]?.[cat];
                      if (!cell || !cell.tested) {
                        return (
                          <td key={cat} className="p-2 text-gray-400 bg-gray-50/30 text-[11px]">
                            —
                          </td>
                        );
                      }

                      return (
                        <td key={cat} className="p-2 text-[11px] bg-blue-50/40">
                          <div className="font-bold text-gray-900">
                            {cell.accuracy_score !== null && cell.accuracy_score !== undefined
                              ? `${cell.accuracy_score}/4`
                              : 'Ungraded'}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {cell.generation_time_sec?.toFixed(2)}s · ₹{cell.cost_inr?.toFixed(2)}
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
        <p className="text-[10px] text-gray-400">
          Legend: <strong>—</strong> = Not Tested. Populates dynamically upon running experiments.
        </p>
      </div>

      {/* Model Performance Summary Table */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Model Feasibility Summary (Hard Constraints: Latency &lt; 15s, Cost &lt; ₹4)
        </h2>

        {data.summary_rankings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-500 shadow-sm">
            <p className="font-bold text-gray-700 uppercase">No empirical results available yet.</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Insufficient experimental data for production recommendation. Complete test runs in the TEST tab to generate comparative statistics.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] border-b border-gray-200">
                    <th className="p-3">Model</th>
                    <th className="p-3">Categories Tested</th>
                    <th className="p-3">Avg Accuracy (0-4)</th>
                    <th className="p-3">Avg Generation Time</th>
                    <th className="p-3">Avg Unit Cost</th>
                    <th className="p-3">License</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.summary_rankings.map((rank) => (
                    <tr key={rank.model} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{rank.model}</td>
                      <td className="p-3 text-gray-700 font-semibold">{rank.tests_completed} / 10</td>
                      <td className="p-3 font-bold text-blue-700">
                        {rank.avg_accuracy_score !== null ? `${rank.avg_accuracy_score} / 4.0` : 'Pending'}
                      </td>
                      <td className="p-3 text-gray-800">
                        {rank.avg_generation_time_sec !== null ? `${rank.avg_generation_time_sec}s` : 'N/A'}{' '}
                        {rank.meets_time_constraint ? (
                          <span className="text-green-600 font-semibold text-[10px]">(&lt;15s)</span>
                        ) : (
                          <span className="text-red-600 font-semibold text-[10px]">(&gt;15s)</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-800">
                        {rank.avg_cost_inr !== null ? `₹${rank.avg_cost_inr} (${rank.cost_type})` : 'N/A'}{' '}
                        {rank.meets_cost_constraint ? (
                          <span className="text-green-600 font-semibold text-[10px]">(&lt;₹4)</span>
                        ) : (
                          <span className="text-red-600 font-semibold text-[10px]">(&gt;₹4)</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600 text-[11px]">{rank.license}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-800 border border-gray-300">
                          {rank.production_verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
