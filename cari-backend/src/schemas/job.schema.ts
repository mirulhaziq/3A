import { z } from 'zod';

const workModeSchema = z.enum(['Remote', 'Hybrid', 'On-site']);
const jobTypeSchema = z.enum([
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
]);

const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

const listJobsQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  companyId: z.string().uuid().optional(),
  workMode: workModeSchema.optional(),
  type: jobTypeSchema.optional(),
  activeOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value !== 'false'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const companyPayloadSchema = z
  .object({
    name: z.string().min(1).max(160),
    logoUrl: z.string().url().nullable().optional(),
    industry: z.string().max(120).optional(),
    size: z.string().max(80).optional(),
    description: z.string().max(3000).optional(),
    website: z.string().url().or(z.literal('')).optional(),
    credibilityScore: z.number().int().min(0).optional(),
  })
  .strict();

const updateCompanySchema = companyPayloadSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one company field is required' }
);

const jobPayloadBaseSchema = z
  .object({
    title: z.string().min(1).max(160),
    location: z.string().min(1).max(160),
    workMode: workModeSchema,
    type: jobTypeSchema,
    salaryMin: z.number().int().min(0),
    salaryMax: z.number().int().min(0),
    currency: z.string().min(1).max(12).default('RM'),
    description: z.string().min(1).max(12000),
    requiredSkills: z.array(z.string().min(1).max(80)).default([]),
    niceToHaveSkills: z.array(z.string().min(1).max(80)).default([]),
    isActive: z.boolean().default(true),
  })
  .strict();

const createJobSchema = jobPayloadBaseSchema
  .refine((value) => value.salaryMax >= value.salaryMin, {
    path: ['salaryMax'],
    message: 'salaryMax must be greater than or equal to salaryMin',
  });

const updateJobSchema = jobPayloadBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one job field is required',
  })
  .refine(
    (value) =>
      value.salaryMin === undefined ||
      value.salaryMax === undefined ||
      value.salaryMax >= value.salaryMin,
    {
      path: ['salaryMax'],
      message: 'salaryMax must be greater than or equal to salaryMin',
    }
  );

export {
  companyPayloadSchema,
  createJobSchema,
  listJobsQuerySchema,
  updateCompanySchema,
  updateJobSchema,
  uuidParamSchema,
};
export type CompanyPayloadInput = z.infer<typeof companyPayloadSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ListJobsQueryInput = z.infer<typeof listJobsQuerySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
