'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  ChevronLeft,
  Download,
  Info,
  MoreVertical,
  SendHorizonal,
} from 'lucide-react';
import { haptic } from '@/lib/haptics';
import Sidebar from '@/components/Sidebar';

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

const MOCK_TAILORED_RESUME = {
  jobTitle: 'Software Engineer II',
  company: 'TechFlow',
  matchScore: 94,
  scoreLabel: 'Excellent Match!',
  scoreDescription: 'Your profile fits 90% of the key job requirements.',
  cuppyInsight: `"I've optimized your project section to highlight your React.js and TypeScript skills — they match the job description perfectly!"`,
  cuppyTip: `"Focus on your React migration experience for this role. It's a huge plus!"`,
  resume: {
    name: 'Amirul Haziq',
    title: 'Senior Frontend Engineer',
    email: 'amirul.haziq@email.com',
    location: 'Kuala Lumpur, MY',
    linkedin: 'linkedin.com/in/amirulh',
    summary: `Dynamic Senior Frontend Engineer with 5+ years of experience specialized in building high-performance web applications using React.js and TypeScript. Proven track record of improving system performance by 30% and mentoring junior developers to ship high-quality code.`,
    experience: [
      {
        role: 'Senior Frontend Engineer',
        company: 'TechNova Solutions',
        period: '2021 – Present',
        bullets: [
          'Led the migration of a legacy dashboard to React 18 and Next.js, resulting in a 40% faster initial load time.',
          'Implemented a comprehensive design system using Tailwind CSS and Storybook, ensuring UI consistency across 4 separate product lines.',
          'Collaborated with backend teams to optimize GraphQL queries, reducing data fetching latency by 200ms.',
        ],
      },
    ],
    skills: ['React.js', 'TypeScript', 'Next.js', 'GraphQL', 'Tailwind CSS', 'Node.js', 'AWS'],
  },
};

// Suppress unused warning
void MOCK_JOB_DETAIL;

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

// Suppress unused — DiamondChart kept for parity but not used in this page
void DiamondChart;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TailoredResumePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const resume = MOCK_TAILORED_RESUME.resume;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      <Sidebar />

      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">

        {/* DESKTOP: Tailoring banner */}
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
                TAILORING FOR:
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
        <div className="lg:hidden sticky top-0 z-40 bg-[#F5F0E8] border-b border-[#E8E0D0] px-4 flex items-center justify-between h-[56px]">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()}>
              <ChevronLeft size={20} className="text-[#1A1A1A]" />
            </button>
            <div>
              <p className="text-[11px] text-[#6B6B6B]">Tailoring for...</p>
              <p className="text-[13px] font-bold text-[#1A1A1A] truncate max-w-[200px]">
                Senior Frontend Engin...
              </p>
            </div>
          </div>
          <MoreVertical size={20} className="text-[#6B6B6B]" />
        </div>

        {/* MOBILE: Match Score Card */}
        <div className="lg:hidden mx-4 mt-3 mb-4 bg-white rounded-2xl border border-[#E8E0D0] p-5">
          <div className="flex flex-col items-center">
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle cx={60} cy={60} r={48} fill="none" stroke="#E8E0D0" strokeWidth={10} />
              <motion.circle
                cx={60} cy={60} r={48}
                fill="none"
                stroke="#FFC800"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 48}
                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - 0.94) }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                transform="rotate(-90 60 60)"
              />
              <text
                x={60} y={60}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 22, fontWeight: 800, fill: '#1A1A1A', fontFamily: 'Nunito, sans-serif' }}
              >
                94%
              </text>
            </svg>
            <p className="text-[16px] font-bold text-[#1A1A1A] mt-2">Excellent Match!</p>
            <p className="text-[13px] text-[#6B6B6B] mt-1 text-center leading-relaxed">
              Your profile fits 94% of the key job requirements.
            </p>
          </div>
        </div>

        {/* MOBILE: Cuppy message */}
        <div className="lg:hidden mx-4 mb-4 flex items-start gap-3">
          <div className="w-13 h-13 rounded-xl border-2 border-[#FFC800] overflow-hidden bg-[#FFF8E1] shrink-0">
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
              {MOCK_TAILORED_RESUME.cuppyInsight}
            </p>
          </div>
        </div>

        {/* MOBILE: Resume Preview */}
        <div className="lg:hidden mx-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[20px] font-bold text-[#1A1A1A]">Resume Preview</p>
            <span className="bg-[#E8F7FF] border border-[#1CB0F6] rounded-lg px-2.5 py-1 text-[12px] font-bold text-[#1CB0F6] uppercase">
              TAILORED
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5">
            {/* Resume Header */}
            <div className="text-center border-b border-[#E8E0D0] pb-4 mb-4">
              <p className="text-[18px] font-extrabold text-[#FFC800] uppercase tracking-widest">
                AMIRUL HAZIQ
              </p>
              <p className="text-[12px] text-[#6B6B6B] mt-1">{resume.title}</p>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                <span className="text-[11px] text-[#6B6B6B]">{resume.email}</span>
                <span className="text-[11px] text-[#6B6B6B]">{resume.location}</span>
                <span className="text-[11px] text-[#6B6B6B]">{resume.linkedin}</span>
              </div>
            </div>

            {/* Professional Profile */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase text-[#FFC800] tracking-widest mb-2">
                PROFESSIONAL PROFILE
              </p>
              <p className="text-[12px] text-[#4A4A4A] leading-relaxed">{resume.summary}</p>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase text-[#FFC800] tracking-widest mb-3">
                EXPERIENCE
              </p>
              {resume.experience.map((exp) => (
                <div key={exp.role}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[12px] font-bold text-[#1A1A1A]">
                      {exp.company} - {exp.role}
                    </span>
                    <span className="text-[11px] text-[#6B6B6B]">{exp.period}</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-1.5 items-start">
                        <div className="w-1 h-1 rounded-full bg-[#FFC800] shrink-0 mt-1.25" />
                        <p className="text-[11px] text-[#4A4A4A] leading-relaxed">{bullet}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Technical Skills */}
            <div>
              <p className="text-[10px] font-bold uppercase text-[#FFC800] tracking-widest mb-2">
                TECHNICAL SKILLS
              </p>
              <p className="text-[12px] text-[#4A4A4A]">{resume.skills.join(' • ')}</p>
            </div>

            <p className="text-[11px] text-[#ABABAB] text-center mt-4 italic">Page 1 of 2</p>
          </div>
        </div>

        {/* DESKTOP: Two-column grid */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_320px] gap-6 p-6 max-w-300">

          {/* LEFT: Resume Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-[#E8E0D0] px-10 py-8"
          >
            {/* Resume Header */}
            <div className="border-b border-[#E8E0D0] pb-5 mb-6">
              <p className="text-[28px] font-bold text-[#1A1A1A]">{resume.name}</p>
              <p className="text-[14px] text-[#FFC800] uppercase tracking-widest mt-1">
                Senior Frontend Engineer
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="text-[12px] text-[#6B6B6B]">{resume.email}</span>
                <span className="text-[12px] text-[#6B6B6B]">{resume.location}</span>
                <span className="text-[12px] text-[#6B6B6B]">{resume.linkedin}</span>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase text-[#FFC800] tracking-widest mb-3">
                PROFESSIONAL SUMMARY
              </p>
              <p className="text-[13px] text-[#4A4A4A] leading-relaxed">{resume.summary}</p>
            </div>

            {/* Work Experience */}
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase text-[#FFC800] tracking-widest mb-4">
                EXPERIENCE
              </p>
              {resume.experience.map((exp) => (
                <div key={exp.role} className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[13px] font-bold text-[#1A1A1A]">
                      {exp.role}, {exp.company}
                    </span>
                    <span className="text-[12px] text-[#6B6B6B]">{exp.period}</span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFC800] shrink-0 mt-1.5" />
                        <p className="text-[12px] text-[#4A4A4A] leading-relaxed">{bullet}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Technical Skills */}
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase text-[#FFC800] tracking-widest mb-3">
                TECHNICAL SKILLS
              </p>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-[#F5F0E8] border border-[#E8E0D0] rounded px-2.5 py-1 text-[12px] font-semibold text-[#4A4A4A]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#ABABAB] text-center mt-6 italic">Page 1 of 2</p>

            {/* Page 2 placeholder */}
            <div className="border border-dashed border-[#E8E0D0] rounded-lg h-20 bg-[#FAFAF8] mt-5 flex items-center justify-center">
              <p className="text-[12px] text-[#ABABAB] italic">Page 2 — Education & Awards</p>
            </div>
          </motion.div>

          {/* RIGHT: sidebar cards */}
          <div className="flex flex-col gap-4 sticky top-20 self-start">

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

              <div className="flex justify-center mb-3">
                <svg width={140} height={140} viewBox="0 0 140 140">
                  <circle cx={70} cy={70} r={54} fill="none" stroke="#E8E0D0" strokeWidth={10} />
                  <motion.circle
                    cx={70} cy={70} r={54}
                    fill="none"
                    stroke="#FFC800"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 54}
                    initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - 0.94) }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    transform="rotate(-90 70 70)"
                  />
                  <text
                    x={70} y={70}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 26, fontWeight: 800, fill: '#1A1A1A', fontFamily: 'Nunito, sans-serif' }}
                  >
                    94%
                  </text>
                </svg>
              </div>

              <p className="text-[14px] font-bold text-[#1A1A1A] text-center mb-1">Excellent Match!</p>
              <p className="text-[13px] text-[#6B6B6B] text-center leading-relaxed">
                You&apos;re a top candidate! Your profile strongly aligns with TechFlow&apos;s
                technical requirements.
              </p>
            </motion.div>

            {/* Cuppy insight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="bg-white rounded-2xl border border-[#E8E0D0] p-4"
            >
              <div className="flex gap-3 items-start">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-11 h-11 rounded-full border-2 border-[#FFC800] overflow-hidden bg-[#FFF8E1] shrink-0">
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
                <div className="flex-1 bg-[#FFF8E1] border border-[#FFC800] rounded-xl p-3 text-[13px] text-[#1A1A1A] leading-relaxed italic">
                  {MOCK_TAILORED_RESUME.cuppyTip}
                </div>
              </div>
            </motion.div>

            {/* Apply Now */}
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => {
                haptic('success');
                setToastMessage('Application submitted with tailored resume!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2500);
              }}
              className="w-full h-13 bg-[#2D2D2D] rounded-2xl shadow-[0_4px_0_#1A1A1A] flex items-center justify-center gap-2"
            >
              <Rocket size={18} className="text-white" />
              <span className="text-[14px] font-bold text-white uppercase tracking-wider">
                APPLY NOW
              </span>
            </motion.button>

            {/* Download PDF */}
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => {
                haptic('light');
                setToastMessage('PDF download started');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              }}
              className="w-full h-13 bg-white rounded-2xl border-2 border-[#E8E0D0] shadow-[0_4px_0_#D1D1D1] flex items-center justify-center gap-2"
            >
              <Download size={18} className="text-[#1A1A1A]" />
              <span className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                DOWNLOAD PDF
              </span>
            </motion.button>
          </div>
        </div>

        {/* MOBILE: sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E0D0] px-4 pt-3 pb-7">
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => {
              haptic('success');
              setToastMessage('Application submitted!');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2500);
            }}
            className="w-full h-13.5 bg-[#FFC800] rounded-2xl shadow-[0_4px_0_#CC9F00] mb-2.5 flex items-center justify-center gap-2.5"
          >
            <SendHorizonal size={18} className="text-[#1A1A1A]" />
            <span className="text-[16px] font-bold text-[#1A1A1A]">Apply Now</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => {
              haptic('light');
              setToastMessage('PDF download started');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
            }}
            className="w-full h-12.5 bg-white border-2 border-[#E8E0D0] rounded-2xl shadow-[0_4px_0_#D1D1D1] flex items-center justify-center gap-2"
          >
            <Download size={18} className="text-[#1A1A1A]" />
            <span className="text-[15px] font-bold text-[#1A1A1A]">Download PDF</span>
          </motion.button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-100 bg-[#4CAF50] text-white px-6 py-3 rounded-full text-[14px] font-bold shadow-lg whitespace-nowrap"
            >
              🎉 {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* jobId used to satisfy TypeScript — navigation uses it */}
      <span className="hidden">{jobId}</span>
    </div>
  );
}
