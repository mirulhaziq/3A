import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import {
  companyPortalApplicantsQuerySchema,
  companyPortalJobParamSchema,
  companyPortalListQuerySchema,
} from '../schemas/company-portal.schema';
import {
  getCompanyDashboard,
  listApplicantsForCompanyJob,
  listCompanyPortalJobs,
} from '../services/company-portal.service';

const companyPortalRouter = Router();

companyPortalRouter.use(authMiddleware);
companyPortalRouter.use(requireRole('COMPANY'));

companyPortalRouter.get('/dashboard', async (req, res, next): Promise<void> => {
  try {
    const dashboard = await getCompanyDashboard(req.user.id);
    res.json({ success: true, data: { dashboard } });
  } catch (error) {
    next(error);
  }
});

companyPortalRouter.get('/jobs', async (req, res, next): Promise<void> => {
  try {
    const input = companyPortalListQuerySchema.parse(req.query);
    const data = await listCompanyPortalJobs(req.user.id, input);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

companyPortalRouter.get(
  '/jobs/:jobId/applicants',
  async (req, res, next): Promise<void> => {
    try {
      const { jobId } = companyPortalJobParamSchema.parse(req.params);
      const input = companyPortalApplicantsQuerySchema.parse(req.query);
      const data = await listApplicantsForCompanyJob(req.user.id, jobId, input);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

export { companyPortalRouter };
