import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Settings, 
  CheckCircle, 
  AlertOctagon, 
  HelpCircle, 
  ArrowUpRight, 
  User, 
  ChevronRight, 
  Terminal, 
  Copy, 
  Cpu, 
  ChevronDown, 
  Sparkles,
  SearchIcon,
  Play
} from 'lucide-react';
import { Journey, MetricCard } from '../types';
import { MOCK_JOURNEYS } from '../data/mockData';

interface JourneysDashboardProps {
  onAddLog: (log: { time: string; type: string; message: string }) => void;
}

export default function JourneysDashboard({ onAddLog }: JourneysDashboardProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<'ALL' | 'MERCEDES' | 'BMW' | 'DEV'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'running' | 'failed' | 'idle'>('ALL');

  // Selected Journey to view execution details / summary
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>('journey-1');
  const selectedJourney = MOCK_JOURNEYS.find(j => j.id === selectedJourneyId);

  // Payload Snippets collapsible keys
  const [isPayloadOpen, setIsPayloadOpen] = useState(true);

  // Floating transient notification state (frosted theme)
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Inline KPI Metrics State
  const kpiMetrics: MetricCard[] = [
    {
      label: 'TOTAL AGENT JOURNEYS',
      value: MOCK_JOURNEYS.length,
      changeValue: '+14% this week',
      isPositive: true,
      subtext: 'Across all stager instances'
    },
    {
      label: 'AVERAGE LATENCY SPEED',
      value: '136.4ms',
      changeValue: '-18.2ms drop',
      isPositive: true,
      subtext: 'Sub-second state transitions'
    },
    {
      label: 'GLOBAL INGEST PERCENTAGE',
      value: '96.34%',
      changeValue: '+1.02% optimal',
      isPositive: true,
      subtext: 'Calculated last 24 hours'
    },
    {
      label: 'DEGRADED TRANSITIONS',
      value: 1,
      changeValue: 'Same as yesterday',
      isPositive: false,
      subtext: 'Transition t-0-5'
    }
  ];

  // Filtering Logic
  const filteredJourneys = MOCK_JOURNEYS.filter(journey => {
    const matchesSearch = journey.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          journey.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = envFilter === 'ALL' || journey.environment === envFilter;
    const matchesStatus = statusFilter === 'ALL' || journey.status === statusFilter;
    return matchesSearch && matchesEnv && matchesStatus;
  });

  const handleTriggerManualRun = (journey: Journey, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'info',
      message: `Triggered manual test trace for journey: [${journey.name}] on ${journey.environment}`
    });
    setSuccessToast(`Manual trace run initialized for state sequence: ${journey.name}. Console logs synchronized.`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent font-sans p-6 space-y-6 relative z-10">
      
      {/* FLOATING GLASS TOAST NOTIFICATION */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-indigo-500/90 border border-white/20 backdrop-blur-xl text-white py-2 px-4 rounded-xl shadow-2xl z-50 animate-bounce text-xs font-semibold flex items-center gap-2">
          <Sparkles size={13} className="text-white animate-spin" />
          <span>{successToast}</span>
        </div>
      )}

      {/* HEADER BAR ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Journeys Dashboard
            <span className="text-3xs font-mono font-bold bg-white/10 text-white py-1 px-2.5 rounded-full border border-white/10 uppercase tracking-widest leading-none">
              Live Monitor
            </span>
          </h1>
          <p className="text-2xs text-slate-350 leading-normal mt-0.5">
            Overview of client lifecycle state machines and transactional transition health rates.
          </p>
        </div>

        {/* Filters and search widgets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Environment Chips filters */}
          <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5 backdrop-blur-sm">
            {(['ALL', 'MERCEDES', 'BMW', 'DEV'] as const).map(env => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`py-1 px-2.5 rounded text-4xs font-bold cursor-pointer transition uppercase ${
                  envFilter === env ? 'bg-white/15 text-white border border-white/10 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {env}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg py-1 px-3 text-3xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500/80 cursor-pointer font-mono uppercase"
          >
            <option value="ALL" className="bg-[#050508] text-slate-200">All Statuses</option>
            <option value="running" className="bg-[#050508] text-slate-200">Running</option>
            <option value="idle" className="bg-[#050508] text-slate-200">Idle</option>
            <option value="failed" className="bg-[#050508] text-slate-200">Failed</option>
          </select>
        </div>
      </div>

      {/* SEARCH FIELD BAR */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter transitions, owners or journey name keys..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9.5 pr-4 text-2xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 font-mono"
        />
      </div>

      {/* BENTO GRID QUICK STAT CARDS (BOTTOM SPEC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((kpi, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl flex flex-col justify-between hover:border-white/20 transition-all shadow-lg shadow-indigo-550/5">
            <span className="text-4xs font-bold text-slate-405 uppercase tracking-widest font-mono">{kpi.label}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold font-mono tracking-tight text-white">{kpi.value}</span>
              <span className={`text-4xs font-bold ${kpi.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.changeValue}
              </span>
            </div>
            <span className="text-3xs text-slate-400 mt-2 font-mono">{kpi.subtext}</span>
          </div>
        ))}
      </div>

      {/* CORE WORKSPACE GRID LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        
        {/* LEFT COLUMN: PRIMARY JOURNEYS TABLE DATA (SPAN 8) */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden min-h-0 shadow-xl shadow-indigo-550/5">
          <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <span className="text-xs font-bold font-mono text-slate-200">Workspace Journeys Registry</span>
            <span className="text-3xs text-slate-350 font-mono">Showing {filteredJourneys.length} nodes list</span>
          </div>

          <div className="flex-1 overflow-auto">
            {filteredJourneys.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <HelpCircle size={32} className="text-slate-500 mb-2" />
                <h4 className="text-2xs font-semibold text-slate-400">No active pipelines found</h4>
                <p className="text-3xs text-slate-405 leading-normal max-w-[220px] mt-1 font-mono">Adjust your environment filters or clear searchable terms.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-3xs text-slate-450 uppercase">
                    <th className="py-3 px-5">State Tracker / Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Ver</th>
                    <th className="py-3 px-4 text-center">ENV</th>
                    <th className="py-3 px-4 text-right">Success Rate</th>
                    <th className="py-3 px-4 text-right">Last Triggered</th>
                    <th className="py-3 px-5 text-right">Flow Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredJourneys.map(journey => {
                    const isSelected = selectedJourneyId === journey.id;
                    const statusColors = {
                      running: 'text-indigo-300 bg-white/10 border-indigo-500/30',
                      success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      idle: 'text-slate-400 bg-white/5 border-white/10',
                      failed: 'text-rose-450 bg-rose-500/10 border-rose-500/20',
                      warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    };

                    return (
                      <tr
                        key={journey.id}
                        onClick={() => setSelectedJourneyId(journey.id)}
                        className={`hover:bg-white/10 cursor-pointer transition ${
                          isSelected ? 'bg-white/10 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        {/* Title and Owner */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar icon */}
                            <img 
                              src={journey.avatar} 
                              alt={journey.owner}
                              className="w-5 h-5 rounded-full ring-1 ring-white/10 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <span className="text-2xs font-semibold text-slate-200 block truncate">{journey.name}</span>
                              <span className="text-4xs text-slate-400 font-mono font-normal">Owner: {journey.owner}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-4xs font-bold border ${statusColors[journey.status] || statusColors.idle}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              journey.status === 'running' ? 'bg-indigo-400 animate-ping' :
                              journey.status === 'failed' ? 'bg-rose-405' : 'bg-slate-400'
                            }`} />
                            <span className="uppercase">{journey.status}</span>
                          </span>
                        </td>

                        {/* Version info */}
                        <td className="py-3.5 px-4 font-mono text-3xs text-slate-300">
                          {journey.version}
                        </td>

                        {/* Environment check */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-3xs uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-white/10 border border-white/10 text-slate-300">
                            {journey.environment}
                          </span>
                        </td>

                        {/* Success Latency rating */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-2xs font-mono font-bold text-slate-100">{journey.successRate}%</span>
                            <span className="text-4xs text-slate-405 font-mono">avg {journey.latency}</span>
                          </div>
                        </td>

                        {/* last log rate */}
                        <td className="py-3.5 px-4 text-right font-mono text-3xs text-slate-300">
                          {journey.lastRun}
                        </td>

                        {/* manual execute action */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => handleTriggerManualRun(journey, e)}
                            className="p-1 px-2.5 rounded bg-white/10 hover:bg-white/15 text-indigo-400 hover:text-indigo-300 text-3xs font-bold font-mono border border-white/10 transition cursor-pointer flex items-center justify-center gap-1 ml-auto shadow-sm"
                            title="Execute mock loop"
                          >
                            <Play size={10} fill="currentColor" /> Run Trace
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SNAPSHOT EXECUTION REPORT (SPAN 4) */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden min-h-0 shadow-xl shadow-indigo-550/5">
          {selectedJourney ? (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Report title header */}
              <div className="px-5 py-4 border-b border-white/10 bg-white/5">
                <span className="text-4xs font-bold text-indigo-400 font-mono tracking-widest block uppercase">EXECUTION REPORT SUMMARY</span>
                <span className="text-xs font-bold text-white block truncate mt-1">{selectedJourney.name}</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-4xs px-1.5 py-0.5 font-mono rounded bg-white/10 border border-white/10 text-slate-200 uppercase">instance: {selectedJourney.id}</span>
                  <span className="text-4xs text-slate-400">v{selectedJourney.version}</span>
                </div>
              </div>

              {/* Collapsible Timeline list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* TIMELINE STATE 1 */}
                <div className="flex gap-3 relative">
                  {/* Stem connecting line */}
                  <div className="absolute top-4 left-2.5 bottom-0 w-0.5 bg-indigo-500/10"></div>
                  
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 text-3xs font-bold shrink-0 z-10 font-mono">
                    1
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold text-slate-200 block">Trigger Ingest Initiated</span>
                    <p className="text-4xs text-slate-405 leading-relaxed font-mono">
                      Active public REST ingestion webhook listened successfully. Status code 202 accepted context.
                    </p>
                    <div className="flex items-center gap-1.5 text-4xs font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Execution Optimal (4ms)</span>
                    </div>
                  </div>
                </div>

                {/* TIMELINE STATE 2 */}
                <div className="flex gap-3 relative">
                  {/* Stem connecting line */}
                  <div className="absolute top-4 left-2.5 bottom-0 w-0.5 bg-indigo-500/10"></div>
                  
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 text-3xs font-bold shrink-0 z-10 font-mono">
                    2
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold text-slate-200 block">Data Normalization Sandbox</span>
                    <p className="text-4xs text-slate-405 leading-relaxed font-mono">
                      Parsed initial JSON context. Pruned 4 empty fields according to configuration schema layout parameters.
                    </p>
                    <div className="flex items-center gap-1.5 text-4xs font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Sanitization Pass (18ms)</span>
                    </div>
                  </div>
                </div>

                {/* TIMELINE STATE 3 (COLLAPSIBLE / EXTENDED CODE DETAIL) */}
                <div className="flex gap-3 relative">
                  {/* Stem line */}
                  <div className={`absolute top-4 left-2.5 bottom-0 w-0.5 ${selectedJourney.status === 'failed' ? 'bg-rose-500/25' : 'bg-indigo-500/10'}`}></div>
                  
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-3xs font-bold shrink-0 z-10 font-mono ${
                    selectedJourney.status === 'failed' ? 'bg-rose-500/10 border-2 border-rose-450 text-rose-350' : 'bg-indigo-500/10 border-2 border-indigo-400 text-indigo-300'
                  }`}>
                    3
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-2xs font-semibold text-slate-200">Enrichment Context Query</span>
                      <button 
                        onClick={() => setIsPayloadOpen(!isPayloadOpen)}
                        className="text-indigo-400 hover:text-indigo-300 text-4xs font-bold cursor-pointer flex items-center gap-0.5"
                      >
                        {isPayloadOpen ? 'Collapse JSON' : 'View Payload'}
                        <ChevronDown size={8} className={`transition-transform duration-200 ${isPayloadOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <p className="text-4xs text-slate-405 leading-relaxed font-mono">
                      Called database servers for user profiles. Injected context metadata into payload structure array.
                    </p>

                    {/* Expanding payload block */}
                    {isPayloadOpen && (
                      <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-4xs font-mono text-zinc-300 select-text overflow-hidden">
                        <div className="flex justify-between items-center text-5xs border-b border-white/10 pb-1.5 mb-1.5 uppercase font-semibold text-slate-405">
                          <span>Request block</span>
                          <span className="text-emerald-400">200 OK</span>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap leading-tight">
{`{
  "traceId": "${selectedJourney.id}-x91f",
  "clientContext": {
    "tier": "PRESTIGE_PLATINUM",
    "authorized": true,
    "systemLatencyLimit": 4000
  },
  "databaseStatus": "RECONCILED"
}`}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIMELINE STATE 4 (LAST TRANSITION POINT) */}
                <div className="flex gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-3xs font-bold shrink-0 z-10 font-mono ${
                    selectedJourney.status === 'failed' 
                      ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400' 
                      : selectedJourney.status === 'running'
                        ? 'bg-indigo-500/20 border-2 border-indigo-400 text-indigo-300 animate-pulse'
                        : 'bg-emerald-500/25 border-2 border-emerald-500 text-emerald-400'
                  }`}>
                    4
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold text-slate-200 block">Underwriting Assessment Engine</span>
                    
                    {selectedJourney.status === 'failed' ? (
                      <>
                        <p className="text-4xs text-rose-450 font-medium font-mono">
                          Execution Block Failed: oauth_handshake_expired. Server did not receive authorization callback token keys.
                        </p>
                        <div className="rounded bg-rose-500/10 border border-rose-500/20 p-2 mt-1.5 flex flex-col gap-1">
                          <span className="text-5xs font-semibold text-rose-400 font-mono block">TERMINATION REASON:</span>
                          <span className="text-5xs text-rose-300 font-mono leading-normal select-all">
                            jwt_callback_expired_handshake: signature invalid
                          </span>
                        </div>
                      </>
                    ) : selectedJourney.status === 'running' ? (
                      <p className="text-4xs text-indigo-400 font-medium animate-pulse font-mono">
                        Currently processing loop assessments... Applying rating filters.
                      </p>
                    ) : (
                      <p className="text-4xs text-slate-405 leading-normal font-mono">
                        FSM logic engine completed checking criteria variables. Approval dispatched.
                      </p>
                    )}
                  </div>
                </div>

              </div>
              
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <HelpCircle size={32} className="text-slate-500 mb-2" />
              <h4 className="text-2xs font-semibold text-slate-400">No Journey Selected</h4>
              <p className="text-3xs text-slate-405 leading-normal max-w-[200px] mt-1 font-mono">Select any row from the workspace registry table to review step-by-step execution timeline summaries.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
