import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import * as jdService from '../services/jd.service';
import { computeSkillGap } from '../services/skills.service';
import { JobDescription } from '../types';

const extractBodySchema = z.discriminatedUnion('capture_method', [
  z.object({
    capture_method: z.literal('dom_text'),
    raw_text: z.string().min(100, 'raw_text must be at least 100 characters'),
    source_url: z.string().optional().default(''),
    source_site: z.string().optional().default(''),
  }),
  z.object({
    capture_method: z.literal('screenshot'),
    image_base64: z.string().min(1, 'image_base64 is required for screenshot capture'),
    image_mimetype: z.string().min(1, 'image_mimetype is required for screenshot capture'),
    source_url: z.string().optional().default(''),
    source_site: z.string().optional().default(''),
  }),
]);

async function extract(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = extractBodySchema.parse(req.body);
    const userId = req.user.id;

    let jd: JobDescription;

    if (body.capture_method === 'dom_text') {
      jd = await jdService.extractFromText(body.raw_text, body.source_url, userId);
    } else {
      jd = await jdService.extractFromImage(
        body.image_base64,
        body.image_mimetype,
        body.source_url,
        userId
      );
    }

    // Update source_site if provided
    if (body.source_site) {
      await supabase
        .from('job_descriptions')
        .update({ source_site: body.source_site })
        .eq('id', jd.id);
    }

    // Background: compute skill gap and update compatibility_pct
    computeSkillGap(jd.raw_text, jd.raw_text, jd.job_title, userId)
      .then((result) => jdService.updateCompatibility(jd.id, result.compatibility_pct))
      .catch((err: Error) => logger.error({ err, jdId: jd.id }, 'Background skill gap computation failed'));

    res.json({
      success: true,
      jd: {
        id: jd.id,
        job_title: jd.job_title,
        company: jd.company,
        location: jd.location,
        compatibility_pct: jd.compatibility_pct,
        source_url: jd.source_url,
        capture_method: jd.capture_method,
        created_at: jd.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const jobs = (data ?? []) as JobDescription[];

    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
}

async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, error: 'Job description not found' });
      return;
    }

    res.json({ success: true, job: data as JobDescription });
  } catch (err) {
    next(err);
  }
}

async function deleteById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export { extract, list, getById, deleteById };
