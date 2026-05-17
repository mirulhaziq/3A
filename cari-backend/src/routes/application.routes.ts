import { Router } from 'express';
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
