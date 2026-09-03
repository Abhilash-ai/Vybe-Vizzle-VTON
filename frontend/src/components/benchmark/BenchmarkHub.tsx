import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, XCircle, AlertCircle, Clock, DollarSign, ShieldAlert, ShieldCheck, Terminal, Server } from 'lucide-react';
import { BenchmarkHubResponse, BenchmarkModel, SystemHardwareInfo } from '../../types';
import { api } from '../../services/api';

export const BenchmarkHub: React.FC = () => {
  const [data, setData] = useState<BenchmarkHubResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        const res = await api.getBenchmarkHub();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBenchmark();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 tracking-widest uppercase">
              Developer & Infrastructure
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">VTON Model Benchmarks</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Empirical comparison of open-source diffusion models vs commercial virtual try-on APIs
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121622] border border-white/[0.08] text-xs">
          <Server className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-mono">Environment: {data?.system.os || 'Windows 64-bit'}</span>
        </div>
      </div>

      {/* System Hardware Inspection Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#D4AF37]" />
          Runtime Environment & Hardware Telemetry
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#0B0D14]/80 border border-white/[0.04] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#64748B]">Active Provider</span>
            <p className="font-semibold text-white uppercase text-sm">
              {data?.system.vton_provider_active || 'demo'}
            </p>
            <span className="text-[10px] text-emerald-400">Offline Mode Active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B0D14]/80 border border-white/[0.04] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#64748B]">CUDA GPU Device</span>
            <p className="font-semibold text-white truncate">
              {data?.system.cuda_device_name || 'CPU Only'}
            </p>
            <span className="text-[10px] text-[#94A3B8]">
              {data?.system.cuda_available ? 'CUDA Accelerated' : 'PyTorch CPU Host'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B0D14]/80 border border-white/[0.04] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#64748B]">CPU Topology</span>
            <p className="font-semibold text-white text-sm">{data?.system.cpu_count || 4} Logical Cores</p>
            <span className="text-[10px] text-[#94A3B8]">Python {data?.system.python_version || '3.10'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B0D14]/80 border border-white/[0.04] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#64748B]">Commercial Safety</span>
            <p className="font-semibold text-[#D4AF37] text-sm">Audited & Verified</p>
            <span className="text-[10px] text-[#94A3B8]">Clear Licensing Badges</span>
          </div>
        </div>
      </div>

      {/* Benchmark Matrix Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.08] overflow-hidden space-y-0">
        <div className="p-5 border-b border-white/[0.06]">
          <h3 className="text-base font-serif font-bold text-white">VTON Model Evaluation Matrix</h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Direct comparison of latency, memory overhead, resolution, and licensing compliance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0B0D14]/90 text-[#94A3B8] uppercase text-[10px] tracking-wider">
                <th className="p-4 font-semibold">Model & Architecture</th>
                <th className="p-4 font-semibold">License & Safety</th>
                <th className="p-4 font-semibold">Typical Latency</th>
                <th className="p-4 font-semibold">VRAM / Hosting</th>
                <th className="p-4 font-semibold">Resolution</th>
                <th className="p-4 font-semibold">Cost / Image</th>
                <th className="p-4 font-semibold">Environment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {data?.models.map((model) => (
                <tr key={model.provider} className="hover:bg-white/[0.02] transition-colors">
                  {/* Model */}
                  <td className="p-4 space-y-0.5">
                    <p className="font-semibold text-white text-xs">{model.model_name}</p>
                    <p className="text-[10px] text-[#64748B]">{model.architecture}</p>
                  </td>

                  {/* License */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[11px] text-white block">{model.license_type}</span>
                      {model.is_commercial_safe ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <ShieldCheck className="w-3 h-3" /> Commercial OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                          <ShieldAlert className="w-3 h-3" /> Research Only
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Latency */}
                  <td className="p-4 font-mono text-white">{model.typical_latency_sec}</td>

                  {/* VRAM */}
                  <td className="p-4 text-[#94A3B8]">
                    {model.vram_required_gb && model.vram_required_gb > 0
                      ? `${model.vram_required_gb} GB VRAM`
                      : 'Cloud Managed'}
                  </td>

                  {/* Resolution */}
                  <td className="p-4 font-mono text-[#94A3B8]">{model.resolution}</td>

                  {/* Cost */}
                  <td className="p-4 font-mono text-[#D4AF37] font-semibold">
                    {model.estimated_cost_per_image}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {model.status === 'active' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : model.status === 'available_with_key' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Ready With Key
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-[#64748B] border border-white/[0.08] text-[10px] font-semibold uppercase tracking-wider">
                        Not in current env
                      </span>
                    )}
                    <p className="text-[10px] text-[#64748B] mt-1 max-w-[200px] leading-tight">
                      {model.environment_status_note}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Experiment / Benchmark Logs */}
      {data?.recent_benchmark_logs && data.recent_benchmark_logs.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-semibold text-white">Recent Execution Latency Logs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {data.recent_benchmark_logs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#0B0D14]/80 border border-white/[0.04] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white uppercase">{log.provider}</span>
                  <span className="font-mono text-[#D4AF37]">{log.latency_ms} ms</span>
                </div>
                <p className="text-[10px] text-[#94A3B8]">{log.resolution} · {log.model_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
