import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import {
  companyPayloadSchema,
  updateCompanySchema,
} from '../schemas/job.schema';
import {
  getCompanyForOwner,
  updateCompanyForOwner,
  upsertCompanyForOwner,
} from '../services/job.service';

const companyRouter = Router();

companyRouter.use(authMiddleware);
companyRouter.use(requireRole('COMPANY'));

companyRouter.get('/me', async (req, res, next): Promise<void> => {
  try {
    const company = await getCompanyForOwner(req.user.id);
    res.json({ success: true, data: { company } });
  } catch (error) {
    next(error);
  }
});

companyRouter.post('/me', async (req, res, next): Promise<void> => {
  try {
    const input = companyPayloadSchema.parse(req.body);
    const company = await upsertCompanyForOwner(req.user.id, input);
    res.status(201).json({ success: true, data: { company } });
  } catch (error) {
    next(error);
  }
});

companyRouter.patch('/me', async (req, res, next): Promise<void> => {
  try {
    const input = updateCompanySchema.parse(req.body);
    const company = await updateCompanyForOwner(req.user.id, input);
    res.json({ success: true, data: { company } });
  } catch (error) {
    next(error);
  }
});

export { companyRouter };
