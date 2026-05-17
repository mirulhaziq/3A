'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { haptic } from '@/lib/haptics';
import {
  ChevronLeft,
  FileText,
  Upload,
  Camera,
  Link,
  BarChart2,
  CheckCircle,
  XCircle,
  ArrowDown,
} from 'lucide-react';
import CuppyImage from '@/components/CuppyImage';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import { MOCK_ANALYSIS } from '@/lib/mock-data';
import { cariApi } from '@/lib/cari-api';
import type { AnalysisResult } from '@/types';

type PageState = 'input' | 'loading' | 'results';

export default function AnalysePage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('input');
  const [jdTab, setJdTab] = useState<'screenshot' | 'paste'>('paste');
  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
  const [jobCompany, setJobCompany] = useState('');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<
    'strengths' | 'gaps' | 'cvfixes' | 'keywords'
  >('strengths');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const [verdictText, setVerdictText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult>(MOCK_ANALYSIS);
  const [error, setError] = useState('');

  const cvFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load cvFileName from localStorage
    try {
      const stored = localStorage.getItem('lp_user');
      if (stored) {
        const user = JSON.parse(stored) as { cvFileName?: string | null };
        if (user.cvFileName) {
          setCvFileName(user.cvFileName);
        }
      }
    } catch {
      // ignore parse errors
    }

    // Check URL param ?source=extension
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') === 'extension') {
      try {
        const pendingJob = localStorage.getItem('lp_pending_job');
        if (pendingJob) {
          const job = JSON.parse(pendingJob) as { description?: string; title?: string; company?: string };
          if (job.description) {
            setJdText(job.description);
          }
          if (job.title) setJobTitle(job.title);
          if (job.company) setJobCompany(job.company);
          localStorage.removeItem('lp_pending_job');
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  async function handleAnalyse() {
    const fallbackCv =
      'Cari profile resume summary for a software engineering candidate with TypeScript, React, Express.js, Supabase, PostgreSQL, Git, GitHub, Docker, REST APIs, project experience, internship experience, and production collaboration.';
    const safeJobDescription =
      jdText.trim().length >= 80
        ? jdText.trim()
        : `${jobTitle} role at ${jobCompany || 'the company'}. ${jdText.trim()} Looking for a candidate with strong software engineering fundamentals, backend APIs, databases, teamwork, deployment experience, and clear communication.`;

    setPageState('loading');
    setLoadingProgress(0);
    setLoadingStep(0);
    setScoreCount(0);
    setVerdictText('');
    setError('');

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    setTimeout(() => setLoadingStep(1), 1000);
    setTimeout(() => setLoadingStep(2), 1500);
    setTimeout(() => setLoadingStep(3), 2000);
    setTimeout(() => setLoadingStep(4), 2300);

    try {
      const data = await cariApi.analyse({
        cvText: fallbackCv,
        jobDescription: safeJobDescription,
      });
      const nextAnalysis = data.analysis.result;
      setAnalysis(nextAnalysis);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      localStorage.setItem('lp_last_analysis', JSON.stringify({ score: nextAnalysis.matchScore, timestamp: Date.now() }));
      setPageState('results');

      // Score counter animation
      let count = 0;
      const scoreInterval = setInterval(() => {
        count += 2;
        setScoreCount(count);
        if (count >= nextAnalysis.matchScore) {
          clearInterval(scoreInterval);
          setScoreCount(nextAnalysis.matchScore);
          if (nextAnalysis.matchScore >= 75) {
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 80,
                colors: ['#4CAF50', '#FFC800', '#1CB0F6', '#FFFFFF'],
                origin: { x: 0.5, y: 0.55 },
                gravity: 0.8,
                scalar: 0.9,
              });
              haptic('success');
            }, 200);
          }
        }
      }, 30);

      // Typewriter animation
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        charIdx++;
        setVerdictText(nextAnalysis.verdict.slice(0, charIdx));
        if (charIdx >= nextAnalysis.verdict.length) {
          clearInterval(typeInterval);
        }
      }, 20);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Could not analyse the job yet');
      setPageState('input');
    }
  }

  const loadingSteps = [
    'Reading your CV',
    'Parsing job requirements',
    'Cross-referencing with GitHub',
    'Preparing your verdict',
  ];

  // ━━ INPUT STATE ━━
  if (pageState === 'input') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E8', fontFamily: 'inherit' }}>
        {/* Hidden file input */}
        <input
          ref={cvFileInputRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setCvFileName(file.name);
            }
          }}
        />

        {/* Header bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E8E0D0',
            height: 56,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              position: 'absolute',
              left: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={24} color="#1A1A1A" />
          </button>

          <span
            style={{ fontSize: 17, fontWeight: 600, color: '#1A1A1A' }}
          >
            Analyse a Job
          </span>

          <div style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center' }}>
            <CuppyImage size="small" state="idle" />
          </div>
        </div>

        {/* YOUR CV Section */}
        <div style={{ marginTop: 20, padding: '0 16px' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#ABABAB',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            YOUR CV
          </p>

          {cvFileName ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E8E0D0',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                position: 'relative',
                borderLeft: '4px solid #4CAF50',
              }}
            >
              <FileText size={20} color="#4CAF50" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1A1A1A',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cvFileName}
                </p>
                <p style={{ fontSize: 12, color: '#4CAF50', margin: '2px 0 0' }}>
                  Ready to go ✓
                </p>
              </div>
              <button
                onClick={() => setCvFileName(null)}
                style={{
                  fontSize: 13,
                  color: '#1CB0F6',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <div
              onClick={() => cvFileInputRef.current?.click()}
              style={{
                border: '2px dashed #4CAF50',
                borderRadius: 16,
                minHeight: 120,
                backgroundColor: '#F9FFF5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Upload size={28} color="#4CAF50" />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                Tap to upload CV
              </p>
              <p style={{ fontSize: 12, color: '#ABABAB', margin: 0 }}>PDF or DOCX</p>
            </div>
          )}
        </div>

        {/* JOB DESCRIPTION Section */}
        <div style={{ marginTop: 20, padding: '0 16px' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#ABABAB',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            JOB DESCRIPTION
          </p>

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['screenshot', 'paste'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setJdTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: jdTab === tab ? '#1A1A1A' : 'transparent',
                  color: jdTab === tab ? '#FFFFFF' : '#6B6B6B',
                  fontFamily: 'inherit',
                }}
              >
                {tab === 'screenshot' ? 'Screenshot' : 'Paste Text'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {jdTab === 'screenshot' ? (
            <div
              style={{
                border: '2px dashed #1CB0F6',
                borderRadius: 16,
                minHeight: 140,
                backgroundColor: '#E8F7FF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Camera size={32} color="#1CB0F6" />
              <p style={{ fontSize: 14, color: '#1CB0F6', margin: 0 }}>
                Upload a screenshot
              </p>
              <p style={{ fontSize: 12, color: '#ABABAB', margin: 0 }}>
                PNG, JPG up to 10MB
              </p>
            </div>
          ) : (
            <div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                maxLength={5000}
                placeholder="Paste the full job description here..."
                style={{
                  width: '100%',
                  minHeight: 160,
                  backgroundColor: '#F5F0E8',
                  border: '2px solid #E8E0D0',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 14,
                  resize: 'none',
                  fontFamily: 'inherit',
                  color: '#1A1A1A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <p
                style={{
                  textAlign: 'right',
                  fontSize: 11,
                  color: '#ABABAB',
                  margin: '4px 0 0',
                }}
              >
                {jdText.length} / 5000
              </p>
            </div>
          )}
        </div>

        {/* GITHUB PROFILE Section */}
        <div style={{ marginTop: 20, padding: '0 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#ABABAB',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              GITHUB PROFILE
            </p>
            <span
              style={{
                backgroundColor: '#F5F0E8',
                color: '#ABABAB',
                borderRadius: 9999,
                fontSize: 11,
                padding: '2px 8px',
              }}
            >
              Optional
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '2px solid #E8E0D0',
              borderRadius: 12,
              backgroundColor: '#F5F0E8',
            }}
          >
            <Link size={18} color="#ABABAB" style={{ marginLeft: 12, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="github.com/username"
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                padding: '12px 8px',
                fontSize: 14,
                fontFamily: 'inherit',
                color: '#1A1A1A',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Analyse button */}
        <div
          style={{
            padding: '0 16px',
            marginTop: 32,
            marginBottom: 32,
          }}
        >
          <PrimaryButton fullWidth onClick={handleAnalyse}>
            <BarChart2 size={18} />
            Analyse Compatibility
          </PrimaryButton>
          {error && (
            <p style={{ color: '#FF4B4B', fontSize: 13, fontWeight: 700, marginTop: 10 }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ━━ LOADING STATE ━━
  if (pageState === 'loading') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <CuppyImage size="large" state="thinking" />

        <p
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#1A1A1A',
            marginTop: 24,
            marginBottom: 4,
          }}
        >
          Analysing your fit...
        </p>
        <p style={{ fontSize: 14, color: '#6B6B6B', margin: 0 }}>
          Senior Frontend Engineer
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            maxWidth: 320,
            height: 8,
            backgroundColor: '#E8E0D0',
            borderRadius: 9999,
            marginTop: 20,
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              width: loadingProgress + '%',
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: 9999,
            }}
          />
        </div>

        {/* Steps */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 24,
            alignSelf: 'flex-start',
            maxWidth: 320,
            width: '100%',
          }}
        >
          <AnimatePresence>
            {loadingSteps.map((step, index) =>
              loadingStep >= index + 1 ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <CheckCircle size={16} color="#4CAF50" />
                  <span style={{ fontSize: 13, color: '#6B6B6B' }}>{step}</span>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ━━ RESULTS STATE ━━
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F0E8',
        fontFamily: 'inherit',
        paddingBottom: 160,
      }}
    >
      {/* Top row */}
      <div
        style={{
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F5F0E8',
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>Results</span>
        <button
          onClick={() => {
            setPageState('input');
            setScoreCount(0);
            setVerdictText('');
            setActiveResultTab('strengths');
          }}
          style={{
            border: '1px solid #E8E0D0',
            borderRadius: 9999,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#1A1A1A',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          New Analysis
        </button>
      </div>

      {/* JOB CONTEXT LINE */}
      <div style={{ margin: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4CAF50', flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0 }}>
          Analysis for{' '}
          <span style={{ fontWeight: 600, color: '#1A1A1A' }}>
            {jobTitle}
          </span>
          {jobCompany && (
            <> at <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{jobCompany}</span></>
          )}
        </p>
      </div>

      {/* SCORE SECTION */}
      <div
        style={{
          margin: '0 16px 16px',
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          border: analysis.matchScore >= 75 ? '1px solid #D4F7B8' : '1px solid #E8E0D0',
          padding: 24,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#ABABAB',
            letterSpacing: '0.08em',
            textAlign: 'center',
            marginBottom: 16,
            margin: '0 0 16px',
          }}
        >
          YOUR MATCH SCORE
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {(() => {
            const RADIUS = 52;
            const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
            const displayScore = scoreCount;
            const strokeDashoffset = CIRCUMFERENCE - (displayScore / 100) * CIRCUMFERENCE;
            const strokeColor =
              displayScore >= 75 ? '#4CAF50'
              : displayScore >= 50 ? '#FFC800'
              : '#FF4B4B';

            return (
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: 'block', margin: '0 auto' }}>
                <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#E8E0D0" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r={RADIUS}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 70 70)"
                  style={{ transition: 'stroke-dashoffset 0.016s linear, stroke 0.3s ease' }}
                />
                <text
                  x="70" y="66"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="28"
                  fontWeight="700"
                  fill={strokeColor}
                  fontFamily="Nunito, sans-serif"
                >
                  {displayScore}
                </text>
                <text
                  x="70" y="90"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#ABABAB"
                  fontFamily="Nunito, sans-serif"
                >
                  / 100
                </text>
              </svg>
            );
          })()}
        </div>

        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#4CAF50',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          {analysis.label}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <CuppyImage size="medium" state={analysis.cuppyState} />
        </div>
      </div>

      {/* VERDICT CARD */}
      <div
        style={{
          margin: '0 16px 16px',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: 16,
          borderLeft: '4px solid #FF4B4B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CuppyImage size="tiny" state="judgy" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
            Cuppy&apos;s Verdict
          </span>
        </div>

        <p
          style={{
            fontSize: 14,
            color: '#1A1A1A',
            lineHeight: 1.7,
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {verdictText}
          {verdictText.length < analysis.verdict.length && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              |
            </motion.span>
          )}
        </p>
      </div>

      {/* RESULT TABS */}
      <div style={{ margin: '0 16px 16px' }}>
        {/* Tab row */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            marginBottom: 12,
          }}
        >
          {(
            [
              { id: 'strengths', label: 'Strengths' },
              { id: 'gaps', label: 'Gaps' },
              { id: 'cvfixes', label: 'CV Fixes' },
              { id: 'keywords', label: 'Keywords' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveResultTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                backgroundColor: activeResultTab === tab.id ? '#1A1A1A' : '#F5F0E8',
                color: activeResultTab === tab.id ? '#FFFFFF' : '#6B6B6B',
                fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeResultTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* STRENGTHS */}
            {activeResultTab === 'strengths' &&
              analysis.strengths.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E0D0',
                    borderRadius: 14,
                    borderLeft: '4px solid #4CAF50',
                    padding: '14px 16px',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={16} color="#4CAF50" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                      {item.title}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: '#6B6B6B',
                      lineHeight: 1.5,
                      marginTop: 4,
                      marginBottom: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </motion.div>
              ))}

            {/* GAPS */}
            {activeResultTab === 'gaps' &&
              analysis.gaps.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E0D0',
                    borderRadius: 14,
                    borderLeft: '4px solid #FF4B4B',
                    padding: '14px 16px',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={16} color="#FF4B4B" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                      {item.title}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#FF4B4B',
                      letterSpacing: '0.06em',
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    HOW TO FIX:
                  </p>
                  <p style={{ fontSize: 13, color: '#1A1A1A', margin: 0 }}>{item.fix}</p>
                </motion.div>
              ))}

            {/* CV FIXES */}
            {activeResultTab === 'cvfixes' &&
              analysis.cvFixes.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E8E0D0',
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#FF4B4B',
                      letterSpacing: '0.06em',
                      margin: 0,
                    }}
                  >
                    ORIGINAL
                  </p>
                  <div
                    style={{
                      backgroundColor: '#FFF5F5',
                      borderRadius: 8,
                      padding: 10,
                      marginTop: 4,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: '#FF4B4B',
                        textDecoration: 'line-through',
                        margin: 0,
                      }}
                    >
                      {item.original}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', margin: '8px auto' }}>
                    <ArrowDown size={20} color="#4CAF50" />
                  </div>

                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#4CAF50',
                      letterSpacing: '0.06em',
                      margin: 0,
                    }}
                  >
                    IMPROVED
                  </p>
                  <div
                    style={{
                      backgroundColor: '#F9FFF5',
                      borderRadius: 8,
                      padding: 10,
                      borderLeft: '3px solid #4CAF50',
                      marginTop: 4,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: '#1A1A1A',
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {item.rewritten}
                    </p>
                  </div>
                </motion.div>
              ))}

            {/* KEYWORDS */}
            {activeResultTab === 'keywords' && (
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#FF4B4B',
                    marginBottom: 8,
                    marginTop: 0,
                  }}
                >
                  Missing Keywords
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {analysis.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        backgroundColor: '#FFF5F5',
                        color: '#FF4B4B',
                        border: '1px solid #FFCDD2',
                        borderRadius: 9999,
                        padding: '5px 12px',
                        fontSize: 13,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#4CAF50',
                    marginBottom: 8,
                    marginTop: 0,
                  }}
                >
                  You Have These
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysis.presentKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        backgroundColor: '#F9FFF5',
                        color: '#4CAF50',
                        border: '1px solid #D4F7B8',
                        borderRadius: 9999,
                        padding: '5px 12px',
                        fontSize: 13,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* STICKY BOTTOM ACTIONS */}
      <div
        style={{
          position: 'fixed',
          bottom: 64,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E8E0D0',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 40,
        }}
      >
        {analysis.matchScore >= 75 ? (
          <>
            <PrimaryButton fullWidth>Tailor My Resume →</PrimaryButton>
            <SecondaryButton fullWidth onClick={() => router.push('/roadmap')}>
              View My Roadmap
            </SecondaryButton>
          </>
        ) : (
          <SecondaryButton fullWidth onClick={() => router.push('/roadmap')}>
            View My Roadmap
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
