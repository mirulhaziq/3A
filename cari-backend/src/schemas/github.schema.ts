import { z } from 'zod';

const githubUsernameSchema = z
  .string()
  .min(1)
  .max(39)
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/, {
    message: 'Invalid GitHub username',
  });

const githubScrapeRequestSchema = z
  .object({
    username: githubUsernameSchema,
    includeForks: z.boolean().default(false),
    maxRepos: z.number().int().min(1).max(100).default(30),
  })
  .strict();

export { githubScrapeRequestSchema, githubUsernameSchema };
export type GitHubScrapeRequestInput = z.infer<
  typeof githubScrapeRequestSchema
>;
