'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Check, Lock, Star } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { haptic } from '@/lib/haptics';
import {
  ROLE_ROADMAPS,
  type CareerRole,
  type RoadmapSkill,
  type RoadmapPhase,
  type SkillStatus,
} from '@/lib/roadmap-data';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: { id: CareerRole; label: string; emoji: string }[] = [
  { id: 'frontend', label: 'Frontend Dev', emoji: '🌐' },
  { id: 'backend',  label: 'Backend Dev',  emoji: '⚙️' },
  { id: 'data',     label: 'Data Engineer', emoji: '📊' },
  { id: 'devops',   label: 'DevOps',        emoji: '🐳' },
  { id: 'ai',       label: 'AI / ML',       emoji: '🤖' },
];

const ROLE_DESCRIPTIONS: Record<CareerRole, string> = {
  frontend: 'Build beautiful, performant web interfaces users love.',
  backend:  'Design robust APIs and server-side systems at scale.',
  data:     'Turn raw data into actionable insights and models.',
  devops:   'Automate infrastructure and ship software reliably.',
  ai:       'Create intelligent systems powered by machine learning.',
};

const LS_CHECKED  = 'cari_roadmap_checked';
const LS_ROLE     = 'cari_roadmap_role';
const LS_COMPLETED = (role: CareerRole) => `cari_completed_${role}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyCheckResult(phases: RoadmapPhase[], score: number): RoadmapPhase[] {
  // score 0 → only Foundation available, 1-2 → Core unlocked, 3 → Advanced unlocked
  const phaseOrder = ['foundation', 'core', 'advanced', 'jobready'];
  const unlockedUpTo = score === 0 ? 0 : score <= 2 ? 1 : 2;

  return phases.map((phase) => {
    const phaseIndex = phaseOrder.indexOf(phase.id);
    return {
      ...phase,
      skills: phase.skills.map((skill) => {
        if (skill.status === 'completed') return skill;
        if (phaseIndex <= unlockedUpTo) {
          // Mark first locked skill as available if all before it are completed
          return { ...skill, status: skill.status === 'locked' ? 'available' as SkillStatus : skill.status };
        }
        return { ...skill, status: 'locked' as SkillStatus };
      }),
    };
  });
}

function applyCompletedIds(phases: RoadmapPhase[], completedIds: Set<string>): RoadmapPhase[] {
  return phases.map((phase) => ({
    ...phase,
    skills: phase.skills.map((skill) =>
      completedIds.has(skill.id) ? { ...skill, status: 'completed' as SkillStatus } : skill
    ),
  }));
}

function computeStats(phases: RoadmapPhase[]) {
  const all = phases.flatMap((p) => p.skills);
  const completed = all.filter((s) => s.status === 'completed').length;
  const total = all.length;
  const xpEarned = all.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.xp, 0);
  return { completed, total, xpEarned, pct: total ? Math.round((completed / total) * 100) : 0 };
}

// ─── Quick Check Modal ────────────────────────────────────────────────────────

const QUESTIONS = [
  'Have you built a full project before?',
  'Are you comfortable with terminal and version control?',
  'Have you worked professionally as a developer?',
];

function QuickCheckModal({ onDone }: { onDone: (score: number) => void }) {
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null]);
  const [step, setStep] = useState(0);

  const answer = (val: boolean) => {
    const next = [...answers];
    next[step] = val;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const score = next.filter(Boolean).length;
      setTimeout(() => onDone(score), 200);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      <motion.div
        className="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ zIndex: 91 }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        {/* Header */}
        <div style={{ background: '#FFC800', padding: '20px 24px 16px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>Quick Check ⚡</div>
          <div style={{ fontSize: 13, color: '#4A3800', marginTop: 4 }}>
            3 questions to personalise your roadmap
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 px-6 pt-5">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: i < step ? '#FFC800' : i === step ? '#FFC800' : '#E8E0D0',
                opacity: i === step ? 1 : i < step ? 0.8 : 0.4,
              }}
            />
          ))}
        </div>

        {/* Question */}
        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 20, lineHeight: 1.5 }}>
                {step + 1}. {QUESTIONS[step]}
              </div>
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 h-12 rounded-xl font-bold text-sm"
                  style={{ background: '#F5F0E8', color: '#1A1A1A', border: '2px solid #E8E0D0' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => answer(false)}
                >
                  No
                </motion.button>
                <motion.button
                  className="flex-1 h-12 rounded-xl font-bold text-sm"
                  style={{ background: '#FFC800', color: '#1A1A1A', boxShadow: '0 4px 0 #CC9F00' }}
                  whileTap={{ scale: 0.96, y: 2 }}
                  onClick={() => answer(true)}
                >
                  Yes
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Skill Bottom Sheet ───────────────────────────────────────────────────────

function SkillSheet({
  skill,
  onClose,
  onMarkComplete,
}: {
  skill: RoadmapSkill;
  onClose: () => void;
  onMarkComplete: (id: string, xp: number) => void;
}) {
  const [completing, setCompleting] = useState(false);

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => {
      onMarkComplete(skill.id, skill.xp);
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[69] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, background: '#D4C9B0', borderRadius: 99 }} />
        </div>

        {/* Close button */}
        <div className="flex justify-end px-5 pb-0">
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 99, background: '#F5F0E8' }}
          >
            <X size={16} color="#6B6B6B" />
          </button>
        </div>

        <div className="px-5 pb-3">
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-2">
            <div
              style={{
                width: 52, height: 52, borderRadius: 14, fontSize: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: skill.status === 'completed' ? '#FFC800' : '#F5F0E8',
              }}
            >
              {skill.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{skill.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFC800', marginTop: 1 }}>+{skill.xp} XP</div>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.6, marginBottom: 16 }}>{skill.description}</p>

          {/* Mark complete button */}
          {skill.status !== 'completed' && (
            <motion.button
              className="w-full h-12 rounded-xl font-bold text-base mb-4"
              style={{
                background: completing ? '#4CAF50' : '#FFC800',
                color: '#1A1A1A',
                boxShadow: completing ? '0 4px 0 #388E3C' : '0 4px 0 #CC9F00',
              }}
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={handleComplete}
            >
              {completing ? '✓ Marked Complete!' : 'Mark Complete ✓'}
            </motion.button>
          )}

          {skill.status === 'completed' && (
            <div
              className="w-full h-12 rounded-xl font-bold text-base flex items-center justify-center mb-4"
              style={{ background: '#E8F9D9', color: '#2E7D32' }}
            >
              ✓ Completed
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: '#E8E0D0', marginBottom: 16 }} />

          {/* Resources */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ABABAB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Free Resources
          </div>
          <div className="flex flex-col gap-2.5 pb-6">
            {skill.resources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: '#F5F0E8', textDecoration: 'none' }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 99, background: '#FFC800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#1A1A1A', flexShrink: 0,
                  }}
                >
                  {r.label[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }} className="truncate">{r.label}</div>
                </div>
                <ExternalLink size={14} color="#ABABAB" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── XP Toast (inline) ────────────────────────────────────────────────────────

function XPToast({ xp, visible }: { xp: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-[200]"
          style={{ bottom: 96, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.25 }}
        >
          <div
            style={{
              background: '#1A1A1A', color: 'white', borderRadius: 9999,
              padding: '8px 20px', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#FFC800' }}>+{xp} XP</span>
            <span style={{ color: '#ABABAB', fontWeight: 400, fontSize: 13 }}>🎯</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Vertical Skill Path ──────────────────────────────────────────────────────

function VerticalPath({
  phases,
  onSkillTap,
}: {
  phases: RoadmapPhase[];
  onSkillTap: (skill: RoadmapSkill) => void;
}) {
  // Collect all skill nodes with their global index for mascot positioning
  const allSkills = phases.flatMap((p) => p.skills);
  const firstAvailableIndex = allSkills.findIndex((s) => s.status === 'available');

  // refs for mascot positioning
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build flat list of items (phase header + skills)
  type Item =
    | { type: 'phase'; phase: RoadmapPhase }
    | { type: 'skill'; skill: RoadmapSkill; globalIndex: number };

  const items: Item[] = [];
  let gi = 0;
  for (const phase of phases) {
    items.push({ type: 'phase', phase });
    for (const skill of phase.skills) {
      items.push({ type: 'skill', skill, globalIndex: gi });
      gi++;
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-center" style={{ paddingBottom: 48 }}>
      {/* Vertical spine line */}
      <div
        className="absolute top-0 bottom-0"
        style={{ left: '50%', transform: 'translateX(-50%)', width: 2, background: '#E8E0D0', zIndex: 0 }}
      />

      {items.map((item, idx) => {
        if (item.type === 'phase') {
          const { phase } = item;
          const hasCompletedSkill = phase.skills.some((s) => s.status === 'completed');
          return (
            <motion.div
              key={`phase-${phase.id}`}
              className="relative z-10 my-4"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <div
                style={{
                  borderRadius: 99,
                  padding: '6px 18px',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: hasCompletedSkill ? '#FFC800' : '#E8E0D0',
                  color: hasCompletedSkill ? '#1A1A1A' : '#8B7355',
                }}
              >
                {phase.label}
              </div>
            </motion.div>
          );
        }

        const { skill, globalIndex } = item;
        const isMascotHere = globalIndex === firstAvailableIndex;

        return (
          <motion.div
            key={`skill-${skill.id}`}
            className="relative z-10 flex flex-col items-center"
            style={{ marginTop: 8, marginBottom: 8 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
          >
            {/* Mascot sits above first available skill */}
            {isMascotHere && (
              <motion.div
                style={{ marginBottom: 6 }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="/mascot-face.png"
                  alt="Cari mascot"
                  style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '2px solid #FFC800' }}
                />
              </motion.div>
            )}

            {/* Skill circle node */}
            <div
              ref={(el) => { nodeRefs.current[globalIndex] = el; }}
              onClick={() => {
                if (skill.status === 'locked') return;
                haptic('light');
                onSkillTap(skill);
              }}
              style={{
                width: 48, height: 48, borderRadius: 99,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: skill.status === 'locked' ? 'default' : 'pointer',
                position: 'relative',
                background:
                  skill.status === 'completed' ? '#FFC800' :
                  skill.status === 'available' ? '#FFFFFF' :
                  '#E8E0D0',
                border:
                  skill.status === 'completed' ? '2px solid #CC9F00' :
                  skill.status === 'available' ? '2px solid #FFC800' :
                  '2px solid #D4C9B0',
                boxShadow:
                  skill.status === 'completed' ? '0 4px 0 #CC9F00' :
                  skill.status === 'available' ? '0 0 0 4px rgba(255,200,0,0.25)' :
                  'none',
                fontSize: 22,
                transition: 'box-shadow 0.2s',
              }}
            >
              {skill.status === 'completed' && <Check size={22} color="#1A1A1A" strokeWidth={3} />}
              {skill.status === 'available' && (
                <motion.div
                  animate={{ boxShadow: ['0 0 0 4px rgba(255,200,0,0.2)', '0 0 0 8px rgba(255,200,0,0.08)', '0 0 0 4px rgba(255,200,0,0.2)'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 48, height: 48, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Star size={20} color="#FFC800" fill="#FFC800" />
                </motion.div>
              )}
              {skill.status === 'locked' && <Lock size={18} color="#ABABAB" />}
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: 12,
                fontWeight: skill.status === 'locked' ? 400 : 600,
                color: skill.status === 'locked' ? '#ABABAB' : skill.status === 'completed' ? '#4A3800' : '#1A1A1A',
                marginTop: 6,
                textAlign: 'center',
                maxWidth: 90,
                lineHeight: 1.3,
              }}
            >
              {skill.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Right Panel (desktop) ────────────────────────────────────────────────────

function RightPanel({
  role,
  phases,
  showRolePicker,
  onToggleRolePicker,
  onRoleSelect,
}: {
  role: CareerRole;
  phases: RoadmapPhase[];
  showRolePicker: boolean;
  onToggleRolePicker: () => void;
  onRoleSelect: (r: CareerRole) => void;
}) {
  const stats = computeStats(phases);
  const roleInfo = ROLES.find((r) => r.id === role)!;

  return (
    <div
      className="hidden lg:flex flex-col gap-4 p-6 overflow-y-auto"
      style={{ borderLeft: '1px solid #E8E0D0', background: '#FAFAF5', width: 300, flexShrink: 0 }}
    >
      {/* Role card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E8E0D0', background: '#FFFFFF' }}
      >
        <div style={{ background: '#1A1A1A', padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Current Path
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>
            {roleInfo.emoji} {roleInfo.label}
          </div>
          <div style={{ fontSize: 12, color: '#ABABAB', marginTop: 4, lineHeight: 1.5 }}>
            {ROLE_DESCRIPTIONS[role]}
          </div>
        </div>
        <div style={{ padding: '12px 18px' }}>
          <button
            onClick={onToggleRolePicker}
            style={{
              width: '100%', height: 38, borderRadius: 10,
              border: showRolePicker ? '1.5px solid #FFC800' : '1.5px solid #E8E0D0',
              background: showRolePicker ? '#FFF8E1' : '#FFFFFF',
              color: '#1A1A1A', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {showRolePicker ? 'Close ✕' : 'Change Role'}
          </button>
          <AnimatePresence>
            {showRolePicker && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', marginTop: 8 }}
              >
                <div className="flex flex-col gap-1">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onRoleSelect(r.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 12px',
                        borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: role === r.id ? 800 : 600,
                        background: role === r.id ? '#FFC800' : '#F5F0E8',
                        color: '#1A1A1A',
                      }}
                    >
                      {r.emoji} {r.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress stats */}
      <div
        className="rounded-2xl"
        style={{ border: '1px solid #E8E0D0', background: '#FFFFFF', padding: '16px 18px' }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>Overall Progress</div>
        <div style={{ width: '100%', height: 8, background: '#E8E0D0', borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: '#FFC800', borderRadius: 99 }}
            initial={{ width: 0 }}
            animate={{ width: `${stats.pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div style={{ background: '#F5F0E8', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#ABABAB', textTransform: 'uppercase', marginBottom: 2 }}>Skills</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFC800' }}>
              {stats.completed}<span style={{ fontSize: 13, color: '#ABABAB', fontWeight: 600 }}>/{stats.total}</span>
            </div>
          </div>
          <div style={{ background: '#F5F0E8', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#ABABAB', textTransform: 'uppercase', marginBottom: 2 }}>XP Earned</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#7C5CBF' }}>{stats.xpEarned}</div>
          </div>
        </div>
      </div>

      {/* Phase progress list */}
      <div
        className="rounded-2xl"
        style={{ border: '1px solid #E8E0D0', background: '#FFFFFF', padding: '16px 18px' }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>Phase Progress</div>
        <div className="flex flex-col gap-3">
          {phases.map((phase) => {
            const done = phase.skills.filter((s) => s.status === 'completed').length;
            const total = phase.skills.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={phase.id}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{phase.label}</span>
                  <span style={{ fontSize: 11, color: '#6B6B6B' }}>{done}/{total}</span>
                </div>
                <div style={{ height: 5, background: '#E8E0D0', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: pct === 100 ? '#4CAF50' : '#FFC800', borderRadius: 99 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [selectedRole, setSelectedRole] = useState<CareerRole>('frontend');
  const [phases, setPhases] = useState<RoadmapPhase[]>(() => ROLE_ROADMAPS['frontend']);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [activeSheet, setActiveSheet] = useState<RoadmapSkill | null>(null);
  const [xpToast, setXpToast] = useState<{ xp: number; visible: boolean }>({ xp: 0, visible: false });
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: restore saved role + score from onboarding
  useEffect(() => {
    const savedRole = (localStorage.getItem(LS_ROLE) ?? 'frontend') as CareerRole;
    setSelectedRole(savedRole);
    const score = parseInt(localStorage.getItem(LS_CHECKED) ?? '0', 10) || 0;
    loadPhasesForRole(savedRole, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadPhasesForRole(role: CareerRole, score: number) {
    const base = ROLE_ROADMAPS[role];
    const withScore = applyCheckResult(base, score);
    const savedIds = localStorage.getItem(LS_COMPLETED(role));
    const completedIds: Set<string> = savedIds ? new Set(JSON.parse(savedIds) as string[]) : new Set();
    setPhases(applyCompletedIds(withScore, completedIds));
  }

  const handleRoleChange = useCallback((role: CareerRole) => {
    setSelectedRole(role);
    setShowRolePicker(false);
    localStorage.setItem(LS_ROLE, role);
    const score = parseInt(localStorage.getItem(LS_CHECKED) ?? '0', 10);
    loadPhasesForRole(role, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkillTap = useCallback((skill: RoadmapSkill) => {
    setActiveSheet(skill);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setActiveSheet(null);
  }, []);

  const handleMarkComplete = useCallback((skillId: string, xp: number) => {
    setPhases((prev) => {
      const next = prev.map((phase) => ({
        ...phase,
        skills: phase.skills.map((s) =>
          s.id === skillId ? { ...s, status: 'completed' as SkillStatus } : s
        ),
      }));
      // Persist
      const completedIds = next
        .flatMap((p) => p.skills)
        .filter((s) => s.status === 'completed')
        .map((s) => s.id);
      localStorage.setItem(LS_COMPLETED(selectedRole), JSON.stringify(completedIds));
      return next;
    });

    // Show XP toast
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    setXpToast({ xp, visible: true });
    xpTimerRef.current = setTimeout(() => setXpToast((t) => ({ ...t, visible: false })), 2000);

    haptic('success');
    setTimeout(() => setActiveSheet(null), 300);
  }, [selectedRole]);

  const stats = computeStats(phases);

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F0E8' }}>
      <Sidebar />

      {/* ── Desktop layout ── */}
      <div className="hidden lg:flex flex-col flex-1 ml-[220px] min-h-screen">
        {/* Banner */}
        <div
          className="flex items-center px-8 py-4 flex-shrink-0"
          style={{ background: '#1A1A1A', borderBottom: '1px solid #333' }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Learning Path
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>
              {ROLES.find((r) => r.id === selectedRole)?.emoji}{' '}
              {ROLES.find((r) => r.id === selectedRole)?.label}
            </div>
          </div>
        </div>

        {/* Content area: path + right panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Scrollable path */}
          <div className="flex-1 overflow-y-auto">
            <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
              {/* Stats bar */}
              <div
                className="flex items-center justify-between mb-8 px-5 py-3 rounded-2xl"
                style={{ background: '#FFFFFF', border: '1px solid #E8E0D0' }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 700, textTransform: 'uppercase' }}>Completed</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#FFC800' }}>
                    {stats.completed}<span style={{ fontSize: 13, color: '#ABABAB' }}>/{stats.total}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 700, textTransform: 'uppercase' }}>Progress</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{stats.pct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 700, textTransform: 'uppercase' }}>XP Earned</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#7C5CBF' }}>{stats.xpEarned}</div>
                </div>
              </div>

              <VerticalPath phases={phases} onSkillTap={handleSkillTap} />
            </div>
          </div>

          <RightPanel
            role={selectedRole}
            phases={phases}
            showRolePicker={showRolePicker}
            onToggleRolePicker={() => setShowRolePicker(p => !p)}
            onRoleSelect={handleRoleChange}
          />
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex flex-col lg:hidden w-full pb-20">
        <TopBar />

        {/* Page header */}
        <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 2 }}>My Roadmap</h1>
            <p style={{ fontSize: 13, color: '#6B6B6B' }}>{ROLES.find(r => r.id === selectedRole)?.emoji} {ROLES.find(r => r.id === selectedRole)?.label}</p>
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRolePicker(p => !p)}
              style={{ height: 36, padding: '0 14px', borderRadius: 10, border: '1.5px solid #E8E0D0', background: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Change Role
            </button>
            <AnimatePresence>
              {showRolePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', right: 0, top: 42, background: '#FFFFFF', border: '1px solid #E8E0D0', borderRadius: 14, padding: 8, zIndex: 50, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                >
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleRoleChange(r.id)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: selectedRole === r.id ? 800 : 600, background: selectedRole === r.id ? '#FFC800' : 'transparent', color: '#1A1A1A', marginBottom: 2 }}
                    >
                      {r.emoji} {r.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="flex gap-3 px-4 py-3">
          <div
            className="flex-1 rounded-xl px-3 py-2.5"
            style={{ background: '#FFFFFF', border: '1px solid #E8E0D0' }}
          >
            <div style={{ fontSize: 10, color: '#ABABAB', fontWeight: 700, textTransform: 'uppercase' }}>Skills</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFC800' }}>{stats.completed}/{stats.total}</div>
          </div>
          <div
            className="flex-1 rounded-xl px-3 py-2.5"
            style={{ background: '#FFFFFF', border: '1px solid #E8E0D0' }}
          >
            <div style={{ fontSize: 10, color: '#ABABAB', fontWeight: 700, textTransform: 'uppercase' }}>Progress</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>{stats.pct}%</div>
          </div>
          <div
            className="flex-1 rounded-xl px-3 py-2.5"
            style={{ background: '#FFFFFF', border: '1px solid #E8E0D0' }}
          >
            <div style={{ fontSize: 10, color: '#ABABAB', fontWeight: 700, textTransform: 'uppercase' }}>XP</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#7C5CBF' }}>{stats.xpEarned}</div>
          </div>
        </div>

        {/* Vertical path */}
        <div style={{ padding: '0 16px' }}>
          <VerticalPath phases={phases} onSkillTap={handleSkillTap} />
        </div>
      </div>

      {/* Skill Bottom Sheet */}
      <AnimatePresence>
        {activeSheet && (
          <SkillSheet
            skill={activeSheet}
            onClose={handleCloseSheet}
            onMarkComplete={handleMarkComplete}
          />
        )}
      </AnimatePresence>

      {/* XP Toast */}
      <XPToast xp={xpToast.xp} visible={xpToast.visible} />

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
