import { z } from 'zod';

const applicationStatusSchema = z.enum([
  'APPLIED',
  'VIEWED',
  'INTERVIEW',
  'REJECTED',
  'OFFER',
]);

const applyToJobSchema = z
  .object({
    jobId: z.string().uuid(),
    tailoredResumeId: z.string().uuid().nullable().optional(),
    coverNote: z.string().max(4000).nullable().optional(),
  })
  .strict();

const updateApplicationStatusSchema = z
  .object({
    status: applicationStatusSchema,
  })
  .strict();

const listApplicationsQuerySchema = z.object({
  status: applicationStatusSchema.optional(),
  jobId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const applicationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export {
  applicationIdParamSchema,
  applicationStatusSchema,
  applyToJobSchema,
  listApplicationsQuerySchema,
  updateApplicationStatusSchema,
};
export type ApplyToJobInput = z.infer<typeof applyToJobSchema>;
export type ListApplicationsQueryInput = z.infer<
  typeof listApplicationsQuerySchema
>;
export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;
