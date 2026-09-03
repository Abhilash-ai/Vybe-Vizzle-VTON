import React, { useEffect, useState } from 'react';
import type { ExperimentResponse } from '../types';

interface ExperimentsPageProps {
  onRefreshNeeded: () => void;
}

export const ExperimentsPage: React.FC<ExperimentsPageProps> = ({ onRefreshNeeded }) => {
  const [experiments, setExperiments] = useState<ExperimentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/eval/experiments', { cache: 'no-store' });
      const data = await res.json();
      setExperiments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleExportCSV = () => {
    window.location.href = 'http://localhost:8000/api/v1/eval/export-csv';
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all logged experiment records from the database?')) {
      await fetch('http://localhost:8000/api/v1/eval/clear-all', { method: 'POST' });
      fetchExperiments();
      onRefreshNeeded();
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-mono tracking-tight uppercase">
            Experiments
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Log of all actual model inference executions and human evaluator scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {experiments.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-mono font-semibold uppercase transition-colors"
            >
              Clear Log
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-mono font-semibold uppercase transition-colors"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-gray-500">
          Loading experiments from SQLite database...
        </div>
      ) : experiments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center space-y-2 font-mono shadow-sm">
          <p className="text-sm font-bold text-gray-800 uppercase">
            No experiments have been recorded yet.
          </p>
          <p className="text-xs text-gray-500">
            Go to the <strong>TEST</strong> tab to execute your first model try-on generation.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-[11px] border-b border-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Date / Time</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Generation Time</th>
                  <th className="p-3">Cost (INR)</th>
                  <th className="p-3">Overall Score</th>
                  <th className="p-3">Evaluator Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500 text-[11px] font-bold truncate max-w-[100px]" title={exp.id}>
                      {exp.id.slice(0, 8)}...
                    </td>
                    <td className="p-3 text-gray-600 text-[11px] whitespace-nowrap">
                      {new Date(exp.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      {exp.model_name}
                    </td>
                    <td className="p-3 font-semibold text-gray-800">
                      {exp.category}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        exp.generation_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {exp.generation_status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-900 font-semibold">
                      {exp.generation_time_sec.toFixed(3)}s
                    </td>
                    <td className="p-3 text-gray-900">
                      ₹{exp.cost_inr.toFixed(2)}
                    </td>
                    <td className="p-3 font-bold text-blue-700">
                      {exp.overall_score !== null && exp.overall_score !== undefined
                        ? `${exp.overall_score} / 4.0`
                        : <span className="text-gray-400 font-normal">Pending</span>}
                    </td>
                    <td className="p-3 text-gray-600 text-[11px] max-w-xs truncate" title={exp.evaluator_notes || ''}>
                      {exp.evaluator_notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
