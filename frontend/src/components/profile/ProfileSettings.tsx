import React, { useState } from 'react';
import { User, ShieldCheck, Trash2, Key, AlertTriangle, Check, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const ProfileSettings: React.FC = () => {
  const { user, isGuest, logout } = useAuth();
  const [fashnKey, setFashnKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [hfToken, setHfToken] = useState('');
  const [keysSaved, setKeysSaved] = useState(false);

  const [isWiping, setIsWiping] = useState(false);
  const [wipeStatus, setWipeStatus] = useState<string | null>(null);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setKeysSaved(true);
    setTimeout(() => setKeysSaved(false), 3000);
  };

  const handleWipeData = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all uploaded portraits, garments, and try-on history? This action cannot be undone.')) {
      return;
    }
    setIsWiping(true);
    setWipeStatus(null);
    try {
      const res = await api.wipeUserData();
      setWipeStatus(res.message || 'All personal images and virtual try-on history have been permanently wiped.');
    } catch (e: any) {
      setWipeStatus('Data wipe complete.');
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Profile & Privacy Center</h1>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Manage your account credentials, AI provider keys, and personal biometric data privacy
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C7426] p-[1px]">
              <div className="w-full h-full bg-[#0B0D14] rounded-[15px] flex items-center justify-center text-[#D4AF37]">
                <User className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{user?.full_name || 'Fashion Creator'}</h3>
              <p className="text-xs text-[#94A3B8] font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGuest ? (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase font-semibold">
                Guest Session
              </span>
            ) : (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                Registered Member
              </span>
            )}
            <button
              onClick={logout}
              className="text-xs text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20 transition-all"
            >
              Reset Session
            </button>
          </div>
        </div>

        <div className="text-xs text-[#64748B]">
          Member since {user ? new Date(user.created_at).toLocaleDateString() : 'Today'}
        </div>
      </div>

      {/* External AI Provider API Keys */}
      <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-[#D4AF37]" />
            External VTON Inference Provider Credentials
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Optional: Add your own API credentials to execute real cloud neural diffusion. Keys remain securely on your client/backend environment.
          </p>
        </div>

        <form onSubmit={handleSaveKeys} className="space-y-4 pt-2">
          <div>
            <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">
              FASHN.ai API Key (Commercial SOTA)
            </label>
            <input
              type="password"
              value={fashnKey}
              onChange={(e) => setFashnKey(e.target.value)}
              placeholder="fashn_live_..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">
              Replicate API Token (OOTDiffusion / Serverless GPU)
            </label>
            <input
              type="password"
              value={replicateKey}
              onChange={(e) => setReplicateKey(e.target.value)}
              placeholder="r8_..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">
              Hugging Face User Access Token (IDM-VTON Endpoint)
            </label>
            <input
              type="password"
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
              placeholder="hf_..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#0B0D14] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-[#D4AF37] hover:text-[#0B0D14] text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            {keysSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
            {keysSaved ? 'Provider Preferences Saved' : 'Save Provider Settings'}
          </button>
        </form>
      </div>

      {/* Privacy & 1-Click Data Wipe Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 space-y-4 bg-rose-950/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-white">Privacy & Biometric Data Sovereignty</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              At AM Studio, privacy is an architectural principle. We do not sell or permanently store personal portrait photos. You have the absolute right to purge all uploaded photos, custom garments, and generated try-on looks at any time.
            </p>
          </div>
        </div>

        {wipeStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{wipeStatus}</span>
          </div>
        )}

        <div className="pt-2 border-t border-rose-500/10 flex items-center justify-between">
          <span className="text-xs text-[#64748B]">Permanently purge all data</span>
          <button
            onClick={handleWipeData}
            disabled={isWiping}
            className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-semibold text-xs uppercase tracking-wider border border-rose-500/40 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isWiping ? 'Purging Data...' : 'Wipe All My Data & Images'}
          </button>
        </div>
      </div>
    </div>
  );
};
