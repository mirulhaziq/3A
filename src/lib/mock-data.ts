import type { User, UserLevel, Quest, AnalysisResult, RoadmapNode } from '@/types';

export const MOCK_USER: User = {
  name: 'Alex',
  targetRole: 'Senior Frontend Engineer',
  skills: ['React', 'TypeScript', 'HTML', 'CSS', 'Git'],
  cvFileName: 'resume.pdf',
  githubUsername: 'alexchen',
  xp: 450,
  streak: 12,
  level: 'PILOT',
  onboarded: true,
  atsScore: 82,
  skillMatch: 74,
};

export const LEVEL_XP: Record<UserLevel, { min: number; max: number }> = {
  NEWCOMER: { min: 0,    max: 100  },
  TRAINEE:  { min: 100,  max: 300  },
  PILOT:    { min: 300,  max: 600  },
  EXPERT:   { min: 600,  max: 1000 },
  HIRED:    { min: 1000, max: 1000 },
};

export const MOCK_QUESTS: Quest[] = [
  { id: '1', label: 'Complete 1 Skill Analysis', xp: 25, completed: false },
  { id: '2', label: 'Review Roadmap Progress',   xp: 20, completed: true  },
  { id: '3', label: 'Apply to 3 Saved Jobs',     xp: 50, completed: false },
];

export const MOCK_ANALYSIS: AnalysisResult = {
  matchScore: 82,
  label: 'Strong Match',
  cuppyState: 'happy',
  verdict: "You're almost a perfect fit. Your backend experience is excellent. A few minor tweaks to your frontend section and you're golden. The React and AWS overlap is strong — lean into that in your cover letter.",
  strengths: [
    { title: 'Expert-level React & Redux',     description: 'Your projects directly demonstrate the 5+ years of experience required.'    },
    { title: 'Infrastructure Knowledge',        description: 'Deployment history matches their AWS/Docker tech stack perfectly.'           },
    { title: 'TypeScript Depth',               description: 'Your open-source contributions show production-grade TypeScript usage.'      },
  ],
  gaps: [
    { title: 'No GraphQL experience',          fix: 'Complete Apollo Client docs + build one small project this week.'               },
    { title: 'Missing design system exposure', fix: 'Add Storybook to one of your existing React projects and document it.'          },
    { title: 'No mention of accessibility',    fix: 'Add "WCAG 2.1 compliance" to your most recent role bullet point.'              },
  ],
  cvFixes: [
    {
      original:  'Responsible for building frontend components',
      rewritten: 'Engineered 40+ reusable React components adopted across 3 product teams, reducing UI dev time by 35%.',
    },
    {
      original:  'Worked on performance improvements',
      rewritten: 'Reduced Time-to-Interactive from 4.2s to 1.8s by implementing code splitting and lazy loading strategies.',
    },
    {
      original:  'Collaborated with backend team',
      rewritten: 'Led API contract design with backend engineers, cutting integration bugs by 60% across 2 release cycles.',
    },
  ],
  missingKeywords: ['GraphQL', 'Storybook', 'Accessibility', 'WCAG', 'Design Systems', 'Playwright'],
  presentKeywords:  ['React', 'TypeScript', 'AWS', 'Docker', 'Redux', 'Next.js', 'CI/CD'],
};

export const MOCK_ROADMAP_NODES: RoadmapNode[] = [
  {
    id: 'html', label: 'HTML Semantics', status: 'completed',
    phase: 'Foundation', x: 340, y: 60, parentIds: [],
    description: 'Semantic HTML structure, forms, and accessibility basics.',
    resources: [{ title: 'MDN HTML Guide', platform: 'MDN', url: '#' }],
  },
  {
    id: 'css', label: 'CSS & Layouts', status: 'completed',
    phase: 'Foundation', x: 200, y: 180, parentIds: ['html'],
    description: 'Flexbox, Grid, responsive design, and CSS architecture.',
    resources: [{ title: 'CSS Tricks Guide', platform: 'CSS-Tricks', url: '#' }],
  },
  {
    id: 'git', label: 'Git & GitHub', status: 'completed',
    phase: 'Foundation', x: 480, y: 180, parentIds: ['html'],
    description: 'Version control fundamentals, branching, PRs.',
    resources: [{ title: 'Pro Git Book', platform: 'git-scm.com', url: '#' }],
  },
  {
    id: 'js', label: 'JavaScript ES6+', status: 'completed',
    phase: 'Core Development', x: 340, y: 320, parentIds: ['css', 'git'],
    description: 'Modern JS: async/await, destructuring, closures, modules.',
    resources: [{ title: 'javascript.info', platform: 'javascript.info', url: '#' }],
  },
  {
    id: 'ts', label: 'TypeScript', status: 'in-progress',
    phase: 'Core Development', x: 180, y: 460, parentIds: ['js'],
    description: 'Static typing, interfaces, generics, utility types.',
    resources: [{ title: 'TypeScript Handbook', platform: 'TypeScript', url: '#' }],
  },
  {
    id: 'react', label: 'React', status: 'in-progress',
    phase: 'Core Development', x: 340, y: 460, parentIds: ['js'],
    description: 'Components, hooks, state management, React patterns.',
    resources: [{ title: 'React Docs (react.dev)', platform: 'react.dev', url: '#' }],
  },
  {
    id: 'state', label: 'State Management', status: 'available',
    phase: 'Core Development', x: 500, y: 460, parentIds: ['react'],
    description: 'Redux Toolkit, Zustand, Jotai — pick one and go deep.',
    resources: [{ title: 'Redux Toolkit Docs', platform: 'Redux', url: '#' }],
  },
  {
    id: 'nextjs', label: 'Next.js', status: 'locked',
    phase: 'Advanced Mastery', x: 280, y: 620, parentIds: ['react', 'ts'],
    description: 'App Router, server components, SSR/SSG, API routes.',
    resources: [{ title: 'Next.js Docs', platform: 'Vercel', url: '#' }],
  },
  {
    id: 'graphql', label: 'GraphQL', status: 'locked',
    phase: 'Advanced Mastery', x: 160, y: 740, parentIds: ['nextjs'],
    description: 'Apollo Client, queries, mutations, subscriptions.',
    resources: [{ title: 'Apollo Docs', platform: 'Apollo GraphQL', url: '#' }],
  },
  {
    id: 'perf', label: 'Web Performance', status: 'locked',
    phase: 'Advanced Mastery', x: 420, y: 740, parentIds: ['nextjs'],
    description: 'Core Web Vitals, lazy loading, bundle optimization.',
    resources: [{ title: 'web.dev Learn Performance', platform: 'Google', url: '#' }],
  },
  {
    id: 'testing', label: 'Testing', status: 'locked',
    phase: 'Job Ready', x: 280, y: 880, parentIds: ['graphql', 'perf'],
    description: 'Jest, React Testing Library, Playwright e2e tests.',
    resources: [{ title: 'Testing Library Docs', platform: 'testing-library', url: '#' }],
  },
  {
    id: 'portfolio', label: 'Portfolio & OSS', status: 'locked',
    phase: 'Job Ready', x: 420, y: 880, parentIds: ['graphql', 'perf'],
    description: 'Ship 2 polished projects. Make 5 OSS contributions.',
    resources: [{ title: 'GitHub Explore', platform: 'GitHub', url: '#' }],
  },
];

export interface UserProfile {
  personal: {
    fullName: string;
    targetRole: string;
    location: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
  };
  level: number;
  streak: number;
  xp: number;
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    soft: string[];
  };
  projects: {
    id: string;
    name: string;
    description: string;
    tech: string[];
    showOnResume: boolean;
    bullets: string[];
    date: string;
    url: string;
  }[];
  experience: {
    id: string;
    role: string;
    company: string;
    type: string;
    dateRange: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    dateRange: string;
    grade: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  awards: {
    name: string;
    issuer: string;
    date: string;
  }[];
  extracurricular: {
    name: string;
    organization: string;
    date: string;
  }[];
}

export const MOCK_PROFILE: UserProfile = {
  personal: {
    fullName: 'Amirul Haziq Bin Shazlee',
    targetRole: 'Junior Full-Stack Developer',
    location: 'Kuala Lumpur, Malaysia',
    phone: '+60 11-1234 5678',
    email: 'amirul.haziq@email.com',
    linkedin: 'linkedin.com/in/amirulhaziq',
    github: 'github.com/amirulhaziq',
  },
  level: 12,
  streak: 12,
  xp: 2450,
  summary: 'Passionate Junior Full-Stack Developer with a focus on React and Node.js. Enthusiastic about creating user-centric applications and solving complex problems. Ready to jump into a fast-paced dev team.',
  skills: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS'],
    tools: ['Git', 'GitHub', 'VS Code', 'Figma', 'Docker'],
    soft: ['Problem Solving', 'Team Collaboration', 'Communication', 'Adaptability'],
  },
  projects: [
    {
      id: 'launchpad-web',
      name: 'Cari-Web-App',
      description: 'Modern tactile career portal built with React and Tailwind CSS.',
      tech: ['TypeScript', 'React'],
      showOnResume: true,
      bullets: [
        'Built responsive UI components with Tailwind CSS and Framer Motion',
        'Integrated AI-powered job matching algorithm with 94% match accuracy',
      ],
      date: '2024',
      url: 'github.com/amirulhaziq/launchpad-web',
    },
    {
      id: 'weather-dash',
      name: 'Weather-Dash',
      description: 'Real-time weather tracking using OpenWeather API integration.',
      tech: ['JavaScript', 'CSS'],
      showOnResume: true,
      bullets: [
        'Fetched live weather data from OpenWeather API with 5-minute auto-refresh',
        'Implemented geolocation for automatic city detection across 50+ countries',
      ],
      date: '2023',
      url: 'github.com/amirulhaziq/weather-dash',
    },
    {
      id: 'portfolio',
      name: 'Personal Portfolio',
      description: 'Responsive portfolio website showcasing projects and skills.',
      tech: ['HTML', 'CSS', 'JavaScript'],
      showOnResume: false,
      bullets: [
        'Designed mobile-first responsive layout with CSS Grid and Flexbox',
        'Implemented smooth scroll animations and intersection observer lazy loading',
      ],
      date: '2023',
      url: 'amirulhaziq.dev',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Frontend Developer Intern',
      company: 'Tech Solutions Sdn. Bhd.',
      type: 'Internship',
      dateRange: 'Jun 2023 – Sep 2023',
      bullets: [
        'Developed and maintained React components for the company main product dashboard',
        'Collaborated with design team to implement pixel-perfect UI from Figma mockups',
        'Improved page load performance by 30% through code splitting and lazy loading',
      ],
    },
    {
      id: 'exp-2',
      role: 'Web Developer (Part-time)',
      company: 'Freelance',
      type: 'Freelance',
      dateRange: 'Jan 2023 – Present',
      bullets: [
        'Built 5+ client websites using React and Next.js with modern design systems',
        'Delivered projects on time with client satisfaction rate of 4.8 out of 5',
      ],
    },
  ],
  education: [
    {
      institution: 'Universiti Kebangsaan Malaysia (UKM)',
      degree: 'Bachelor of Computer Science',
      field: 'Software Engineering',
      dateRange: '2021 – 2025',
      grade: 'CGPA: 3.72',
    },
  ],
  certifications: [
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024' },
    { name: 'Meta Front-End Developer', issuer: 'Coursera / Meta', date: '2023' },
  ],
  awards: [
    { name: 'Best Final Year Project — Computer Science Faculty', issuer: 'UKM', date: '2024' },
    { name: 'Hackathon Champion — National Tech Fest', issuer: 'MDEC', date: '2023' },
  ],
  extracurricular: [
    { name: 'Tech Club President', organization: 'UKM CS Club', date: '2023–2024' },
    { name: 'Volunteer Coding Mentor', organization: 'Code For Malaysia', date: '2022–Present' },
  ],
};
