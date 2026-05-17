'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CuppyImage from '@/components/CuppyImage';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  Map,
  Check,
  BarChart2,
  BadgeCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { cariApi, cariAuth, type ApplicationResponse } from '@/lib/cari-api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quest {
  id: string;
  label: string;
  sub: string;
  xp: number;
  completed: boolean;
}

interface DashboardUser {
  name: string;
  level: string;
  xp: number;
  xpMax: number;
  xpPercent: number;
  streak: number;
  atsScore: number;
  skillMatch: number;
}

interface DashboardApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationResponse['status'];
  date: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USER: DashboardUser = {
  name: 'Amirul',
  level: 'PILOT',
  xp: 1250,
  xpMax: 2000,
  xpPercent: 62,
  streak: 12,
  atsScore: 78,
  skillMatch: 64,
};

const MOCK_APPLICATIONS: DashboardApplication[] = [
  { id: '1', company: 'Grab', role: 'Junior Frontend Developer', status: 'VIEWED', date: 'May 15' },
  { id: '2', company: 'Axiata', role: 'React Developer', status: 'APPLIED', date: 'May 14' },
  { id: '3', company: 'Shopee', role: 'Web Developer', status: 'INTERVIEW', date: 'May 12' },
];

const MOCK_MILESTONES = [
  { label: 'First Application', done: true },
  { label: '5-Day Streak', done: true },
  { label: 'Profile 80% Complete', done: true },
  { label: 'First Interview', done: false },
  { label: 'Land First Offer', done: false },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  APPLIED:   { label: 'Applied',    color: '#1CB0F6', bg: '#E8F7FF' },
  VIEWED:    { label: 'Viewed',     color: '#F59E0B', bg: '#FFF8E1' },
  INTERVIEW: { label: 'Interview!', color: '#4CAF50', bg: '#E8F9D9' },
  REJECTED:  { label: 'Rejected',   color: '#EF4444', bg: '#FEE2E2' },
  OFFER:     { label: 'Offer',      color: '#2E7D32', bg: '#E8F9D9' },
};

const INITIAL_QUESTS: Quest[] = [
  {
    id: '1',
    label: 'Apply to 3 Junior Developer roles',
    sub: '2/3 applications submitted',
    xp: 50,
    completed: true,
  },
  {
    id: '2',
    label: 'Practice 1 Leetcode problem',
    sub: 'Recommended: Array manipulation',
    xp: 30,
    completed: false,
  },
  {
    id: '3',
    label: 'Update README on top project',
    sub: 'Focus on the technical stack section',
    xp: 70,
    completed: false,
  },
];

const SKILL_PHASES = [
  { name: 'Foundation', done: 12, total: 12 },
  { name: 'Core Dev', done: 4, total: 8 },
  { name: 'Advanced', done: 0, total: 5 },
  { name: 'Job Ready', done: 0, total: 4 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function XPBar({ percent, color = '#FFC800', height = 8 }: { percent: number; color?: string; height?: number }) {
  return (
    <div style={{ width: '100%', height, backgroundColor: '#E8E0D0', borderRadius: 9999, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ height: '100%', backgroundColor: color, borderRadius: 9999 }}
      />
    </div>
  );
}

function QuestNode({ quest, isNext, onToggle }: { quest: Quest; isNext: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: '50%',
        flexShrink: 0,
        background: quest.completed ? '#FFC800' : isNext ? '#FFC800' : '#E8E0D0',
        boxShadow: quest.completed || isNext ? '0 4px 0 #CC9F00' : '0 4px 0 #C0B8B0',
        border: quest.completed || isNext ? '3px solid #CC9F00' : '3px solid #D1D1D1',
        transition: 'transform 100ms',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {quest.completed
        ? <Check size={22} color="#1A1A1A" strokeWidth={3} />
        : <Star size={22} color={isNext ? '#1A1A1A' : '#ABABAB'} fill={isNext ? '#1A1A1A' : 'none'} />
      }
    </motion.button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [toastXP, setToastXP] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [dashboardUser, setDashboardUser] = useState<DashboardUser>(MOCK_USER);
  const [applications, setApplications] = useState<DashboardApplication[]>(MOCK_APPLICATIONS);

  useEffect(() => {
    let active = true;
    const sessionUser = cariAuth.getUser();
    if (sessionUser) {
      setDashboardUser((current) => ({
        ...current,
        name: sessionUser.fullName?.split(' ')[0] ?? sessionUser.email.split('@')[0],
        level: sessionUser.level,
        xp: sessionUser.xp,
        streak: sessionUser.streak,
        xpPercent: Math.min(100, Math.round((sessionUser.xp / current.xpMax) * 100)),
      }));
    }

    Promise.allSettled([cariApi.getProfile(), cariApi.listApplications()]).then((results) => {
      if (!active) return;

      const profileResult = results[0];
      if (profileResult.status === 'fulfilled') {
        const { profile } = profileResult.value;
        setDashboardUser((current) => ({
          ...current,
          name: profile.fullName?.split(' ')[0] ?? profile.email.split('@')[0],
          level: profile.level,
          xp: profile.xp,
          streak: profile.streak,
          atsScore: profile.atsScore,
          skillMatch: profile.skillMatch,
          xpPercent: Math.min(100, Math.round((profile.xp / current.xpMax) * 100)),
        }));
      }

      const applicationResult = results[1];
      if (applicationResult.status === 'fulfilled') {
        setApplications(
          applicationResult.value.applications.slice(0, 5).map((application) => ({
            id: application.id,
            company: application.company,
            role: application.jobTitle,
            status: application.status,
            date: new Date(application.appliedDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            }),
          }))
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const firstIncompleteIdx = quests.findIndex(q => !q.completed);
  const totalXPToday = quests.filter(q => q.completed).reduce((s, q) => s + q.xp, 0);

  function handleQuestToggle(id: string) {
    setQuests(prev =>
      prev.map(q => {
        if (q.id !== id) return q;
        if (!q.completed) {
          setToastXP(q.xp);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
        }
        return { ...q, completed: !q.completed };
      })
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>

      {/* ── Sidebar (desktop) ── */}
      <Sidebar />

      {/* ── Main column ── */}
      <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* TopBar (mobile) */}
        <TopBar />

        {/* Section Banner — dark header like Duolingo's unit banner, desktop only */}
        <div
          className="hidden lg:flex"
          style={{
            background: '#1A1A1A',
            padding: '20px 40px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFC800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              FOUNDATION PHASE
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>
              {getGreeting()}, {dashboardUser.name}! 👋
            </div>
          </div>
          <Link
            href="/roadmap"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background 150ms',
            }}
          >
            <Map size={15} />
            View Roadmap
          </Link>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: '32px 24px 120px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          {/* Mobile greeting */}
          <div className="lg:hidden" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>
              {getGreeting()}, {dashboardUser.name}! 👋
            </div>
            <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>
              Foundation Phase · Keep it up!
            </div>
          </div>

          {/* XP Progress inline (no card) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: 36 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: '#E8F7FF', color: '#1CB0F6',
                  padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
                }}>
                  {dashboardUser.level}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B' }}>
                  {dashboardUser.xp} / {dashboardUser.xpMax} XP
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>🔥</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>{dashboardUser.streak} day streak</span>
              </div>
            </div>
            <XPBar percent={dashboardUser.xpPercent} />
          </motion.div>

          {/* ── Daily Quests ── */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Daily Quests</div>
              <span style={{
                background: '#E8F9D9', color: '#2E7D32',
                borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700,
              }}>
                +{totalXPToday} XP Today
              </span>
            </div>

            {/* Quest path */}
            <div style={{ position: 'relative' }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute',
                left: 27,
                top: 56,
                bottom: 28,
                width: 2,
                background: '#E8E0D0',
                zIndex: 1,
              }} />

              {quests.map((quest, i) => {
                const isNext = i === firstIncompleteIdx;
                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.35 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      marginBottom: 20,
                      position: 'relative',
                    }}
                  >
                    <QuestNode quest={quest} isNext={isNext} onToggle={() => handleQuestToggle(quest.id)} />

                    {/* Quest content */}
                    <div
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        borderRadius: 16,
                        border: isNext ? '2px solid #FFC800' : '1px solid #E8E0D0',
                        padding: '14px 18px',
                        boxShadow: isNext ? '0 2px 12px rgba(255,200,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                        opacity: quest.completed ? 0.7 : 1,
                        marginTop: 4,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#1A1A1A',
                          textDecoration: quest.completed ? 'line-through' : 'none',
                          opacity: quest.completed ? 0.6 : 1,
                        }}>
                          {quest.label}
                        </div>
                        {quest.completed && <CheckCircle size={18} color="#4CAF50" />}
                      </div>
                      <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>{quest.sub}</div>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: '#F0EBFF', color: '#7C5CBF',
                          borderRadius: 9999, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Zap size={11} />
                          +{quest.xp} XP
                        </span>
                        {isNext && !quest.completed && (
                          <span style={{
                            background: '#FFF8E1', color: '#CC9F00',
                            borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                          }}>
                            NEXT UP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cari mascot next to current quest (desktop only) */}
                    {isNext && (
                      <div className="hidden lg:block" style={{ position: 'absolute', right: -80, top: -4 }}>
                        <CuppyImage state="happy" size="small" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Skill Progress inline ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Skill Progress</div>
              <Link
                href="/roadmap"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 13, fontWeight: 700, color: '#FFC800', textDecoration: 'none',
                }}
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SKILL_PHASES.map((phase, i) => (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.3 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', minWidth: 90 }}>
                    {phase.name}
                  </span>
                  <div style={{ flex: 1 }}>
                    <XPBar
                      percent={phase.total > 0 ? Math.round((phase.done / phase.total) * 100) : 0}
                      color={phase.done === phase.total ? '#4CAF50' : '#FFC800'}
                      height={8}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6B6B6B', minWidth: 36, textAlign: 'right' }}>
                    {phase.done}/{phase.total}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── ATS Score + Skill Match ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 40 }}
          >
            {/* ATS Score */}
            <div style={{
              background: '#FFFFFF', borderRadius: 16, border: '1px solid #E8E0D0',
              padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E8F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={14} color="#1CB0F6" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6B6B' }}>ATS Score</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
                {dashboardUser.atsScore}<span style={{ fontSize: 16, color: '#6B6B6B', fontWeight: 600 }}>/100</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <XPBar percent={dashboardUser.atsScore} color="#1CB0F6" height={6} />
              </div>
              <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 6 }}>Update your CV to improve</div>
            </div>

            {/* Skill Match */}
            <div style={{
              background: '#FFFFFF', borderRadius: 16, border: '1px solid #E8E0D0',
              padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BadgeCheck size={14} color="#7C5CBF" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6B6B' }}>Skill Match</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
                {dashboardUser.skillMatch}<span style={{ fontSize: 16, color: '#6B6B6B', fontWeight: 600 }}>%</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <XPBar percent={dashboardUser.skillMatch} color="#7C5CBF" height={6} />
              </div>
              <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 6 }}>vs. Junior Dev roles</div>
            </div>
          </motion.div>

          {/* ── Milestones ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ marginTop: 40 }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 14 }}>Milestones</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {MOCK_MILESTONES.map((m) => (
                <div
                  key={m.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: m.done ? '#E8F9D9' : '#FFFFFF',
                    border: `1px solid ${m.done ? '#A5D6A7' : '#E8E0D0'}`,
                    borderRadius: 9999, padding: '6px 14px',
                    fontSize: 12, fontWeight: 700,
                    color: m.done ? '#2E7D32' : '#ABABAB',
                  }}
                >
                  {m.done
                    ? <CheckCircle size={13} color="#4CAF50" />
                    : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid #D1D1D1' }} />
                  }
                  {m.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Cari Tip ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            style={{
              marginTop: 32,
              background: '#FFFFFF',
              borderRadius: 16,
              border: '2px solid #FFC800',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              boxShadow: '0 2px 12px rgba(255,200,0,0.1)',
            }}
          >
            <img
              src="/mascot-face.png"
              alt="Cari"
              style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #FFC800', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>Cari's Verdict</div>
              <div style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.5 }}>
                Your ATS score is <strong>{dashboardUser.atsScore}/100</strong> — honestly, that&apos;s mid. Add numbers to every bullet point in your experience (e.g. &quot;reduced load time by 40%&quot;) and you&apos;ll break 90 easily. No numbers = no callbacks.
              </div>
              <Link
                href="/profile"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  marginTop: 10, fontSize: 12, fontWeight: 700, color: '#FFC800', textDecoration: 'none',
                }}
              >
                Fix It Now <ChevronRight size={13} />
              </Link>
            </div>
          </motion.div>

          {/* ── Recent Applications ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{ marginTop: 40 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Recent Applications</div>
              <Link
                href="/jobs"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 13, fontWeight: 700, color: '#FFC800', textDecoration: 'none',
                }}
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {applications.map((app, i) => {
                const s = STATUS_META[app.status] ?? STATUS_META.APPLIED;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.62 + i * 0.06, duration: 0.3 }}
                    style={{
                      background: '#FFFFFF', borderRadius: 14, border: '1px solid #E8E0D0',
                      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={18} color="#6B6B6B" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.role}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                        {app.company} · {app.date}
                      </div>
                    </div>
                    <span style={{
                      background: s.bg, color: s.color,
                      borderRadius: 9999, padding: '4px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {s.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom Nav (mobile) */}
      <BottomNav />

      {/* XP Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              bottom: 88,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1A1A1A',
              color: 'white',
              borderRadius: 9999,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 700,
              zIndex: 100,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            }}
          >
            +{toastXP} XP ⚡ Quest complete!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
