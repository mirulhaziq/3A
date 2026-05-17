'use client';

import { use, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  ChevronLeft,
  Briefcase,
  Home,
  Map,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  Circle,
  LayoutGrid,
  Sparkles,
  Download,
  FileText,
  Bell,
  Trophy,
  BarChart2,
  Info,
} from 'lucide-react';
import { haptic } from '@/lib/haptics';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_JOB_DETAIL = {
  id: 'job-1',
  title: 'Software Engineer II',
  company: 'TechFlow Studios',
  type: 'Full-time',
  workMode: 'Remote (MY)',
  matchScore: 94,
  atsOptimized: true,
  overview: `TechFlow is seeking a talented Software Engineer II to join our core product team. You will be responsible for building and maintaining high-performance web applications that serve millions of users globally. We value clean code, scalable architecture, and a passion for modern frontend technologies.`,
  responsibilities: [
    'Develop and maintain scalable frontend components using React and TypeScript.',
    'Collaborate with product designers to implement pixel-perfect user interfaces.',
    'Optimize application performance for maximum speed and scalability.',
    'Lead the migration of legacy services to modern micro-frontend architectures.',
    'Conduct code reviews and mentor junior developers on best practices.',
  ],
  requirements: [
    { label: '3+ years of experience with React.js and modern JS/TS.', met: true },
    { label: 'Strong understanding of Tailwind CSS or CSS-in-JS.', met: true },
    { label: 'Experience with Node.js and RESTful API design.', met: true },
    { label: 'Proficiency in state management (Redux, Zustand).', met: false },
  ],
  cuppyInsight: `"The JD emphasizes 'micro-frontends'. Highlight your migration project to stand out!"`,
};

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = [
    { label: 'Home', icon: Home, href: '/dashboard' },
    { label: 'Jobs', icon: Briefcase, href: '/jobs' },
    { label: 'Roadmap', icon: Map, href: '/roadmap' },
    { label: 'Profile', icon: User, href: '/profile' },
  ];
  return (
    <aside className="hidden lg:flex w-[220px] flex-shrink-0 bg-[#1A1A1A] flex-col fixed left-0 top-0 h-full z-40 py-8 px-5">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 bg-[#FFC800] rounded-xl flex items-center justify-center">
          <Briefcase size={18} color="#1A1A1A" />
        </div>
        <div>
          <p className="text-white text-[18px] font-extrabold leading-none">Cari</p>
          <p className="text-[#6B6B6B] text-[11px] mt-0.5">Career Co-pilot</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const active =
            pathname === href ||
            pathname.startsWith(href === '/dashboard' ? href : href + '/') ||
            (href === '/jobs' && pathname.startsWith('/jobs'));
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors w-full text-left ${
                active
                  ? 'bg-[#FFC800] text-[#1A1A1A]'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#2D2D2D]'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-[#2D2D2D] pt-4 flex flex-col gap-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#2D2D2D] text-[15px] font-semibold transition-colors w-full">
          <Settings size={20} /> Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#2D2D2D] text-[15px] font-semibold transition-colors w-full">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// DiamondChart
// ---------------------------------------------------------------------------

function DiamondChart({ score, labels }: { score: number; labels: string[] }) {
  const s = score / 100;
  const top = `100,${10 + 90 * (1 - s)}`;
  const right = `${190 - 90 * (1 - s)},100`;
  const bottom = `100,${190 - 90 * (1 - s)}`;
  const left = `${10 + 90 * (1 - s)},100`;
  const innerPoints = `${top} ${right} ${bottom} ${left}`;
  return (
    <div className="relative w-[200px] h-[200px] mx-auto flex-shrink-0">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <polygon
          points="100,10 190,100 100,190 10,100"
          fill="rgba(200,180,140,0.15)"
          stroke="#C8B48C"
          strokeDasharray="6 4"
          strokeWidth="1.5"
        />
        <motion.polygon
          points="100,100 100,100 100,100 100,100"
          animate={{ points: innerPoints }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          fill="rgba(255,200,0,0.25)"
          stroke="#FFC800"
          strokeWidth="2"
        />
      </svg>
      <span className="absolute top-[-16px] left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase text-[#6B6B6B] whitespace-nowrap">
        {labels[0]}
      </span>
      <span className="absolute right-[-36px] top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-[#6B6B6B] whitespace-nowrap">
        {labels[1]}
      </span>
      <span className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase text-[#6B6B6B] whitespace-nowrap">
        {labels[2]}
      </span>
      <span className="absolute left-[-36px] top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-[#6B6B6B] whitespace-nowrap">
        {labels[3]}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function JobDescriptionPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">

        {/* DESKTOP: Sticky analyzing banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-[#E8E0D0] px-8 py-4 items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#E8F7FF] rounded-[10px] flex items-center justify-center">
              <Rocket size={22} className="text-[#1CB0F6]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#6B6B6B] font-semibold">
                ANALYSING JOB FOR:
              </p>
              <p className="text-[20px] font-bold text-[#1A1A1A]">
                Software Engineer II @ TechFlow
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFF8E1] border border-[#FFC800] rounded-full px-4 py-1.5 text-[13px] font-bold text-[#1A1A1A]">
              ⚡ 94% Match
            </span>
            <span className="bg-[#E8F7FF] border border-[#1CB0F6] rounded-full px-4 py-1.5 text-[13px] font-bold text-[#1CB0F6]">
              ✓ ATS Optimized
            </span>
          </div>
        </motion.div>

        {/* MOBILE top bar */}
        <div className="lg:hidden sticky top-0 z-40 bg-[#F5F0E8] border-b border-[#E8E0D0] px-4 flex items-center justify-between h-[52px]">
          <button onClick={() => router.back()} className="flex items-center gap-1">
            <ChevronLeft size={22} className="text-[#1A1A1A]" />
            <span className="text-[16px] font-bold text-[#CC9F00]">Analysis</span>
          </button>
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-[#6B6B6B]" />
            <Trophy size={20} className="text-[#6B6B6B]" />
          </div>
        </div>

        {/* MOBILE: Now analyzing banner */}
        <div className="lg:hidden mx-4 mt-3 mb-4 bg-[#E8F7FF] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
            <BarChart2 size={18} className="text-[#1CB0F6]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1CB0F6]">
              NOW ANALYZING
            </p>
            <p className="text-[14px] font-bold text-[#1A1A1A] mt-0.5">
              Software Engineer II @ TechFlow
            </p>
          </div>
        </div>

        {/* MOBILE: Cuppy message */}
        <div className="lg:hidden mx-4 mb-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl border-2 border-[#FFC800] overflow-hidden bg-[#FFF8E1] flex-shrink-0">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              <img
                src="/cuppy-placeholder.png"
                alt="Cuppy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.textContent = '☕';
                }}
              />
            </motion.div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D0] p-4">
            <p className="text-[14px] font-semibold text-[#1A1A1A] leading-relaxed italic">
              {MOCK_JOB_DETAIL.cuppyInsight}
            </p>
          </div>
        </div>

        {/* MOBILE: Match Quality Card */}
        <div className="lg:hidden mx-4 mb-4 bg-white rounded-2xl border border-[#E8E0D0] p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[16px] font-bold text-[#1A1A1A]">Match Quality</p>
              <p className="text-[12px] text-[#6B6B6B] mt-0.5">Based on your career roadmap</p>
            </div>
            <div className="bg-[#FFC800] rounded-xl px-3 py-2 text-center">
              <p className="text-[18px] font-extrabold text-[#1A1A1A] leading-none">94%</p>
              <p className="text-[10px] font-semibold text-[#1A1A1A]">MATCH</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <DiamondChart
              score={94}
              labels={['UI DESIGN', 'PROTOTYPING', 'LEADERSHIP', 'STRATEGY']}
            />
          </div>
        </div>

        {/* MOBILE: Smart Tailoring Card */}
        <div className="lg:hidden mx-4 mb-4 bg-[#1A1A1A] rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Sparkles size={20} className="text-[#FFC800]" />
            <span className="text-[18px] font-bold text-white">Smart Tailoring</span>
          </div>
          <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-4">
            We found 4 keywords missing from your current resume that this employer specifically
            looks for.
          </p>
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => router.push('/jobs/' + jobId + '/tailored')}
            className="w-full h-12 bg-[#FFC800] rounded-xl shadow-[0_3px_0_#CC9F00] flex items-center justify-center gap-2"
          >
            <FileText size={18} className="text-[#1A1A1A]" />
            <span className="text-[13px] font-bold uppercase text-[#1A1A1A]">
              CREATE TAILORED RESUME
            </span>
          </motion.button>
        </div>

        {/* MOBILE: Job Description Card */}
        <div className="lg:hidden mx-4 mb-4 bg-white rounded-2xl border border-[#E8E0D0] p-5 pb-40">
          <p className="text-[18px] font-bold text-[#1A1A1A] mb-4">Job Description</p>

          {/* Overview */}
          <div>
            <p className="text-[14px] font-bold text-[#FFC800] mb-2">Overview</p>
            <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
              {MOCK_JOB_DETAIL.overview}
            </p>
          </div>

          {/* Responsibilities */}
          <div className="mt-4">
            <p className="text-[14px] font-bold text-[#FFC800] mb-2">Responsibilities</p>
            <ul className="flex flex-col gap-2">
              {MOCK_JOB_DETAIL.responsibilities.map((item, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <CheckCircle2 size={16} className="text-[#4CAF50] flex-shrink-0 mt-0.5" />
                  <p className="text-[14px] text-[#4A4A4A] leading-snug">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="mt-4">
            <p className="text-[14px] font-bold text-[#FFC800] mb-3">Requirements</p>
            <div className="flex flex-wrap gap-2">
              {MOCK_JOB_DETAIL.requirements.map((req, i) => (
                <span
                  key={i}
                  className="bg-[#F5F0E8] border border-[#E8E0D0] rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase text-[#6B6B6B]"
                >
                  {req.label.split(' ').slice(0, 4).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* DESKTOP: Two-column content grid */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_320px] gap-6 p-6 max-w-[1200px]">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* Job Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8E0D0] p-6"
            >
              <div className="flex items-center gap-4 pb-5 border-b border-[#E8E0D0]">
                <div className="w-[52px] h-[52px] bg-[#F0EBE0] rounded-xl flex items-center justify-center">
                  <LayoutGrid size={24} className="text-[#8B7355]" />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-[#1A1A1A]">Software Engineer II</p>
                  <p className="text-[14px] text-[#6B6B6B] mt-1">
                    TechFlow Studios • Full-time • Remote (MY)
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8E0D0] p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-4">
                JOB OVERVIEW
              </p>
              <div className="h-px bg-[#E8E0D0] mb-4" />
              <p className="text-[15px] text-[#4A4A4A] leading-relaxed">
                {MOCK_JOB_DETAIL.overview}
              </p>
            </motion.div>

            {/* Responsibilities Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8E0D0] p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-4">
                KEY RESPONSIBILITIES
              </p>
              <div className="h-px bg-[#E8E0D0] mb-4" />
              <ul className="flex flex-col gap-3">
                {MOCK_JOB_DETAIL.responsibilities.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFC800] flex-shrink-0 mt-2" />
                    <p className="text-[15px] text-[#4A4A4A] leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Requirements Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8E0D0] p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-4">
                REQUIREMENTS
              </p>
              <div className="h-px bg-[#E8E0D0] mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {MOCK_JOB_DETAIL.requirements.map((req, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    {req.met ? (
                      <CheckCircle2
                        size={20}
                        className="text-[#4CAF50] flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <Circle size={20} className="text-[#ABABAB] flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-[14px] ${req.met ? 'text-[#1A1A1A]' : 'text-[#ABABAB]'}`}>
                      {req.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4 sticky top-[80px] self-start">

            {/* Match Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8E0D0] p-5"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[15px] font-bold text-[#1A1A1A]">Match Score</span>
                <Info size={18} className="text-[#ABABAB]" />
              </div>

              <div className="mx-auto mb-4 w-[160px] h-[160px] bg-[#2D2D2D] rounded-2xl flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                >
                  <div className="w-[120px] h-[120px] bg-[#FFC800] rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_0_4px_rgba(255,255,255,0.2),0_4px_16px_rgba(255,200,0,0.4)]">
                    <span className="text-[32px] font-extrabold text-[#1A1A1A] leading-none">
                      94%
                    </span>
                    <span className="text-[11px] font-semibold text-[#1A1A1A] mt-0.5">MATCH</span>
                  </div>
                </motion.div>
              </div>

              <p className="text-[13px] text-[#6B6B6B] text-center leading-relaxed">
                Your profile is a near-perfect match for the technical stack and experience level
                required.
              </p>
            </motion.div>

            {/* Smart Tailoring Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="bg-[#FFC800] rounded-2xl p-5 border-2 border-[#CC9F00]"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-black/10 rounded-lg flex items-center justify-center">
                  <Sparkles size={18} className="text-[#1A1A1A]" />
                </div>
                <span className="text-[18px] font-bold text-[#1A1A1A]">Smart Tailoring</span>
              </div>
              <p className="text-[13px] text-[#1A1A1A]/65 leading-relaxed mb-4">
                Generate a custom resume optimized for this specific role and TechFlow&apos;s ATS
                in seconds.
              </p>
              <motion.button
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={() => router.push('/jobs/' + jobId + '/tailored')}
                className="w-full h-12 bg-white rounded-xl border-2 border-black/10 shadow-[0_3px_0_#CC9F00] flex items-center justify-center gap-2"
              >
                <FileText size={18} className="text-[#1A1A1A]" />
                <span className="text-[13px] font-bold uppercase text-[#1A1A1A] tracking-wider">
                  CREATE TAILORED RESUME
                </span>
              </motion.button>
            </motion.div>

            {/* Cuppy insight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8E0D0] p-4"
            >
              <div className="flex gap-3 items-start">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-11 h-11 rounded-full border-2 border-[#FFC800] overflow-hidden bg-[#FFF8E1] flex-shrink-0">
                    <img
                      src="/cuppy-placeholder.png"
                      alt="Cuppy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.textContent = '☕';
                      }}
                    />
                  </div>
                </motion.div>
                <div className="flex-1 bg-[#F5F0E8] rounded-xl p-3 text-[13px] text-[#1A1A1A] leading-relaxed italic">
                  {MOCK_JOB_DETAIL.cuppyInsight}
                </div>
              </div>
            </motion.div>

            {/* Apply Now */}
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => {
                haptic('success');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2500);
              }}
              className="w-full h-[52px] bg-[#2D2D2D] rounded-2xl shadow-[0_4px_0_#1A1A1A] flex items-center justify-center gap-2"
            >
              <Rocket size={18} className="text-white" />
              <span className="text-[14px] font-bold text-white uppercase tracking-wider">
                APPLY NOW
              </span>
            </motion.button>

            {/* Download PDF */}
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              className="w-full h-[52px] bg-white rounded-2xl border-2 border-[#E8E0D0] shadow-[0_4px_0_#D1D1D1] flex items-center justify-center gap-2"
            >
              <Download size={18} className="text-[#1A1A1A]" />
              <span className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                DOWNLOAD PDF
              </span>
            </motion.button>
          </div>
        </div>

        {/* MOBILE sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E0D0] px-4 pt-3 pb-7">
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => {
              haptic('success');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2500);
            }}
            className="w-full h-[52px] bg-[#FFC800] rounded-2xl shadow-[0_4px_0_#CC9F00] mb-2.5 text-[15px] font-bold text-[#1A1A1A] uppercase"
          >
            APPLY NOW
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            className="w-full h-[52px] bg-white border-2 border-[#E8E0D0] rounded-2xl shadow-[0_4px_0_#D1D1D1] flex items-center justify-center gap-2"
          >
            <Download size={18} className="text-[#1A1A1A]" />
            <span className="text-[15px] font-bold text-[#1A1A1A]">DOWNLOAD PDF</span>
          </motion.button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-[#4CAF50] text-white px-6 py-3 rounded-full text-[14px] font-bold shadow-lg whitespace-nowrap"
            >
              🎉 Application submitted!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
