import React, { useState } from 'react';
import { 
  Network, 
  MapPin, 
  Bell, 
  Activity, 
  Settings, 
  User, 
  ChevronDown, 
  LogOut, 
  Layers, 
  Zap, 
  Database, 
  ShieldAlert, 
  GitBranch, 
  HelpCircle,
  Sparkles,
  Terminal,
  ActivityIcon,
  ChevronUp
} from 'lucide-react';
import { RBACRole, ActivityEvent } from './types';
import { MOCK_ACTIVITIES, MOCK_LOGS } from './data/mockData';

// Importing subcomponents
import FlowsWorkspace from './components/FlowsWorkspace';
import JourneysDashboard from './components/JourneysDashboard';
import TransitionBrowser from './components/TransitionBrowser';
import MetricsTelemetry from './components/MetricsTelemetry';
import Marketplace from './components/Marketplace';
import AccessControl from './components/AccessControl';
import VersionControl from './components/VersionControl';
import WorkspaceSettings from './components/WorkspaceSettings';

export default function App() {
  // Navigation active tab State
  // Views: 'workspace' | 'journeys' | 'transitions' | 'metrics' | 'marketplace' | 'rbac' | 'revisions' | 'settings'
  const [activeTab, setActiveTab] = useState<'workspace' | 'journeys' | 'transitions' | 'metrics' | 'marketplace' | 'rbac' | 'revisions' | 'settings'>('workspace');

  // RBAC identity swap state
  const [userRole, setUserRole] = useState<RBACRole>('Owner-Admin');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Notifications bell variables
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ActivityEvent[]>(MOCK_ACTIVITIES);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Global Engine Logs system console
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [globalLogs, setGlobalLogs] = useState<Array<{ time: string; type: string; message: string }>>(MOCK_LOGS);

  const addNewLog = (log: { time: string; type: string; message: string }) => {
    setGlobalLogs(prev => [log, ...prev].slice(0, 50)); // cap logging count at 50 logs
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addNewLog({
      time: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Dismissed and read all pending notification flags'
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#050508] text-slate-100 font-sans overflow-hidden select-none relative">
      
      {/* BACKGROUND GLOW BLOB OVERLAYS (FROSTED GLASS THEME) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-[30%] -right-[10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[25%] w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[80px]"></div>
      </div>
      
      {/* 1. GLOBAL SYSTEM NAV HEADER */}
      <header className="h-[52px] bg-white/5 border-b border-white/10 backdrop-blur-2xl px-4 flex items-center justify-between shrink-0 relative z-30 select-none">
        
        {/* LOGO GAUGE */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers size={13} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold tracking-widest text-slate-100 font-mono">PRESTIGE</span>
            <span className="text-[9px] text-slate-400 font-mono block tracking-tight leading-none">Spatial Hub v2.1.0</span>
          </div>
        </div>

        {/* MIDDLE SECTION: PRIMARY ROUTE TABS */}
        <nav className="hidden xl:flex items-center gap-1.5 h-full">
          {[
            { id: 'workspace', label: 'Flows Workspace' },
            { id: 'journeys', label: 'Journeys Dashboard' },
            { id: 'transitions', label: 'Transition Browser' },
            { id: 'metrics', label: 'QA Metrics' },
            { id: 'marketplace', label: 'Marketplace' },
            { id: 'rbac', label: 'Access Control' },
            { id: 'revisions', label: 'Revision History' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  addNewLog({
                    time: new Date().toLocaleTimeString(),
                    type: 'info',
                    message: `Switched perspective to [${tab.label}]`
                  });
                }}
                className={`h-8 px-3 rounded-lg text-3xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center ${
                  isActive 
                    ? 'bg-white/15 text-white border border-white/15 shadow-lg shadow-indigo-500/10 backdrop-blur-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT SECTION: MULTIPLAYER STATUS, NOTIFICATION TRAYS AND ROLE PICKERS */}
        <div className="flex items-center gap-3.5">
          
          {/* MULTI-PLAYER GUESTS AVATARS GAUGE */}
          <div className="hidden lg:flex items-center gap-1.5 animate-fade-in">
            <span className="text-[9px] text-slate-400 font-mono mr-1">Active Peers:</span>
            <div className="flex -space-x-1.5">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="avatar" className="w-5 h-5 rounded-full ring-2 ring-white/10 object-cover" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="avatar" className="w-5 h-5 rounded-full ring-2 ring-white/10 object-cover" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" alt="avatar" className="w-5 h-5 rounded-full ring-2 ring-white/10 object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/10 hidden lg:block"></div>

          {/* NOTIFICATION HUB BELL */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-1 px-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition relative cursor-pointer backdrop-blur-sm"
            >
              <Bell size={13} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#050508] animate-pulse"></span>
              )}
            </button>

            {/* FLOATING DROPDOWN LIST */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-[330px] bg-[#050508]/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-40 p-4 space-y-4 animate-fade-in text-left">
                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={12} className="text-indigo-400 animate-bounce" />
                    <span className="text-3xs font-semibold text-slate-205 font-mono">WORKSPACE NOTIFICATIONS</span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-4xs text-indigo-400 hover:text-white font-bold cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2.5 pr-0.5">
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-4xs text-slate-500 font-mono">No new alert activities.</div>
                  ) : (
                    notifications.map(act => (
                      <div 
                        key={act.id} 
                        onClick={() => {
                          // If failure, route operator directly to QA dashboard!
                          if (act.type === 'failure') {
                            setActiveTab('metrics');
                          }
                          setIsNotificationsOpen(false);
                        }}
                        className={`p-2.5 rounded-lg bg-white/5 border border-white/10 transition cursor-pointer select-text text-left hover:border-white/20`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-bold uppercase font-mono ${
                            act.type === 'failure' ? 'text-rose-400' :
                            act.type === 'mention' ? 'text-indigo-405' : 'text-slate-400'
                          }`}>
                            {act.type}
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono">{act.time}</span>
                        </div>
                        <h4 className="text-3xs font-bold text-slate-200 leading-normal block">{act.title}</h4>
                        <p className="text-4xs text-slate-405 leading-relaxed mt-1">{act.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC COMPLIANCE SYSTEM ROLE SELECTOR */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/5 border border-white/10 text-3xs font-bold text-slate-200 hover:bg-white/10 font-mono transition cursor-pointer backdrop-blur-sm"
            >
              <User size={10} className="text-indigo-400" />
              <span>{userRole}</span>
              <ChevronDown size={8} className="text-slate-500 shrink-0" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-[#050508]/90 border border-white/10 rounded-xl shadow-2xl z-40 py-1.5 text-left backdrop-blur-md">
                <span className="text-4xs font-bold text-slate-400 px-3 py-1 bg-white/5 block uppercase font-mono">Select Testing Identity</span>
                {(['Owner-Admin', 'QA-Operator', 'External-Reviewer'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setIsRoleDropdownOpen(false);
                      addNewLog({
                        time: new Date().toLocaleTimeString(),
                        type: 'info',
                        message: `Identity context switched to authorization tier [${role}]`
                      });
                    }}
                    className={`w-full text-left py-1.5 px-3 text-3xs font-medium block cursor-pointer transition ${
                      userRole === role ? 'bg-white/15 text-white' : 'text-slate-305 hover:bg-white/5'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </header>


      {/* 2. TABBED PANEL ROUTER (MOBILE OPTIMIZED FALLBACK VIEW) */}
      <div className="xl:hidden py-1 px-2.5 bg-white/5 border-b border-white/10 overflow-x-auto whitespace-nowrap flex items-center gap-1 shrink-0 scrollbar-none backdrop-blur-md">
        {[
          { id: 'workspace', label: 'Workspace' },
          { id: 'journeys', label: 'Journeys' },
          { id: 'transitions', label: 'Transitions' },
          { id: 'metrics', label: 'Metrics' },
          { id: 'marketplace', label: 'Market' },
          { id: 'rbac', label: 'RBAC' },
          { id: 'revisions', label: 'Version' },
          { id: 'settings', label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); }}
            className={`py-1 px-2.5 rounded text-4xs font-bold uppercase transition cursor-pointer ${
              activeTab === tab.id ? 'bg-white/15 text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* 3. CORE ROUTER COMPONENT DRAWER DISPLAY */}
      <main className="flex-1 min-h-0 relative z-10">
        
        {activeTab === 'workspace' && (
          <FlowsWorkspace 
            currentRole={userRole} 
            onAddLog={addNewLog}
            openActivityBell={() => setIsNotificationsOpen(true)}
          />
        )}
        
        {activeTab === 'journeys' && (
          <JourneysDashboard 
            onAddLog={addNewLog} 
          />
        )}
        
        {activeTab === 'transitions' && (
          <TransitionBrowser 
            onAddLog={addNewLog} 
          />
        )}
        
        {activeTab === 'metrics' && (
          <MetricsTelemetry 
            onAddLog={addNewLog} 
          />
        )}
        
        {activeTab === 'marketplace' && (
          <Marketplace 
            onAddLog={addNewLog} 
          />
        )}
        
        {activeTab === 'rbac' && (
          <AccessControl 
            currentRole={userRole}
            onRoleChange={setUserRole}
            onAddLog={addNewLog}
          />
        )}

        {activeTab === 'revisions' && (
          <VersionControl 
            onAddLog={addNewLog} 
          />
        )}

        {activeTab === 'settings' && (
          <WorkspaceSettings 
            onAddLog={addNewLog} 
          />
        )}

      </main>


      {/* 4. CLINICAL ENGINE CONSOLE TRACE LOGGER SHEETS (COLLAPSIBLE BOTTOM SHEET) */}
      <footer className="shrink-0 bg-white/5 backdrop-blur-xl border-t border-white/10 select-none z-20">
        {/* Toggle bar click */}
        <div 
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          className="h-7 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition uppercase font-mono tracking-wider text-4xs"
        >
          <div className="flex items-center gap-1.5">
            <Terminal size={10} className="text-indigo-400" />
            <span className="font-semibold text-slate-300">CLINICAL ENGINE ENGINE SNAPSHOT LOG TRACES</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-indigo-400 font-bold bg-white/10 border border-white/10 px-1.5 rounded uppercase font-sans">connected</span>
            {isConsoleOpen ? <ChevronDown size={11} className="text-slate-500" /> : <ChevronUp size={11} className="text-slate-550" />}
          </div>
        </div>

        {/* Collapsing log area */}
        {isConsoleOpen && (
          <div className="h-44 bg-[#050508]/85 border-t border-white/15 p-3 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-400 flex flex-col scrollbar-thin select-text">
            {globalLogs.map((log, i) => {
              let tagColor = 'text-sky-305';
              if (log.type === 'success') tagColor = 'text-emerald-400 font-semibold';
              if (log.type === 'warning') tagColor = 'text-amber-400';
              return (
                <div key={i} className="flex gap-4">
                  <span className="text-slate-650 shrink-0 select-none">[{log.time}]</span>
                  <span className="text-slate-500 uppercase select-none shrink-0 border border-white/5 bg-white/5 px-1 rounded text-5xs">
                    {log.type}
                  </span>
                  <span className={`select-all ${tagColor}`}>{log.message}</span>
                </div>
              );
            })}
          </div>
        )}
      </footer>

    </div>
  );
}
