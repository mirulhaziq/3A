import { Request, Response, NextFunction } from 'express';
import { runAgentLoop } from '../agent/agent';
import {
  approveAction,
  getStagedActions,
  observeOutcome,
} from '../agent/staging';
import { supabase } from '../lib/supabase';
import { sendEmail } from '../services/email.service';
import { Application } from '../types';
import { StagedAction } from '../types/agent.types';

async function apply(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const staged = await runAgentLoop(req.user.id);

    if (!staged) {
      res.status(500).json({ success: false, error: 'Agent unavailable' });
      return;
    }

    res.json({ success: true, staged_action: staged });
  } catch (err) {
    next(err);
  }
}

async function confirm(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { actionId } = req.body as { actionId: string };
    const userId = req.user.id;

    const approved = await approveAction(actionId, userId);
    const output = approved.output as {
      tailored_cv_id?: string;
      job_title?: string;
      company?: string;
      jd_url?: string;
    };

    const { data: inserted, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_title: output.job_title ?? 'Unknown Role',
        company: output.company ?? 'Unknown Company',
        jd_url: output.jd_url ?? '',
        applied_at: new Date().toISOString(),
        status: 'submitted',
        tailored_cv_id: output.tailored_cv_id ?? null,
        followup_7_sent: false,
        followup_14_sent: false,
      })
      .select('id')
      .single();

    if (error || !inserted) {
      throw new Error('Failed to record application');
    }

    await observeOutcome(actionId, userId, 'sent');

    res.json({ success: true, application_id: inserted.id as string });
  } catch (err) {
    next(err);
  }
}

async function approveFollowup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { draftId } = req.body as { draftId: string };
    const userId = req.user.id;

    const { data: draft, error: draftError } = await supabase
      .from('followup_drafts')
      .select('*, applications(user_id)')
      .eq('id', draftId)
      .single();

    if (draftError || !draft) {
      res.status(404).json({ success: false, error: 'Draft not found' });
      return;
    }

    const app = draft.applications as { user_id: string } | null;
    if (app?.user_id !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email;

    if (!userEmail) {
      res.status(400).json({ success: false, error: 'User email not found' });
      return;
    }

    await sendEmail(
      userEmail,
      draft.subject as string,
      `<p>${(draft.body as string).replace(/\n/g, '<br>')}</p>`
    );

    const dayTrigger = draft.day_trigger as 7 | 14;
    const applicationId = draft.application_id as string;

    await supabase
      .from('followup_drafts')
      .update({ approved: true, sent_at: new Date().toISOString() })
      .eq('id', draftId);

    const updateField =
      dayTrigger === 7 ? { followup_7_sent: true } : { followup_14_sent: true };

    await supabase
      .from('applications')
      .update(updateField)
      .eq('id', applicationId)
      .eq('user_id', userId);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function getTracker(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, followup_drafts(*)')
      .eq('user_id', req.user.id)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const applications = (data ?? []) as Application[];

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
}

async function getStaged(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const staged = await getStagedActions(req.user.id);
    const stagedActions = staged as StagedAction[];
    res.json({ success: true, staged_actions: stagedActions });
  } catch (err) {
    next(err);
  }
}

export { apply, confirm, approveFollowup, getTracker, getStaged };
