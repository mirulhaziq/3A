export function buildSkillMatcherPrompt(
  cvText: string,
  jdText: string,
  targetRole: string
): string {
  return `You are a senior HR analyst specialising in skills gap assessment for the Malaysian tech and finance industry. Perform a detailed skills comparison between this candidate and the job requirements.

TARGET ROLE: ${targetRole}

CV TEXT:
${cvText}

JOB DESCRIPTION:
${jdText}

INSTRUCTIONS:
1. Extract all skills mentioned in the CV
2. Extract all required and preferred skills from the JD
3. Classify each skill into one of: technical, tool, soft, domain
4. For each skill, assign:
   - user_score: 0-100 based on how strongly it appears in the CV (100 = expert with evidence, 0 = not mentioned)
   - benchmark_score: 0-100 based on how important it is for the target role (100 = mandatory, 0 = irrelevant)
   - gap: benchmark_score - user_score (negative means user exceeds benchmark)
5. Compute overall compatibility_pct: weighted average of (user_score / benchmark_score) per skill, capped at 100
6. Identify top_gaps: the 3 skills with the highest positive gap value (most critical missing skills)

Return format: valid JSON matching this EXACT structure:
{
  "compatibility_pct": number,
  "skills": [{ "name": string, "category": string, "user_score": number, "benchmark_score": number, "gap": number }],
  "top_gaps": [{ "name": string, "category": string, "user_score": number, "benchmark_score": number, "gap": number }]
}

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no code fences.`;
}
