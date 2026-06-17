import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Star, 
  MapPin, 
  Sparkles, 
  Heart, 
  ChevronRight, 
  Layers, 
  Activity, 
  Copy, 
  MessageSquare,
  Check
} from 'lucide-react';
import { MARKETPLACE_TEMPLATES } from '../data/mockData';

interface MarketplaceProps {
  onAddLog: (log: { time: string; type: string; message: string }) => void;
}

export default function Marketplace({ onAddLog }: MarketplaceProps) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<'ALL' | 'Fintech' | 'Integrations' | 'Utilities'>('ALL');
  const [clonedId, setClonedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const categories = ['ALL', 'Fintech', 'Integrations', 'Utilities'] as const;

  const handleCloneTemplate = (tpl: typeof MARKETPLACE_TEMPLATES[0]) => {
    setClonedId(tpl.id);
    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'success',
      message: `Duplicated and instantiated template code: [${tpl.name}] into draft canvas!`
    });

    setToast({
      message: `Success: Successfully cloned "${tpl.name}" template directly inside draft workspace parameters!`,
      type: 'success'
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);

    setTimeout(() => {
      setClonedId(null);
    }, 2000);
  };

  const filtered = MARKETPLACE_TEMPLATES.filter(tpl => {
    const matchesSearch = tpl.name.toLowerCase().includes(search.toLowerCase()) || 
                          tpl.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedTag === 'ALL' || tpl.category === selectedTag;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent font-sans p-6 space-y-6 relative z-10">
      
      {/* FLOATING GLASS TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#050508]/80 backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm pointer-events-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex-1 text-2xs font-bold leading-relaxed font-mono">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Marketplace Template Library
            <span className="text-3xs font-mono font-bold bg-white/10 text-indigo-400 py-1 px-2.5 rounded-full border border-white/10">
              FSM Blueprints
            </span>
          </h1>
          <p className="text-2xs text-slate-400 leading-normal mt-0.5 font-mono">
            Pre-configured state machines, logic triggers, database mappers, and sandbox protocols. Ready to clone and execute.
          </p>
        </div>

        {/* Quick category tag pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
          {categories.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`py-1 px-3 rounded text-3xs font-bold cursor-pointer transition uppercase tracking-wider ${
                selectedTag === tag 
                  ? 'bg-white/15 text-indigo-400 border border-white/10' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH BAR ROW */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter template blueprint categories, authors or description keywords..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9.5 pr-4 text-2xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 font-mono"
        />
      </div>

      {/* CARDS LIST VIEWER */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl">
            <Layers size={36} className="text-slate-500 mb-2" />
            <h4 className="text-3xs font-semibold text-slate-300">No template blueprints match criteria</h4>
            <p className="text-4xs text-slate-450 mt-1 font-mono">Try resetting search string filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(tpl => (
              <div 
                key={tpl.id}
                className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/8 transition flex flex-col justify-between overflow-hidden group hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] shadow-xl shadow-indigo-550/5"
              >
                {/* Visual state-flow vector minimap on top portion */}
                <div className="h-28 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:12px_12px] bg-[#050508]/40 border-b border-white/10 p-4 flex flex-col justify-between select-none relative overflow-hidden shrink-0">
                  <div className="flex justify-between items-center z-10">
                    <span className="text-[9px] bg-white/10 text-indigo-400 font-mono py-0.5 px-1.5 rounded border border-white/10">
                      {tpl.category}
                    </span>
                    <div className="flex items-center gap-2 text-5xs text-slate-400 font-mono">
                      <span className="flex items-center gap-0.5"><Download size={8} /> {tpl.downloads}</span>
                      <span className="flex items-center gap-0.5 text-amber-500"><Star size={8} fill="currentColor" /> {tpl.rating}</span>
                    </div>
                  </div>

                  {/* Schema nodes visual representations flow vector layout */}
                  <div className="flex items-center justify-center gap-1.5 py-4 w-full">
                    {tpl.nodePreview.slice(0, 4).map((node, i) => (
                      <React.Fragment key={i}>
                        <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-1 rounded text-slate-300 font-bold truncate max-w-[55px] text-center shadow">
                          {node}
                        </span>
                        {i < 3 && (
                          <div className="w-3 h-0.5 bg-white/10 flex items-center shrink-0">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                    {tpl.nodePreview.length > 4 && (
                      <span className="text-4xs font-mono text-slate-400 pl-1 shrink-0">+{tpl.nodePreview.length - 4}</span>
                    )}
                  </div>
                </div>

                {/* Core description contents */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xs font-bold text-slate-200 block group-hover:text-indigo-400 transition font-sans">{tpl.name}</h3>
                    </div>
                    <p className="text-3xs text-slate-400 leading-relaxed mt-2.5 font-mono">{tpl.description}</p>
                  </div>

                  {/* Authors and buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 shrink-0 font-mono">
                    <span className="text-4xs text-slate-400 font-bold">By: {tpl.author}</span>
                    
                    <button
                      onClick={() => handleCloneTemplate(tpl)}
                      disabled={clonedId === tpl.id}
                      className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-3xs font-bold cursor-pointer shadow transition flex items-center gap-1.5"
                    >
                      {clonedId === tpl.id ? (
                        <>
                          <Check size={10} /> Cloned!
                        </>
                      ) : (
                        <>
                          <Copy size={10} /> Clone to Draft
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
