import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { computeSkillGap, updateSkillCompletion } from '../services/skills.service';
import { Skill } from '../types';

async function getRadar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('skill_gaps')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) {
      throw new Error(error.message);
    }

    const skills = (data ?? []) as Array<{
      skill_name: string;
      category: string;
      user_score: number;
      benchmark_score: number;
      gap_weight: number;
    }>;

    const mappedSkills: Skill[] = skills.map((s) => ({
      name: s.skill_name,
      category: s.category as Skill['category'],
      user_score: s.user_score,
      benchmark_score: s.benchmark_score,
      gap: s.gap_weight,
    }));

    const compatibilityPct =
      mappedSkills.length > 0
        ? Math.round(
            mappedSkills.reduce((sum, s) => {
              const ratio =
                s.benchmark_score > 0 ? s.user_score / s.benchmark_score : 1;
              return sum + Math.min(ratio, 1);
            }, 0) /
              mappedSkills.length *
              100
          )
        : 0;

    res.json({ success: true, skills: mappedSkills, compatibility_pct: compatibilityPct });
  } catch (err) {
    next(err);
  }
}

async function compareJob(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { jdText, targetRole } = req.body as {
      jdText: string;
      targetRole: string;
    };

    const { data: cvRecord } = await supabase
      .from('cv_versions')
      .select('cv_text')
      .eq('user_id', req.user.id)
      .eq('type', 'master')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const cvText = (cvRecord?.cv_text as string) ?? '';

    const result = await computeSkillGap(cvText, jdText, targetRole, req.user.id);

    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

async function completeSkill(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await updateSkillCompletion(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export { getRadar, compareJob, completeSkill };
