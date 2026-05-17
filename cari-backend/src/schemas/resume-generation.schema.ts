import { z } from 'zod';

const resumeGenerationRequestSchema = z
  .object({
    profileData: z.record(z.unknown()).optional(),
    baseResumeText: z.string().min(80).max(30000).optional(),
    jobDescription: z.string().min(80).max(30000).optional(),
    jobId: z.string().uuid().nullable().optional(),
    title: z.string().min(1).max(160).default('Generated Resume'),
  })
  .strict()
  .refine((value) => value.profileData || value.baseResumeText, {
    message: 'profileData or baseResumeText is required',
  });

const resumeListQuerySchema = z.object({
  jobId: z.string().uuid().optional(),
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const resumeIdParamSchema = z.object({
  id: z.string().uuid(),
});

const resumeBulletSchema = z.string().min(1);

const generatedResumeSchema = z
  .object({
    metadata: z.object({
      title: z.string().min(1),
      targetRole: z.string().nullable(),
      tailoredForJob: z.boolean(),
      keywords: z.array(z.string()),
      templateId: z.string().optional(),
      matchScore: z.number().int().min(0).max(100).optional(),
      atsOptimized: z.boolean().optional(),
      company: z.string().nullable().optional(),
      jobTitle: z.string().nullable().optional(),
    }),
    personal: z.object({
      fullName: z.string().min(1),
      location: z.string().nullable(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
      linkedin: z.string().nullable(),
      github: z.string().nullable(),
    }),
    summary: z.string().min(1),
    skills: z.object({
      languages: z.array(z.string()),
      frameworks: z.array(z.string()),
      toolsAndPlatforms: z.array(z.string()),
      softSkills: z.array(z.string()),
    }),
    experience: z.array(
      z.object({
        company: z.string().min(1),
        role: z.string().min(1),
        type: z.string().nullable(),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        current: z.boolean(),
        bullets: z.array(resumeBulletSchema),
      })
    ),
    projects: z.array(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable(),
        techStack: z.array(z.string()),
        bullets: z.array(resumeBulletSchema),
        repoUrl: z.string().nullable(),
        liveUrl: z.string().nullable(),
      })
    ),
    education: z.array(
      z.object({
        institution: z.string().min(1),
        degree: z.string().nullable(),
        field: z.string().nullable(),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        grade: z.string().nullable(),
      })
    ),
    certifications: z.array(
      z.object({
        name: z.string().min(1),
        issuer: z.string().nullable(),
        date: z.string().nullable(),
      })
    ),
    awards: z.array(
      z.object({
        title: z.string().min(1),
        issuer: z.string().nullable(),
        year: z.string().nullable(),
      })
    ),
    extracurricular: z
      .array(
        z.object({
          title: z.string().min(1),
          organization: z.string().nullable(),
          date: z.string().nullable(),
          bullets: z.array(resumeBulletSchema),
        })
      )
      .default([]),
  })
  .strict();

const updateGeneratedResumeSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    resume: generatedResumeSchema.optional(),
  })
  .strict()
  .refine((value) => value.title !== undefined || value.resume !== undefined, {
    message: 'title or resume is required',
  });

export {
  generatedResumeSchema,
  resumeGenerationRequestSchema,
  resumeIdParamSchema,
  resumeListQuerySchema,
  updateGeneratedResumeSchema,
};
export type GeneratedResume = z.infer<typeof generatedResumeSchema>;
export type ResumeGenerationRequestInput = z.infer<
  typeof resumeGenerationRequestSchema
>;
export type ResumeListQueryInput = z.infer<typeof resumeListQuerySchema>;
export type UpdateGeneratedResumeInput = z.infer<
  typeof updateGeneratedResumeSchema
>;
