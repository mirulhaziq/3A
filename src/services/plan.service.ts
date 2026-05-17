import { RoadmapWeek, SkillCategory, SkillGap } from '../types';
import { supabase } from '../lib/supabase';
import { callClaude } from '../ai/claude';
import { buildPlanGeneratorPrompt } from '../ai/prompts/plan-generator';
import { updateSkillCompletion } from './skills.service';

async function generateRoadmap(
  userId: string,
  targetRole: string,
  weeks: number
): Promise<RoadmapWeek[]> {
  const { data: gapRows } = await supabase
    .from('skill_gaps')
    .select('skill_name, category, gap_weight, benchmark_score')
    .eq('user_id', userId)
    .order('gap_weight', { ascending: false })
    .limit(5);

  const gaps: SkillGap[] = (gapRows ?? []).map(
    (r: { skill_name: string; category: string; gap_weight: number; benchmark_score: number }) => ({
      name: r.skill_name,
      category: toSkillCategory(r.category),
      gap: r.gap_weight,
      benchmark_score: r.benchmark_score,
    })
  );

  const prompt = buildPlanGeneratorPrompt(gaps, targetRole, weeks);
  const response = await callClaude(
    [{ role: 'user', content: prompt }],
    'You are a career development coach. Return only valid JSON.',
    [],
    4096
  );

  const responseText =
    response.content[0].type === 'text' ? response.content[0].text : '';

  let roadmapWeeks: RoadmapWeek[];
  try {
    roadmapWeeks = JSON.parse(responseText) as RoadmapWeek[];
  } catch {
    throw new Error('Failed to parse roadmap JSON');
  }

  await supabase.from('roadmap_weeks').delete().eq('user_id', userId);

  const rows = roadmapWeeks.map((w) => ({
    user_id: userId,
    week_number: w.week_number,
    skill_focus: w.skill_focus,
    daily_time_minutes: w.daily_time_minutes,
    resources: w.resources,
    milestone_project: w.milestone_project,
    completed: false,
  }));

  await supabase.from('roadmap_weeks').insert(rows);

  return roadmapWeeks;
}

async function markSkillComplete(
  skillId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('roadmap_weeks')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', skillId)
    .eq('user_id', userId);

  const { data: week } = await supabase
    .from('roadmap_weeks')
    .select('skill_focus')
    .eq('id', skillId)
    .single();

  if (week?.skill_focus) {
    const { data: skillGap } = await supabase
      .from('skill_gaps')
      .select('id')
      .eq('user_id', userId)
      .eq('skill_name', week.skill_focus)
      .single();

    if (skillGap?.id) {
      await updateSkillCompletion(skillGap.id as string, userId);
    }
  }
}

function toSkillCategory(category: string): SkillCategory {
  const skillCategories: readonly SkillCategory[] = [
    'technical',
    'tool',
    'soft',
    'domain',
  ];

  return skillCategories.includes(category as SkillCategory)
    ? (category as SkillCategory)
    : 'technical';
}

export { generateRoadmap, markSkillComplete };
