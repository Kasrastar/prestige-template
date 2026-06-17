import { 
  WorkflowNode, 
  WorkflowConnection, 
  SpatialComment,
  TransitionItem, 
  Journey, 
  ActivityEvent, 
  Revision, 
  TeamMember 
} from '../types';

export const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'node-1',
    name: 'Customer Intake',
    type: 'trigger',
    status: 'success',
    x: 80,
    y: 180,
    description: 'Listens for payload input via public REST endpoint.',
    parameters: {
      endpoint: '/api/v1/intake/premium',
      method: 'POST',
      authRequired: true,
      rateLimit: 1000
    },
    payloadMapping: '{\n  "clientId": "$.body.id",\n  "tier": "$.body.subscription",\n  "timestamp": "$.headers.date"\n}',
    outputName: 'raw_payload'
  },
  {
    id: 'node-2',
    name: 'Data Normalization',
    type: 'logic',
    status: 'success',
    x: 320,
    y: 180,
    description: 'Cleans, reformats and sanitizes incoming fields.',
    parameters: {
      schema: 'Mercedes-Ingest-V2',
      strictMode: true,
      caseInsensitive: false,
      nullFilter: 'prune'
    },
    payloadMapping: '{\n  "cleaned": true,\n  "payload": {\n    "uuid": "$.raw_payload.clientId",\n    "vip": "$.raw_payload.tier === \'platinum\'"\n  }\n}',
    outputName: 'normalized_profile'
  },
  {
    id: 'node-3',
    name: 'Payload Enricher',
    type: 'data',
    status: 'running',
    x: 580,
    y: 180,
    description: 'Queries internal data lake for matching accounts.',
    parameters: {
      dataSource: 'Redshift-Lakehouse-09',
      timeoutMs: 4000,
      retryCount: 3,
      cacheTTL: 3600
    },
    payloadMapping: '{\n  "accountNumber": "$.normalized_profile.uuid",\n  "enrichmentFields": ["credit_score", "blacklist_status"]\n}',
    outputName: 'enriched_context'
  },
  {
    id: 'node-4',
    name: 'Risk Engine V4',
    type: 'script',
    status: 'idle',
    x: 840,
    y: 120,
    description: 'Applies real-time rule engine algorithms.',
    parameters: {
      scriptName: 'evaluate_risk_matrix.js',
      runtime: 'NodeJS 20.x',
      memoryLimit: '256MB',
      alertThreshold: 0.85
    },
    payloadMapping: '// Javascript evaluation\nconst risk = context.credit_score < 600 ? 0.9 : 0.1;\nreturn { riskScore: risk, status: risk > 0.8 ? "REVIEW" : "PASS" };',
    outputName: 'risk_assessment'
  },
  {
    id: 'node-5',
    name: 'Approve Financing',
    type: 'connector',
    status: 'idle',
    x: 1100,
    y: 180,
    description: 'Submits formal approval request to financial provider.',
    parameters: {
      provider: 'Mercedes-Financial-Services',
      dryRun: false,
      notifyUser: true,
      currency: 'USD'
    },
    payloadMapping: '{\n  "amount": "$.enriched_context.amount",\n  "score": "$.risk_assessment.riskScore"\n}',
    outputName: 'approval_receipt'
  },
  {
    id: 'node-6',
    name: 'Reject Fraud Alert',
    type: 'error',
    status: 'idle',
    x: 840,
    y: 310,
    description: 'Quarantines application and triggers review hooks.',
    parameters: {
      severity: 'CRITICAL',
      escalateTo: 'fraud-squad-internal',
      trackSession: true
    },
    payloadMapping: '{\n  "alertType": "SUSPECTED_FRAUD",\n  "details": "Client failed critical screening."\n}',
    outputName: 'rejection_log'
  }
];

export const INITIAL_CONNECTIONS: WorkflowConnection[] = [
  { id: 'conn-1', fromId: 'node-1', toId: 'node-2', status: 'success' },
  { id: 'conn-2', fromId: 'node-2', toId: 'node-3', status: 'success' },
  { id: 'conn-3', fromId: 'node-3', toId: 'node-4', status: 'active' },
  { id: 'conn-4', fromId: 'node-3', toId: 'node-6', status: 'inactive' },
  { id: 'conn-5', fromId: 'node-4', toId: 'node-5', status: 'inactive' },
  { id: 'conn-6', fromId: 'node-6', toId: 'node-5', status: 'inactive' }
];

export const MOCK_COMMENTS: SpatialComment[] = [
  {
    id: 'comment-1',
    author: 'Sarah K.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content: 'Let’s lower our database query timeout limit to 2000ms here to prevent lag on peaks.',
    time: '23m ago',
    x: 600,
    y: 250,
    resolved: false,
    replies: [
      {
        author: 'Alex T.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        content: 'Makes sense. Staged and ready to adjust.',
        time: '15m ago'
      }
    ]
  },
  {
    id: 'comment-2',
    author: 'Marc L.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'Does this trigger handle raw URL encoding anomalies perfectly?',
    time: '2 hours ago',
    x: 180,
    y: 260,
    resolved: false
  }
];

export const MOCK_TRANSITIONS: TransitionItem[] = [
  {
    id: 't-5-9',
    name: 'Submit Application',
    description: 'Transition client credentials from draft payload to internal assessment queue.',
    sourceState: 'Intake Draft',
    targetState: 'Validation Sandbox',
    category: 'trigger',
    successRate: 99.8,
    avgLatency: 45,
    status: 'optimal'
  },
  {
    id: 't-9-12',
    name: 'Approve Financing',
    description: 'Secure credit rating credentials and dispatch approval token key to main backend.',
    sourceState: 'Enriched context',
    targetState: 'Financing Approved',
    category: 'connector',
    successRate: 98.4,
    avgLatency: 284,
    status: 'optimal'
  },
  {
    id: 't-5-err',
    name: 'Reject Fraud Block',
    description: 'Route risky accounts with high threshold ratings immediately to quarantine storage.',
    sourceState: 'Risk Engine V4',
    targetState: 'Fraud Quarantine',
    category: 'logic',
    successRate: 92.1,
    avgLatency: 112,
    status: 'warning'
  },
  {
    id: 't-0-5',
    name: 'Initialize Draft',
    description: 'Begin baseline lifecycle for any newly arrived client application requests.',
    sourceState: 'Initial Input',
    targetState: 'Intake Draft',
    category: 'data',
    successRate: 85.3,
    avgLatency: 18,
    status: 'degraded'
  },
  {
    id: 't-12-15',
    name: 'Send Webhook Receipt',
    description: 'Dispatches client status changes via webhooks to client-configured HTTP servers.',
    sourceState: 'Receipt Staged',
    targetState: 'Completed Loop',
    category: 'connector',
    successRate: 99.2,
    avgLatency: 72,
    status: 'optimal'
  }
];

export const MOCK_JOURNEYS: Journey[] = [
  {
    id: 'journey-1',
    name: 'Dealer Auction State Controller',
    status: 'running',
    owner: 'Marc Lopez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    version: 'v2.1.0',
    environment: 'MERCEDES',
    successRate: 99.4,
    latency: '112ms',
    lastRun: '1m ago',
    nodesCount: 6
  },
  {
    id: 'journey-2',
    name: 'Onboarding Lead Orchestrator',
    status: 'idle',
    owner: 'Sarah Connor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    version: 'v1.4.10',
    environment: 'BMW',
    successRate: 97.2,
    latency: '82ms',
    lastRun: '40m ago',
    nodesCount: 5
  },
  {
    id: 'journey-3',
    name: 'Stripe Hook Sync Pipeline',
    status: 'failed',
    owner: 'Alex Tan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    version: 'v2.0.2',
    environment: 'DEV',
    successRate: 84.1,
    latency: '310ms',
    lastRun: '4m ago',
    nodesCount: 8
  },
  {
    id: 'journey-4',
    name: 'Predictive Underwriting v4',
    status: 'running',
    owner: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    version: 'v4.1.0',
    environment: 'MERCEDES',
    successRate: 99.9,
    latency: '14ms',
    lastRun: 'Just now',
    nodesCount: 12
  },
  {
    id: 'journey-5',
    name: 'Legacy OAuth Sync Protocol',
    status: 'warning',
    owner: 'Devon Lee',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    version: 'v0.9.4',
    environment: 'DEV',
    successRate: 91.5,
    latency: '1440ms',
    lastRun: '2 hours ago',
    nodesCount: 4
  }
];

export const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'failure',
    title: 'Critical Failure in run-ffd56fc020eb',
    description: 'Transition Rejected Fraud Alert (t-5-err) timed out after 4000ms delay inside MERCEDES-Staging.',
    time: '2m ago',
    read: false,
    meta: { runId: 'run-ffd56fc020eb', environment: 'MERCEDES', transition: 't-5-err' }
  },
  {
    id: 'act-2',
    type: 'mention',
    title: 'Alex T. mentioned you in comments',
    description: '@marclopez I adjusted the payload mapping array in Data Normalization. Review and push to dev.',
    time: '15m ago',
    user: 'Alex Tan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    read: false
  },
  {
    id: 'act-3',
    type: 'pin',
    title: 'Sarah K. dropped a spatial pin',
    description: 'Dropped pin with warning context over t-9-12 "Approve Financing" node connection.',
    time: '1 hour ago',
    user: 'Sarah Connor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    read: true
  },
  {
    id: 'act-4',
    type: 'version',
    title: 'New Snapshot Released',
    description: 'Version v2.1.0 compiled by @marclopez has been promoted to primary target endpoint inside MERCEDES.',
    time: '3 hours ago',
    read: true
  },
  {
    id: 'act-5',
    type: 'security',
    title: 'OAuth Secret Token Revoked',
    description: 'System revoked old API client credential on Stripe Auth module due to 90-day key expiration rule.',
    time: '1 day ago',
    read: true
  }
];

export const MOCK_REVISIONS: Revision[] = [
  {
    id: 'rev-1',
    version: 'v2.1.0',
    author: 'Marc Lopez',
    date: 'Jun 17, 2026 - 15:42',
    description: 'Refined Payload Enricher timeout mechanics and integrated new Redshift server parameters.',
    active: true,
    changes: [
      'Added fallback mapping for empty cell arrays',
      'Increased Data Intake retry threshold count to 3',
      'Configured OAuth strict JWT token encryption routines'
    ]
  },
  {
    id: 'rev-2',
    version: 'v2.0.0',
    author: 'Sarah Connor',
    date: 'Jun 10, 2026 - 11:20',
    description: 'Major state update transitioning from legacy SOAP intake handlers to standard RESTful protocols.',
    active: false,
    changes: [
      'Deprecated Legacy SOAP Client Intake node configuration',
      'Added Customer Intake V2 trigger module',
      'Separated Quarantine stream flow from primary success array'
    ]
  },
  {
    id: 'rev-3',
    version: 'v1.5.4',
    author: 'Alex Tan',
    date: 'Jun 02, 2026 - 09:14',
    description: 'Patched execution memory spikes occurring during intense high-scale batch payload periods.',
    active: false,
    changes: [
      'Enabled lazy cache initialization on internal database connector',
      'Added high-frequency auto-pruning to log telemetry buckets'
    ]
  }
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Marc',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Admin Owner',
    status: 'editing',
    cursorColor: '#10b981', // Emerald
    cursorX: 520,
    cursorY: 160,
    activeNodeId: 'node-3'
  },
  {
    id: 'team-2',
    name: 'Sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'QA Operator',
    status: 'reviewing',
    cursorColor: '#f59e0b', // Amber
    cursorX: 920,
    cursorY: 340,
    activeNodeId: 'node-6'
  },
  {
    id: 'team-3',
    name: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'Developer',
    status: 'idle',
    cursorColor: '#3b82f6', // Blue
  }
];

export const MOCK_TRIAGE_QUEUE = [
  {
    id: 'tri-1',
    timestamp: '2026-06-17 20:01:14',
    environment: 'MERCEDES-Production',
    runId: 'run-9f93ee724',
    trigger: 'Intake Hook Ingress',
    error: 'PayloadParsingError: Unexpected end of JSON input on line 24',
    curl: 'curl -X POST https://engine.prestige.io/api/v1/intake/premium \\\n  -H "Authorization: Bearer prest_live_f691b..." \\\n  -H "Content-Type: application/json" \\\n  -d \'{"clientId": "cl_mercedes_99", "tier":\'',
    status: 'unresolved'
  },
  {
    id: 'tri-2',
    timestamp: '2026-06-17 19:44:02',
    environment: 'BMW-Staging',
    runId: 'run-5cb191dfA',
    trigger: 'Onboarding API',
    error: 'OAuthTokenExpired: Access key expired at server epoch 1781700600',
    curl: 'curl -X GET https://engine.prestige.io/api/v1/user/auth \\\n  -H "X-API-KEY: prest_test_00192abb98fe636"',
    status: 'resolving'
  },
  {
    id: 'tri-3',
    timestamp: '2026-06-17 18:22:15',
    environment: 'DEV-Sandbox',
    runId: 'run-0e1ce8bf1',
    trigger: 'Dummy REST Feed',
    error: 'GatewayTimeout: Server-lake Redshift timeout after 4000ms delay',
    curl: 'curl -X POST https://dev-sandbox.prestige.me/ingest \\\n  -d \'{"mock": true}\'',
    status: 'resolved'
  }
];

export const MOCK_LOGS = [
  { time: '12:00:00.000', type: 'info', message: 'Engine system initialized. Version: 2.1.0' },
  { time: '12:00:00.124', type: 'info', message: 'Loaded 6 FSM state nodes, 6 connections.' },
  { time: '12:00:01.402', type: 'success', message: 'REST listener active on port 3000.' },
  { time: '12:00:02.510', type: 'info', message: 'Telemetry reporter active -> host MERCEDES.' },
  { time: '12:01:10.884', type: 'warning', message: 'High CPU spike on risk matrix processing core (92%).' },
  { time: '12:01:12.193', type: 'info', message: 'Active snapshot promoted: v2.1.0' }
];

export const MARKETPLACE_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Dealer Auction Control Machine',
    category: 'Fintech',
    downloads: '1.2k',
    rating: 4.9,
    author: 'Prestige Core',
    description: 'Failsafe multi-signature bidding state container containing active inspection status, reserve validation flags, and payment routing.',
    nodePreview: ['Start', 'Auction Loop', 'Inspect Vehicle', 'Lock Escrow', 'Payout Done', 'Rollback Error']
  },
  {
    id: 'tpl-2',
    name: 'Stripe webhook payment handler',
    category: 'Integrations',
    downloads: '3.4k',
    rating: 4.8,
    author: 'Stripe Dev Team',
    description: 'Listens to payment_intent triggers, cleans context profiles via risk analyzers and stores metadata records safely into durable DB collections.',
    nodePreview: ['Intake Hook', 'Parse Event', 'Evaluate Fraud', 'DB Record', 'Dispatch Receipt']
  },
  {
    id: 'tpl-3',
    name: 'Dynamic Onboarding Survey wizard',
    category: 'Utilities',
    downloads: '850',
    rating: 4.7,
    author: 'Product Guild',
    description: 'Dynamic survey flow structure designed to present user options, branches automatically based on user choices, and sets custom onboarding tags.',
    nodePreview: ['Trigger Click', 'Load Step 1', 'Eval Choice', 'Redirect Staged', 'Notify Slack']
  }
];
