import { getSupabaseAdmin } from '../lib/supabase';
import {
  GPT4_MODEL,
  getGPT4Client,
} from '../lib/openai';
import {
  analysisResultSchema,
  type AnalysisRequestInput,
  type AnalysisResult,
} from '../schemas/analysis.schema';
import type { Json } from '../types/database.types';

interface SavedAnalysisResponse {
  id: string;
  jobId: string | null;
  model: string;
  result: AnalysisResult;
  createdAt: string;
}

async function analyseCvAgainstJob(
  userId: string,
  input: AnalysisRequestInput
): Promise<SavedAnalysisResponse> {
  const result = await generateAnalysis(input);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('analysis_results')
    .insert({
      user_id: userId,
      job_id: input.jobId ?? null,
      match_score: result.matchScore,
      label: result.label,
      cuppy_state: result.cuppyState,
      result: toJson(result),
    })
    .select('id,job_id,created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Write latest scores back to profile so dashboard reflects them
  const skillMatch = Math.round(
    (result.presentKeywords.length /
      Math.max(1, result.presentKeywords.length + result.missingKeywords.length)) *
      100
  );
  await supabase
    .from('profiles')
    .update({ ats_score: result.matchScore, skill_match: skillMatch })
    .eq('id', userId);

  return {
    id: data.id,
    jobId: data.job_id,
    model: GPT4_MODEL,
    result,
    createdAt: data.created_at,
  };
}

async function generateAnalysis(
  input: AnalysisRequestInput
): Promise<AnalysisResult> {
  const openai = getGPT4Client();

  const completion = await openai.chat.completions.create({
    model: GPT4_MODEL,
    temperature: 0.2,
    max_tokens: 1800,
    messages: [
      {
        role: 'system',
        content:
          'You are Cari, an AI career co-pilot for fresh tech graduates and career pivoters. Return only valid JSON. Be direct, practical, and supportive. Do not include markdown.',
      },
      {
        role: 'user',
        content: buildAnalysisPrompt(input),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned an empty analysis response.');
  }

  const parsed = parseJsonObject(content);
  return analysisResultSchema.parse(parsed);
}

function buildAnalysisPrompt(input: AnalysisRequestInput): string {
  return `
Compare the candidate CV against the job description.

Return exactly this JSON shape:
{
  "matchScore": 0,
  "label": "Strong Match | Close Match | Not Ready Yet",
  "cuppyState": "happy | judgy | thinking | celebrate | idle",
  "verdict": "short practical verdict",
  "strengths": [{ "title": "string", "description": "string" }],
  "gaps": [{ "title": "string", "fix": "string" }],
  "cvFixes": [{ "original": "string", "rewritten": "string" }],
  "missingKeywords": ["string"],
  "presentKeywords": ["string"]
}

Rules:
- matchScore must be an integer from 0 to 100.
- Use "Strong Match" for 80+, "Close Match" for 55-79, and "Not Ready Yet" for below 55.
- Choose cuppyState based on the result: celebrate/happy for strong, judgy/thinking for close or weak.
- Include 3 strengths when possible.
- Include 3 gaps with concrete fixes. If the CV already has a skill, do NOT say the candidate lacks it.
- Include 2-4 CV bullet rewrites in cvFixes — ONLY rewrite vague or passive experience/project bullet points. NEVER include technical skill listings (e.g. "Languages: Go, Python") as cvFixes originals — those are already correct format.
- Keep rewritten bullets specific and metric-oriented, but do not invent employer names.
- If the CV mentions a language/tool (e.g. "Go", "Python"), do NOT list it as a gap.

CV:
${input.cvText}

JOB DESCRIPTION:
${input.jobDescription}
`.trim();
}

function parseJsonObject(content: string): unknown {
  try {
    const trimmed = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    return JSON.parse(trimmed);
  } catch {
    throw new Error('Failed to parse AI analysis JSON.');
  }
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export { analyseCvAgainstJob };
export type { SavedAnalysisResponse };
