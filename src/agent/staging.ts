import { StagedAction, AgentToolName } from '../types/agent.types';
import { supabase } from '../lib/supabase';

async function stageAction(
  userId: string,
  toolName: AgentToolName,
  input: Record<string, unknown>,
  output: Record<string, unknown>
): Promise<StagedAction> {
  const { data, error } = await supabase
    .from('staged_actions')
    .insert({
      user_id: userId,
      tool_name: toolName,
      input,
      output,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to stage action: ${error?.message}`);
  }

  return data as StagedAction;
}

async function getStagedActions(userId: string): Promise<StagedAction[]> {
  const { data, error } = await supabase
    .from('staged_actions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get staged actions: ${error.message}`);
  }

  return (data ?? []) as StagedAction[];
}

async function approveAction(
  actionId: string,
  userId: string
): Promise<StagedAction> {
  const { data, error } = await supabase
    .from('staged_actions')
    .update({ status: 'approved' })
    .eq('id', actionId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to approve action: ${error?.message}`);
  }

  return data as StagedAction;
}

async function rejectAction(
  actionId: string,
  userId: string
): Promise<StagedAction> {
  const { data, error } = await supabase
    .from('staged_actions')
    .update({ status: 'rejected' })
    .eq('id', actionId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to reject action: ${error?.message}`);
  }

  return data as StagedAction;
}

async function observeOutcome(
  actionId: string,
  userId: string,
  outcome: 'sent' | 'rejected' | 'edited'
): Promise<void> {
  const { data: action } = await supabase
    .from('staged_actions')
    .select('tool_name')
    .eq('id', actionId)
    .single();

  await supabase
    .from('staged_actions')
    .update({ status: outcome === 'sent' ? 'sent' : 'rejected' })
    .eq('id', actionId)
    .eq('user_id', userId);

  await supabase.from('learning_log').insert({
    user_id: userId,
    tool_name: action?.tool_name,
    outcome,
    timestamp: new Date().toISOString(),
  });
}

export { stageAction, getStagedActions, approveAction, rejectAction, observeOutcome };
