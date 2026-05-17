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
              {getGreeting()}, {MOCK_USER.name}! 👋
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
              {getGreeting()}, {MOCK_USER.name}! 👋
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
