import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Settings, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Lock, 
  Cpu, 
  Code, 
  Database, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Clock,
  User,
  Send,
  X,
  MousePointer,
  Hand,
  MapPin,
  Terminal
} from 'lucide-react';
import { 
  WorkflowNode, 
  WorkflowConnection, 
  SpatialComment, 
  RBACRole, 
  TeamMember,
} from '../types';
import { 
  INITIAL_NODES, 
  INITIAL_CONNECTIONS, 
  MOCK_COMMENTS, 
  MOCK_TEAM_MEMBERS,
  MOCK_LOGS 
} from '../data/mockData';

interface FlowsWorkspaceProps {
  currentRole: RBACRole;
  onAddLog: (log: { time: string; type: string; message: string }) => void;
  openActivityBell: () => void;
}

export default function FlowsWorkspace({ currentRole, onAddLog, openActivityBell }: FlowsWorkspaceProps) {
  // Canvas State
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<WorkflowConnection[]>(INITIAL_CONNECTIONS);
  const [comments, setComments] = useState<SpatialComment[]>(MOCK_COMMENTS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-3'); // Start with Payload Enricher pre-selected
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Canvas Interaction Mode: 'select' | 'pan' | 'comment'
  const [interactionMode, setInteractionMode] = useState<'select' | 'pan' | 'comment'>('select');
  
  // Simulation Running State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  
  // Sidebar Drawers
  const [isAiCreatorOpen, setIsAiCreatorOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCompileLog, setAiCompileLog] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  
  // New Comment Placing State
  const [placingPinCoords, setPlacingPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Right sidebar node param state edit
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const [nodeNameInput, setNodeNameInput] = useState('');
  const [nodeParams, setNodeParams] = useState<Record<string, string | number | boolean>>({});
  const [nodeMapping, setNodeMapping] = useState('');

  // Ghost Multi-player Cursors Sim
  const [ghosts, setGhosts] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync edits when node selection changes
  useEffect(() => {
    if (selectedNode) {
      setNodeNameInput(selectedNode.name);
      setNodeParams(selectedNode.parameters);
      setNodeMapping(selectedNode.payloadMapping || '');
    }
  }, [selectedNodeId]);

  // Handle randomly moving multiplayer cursors to simulate real-time team collaboration
  useEffect(() => {
    const interval = setInterval(() => {
      setGhosts(prev => 
        prev.map(g => {
          if (g.status === 'idle') return g;
          // Random offset
          const dx = (Math.random() - 0.5) * 35;
          const dy = (Math.random() - 0.5) * 20;
          const currentX = g.cursorX ?? 400;
          const currentY = g.cursorY ?? 200;
          
          // Clamp inside canvas bound
          const nextX = Math.max(100, Math.min(1200, currentX + dx));
          const nextY = Math.max(100, Math.min(500, currentY + dy));
          
          return {
            ...g,
            cursorX: Math.round(nextX),
            cursorY: Math.round(nextY)
          };
        })
      );
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Update selected node parameter on the fly
  const handleSaveNodeParams = () => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        return {
          ...n,
          name: nodeNameInput,
          parameters: nodeParams,
          payloadMapping: nodeMapping
        };
      }
      return n;
    }));
    
    // Log change
    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'info',
      message: `Updated configuration variables on Node: [${nodeNameInput}]`
    });
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (interactionMode !== 'select') return;
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggedNodeId(node.id);
    
    // Calculate trigger offset
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      setDragOffset({
        x: clickX - node.x,
        y: clickY - node.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const newX = Math.round(clickX - dragOffset.x);
      const newY = Math.round(clickY - dragOffset.y);
      
      setNodes(prev => prev.map(n => {
        if (n.id === draggedNodeId) {
          return { ...n, x: Math.max(10, Math.min(1800, newX)), y: Math.max(10, Math.min(1000, newY)) };
        }
        return n;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedNodeId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (interactionMode === 'comment' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      setPlacingPinCoords({ x: clickX, y: clickY });
    }
  };

  // Add a new comment pin
  const handleCreateComment = () => {
    if (!placingPinCoords || !newCommentText.trim()) return;
    
    const newComment: SpatialComment = {
      id: `comment-${Date.now()}`,
      author: 'You (Current Role)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      content: newCommentText,
      time: 'Just now',
      x: placingPinCoords.x,
      y: placingPinCoords.y,
      resolved: false,
      replies: []
    };

    setComments(prev => [...prev, newComment]);
    setNewCommentText('');
    setPlacingPinCoords(null);
    setInteractionMode('select'); // Back to normal

    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'success',
      message: `Thread comment pinned on spatial coordinates (${Math.round(placingPinCoords.x)}, ${Math.round(placingPinCoords.y)})`
    });
  };

  // Inventory list drag/clicks to spawn nodes
  const handleAddNewState = (type: WorkflowNode['type']) => {
    if (currentRole === 'External-Reviewer') return; // Read-only

    // Pick random location in viewport
    const randomX = 150 + Math.random() * 200;
    const randomY = 150 + Math.random() * 150;
    const uniqueId = `node-${Date.now()}`;
    
    let defaultName = 'New Script Code';
    let defaultDesc = 'Performs specific computational mapping logic';
    if (type === 'connector') {
      defaultName = 'Stripe Event Dispatch';
      defaultDesc = 'Dispatches payment events';
    } else if (type === 'data') {
      defaultName = 'Postgres Writer';
      defaultDesc = 'Persists results to primary database';
    } else if (type === 'trigger') {
      defaultName = 'Webhook Feed';
      defaultDesc = 'Receives arbitrary incoming HTTP messages';
    }

    const newNode: WorkflowNode = {
      id: uniqueId,
      name: defaultName,
      type: type,
      status: 'idle',
      x: randomX,
      y: randomY,
      description: defaultDesc,
      parameters: {
        timeoutLimit: 3000,
        retryThreshold: 2
      },
      payloadMapping: '{\n  "payload": "$.input"\n}'
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(uniqueId);

    // Prompt log
    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'info',
      message: `Injected New State Node [${defaultName}] on spatial plane.`
    });
  };

  // Delete node
  const handleDeleteNode = (id: string) => {
    if (currentRole === 'External-Reviewer') return;
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Run Flow Simulation Trigger
  const triggerSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    setSimLogs(['[SYSTEM] Booting simulator trace in background...', '[SYSTEM] Parsing transition map. Found 6 states, 6 paths.']);

    // Stagger step activations
    // Step 1: Ingest Intake
    setTimeout(() => {
      setSimLogs(prev => [...prev, '[INCOME] Ingest request arrived at Customer Intake... code 201 Created']);
      setNodes(prev => prev.map(n => n.id === 'node-1' ? { ...n, status: 'success' } : n));
      setSimStep(2);
    }, 1500);

    // Step 2: Data norm
    setTimeout(() => {
      setSimLogs(prev => [...prev, '[LOGIC] Running Data Normalization sanitization check... PASS']);
      setNodes(prev => prev.map(n => n.id === 'node-2' ? { ...n, status: 'success' } : n));
      setSimStep(3);
    }, 3000);

    // Step 3: Payload Enricher (Running)
    setTimeout(() => {
      setSimLogs(prev => [...prev, '[DATA] Dispatching query request to Redshift database [Lakehouse-09] timeout 4000ms...']);
      setNodes(prev => prev.map(n => n.id === 'node-3' ? { ...n, status: 'running' } : n));
      setSimStep(4);
    }, 4500);

    // Step 4: Complete
    setTimeout(() => {
      setSimLogs(prev => [...prev, '[SUCCESS] Redshift query returned matching client context successfully (112ms).', '[SYSTEM] Simulation trace completed successfully. Optimal paths marked green.']);
      setNodes(prev => prev.map(n => {
        if (n.id === 'node-3') return { ...n, status: 'success' };
        if (n.id === 'node-4') return { ...n, status: 'success' };
        if (n.id === 'node-5') return { ...n, status: 'success' };
        return n;
      }));
      setIsSimulating(false);
      setSimStep(5);
    }, 7000);
  };

  // Parse prompt from AI Creator locally
  const handleCompileAiCreator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsCompiling(true);
    setAiCompileLog(['[AI Engine] Analyzing prompt tokens...', '[AI Engine] Matching FSM logic entities...']);

    setTimeout(() => {
      setAiCompileLog(prev => [...prev, '[AI Engine] Embedding parameters... identified pattern [SaaS Intake Routing]']);
    }, 8000);

    setTimeout(() => {
      // Create new set of nodes on the canvas matching the user intent
      const intent = aiPrompt.toLowerCase();
      let generatedNodes: WorkflowNode[] = [];
      let generatedConns: WorkflowConnection[] = [];

      if (intent.includes('onboard') || intent.includes('wizard')) {
        generatedNodes = [
          { id: 'ai-1', name: 'Start Wizard Intake', type: 'trigger', status: 'idle', x: 200, y: 350, description: 'AI generated onboarding entry hook', parameters: {} },
          { id: 'ai-2', name: 'Retrieve User Cache', type: 'data', status: 'idle', x: 450, y: 350, description: 'AI generated datastore retrieval lookup', parameters: {} },
          { id: 'ai-3', name: 'Branch Survey Config', type: 'logic', status: 'idle', x: 700, y: 350, description: 'AI generated branch condition router', parameters: {} },
          { id: 'ai-4', name: 'Stripe Onboarding Success', type: 'connector', status: 'idle', x: 950, y: 280, description: 'AI generated success payout connector', parameters: {} },
          { id: 'ai-5', name: 'Log Invalid Access', type: 'error', status: 'idle', x: 950, y: 440, description: 'AI generated security log recorder', parameters: {} },
        ];
        generatedConns = [
          { id: 'aic-1', fromId: 'ai-1', toId: 'ai-2', status: 'inactive' },
          { id: 'aic-2', fromId: 'ai-2', toId: 'ai-3', status: 'inactive' },
          { id: 'aic-3', fromId: 'ai-3', toId: 'ai-4', status: 'inactive' },
          { id: 'aic-4', fromId: 'ai-3', toId: 'ai-5', status: 'inactive' },
        ];
      } else {
        // Fallback simple flow structure
        generatedNodes = [
          { id: 'ai-1', name: 'AI Sensor Inbound', type: 'trigger', status: 'idle', x: 220, y: 360, description: 'General intake logic listener', parameters: {} },
          { id: 'ai-2', name: 'AI Parser Normalizer', type: 'logic', status: 'idle', x: 500, y: 360, description: 'Analyzes entity payloads', parameters: {} },
          { id: 'ai-3', name: 'Cloud SQL Database', type: 'data', status: 'idle', x: 780, y: 360, description: 'Persists structured logs', parameters: {} },
        ];
        generatedConns = [
          { id: 'aic-1', fromId: 'ai-1', toId: 'ai-2', status: 'inactive' },
          { id: 'aic-2', fromId: 'ai-2', toId: 'ai-3', status: 'inactive' },
        ];
      }

      setNodes(generatedNodes);
      setConnections(generatedConns);
      setSelectedNodeId('ai-1');
      setIsCompiling(false);
      setIsAiCreatorOpen(false);
      
      const now = new Date().toLocaleTimeString();
      onAddLog({
        time: now,
        type: 'success',
        message: 'AI Model [gemini-3.5-flash] successfully formulated and compile-built spatial workflow draft state structures!'
      });
    }, 2800);
  };

  // Helper connection generator: draws SVG spline lines
  const drawLine = (conn: WorkflowConnection) => {
    const from = nodes.find(n => n.id === conn.fromId);
    const to = nodes.find(n => n.id === conn.toId);
    if (!from || !to) return null;

    // Center offset of nodes (width: ~220px, height: ~64px)
    const fromX = from.x + 220;
    const fromY = from.y + 32;
    const toX = to.x;
    const toY = to.y + 32;

    // Control curvature intensity
    const dx = Math.abs(toX - fromX) * 0.55;
    const pathString = `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;

    const isPathSuccess = conn.status === 'success' || (isSimulating && simStep > 1);
    const isPathActive = conn.status === 'active' || (isSimulating && simStep > 0);

    return (
      <g key={conn.id}>
        {/* Glow backdrop support */}
        <path
          d={pathString}
          fill="none"
          stroke={isPathSuccess ? '#10b981' : isPathActive ? '#3b82f6' : '#334155'}
          strokeWidth={4}
          className={`${isPathActive ? 'animate-pulse opacity-60' : 'opacity-20'}`}
        />
        {/* Primary sharp route */}
        <path
          d={pathString}
          fill="none"
          stroke={isPathSuccess ? '#10b981' : isPathActive ? '#3b82f6' : '#1e293b'}
          strokeWidth={2}
          strokeDasharray={isPathActive ? '6,6' : '0'}
          className={isPathActive ? 'animate-dash' : ''}
          style={{ strokeDashoffset: isPathActive ? 12 : 0 }}
        />
      </g>
    );
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-transparent font-sans select-none relative z-10">
      
      {/* 1. LEFT SIDEBAR: DRAGGABLE / CLICKABLE INVENTORY SYSTEM */}
      <aside className="w-64 border-r border-white/10 bg-[#050508]/40 backdrop-blur-3xl flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 tracking-wider font-mono">INVENTORY / NODES</span>
          <span className="text-2xs bg-white/10 border border-white/10 text-slate-200 font-mono py-0.5 px-1.5 rounded">v2.1</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* TRIGGERS */}
          <div>
            <h4 className="text-3xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Triggers</h4>
            <button 
              onClick={() => handleAddNewState('trigger')}
              disabled={currentRole === 'External-Reviewer'}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-white/10 hover:border-indigo-500 bg-white/5 hover:bg-white/10 text-slate-200 text-2xs transition-all pointer group cursor-pointer backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Play size={11} />
                </div>
                <span>Inbound Webhook Feed</span>
              </div>
              <Plus size={11} className="text-slate-500 group-hover:text-emerald-400 transition" />
            </button>
          </div>

          {/* LOGIC ROUTING */}
          <div>
            <h4 className="text-3xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2">Logic Blocks</h4>
            <div className="space-y-1.5">
              <button 
                onClick={() => handleAddNewState('logic')}
                disabled={currentRole === 'External-Reviewer'}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-white/10 hover:border-indigo-400 bg-white/5 hover:bg-white/10 text-slate-205 text-2xs transition transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                    <Cpu size={11} />
                  </div>
                  <span>Branch Router</span>
                </div>
                <Plus size={11} className="text-slate-500" />
              </button>
              
              <button 
                onClick={() => handleAddNewState('script')}
                disabled={currentRole === 'External-Reviewer'}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-white/10 hover:border-indigo-400 bg-white/5 hover:bg-white/10 text-slate-205 text-2xs transition transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-purple-500/15 flex items-center justify-center text-purple-400">
                    <Code size={11} />
                  </div>
                  <span>Inline JavaScript Hook</span>
                </div>
                <Plus size={11} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* DATA PERSISTENCE */}
          <div>
            <h4 className="text-3xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Data Operations</h4>
            <button 
              onClick={() => handleAddNewState('data')}
              disabled={currentRole === 'External-Reviewer'}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-white/10 hover:border-indigo-400 bg-white/5 hover:bg-white/10 text-slate-205 text-2xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Database size={11} />
                </div>
                <span>DB Fetch & Load</span>
              </div>
              <Plus size={11} className="text-slate-500" />
            </button>
          </div>

          {/* DESIGN NOTE / ROLE ENFORCEMENT */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 mt-4">
            <span className="text-3xs font-bold text-slate-400 uppercase font-mono tracking-wider">WORKSPACE TEAM</span>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-2xs text-slate-300 font-medium">Marc <span className="text-slate-500 font-mono font-normal">(Admin)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-2xs text-slate-300 font-medium">Sarah <span className="text-slate-500 font-mono font-normal">(QA Editor)</span></span>
              </div>
              <div className="text-3xs text-slate-400 mt-2 leading-relaxed font-mono">
                Multiplayer Ghost Cursors are active on the workspace view.
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM AI PROMPT LAUNCH BAR */}
        <div className="p-3 border-t border-white/10 bg-white/5">
          <button 
            onClick={() => setIsAiCreatorOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-2xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition backdrop-blur-sm"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>AI Flow Creator</span>
          </button>
        </div>
      </aside>

      {/* 2. CENTER CANVAS WORKSPACE WITH DOT GRID BACKGROUND */}
      <main 
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleCanvasClick}
        className="flex-1 h-full overflow-hidden relative cursor-crosshair select-none bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] bg-[#050508]/10"
      >
        {/* INTERACTION MODE INDICATOR HUD */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#050508]/80 border border-white/10 px-3 py-1.5 rounded-full font-mono text-2xs backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-slate-350">MERCEDES Environment Ingress Pipeline</span>
          <span className="text-white/20">|</span>
          <span className="text-indigo-400 font-bold uppercase">{interactionMode} mode</span>
        </div>

        {/* DYNAMIC CONNECTOR PATHS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map(conn => drawLine(conn))}
        </svg>

        {/* INDIVIDUAL FLUID STATE NODES */}
        {nodes.map(node => {
          const isSelected = node.id === selectedNodeId;
          const statusColors = {
            idle: 'border-white/10 bg-white/5 backdrop-blur-md text-slate-200 hover:border-white/20',
            running: 'border-indigo-500/50 bg-indigo-500/10 backdrop-blur-md text-indigo-100 hover:border-indigo-400 shadow-lg shadow-indigo-500/15',
            success: 'border-emerald-500/50 bg-emerald-500/10 backdrop-blur-md text-emerald-100 hover:border-emerald-400 shadow-lg shadow-emerald-500/15',
            failed: 'border-rose-500/50 bg-rose-500/10 backdrop-blur-md text-rose-100 hover:border-rose-400 shadow-lg shadow-rose-500/15',
            warning: 'border-amber-500/50 bg-amber-500/10 backdrop-blur-md text-amber-100 hover:border-amber-400 shadow-lg shadow-amber-500/15'
          };

          return (
            <div
              key={node.id}
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className={`absolute w-[220px] rounded-xl border p-3 cursor-grab active:cursor-grabbing select-none transition-shadow z-10 ${statusColors[node.status]} ${
                isSelected ? 'ring-2 ring-indigo-500/90 border-transparent shadow-[0_0_15px_rgba(99,102,241,0.25)]' : ''
              }`}
            >
              {/* NODE HEADER */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    node.status === 'success' ? 'bg-emerald-500' :
                    node.status === 'running' ? 'bg-blue-400 animate-ping' :
                    node.status === 'failed' ? 'bg-red-500' : 'bg-slate-500'
                  }`} />
                  <h3 className="text-2xs font-semibold text-slate-100 truncate">{node.name}</h3>
                </div>
                
                {/* REMOVE ACTION */}
                {currentRole !== 'External-Reviewer' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition text-slate-500 hover:bg-slate-800 cursor-pointer"
                    title="Remove state"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>

              {/* NODE CONTENT SUBTEXT */}
              <p className="text-3xs text-slate-400 leading-tight mb-2.5 truncate">{node.description}</p>

              {/* NODE FOOTER SPEC */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-4xs font-mono text-slate-500">
                <span className="uppercase">{node.type}</span>
                {node.outputName && (
                  <span className="text-slate-400 font-semibold truncate max-w-[80px]">⇒ {node.outputName}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* SPATIAL COMMENT PINS */}
        {comments.map(c => (
          <div
            key={c.id}
            style={{ left: c.x, top: c.y }}
            className="absolute z-20 group"
          >
            {/* Clickable Map Pin Bubble */}
            <div className="relative cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 border-2 border-white hover:bg-indigo-400 text-white shadow-lg animate-bounce duration-500">
              <MessageSquare size={13} />
              
              {/* Hover Dropdown Preview */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 font-sans">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-3xs font-medium text-slate-200">{c.author}</span>
                  <span className="text-4xs text-slate-500">{c.time}</span>
                </div>
                <p className="text-3xs text-slate-300 leading-normal">{c.content}</p>
                {c.replies && c.replies.length > 0 && (
                  <p className="text-4xs text-teal-400 font-semibold mt-1">✓ Includes {c.replies.length} developer replies.</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* NEW PIN PLACING GHOST FORM */}
        {placingPinCoords && (
          <div 
            style={{ left: placingPinCoords.x, top: placingPinCoords.y }}
            className="absolute bg-[#050508]/90 border border-white/10 backdrop-blur-xl p-3 rounded-xl z-30 shadow-2xl w-64 text-2xs animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-indigo-400">Place Annotation Pin</span>
              <button onClick={() => setPlacingPinCoords(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={12} />
              </button>
            </div>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="What review notes do we need on this connection coordinates?"
              className="w-full bg-white/5 border border-white/10 p-2 rounded text-slate-200 text-2xs focus:outline-none focus:border-indigo-500/80 resize-none h-16 mb-2.5"
            />
            <button
              onClick={handleCreateComment}
              className="w-full py-1.5 px-3 rounded bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-indigo-500/15"
            >
              <Send size={11} /> Pin Annotation
            </button>
          </div>
        )}

        {/* MULTIPLAYER GHOST CURSORS */}
        {ghosts.map(ghost => {
          if (ghost.status === 'idle' || ghost.cursorX === undefined || ghost.cursorY === undefined) return null;
          return (
            <div 
              key={ghost.id}
              style={{ left: ghost.cursorX, top: ghost.cursorY }}
              className="absolute pointer-events-none z-30 flex flex-col items-start transition-all duration-300 ease-out"
            >
              {/* SVG Pointer Cursor */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 3V17L9 12.5L14 20L17.5 17.5L12.5 10H19.5L4.5 3Z" fill={ghost.cursorColor} stroke="white" strokeWidth="1.5" />
              </svg>
              {/* Member Alert Label */}
              <div 
                style={{ backgroundColor: ghost.cursorColor }}
                className="mt-1 px-1.5 py-0.5 rounded text-[9px] text-white font-semibold flex items-center gap-1 shadow"
              >
                <span>{ghost.name} (is {ghost.status})</span>
              </div>
            </div>
          );
        })}


        {/* 3. MULTI-INTERACTIVE CANVAS FLOATING ACTIONS TOOLBAR (BOTTOM CENTER) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#050508]/80 border border-white/10 p-1.5 rounded-xl shadow-2xl z-20 backdrop-blur-md">
          <button 
            onClick={() => { setInteractionMode('select'); setPlacingPinCoords(null); }}
            className={`p-2 rounded-lg transition cursor-pointer ${
              interactionMode === 'select' ? 'bg-white/15 border border-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
            }`}
            title="Selection/Drag Tool"
          >
            <MousePointer size={14} />
          </button>
          <button 
            onClick={() => { setInteractionMode('comment'); }}
            className={`p-2 rounded-lg transition cursor-pointer ${
              interactionMode === 'comment' ? 'bg-white/15 border border-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
            }`}
            title="Spatial Comment Pin"
          >
            <MapPin size={14} />
          </button>
          
          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

          <button
            onClick={triggerSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-2xs font-bold cursor-pointer shadow-lg shadow-indigo-500/20 backdrop-blur-sm"
          >
            <Play size={10} fill="white" className={isSimulating ? 'animate-ping' : ''} />
            <span>{isSimulating ? 'Trace Running...' : 'Execute Loop'}</span>
          </button>
        </div>


        {/* 4. EXECUTION SIMULATOR PANEL (BOTTOM RIGHT FLOATING TERMINAL) */}
        {(isSimulating || simLogs.length > 0) && (
          <div className="absolute bottom-6 right-6 w-96 max-h-52 bg-[#050508]/90 border border-white/10 rounded-xl shadow-2xl flex flex-col z-20 backdrop-blur-lg">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-indigo-400" />
                <span className="text-3xs font-semibold font-mono text-slate-300">EXECUTION DETAILED TRACE</span>
              </div>
              <button 
                onClick={() => setSimLogs([])}
                className="text-slate-400 hover:text-slate-200 text-3xs cursor-pointer font-mono"
              >
                Clear
              </button>
            </div>
            <div className="p-3 overflow-y-auto space-y-1 bg-white/5 font-mono text-3xs max-h-40 flex flex-col">
              {simLogs.map((log, i) => {
                let colorClass = 'text-slate-400';
                if (log.startsWith('[SUCCESS]') || log.includes('successfully')) colorClass = 'text-emerald-400 font-semibold';
                if (log.startsWith('[SYSTEM]')) colorClass = 'text-indigo-450';
                if (log.startsWith('[LOGIC]')) colorClass = 'text-indigo-305';
                return (
                  <span key={i} className={colorClass}>{log}</span>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 5. RIGHT CONTEXT PANEL: SELECT NODE CONFIGURATION & PARAMS */}
      <aside className="w-80 border-l border-white/10 bg-[#050508]/40 backdrop-blur-3xl flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 tracking-wider font-mono">NODE CONFIGURATION</span>
          <Settings size={13} className="text-slate-400" />
        </div>

        {selectedNode ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Core Info */}
            <div className="space-y-1">
              <label className="text-3xs font-bold text-slate-400 uppercase font-mono">State Tag Title</label>
              <input
                type="text"
                value={nodeNameInput}
                onChange={(e) => setNodeNameInput(e.target.value)}
                disabled={currentRole === 'External-Reviewer'}
                className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-slate-200 text-2xs focus:outline-none focus:border-indigo-500 font-medium font-mono"
              />
              <p className="text-3xs text-slate-400 leading-relaxed pt-1">{selectedNode.description}</p>
            </div>

            {/* Dynamic parameters depending on node spec */}
            <div className="space-y-3">
              <span className="text-3xs font-bold text-slate-400 uppercase font-mono tracking-wider">Execution Parameters</span>
              
              {Object.entries(nodeParams).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-3xs font-mono text-slate-350">{key}</span>
                    <span className="text-4xs bg-white/10 border border-white/10 text-slate-300 px-1 rounded uppercase font-mono">{typeof value}</span>
                  </div>
                  <input
                    type="text"
                    value={String(value)}
                    disabled={currentRole === 'External-Reviewer'}
                    onChange={(e) => {
                      const typedValue = typeof value === 'number' ? Number(e.target.value) : e.target.value;
                      setNodeParams(prev => ({ ...prev, [key]: typedValue }));
                    }}
                    className="w-full bg-white/5 border border-white/10 p-2 rounded text-slate-300 text-2xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              ))}
            </div>

            {/* Ingestion Payload Mapping block */}
            <div className="space-y-1.5 flex flex-col flex-1">
              <span className="text-3xs font-bold text-slate-400 uppercase font-mono tracking-wider">In-flight Payload Mapping</span>
              <textarea
                value={nodeMapping}
                onChange={(e) => setNodeMapping(e.target.value)}
                disabled={currentRole === 'External-Reviewer'}
                className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-slate-300 text-3xs font-mono resize-none focus:outline-none focus:border-indigo-500 h-40 leading-relaxed"
                spellCheck={false}
              />
              <span className="text-4xs text-slate-400 font-mono">Supports JSONPath references e.g. $.body.id</span>
            </div>

            {/* Save trigger button */}
            {currentRole !== 'External-Reviewer' && (
              <button
                onClick={handleSaveNodeParams}
                className="w-full py-2 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-2xs font-bold rounded-lg flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer backdrop-blur-sm"
              >
                <Check size={12} className="text-emerald-400" />
                <span>Save Node Parameters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <HelpCircle size={32} className="text-slate-500 mb-3" />
            <h4 className="text-2xs font-semibold text-slate-400 mb-1">No State Node Selected</h4>
            <p className="text-3xs text-slate-405 leading-normal max-w-[200px] font-mono">
              Double-click any workflow node on the spatial blueprint canvas to open parameter variables config drawer.
            </p>
          </div>
        )}
      </aside>


      {/* 6. MODAL/DRAWER OVERLAYS: AI FLOW CREATOR BACKDROP */}
      {isAiCreatorOpen && (
        <div className="absolute inset-0 bg-[#050508]/60 backdrop-blur-md flex justify-end z-40 animate-fade-in">
          {/* DRAWER FRAME */}
          <div className="w-[450px] h-full bg-[#050508]/85 border-l border-white/10 p-6 flex flex-col text-slate-100 shadow-2xl relative backdrop-blur-3xl">
            <button 
              onClick={() => setIsAiCreatorOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded bg-white/10 border border-white/10 flex items-center justify-center text-teal-400">
                <Sparkles size={14} className="animate-spin" />
              </div>
              <h2 className="text-sm font-semibold tracking-wide">AI Flow Creator Workspace</h2>
            </div>
            
            <p className="text-2xs text-slate-400 leading-relaxed mb-6">
              Write down state relationships or high-level pipeline structures. The generative intelligence auto-compiles standard FSM state maps.
            </p>

            {/* THE PROMPT WRITER */}
            <form onSubmit={handleCompileAiCreator} className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-3xs font-bold text-slate-500 uppercase tracking-widest font-mono">GENERATIVE PROMPT INPUT</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'Configure a secure Onboarding Wizard flow where users enter data, a custom validation node checks credentials, and succeeds or routes to quarantine based on severity.'"
                  className="w-full h-36 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-2xs focus:outline-none resize-none leading-relaxed"
                  disabled={isCompiling}
                />
              </div>

              {/* QUICK SUGGESTIONS CARDS */}
              <div className="space-y-2">
                <span className="text-3xs font-bold text-slate-500 uppercase font-mono">QUICK EXAMPLE STARTERS</span>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setAiPrompt('Build a premium car dealer auction portal flow branching Reserve validations, Inspection feedback, escrow transfers and fallbacks.')}
                    className="p-2 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/10 rounded-lg text-3xs text-slate-400 hover:text-slate-200 cursor-pointer transition"
                  >
                    Dealer Auction Setup Code
                  </div>
                  <div 
                    onClick={() => setAiPrompt('Establish Stripe payment listener with fraud verification, logging context metadata and saving to databases.')}
                    className="p-2 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/10 rounded-lg text-3xs text-slate-400 hover:text-slate-200 cursor-pointer transition"
                  >
                    Stripe Flow Webhook API
                  </div>
                </div>
              </div>

              {/* PROMPT LOGS WRITER */}
              {aiCompileLog.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-3xs space-y-1 max-h-40 overflow-y-auto">
                  {aiCompileLog.map((log, index) => (
                    <div key={index} className="text-slate-400">
                      <span className="text-teal-400 font-semibold">&gt; </span> {log}
                    </div>
                  ))}
                  {isCompiling && (
                    <div className="flex items-center gap-1.5 text-teal-400 font-semibold mt-1">
                      <RefreshCw size={9} className="animate-spin" />
                      <span>Synthesizing state transitions...</span>
                    </div>
                  )}
                </div>
              )}

              {/* ACTION COMPILER */}
              <div className="pt-4 mt-auto">
                <button
                  type="submit"
                  disabled={isCompiling || !aiPrompt}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-600 text-white text-2xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950"
                >
                  {isCompiling ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Compiling FSM Structure...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Compile & Generate Flow Draft</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
