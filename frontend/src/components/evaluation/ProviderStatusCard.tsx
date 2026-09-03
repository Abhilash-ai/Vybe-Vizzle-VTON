import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, AlertCircle, Server } from 'lucide-react';
import type { ProviderStatusInfo } from '../../types';

export const ProviderStatusCard: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatusInfo[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/eval/providers')
      .then((res) => res.json())
      .then((json) => setProviders(json))
      .catch((err) => console.error(err));
  }, []);

  if (providers.length === 0) return null;

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-5 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-blue-400" />
          Configured VTON Model Providers & Inference Status
        </h3>
        <span className="text-[10px] text-gray-400">
          Environment Connectivity Check
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map((p) => {
          const isConnected = p.status.includes('CONNECTED') || p.status.includes('LOCAL');
          return (
            <div key={p.model_name} className="bg-[#0B0D14] border border-gray-800 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] truncate" title={p.model_name}>
                  {p.model_name}
                </span>
                {isConnected ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-950/60 text-green-400 border border-green-800 font-bold uppercase">
                    READY
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800 font-bold uppercase">
                    NOT CONFIGURED
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                {p.status}
              </p>
              <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-gray-900">
                <span>License: {p.license}</span>
                <span>Tests: {p.experiments_recorded}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
