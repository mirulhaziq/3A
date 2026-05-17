import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { uploadCV } from '../middleware/upload.middleware';
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
resumeGenerationRouter.use(requireRole('JOB_SEEKER'));

resumeGenerationRouter.get('/', async (req, res, next): Promise<void> => {
  try {
    const input = resumeListQuerySchema.parse(req.query);
    const data = await listGeneratedResumesForUser(req.user.id, input);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.get('/template', (_req, res): void => {
  res.json({ success: true, data: { template: cariResumeTemplate } });
});

resumeGenerationRouter.post('/parse', uploadCV, async (req, res, next): Promise<void> => {
  try {
    if (!req.file) {
      throw new Error('Resume file is required');
    }

    const parsed = await parseResumeUpload(req.file);

    // Persist parsed data as the user's foundation profile (runs in parallel with cv_versions insert)
    await Promise.all([
      // Save structured resume data into profiles.profile_data
      saveResumeAsProfile(req.user.id, parsed.resume),

      // Store raw CV text in cv_versions for future re-imports
      (async () => {
        try {
          const { getSupabaseAdmin } = await import('../lib/supabase');
          const supabase = getSupabaseAdmin();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('cv_versions') as any).insert({
            user_id: req.user.id,
            type: 'master',
            cv_text: parsed.rawText,
            ats_score: 0,
            storage_path: `${req.user.id}/master.parsed`,
          });
        } catch {
          // Non-fatal: cv_versions storage is best-effort
        }
      })(),
    ]);

    res.status(201).json({ success: true, data: { parsed } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.post('/enhance-bullets', async (req, res, next): Promise<void> => {
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

resumeGenerationRouter.post('/import-from-cv', async (req, res, next): Promise<void> => {
  try {
    const parsed = await importProfileFromStoredCv(req.user.id);
    res.json({ success: true, data: { parsed } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.post('/enhance-section', async (req, res, next): Promise<void> => {
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

resumeGenerationRouter.post('/generate', async (req, res, next): Promise<void> => {
  try {
    const input = resumeGenerationRequestSchema.parse(req.body);
    const resume = await generateResumeForUser(req.user.id, input);
    res.status(201).json({ success: true, data: { resume } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.get('/:id', async (req, res, next): Promise<void> => {
  try {
    const { id } = resumeIdParamSchema.parse(req.params);
    const resume = await getGeneratedResumeForUser(req.user.id, id);
    res.json({ success: true, data: { resume } });
  } catch (error) {
    next(error);
  }
});

resumeGenerationRouter.patch('/:id', async (req, res, next): Promise<void> => {
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
