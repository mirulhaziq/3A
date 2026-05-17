import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { generateRoadmap, markSkillComplete } from '../services/plan.service';
import { RoadmapWeek } from '../types';

async function getPlan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('roadmap_weeks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('week_number', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const weeks = (data ?? []) as RoadmapWeek[];

    res.json({ success: true, weeks });
  } catch (err) {
    next(err);
  }
}

async function generate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { targetRole, weeks: weeksCount = 12 } = req.body as {
      targetRole: string;
      weeks?: number;
    };

    const weeks = await generateRoadmap(req.user.id, targetRole, weeksCount);

    res.json({ success: true, weeks });
  } catch (err) {
    next(err);
  }
}

async function regenerate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { targetRole, weeks: weeksCount = 12 } = req.body as {
      targetRole: string;
      weeks?: number;
    };

    const weeks = await generateRoadmap(req.user.id, targetRole, weeksCount);

    res.json({ success: true, weeks });
  } catch (err) {
    next(err);
  }
}

async function completeWeek(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await markSkillComplete(req.params.skillId, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export { getPlan, generate, regenerate, completeWeek };
