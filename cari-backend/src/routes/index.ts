import { Router } from 'express';
import { analysisRouter } from './analysis.routes';
import { applicationRouter } from './application.routes';
import { authRouter } from './auth.routes';
import { companyPortalRouter } from './company-portal.routes';
import { companyRouter } from './company.routes';
import { githubRouter } from './github.routes';
import { healthRouter } from './health.routes';
import { jobRouter } from './job.routes';
import { profileRouter } from './profile.routes';
import { resumeGenerationRouter } from './resume-generation.routes';
import { roadmapRouter } from './roadmap.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'cari-backend',
      apiVersion: 'v1',
      status: 'ok',
      routes: {
        health: '/health',
        auth: '/auth',
        profile: '/profile/me',
        companies: '/companies',
        jobs: '/jobs',
        analysis: '/analysis',
        resumes: '/resumes',
        github: '/github',
        applications: '/applications',
        companyPortal: '/company-portal',
      },
    },
  });
});

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/companies', companyRouter);
router.use('/jobs', jobRouter);
router.use('/analysis', analysisRouter);
router.use('/resumes', resumeGenerationRouter);
router.use('/github', githubRouter);
router.use('/applications', applicationRouter);
router.use('/company-portal', companyPortalRouter);
router.use('/roadmap', roadmapRouter);

// Temporary diagnostic — remove after debugging
router.get('/debug-resume-routes', (_req, res) => {
  const stack = (resumeGenerationRouter as unknown as { stack: Array<{ route?: { path: string; methods: Record<string, boolean> }; handle?: { name: string } }> }).stack;
  res.json({
    routeCount: stack.length,
    routes: stack.map(l => ({
      path: l.route?.path ?? '(middleware)',
      methods: l.route?.methods ?? {},
      fn: l.handle?.name ?? 'anonymous',
    })),
  });
});

export { router };
