import { z } from 'zod';

const userRoleSchema = z.enum(['JOB_SEEKER', 'COMPANY']);

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    role: userRoleSchema,
    fullName: z.string().min(1).max(120).optional(),
    companyName: z.string().min(1).max(160).optional(),
  })
  .superRefine((value, context) => {
    if (value.role === 'COMPANY' && !value.companyName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyName'],
        message: 'companyName is required for company registration',
      });
    }
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSessionSchema = z.object({
  refreshToken: z.string().min(1),
});

export { loginSchema, refreshSessionSchema, registerSchema, userRoleSchema };
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
