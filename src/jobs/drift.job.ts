import { supabase } from '../lib/supabase';
import { callClaude } from '../ai/claude';
import { logger } from '../lib/logger';

async function runDriftJob(): Promise<void> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('target_role')
    .not('target_role', 'is', null);

  if (!profiles || profiles.length === 0) {
    logger.info('No profiles found for drift detection');
    return;
  }

  const roles = [
    ...new Set(
      (profiles as Array<{ target_role: string }>).map((p) => p.target_role).filter(Boolean)
    ),
  ];

  let alertsCreated = 0;

  for (const role of roles) {
    try {
      const prompt = `What are the top 3 skills for ${role} in Malaysia that have significantly increased in employer demand in the last 6 months but may not appear in a 2023-era CV?
Return as JSON: { "role": string, "new_skills": string[] }
Return ONLY the JSON. No markdown, no code fences.`;

      const response = await callClaude(
        [{ role: 'user', content: prompt }],
        'You are a Malaysian talent market analyst. Return only valid JSON.',
        [],
        512
      );

      const text =
        response.content[0].type === 'text' ? response.content[0].text : '';

      let parsed: { role: string; new_skills: string[] };
      try {
        parsed = JSON.parse(text) as { role: string; new_skills: string[] };
      } catch {
        logger.warn({ role, text }, 'Failed to parse drift detection response');
        continue;
      }

      for (const skillName of parsed.new_skills) {
        const { data: existing } = await supabase
          .from('skill_gaps')
          .select('id')
          .eq('skill_name', skillName)
          .in(
            'user_id',
            (profiles as Array<{ target_role: string; id?: string }>)
              .filter((p) => p.target_role === role)
              .map((p) => p.id)
              .filter(Boolean)
          )
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('drift_alerts').insert({
            target_role: role,
            skill_name: skillName,
            detected_at: new Date().toISOString(),
            actioned: false,
          });
          alertsCreated++;
        }
      }
    } catch (err) {
      logger.error({ err, role }, 'Drift detection failed for role');
    }
  }

  logger.info({ alertsCreated }, 'Drift job completed');
}

export { runDriftJob };
