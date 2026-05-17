'use client';

import { useState } from 'react';
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
  Briefcase,
  TrendingUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quest {
  id: string;
  label: string;
  sub: string;
  xp: number;
  completed: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: 'Amirul',
  level: 'PILOT',
  xp: 1250,
  xpMax: 2000,
  xpPercent: 62,
  streak: 12,
  atsScore: 82,
  skillMatch: 74,
  applications: 7,
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
  { name: 'Core Dev',   done: 4,  total: 8  },
  { name: 'Advanced',   done: 0,  total: 5  },
  { name: 'Job Ready',  done: 0,  total: 4  },
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

function ScoreRing({
  score,
  color,
  label,
  size = 96,
}: {
  score: number;
  color: string;
  label: string;
  size?: number;
}) {
  const strokeWidth = size * 0.09;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E8E0D0"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size * 0.22, fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: size * 0.13, fontWeight: 600, color: '#6B6B6B', lineHeight: 1.2 }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#6B6B6B', textAlign: 'center' }}>{label}</span>
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

// ─── Desktop Right Panel ──────────────────────────────────────────────────────

function RightPanel({ totalXPToday }: { totalXPToday: number }) {
  return (
    <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Score rings card */}
      <div style={{
        background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0',
        padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 16 }}>Your Scores</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <ScoreRing score={MOCK_USER.atsScore}    color="#FFC800" label="ATS Score"   />
          <ScoreRing score={MOCK_USER.skillMatch}  color="#1CB0F6" label="Skill Match" />
        </div>
      </div>

      {/* Stats card */}
      <div style={{
        background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0',
        padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>This Week</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Applications',  value: MOCK_USER.applications, icon: '📨', color: '#1CB0F6' },
            { label: 'Day Streak',    value: `${MOCK_USER.streak}🔥`, icon: '🔥', color: '#F59E0B' },
            { label: 'XP Earned',     value: `${totalXPToday} XP`,   icon: '⚡', color: '#7C5CBF' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#6B6B6B' }}>{stat.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cuppy tip */}
      <div style={{
        background: '#FFF8E1', borderRadius: 20, border: '1px solid #FFC800',
        padding: '16px 20px', boxShadow: '0 2px 8px rgba(255,200,0,0.08)',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <CuppyImage state="happy" size="small" />
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#CC9F00', marginBottom: 4 }}>CUPPY SAYS</div>
          <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.5 }}>
            Tailor your resume for each job to boost your match score by up to 20%!
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [toastXP, setToastXP] = useState(0);
  const [showToast, setShowToast] = useState(false);

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

      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main column */}
      <div className="flex-1 lg:ml-55" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* TopBar (mobile) */}
        <TopBar />

        {/* Desktop dark banner */}
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
              DASHBOARD
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>
              {getGreeting()}, {MOCK_USER.name}! 👋
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/jobs"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#FFC800', color: '#1A1A1A',
                borderRadius: 10, padding: '10px 18px',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 3px 0 #CC9F00',
              }}
            >
              <Briefcase size={15} />
              Browse Jobs
            </Link>
            <Link
              href="/roadmap"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF', borderRadius: 10, padding: '10px 18px',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
              }}
            >
              <Map size={15} />
              View Roadmap
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="pb-28 lg:pb-8" style={{ flex: 1, padding: '28px 24px 0', width: '100%' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

            {/* ── Left / Main column ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Mobile greeting */}
              <div className="lg:hidden" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>
                  {getGreeting()}, {MOCK_USER.name}! 👋
                </div>
                <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>
                  Foundation Phase · Keep it up!
                </div>
              </div>

              {/* ── Mobile score rings ── */}
              <div
                className="lg:hidden"
                style={{
                  background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0',
                  padding: '20px 24px', marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={16} color="#FFC800" />
                  Resume Performance
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <ScoreRing score={MOCK_USER.atsScore}   color="#FFC800" label="ATS Score"   />
                  <ScoreRing score={MOCK_USER.skillMatch} color="#1CB0F6" label="Skill Match" />
                </div>
              </div>

              {/* XP Progress */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0',
                  padding: '18px 20px', marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: '#E8F7FF', color: '#1CB0F6',
                      padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
                    }}>
                      {MOCK_USER.level}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B' }}>
                      {MOCK_USER.xp} / {MOCK_USER.xpMax} XP
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🔥</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>{MOCK_USER.streak} day streak</span>
                  </div>
                </div>
                <XPBar percent={MOCK_USER.xpPercent} />
                <div style={{ fontSize: 11, color: '#ABABAB', marginTop: 6, textAlign: 'right' }}>
                  {MOCK_USER.xpMax - MOCK_USER.xp} XP to next level
                </div>
              </motion.div>

              {/* Daily Quests */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Daily Quests</div>
                  <span style={{
                    background: '#E8F9D9', color: '#2E7D32',
                    borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700,
                  }}>
                    +{totalXPToday} XP Today
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  {/* Connector line */}
                  <div style={{
                    position: 'absolute', left: 27, top: 56, bottom: 28,
                    width: 2, background: '#E8E0D0', zIndex: 1,
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
                          display: 'flex', alignItems: 'flex-start', gap: 16,
                          marginBottom: 20, position: 'relative',
                        }}
                      >
                        <QuestNode quest={quest} isNext={isNext} onToggle={() => handleQuestToggle(quest.id)} />

                        <div
                          style={{
                            flex: 1, background: '#FFFFFF', borderRadius: 16,
                            border: isNext ? '2px solid #FFC800' : '1px solid #E8E0D0',
                            padding: '14px 18px',
                            boxShadow: isNext ? '0 2px 12px rgba(255,200,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                            opacity: quest.completed ? 0.7 : 1,
                            marginTop: 4,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{
                              fontSize: 15, fontWeight: 700, color: '#1A1A1A',
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

                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Skill Progress */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{
                  background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0',
                  padding: '20px 20px', marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
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

            </div>

            {/* ── Right panel (desktop only) ── */}
            <div className="hidden lg:block">
              <RightPanel totalXPToday={totalXPToday} />
            </div>

          </div>
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
              position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
              background: '#1A1A1A', color: 'white', borderRadius: 9999,
              padding: '10px 22px', fontSize: 14, fontWeight: 700,
              zIndex: 100, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            }}
          >
            +{toastXP} XP ⚡ Quest complete!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
