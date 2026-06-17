import React, { useState } from 'react';
import { 
  Database, 
  ToggleLeft, 
  ToggleRight, 
  Sliders, 
  Radio, 
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface WorkspaceSettingsProps {
  onAddLog: (log: { time: string; type: string; message: string }) => void;
}

export default function WorkspaceSettings({ onAddLog }: WorkspaceSettingsProps) {
  // General configs toggles
  const [isDbCaching, setIsDbCaching] = useState(true);
  const [notifyOnFail, setNotifyOnFail] = useState(true);
  const [strictValidation, setStrictValidation] = useState(true);
  
  // flow permissions rule
  const [ownershipRule, setOwnershipRule] = useState<'author' | 'admin-only' | 'unrestricted'>('author');

  // postgres database latency mock check
  const [isCheckingLatency, setIsCheckingLatency] = useState(false);
  const [dbLatency, setDbLatency] = useState('12ms');

  const triggerLatencyCheck = () => {
    setIsCheckingLatency(true);
    setTimeout(() => {
      const generated = `${Math.round(8 + Math.random() * 8)}ms`;
      setDbLatency(generated);
      setIsCheckingLatency(false);

      const now = new Date().toLocaleTimeString();
      onAddLog({
        time: now,
        type: 'info',
        message: `Queried Cloud SQL PostgreSQL system latency. Result: ${generated} optimal runtime.`
      });
    }, 1200);
  };

  const handleToggle = (setting: string, current: boolean, setter: (v: boolean) => void) => {
    setter(!current);
    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'info',
      message: `Adjusted global system variable: [${setting}] to ${!current}`
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent font-sans p-6 space-y-6 select-none text-white relative z-10">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Workspace Configuration Settings</h1>
        <p className="text-2xs text-slate-400 mt-0.5 font-mono">Control persistent environment toggles, database latency and notification delivery rules.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        
        {/* ENV CONFIGURATION CONTROLS CARD */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 backdrop-blur-md shadow-xl shadow-indigo-550/5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders size={14} className="text-indigo-400" />
            <span className="text-xs font-bold font-mono text-slate-200">Environment Variables Toggles</span>
          </div>

          <div className="space-y-4 pt-1 font-mono">
            {/* Toggle 1 */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <span className="text-2xs font-semibold text-slate-200 block">Strict Mode Payload Validation</span>
                <span className="text-3xs text-slate-400 leading-relaxed max-w-sm block mt-0.5">Rejects incoming triggers that do not match current FSM schemas immediately.</span>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('Strict Validation', strictValidation, setStrictValidation)}
                className="text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              >
                {strictValidation ? <ToggleRight size={26} className="text-indigo-405" /> : <ToggleLeft size={26} />}
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <span className="text-2xs font-semibold text-slate-200 block">Durable Database Queries Caching</span>
                <span className="text-3xs text-slate-400 leading-relaxed max-w-sm block mt-0.5">Saves matching context profiles inside internal cache block memories.</span>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('DB Caching', isDbCaching, setIsDbCaching)}
                className="text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              >
                {isDbCaching ? <ToggleRight size={26} className="text-indigo-405" /> : <ToggleLeft size={26} />}
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <span className="text-2xs font-semibold text-slate-200 block">Deliver Slack Alert Failures</span>
                <span className="text-3xs text-slate-400 leading-relaxed max-w-sm block mt-0.5">Dispatches diagnostic traces straight to #monitoring-incidents rooms.</span>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('Slack Notifications', notifyOnFail, setNotifyOnFail)}
                className="text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              >
                {notifyOnFail ? <ToggleRight size={26} className="text-indigo-405" /> : <ToggleLeft size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* CLOUD SQL DATABASE HEALTH BADGE */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-xl shadow-indigo-550/5">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Database size={14} className="text-indigo-400" />
              <span className="text-xs font-bold font-mono text-slate-200">Durable Database Metadata Connection</span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-3xs text-slate-400 font-mono">Integration Service Status:</span>
                <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-4xs font-bold bg-white/10 text-emerald-400 border border-white/10 uppercase">
                  Connected
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-3xs text-slate-400 font-mono">Active Query Ping Delay:</span>
                <span className="text-2xs font-mono font-bold text-slate-200">{dbLatency}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 font-mono text-4xs text-slate-400 space-y-1">
                <div>URL: <span className="text-slate-300">postgres-live-production.cloudsql-io</span></div>
                <div>Storage: <span className="text-slate-300">310GB / 1000GB allocated (31%)</span></div>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-auto">
            <button
              onClick={triggerLatencyCheck}
              disabled={isCheckingLatency}
              className="py-1.5 px-3.5 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 text-slate-200 hover:text-white text-3xs font-bold border border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide w-full"
            >
              {isCheckingLatency ? (
                <>
                  <RefreshCw size={10} className="animate-spin text-indigo-450" />
                  <span>Measuring Latency...</span>
                </>
              ) : (
                <>
                  <HardDrive size={10} />
                  <span>Run Live Ping Check</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FLOW OWNERSHIP AND SCOPES Radio control */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 backdrop-blur-md shadow-xl shadow-indigo-550/5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Radio size={14} className="text-indigo-400" />
            <span className="text-xs font-bold font-mono text-slate-200">Flow Modification Ownership Policies</span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { key: 'author', label: 'Only Authors can rewrite', desc: 'Restricts editing rules strictly to the creator of the FSM layout snapshot.' },
              { key: 'admin-only', label: 'Owner-Admin approval required', desc: 'Edits are staged as draft PR proposals until the Owner certifies change.' },
              { key: 'unrestricted', label: 'Unrestricted Collaboration mode', desc: 'Any verified team peer can instantly rewrite active code nodes.' }
            ].map(policy => {
              const isChecked = ownershipRule === policy.key;
              return (
                <div 
                  key={policy.key}
                  onClick={() => {
                    setOwnershipRule(policy.key as any);
                    const now = new Date().toLocaleTimeString();
                    onAddLog({
                      time: now,
                      type: 'info',
                      message: `Switched workspace change rule to: [${policy.key}]`
                    });
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isChecked ? 'bg-white/12 border-indigo-500/50 ring-2 ring-indigo-500/20' : 'bg-white/5 border-white/10 hover:border-white/15 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isChecked ? 'border-indigo-400' : 'border-white/20'
                    }`}>
                      {isChecked && <div className="w-1.5 h-1.5 bg-indigo-550 rounded-full animate-pulse"></div>}
                    </div>
                    <div>
                      <span className="text-2xs font-semibold text-slate-200 block">{policy.label}</span>
                      <span className="text-3xs text-slate-400 mt-1 block font-mono">{policy.desc}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
