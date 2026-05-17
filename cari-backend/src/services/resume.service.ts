import { ResumeAnalysis } from '../types';
import { parseCV } from '../lib/pdf-parser';
import { supabase } from '../lib/supabase';
import { callClaude } from '../ai/claude';
import { buildResumeAnalyzerPrompt } from '../ai/prompts/resume-analyzer';
import { logger } from '../lib/logger';

async function analyzeResume(
  buffer: Buffer,
  mimetype: string,
  jdText: string,
  targetRole: string,
  userId: string
): Promise<{ analysis: ResumeAnalysis; cvId: string }> {
  const cvText = await parseCV(buffer, mimetype);

  const ext = mimetype === 'application/pdf' ? 'pdf' : 'docx';
  const storagePath = `${userId}/master.${ext}`;

  await supabase.storage.from('cvs').upload(storagePath, buffer, {
    contentType: mimetype,
    upsert: true,
  });

  const { data: cvRecord, error: cvError } = await supabase
    .from('cv_versions')
    .insert({
      user_id: userId,
      type: 'master',
      cv_text: cvText,
      ats_score: 0,
      storage_path: storagePath,
    })
    .select('id')
    .single();

  if (cvError || !cvRecord) {
    throw new Error('Failed to create CV record');
  }

  const cvId = cvRecord.id as string;

  const prompt = buildResumeAnalyzerPrompt(cvText, jdText, targetRole);
  const response = await callClaude(
    [{ role: 'user', content: prompt }],
    'You are an expert ATS analyst. Return only valid JSON.',
    [],
    4096
  );

  const responseText =
    response.content[0].type === 'text' ? response.content[0].text : '';

  let analysis: ResumeAnalysis;
  try {
    analysis = JSON.parse(responseText) as ResumeAnalysis;
  } catch {
    throw new Error('Failed to parse resume analysis JSON');
  }

  // Self-correction pass for bullets marked needs_retry
  const retryBullets = analysis.rewrites.filter((r) => r.needs_retry);

  if (retryBullets.length > 0) {
    const retryPrompt = `The following CV bullets scored poorly on ATS for the role "${targetRole}".
Rewrite each one to significantly improve the ATS score. Use stronger action verbs and include more JD-specific keywords.
JD context: ${jdText.slice(0, 600)}

Bullets to improve:
${retryBullets.map((b, i) => `${i + 1}. ${b.original}`).join('\n')}

Return valid JSON array: [{ "original": string, "rewritten": string, "improvement": number, "needs_retry": false }]
Return ONLY the JSON array.`;

    try {
      const retryResponse = await callClaude(
        [{ role: 'user', content: retryPrompt }],
        'You are an expert CV rewriter. Return only valid JSON.',
        [],
        2048
      );

      const retryText =
        retryResponse.content[0].type === 'text'
          ? retryResponse.content[0].text
          : '[]';

      const retryResults = JSON.parse(retryText) as Array<{
        original: string;
        rewritten: string;
        improvement: number;
        needs_retry: boolean;
      }>;

      for (const retried of retryResults) {
        const idx = analysis.rewrites.findIndex(
          (r) => r.original === retried.original
        );
        if (idx !== -1) {
          analysis.rewrites[idx] = retried;
        }
      }
    } catch (err) {
      logger.warn({ err }, 'Self-correction pass failed, keeping original rewrites');
    }
  }

  const finalAtsScore =
    analysis.section_scores.length > 0
      ? Math.round(
          analysis.section_scores.reduce((sum, s) => sum + s.score, 0) /
            analysis.section_scores.length
        )
      : analysis.ats_score;

  analysis.ats_score = finalAtsScore;

  await supabase
    .from('cv_versions')
    .update({ ats_score: finalAtsScore })
    .eq('id', cvId);

  return { analysis, cvId };
}

export { analyzeResume };
