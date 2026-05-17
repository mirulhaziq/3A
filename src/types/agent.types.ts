export type AgentToolName =
  | 'resume_tailor'
  | 'email_draft'
  | 'job_fetcher'
  | 'nudge_scheduler';

export type StagedActionStatus = 'pending' | 'approved' | 'rejected' | 'sent';

export interface AgentMemory {
  user_id: string;
  target_role: string;
  resume_score: number;
  streak: number;
  days_since_last_applied: number;
  skill_gap_pct: number;
  open_tasks_count: number;
  pending_followups: Array<{ application_id: string; day: 7 | 14 }>;
  new_job_matches: number;
}

export interface StagedAction {
  id: string;
  user_id: string;
  tool_name: AgentToolName;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: StagedActionStatus;
  created_at: string;
}

export interface ToolDefinition {
  name: AgentToolName;
  description: string;
  input_schema: Record<string, unknown>;
  execute: (
    input: Record<string, unknown>,
    userId: string
  ) => Promise<Record<string, unknown>>;
}
