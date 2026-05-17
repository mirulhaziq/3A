import { z } from 'zod';

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ])
);

const updateProfileSchema = z
  .object({
    fullName: z.string().min(1).max(120).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    targetRole: z.string().min(1).max(120).nullable().optional(),
    profileData: z.record(jsonValueSchema).optional(),
    onboarded: z.boolean().optional(),
    xp: z.number().int().min(0).optional(),
    streak: z.number().int().min(0).optional(),
    level: z.string().min(1).max(40).optional(),
    atsScore: z.number().int().min(0).max(100).optional(),
    skillMatch: z.number().int().min(0).max(100).optional(),
  })
  .strict();

export { updateProfileSchema };
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
