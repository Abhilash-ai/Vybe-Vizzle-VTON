import React, { useEffect, useState } from 'react';
import { Database, FileSpreadsheet } from 'lucide-react';

interface ManifestResponse {
  categories_count: number;
  required_categories: string[];
  candidate_models: string[];
  test_dataset: Array<{
    test_id: string;
    category: string;
    person_image: string;
    garment_image: string;
    garment_name: string;
    description: string;
  }>;
}

export const DatasetManifestViewer: React.FC = () => {
  const [data, setData] = useState<ManifestResponse | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/eval/manifest')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            4. Standardized Test Dataset Manifest (tests.csv)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Every candidate model is benchmarked against identical paired inputs to ensure controlled reproducibility.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-blue-950/40 text-blue-300 border border-blue-800">
          {data.categories_count} Standardized Test Categories
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse border border-gray-800 font-mono">
          <thead>
            <tr className="bg-[#0B0D14] text-gray-400 border-b border-gray-800 uppercase text-[10px]">
              <th className="p-2.5 border-r border-gray-800">Test ID</th>
              <th className="p-2.5 border-r border-gray-800">Category</th>
              <th className="p-2.5 border-r border-gray-800">Garment Name</th>
              <th className="p-2.5 border-r border-gray-800">Person Image Path</th>
              <th className="p-2.5 border-r border-gray-800">Garment Image Path</th>
              <th className="p-2.5">Description</th>
            </tr>
          </thead>
          <tbody>
            {data.test_dataset.map((row) => (
              <tr key={row.test_id} className="border-b border-gray-800 hover:bg-white/[0.02] text-gray-300">
                <td className="p-2.5 border-r border-gray-800 font-bold text-blue-400">{row.test_id}</td>
                <td className="p-2.5 border-r border-gray-800 font-bold text-white">{row.category}</td>
                <td className="p-2.5 border-r border-gray-800">{row.garment_name}</td>
                <td className="p-2.5 border-r border-gray-800 text-[10px] text-gray-400">{row.person_image}</td>
                <td className="p-2.5 border-r border-gray-800 text-[10px] text-gray-400">{row.garment_image}</td>
                <td className="p-2.5 text-[10px] text-gray-400">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
