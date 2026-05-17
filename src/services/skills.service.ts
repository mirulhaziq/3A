import { SkillGapResult } from '../types';
import { supabase } from '../lib/supabase';
import { callClaude } from '../ai/claude';
import { embed } from '../ai/embeddings';
import { buildSkillMatcherPrompt } from '../ai/prompts/skill-matcher';

async function computeSkillGap(
  cvText: string,
  jdText: string,
  targetRole: string,
  userId: string
): Promise<SkillGapResult> {
  const prompt = buildSkillMatcherPrompt(cvText, jdText, targetRole);
  const response = await callClaude(
    [{ role: 'user', content: prompt }],
    'You are an expert skills analyst. Return only valid JSON.',
    [],
    4096
  );

  const responseText =
    response.content[0].type === 'text' ? response.content[0].text : '';

  let result: SkillGapResult;
  try {
    result = JSON.parse(responseText) as SkillGapResult;
  } catch {
    throw new Error('Failed to parse skill gap analysis JSON');
  }

  for (const skill of result.skills) {
    let embedding: number[] | null = null;
    try {
      embedding = await embed(skill.name);
    } catch {
      // embedding optional
    }

    await supabase.from('skill_gaps').upsert(
      {
        user_id: userId,
        skill_name: skill.name,
        category: skill.category,
        user_score: skill.user_score,
        benchmark_score: skill.benchmark_score,
        gap_weight: skill.gap,
        skill_embedding: embedding,
      },
      { onConflict: 'user_id,skill_name' }
    );
  }

  return result;
}

async function updateSkillCompletion(
  skillId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('skill_gaps')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', skillId)
    .eq('user_id', userId);

  const { data: allSkills } = await supabase
    .from('skill_gaps')
    .select('user_score, benchmark_score')
    .eq('user_id', userId);

  if (allSkills && allSkills.length > 0) {
    const skills = allSkills as Array<{ user_score: number; benchmark_score: number }>;
    const compatPct =
      skills.reduce((sum, s) => {
        const ratio = s.benchmark_score > 0 ? s.user_score / s.benchmark_score : 1;
        return sum + Math.min(ratio, 1);
      }, 0) /
      skills.length *
      100;

    await supabase
      .from('profiles')
      .update({ compatibility_pct: Math.round(compatPct) })
      .eq('id', userId);
  }
}

export { computeSkillGap, updateSkillCompletion };
