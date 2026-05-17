'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  ExternalLink,
  ScrollText,
  ChevronRight,
  Sparkles,
  Clock,
  Search,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { cariApi, type SavedResumeResponse } from '@/lib/cari-api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TailoredResume {
  id: string;
  jobTitle: string;
  company: string;
  companyColor: string;
  matchScore: number;
  createdAt: string;
  status: 'applied' | 'saved' | 'draft';
  atsOptimized: boolean;
  jobId: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESUMES: TailoredResume[] = [
  {
    id: 'tr-1',
    jobTitle: 'Software Engineer II',
    company: 'TechFlow Studios',
    companyColor: '#1CB0F6',
    matchScore: 94,
    createdAt: '3 days ago',
    status: 'applied',
    atsOptimized: true,
    jobId: 'job-1',
  },
  {
    id: 'tr-2',
    jobTitle: 'Senior Frontend Engineer',
    company: 'TechCorp Malaysia',
    companyColor: '#FFC800',
    matchScore: 74,
    createdAt: '1 week ago',
    status: 'saved',
    atsOptimized: true,
    jobId: 'job-2',
  },
  {
    id: 'tr-3',
    jobTitle: 'UI Engineer',
    company: 'PayStream',
    companyColor: '#7C5CBF',
    matchScore: 52,
    createdAt: '2 weeks ago',
    status: 'saved',
    atsOptimized: false,
    jobId: 'job-3',
  },
  {
    id: 'tr-4',
    jobTitle: 'Software Engineer (Backend)',
    company: 'Axiata Digital',
    companyColor: '#4CAF50',
    matchScore: 61,
    createdAt: '3 weeks ago',
    status: 'draft',
    atsOptimized: false,
    jobId: 'job-4',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  applied: { label: 'Applied', bg: '#E8F9D9', color: '#2E7D32', border: '#4CAF50' },
  saved:   { label: 'Saved',   bg: '#E8F7FF', color: '#1CB0F6', border: '#1CB0F6' },
  draft:   { label: 'Draft',   bg: '#F5F0E8', color: '#6B6B6B', border: '#D1D1D1' },
};

function matchColor(score: number) {
  if (score >= 75) return { bg: '#FFC800', text: '#1A1A1A' };
  if (score >= 50) return { bg: '#E8F7FF', text: '#1CB0F6' };
  return { bg: '#F5F0E8', text: '#6B6B6B' };
}

// ─── Resume Card ──────────────────────────────────────────────────────────────

function mapSavedResume(saved: SavedResumeResponse): TailoredResume {
  const company = saved.resume.metadata.company ?? 'Saved Resume';

  return {
    id: saved.id,
    jobTitle: saved.resume.metadata.jobTitle ?? saved.resume.metadata.title,
    company,
    companyColor: '#1CB0F6',
    matchScore: saved.resume.metadata.matchScore ?? 80,
    createdAt: new Date(saved.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: saved.applicationStatus ? 'applied' : 'saved',
    atsOptimized: saved.resume.metadata.atsOptimized ?? true,
    jobId: saved.jobId ?? saved.id,
  };
}

function ResumeCard({ resume, index }: { resume: TailoredResume; index: number }) {
  const router = useRouter();
  const mc = matchColor(resume.matchScore);
  const sc = STATUS_CONFIG[resume.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="bg-white rounded-2xl border border-[#E8E0D0] p-5"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 text-[18px] font-bold"
            style={{ backgroundColor: resume.companyColor + '22' }}
          >
            <span style={{ color: resume.companyColor }}>{resume.company[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-[#1A1A1A] truncate">{resume.jobTitle}</p>
            <p className="text-[13px] text-[#6B6B6B] mt-0.5">{resume.company}</p>
          </div>
        </div>
        <div
          className="rounded-xl px-3 py-2 text-center flex-shrink-0"
          style={{ backgroundColor: mc.bg }}
        >
          <p className="text-[18px] font-extrabold leading-none" style={{ color: mc.text }}>
            {resume.matchScore}%
          </p>
          <p className="text-[9px] font-semibold uppercase mt-0.5" style={{ color: mc.text, opacity: 0.7 }}>
            MATCH
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
        >
          {sc.label}
        </span>
        {resume.atsOptimized && (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#F0EBFF] text-[#7C5CBF] border border-[#7C5CBF]">
            ✓ ATS Optimized
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Clock size={12} className="text-[#ABABAB]" />
          <span className="text-[12px] text-[#ABABAB]">{resume.createdAt}</span>
        </div>
      </div>

      <div className="border-t border-[#E8E0D0] my-4" />

      {/* Actions */}
      <div className="flex gap-2.5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { haptic('light'); router.push(`/jobs/${resume.jobId}/tailored?resumeId=${resume.id}`); }}
          className="flex-1 h-10 rounded-xl bg-[#FFC800] text-[13px] font-bold text-[#1A1A1A] flex items-center justify-center gap-1.5"
          style={{ boxShadow: '0 3px 0 #CC9F00' }}
        >
          <ExternalLink size={14} />
          View Resume
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => haptic('light')}
          className="h-10 px-4 rounded-xl border border-[#E8E0D0] bg-white text-[13px] font-bold text-[#1A1A1A] flex items-center gap-1.5"
          style={{ boxShadow: '0 3px 0 #D1D1D1' }}
        >
          <Download size={14} />
          PDF
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#FFF8E1] border-2 border-[#FFC800] flex items-center justify-center mb-5">
        <ScrollText size={32} className="text-[#FFC800]" />
      </div>
      <p className="text-[18px] font-bold text-[#1A1A1A] mb-2">No tailored resumes yet</p>
      <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-xs mb-6">
        Browse jobs and tap &lsquo;Tailor Resume&rsquo; to create a role-specific version optimized for each company.
      </p>
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[#FFC800] text-[14px] font-bold text-[#1A1A1A]"
        style={{ boxShadow: '0 4px 0 #CC9F00', textDecoration: 'none' }}
      >
        <Sparkles size={16} />
        Browse Jobs
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResumesPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'applied' | 'saved' | 'draft'>('all');
  const [resumes, setResumes] = useState<TailoredResume[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    cariApi
      .listResumes({ limit: 100 })
      .then((data) => {
        if (!active) return;
        setResumes(data.resumes.map(mapSavedResume));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load resumes');
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = resumes.filter(r => {
    const matchesSearch =
      r.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'all' || r.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const FILTERS = [
    { key: 'all' as const,     label: 'All' },
    { key: 'applied' as const, label: 'Applied' },
    { key: 'saved' as const,   label: 'Saved' },
    { key: 'draft' as const,   label: 'Draft' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      <Sidebar />

      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">
        <TopBar />

        {/* Desktop header */}
        <div
          className="hidden lg:flex items-center justify-between px-8 py-5"
          style={{ background: '#1A1A1A', borderBottom: '1px solid #2D2D2D' }}
        >
          <div>
            <div className="text-[11px] font-bold text-[#FFC800] uppercase tracking-widest mb-1">
              MY RESUMES
            </div>
            <div className="text-[22px] font-extrabold text-white">
              Tailored Resume History
            </div>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-[#1A1A1A]"
            style={{ background: '#FFC800', boxShadow: '0 3px 0 #CC9F00', textDecoration: 'none' }}
          >
            <Sparkles size={15} />
            Tailor New Resume
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 lg:px-8 py-6 pb-28 lg:pb-10">

          <div className="lg:hidden mb-5">
            <p className="text-[22px] font-extrabold text-[#1A1A1A]">My Resumes</p>
            <p className="text-[13px] text-[#6B6B6B] mt-1">
              {resumes.length} tailored resume{resumes.length !== 1 ? 's' : ''} created
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-[#FF4B4B] bg-[#FFF0F0] px-4 py-3 text-[13px] font-bold text-[#FF4B4B]">
              {error}
            </div>
          )}

          {/* Search + filters row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
            <div className="flex items-center gap-2 bg-white border border-[#E8E0D0] rounded-xl px-4 h-11 lg:w-80 flex-shrink-0">
              <Search size={16} className="text-[#ABABAB] flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by role or company..."
                className="flex-1 bg-transparent text-[14px] outline-none text-[#1A1A1A] placeholder:text-[#ABABAB]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => { setActiveFilter(f.key); haptic('light'); }}
                  className={cn(
                    'flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-colors',
                    activeFilter === f.key
                      ? 'bg-[#FFC800] border-[#CC9F00] text-[#1A1A1A]'
                      : 'bg-white border-[#E8E0D0] text-[#6B6B6B]'
                  )}
                >
                  {f.label}
                  {f.key !== 'all' && (
                    <span className="ml-1.5 text-[11px] opacity-60">
                      {resumes.filter(r => r.status === f.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Resumes', value: resumes.length, color: '#FFC800' },
              { label: 'Applied',       value: resumes.filter(r => r.status === 'applied').length, color: '#4CAF50' },
              { label: 'ATS Optimized', value: resumes.filter(r => r.atsOptimized).length, color: '#7C5CBF' },
              { label: 'Avg Match',     value: `${resumes.length ? Math.round(resumes.reduce((s, r) => s + r.matchScore, 0) / resumes.length) : 0}%`, color: '#1CB0F6' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-[#E8E0D0] p-5 text-center">
                <p className="text-[28px] font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[12px] text-[#6B6B6B] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filtered.map((resume, i) => (
                    <ResumeCard key={resume.id} resume={resume} index={i} />
                  ))}
                </div>
                <div className="mt-4 bg-white rounded-2xl border border-[#E8E0D0] p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF8E1] border border-[#FFC800] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={20} className="text-[#FFC800]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#1A1A1A]">Tailor another resume</p>
                    <p className="text-[12px] text-[#6B6B6B] mt-0.5">Each tailored resume boosts your match score by up to 20%.</p>
                  </div>
                  <Link href="/jobs" className="flex items-center gap-1 text-[13px] font-bold text-[#FFC800] flex-shrink-0" style={{ textDecoration: 'none' }}>
                    Browse <ChevronRight size={15} />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
