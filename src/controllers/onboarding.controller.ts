import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { streamToSSE, callClaude } from '../ai/claude';
import { JUDGY_SYSTEM_PROMPT } from '../ai/prompts/judgy-persona';
import { supabase } from '../lib/supabase';
import { generateRoadmap } from '../services/plan.service';
import { computeSkillGap } from '../services/skills.service';
import { RealityCheckReport } from '../types';
import type { MessageParam } from '../ai/claude';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const chatBodySchema = z.object({
  messages: z.array(messageSchema),
  cvText: z.string().optional(),
  targetRole: z.string().optional(),
});

const completeBodySchema = z.object({
  messages: z.array(messageSchema),
  cvScore: z.number().optional(),
  targetRole: z.string(),
  goalWeeks: z.number().default(12),
});

async function chat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = chatBodySchema.parse(req.body);

    const messages: MessageParam[] = body.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamToSSE(res, messages, JUDGY_SYSTEM_PROMPT);
  } catch (err) {
    next(err);
  }
}

async function complete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = completeBodySchema.parse(req.body);
    const userId = req.user.id;

    const conversationSummary = body.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const reportPrompt = `Based on this onboarding conversation, generate a reality check report for a Malaysian fresh graduate.

CONVERSATION:
${conversationSummary}

CV ATS Score (if available): ${body.cvScore ?? 'Not assessed'}
Target Role: ${body.targetRole}

Return valid JSON matching this exact structure:
{
  "ats_score": number,
  "realistic_timeline_weeks": number,
  "top_blockers": string[],
  "priority_actions": string[],
  "overall_assessment": string
}

Return ONLY the JSON object. No markdown, no code fences.`;

    const response = await callClaude(
      [{ role: 'user', content: reportPrompt }],
      'You are a senior Malaysian recruiter generating an honest career assessment. Return only valid JSON.',
      [],
      2048
    );

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    let report: RealityCheckReport;
    try {
      report = JSON.parse(responseText) as RealityCheckReport;
    } catch {
      throw new Error('Failed to parse reality check report');
    }

    await supabase.from('onboarding_sessions').insert({
      user_id: userId,
      messages_json: body.messages,
      reality_report: report,
      completed_at: new Date().toISOString(),
    });

    await supabase.from('profiles').upsert({
      id: userId,
      onboarding_complete: true,
      target_role: body.targetRole,
      goal_weeks: body.goalWeeks,
    });

    // Background: trigger roadmap and skill gap without awaiting
    Promise.all([
      generateRoadmap(userId, body.targetRole, body.goalWeeks),
      computeSkillGap('', '', body.targetRole, userId),
    ]).catch(() => {
      // best-effort background tasks
    });

    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

export { chat, complete };
