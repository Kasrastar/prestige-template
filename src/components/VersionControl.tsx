import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  AlertTriangle, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { MOCK_REVISIONS } from '../data/mockData';

interface VersionControlProps {
  onAddLog: (log: { time: string; type: string; message: string }) => void;
}

export default function VersionControl({ onAddLog }: VersionControlProps) {
  const [selectedVer, setSelectedVer] = useState('v2.1.0');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  
  const activeRev = MOCK_REVISIONS.find(r => r.version === selectedVer) || MOCK_REVISIONS[0];

  const handlePromoteVersion = (ver: string) => {
    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'success',
      message: `Promoted snapshot version [${ver}] to active primary production environment!`
    });

    setToast({
      message: `Success: Snapshot map "${ver}" has been promoted and staged successfully.`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-transparent font-sans p-6 gap-6 text-white relative z-10">
      
      {/* FLOATING GLASS TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#050508]/85 backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm pointer-events-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex-1 text-2xs font-bold leading-relaxed font-mono">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* REVISION HISTORY TIMELINE LEFT COLUMN (SPAN 4) */}
      <div className="w-full md:w-80 shrink-0 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md shadow-xl shadow-indigo-550/5">
        <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0 font-mono">
          <div className="flex items-center gap-1.5">
            <GitBranch size={14} className="text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">REVISION SNAPSHOTS</span>
          </div>
          <span className="text-5xs text-slate-400 font-mono">3 Saved</span>
        </div>

        {/* Revision Items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {MOCK_REVISIONS.map((rev) => {
            const isSelected = selectedVer === rev.version;
            return (
              <div
                key={rev.id}
                onClick={() => setSelectedVer(rev.version)}
                className={`p-4 h-32 block text-left cursor-pointer transition relative ${
                  isSelected ? 'bg-white/12 border-l-2 border-indigo-500' : 'hover:bg-white/8 transition'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-2xs font-bold font-mono text-indigo-400">{rev.version}</span>
                  <span className="text-4xs text-slate-400 font-mono">{rev.date}</span>
                </div>
                <h4 className="text-3xs font-semibold text-slate-200 truncate">{rev.description}</h4>
                <p className="text-4xs text-slate-400 mt-2 font-mono">Author: {rev.author}</p>
                {rev.active && (
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 text-[9px] bg-white/10 text-emerald-400 px-1.5 py-0.5 rounded border border-white/10 uppercase font-mono font-bold">
                    Primary
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* NODE DIFF STATE COMPARATOR RIGHT COLUMN (SPAN 8) */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-h-0 backdrop-blur-md shadow-xl shadow-indigo-550/5">
        <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold font-mono text-slate-200">SNAPSHOT COMPARATOR & DIFF LOG</span>
          <span className="text-4xs text-slate-400 font-mono">Evaluating {activeRev.version} changes</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Metadata Card */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 shadow shadow-indigo-550/5">
            <div className="flex justify-between items-center gap-4">
              <div>
                <span className="text-3xs font-bold font-mono text-slate-400 uppercase tracking-widest block">Snapshot snapshot description</span>
                <span className="text-2xs font-semibold text-slate-200 block mt-1">{activeRev.description}</span>
              </div>
              <button
                type="button"
                onClick={() => handlePromoteVersion(activeRev.version)}
                disabled={activeRev.active}
                className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-505 disabled:opacity-30 disabled:bg-white/5 disabled:text-slate-500 text-white font-bold text-3xs transition cursor-pointer shrink-0"
              >
                {activeRev.active ? 'Active Production' : 'Promote Snapshot'}
              </button>
            </div>
            <p className="text-4xs text-slate-400 font-mono font-bold">Released by: {activeRev.author} on {activeRev.date}</p>
          </div>

          {/* Warning ribbon warning block */}
          {!activeRev.active && (
            <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/20 text-3xs text-amber-500 flex gap-2.5">
              <AlertTriangle className="shrink-0" size={14} />
              <div>
                <span className="font-semibold block font-mono">Historic Snapshot Draft View</span>
                <p className="text-slate-300 leading-relaxed mt-1 font-mono">
                  You are evaluating a legacy Snapshot map. Promoting this file will replace active Mercedes-production states. Ensure validations are cleared.
                </p>
              </div>
            </div>
          )}

          {/* Change List */}
          <div className="space-y-3.5 mt-2">
            <span className="text-3xs font-bold text-slate-400 uppercase font-mono tracking-wider block">MAPPED DELTA LOG ITEMS</span>
            <div className="grid grid-cols-1 gap-2">
              {activeRev.changes.map((change, i) => (
                <div key={i} className="p-3.5 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                  <span className="text-2xs text-slate-300 select-all font-mono leading-relaxed">{change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node Status comparator graphics */}
          <div className="pt-2">
            <span className="text-3xs font-bold text-slate-400 uppercase font-mono tracking-wider block mb-3">STATE GRAPH MATCH DIFFS</span>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-around text-4xs font-mono text-slate-400">
              <div className="flex flex-col items-center">
                <span className="text-slate-450 uppercase mb-2 font-mono">Prestige v2.0.0</span>
                <div className="p-2 border border-white/10 bg-white/10 rounded text-slate-350 select-none">
                  Customer Intake Trigger
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-500" />
              <div className="flex flex-col items-center animate-pulse">
                <span className="text-teal-400 font-bold uppercase mb-2">Mercedes Current Ingress</span>
                <div className="p-2 border border-emerald-450 bg-[#050508] rounded text-emerald-400 select-none font-bold">
                  Customer Intake (v2.1.0 Optimized)
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
