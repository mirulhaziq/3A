'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ChevronRight,
  FileText,
  Link,
  BarChart2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Camera,
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { cariApi, type JobResponse } from '@/lib/cari-api';
import type { AnalysisResult } from '@/types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  workMode: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description?: string;
  source?: 'supabase' | 'jsearch';
  applyUrl?: string | null;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  matchScore: number;
  companyColor: string;
}

interface SkillDetail {
  label: string;
  percent: number;
  color: string;
}

interface RadarPoint { skill: string; user: number; required: number; }

interface Compatibility {
  matchScore: number;
  userHasSkills: string[];
  userMissingSkills: string[];
  technicalMatch: number;
  experienceMatch: number;
  educationMatch: number;
  toolsMatch: number;
  insights: string;
  skillDetails: SkillDetail[];
  radarData: RadarPoint[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ALL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp Malaysia',
    location: 'Kuala Lumpur',
    workMode: 'On-site',
    type: 'Full-time',
    salaryMin: 8000,
    salaryMax: 12000,
    currency: 'RM',
    description: 'TechCorp Malaysia is looking for a Senior Frontend Engineer to lead the development of customer-facing web applications used by over 2 million users across Southeast Asia. You will own the frontend architecture, drive performance improvements, and mentor a team of 4 junior engineers. This is a high-impact role with direct ownership over product decisions.',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'AWS'],
    niceToHaveSkills: ['Kubernetes', 'Redis', 'Storybook'],
    matchScore: 74,
    companyColor: '#1CB0F6',
  },
  {
    id: 'job-2',
    title: 'Software Engineer (Backend)',
    company: 'Axiata Digital',
    location: 'Kuala Lumpur',
    workMode: 'Hybrid',
    type: 'Full-time',
    salaryMin: 6000,
    salaryMax: 9000,
    currency: 'RM',
    description: 'Axiata Digital is building the next generation of digital financial services for 300M+ subscribers across Asia. As a Backend Engineer you will design and maintain high-throughput microservices in Go, own the PostgreSQL data layer, and work closely with platform teams on containerised deployments. Expect a fast-paced environment with real production scale from day one.',
    requiredSkills: ['Go', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'],
    niceToHaveSkills: ['Kubernetes', 'Kafka', 'AWS'],
    matchScore: 61,
    companyColor: '#4CAF50',
  },
  {
    id: 'job-3',
    title: 'UI Engineer',
    company: 'PayStream',
    location: 'Remote (MY)',
    workMode: 'Remote',
    type: 'Full-time',
    salaryMin: 7000,
    salaryMax: 10000,
    currency: 'RM',
    description: 'PayStream is a fintech startup processing RM 500M+ in monthly transactions. We need a UI Engineer who lives and breathes pixel-perfect interfaces. You will translate Figma designs into production-ready React components, own the component library, and obsess over accessibility and animation details that make our product feel premium. Design sensibility is just as important as code quality here.',
    requiredSkills: ['React', 'TypeScript', 'Figma', 'CSS', 'JavaScript'],
    niceToHaveSkills: ['Storybook', 'Accessibility', 'Animation'],
    matchScore: 52,
    companyColor: '#7C5CBF',
  },
];

const ALL_COMPATIBILITY: Record<string, Compatibility> = {
  'job-1': {
    matchScore: 74,
    userHasSkills: ['React', 'TypeScript', 'AWS', 'Docker', 'Git'],
    userMissingSkills: ['GraphQL', 'Next.js advanced', 'Kubernetes'],
    technicalMatch: 78,
    experienceMatch: 65,
    educationMatch: 90,
    toolsMatch: 82,
    insights:
      "React is solid — 95% there. GraphQL is the real gap; every senior FE role needs it now. Spend a weekend on Apollo Client or you'll keep getting filtered out.",
    skillDetails: [
      { label: 'React Mastery', percent: 95, color: '#FFC800' },
      { label: 'TS Knowledge', percent: 60, color: '#1CB0F6' },
    ],
    radarData: [
      { skill: 'React',      user: 95, required: 90 },
      { skill: 'TypeScript', user: 60, required: 85 },
      { skill: 'Next.js',    user: 50, required: 80 },
      { skill: 'GraphQL',    user: 20, required: 85 },
      { skill: 'AWS',        user: 70, required: 75 },
    ],
  },
  'job-2': {
    matchScore: 61,
    userHasSkills: ['Go', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'],
    userMissingSkills: ['Kubernetes', 'Kafka', 'Redis'],
    technicalMatch: 70,
    experienceMatch: 55,
    educationMatch: 85,
    toolsMatch: 65,
    insights:
      "Go and Postgres are ticked — good. But Kubernetes is a hard requirement here and you're at zero. That alone is dragging your score to 61%. Fix that first.",
    skillDetails: [
      { label: 'Go Proficiency', percent: 80, color: '#FFC800' },
      { label: 'Cloud/K8s',      percent: 25, color: '#FF4B4B' },
    ],
    radarData: [
      { skill: 'Go',         user: 80, required: 85 },
      { skill: 'PostgreSQL', user: 75, required: 80 },
      { skill: 'Docker',     user: 70, required: 75 },
      { skill: 'REST APIs',  user: 85, required: 80 },
      { skill: 'Kubernetes', user: 10, required: 70 },
    ],
  },
  'job-3': {
    matchScore: 52,
    userHasSkills: ['React', 'CSS', 'JavaScript', 'TypeScript'],
    userMissingSkills: ['Figma', 'Accessibility', 'Animation', 'Storybook'],
    technicalMatch: 60,
    experienceMatch: 45,
    educationMatch: 80,
    toolsMatch: 55,
    insights:
      "Your code skills are fine but this is a design-heavy role. Figma at 15% is a dealbreaker — they won't look twice without it. Two weeks of daily Figma practice, then reapply.",
    skillDetails: [
      { label: 'Frontend Skills', percent: 65, color: '#FFC800' },
      { label: 'Figma/Design',    percent: 15, color: '#FF4B4B' },
    ],
    radarData: [
      { skill: 'React',         user: 85, required: 80 },
      { skill: 'TypeScript',    user: 65, required: 75 },
      { skill: 'Figma',         user: 15, required: 90 },
      { skill: 'CSS/Animation', user: 60, required: 80 },
      { skill: 'Accessibility', user: 20, required: 70 },
    ],
  },
};

const MOCK_STRENGTHS = [
  {
    title: 'Expert-level React',
    description:
      'Your projects directly demonstrate the required React experience.',
  },
  {
    title: 'TypeScript Depth',
    description:
      'Production-grade TypeScript usage shown in contributions.',
  },
  {
    title: 'Infrastructure Knowledge',
    description: 'Deployment history matches their AWS/Docker stack.',
  },
];

const MOCK_GAPS = [
  {
    title: 'No GraphQL experience',
    fix: 'Complete Apollo Client docs + build one small project this week.',
  },
  {
    title: 'Missing design system exposure',
    fix: 'Add Storybook to one of your existing React projects.',
  },
  {
    title: 'No mention of accessibility',
    fix: 'Add WCAG 2.1 compliance to your most recent role.',
  },
];

const MOCK_CV_FIXES = [
  {
    original: 'Responsible for building frontend components',
    rewritten:
      'Engineered 40+ reusable React components, reducing UI dev time by 35%.',
  },
  {
    original: 'Worked on performance improvements',
    rewritten:
      'Reduced Time-to-Interactive from 4.2s to 1.8s via code splitting.',
  },
];

const MOCK_KEYWORDS_MISSING = [
  'GraphQL',
  'Storybook',
  'Accessibility',
  'WCAG',
  'Playwright',
];
const MOCK_KEYWORDS_HAVE = [
  'React',
  'TypeScript',
  'AWS',
  'Docker',
  'Redux',
  'Next.js',
];
const MOCK_VERDICT =
  "You're a strong candidate. Your React and TypeScript fundamentals are solid. The main gap is GraphQL — it appears 3 times in the JD. A focused 2-week sprint on Apollo Client would push you from 74% to 90%+. Apply, but tailor your resume to highlight your component architecture experience.";

const FILTER_OPTIONS = ['Frontend', 'Remote', '$120k+', 'Full-time', 'Entry Level'];

const LOADING_STEPS = [
  { delay: 800, text: 'Reading your CV' },
  { delay: 1300, text: 'Parsing job requirements' },
  { delay: 1800, text: 'Cross-referencing GitHub' },
  { delay: 2200, text: 'Preparing your verdict' },
];

function mapApiJob(job: JobResponse, index: number): Job {
  const colors = ['#1CB0F6', '#4CAF50', '#7C5CBF', '#FF4B4B', '#FFC800'];
  return {
    id: job.id,
    title: job.title,
    company: job.company || 'Company',
    companyId: job.companyId,
    location: job.location,
    workMode: job.workMode,
    type: job.type,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    description: job.description,
    source: job.source,
    applyUrl: job.applyUrl,
    requiredSkills: job.requiredSkills,
    niceToHaveSkills: job.niceToHaveSkills,
    matchScore: 50,
    companyColor: colors[index % colors.length],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MatchBadge = ({
  score,
  large = false,
}: {
  score: number;
  large?: boolean;
}) => {
  const bg =
    score >= 75 ? '#FFC800' : score >= 50 ? '#E8F7FF' : '#F0EBE0';
  const color =
    score >= 75 ? '#1A1A1A' : score >= 50 ? '#1CB0F6' : '#6B6B6B';
  if (large) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-center"
        style={{ backgroundColor: bg }}
      >
        <p
          className="text-[36px] font-extrabold leading-none"
          style={{ color }}
        >
          {score}%
        </p>
        <p
          className="text-[11px] font-semibold uppercase mt-1"
          style={{ color: '#6B6B6B' }}
        >
          MATCH
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg px-2 py-1" style={{ backgroundColor: bg }}>
      <p className="text-[12px] font-bold" style={{ color }}>
        {score}% MATCH
      </p>
    </div>
  );
};

const SkillRadarChart = ({ data }: { data: RadarPoint[] }) => (
  <div style={{ width: '100%', height: 230, minWidth: 0 }}>
    <ResponsiveContainer width="100%" height={230} debounce={50}>
      <RadarChart data={data} margin={{ top: 14, right: 30, bottom: 14, left: 30 }}>
        <PolarGrid stroke="#E8E0D0" />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#6B6B6B', fontWeight: 600 }} />
        <Radar name="You" dataKey="user" stroke="#FFC800" fill="#FFC800" fillOpacity={0.3} strokeWidth={2} />
        <Radar name="Required" dataKey="required" stroke="#ABABAB" fill="#ABABAB" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
      </RadarChart>
    </ResponsiveContainer>
    <div className="flex items-center justify-center gap-4 mt-1">
      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#FFC800]" /><span className="text-[11px] text-[#6B6B6B] font-semibold">Your Level</span></div>
      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ABABAB]" /><span className="text-[11px] text-[#6B6B6B] font-semibold">Role Required</span></div>
    </div>
  </div>
);

const LoadingSteps = () => {
  const [visible, setVisible] = useState<number[]>([]);
  useEffect(() => {
    LOADING_STEPS.forEach((step, i) => {
      setTimeout(() => setVisible((prev) => [...prev, i]), step.delay);
    });
  }, []);
  return (
    <div className="mt-5 flex flex-col gap-2.5">
      {LOADING_STEPS.map((step, i) => (
        <AnimatePresence key={step.text}>
          {visible.includes(i) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <CheckCircle size={18} className="text-[#FFC800]" />
              <span className="text-[13px] text-[#6B6B6B]">{step.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
};

const ScoreCard = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.ceil(score / 30);
    const interval = setInterval(() => {
      current = Math.min(current + step, score);
      setDisplayScore(current);
      if (current >= score) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 flex items-center gap-5 mb-4">
      <div className="relative w-[120px] h-[120px] flex-shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#F0EBE0"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#FFC800"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] font-extrabold text-[#1A1A1A] leading-none">
            {displayScore}%
          </span>
          <span className="text-[11px] font-semibold text-[#6B6B6B] uppercase mt-0.5">
            MATCH
          </span>
        </div>
      </div>
      <div>
        <p className="text-[16px] font-bold text-[#1A1A1A]">
          Great compatibility!
        </p>
        <p className="text-[13px] text-[#6B6B6B] mt-1 leading-relaxed">
          You match {score}% of what this role requires. A few quick wins can
          push you over 90%.
        </p>
      </div>
    </div>
  );
};

const VerdictCard = ({ verdict }: { verdict: string }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (i < verdict.length) {
        setDisplayed(verdict.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [verdict]);

  return (
    <div className="bg-[#FFFDF0] border border-[#FFC800] rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-[#FFC800] flex items-center justify-center text-[14px]">
          🤖
        </div>
        <p className="text-[13px] font-bold text-[#1A1A1A]">
          Cuppy's Verdict
        </p>
      </div>
      <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
        {displayed}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
};

type ResultTab = 'strengths' | 'gaps' | 'cvfixes' | 'keywords';

const ResultTabs = ({
  activeResultTab,
  setActiveResultTab,
}: {
  activeResultTab: ResultTab;
  setActiveResultTab: (t: ResultTab) => void;
}) => {
  const tabs: { key: ResultTab; label: string }[] = [
    { key: 'strengths', label: 'Strengths' },
    { key: 'gaps', label: 'Gaps' },
    { key: 'cvfixes', label: 'CV Fixes' },
    { key: 'keywords', label: 'Keywords' },
  ];
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => {
            setActiveResultTab(t.key);
            haptic('light');
          }}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold border transition-colors',
            activeResultTab === t.key
              ? 'bg-[#FFC800] border-[#CC9F00] text-[#1A1A1A]'
              : 'bg-white border-[#E8E0D0] text-[#6B6B6B]'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

const StrengthsTab = ({ items }: { items: AnalysisResult['strengths'] }) => (
  <div className="flex flex-col gap-3">
    {items.map((s) => (
      <div
        key={s.title}
        className="bg-white rounded-xl border border-[#E8E0D0] p-4 flex gap-3 items-start"
      >
        <CheckCircle size={20} className="text-[#4CAF50] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[14px] font-bold text-[#1A1A1A]">{s.title}</p>
          <p className="text-[13px] text-[#6B6B6B] mt-0.5">{s.description}</p>
        </div>
      </div>
    ))}
  </div>
);

const GapsTab = ({ items }: { items: AnalysisResult['gaps'] }) => (
  <div className="flex flex-col gap-3">
    {items.map((g) => (
      <div
        key={g.title}
        className="bg-white rounded-xl border border-[#E8E0D0] p-4"
      >
        <div className="flex gap-3 items-start">
          <XCircle size={20} className="text-[#FF4B4B] flex-shrink-0 mt-0.5" />
          <p className="text-[14px] font-bold text-[#1A1A1A]">{g.title}</p>
        </div>
        <div className="mt-2 ml-8 bg-[#FFFDF0] border border-[#FFC800] rounded-lg p-3">
          <p className="text-[12px] font-semibold text-[#6B6B6B] uppercase mb-1">
            Fix it
          </p>
          <p className="text-[13px] text-[#1A1A1A]">{g.fix}</p>
        </div>
      </div>
    ))}
  </div>
);

const CVFixesTab = ({ items }: { items: AnalysisResult['cvFixes'] }) => (
  <div className="flex flex-col gap-3">
    {items.map((fix, i) => (
      <div
        key={i}
        className="bg-white rounded-xl border border-[#E8E0D0] p-4"
      >
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase text-[#FF4B4B] mb-1">
            Original
          </p>
          <p className="text-[13px] text-[#6B6B6B] line-through">
            {fix.original}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase text-[#4CAF50] mb-1">
            Rewritten
          </p>
          <p className="text-[13px] text-[#1A1A1A] font-medium">
            {fix.rewritten}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const KeywordsTab = ({
  present,
  missing,
}: {
  present: string[];
  missing: string[];
}) => (
  <div className="bg-white rounded-xl border border-[#E8E0D0] p-4">
    <div className="mb-4">
      <p className="text-[12px] font-semibold text-[#4CAF50] uppercase mb-2">
        Keywords You Have ✓
      </p>
      <div className="flex flex-wrap gap-1.5">
        {present.map((k) => (
          <span
            key={k}
            className="bg-[#E8F9D9] text-[#2E7D32] border border-[#4CAF50] rounded-full px-2.5 py-1 text-xs font-semibold"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
    <div>
      <p className="text-[12px] font-semibold text-[#FF4B4B] uppercase mb-2">
        Missing Keywords
      </p>
      <div className="flex flex-wrap gap-1.5">
        {missing.map((k) => (
          <span
            key={k}
            className="bg-[#FFF0F0] text-[#FF4B4B] border border-[#FF4B4B] rounded-full px-2.5 py-1 text-xs font-semibold"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<'browse' | 'analyse'>('browse');

  // Browse state — restore from sessionStorage so JSearch results survive navigation
  const [jobs, setJobs] = useState<Job[]>(() => {
    if (typeof window === 'undefined') return ALL_JOBS;
    try {
      const saved = sessionStorage.getItem('cari_browse_jobs');
      if (saved) {
        const parsed = JSON.parse(saved) as Job[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return ALL_JOBS;
  });
  const [jobsError, setJobsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    if (typeof window === 'undefined') return ALL_JOBS[0].id;
    try {
      const saved = sessionStorage.getItem('cari_browse_jobs');
      if (saved) {
        const parsed = JSON.parse(saved) as Job[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch { /* ignore */ }
    return ALL_JOBS[0].id;
  });
  const [applyMessage, setApplyMessage] = useState('');
  const [externalLoading, setExternalLoading] = useState(false);

  // Mobile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetJobId, setSheetJobId] = useState<string | null>(null);

  // Analyse state
  const [analyseState, setAnalyseState] = useState<
    'input' | 'loading' | 'results'
  >('input');
  const [activeJDTab, setActiveJDTab] = useState<'paste' | 'screenshot'>(
    'paste'
  );
  const [jdText, setJdText] = useState('');
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('strengths');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadJobs() {
      try {
        const data = await cariApi.listJobs();
        if (!active) return;
        let mappedJobs = data.jobs.map(mapApiJob);
        if (mappedJobs.length === 0) {
          const external = await cariApi.searchExternalJobs({
            query: 'software engineer in Malaysia',
            country: 'my',
            datePosted: 'month',
            numPages: 1,
          });
          if (!active) return;
          mappedJobs = external.jobs.map(mapApiJob);
        }
        if (mappedJobs.length > 0) {
          setJobs(mappedJobs);
          setSelectedJobId(mappedJobs[0].id);
          try { sessionStorage.setItem('cari_browse_jobs', JSON.stringify(mappedJobs)); } catch { /* ignore */ }
        }
      } catch (error) {
        if (!active) return;
        try {
          const external = await cariApi.searchExternalJobs({
            query: 'software engineer in Malaysia',
            country: 'my',
            datePosted: 'month',
            numPages: 1,
          });
          if (!active) return;
          const mappedJobs = external.jobs.map(mapApiJob);
          if (mappedJobs.length > 0) {
            setJobs(mappedJobs);
            setSelectedJobId(mappedJobs[0].id);
            try { sessionStorage.setItem('cari_browse_jobs', JSON.stringify(mappedJobs)); } catch { /* ignore */ }
          }
        } catch (externalError) {
          setJobsError(
            externalError instanceof Error
              ? externalError.message
              : error instanceof Error
                ? error.message
                : 'Could not load jobs'
          );
        }
      }
    }

    loadJobs().catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? jobs[0] ?? ALL_JOBS[0];
  const selectedCompat = ALL_COMPATIBILITY[selectedJobId] ?? ALL_COMPATIBILITY['job-1'];
  const sheetJob = jobs.find((j) => j.id === sheetJobId);
  const sheetCompat = sheetJobId ? ALL_COMPATIBILITY[sheetJobId] : null;

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
    );
  });
  const result = analysisResult ?? {
    matchScore: 74,
    label: 'Close Match' as const,
    cuppyState: 'judgy' as const,
    verdict: MOCK_VERDICT,
    strengths: MOCK_STRENGTHS,
    gaps: MOCK_GAPS,
    cvFixes: MOCK_CV_FIXES,
    missingKeywords: MOCK_KEYWORDS_MISSING,
    presentKeywords: MOCK_KEYWORDS_HAVE,
  };

  const toggleFilter = (f: string) => {
    setSelectedFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
    haptic('light');
  };

  const handleSearchWebJobs = async () => {
    try {
      setExternalLoading(true);
      setJobsError('');
      const query = searchQuery.trim() || 'software engineer in Malaysia';
      const data = await cariApi.searchExternalJobs({
        query,
        country: 'my',
        datePosted: 'month',
        numPages: 1,
      });
      const mappedJobs = data.jobs.map(mapApiJob);
      if (mappedJobs.length > 0) {
        setJobs(mappedJobs);
        setSelectedJobId(mappedJobs[0].id);
        try { sessionStorage.setItem('cari_browse_jobs', JSON.stringify(mappedJobs)); } catch { /* ignore */ }
      } else {
        setJobsError('No external jobs found for that search.');
      }
    } catch (error) {
      setJobsError(error instanceof Error ? error.message : 'Could not search web jobs');
    } finally {
      setExternalLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    if (job?.source === 'jsearch' && job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
      setApplyMessage(`Opened external application for ${job.title}`);
      // Track in profileData so it appears in dashboard history
      void cariApi.trackExternalApplication({
        jobTitle: job.title,
        company: job.company,
        applyUrl: job.applyUrl,
        location: job.location,
      }).catch(() => undefined);
      return;
    }

    try {
      setApplyMessage('');
      const data = await cariApi.applyToJob(jobId);
      setApplyMessage(`Applied to ${data.application.jobTitle}`);
      haptic('success');
    } catch (error) {
      setApplyMessage(error instanceof Error ? error.message : 'Could not apply');
    }
  };

  const handleTailorResume = (job: Job) => {
    sessionStorage.setItem('cari_scanned_job', JSON.stringify(job));
    router.push(`/jobs/${job.id}`);
  };

  const handleAnalyse = async () => {
    try {
      setAnalysisError('');
      setAnalyseState('loading');
      const cvText = JSON.stringify({
        summary: 'Cari profile resume data',
        skills: selectedJob.requiredSkills,
      });
      const data = await cariApi.analyse({
        cvText: cvText.padEnd(120, ' '),
        jobDescription: (jdText || selectedJob.description || selectedJob.requiredSkills.join(', ')).padEnd(120, ' '),
        jobId: selectedJob.source === 'jsearch' ? null : selectedJob.id,
      });
      setAnalysisResult(data.analysis.result);
      setAnalyseState('results');
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Could not analyse this job');
      setAnalyseState('input');
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F5F0E8] flex">
      {/* ── Desktop Sidebar ── */}
      <Sidebar />

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-[220px] flex flex-col h-screen overflow-hidden">
        {/* Mobile top bar */}
        <TopBar />

        {/* Page content */}
        <div className="flex-1 flex flex-col overflow-hidden pb-20 lg:pb-0">
          {/* Tab switcher */}
          <div className="px-4 lg:px-6 py-4 flex-shrink-0">
            <div className="flex bg-white border border-[#E8E0D0] rounded-full p-1 w-fit">
              {(['browse', 'analyse'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    haptic('light');
                  }}
                  className="relative px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors"
                  style={{
                    color: activeTab === tab ? '#1A1A1A' : '#6B6B6B',
                  }}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-[#FFC800] rounded-full shadow-[0_2px_0_#CC9F00]"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === 'browse' ? 'Browse Jobs' : 'Analyse a Job'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── BROWSE TAB ── */}
          {activeTab === 'browse' && (
            <>
              {/* Desktop two-column layout */}
              <div className="hidden lg:flex flex-1 overflow-hidden">
                {/* Left column */}
                <div className="w-[420px] flex-shrink-0 bg-white border-r border-[#E8E0D0] flex flex-col overflow-y-auto">
                  {/* Search */}
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center bg-[#F5F0E8] border border-[#E8E0D0] rounded-xl px-3 h-11 gap-2">
                      <Search size={16} className="text-[#ABABAB]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search jobs, companies..."
                        className="flex-1 bg-transparent text-[14px] outline-none text-[#1A1A1A] placeholder:text-[#ABABAB]"
                      />
                    </div>
                    <button
                      onClick={handleSearchWebJobs}
                      disabled={externalLoading}
                      className="mt-2 w-full h-10 rounded-xl bg-[#1A1A1A] text-white text-[13px] font-bold disabled:opacity-60"
                    >
                      {externalLoading ? 'Searching Web Jobs...' : 'Search Web Jobs'}
                    </button>
                  </div>

                  {/* Filter chips */}
                  <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
                    {FILTER_OPTIONS.map((f) => (
                      <button
                        key={f}
                        onClick={() => toggleFilter(f)}
                        className={cn(
                          'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors',
                          selectedFilters.includes(f)
                            ? 'bg-[#FFC800] border-[#CC9F00] text-[#1A1A1A]'
                            : 'bg-white border-[#E8E0D0] text-[#6B6B6B]'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Job list */}
                  <div className="flex-1 overflow-y-auto">
                    {jobsError && (
                      <div className="mx-4 mb-3 rounded-xl border border-[#FF4B4B] bg-[#FFF0F0] p-3 text-[13px] font-semibold text-[#FF4B4B]">
                        {jobsError}
                      </div>
                    )}
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => {
                          setSelectedJobId(job.id);
                          haptic('light');
                        }}
                        className={cn(
                          'px-5 py-4 border-b border-[#E8E0D0] cursor-pointer transition-colors flex gap-3 items-start',
                          selectedJobId === job.id
                            ? 'bg-[#FFF8E1] border-l-4 border-l-[#FFC800]'
                            : 'bg-white hover:bg-[#FAFAF5]'
                        )}
                      >
                        <div
                          className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 text-[18px] font-bold"
                          style={{
                            backgroundColor: job.companyColor + '26',
                          }}
                        >
                          <span style={{ color: job.companyColor }}>
                            {job.company[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-[#1A1A1A] truncate">
                            {job.title}
                          </p>
                          <p className="text-[13px] text-[#6B6B6B] mt-0.5">
                            {job.company} • {job.location}
                          </p>
                          <p className="text-[14px] font-semibold text-[#FFC800] mt-1.5">
                            {job.currency} {job.salaryMin.toLocaleString()} -{' '}
                            {job.salaryMax.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <MatchBadge score={job.matchScore} />
                          <ChevronRight size={16} className="text-[#ABABAB]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column — Job detail */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedJobId}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Job header card */}
                      <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 flex justify-between items-start">
                        <div className="flex gap-4 items-start flex-1 min-w-0">
                          <div
                            className="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 text-[22px] font-bold"
                            style={{
                              backgroundColor: selectedJob.companyColor + '26',
                            }}
                          >
                            <span style={{ color: selectedJob.companyColor }}>
                              {selectedJob.company[0]}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[22px] font-bold text-[#1A1A1A]">
                              {selectedJob.title}
                            </p>
                            <p className="text-[14px] text-[#6B6B6B] mt-0.5">
                              {selectedJob.company} • {selectedJob.type} •{' '}
                              {selectedJob.workMode}
                            </p>
                            <p className="text-[15px] font-bold text-[#FFC800] mt-1.5">
                              {selectedJob.currency}{' '}
                              {selectedJob.salaryMin.toLocaleString()} -{' '}
                              {selectedJob.salaryMax.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <MatchBadge score={selectedCompat.matchScore} large />
                      </div>

                      {/* Job Description */}
                      {selectedJob.description && (
                        <div className="mt-4 bg-white rounded-2xl border border-[#E8E0D0] p-5">
                          <p className="text-[13px] font-bold uppercase tracking-widest text-[#FFC800] mb-2">About the Role</p>
                          <p className="text-[13px] text-[#4A4A4A] leading-relaxed">{selectedJob.description}</p>
                        </div>
                      )}

                      {/* Compatibility section */}
                      <div className="mt-4 bg-white rounded-2xl border border-[#E8E0D0] p-5">
                        <p className="text-[15px] font-bold text-[#1A1A1A] mb-3">
                          Compatibility
                        </p>
                        <SkillRadarChart data={selectedCompat.radarData} />
                        {/* Cari's Verdict */}
                        <div className="mt-4 flex gap-2.5 items-start">
                          <img src="/mascot-face.png" alt="Cuppy" style={{ width: 40, height: 40, borderRadius: 10, border: '2px solid #FFC800', objectFit: 'cover', flexShrink: 0 }} />
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-[#FFC800] uppercase tracking-widest mb-1">Cuppy&apos;s Verdict</p>
                            <div className="bg-[#FFF8E1] border border-[#FFC800] rounded-xl p-3">
                              <p className="text-[13px] italic text-[#1A1A1A]">"{selectedCompat.insights}"</p>
                            </div>
                          </div>
                        </div>
                        {/* Skill bars */}
                        <div className="mt-4 flex flex-col gap-3">
                          {selectedCompat.skillDetails.map((sd) => (
                            <div key={sd.label}>
                              <div className="flex justify-between mb-1">
                                <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">{sd.label}</span>
                                <span className="text-[12px] font-bold" style={{ color: sd.color }}>{sd.percent}%</span>
                              </div>
                              <div className="h-1.5 bg-[#F0EBE0] rounded-full overflow-hidden">
                                <motion.div className="h-full rounded-full" style={{ backgroundColor: sd.color }} initial={{ width: 0 }} animate={{ width: `${sd.percent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* You Have / You Need */}
                      <div className="mt-4 flex gap-4">
                        <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D0] p-4">
                          <p className="text-xs font-semibold text-[#4CAF50] mb-2">
                            You Have ✓
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCompat.userHasSkills.map((s) => (
                              <span
                                key={s}
                                className="bg-[#E8F9D9] text-[#2E7D32] border border-[#4CAF50] rounded-full px-2.5 py-1 text-xs font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D0] p-4">
                          <p className="text-xs font-semibold text-[#FF4B4B] mb-2">
                            You Need
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCompat.userMissingSkills.map((s) => (
                              <span
                                key={s}
                                className="bg-[#FFF0F0] text-[#FF4B4B] border border-[#FF4B4B] rounded-full px-2.5 py-1 text-xs font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 flex gap-3">
                        <motion.button
                          whileTap={{ scale: 0.97, y: 2 }}
                          onClick={() => handleTailorResume(selectedJob)}
                          className="flex-1 h-12 rounded-xl bg-[#FFC800] text-[15px] font-bold text-[#1A1A1A] shadow-[0_4px_0_#CC9F00]"
                        >
                          Scan Job →
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97, y: 2 }}
                          onClick={() => handleApply(selectedJob.id)}
                          className="flex-1 h-12 rounded-xl bg-white border-2 border-[#E8E0D0] text-[15px] font-bold text-[#1A1A1A] shadow-[0_4px_0_#D1D1D1]"
                        >
                          Apply Now
                        </motion.button>
                      </div>
                      {applyMessage && (
                        <p className="mt-3 text-[13px] font-semibold text-[#6B6B6B]">
                          {applyMessage}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Mobile browse layout ── */}
              <div className="lg:hidden px-4 flex flex-col gap-3">
                {/* Search */}
                <div className="flex items-center bg-white border border-[#E8E0D0] rounded-xl px-3 h-11 gap-2">
                  <Search size={16} className="text-[#ABABAB]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs, companies..."
                    className="flex-1 bg-transparent text-[14px] outline-none text-[#1A1A1A] placeholder:text-[#ABABAB]"
                  />
                </div>
                <button
                  onClick={handleSearchWebJobs}
                  disabled={externalLoading}
                  className="h-10 rounded-xl bg-[#1A1A1A] text-white text-[13px] font-bold disabled:opacity-60"
                >
                  {externalLoading ? 'Searching Web Jobs...' : 'Search Web Jobs'}
                </button>

                {/* Filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFilter(f)}
                      className={cn(
                        'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors',
                        selectedFilters.includes(f)
                          ? 'bg-[#FFC800] border-[#CC9F00] text-[#1A1A1A]'
                          : 'bg-white border-[#E8E0D0] text-[#6B6B6B]'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Job cards */}
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-[20px] border border-[#E8E0D0] p-4"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center flex-1 min-w-0">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-[18px] font-bold"
                          style={{
                            backgroundColor: job.companyColor + '26',
                          }}
                        >
                          <span style={{ color: job.companyColor }}>
                            {job.company[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[18px] font-bold text-[#1A1A1A] leading-tight">
                            {job.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin
                              size={12}
                              className="text-[#6B6B6B] flex-shrink-0"
                            />
                            <span className="text-[13px] text-[#6B6B6B]">
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="rounded-[10px] px-2.5 py-2 text-center ml-3 flex-shrink-0"
                        style={{
                          backgroundColor:
                            job.matchScore >= 75
                              ? '#FFC800'
                              : job.matchScore >= 50
                              ? '#E8F7FF'
                              : '#F0EBE0',
                        }}
                      >
                        <p
                          className="text-[18px] font-extrabold leading-none"
                          style={{
                            color:
                              job.matchScore >= 75
                                ? '#1A1A1A'
                                : job.matchScore >= 50
                                ? '#1CB0F6'
                                : '#6B6B6B',
                          }}
                        >
                          {job.matchScore}%
                        </p>
                        <p
                          className="text-[10px] font-semibold uppercase mt-0.5"
                          style={{
                            color:
                              job.matchScore >= 75
                                ? '#1A1A1A'
                                : job.matchScore >= 50
                                ? '#1CB0F6'
                                : '#6B6B6B',
                            opacity: 0.7,
                          }}
                        >
                          MATCH
                        </p>
                      </div>
                    </div>

                    {/* Salary */}
                    <p className="text-[16px] font-bold text-[#FFC800] mt-2.5">
                      {job.currency} {job.salaryMin.toLocaleString()} -{' '}
                      {job.salaryMax.toLocaleString()}
                    </p>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="bg-[#F5F0E8] border border-[#E8E0D0] rounded-full px-2.5 py-1 text-xs font-medium text-[#6B6B6B]"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="bg-[#F5F0E8] border border-[#E8E0D0] rounded-full px-2.5 py-1 text-xs font-medium text-[#6B6B6B]">
                          +{job.requiredSkills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#E8E0D0] my-3" />

                    {/* Buttons */}
                    <div className="flex gap-2.5">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setSheetJobId(job.id);
                          setSheetOpen(true);
                          haptic('light');
                        }}
                        className="flex-1 h-11 rounded-xl border border-[#E8E0D0] bg-white text-[14px] font-bold text-[#1A1A1A] shadow-[0_3px_0_#D1D1D1]"
                      >
                        Quick View
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleApply(job.id)}
                        className="flex-1 h-11 rounded-xl bg-[#FFC800] text-[14px] font-bold text-[#1A1A1A] shadow-[0_3px_0_#CC9F00]"
                      >
                        Apply
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── ANALYSE TAB ── */}
          {activeTab === 'analyse' && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {analyseState === 'input' && (
                <div className="px-4 lg:px-8 py-4 max-w-2xl">
                  {/* CV section */}
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
                    YOUR CV
                  </p>
                  <div className="bg-white rounded-xl border border-[#E8E0D0] border-l-4 border-l-[#FFC800] p-4 flex items-center gap-3">
                    <FileText size={20} className="text-[#FFC800]" />
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-[#1A1A1A]">
                        resume.pdf
                      </p>
                      <p className="text-[12px] text-[#4CAF50]">
                        Ready to go ✓
                      </p>
                    </div>
                    <button className="text-[13px] text-[#1CB0F6] cursor-pointer">
                      Change
                    </button>
                  </div>

                  {/* JD section */}
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] mt-5 mb-2">
                    JOB DESCRIPTION
                  </p>

                  {/* JD tabs */}
                  <div className="flex bg-[#F5F0E8] rounded-full p-1 w-fit mb-3">
                    {(['paste', 'screenshot'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveJDTab(tab)}
                        className={cn(
                          'px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors',
                          activeJDTab === tab
                            ? 'bg-white shadow text-[#1A1A1A]'
                            : 'text-[#6B6B6B]'
                        )}
                      >
                        {tab === 'paste' ? 'Paste Text' : 'Screenshot'}
                      </button>
                    ))}
                  </div>

                  {activeJDTab === 'paste' ? (
                    <div className="relative">
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="w-full min-h-[160px] bg-[#F5F0E8] border-2 border-[#E8E0D0] rounded-xl p-4 text-[14px] resize-none focus:border-[#FFC800] focus:outline-none text-[#1A1A1A] placeholder:text-[#ABABAB]"
                        maxLength={5000}
                      />
                      <p className="text-right text-[11px] text-[#ABABAB] mt-1">
                        {jdText.length} / 5000
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#1CB0F6] bg-[#E8F7FF] rounded-xl p-8 text-center cursor-pointer">
                      <Camera
                        size={32}
                        className="text-[#1CB0F6] mx-auto mb-2"
                      />
                      <p className="text-[14px] font-semibold text-[#1CB0F6]">
                        Upload a screenshot
                      </p>
                      <p className="text-[12px] text-[#6B6B6B] mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  )}

                  {/* GitHub */}
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] mt-5 mb-2">
                    GITHUB PROFILE{' '}
                    <span className="normal-case text-[10px] bg-[#F5F0E8] border border-[#E8E0D0] rounded-full px-2 py-0.5 ml-1">
                      Optional
                    </span>
                  </p>
                  <div className="flex items-center border-2 border-[#E8E0D0] rounded-xl bg-white px-4 h-[50px] focus-within:border-[#FFC800] transition-colors">
                    <Link size={18} className="text-[#ABABAB] mr-2" />
                    <span className="text-[15px] text-[#ABABAB]">
                      github.com/
                    </span>
                    <input
                      type="text"
                      defaultValue="mirulhaziq"
                      placeholder="username"
                      className="flex-1 border-none outline-none text-[15px] text-[#1A1A1A] bg-transparent ml-0.5"
                    />
                  </div>

                  {/* Analyse button */}
                  <motion.button
                    whileTap={{ scale: 0.97, y: 2 }}
                    onClick={handleAnalyse}
                    className="mt-7 w-full h-[54px] bg-[#FFC800] rounded-[14px] shadow-[0_4px_0_#CC9F00] flex items-center justify-center gap-2 text-[16px] font-bold text-[#1A1A1A]"
                  >
                    <BarChart2 size={20} />
                    Analyse Compatibility →
                  </motion.button>
                  {analysisError && (
                    <p className="mt-3 text-[13px] font-semibold text-[#FF4B4B]">
                      {analysisError}
                    </p>
                  )}
                </div>
              )}

              {analyseState === 'loading' && (
                <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#FFC800] opacity-30"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-[140px] h-[140px] rounded-full overflow-hidden bg-[#FFF8E1] relative z-10 flex items-center justify-center"
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <span className="text-[60px]">🤖</span>
                    </motion.div>
                  </div>

                  <p className="text-[20px] font-bold text-[#1A1A1A] mt-5">
                    Analysing your fit...
                  </p>
                  <p className="text-[14px] text-[#6B6B6B] mt-1.5">
                    Senior Frontend Engineer at TechCorp
                  </p>

                  {/* Progress bar */}
                  <div className="w-full max-w-[400px] h-2 bg-[#E8E0D0] rounded-full mt-6 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FFC800] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.2, ease: 'easeOut' }}
                    />
                  </div>

                  <LoadingSteps />
                </div>
              )}

              {analyseState === 'results' && (
                <div className="px-4 lg:px-8 py-4 max-w-2xl">
                  <ScoreCard score={result.matchScore} />
                  <VerdictCard verdict={result.verdict} />
                  <ResultTabs
                    activeResultTab={activeResultTab}
                    setActiveResultTab={setActiveResultTab}
                  />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeResultTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeResultTab === 'strengths' && <StrengthsTab items={result.strengths} />}
                      {activeResultTab === 'gaps' && <GapsTab items={result.gaps} />}
                      {activeResultTab === 'cvfixes' && <CVFixesTab items={result.cvFixes} />}
                      {activeResultTab === 'keywords' && (
                        <KeywordsTab present={result.presentKeywords} missing={result.missingKeywords} />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom actions */}
                  <div className="mt-6 pb-6 border-t border-[#E8E0D0] pt-4">
                    <button
                      onClick={() => {
                        setAnalyseState('input');
                        setJdText('');
                      }}
                      className="flex items-center gap-1.5 text-[13px] text-[#6B6B6B]"
                    >
                      <ArrowLeft size={14} /> Try another job
                    </button>
                    <div className="flex gap-2.5 mt-3">
                      <motion.button
                        whileTap={{ scale: 0.97, y: 2 }}
                        onClick={() => handleTailorResume(selectedJob)}
                        className="flex-1 h-12 rounded-xl bg-[#FFC800] text-[15px] font-bold text-[#1A1A1A] shadow-[0_4px_0_#CC9F00]"
                      >
                        Scan Job →
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97, y: 2 }}
                        onClick={() => handleApply(selectedJob.id)}
                        className="flex-1 h-12 rounded-xl bg-white border-2 border-[#E8E0D0] text-[15px] font-bold text-[#1A1A1A] shadow-[0_4px_0_#D1D1D1]"
                      >
                        Apply Anyway
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Mobile bottom nav ── */}
        <BottomNav />
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {sheetOpen && sheetJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 bg-black z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-[70] max-h-[85vh] overflow-y-auto"
            >
              {/* Handle bar */}
              <div className="w-10 h-1 bg-[#D1D1D1] rounded-full mx-auto mt-3 mb-4" />

              {/* Job header */}
              <div className="px-5 pb-4 border-b border-[#E8E0D0] flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[18px] font-bold"
                  style={{ backgroundColor: sheetJob.companyColor + '26' }}
                >
                  <span style={{ color: sheetJob.companyColor }}>
                    {sheetJob.company[0]}
                  </span>
                </div>
                <div>
                  <p className="text-[17px] font-bold text-[#1A1A1A]">
                    {sheetJob.title}
                  </p>
                  <p className="text-[13px] text-[#6B6B6B]">
                    {sheetJob.company} • {sheetJob.workMode}
                  </p>
                </div>
              </div>

              {/* Match score circle */}
              <div className="py-5 flex items-center justify-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border-4"
                  style={{
                    borderColor:
                      sheetJob.matchScore >= 75
                        ? '#FFC800'
                        : sheetJob.matchScore >= 50
                        ? '#1CB0F6'
                        : '#ABABAB',
                  }}
                >
                  <span
                    className="text-[28px] font-extrabold"
                    style={{
                      color:
                        sheetJob.matchScore >= 75
                          ? '#FFC800'
                          : sheetJob.matchScore >= 50
                          ? '#1CB0F6'
                          : '#ABABAB',
                    }}
                  >
                    {sheetJob.matchScore}%
                  </span>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B6B6B]">
                    Compatibility Score
                  </p>
                  <p className="text-[11px] text-[#ABABAB]">
                    Based on your profile
                  </p>
                </div>
              </div>

              {/* Job description */}
              {sheetJob.description && (
                <div className="px-5 mb-4 bg-[#FAFAF8] rounded-2xl border border-[#E8E0D0] p-4 mx-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#FFC800] mb-1.5">About the Role</p>
                  <p className="text-[12px] text-[#4A4A4A] leading-relaxed">{sheetJob.description}</p>
                </div>
              )}

              {/* Radar chart */}
              <div className="mb-4 px-5">
                <SkillRadarChart data={ALL_COMPATIBILITY[sheetJob.id]?.radarData ?? []} />
              </div>

              {/* Skill bars */}
              {sheetCompat && (
                <div className="px-5 flex flex-col gap-3 mb-4">
                  {sheetCompat.skillDetails.map((sd) => (
                    <div key={sd.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">
                          {sd.label}
                        </span>
                        <span
                          className="text-[12px] font-bold"
                          style={{ color: sd.color }}
                        >
                          {sd.percent}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F0EBE0] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: sd.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${sd.percent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* You have / need */}
              {sheetCompat && (
                <div className="px-5 flex gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#4CAF50] mb-2">
                      You Have ✓
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sheetCompat.userHasSkills.map((s) => (
                        <span
                          key={s}
                          className="bg-[#E8F9D9] text-[#2E7D32] border border-[#4CAF50] rounded-full px-2.5 py-1 text-xs font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#FF4B4B] mb-2">
                      You Need
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sheetCompat.userMissingSkills.map((s) => (
                        <span
                          key={s}
                          className="bg-[#FFF0F0] text-[#FF4B4B] border border-[#FF4B4B] rounded-full px-2.5 py-1 text-xs font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Insight */}
              {sheetCompat && (
                <div className="px-5 mb-4">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full border-2 border-[#FFC800] overflow-hidden flex-shrink-0 bg-[#FFF8E1] flex items-center justify-center">
                      <span className="text-[16px]">🤖</span>
                    </div>
                    <div className="bg-white border border-[#E8E0D0] rounded-xl p-3 flex-1">
                      <p className="text-[13px] italic text-[#1A1A1A]">
                        "{sheetCompat.insights}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="px-5 pb-8 flex flex-col gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.97, y: 2 }}
                  onClick={() => handleTailorResume(sheetJob)}
                  className="w-full h-13 rounded-xl bg-[#FFC800] text-[15px] font-bold text-[#1A1A1A] shadow-[0_4px_0_#CC9F00] py-3"
                >
                  Scan Job →
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97, y: 2 }}
                  onClick={() => handleApply(sheetJob.id)}
                  className="w-full h-13 rounded-xl bg-white border-2 border-[#E8E0D0] text-[15px] font-bold text-[#1A1A1A] shadow-[0_4px_0_#D1D1D1] py-3"
                >
                  Apply Now
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
