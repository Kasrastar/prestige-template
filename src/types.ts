export interface WorkflowNode {
  id: string;
  name: string;
  type: 'trigger' | 'logic' | 'data' | 'connector' | 'integration' | 'script' | 'error';
  status: 'idle' | 'running' | 'success' | 'failed' | 'warning';
  x: number;
  y: number;
  description: string;
  parameters: Record<string, string | number | boolean>;
  payloadMapping?: string;
  outputName?: string;
}

export interface WorkflowConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  status: 'inactive' | 'active' | 'success' | 'failed';
}

export interface SpatialComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  x: number;
  y: number;
  resolved: boolean;
  replies?: Array<{
    author: string;
    avatar: string;
    content: string;
    time: string;
  }>;
}

export interface TransitionItem {
  id: string;
  name: string;
  description: string;
  sourceState: string;
  targetState: string;
  category: 'logic' | 'data' | 'connector' | 'trigger';
  successRate: number;
  avgLatency: number;
  status: 'optimal' | 'warning' | 'degraded';
}

export interface Journey {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'failed' | 'warning';
  owner: string;
  avatar: string;
  version: string;
  environment: 'MERCEDES' | 'BMW' | 'DEV';
  successRate: number;
  latency: string;
  lastRun: string;
  nodesCount: number;
}

export interface ActivityEvent {
  id: string;
  type: 'mention' | 'failure' | 'pin' | 'version' | 'security';
  title: string;
  description: string;
  time: string;
  user?: string;
  avatar?: string;
  read: boolean;
  meta?: Record<string, any>;
}

export interface Revision {
  id: string;
  version: string;
  author: string;
  date: string;
  description: string;
  active: boolean;
  changes: string[];
}

export interface MetricCard {
  label: string;
  value: string | number;
  changeValue: string;
  isPositive: boolean;
  subtext: string;
}

export type RBACRole = 'Owner-Admin' | 'QA-Operator' | 'External-Reviewer';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'idle' | 'editing' | 'reviewing';
  cursorColor: string;
  cursorX?: number;
  cursorY?: number;
  activeNodeId?: string;
}
