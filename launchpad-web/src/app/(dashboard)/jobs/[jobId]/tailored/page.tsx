'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Download,
  FileText,
  Info,
  Sparkles,
  Pencil,
  X,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { haptic } from '@/lib/haptics';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { cariApi, type GeneratedResume } from '@/lib/cari-api';

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

type EditableResume = typeof MOCK_TAILORED_RESUME.resume;

// Suppress unused warnings
void MOCK_JOB_DETAIL;
void FileText;

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

function toEditableResume(resume: GeneratedResume): EditableResume {
  return {
    name: resume.personal.fullName,
    title: resume.metadata.targetRole ?? resume.metadata.title,
    email: resume.personal.email ?? '',
    location: resume.personal.location ?? '',
    linkedin: resume.personal.linkedin ?? '',
    summary: resume.summary,
    experience: resume.experience.map((item) => ({
      role: item.role,
      company: item.company,
      period: [item.startDate, item.current ? 'Present' : item.endDate]
        .filter((value): value is string => Boolean(value))
        .join(' - '),
      bullets: item.bullets,
    })),
    skills: [
      ...resume.skills.languages,
      ...resume.skills.frameworks,
      ...resume.skills.toolsAndPlatforms,
    ],
  };
}

function mergeEditableResume(
  base: GeneratedResume,
  editable: EditableResume
): GeneratedResume {
  return {
    ...base,
    metadata: {
      ...base.metadata,
      title: editable.title,
      targetRole: editable.title,
    },
    personal: {
      ...base.personal,
      fullName: editable.name,
      email: editable.email,
      location: editable.location,
      linkedin: editable.linkedin,
    },
    summary: editable.summary,
    experience: base.experience.map((item, index) => {
      const edited = editable.experience[index];
      if (!edited) return item;

      return {
        ...item,
        role: edited.role,
        company: edited.company,
        bullets: edited.bullets,
      };
    }),
    skills: {
      ...base.skills,
      toolsAndPlatforms: editable.skills,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TailoredResumePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const searchParams = useSearchParams();
  const requestedResumeId = searchParams.get('resumeId');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [aiEnhanceOpen, setAiEnhanceOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ id: string; original: string; enhanced: string }>>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [editableResume, setEditableResume] = useState<EditableResume>(MOCK_TAILORED_RESUME.resume);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(requestedResumeId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const resumeToShow = editMode ? editableResume : editableResume;

  useEffect(() => {
    let active = true;

    async function loadResume(): Promise<void> {
      try {
        setLoading(true);

        if (requestedResumeId) {
          const data = await cariApi.getResume(requestedResumeId);
          if (!active) return;
          setSavedResumeId(data.resume.id);
          setGeneratedResume(data.resume.resume);
          setEditableResume(toEditableResume(data.resume.resume));
          return;
        }

        const existing = await cariApi.listResumes({ jobId, limit: 1 });
        if (existing.resumes[0]) {
          if (!active) return;
          setSavedResumeId(existing.resumes[0].id);
          setGeneratedResume(existing.resumes[0].resume);
          setEditableResume(toEditableResume(existing.resumes[0].resume));
          return;
        }

        const [jobData, profileData] = await Promise.all([
          cariApi.getJob(jobId),
          cariApi.getProfile(),
        ]);
        const generated = await cariApi.generateResume({
          title: `${jobData.job.title} Tailored Resume`,
          profileData: {
            ...profileData.profile.profileData,
            personal: {
              ...(typeof profileData.profile.profileData.personal === 'object' &&
              profileData.profile.profileData.personal !== null
                ? profileData.profile.profileData.personal
                : {}),
              fullName: profileData.profile.fullName,
              email: profileData.profile.email,
            },
            targetRole: profileData.profile.targetRole,
          },
          jobDescription: jobData.job.description,
          jobId,
        });

        if (!active) return;
        setSavedResumeId(generated.resume.id);
        setGeneratedResume(generated.resume.resume);
        setEditableResume(toEditableResume(generated.resume.resume));
      } catch {
        // Keep the designed mock preview when offline or unauthenticated.
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResume().catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [jobId, requestedResumeId]);

  function handlePrint() {
    haptic('light');
    window.print();
  }

  async function handleEditToggle() {
    if (editMode && savedResumeId && generatedResume) {
      try {
        setSaving(true);
        const nextResume = mergeEditableResume(generatedResume, editableResume);
        const data = await cariApi.updateResume(savedResumeId, {
          resume: nextResume,
          title: nextResume.metadata.title,
        });
        setGeneratedResume(data.resume.resume);
        setEditableResume(toEditableResume(data.resume.resume));
        setToastMessage('Resume edits saved');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2200);
      } catch {
        setToastMessage('Could not save edits yet');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2200);
      } finally {
        setSaving(false);
      }
    }

    setEditMode((current) => !current);
  }

  async function handleApply() {
    try {
      haptic('success');
      await cariApi.applyToJob(jobId, savedResumeId);
      setToastMessage('Application submitted with tailored resume!');
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Could not apply yet');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  async function handleOpenAiEnhance() {
    setAiEnhanceOpen(true);
    setAcceptedSuggestions(new Set());
    if (aiSuggestions.length > 0) return;
    try {
      setAiLoading(true);
      const allBullets = editableResume.experience.flatMap(e => e.bullets);
      const result = await cariApi.enhanceBullets({ bullets: allBullets });
      setAiSuggestions(result.suggestions);
    } catch {
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  }

  function toggleSuggestion(id: string) {
    setAcceptedSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function applyAccepted() {
    if (acceptedSuggestions.size > 0) {
      const allBullets = editableResume.experience.flatMap(e => e.bullets);
      const updatedFlat = [...allBullets];
      for (const s of aiSuggestions) {
        if (acceptedSuggestions.has(s.id)) {
          const idx = parseInt(s.id, 10);
          if (!isNaN(idx) && idx < updatedFlat.length) updatedFlat[idx] = s.enhanced;
        }
      }
      let flatIdx = 0;
      setEditableResume(r => ({
        ...r,
        experience: r.experience.map(ex => ({
          ...ex,
          bullets: ex.bullets.map(() => updatedFlat[flatIdx++] ?? ''),
        })),
      }));
    }
    setAiEnhanceOpen(false);
    setToastMessage(`Applied ${acceptedSuggestions.size} AI enhancement${acceptedSuggestions.size !== 1 ? 's' : ''} ✨`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  const resume = resumeToShow;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      <div className="no-print"><Sidebar /></div>

      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">

        {/* DESKTOP: Tailoring banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:flex no-print sticky top-0 z-30 bg-white border-b border-[#E8E0D0] px-8 py-4 items-center justify-between"
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
            <button
              onClick={() => { void handleOpenAiEnhance(); }}
              className="flex items-center gap-1.5 bg-[#F0EBFF] border border-[#7C5CBF] rounded-full px-3.5 py-1.5 text-[13px] font-bold text-[#7C5CBF]"
            >
              <Sparkles size={14} /> AI Enhance
            </button>
            <button
              onClick={handleEditToggle}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold"
              style={{
                background: editMode ? '#FFC800' : '#F5F0E8',
                border: editMode ? '1px solid #CC9F00' : '1px solid #E8E0D0',
                color: '#1A1A1A',
              }}
            >
              <Pencil size={13} /> {saving ? 'Saving' : editMode ? 'Save' : 'Edit'}
            </button>
          </div>
        </motion.div>

        {/* MOBILE top bar */}
        <div className="no-print"><TopBar /></div>

        {loading && (
          <div className="no-print mx-4 mt-4 rounded-xl border border-[#E8E0D0] bg-white px-4 py-3 text-[13px] font-bold text-[#6B6B6B] lg:mx-6">
            Preparing your tailored resume...
          </div>
        )}

        {/* MOBILE: Match Score Card */}
        <div className="lg:hidden no-print mx-4 mt-3 mb-4 bg-white rounded-2xl border border-[#E8E0D0] p-4">
          <div className="flex items-center gap-4">
            {/* SVG ring score */}
            <div className="w-20 h-20 flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="#E8E0D0"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="#1CB0F6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="188.5"
                  initial={{ strokeDashoffset: 188.5 }}
                  animate={{ strokeDashoffset: 18.85 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40"
                  y="37"
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="800"
                  fill="#1A1A1A"
                  fontFamily="Nunito"
                >
                  90
                </text>
                <text
                  x="40"
                  y="50"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#6B6B6B"
                  fontFamily="Nunito"
                >
                  SCORE
                </text>
              </svg>
            </div>
            <div>
              <p className="text-[18px] font-bold text-[#1A1A1A]">Excellent Match!</p>
              <p className="text-[13px] text-[#6B6B6B] mt-1 leading-relaxed">
                Your profile fits 90% of the key job requirements.
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE: Cuppy message */}
        <div className="lg:hidden no-print mx-4 mb-4 flex items-start gap-3">
          <img
            src="/mascot-face.png"
            alt="Cari"
            style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #FFC800', objectFit: 'cover', flexShrink: 0 }}
          />
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
                        <div className="w-1 h-1 rounded-full bg-[#FFC800] flex-shrink-0 mt-[5px]" />
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
        <div className="hidden lg:grid lg:grid-cols-[1fr_320px] gap-6 p-6 max-w-[1200px]">

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
              {editMode ? (
                <textarea
                  value={editableResume.summary}
                  onChange={e => setEditableResume(r => ({ ...r, summary: e.target.value }))}
                  className="w-full text-[13px] text-[#4A4A4A] leading-relaxed p-2 rounded-lg border border-[#FFC800] outline-none resize-none"
                  rows={5}
                  style={{ background: '#FFFDF0', fontFamily: 'inherit' }}
                />
              ) : (
                <p className="text-[13px] text-[#4A4A4A] leading-relaxed">{resume.summary}</p>
              )}
            </div>

            {/* Work Experience */}
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase text-[#FFC800] tracking-widest mb-4">
                EXPERIENCE
              </p>
              {resume.experience.map((exp, ei) => (
                <div key={exp.role} className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[13px] font-bold text-[#1A1A1A]">
                      {exp.role}, {exp.company}
                    </span>
                    <span className="text-[12px] text-[#6B6B6B]">{exp.period}</span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {exp.bullets.map((bullet, bi) => (
                      <li key={bi} className="flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFC800] flex-shrink-0 mt-1.5" />
                        {editMode ? (
                          <textarea
                            value={editableResume.experience[ei]?.bullets[bi] ?? bullet}
                            onChange={e => {
                              const val = e.target.value;
                              setEditableResume(r => ({
                                ...r,
                                experience: r.experience.map((ex, eIdx) =>
                                  eIdx === ei
                                    ? { ...ex, bullets: ex.bullets.map((b, bIdx) => bIdx === bi ? val : b) }
                                    : ex
                                ),
                              }));
                            }}
                            rows={3}
                            style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 8, border: '1px solid #FFC800', background: '#FFFDF0', fontFamily: 'inherit', resize: 'none', lineHeight: 1.6 }}
                          />
                        ) : (
                          <p className="text-[12px] text-[#4A4A4A] leading-relaxed">{bullet}</p>
                        )}
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
          <div className="flex flex-col gap-4 sticky top-[80px] self-start no-print">

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
                <img
                  src="/mascot-face.png"
                  alt="Cari"
                  style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #FFC800', objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                  <p className="text-[11px] font-bold text-[#FFC800] uppercase tracking-wide mb-1">Cari&apos;s Verdict</p>
                  <div className="flex-1 bg-[#FFF8E1] border border-[#FFC800] rounded-xl p-3 text-[13px] text-[#1A1A1A] leading-relaxed italic">
                    {MOCK_TAILORED_RESUME.cuppyTip}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Apply Now */}
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => {
                handleApply();
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
              onClick={handlePrint}
              className="w-full h-[52px] bg-white rounded-2xl border-2 border-[#E8E0D0] shadow-[0_4px_0_#D1D1D1] flex items-center justify-center gap-2 no-print"
            >
              <Download size={18} className="text-[#1A1A1A]" />
              <span className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                DOWNLOAD PDF
              </span>
            </motion.button>

            {/* AI Enhance */}
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => { void handleOpenAiEnhance(); }}
              className="w-full h-[52px] bg-[#F0EBFF] rounded-2xl border-2 border-[#7C5CBF] shadow-[0_4px_0_#5A3D8F] flex items-center justify-center gap-2 no-print"
            >
              <Sparkles size={18} className="text-[#7C5CBF]" />
              <span className="text-[14px] font-bold text-[#7C5CBF] uppercase tracking-wider">
                ✨ AI ENHANCE
              </span>
            </motion.button>
          </div>
        </div>

        {/* MOBILE: Edit + AI Enhance buttons */}
        <div className="lg:hidden fixed bottom-[72px] left-0 right-0 z-30 flex gap-2 px-4 pb-2 no-print">
          <button
            onClick={handleEditToggle}
            disabled={saving}
            className="flex-1 h-[44px] rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold"
            style={{
              background: editMode ? '#FFC800' : '#F5F0E8',
              border: editMode ? '1px solid #CC9F00' : '1px solid #E8E0D0',
              color: '#1A1A1A',
            }}
          >
            <Pencil size={14} /> {saving ? 'Saving' : editMode ? 'Save' : 'Edit'}
          </button>
          <button
            onClick={() => { void handleOpenAiEnhance(); }}
            className="flex-1 h-[44px] rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold bg-[#F0EBFF] border border-[#7C5CBF] text-[#7C5CBF]"
          >
            <Sparkles size={14} /> AI Enhance
          </button>
        </div>

        {/* MOBILE: bottom nav */}
        <BottomNav />

        {/* AI Enhance Modal */}
        <AnimatePresence>
          {aiEnhanceOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end lg:items-center justify-center no-print"
              onClick={e => { if (e.target === e.currentTarget) setAiEnhanceOpen(false); }}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="bg-white w-full max-w-[560px] rounded-t-3xl lg:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F0EBFF] rounded-xl flex items-center justify-center">
                      <Sparkles size={20} className="text-[#7C5CBF]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-[#1A1A1A]">AI Enhance</p>
                      <p className="text-[12px] text-[#6B6B6B]">SMART · USP · STAR format</p>
                    </div>
                  </div>
                  <button onClick={() => setAiEnhanceOpen(false)} className="text-[#ABABAB] hover:text-[#1A1A1A]">
                    <X size={20} />
                  </button>
                </div>

                <p className="text-[13px] text-[#6B6B6B] mb-5 leading-relaxed">
                  Cari rewrote these sections using SMART metrics and STAR storytelling. Accept the ones you like — you have the final say.
                </p>

                {aiLoading && (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-8 h-8 border-4 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[13px] text-[#6B6B6B]">Cari is rewriting your bullets...</p>
                  </div>
                )}

                {!aiLoading && aiSuggestions.length === 0 && (
                  <div className="text-center py-6 text-[13px] text-[#ABABAB]">
                    No bullets to enhance yet. Add experience bullets first.
                  </div>
                )}

                <div className="flex flex-col gap-4 mb-6">
                  {aiSuggestions.map(s => {
                    const accepted = acceptedSuggestions.has(s.id);
                    return (
                      <div
                        key={s.id}
                        className="border rounded-2xl p-4 transition-all"
                        style={{ borderColor: accepted ? '#FFC800' : '#E8E0D0', background: accepted ? '#FFFDF0' : '#FAFAF8' }}
                      >
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C5CBF] mb-3">
                          Bullet {parseInt(s.id, 10) + 1}
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase text-[#ABABAB] mb-1">Original</p>
                            <p className="text-[12px] text-[#6B6B6B] leading-relaxed line-through opacity-70">{s.original}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase text-[#4CAF50] mb-1">Enhanced ✨</p>
                            <p className="text-[12px] text-[#1A1A1A] leading-relaxed font-medium">{s.enhanced}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSuggestion(s.id)}
                          className="mt-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-all"
                          style={{
                            background: accepted ? '#FFC800' : '#F5F0E8',
                            border: accepted ? '1px solid #CC9F00' : '1px solid #E8E0D0',
                            color: '#1A1A1A',
                          }}
                        >
                          {accepted ? <CheckCircle2 size={13} /> : <Check size={13} />}
                          {accepted ? 'Accepted' : 'Accept'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={applyAccepted}
                  disabled={acceptedSuggestions.size === 0 || aiLoading}
                  className="w-full h-[52px] rounded-2xl text-[14px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: acceptedSuggestions.size > 0 ? '#FFC800' : '#E8E0D0',
                    color: acceptedSuggestions.size > 0 ? '#1A1A1A' : '#ABABAB',
                    cursor: acceptedSuggestions.size > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: acceptedSuggestions.size > 0 ? '0 4px 0 #CC9F00' : 'none',
                  }}
                >
                  Apply All Accepted ({acceptedSuggestions.size}/{aiSuggestions.length})
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Print CSS */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white; }
          }
        `}</style>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-[#4CAF50] text-white px-6 py-3 rounded-full text-[14px] font-bold shadow-lg whitespace-nowrap"
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
