import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import {
  applicationIdParamSchema,
  applyToJobSchema,
  listApplicationsQuerySchema,
  updateApplicationStatusSchema,
} from '../schemas/application.schema';
import {
  applyToJob,
  listApplicationsForRole,
  updateApplicationStatusForRole,
} from '../services/application.service';
import { getProfile, updateProfile } from '../services/profile.service';

const externalApplicationSchema = z.object({
  jobTitle: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  applyUrl: z.string().url(),
  location: z.string().optional(),
});

const applicationRouter = Router();

applicationRouter.use(authMiddleware);

applicationRouter.get('/', async (req, res, next): Promise<void> => {
  try {
    const input = listApplicationsQuerySchema.parse(req.query);
    const data = await listApplicationsForRole(req.user.id, req.user.role, input);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

applicationRouter.post(
  '/',
  requireRole('JOB_SEEKER'),
  async (req, res, next): Promise<void> => {
    try {
      const input = applyToJobSchema.parse(req.body);
      const application = await applyToJob(req.user.id, input);
      res.status(201).json({ success: true, data: { application } });
    } catch (error) {
      next(error);
    }
  }
);

applicationRouter.post(
  '/external',
  requireRole('JOB_SEEKER'),
  async (req, res, next): Promise<void> => {
    try {
      const input = externalApplicationSchema.parse(req.body);
      const profile = await getProfile(req.user.id);
      const existing = Array.isArray((profile.profileData as Record<string, unknown>)?.externalApplications)
        ? ((profile.profileData as Record<string, unknown>).externalApplications as unknown[])
        : [];
      const record = { ...input, appliedAt: new Date().toISOString(), status: 'APPLIED' };
      const updated = await updateProfile(req.user.id, {
        profileData: { ...(profile.profileData as Record<string, unknown>), externalApplications: [...existing, record] },
      });
      res.status(201).json({ success: true, data: { profileData: updated.profileData } });
    } catch (error) {
      next(error);
    }
  }
);

applicationRouter.patch(
  '/:id/status',
  async (req, res, next): Promise<void> => {
    try {
      const { id } = applicationIdParamSchema.parse(req.params);
      const input = updateApplicationStatusSchema.parse(req.body);
      const application = await updateApplicationStatusForRole(
        req.user.id,
        req.user.role,
        id,
        input
      );
      res.json({ success: true, data: { application } });
    } catch (error) {
      next(error);
    }
  }
);

export { applicationRouter };
