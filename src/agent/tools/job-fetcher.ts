import { ToolDefinition } from '../../types/agent.types';
import { supabase } from '../../lib/supabase';

const jobFetcherTool: ToolDefinition = {
  name: 'job_fetcher',
  description:
    "Call this tool to retrieve saved job descriptions the user has captured via the Chrome extension but has not yet applied to. Returns jobs ranked by compatibility score. Use when the user has been inactive for 2+ days or when they have unactioned saved jobs.",
  input_schema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        default: 5,
        description: 'Maximum number of jobs to return',
      },
      min_compatibility: {
        type: 'number',
        default: 0,
        description: 'Minimum compatibility percentage filter',
      },
    },
    required: [],
  },
  execute: async (
    input: Record<string, unknown>,
    userId: string
  ): Promise<Record<string, unknown>> => {
    const limit = (input.limit as number) ?? 5;
    const minCompatibility = (input.min_compatibility as number) ?? 0;

    const { data, error } = await supabase
      .from('job_descriptions')
      .select('id, job_title, company, location, compatibility_pct, source_url, created_at')
      .eq('user_id', userId)
      .eq('applied', false)
      .gte('compatibility_pct', minCompatibility)
      .order('compatibility_pct', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch saved jobs: ${error.message}`);
    }

    const jobs = data ?? [];

    if (jobs.length === 0) {
      return {
        jobs: [],
        message:
          'No saved jobs found. Ask the user to capture a job using the Chrome extension.',
      };
    }

    return { jobs };
  },
};

export { jobFetcherTool };
