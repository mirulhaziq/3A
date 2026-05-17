export function buildResumeAnalyzerPrompt(
  cvText: string,
  jdText: string,
  targetRole: string
): string {
  return `You are an expert ATS analyst and career coach specialising in the Malaysian job market. Analyse the CV against the job description for the target role.

TARGET ROLE: ${targetRole}

CV TEXT:
${cvText}

JOB DESCRIPTION:
${jdText}

INSTRUCTIONS:
1. Score the CV against the JD from 0-100 overall, with section scores for:
   Contact, Summary, Experience, Skills, Education

2. Identify every weak bullet in the Experience section — weak means: vague responsibilities without results, missing quantification, no JD keywords, passive voice.

3. For each weak bullet, rewrite it using this formula:
   [Strong action verb] + [specific task/project] + [quantified result] + [JD keyword]

4. Self-check: compare rewritten ATS score to original. If improvement < 10 points, note "NEEDS_RETRY" on that bullet (set needs_retry to true).

5. List all keywords present in the JD but missing from the CV.

Return format: valid JSON matching this EXACT structure:
{
  "ats_score": number,
  "section_scores": [{ "name": string, "score": number, "issues": string[] }],
  "rewrites": [{ "original": string, "rewritten": string, "improvement": number, "needs_retry": boolean }],
  "keyword_gaps": string[],
  "overall_verdict": string
}

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no code fences.`;
}
