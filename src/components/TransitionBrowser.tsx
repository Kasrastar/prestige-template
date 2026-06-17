import React, { useState } from 'react';
import { 
  Search, 
  Cpu, 
  Database, 
  MapPin, 
  ArrowRight, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Play, 
  Settings,
  Flame,
  SearchIcon,
  Check
} from 'lucide-react';
import { TransitionItem } from '../types';
import { MOCK_TRANSITIONS } from '../data/mockData';

interface TransitionBrowserProps {
  onAddLog: (log: { time: string; type: string; message: string }) => void;
}

export default function TransitionBrowser({ onAddLog }: TransitionBrowserProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'logic' | 'data' | 'connector' | 'trigger'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'optimal' | 'warning' | 'degraded'>('ALL');

  // Selected transition sandbox state
  const [selectedId, setSelectedId] = useState<string>('t-5-9');
  const selectedTransition = MOCK_TRANSITIONS.find(t => t.id === selectedId);

  // Playground variables
  const [sandboxPayload, setSandboxPayload] = useState('{\n  "clientId": "cl_merc_337",\n  "declaredCredit": 720,\n  "bypassCheck": false\n}');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Filter logic
  const filtered = MOCK_TRANSITIONS.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.id.toLowerCase().includes(search.toLowerCase()) ||
                          t.sourceState.toLowerCase().includes(search.toLowerCase()) ||
                          t.targetState.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const runSandboxTest = () => {
    if (!selectedTransition) return;
    setIsTesting(true);
    setSandboxResult(null);

    // Staggered output
    setTimeout(() => {
      try {
        const parsed = JSON.parse(sandboxPayload);
        const latencyModifier = Math.round(selectedTransition.avgLatency + (Math.random() - 0.5) * 10);
        
        let decision = 'PASS';
        if (selectedTransition.id === 't-5-err' || parsed.declaredCredit < 600) {
          decision = 'TRIGGER_FRAUD_PROTOCOL';
        }

        setSandboxResult({
          status: 'SUCCESS',
          statusCode: 200,
          latency: `${latencyModifier}ms`,
          decisionOutput: {
            routingId: `rt-${Date.now().toString().slice(-6)}`,
            identifiedPath: decision,
            evaluatedEpoch: Date.now()
          }
        });

        const now = new Date().toLocaleTimeString();
        onAddLog({
          time: now,
          type: 'success',
          message: `Evaluated playground schema on transition key [${selectedTransition.id}]. Result: ${decision}`
        });
      } catch (err) {
        setSandboxResult({
          status: 'FAILED',
          error: 'SyntaxError: Incomplete or broken JSON string structure inside input payload'
        });
      } finally {
        setIsTesting(false);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent font-sans p-6 gap-6 relative z-10">
      
      {/* LEFT CLASSIFICATIONS NAVIGATION SIDEBAR (SPAN 3) */}
      <aside className="w-full md:w-56 shrink-0 flex flex-col gap-5">
        <div>
          <h2 className="text-3xs font-bold text-slate-400 uppercase tracking-widest font-mono">Transition Ingress</h2>
          <h1 className="text-sm font-bold text-white mt-1">Transitions Hub</h1>
        </div>

        {/* Categories selectors */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-4xs font-bold font-mono text-slate-400 uppercase tracking-wider pl-1 font-mono">filter By Type</span>
            <div className="space-y-1">
              {([
                { key: 'ALL', label: 'All Catalog' },
                { key: 'trigger', label: 'Inbound Triggers' },
                { key: 'logic', label: 'Logic Controllers' },
                { key: 'data', label: 'Data Pipelines' },
                { key: 'connector', label: 'Connectors' }
              ] as const).map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`w-full text-left py-1.5 px-3 rounded-lg text-2xs transition cursor-pointer font-bold ${
                    selectedCategory === cat.key ? 'bg-white/15 border border-white/10 text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-4xs font-bold font-mono text-slate-400 uppercase tracking-wider pl-1 font-mono">performance Tier</span>
            <div className="space-y-1">
              {[
                { key: 'ALL', label: 'All Latency Rates' },
                { key: 'optimal', label: 'Optimal Performance' },
                { key: 'warning', label: 'Under Review' },
                { key: 'degraded', label: 'Degraded / Slow' }
              ].map(status => (
                <button
                  key={status.key}
                  onClick={() => setSelectedStatus(status.key as any)}
                  className={`w-full text-left py-1.5 px-3 rounded-lg text-2xs transition cursor-pointer font-bold ${
                    selectedStatus === status.key ? 'bg-white/15 border border-white/10 text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* MID SECTION: SEARCH AND THE DYNAMIC CARDS LIST (SPAN 6) */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transitions, schema keys or target states..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9.5 pr-4 text-2xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 font-mono"
          />
        </div>

        {/* Transition structural list cards */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl">
              <Flame size={32} className="text-slate-500 mb-2" />
              <h4 className="text-2xs font-semibold text-slate-400">0 matched transitions found</h4>
              <p className="text-3xs text-slate-450 max-w-[200px] mt-1 font-mono">Adjust search identifiers or filters config.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map(t => {
                const isActive = selectedId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isActive 
                        ? 'bg-white/12 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] backdrop-blur-md text-white' 
                        : 'bg-white/5 border-white/10 backdrop-blur-md text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-3xs font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-indigo-400 border border-white/10 select-all shrink-0">
                          {t.id}
                        </span>
                        <h3 className="text-2xs font-bold text-slate-200 truncate">{t.name}</h3>
                      </div>
                      
                      {/* Latency badge */}
                      <span className={`text-4xs font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                        t.status === 'optimal' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                        t.status === 'warning' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-rose-455 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-3xs text-slate-350 leading-relaxed my-2.5 font-mono">{t.description}</p>

                    {/* Mapping direction */}
                    <div className="flex items-center gap-2 text-4xs font-mono text-slate-400 border-t border-white/5 pt-2.5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        <span className="truncate max-w-[90px]">{t.sourceState}</span>
                      </div>
                      <ArrowRight size={10} className="text-slate-500" />
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        <span className="truncate max-w-[90px]">{t.targetState}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: DETAILED TEST EVALUATION & SCHEMA SANDBOX (SPAN 4) */}
      <div className="w-full md:w-80 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-xl shadow-indigo-550/5">
        {selectedTransition ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header info */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <span className="text-4xs font-bold text-teal-400 font-mono block tracking-widest uppercase">TEST PLAYGROUND</span>
              <h2 className="text-xs font-bold text-white block mt-1">Evaluate [${selectedTransition.id}] Rule</h2>
              <p className="text-3xs text-slate-400 mt-1">Simulate input parameters to verify downstream conditions.</p>
            </div>

            {/* Editor block panels */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Target direction list */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-4xs text-slate-350 space-y-2">
                <div className="flex justify-between">
                  <span>Source State:</span>
                  <span className="text-white font-medium">{selectedTransition.sourceState}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target State:</span>
                  <span className="text-white font-medium">{selectedTransition.targetState}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transition Category:</span>
                  <span className="text-white uppercase font-medium">{selectedTransition.category}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 text-[9px] font-semibold text-slate-450 uppercase">
                  <span>Success threshold:</span>
                  <span className="text-emerald-400">{selectedTransition.successRate}%</span>
                </div>
              </div>

              {/* Input playground JSON editor */}
              <div className="space-y-1.5">
                <span className="text-3xs font-bold text-slate-400 uppercase font-mono tracking-wider">Playground JSON Payload</span>
                <textarea
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  className="w-full h-32 bg-white/5 border border-white/10 p-2.5 rounded-lg text-3xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Action trigger */}
              <button
                onClick={runSandboxTest}
                disabled={isTesting}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold text-2xs rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                {isTesting ? (
                  <>
                    <Activity size={12} className="animate-spin" />
                    <span>Processing Map evaluation...</span>
                  </>
                ) : (
                  <>
                    <Play size={10} fill="white" />
                    <span>Test State Transition</span>
                  </>
                )}
              </button>

              {/* Sandbox response console result code */}
              {sandboxResult && (
                <div className="space-y-1.5 animate-fade-in select-text">
                  <span className="text-3xs font-bold text-slate-400 uppercase font-mono tracking-wider block">sandbox execution output</span>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 font-mono text-3xs text-slate-300 leading-normal leading-relaxed">
                    {sandboxResult.status === 'FAILED' ? (
                      <span className="text-rose-455 font-semibold text-3xs">{sandboxResult.error}</span>
                    ) : (
                      <pre className="overflow-x-auto whitespace-pre-wrap leading-tight">
                        {JSON.stringify(sandboxResult, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <X size={32} className="text-slate-605 mb-2" />
            <h4 className="text-2xs font-semibold text-slate-400">None selected</h4>
          </div>
        )}
      </div>

    </div>
  );
}
