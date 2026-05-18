import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { uploadCV } from '../middleware/upload.middleware';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import {
  resumeGenerationRequestSchema,
  resumeIdParamSchema,
  resumeListQuerySchema,
  updateGeneratedResumeSchema,
} from '../schemas/resume-generation.schema';
import {
  enhanceResumeBullets,
  enhanceSection,
  importProfileFromStoredCv,
  saveResumeAsProfile,
  generateResumeForUser,
  getGeneratedResumeForUser,
  listGeneratedResumesForUser,
  parseResumeUpload,
  updateGeneratedResumeForUser,
} from '../services/resume-generation.service';
import { cariResumeTemplate } from '../templates/cari-resume-template';

const resumeGenerationRouter = Router();

resumeGenerationRouter.use(authMiddleware);

resumeGenerationRouter.get('/', requireRole('JOB_SEEKER'), async (req, res, next): Promise<void> => {
  try {
    const input = resumeListQuerySchema.parse(req.query);
    const data = await listGeneratedResumesForUser(req.user.id, input);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.get('/template', requireRole('JOB_SEEKER'), (_req, res): void => {
  res.json({ success: true, data: { template: cariResumeTemplate } });
});

resumeGenerationRouter.post('/parse', requireRole('JOB_SEEKER'), uploadCV, async (req, res, next): Promise<void> => {
  try {
    if (!req.file) {
      throw new Error('Resume file is required');
    }

    const parsed = await parseResumeUpload(req.file);

    // Persist parsed data in parallel — both are important for future tailoring
    await Promise.all([
      saveResumeAsProfile(req.user.id, parsed.resume).catch((err: unknown) => {
        logger.warn({ err }, 'saveResumeAsProfile failed — profile not updated');
      }),
      (async () => {
        const { error } = await supabase.from('cv_versions').insert({
          user_id: req.user.id,
          type: 'master',
          cv_text: parsed.rawText,
          ats_score: 0,
        });
        if (error) {
          logger.error({ error }, 'cv_versions insert failed — import-from-cv will return 404 until fixed');
        }
      })(),
    ]);

    res.status(201).json({ success: true, data: { parsed } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.post('/enhance-bullets', requireRole('JOB_SEEKER'), async (req, res, next): Promise<void> => {
  try {
    const { bullets, jobDescription } = req.body as {
      bullets: string[];
      jobDescription?: string;
    };
    if (!Array.isArray(bullets) || bullets.length === 0) {
      res.status(400).json({ success: false, error: 'bullets array is required' });
      return;
    }
    const suggestions = await enhanceResumeBullets(bullets.slice(0, 10), jobDescription);
    res.json({ success: true, data: { suggestions } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.post('/import-from-cv', requireRole('JOB_SEEKER'), async (req, res, next): Promise<void> => {
  try {
    const parsed = await importProfileFromStoredCv(req.user.id);
    res.json({ success: true, data: { parsed } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.post('/enhance-section', requireRole('JOB_SEEKER'), async (req, res, next): Promise<void> => {
  try {
    const { sectionType, content, context } = req.body as {
      sectionType: 'summary' | 'experience_bullets' | 'project_bullets';
      content: string | string[];
      context?: string;
    };
    if (!sectionType || !content) {
      res.status(400).json({ success: false, error: 'sectionType and content are required' });
      return;
    }
    const enhanced = await enhanceSection(sectionType, content, context);
    res.json({ success: true, data: { enhanced } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.post('/generate', requireRole('JOB_SEEKER'), async (req, res, next): Promise<void> => {
  try {
    const input = resumeGenerationRequestSchema.parse(req.body);
    const resume = await generateResumeForUser(req.user.id, input);
    res.status(201).json({ success: true, data: { resume } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.get('/:id', requireRole('JOB_SEEKER'), async (req, res, next): Promise<void> => {
  try {
    const { id } = resumeIdParamSchema.parse(req.params);
    const resume = await getGeneratedResumeForUser(req.user.id, id);
    res.json({ success: true, data: { resume } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.patch('/:id', requireRole('JOB_SEEKER'), async (req, res, next): Promise<void> => {
  try {
    const { id } = resumeIdParamSchema.parse(req.params);
    const input = updateGeneratedResumeSchema.parse(req.body);
    const resume = await updateGeneratedResumeForUser(req.user.id, id, input);
    res.json({ success: true, data: { resume } });
  } catch (error) {
    next(error);
  }
});

export { resumeGenerationRouter };
