import { ToolDefinition } from '../../types/agent.types';
import { supabase } from '../../lib/supabase';

const nudgeSchedulerTool: ToolDefinition = {
  name: 'nudge_scheduler',
  description:
    "Call this tool to adjust the user's daily nudge schedule based on their engagement patterns, or to send an immediate nudge when the user's streak is at risk or they have been inactive. This tool updates the schedule in the database — it does not send a message directly.",
  input_schema: {
    type: 'object',
    properties: {
      user_id: { type: 'string' },
      suggested_time: {
        type: 'string',
        description: 'Preferred nudge time in HH:MM format, e.g. 09:00',
      },
      reason: {
        type: 'string',
        description: 'Why this time is being suggested',
      },
      send_immediate_nudge: {
        type: 'boolean',
        default: false,
        description:
          'Whether to also queue an immediate nudge message',
      },
    },
    required: ['user_id', 'suggested_time', 'reason'],
  },
  execute: async (
    input: Record<string, unknown>,
    userId: string
  ): Promise<Record<string, unknown>> => {
    const suggestedTime = input.suggested_time as string;
    const reason = input.reason as string;
    const sendImmediate = (input.send_immediate_nudge as boolean) ?? false;

    await supabase
      .from('profiles')
      .update({ nudge_time: suggestedTime })
      .eq('id', userId);

    let immediateQueued = false;

    if (sendImmediate) {
      await supabase.from('nudge_queue').insert({
        user_id: userId,
        message: reason,
        send_at: new Date().toISOString(),
      });
      immediateQueued = true;
    }

    return {
      updated_time: suggestedTime,
      message: 'Schedule updated',
      immediate_queued: immediateQueued,
    };
  },
};

export { nudgeSchedulerTool };
