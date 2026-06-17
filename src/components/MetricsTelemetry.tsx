import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  Terminal, 
  CheckCircle, 
  AlertOctagon, 
  RefreshCw, 
  Copy, 
  Database, 
  AlertTriangle, 
  ExternalLink,
  Flame,
  Check,
  Zap
} from 'lucide-react';
import { MOCK_TRIAGE_QUEUE } from '../data/mockData';

interface MetricsTelemetryProps {
  onAddLog: (log: { time: string; type: string; message: string }) => void;
}

export default function MetricsTelemetry({ onAddLog }: MetricsTelemetryProps) {
  const [selectedEnv, setSelectedEnv] = useState<'ALL' | 'MERCEDES' | 'BMW' | 'DEV'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [triageQueue, setTriageQueue] = useState(MOCK_TRIAGE_QUEUE);

  const handleResolveTriage = (id: string) => {
    setTriageQueue(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'resolved' };
      }
      return item;
    }));

    const item = triageQueue.find(i => i.id === id);
    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'success',
      message: `Manually resolved and archived incident tracking id: [${id}]`
    });
  };

  const copyCurl = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);

    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'info',
      message: `Copied cURL diagnostic command code to clipboard from ID [${id}]`
    });
  };

  // Filter queue items by environment selection
  const filteredTriage = triageQueue.filter(item => {
    if (selectedEnv === 'ALL') return true;
    return item.environment.toUpperCase().includes(selectedEnv);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent font-sans p-6 space-y-6 relative z-10">
      
      {/* HEADER SECTION ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            QA Metrics & Telemetry
            <span className="text-3xs font-mono font-bold bg-white/10 text-rose-400 py-1 px-2 rounded-full border border-white/10">
              Diagnostic Mode
            </span>
          </h1>
          <p className="text-2xs text-slate-400 leading-normal mt-0.5 font-mono">
            Real-time server-lake diagnostics, transaction failure triage queues and container latency benchmarks.
          </p>
        </div>

        {/* Environment Filter tabs */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-lg backdrop-blur-md">
          {(['ALL', 'MERCEDES', 'BMW', 'DEV'] as const).map(env => (
            <button
              key={env}
              onClick={() => setSelectedEnv(env)}
              className={`py-1 px-3 rounded-md text-3xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedEnv === env 
                  ? 'bg-white/15 text-indigo-400 border border-white/10 shadow-sm' 
                  : 'text-slate-450 hover:text-white'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* BENCHMARK GRID METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MERCEDES CARD */}
        <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl space-y-2 relative overflow-hidden shadow-xl shadow-indigo-550/5">
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-405 animate-ping"></div>
          <span className="text-4xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Mercedes Environment</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-mono font-bold tracking-tight text-emerald-400">99.4%</span>
            <span className="text-4xs text-slate-400 font-mono">1.2m transactions</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '99.4%' }}></div>
          </div>
          <span className="text-5xs text-slate-400 block font-mono">Database Ingest Status: Optimal (24ms latency)</span>
        </div>

        {/* BMW CARD */}
        <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl space-y-2 shadow-xl shadow-indigo-550/5">
          <span className="text-4xs font-mono font-bold text-slate-400 uppercase tracking-widest block">BMW Environment</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-mono font-bold tracking-tight text-indigo-300">97.2%</span>
            <span className="text-4xs text-slate-400 font-mono">810k transactions</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-455 rounded-full" style={{ width: '97.2%' }}></div>
          </div>
          <span className="text-5xs text-slate-400 block font-mono">Database Ingest Status: Healthy (42ms latency)</span>
        </div>

        {/* DEV CARD */}
        <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl space-y-2 shadow-xl shadow-indigo-550/5">
          <span className="text-4xs font-mono font-bold text-slate-400 uppercase tracking-widest block">DEV-Sandbox</span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-mono font-bold tracking-tight text-amber-500 animate-pulse">84.1%</span>
            <span className="text-4xs text-slate-400 font-mono">55k transactions</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '84.1%' }}></div>
          </div>
          <span className="text-5xs text-rose-455 block font-mono">Database Ingest Status: Degraded (310ms latency)</span>
        </div>
      </div>

      {/* MIDDLE CONTAINER: INCIDENTS TRIAGE LIST */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-h-0 shadow-xl shadow-indigo-550/5 backdrop-blur-md">
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-rose-400" />
            <span className="text-xs font-bold font-mono text-slate-200">ACTIVE FAILURE TRIAGE QUEUE</span>
          </div>
          <span className="text-4xs text-slate-400 font-mono">Awaiting Operator Re-check</span>
        </div>

        {/* Failure instances list */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredTriage.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <CheckCircle size={32} className="text-emerald-400 mb-2" />
              <h4 className="text-2xs font-semibold text-slate-300">Incident list pristine</h4>
              <p className="text-3xs text-slate-450 font-mono">All transactional channels operating within parameter rules.</p>
            </div>
          ) : (
            filteredTriage.map(incident => (
              <div 
                key={incident.id}
                className={`p-5 flex flex-col lg:flex-row gap-4 justify-between transition select-text ${
                  incident.status === 'resolved' ? 'opacity-40 bg-white/5' : ''
                }`}
              >
                {/* Meta details */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-4xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-450 border border-rose-500/10 uppercase font-mono">
                      {incident.id}
                    </span>
                    <span className="text-5xs text-slate-400 font-mono">{incident.timestamp}</span>
                    <span className="text-5xs px-1.5 py-0.5 rounded uppercase bg-white/10 border border-white/10 text-slate-300 font-mono">
                      {incident.environment}
                    </span>
                  </div>

                  {/* Incident Error message */}
                  <div>
                    <span className="text-3xs text-slate-400 block font-mono">Pipeline Ingest Trigger: {incident.trigger}</span>
                    <h3 className="text-2xs font-bold text-rose-400 mt-1 block select-all font-mono leading-normal">
                      {incident.error}
                    </h3>
                  </div>

                  {/* Copyable reproductive curl string snippet */}
                  <div className="relative group">
                    <div className="flex justify-between items-center text-5xs text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-t-lg border border-white/10 border-b-0 font-mono uppercase font-semibold">
                      <span>Developer cURL Reproduction Snippet</span>
                      <button
                        onClick={() => copyCurl(incident.id, incident.curl)}
                        className="text-indigo-400 hover:text-white cursor-pointer flex items-center gap-1 font-mono font-bold"
                      >
                        {copiedId === incident.id ? (
                          <>
                            <Check size={8} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={8} /> Copy Code
                          </>
                        )}
                      </button>
                    </div>
                    {/* The code block box */}
                    <pre className="p-3 bg-white/5 border border-white/10 rounded-b-lg font-mono text-4xs text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                      {incident.curl}
                    </pre>
                  </div>
                </div>

                {/* Resolve buttons */}
                <div className="flex items-center lg:justify-end gap-2 shrink-0 self-start md:self-center">
                  {incident.status !== 'resolved' ? (
                    <button
                      onClick={() => handleResolveTriage(incident.id)}
                      className="py-1.5 px-3 rounded-lg bg-[#050508]/40 hover:bg-[#050508]/60 text-emerald-400 text-3xs font-bold font-sans border border-white/10 hover:border-white/20 transition cursor-pointer shadow flex items-center gap-1"
                    >
                      <CheckCircle size={10} />
                      <span>Archive Incident</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/10 border border-white/10 text-slate-400 text-3xs font-mono uppercase">
                      ✓ Resolved Pipeline
                    </span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
