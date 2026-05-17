import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import {
  createJobSchema,
  externalJobSearchQuerySchema,
  jobIdParamSchema,
  listJobsQuerySchema,
  updateJobSchema,
  uuidParamSchema,
} from '../schemas/job.schema';
import { searchExternalJobs } from '../services/external-job.service';
import {
  createJobForCompanyOwner,
  deleteJobForCompanyOwner,
  getJobById,
  listJobs,
  updateJobForCompanyOwner,
} from '../services/job.service';

const jobRouter = Router();

jobRouter.get('/external/search', async (req, res, next): Promise<void> => {
  try {
    const input = externalJobSearchQuerySchema.parse(req.query);
    const data = await searchExternalJobs(input);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

jobRouter.get('/', async (req, res, next): Promise<void> => {
  try {
    const input = listJobsQuerySchema.parse(req.query);
    const data = await listJobs(input);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

jobRouter.get('/:id', async (req, res, next): Promise<void> => {
  try {
    const { id } = jobIdParamSchema.parse(req.params);
    const job = await getJobById(id);
    res.json({ success: true, data: { job } });
  } catch (error) {
    next(error);
  }
});

jobRouter.post(
  '/',
  authMiddleware,
  requireRole('COMPANY'),
  async (req, res, next): Promise<void> => {
    try {
      const input = createJobSchema.parse(req.body);
      const job = await createJobForCompanyOwner(req.user.id, input);
      res.status(201).json({ success: true, data: { job } });
    } catch (error) {
      next(error);
    }
  }
);

jobRouter.patch(
  '/:id',
  authMiddleware,
  requireRole('COMPANY'),
  async (req, res, next): Promise<void> => {
    try {
      const { id } = uuidParamSchema.parse(req.params);
      const input = updateJobSchema.parse(req.body);
      const job = await updateJobForCompanyOwner(req.user.id, id, input);
      res.json({ success: true, data: { job } });
    } catch (error) {
      next(error);
    }
  }
);

jobRouter.delete(
  '/:id',
  authMiddleware,
  requireRole('COMPANY'),
  async (req, res, next): Promise<void> => {
    try {
      const { id } = uuidParamSchema.parse(req.params);
      await deleteJobForCompanyOwner(req.user.id, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export { jobRouter };
