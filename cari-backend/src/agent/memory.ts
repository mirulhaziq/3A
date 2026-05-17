import { AgentMemory } from '../types/agent.types';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

async function buildAgentMemory(userId: string): Promise<AgentMemory> {
  const defaults: AgentMemory = {
    user_id: userId,
    target_role: '',
    resume_score: 0,
    streak: 0,
    days_since_last_applied: 0,
    skill_gap_pct: 0,
    open_tasks_count: 0,
    pending_followups: [],
    new_job_matches: 0,
  };

  try {
    const [
      profileResult,
      cvResult,
      applicationResult,
      followupResult,
      skillResult,
      roadmapResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('target_role, streak')
        .eq('id', userId)
        .single(),
      supabase
        .from('cv_versions')
        .select('ats_score')
        .eq('user_id', userId)
        .eq('type', 'master')
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('applications')
        .select('applied_at')
        .eq('user_id', userId)
        .order('applied_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('applications')
        .select('id, applied_at, followup_7_sent, followup_14_sent')
        .eq('user_id', userId)
        .in('status', ['submitted', 'followed_up']),
      supabase
        .from('skill_gaps')
        .select('gap_weight')
        .eq('user_id', userId),
      supabase
        .from('roadmap_weeks')
        .select('id')
        .eq('user_id', userId)
        .eq('completed', false),
    ]);

    const targetRole = (profileResult.data?.target_role as string) ?? '';
    const streak = (profileResult.data?.streak as number) ?? 0;
    const resumeScore = (cvResult.data?.ats_score as number) ?? 0;

    let daysSinceLastApplied = 0;
    if (applicationResult.data?.applied_at) {
      const appliedAt = new Date(applicationResult.data.applied_at as string);
      daysSinceLastApplied = Math.floor(
        (Date.now() - appliedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    const pendingFollowups: Array<{ application_id: string; day: 7 | 14 }> = [];
    if (followupResult.data) {
      for (const app of followupResult.data as Array<{
        id: string;
        applied_at: string;
        followup_7_sent: boolean;
        followup_14_sent: boolean;
      }>) {
        const daysAgo = Math.floor(
          (Date.now() - new Date(app.applied_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (!app.followup_7_sent && daysAgo >= 7) {
          pendingFollowups.push({ application_id: app.id, day: 7 });
        } else if (!app.followup_14_sent && daysAgo >= 14) {
          pendingFollowups.push({ application_id: app.id, day: 14 });
        }
      }
    }

    const gaps = (skillResult.data ?? []) as Array<{ gap_weight: number }>;
    const skillGapPct =
      gaps.length > 0
        ? gaps.reduce((sum, g) => sum + (g.gap_weight ?? 0), 0) / gaps.length
        : 0;

    const openTasksCount = (roadmapResult.data ?? []).length;

    return {
      user_id: userId,
      target_role: targetRole,
      resume_score: resumeScore,
      streak,
      days_since_last_applied: daysSinceLastApplied,
      skill_gap_pct: Math.round(skillGapPct),
      open_tasks_count: openTasksCount,
      pending_followups: pendingFollowups,
      new_job_matches: 0,
    };
  } catch (err) {
    logger.error({ err, userId }, 'Failed to build agent memory, returning defaults');
    return defaults;
  }
}

export { buildAgentMemory };
