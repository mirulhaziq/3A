'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  CheckCircle2,
  Circle,
  LayoutGrid,
  Sparkles,
  Download,
  FileText,
  BarChart2,
  Info,
  Loader2,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { haptic } from '@/lib/haptics';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { cariApi } from '@/lib/cari-api';
import type { AnalysisResult } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JobData {
  id: string;
  title: string;
  company: string;
  description: string;
  type: string;
  workMode: string;
  location?: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

interface RadarPoint { skill: string; user: number; required: number; }

// ---------------------------------------------------------------------------
// SkillRadarChart
// ---------------------------------------------------------------------------

function SkillRadarChart({ data }: { data: RadarPoint[] }) {
  if (!data.length) return null;
  return (
    <div style={{ width: '100%', height: 260, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height={260} debounce={50}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#E8E0D0" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 11, fontWeight: 600, fill: '#6B6B6B' }}
          />
          <Radar
            name="Required"
            dataKey="required"
            stroke="#C0B8B0"
            fill="#C0B8B0"
            fillOpacity={0.1}
            strokeDasharray="5 3"
            strokeWidth={2}
          />
          <Radar
            name="Your Level"
            dataKey="user"
            stroke="#FFC800"
            fill="#FFC800"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B' }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
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
  const { jobId: rawJobId } = use(params);
  const jobId = decodeURIComponent(rawJobId);
  const router = useRouter();

  const [job, setJob] = useState<JobData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [tailoringLoading, setTailoringLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [error, setError] = useState('');
  const [cvMissing, setCvMissing] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      // 1. Get job data — skip API for external JSearch IDs, use sessionStorage directly
      const isExternalJob = jobId.startsWith('jsearch:') || jobId.startsWith('ext-');
      let jobData: JobData | null = null;

      if (!isExternalJob) {
        try {
          const { job: apiJob } = await cariApi.getJob(jobId);
          jobData = {
            id: apiJob.id,
            title: apiJob.title,
            company: typeof apiJob.company === 'string' ? apiJob.company : (apiJob.company as { name?: string })?.name ?? 'Company',
            description: apiJob.description ?? '',
            type: apiJob.type,
            workMode: apiJob.workMode,
            location: apiJob.location,
            requiredSkills: apiJob.requiredSkills ?? [],
            niceToHaveSkills: apiJob.niceToHaveSkills ?? [],
            salaryMin: apiJob.salaryMin,
            salaryMax: apiJob.salaryMax,
            currency: apiJob.currency,
          };
        } catch { /* fall through to sessionStorage */ }
      }

      if (!jobData) {
        const stored = sessionStorage.getItem('cari_scanned_job');
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as JobData;
            if (parsed.id === jobId) jobData = parsed;
          } catch { /* ignore */ }
        }
      }

      if (!active) return;

      if (!jobData) {
        setError('Job not found. Go back and select a job.');
        setPageLoading(false);
        return;
      }
      setJob(jobData);

      // 2. Get user's master CV text
      let rawText = '';
      try {
        const { parsed } = await cariApi.importFromCv();
        rawText = parsed.rawText;
      } catch {
        setCvMissing(true);
        setPageLoading(false);
        return;
      }

      if (!active) return;

      // 3. Run analysis — jobDescription must be ≥ 80 chars (API requirement)
      const analysisDescription = jobData.description ?? '';
      if (rawText && analysisDescription.length >= 80) {
        setAnalysisLoading(true);
        setPageLoading(false);
        try {
          const data = await cariApi.analyse({
            cvText: rawText,
            jobDescription: analysisDescription,
            jobId: isExternalJob ? null : jobId,
          });
          if (!active) return;
          setAnalysisResult(data.analysis.result);
          try {
            sessionStorage.setItem('cari_last_analysis', JSON.stringify({
              matchScore: data.analysis.result.matchScore,
              verdict: data.analysis.result.verdict,
              atsOptimized: data.analysis.result.matchScore >= 75,
            }));
          } catch { /* ignore */ }
        } catch { /* analysis failure is non-fatal */ }
        if (active) setAnalysisLoading(false);
      } else {
        if (active) setPageLoading(false);
      }
    }

    loadPage().catch(() => {
      if (active) {
        setPageLoading(false);
      }
    });

    return () => { active = false; };
  }, [jobId]);

  async function handleTailorResume() {
    if (!job) return;
    setTailoringLoading(true);
    setError('');
    try {
      const { parsed } = await cariApi.importFromCv();
      const isExternalId = !jobId || jobId.startsWith('jsearch:') || jobId.startsWith('ext-');
      const desc = job.description ?? '';
      const { resume } = await cariApi.generateResume({
        title: `${job.title} @ ${job.company}`,
        profileData: parsed.resume as unknown as Record<string, unknown>,
        jobDescription: desc.length >= 80 ? desc : undefined,
        jobId: isExternalId ? null : jobId,
      });
      router.push(`/jobs/${jobId}/tailored?resumeId=${resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tailored resume');
    } finally {
      setTailoringLoading(false);
    }
  }

  async function handleApply() {
    if (!job) return;
    setApplying(true);
    try {
      await cariApi.applyToJob(jobId);
      haptic('success');
      setToastMsg('🎉 Application submitted!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Could not apply');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } finally {
      setApplying(false);
    }
  }

  const matchScore = analysisResult?.matchScore ?? 0;
  const verdict = analysisResult?.verdict ?? '';

  // Build radar data from analysis keywords (top 3 present + top 3 missing)
  const radarData: RadarPoint[] = analysisResult
    ? [
        ...analysisResult.presentKeywords.slice(0, 3).map((k) => ({ skill: k, user: 85, required: 80 })),
        ...analysisResult.missingKeywords.slice(0, 3).map((k) => ({ skill: k, user: 20, required: 80 })),
      ]
    : [];

  // Requirements from requiredSkills cross-referenced with analysis
  const requirements = (job?.requiredSkills ?? []).map((skill) => ({
    label: skill,
    met: analysisResult
      ? analysisResult.presentKeywords.some((k) => k.toLowerCase().includes(skill.toLowerCase()))
      : true,
  }));

  const isLoading = pageLoading || analysisLoading;

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
              {isLoading ? <Loader2 size={22} className="text-[#1CB0F6] animate-spin" /> : <Rocket size={22} className="text-[#1CB0F6]" />}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#6B6B6B] font-semibold">
                {analysisLoading ? 'ANALYSING JOB FOR:' : 'JOB DETAIL'}
              </p>
              <p className="text-[20px] font-bold text-[#1A1A1A]">
                {job ? `${job.title} @ ${job.company}` : '...'}
              </p>
            </div>
          </div>
          {analysisResult && (
            <div className="flex items-center gap-2">
              <span className="bg-[#FFF8E1] border border-[#FFC800] rounded-full px-4 py-1.5 text-[13px] font-bold text-[#1A1A1A]">
                ⚡ {matchScore}% Match
              </span>
              {matchScore >= 75 && (
                <span className="bg-[#E8F7FF] border border-[#1CB0F6] rounded-full px-4 py-1.5 text-[13px] font-bold text-[#1CB0F6]">
                  ✓ ATS Optimized
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* MOBILE top bar */}
        <TopBar />

        {/* Error / CV missing states */}
        {error && (
          <div className="mx-4 mt-4 bg-[#FFF0F0] border border-[#FF4B4B] rounded-2xl p-4">
            <p className="text-[14px] font-semibold text-[#FF4B4B]">{error}</p>
          </div>
        )}
        {cvMissing && (
          <div className="mx-4 mt-4 bg-[#FFF8E1] border border-[#FFC800] rounded-2xl p-4">
            <p className="text-[14px] font-semibold text-[#1A1A1A]">
              Upload your CV first to see your match score and tailor your resume.
            </p>
            <button
              onClick={() => router.push('/onboarding')}
              className="mt-2 text-[13px] font-bold text-[#FFC800] underline"
            >
              Upload CV →
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={40} className="text-[#FFC800] animate-spin" />
            <p className="text-[15px] font-semibold text-[#6B6B6B]">
              {pageLoading ? 'Loading job...' : 'Analysing your fit...'}
            </p>
          </div>
        )}

        {/* MOBILE: Now analyzing banner */}
        {!isLoading && job && (
          <div className="lg:hidden mx-4 mt-3 mb-4 bg-[#E8F7FF] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <BarChart2 size={18} className="text-[#1CB0F6]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1CB0F6]">
                JOB DETAIL
              </p>
              <p className="text-[14px] font-bold text-[#1A1A1A] mt-0.5">
                {job.title} @ {job.company}
              </p>
            </div>
          </div>
        )}

        {/* MOBILE: Cuppy verdict */}
        {!isLoading && job && verdict && (
          <div className="lg:hidden mx-4 mb-4 flex items-start gap-3">
            <img
              src="/mascot-face.png"
              alt="Cuppy"
              className="flex-shrink-0"
              style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #FFC800', objectFit: 'cover' }}
            />
            <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D0] p-4">
              <p className="text-[14px] font-semibold text-[#1A1A1A] leading-relaxed italic">
                &ldquo;{verdict}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* MOBILE: Match Quality Card */}
        {!isLoading && job && analysisResult && (
          <div className="lg:hidden mx-4 mb-4 bg-white rounded-2xl border border-[#E8E0D0] p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[16px] font-bold text-[#1A1A1A]">Match Quality</p>
                <p className="text-[12px] text-[#6B6B6B] mt-0.5">{analysisResult.label}</p>
              </div>
              <div
                className="rounded-xl px-3 py-2 text-center"
                style={{ backgroundColor: matchScore >= 75 ? '#FFC800' : matchScore >= 55 ? '#E8F7FF' : '#FFF0F0' }}
              >
                <p className="text-[18px] font-extrabold leading-none"
                   style={{ color: matchScore >= 75 ? '#1A1A1A' : matchScore >= 55 ? '#1CB0F6' : '#FF4B4B' }}>
                  {matchScore}%
                </p>
                <p className="text-[10px] font-semibold" style={{ color: '#6B6B6B' }}>MATCH</p>
              </div>
            </div>
            <div className="mt-4">
              <SkillRadarChart data={radarData} />
            </div>
          </div>
        )}

        {/* MOBILE: Smart Tailoring Card */}
        {!isLoading && job && (
          <div className="lg:hidden mx-4 mb-4 bg-[#1A1A1A] rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-2.5">
              <Sparkles size={20} className="text-[#FFC800]" />
              <span className="text-[18px] font-bold text-white">Smart Tailoring</span>
            </div>
            <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-4">
              Generate a custom resume optimised for this specific role and ATS in seconds.
            </p>
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={handleTailorResume}
              disabled={tailoringLoading}
              className="w-full h-12 bg-[#FFC800] rounded-xl shadow-[0_3px_0_#CC9F00] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {tailoringLoading
                ? <Loader2 size={18} className="text-[#1A1A1A] animate-spin" />
                : <FileText size={18} className="text-[#1A1A1A]" />}
              <span className="text-[13px] font-bold uppercase text-[#1A1A1A]">
                {tailoringLoading ? 'GENERATING...' : 'TAILOR MY RESUME'}
              </span>
            </motion.button>
          </div>
        )}

        {/* MOBILE: Job Description Card */}
        {!isLoading && job && (
          <div className="lg:hidden mx-4 mb-4 bg-white rounded-2xl border border-[#E8E0D0] p-5 pb-40">
            <p className="text-[18px] font-bold text-[#1A1A1A] mb-4">Job Description</p>

            <div>
              <p className="text-[14px] font-bold text-[#FFC800] mb-2">Overview</p>
              <p className="text-[14px] text-[#4A4A4A] leading-relaxed">{job.description}</p>
            </div>

            {(job.requiredSkills ?? []).length > 0 && (
              <div className="mt-4">
                <p className="text-[14px] font-bold text-[#FFC800] mb-3">Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {requirements.map((req, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 bg-[#F5F0E8] border border-[#E8E0D0] rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#6B6B6B]"
                    >
                      {req.met
                        ? <CheckCircle2 size={13} className="text-[#4CAF50]" />
                        : <Circle size={13} className="text-[#ABABAB]" />}
                      {req.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply button mobile */}
            <div className="mt-6 flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={handleApply}
                disabled={applying}
                className="w-full h-12 bg-[#2D2D2D] rounded-xl shadow-[0_3px_0_#1A1A1A] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {applying ? <Loader2 size={18} className="text-white animate-spin" /> : <Rocket size={18} className="text-white" />}
                <span className="text-[14px] font-bold text-white uppercase tracking-wider">
                  APPLY NOW
                </span>
              </motion.button>
            </div>
          </div>
        )}

        {/* DESKTOP: Two-column content grid */}
        {!isLoading && job && (
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
                    <p className="text-[22px] font-bold text-[#1A1A1A]">{job.title}</p>
                    <p className="text-[14px] text-[#6B6B6B] mt-1">
                      {job.company} • {job.type} • {job.workMode}
                    </p>
                    {job.salaryMin && (
                      <p className="text-[14px] font-semibold text-[#FFC800] mt-1">
                        {job.currency} {job.salaryMin.toLocaleString()} – {job.salaryMax?.toLocaleString()}
                      </p>
                    )}
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
                <p className="text-[15px] text-[#4A4A4A] leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </motion.div>

              {/* Requirements Card */}
              {requirements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-[#E8E0D0] p-6"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-4">
                    REQUIREMENTS
                  </p>
                  <div className="h-px bg-[#E8E0D0] mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        {req.met ? (
                          <CheckCircle2 size={20} className="text-[#4CAF50] flex-shrink-0 mt-0.5" />
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
              )}

              {/* Analysis tabs (strengths / gaps) */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-[#E8E0D0] p-6"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-4">
                    ANALYSIS
                  </p>
                  <div className="h-px bg-[#E8E0D0] mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] font-bold text-[#4CAF50] mb-2">Strengths</p>
                      <div className="flex flex-col gap-2">
                        {analysisResult.strengths.map((s) => (
                          <div key={s.title} className="flex gap-2 items-start">
                            <CheckCircle2 size={15} className="text-[#4CAF50] flex-shrink-0 mt-0.5" />
                            <p className="text-[13px] text-[#1A1A1A]">{s.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#FF4B4B] mb-2">Gaps</p>
                      <div className="flex flex-col gap-2">
                        {analysisResult.gaps.map((g) => (
                          <div key={g.title} className="flex gap-2 items-start">
                            <Circle size={15} className="text-[#FF4B4B] flex-shrink-0 mt-0.5" />
                            <p className="text-[13px] text-[#1A1A1A]">{g.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
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

                {analysisResult ? (
                  <>
                    <div className="mx-auto mb-4 w-[160px] h-[160px] bg-[#2D2D2D] rounded-2xl flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                      >
                        <div
                          className="w-[120px] h-[120px] rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_0_4px_rgba(255,255,255,0.2)]"
                          style={{
                            backgroundColor: matchScore >= 75 ? '#FFC800' : matchScore >= 55 ? '#1CB0F6' : '#FF4B4B',
                          }}
                        >
                          <span className="text-[32px] font-extrabold text-white leading-none">{matchScore}%</span>
                          <span className="text-[11px] font-semibold text-white mt-0.5">MATCH</span>
                        </div>
                      </motion.div>
                    </div>
                    <p className="text-[13px] text-[#6B6B6B] text-center leading-relaxed">
                      {analysisResult.label}
                    </p>
                    {radarData.length > 0 && <SkillRadarChart data={radarData} />}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 size={28} className="text-[#FFC800] animate-spin" />
                    <p className="text-[13px] text-[#6B6B6B]">Calculating match score...</p>
                  </div>
                )}
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
                  Generate a custom resume optimised for this specific role and ATS in seconds.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97, y: 2 }}
                  onClick={handleTailorResume}
                  disabled={tailoringLoading}
                  className="w-full h-12 bg-white rounded-xl border-2 border-black/10 shadow-[0_3px_0_#CC9F00] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {tailoringLoading
                    ? <Loader2 size={18} className="text-[#1A1A1A] animate-spin" />
                    : <FileText size={18} className="text-[#1A1A1A]" />}
                  <span className="text-[13px] font-bold uppercase text-[#1A1A1A] tracking-wider">
                    {tailoringLoading ? 'GENERATING...' : 'TAILOR MY RESUME'}
                  </span>
                </motion.button>
                {error && <p className="mt-2 text-[12px] font-semibold text-[#FF4B4B]">{error}</p>}
              </motion.div>

              {/* Cuppy verdict */}
              {verdict && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-[#E8E0D0] p-4"
                >
                  <div className="flex gap-3 items-start">
                    <img
                      src="/mascot-face.png"
                      alt="Cuppy"
                      style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #FFC800', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <p className="text-[11px] font-bold text-[#FFC800] uppercase tracking-wide mb-1">Cuppy&apos;s Verdict</p>
                      <div className="flex-1 bg-[#F5F0E8] rounded-xl p-3 text-[13px] text-[#1A1A1A] leading-relaxed italic">
                        &ldquo;{verdict}&rdquo;
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Apply Now */}
              <motion.button
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={handleApply}
                disabled={applying}
                className="w-full h-[52px] bg-[#2D2D2D] rounded-2xl shadow-[0_4px_0_#1A1A1A] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {applying ? <Loader2 size={18} className="text-white animate-spin" /> : <Rocket size={18} className="text-white" />}
                <span className="text-[14px] font-bold text-white uppercase tracking-wider">
                  APPLY NOW
                </span>
              </motion.button>

              {/* Download PDF */}
              <motion.button
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={() => window.print()}
                className="w-full h-[52px] bg-white rounded-2xl border-2 border-[#E8E0D0] shadow-[0_4px_0_#D1D1D1] flex items-center justify-center gap-2"
              >
                <Download size={18} className="text-[#1A1A1A]" />
                <span className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                  DOWNLOAD PDF
                </span>
              </motion.button>
            </div>
          </div>
        )}

        {/* MOBILE bottom nav */}
        <BottomNav />

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-[#4CAF50] text-white px-6 py-3 rounded-full text-[14px] font-bold shadow-lg whitespace-nowrap"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
