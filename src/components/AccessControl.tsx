import React, { useState } from 'react';
import { 
  Lock, 
  UserPlus, 
  Key, 
  Check, 
  User, 
  Copy, 
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { RBACRole } from '../types';

interface AccessControlProps {
  currentRole: RBACRole;
  onRoleChange: (role: RBACRole) => void;
  onAddLog: (log: { time: string; type: string; message: string }) => void;
}

export default function AccessControl({ currentRole, onRoleChange, onAddLog }: AccessControlProps) {
  const [tokenName, setTokenName] = useState('stg-mercedes-listener_key');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedInviteRole, setSelectedInviteRole] = useState<RBACRole>('QA-Operator');

  // Members list
  const [members, setMembers] = useState([
    { id: 'usr-1', name: 'Marc Lopez', email: 'marc@prestige.io', role: 'Owner-Admin', invited: 'Active since Jan 2026' },
    { id: 'usr-2', name: 'Sarah Connor', email: 'sarah@prestige.io', role: 'QA-Operator', invited: 'Active since Feb 2026' },
    { id: 'usr-3', name: 'Alex Tan', email: 'alex@company.com', role: 'External-Reviewer', invited: 'Active since Mar 2026' }
  ]);

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;

    setIsGenerating(true);
    setGeneratedToken(null);

    setTimeout(() => {
      const generated = `prest_ive_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setGeneratedToken(generated);
      setIsGenerating(false);

      const now = new Date().toLocaleTimeString();
      onAddLog({
        time: now,
        type: 'success',
        message: `Provisioned new secret API access client token: [${tokenName}]`
      });

      setToast({
        message: `Success: Generated access credentials for file "${tokenName}" successfully!`,
        type: 'success'
      });
      setTimeout(() => setToast(null), 3500);
    }, 1205);
  };

  const copyTokenToClipboard = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);

    setToast({
      message: "Secret API token copied to clipboard!",
      type: 'info'
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const emailPrefix = inviteEmail.split('@')[0];
    const cleanName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    const newUser = {
      id: `usr-${Date.now()}`,
      name: `${cleanName} (Invited)`,
      email: inviteEmail,
      role: selectedInviteRole,
      invited: 'Invitation Pending'
    };

    setMembers(prev => [...prev, newUser]);
    setInviteEmail('');

    const now = new Date().toLocaleTimeString();
    onAddLog({
      time: now,
      type: 'info',
      message: `Dispatched RBAC email workspace invitation to [${inviteEmail}] with role authority ${selectedInviteRole}`
    });

    setToast({
      message: `Workspace invitation sent to ${inviteEmail} successfully!`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDeleteMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member?.role === 'Owner-Admin') {
      setToast({
        message: "Error: Cannot delete primary Owner-Admin of workspace.",
        type: 'error'
      });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));

    setToast({
      message: `Revoked workspace authorization parameters for user ${member?.name}.`,
      type: 'info'
    });
    setTimeout(() => setToast(null), 3500);
  };

  const authorizations: Record<RBACRole, { scopes: string[]; desc: string }> = {
    'Owner-Admin': {
      scopes: ['*:*', 'flows:write', 'flows:read', 'rbac:manage', 'env:promote'],
      desc: 'Owner access. Unconditional permissions to modify canvas pipelines, provision API tokens, promote environmental stagers, and add peers.'
    },
    'QA-Operator': {
      scopes: ['flows:read', 'eval:test', 'logs:view', 'comments:pin'],
      desc: 'Operator clearance. Full reading capability, permission to place spatial pins on canvas, run execution traces, and copy diagnostic reproduction strings.'
    },
    'External-Reviewer': {
      scopes: ['flows:read', 'logs:view'],
      desc: 'Read-only context. Strict reviewer permission profile. Read-only view on canvas layout maps, execution reports, and logs. Writing is disabled.'
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent font-sans p-6 gap-6 relative z-10">
      
      {/* FLOATING GLASS TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in pointer-events-none">
          <div className={`backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm pointer-events-auto ${
            toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/20' : 'bg-[#050508]/80'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse shrink-0 ${
              toast.type === 'error' ? 'bg-rose-450' : 'bg-emerald-400'
            }`} />
            <div className="flex-1 text-2xs font-bold leading-relaxed font-mono">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* LEFT PORTION: WORKSPACE MEMBERS & ASSIGNMENT RULES (SPAN 8) */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Access Control (RBAC Engine)
            <span className="text-3xs font-mono font-bold bg-white/10 text-teal-400 py-1 px-2.5 rounded-full border border-white/10">
              Active Compliance Check
            </span>
          </h1>
          <p className="text-2xs text-slate-400 leading-normal mt-0.5 font-mono">
            Administer workspace user roles, manage credentials parameters, and audit OAuth environment policies.
          </p>
        </div>

        {/* WORKSPACE MEMBERS LIST CARD */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0 backdrop-blur-md shadow-xl shadow-indigo-550/5">
          <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">WORKSPACE MEMBERS AUDIT LIST</span>
            </div>
            <span className="text-3xs text-slate-400">active: {members.length} peers</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 font-mono text-3xs text-slate-450 uppercase bg-white/3">
                  <th className="py-3 px-5">Member / Email</th>
                  <th className="py-3 px-4 text-center border-l border-white/5">Security Clearance Role</th>
                  <th className="py-3 px-4 border-l border-white/5">Status / Added</th>
                  <th className="py-3 px-4 text-right">Scope Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-white/10 transition">
                    <td className="py-3 px-5">
                      <div>
                        <span className="text-2xs font-semibold text-slate-200 block truncate">{member.name}</span>
                        <span className="text-4xs text-slate-450 font-mono truncate select-all">{member.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center border-l border-white/5">
                      <span className={`inline-block text-[10px] py-0.5 px-2.5 rounded-full font-bold uppercase tracking-wide border ${
                        member.role === 'Owner-Admin' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20' :
                        member.role === 'QA-Operator' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                        'bg-white/5 text-slate-450 border-white/10'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-l border-white/5">
                      <span className="text-3xs text-slate-400 font-mono">{member.invited}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {member.role !== 'Owner-Admin' && (
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1 px-1.5 rounded bg-white/5 border border-white/10 text-slate-455 hover:text-rose-450 transition hover:bg-white/10 cursor-pointer"
                          title="Revoke access"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* INVITATION FORM AND CLIENT TOKEN SETTINGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* USER INVITATION CARD */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-xl shadow-indigo-550/5">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <UserPlus size={13} className="text-teal-400" />
                <h3 className="text-xs font-bold text-slate-200">Invite Workspace Peer</h3>
              </div>
              <p className="text-3xs text-slate-450 leading-normal mb-4 font-mono">
                Grant new users specific compliance credentials. They receive a secure email setup callback loop.
              </p>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="developer@company.com"
                required
                className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-white text-2xs focus:outline-none focus:border-indigo-500 font-mono"
              />

              <div className="flex gap-2">
                <select
                  value={selectedInviteRole}
                  onChange={(e) => setSelectedInviteRole(e.target.value as RBACRole)}
                  className="bg-[#050508]/85 border border-white/10 rounded-lg py-1 px-2.5 text-3xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer flex-1 font-mono md:max-w-[70%]"
                >
                  <option value="QA-Operator" className="bg-[#050508] text-white">QA-Operator</option>
                  <option value="External-Reviewer" className="bg-[#050508] text-white">External-Reviewer</option>
                </select>

                <button
                  type="submit"
                  className="py-1.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-3xs transition cursor-pointer flex-1"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>

          {/* API TOKEN GENERATOR CARD */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-xl shadow-indigo-550/5">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Key size={13} className="text-teal-400" />
                <h3 className="text-xs font-bold text-slate-200">Generate Client API Key</h3>
              </div>
              <p className="text-3xs text-slate-450 leading-normal mb-4 font-mono">
                Establish high-frequency JWT token signatures. Required for connecting external webhooks safely.
              </p>
            </div>

            <form onSubmit={handleGenerateToken} className="space-y-3">
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="stg-mercedes-listener_key"
                className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-white text-2xs focus:outline-none focus:border-indigo-500 font-mono"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-slate-250 hover:text-white font-bold text-3xs border border-white/10 transition cursor-pointer"
                >
                  {isGenerating ? 'Provisioning...' : 'Generate New API Token'}
                </button>
              </div>
            </form>

            {generatedToken && (
              <div className="mt-4 p-2 rounded bg-white/5 border border-white/10 flex justify-between items-center text-4xs font-mono text-indigo-300 animate-fade-in select-all">
                <span className="truncate pr-4 mr-2">{generatedToken}</span>
                <button
                  onClick={copyTokenToClipboard}
                  className="text-indigo-400 hover:text-white cursor-pointer shrink-0 font-bold"
                >
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: SIMULATE ACTIVE ROLE PLAYGROUND (SPAN 4) */}
      <aside className="w-full md:w-80 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-xl shadow-indigo-550/5">
        
        {/* Header wrapper info */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <span className="text-4xs font-bold text-teal-400 font-mono block tracking-widest uppercase">DYNAMIC ROLE SIMULATOR</span>
          <h2 className="text-xs font-bold text-white block mt-1">Simulate Context Clearance</h2>
          <p className="text-3xs text-slate-400 mt-1 font-mono">Interactively select workspace identities to test authorization restrictions.</p>
        </div>

        {/* Content select buttons */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 font-mono">
          
          <div className="space-y-2">
            <span className="text-3xs font-bold text-slate-455 uppercase font-mono pl-1">WORKSPACE IDENTITY SELECTOR</span>
            <div className="grid grid-cols-1 gap-2">
              {(['Owner-Admin', 'QA-Operator', 'External-Reviewer'] as const).map(role => {
                const isActive = currentRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      const now = new Date().toLocaleTimeString();
                      onAddLog({
                        time: now,
                        type: 'info',
                        message: `Switched simulated identity token to: [${role}]`
                      });
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      isActive 
                        ? 'bg-white/12 border-indigo-500/50 ring-2 ring-indigo-500/20 text-white font-bold' 
                        : 'bg-white/5 border-white/10 text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-sans">
                      <User size={13} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className="text-2xs font-semibold">{role}</span>
                    </div>
                    {isActive && <Check size={12} className="text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Auth profile metrics and description */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-indigo-455" />
              <span className="text-3xs font-bold font-mono text-indigo-400 uppercase tracking-widest">Active clearance rules</span>
            </div>
            <p className="text-3xs text-slate-400 leading-relaxed pr-1">{authorizations[currentRole].desc}</p>
          </div>

          {/* Real-time Session JSON context trace block */}
          <div className="space-y-1.5 select-text">
            <span className="text-3xs font-bold text-slate-455 uppercase font-mono tracking-wider block">Session Context JSON</span>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 font-mono text-3xs text-slate-350 leading-normal">
              <pre className="overflow-x-auto whitespace-pre-wrap leading-tight">
{JSON.stringify({
  identity: {
    username: 'marclopez_session_demo',
    simulatedRole: currentRole,
    workspaceId: 'prestige_wsp_01a39f6',
    tokenClearance: currentRole === 'Owner-Admin' ? 'FULL_ROOT' : 'REGULATED'
  },
  authorizedScopes: authorizations[currentRole].scopes,
  compliancePassed: true,
  lastAuditSec: Date.now()
}, null, 2)}
              </pre>
            </div>
          </div>

        </div>

      </aside>

    </div>
  );
}
