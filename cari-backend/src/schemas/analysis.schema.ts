import { z } from 'zod';

const analysisLabelSchema = z.enum([
  'Strong Match',
  'Close Match',
  'Not Ready Yet',
]);

const cuppyStateSchema = z.enum([
  'idle',
  'happy',
  'judgy',
  'thinking',
  'celebrate',
]);

const analysisRequestSchema = z
  .object({
    cvText: z.string().min(80).max(30000),
    jobDescription: z.string().min(80).max(30000),
    jobId: z.string().uuid().nullable().optional(),
  })
  .strict();

const analysisResultSchema = z
  .object({
    matchScore: z.number().int().min(0).max(100),
    label: analysisLabelSchema,
    cuppyState: cuppyStateSchema,
    verdict: z.string().min(1),
    strengths: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().min(1),
        })
      )
      .min(1),
    gaps: z
      .array(
        z.object({
          title: z.string().min(1),
          fix: z.string().min(1),
        })
      )
      .min(1),
    cvFixes: z.array(
      z.object({
        original: z.string().min(1),
        rewritten: z.string().min(1),
      })
    ),
    missingKeywords: z.array(z.string().min(1)),
    presentKeywords: z.array(z.string().min(1)),
  })
  .strict();

export {
  analysisRequestSchema,
  analysisResultSchema,
  cuppyStateSchema,
  analysisLabelSchema,
};
export type AnalysisRequestInput = z.infer<typeof analysisRequestSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
