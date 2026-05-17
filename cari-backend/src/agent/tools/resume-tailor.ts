import { ToolDefinition } from '../../types/agent.types';
import { supabase } from '../../lib/supabase';
import { callClaude } from '../../ai/claude';
import { buildResumeAnalyzerPrompt } from '../../ai/prompts/resume-analyzer';
import { logger } from '../../lib/logger';

const resumeTailorTool: ToolDefinition = {
  name: 'resume_tailor',
  description:
    'Call this tool ONLY when the user has clicked Apply on a specific job and their master CV needs to be tailored for that exact job description. This tool rewrites only the relevant sections of the CV to match the JD keywords, required skills, and company tone. It does NOT submit or send anything — it returns a tailored CV draft that must be reviewed and approved by the user before use.',
  input_schema: {
    type: 'object',
    properties: {
      job_id: {
        type: 'string',
        description: 'The Supabase ID of the job the user is applying to',
      },
      jd_id: {
        type: 'string',
        description: 'The Supabase ID from the job_descriptions table (preferred over jd_text)',
      },
      jd_text: {
        type: 'string',
        description: 'Raw JD text if jd_id is not available',
      },
    },
    required: ['job_id'],
  },
  execute: async (
    input: Record<string, unknown>,
    userId: string
  ): Promise<Record<string, unknown>> => {
    const jobId = input.job_id as string;
    const jdId = input.jd_id as string | undefined;
    let jdText = input.jd_text as string | undefined;

    // Resolve JD text from DB if jd_id is provided
    if (jdId) {
      const { data: jdRecord, error: jdError } = await supabase
        .from('job_descriptions')
        .select('raw_text, job_title, company')
        .eq('id', jdId)
        .eq('user_id', userId)
        .single();

      if (jdError || !jdRecord) {
        throw new Error('Job description not found in database');
      }

      jdText = jdRecord.raw_text as string;
    }

    if (!jdText) {
      throw new Error('Either jd_id or jd_text must be provided');
    }

    const { data: cvData, error: cvError } = await supabase
      .from('cv_versions')
      .select('id, cv_text, ats_score')
      .eq('user_id', userId)
      .eq('type', 'master')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cvError || !cvData) {
      throw new Error('Master CV not found for user');
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('target_role')
      .eq('id', userId)
      .single();

    const targetRole = profileData?.target_role ?? 'the target role';

    const analysisPrompt = buildResumeAnalyzerPrompt(
      cvData.cv_text as string,
      jdText,
      targetRole
    );

    const analysisResponse = await callClaude(
      [{ role: 'user', content: analysisPrompt }],
      'You are an expert ATS analyst. Return only valid JSON.',
      [],
      4096
    );

    const analysisText =
      analysisResponse.content[0].type === 'text'
        ? analysisResponse.content[0].text
        : '';

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(analysisText) as Record<string, unknown>;
    } catch {
      throw new Error('Failed to parse resume analysis response');
    }

    const tailorPrompt = `You are an expert CV writer. Below is a master CV and a job description.
Rewrite ONLY the bullets and summary sections that are weak or missing JD keywords.
Keep everything else unchanged.
Return the complete tailored CV as plain text.

MASTER CV:
${cvData.cv_text}

JOB DESCRIPTION:
${jdText}

WEAK SECTIONS IDENTIFIED:
${JSON.stringify((analysis as { rewrites?: unknown[] }).rewrites ?? [])}`;

    const tailorResponse = await callClaude(
      [{ role: 'user', content: tailorPrompt }],
      'You are an expert CV writer for Malaysian job seekers. Return only the plain text of the rewritten CV.',
      [],
      4096
    );

    const tailoredCvText =
      tailorResponse.content[0].type === 'text'
        ? tailorResponse.content[0].text
        : '';

    const scorePrompt = buildResumeAnalyzerPrompt(tailoredCvText, jdText, targetRole);
    const scoreResponse = await callClaude(
      [{ role: 'user', content: scorePrompt }],
      'You are an expert ATS analyst. Return only valid JSON.',
      [],
      4096
    );

    const scoreText =
      scoreResponse.content[0].type === 'text'
        ? scoreResponse.content[0].text
        : '';

    let atsScore: number;
    try {
      const scoreResult = JSON.parse(scoreText) as { ats_score: number };
      atsScore = scoreResult.ats_score;
    } catch {
      atsScore = 70;
    }

    let finalCvText = tailoredCvText;

    if (atsScore < 72) {
      logger.info({ atsScore }, 'ATS score below threshold, retrying tailoring');

      const retryPrompt = `The CV below scored ${atsScore}/100 on ATS for this job. Rewrite it again with MORE of these JD keywords explicitly included: ${jdText.slice(0, 500)}. Return only the full CV as plain text.

CV TO IMPROVE:
${tailoredCvText}`;

      const retryResponse = await callClaude(
        [{ role: 'user', content: retryPrompt }],
        'You are an expert CV writer. Return only the plain text CV.',
        [],
        4096
      );

      finalCvText =
        retryResponse.content[0].type === 'text'
          ? retryResponse.content[0].text
          : tailoredCvText;

      const finalScoreResponse = await callClaude(
        [{ role: 'user', content: buildResumeAnalyzerPrompt(finalCvText, jdText, targetRole) }],
        'You are an expert ATS analyst. Return only valid JSON.',
        [],
        4096
      );
      const finalScoreText =
        finalScoreResponse.content[0].type === 'text'
          ? finalScoreResponse.content[0].text
          : '';
      try {
        const finalScore = JSON.parse(finalScoreText) as { ats_score: number };
        atsScore = finalScore.ats_score;
      } catch {
        // keep previous score
      }
    }

    const { data: saved, error: saveError } = await supabase
      .from('cv_versions')
      .insert({
        user_id: userId,
        type: 'tailored',
        job_id: jobId,
        jd_id: jdId ?? null,
        cv_text: finalCvText,
        ats_score: atsScore,
      })
      .select('id')
      .single();

    if (saveError || !saved) {
      throw new Error('Failed to save tailored CV');
    }

    const rewrites = (analysis as { rewrites?: Array<{ original: string; rewritten: string }> }).rewrites ?? [];

    return {
      tailored_cv_id: saved.id as string,
      ats_score: atsScore,
      changes_summary: `Tailored CV for ${targetRole} — ATS score: ${atsScore}/100`,
      diff: {
        original_bullets: rewrites.map((r) => r.original),
        rewritten_bullets: rewrites.map((r) => r.rewritten),
      },
    };
  },
};

export { resumeTailorTool };
