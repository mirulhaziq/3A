import { z } from 'zod';
import { applicationStatusSchema } from './application.schema';

const companyPortalListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const companyPortalApplicantsQuerySchema = companyPortalListQuerySchema.extend({
  status: applicationStatusSchema.optional(),
});

const companyPortalJobParamSchema = z.object({
  jobId: z.string().uuid(),
});

export {
  companyPortalApplicantsQuerySchema,
  companyPortalJobParamSchema,
  companyPortalListQuerySchema,
};
export type CompanyPortalApplicantsQueryInput = z.infer<
  typeof companyPortalApplicantsQuerySchema
>;
export type CompanyPortalListQueryInput = z.infer<
  typeof companyPortalListQuerySchema
>;
