import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DatasetValidationResponse } from '../../types';

export const DatasetManifestViewer: React.FC = () => {
  const [data, setData] = useState<DatasetValidationResponse | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/eval/manifest')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-6 space-y-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            4. Standardized Test Dataset Manifest (tests.csv) & Asset Validation
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Every candidate model is benchmarked against identical paired inputs to ensure controlled reproducibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.missing_test_cases === 0 ? (
            <span className="text-xs px-3 py-1 rounded bg-green-950/40 text-green-300 border border-green-800 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {data.valid_test_cases} / {data.total_test_cases} Assets Verified on Disk
            </span>
          ) : (
            <span className="text-xs px-3 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800 flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {data.missing_test_cases} Missing Assets
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse border border-gray-800">
          <thead>
            <tr className="bg-[#0B0D14] text-gray-400 border-b border-gray-800 uppercase text-[10px]">
              <th className="p-2.5 border-r border-gray-800">Test ID</th>
              <th className="p-2.5 border-r border-gray-800">Category</th>
              <th className="p-2.5 border-r border-gray-800">Garment Name</th>
              <th className="p-2.5 border-r border-gray-800">Person Path & Status</th>
              <th className="p-2.5 border-r border-gray-800">Garment Path & Status</th>
              <th className="p-2.5">Input Validation</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((row) => (
              <tr key={row.test_id} className="border-b border-gray-800 hover:bg-white/[0.02] text-gray-300">
                <td className="p-2.5 border-r border-gray-800 font-bold text-blue-400">{row.test_id}</td>
                <td className="p-2.5 border-r border-gray-800 font-bold text-white">{row.category}</td>
                <td className="p-2.5 border-r border-gray-800">{row.garment_name}</td>
                <td className="p-2.5 border-r border-gray-800 text-[10px] text-gray-400">
                  <span>{row.person_image}</span>{' '}
                  {row.person_exists ? (
                    <span className="text-green-400 text-[9px] font-bold ml-1">[EXISTS]</span>
                  ) : (
                    <span className="text-red-400 text-[9px] font-bold ml-1">[MISSING]</span>
                  )}
                </td>
                <td className="p-2.5 border-r border-gray-800 text-[10px] text-gray-400">
                  <span>{row.garment_image}</span>{' '}
                  {row.garment_exists ? (
                    <span className="text-green-400 text-[9px] font-bold ml-1">[EXISTS]</span>
                  ) : (
                    <span className="text-red-400 text-[9px] font-bold ml-1">[MISSING]</span>
                  )}
                </td>
                <td className="p-2.5 text-[10px]">
                  {row.is_valid ? (
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> INVALID
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
