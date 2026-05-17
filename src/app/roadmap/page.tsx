'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Code2, Globe, GitBranch, Braces, Monitor,
  Database, Plug, Cloud, Repeat2, FolderOpen, MessageSquare,
  CheckCircle2, Lock, Zap, ArrowLeftRight, Timer,
  ExternalLink, Flame, Trophy, X,
} from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';
import { useXPToast } from '@/components/XPToast';

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillStatus = 'completed' | 'next' | 'available' | 'locked';
type PhaseStatus = 'completed' | 'in-progress' | 'locked';

interface Skill {
  id: string;
  label: string;
  status: SkillStatus;
  icon: string;
  xp: number;
}

interface Phase {
  id: string;
  label: string;
  status: PhaseStatus;
  completedCount: number;
  totalCount: number;
  skills: Skill[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_PHASES: Phase[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    status: 'completed',
    completedCount: 12,
    totalCount: 12,
    skills: [
      { id: 'terminal', label: 'Terminal Basics', status: 'completed', icon: 'Terminal', xp: 50 },
      { id: 'html-css', label: 'HTML & CSS Masterclass', status: 'completed', icon: 'Code2', xp: 80 },
      { id: 'web-basics', label: 'Web Basics', status: 'completed', icon: 'Globe', xp: 60 },
      { id: 'version-control', label: 'Version Control', status: 'completed', icon: 'GitBranch', xp: 70 },
    ],
  },
  {
    id: 'core',
    label: 'Core Development',
    status: 'in-progress',
    completedCount: 4,
    totalCount: 8,
    skills: [
      { id: 'adv-js', label: 'Advanced JavaScript', status: 'next', icon: 'Braces', xp: 120 },
      { id: 'react', label: 'React Mastery', status: 'next', icon: 'Monitor', xp: 150 },
      { id: 'sql', label: 'SQL & NoSQL Structures', status: 'available', icon: 'Database', xp: 100 },
      { id: 'api-design', label: 'API Design', status: 'available', icon: 'Plug', xp: 110 },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced Engineering',
    status: 'locked',
    completedCount: 0,
    totalCount: 6,
    skills: [
      { id: 'cloud', label: 'Cloud Architecture', status: 'locked', icon: 'Cloud', xp: 200 },
      { id: 'devops', label: 'DevOps basics', status: 'locked', icon: 'Repeat2', xp: 180 },
    ],
  },
  {
    id: 'job-ready',
    label: 'Job Ready',
    status: 'locked',
    completedCount: 0,
    totalCount: 4,
    skills: [
      { id: 'portfolio', label: 'Portfolio Projects', status: 'locked', icon: 'FolderOpen', xp: 250 },
      { id: 'interview', label: 'Interview Prep', status: 'locked', icon: 'MessageSquare', xp: 200 },
    ],
  },
];

const PROGRESS = {
  overall: 50,
  totalSkills: 32,
  completedSkills: 16,
  streak: 12,
  currentRole: 'Fullstack Dev',
  cuppyMessage: "You're halfway through the Core Dev phase, Champ! Let's tackle that API module today.",
  weeklySprintMessage: 'Complete 3 skills this week to earn double XP!',
};

// ─── Lookups ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Terminal, Code2, Globe, GitBranch, Braces, Monitor,
  Database, Plug, Cloud, Repeat2, FolderOpen, MessageSquare,
};

const SKILL_DESCRIPTIONS: Record<string, string> = {
  terminal: 'Master the command line interface, shell scripting, and terminal productivity.',
  'html-css': 'Build solid HTML structure and CSS layouts including Flexbox and Grid.',
  'adv-js': 'Deep dive into closures, async/await, Promises, event loop, and ES6+ features.',
  react: 'Build component-based UIs with hooks, state management, and React patterns.',
  sql: 'Design relational databases, write complex queries, and understand NoSQL concepts.',
  cloud: 'Architect scalable cloud infrastructure using AWS services and best practices.',
  'version-control': 'Learn Git workflows, branching strategies, and collaborative development.',
  'web-basics': 'Understand how the web works — HTTP, DNS, browsers, and the request cycle.',
  'api-design': 'Design RESTful and GraphQL APIs with proper authentication and error handling.',
  devops: 'Automate deployments, manage CI/CD pipelines, and containerise applications.',
  portfolio: 'Build and present impactful projects that showcase your skills to employers.',
  interview: 'Ace technical interviews with structured problem-solving and communication.',
};

const SKILL_RESOURCES: Record<string, { title: string; platform: string; color: string }[]> = {
  'adv-js': [
    { title: 'JavaScript: The Hard Parts', platform: 'YouTube', color: '#FF0000' },
    { title: 'javascript.info Full Course', platform: 'Web', color: '#4285F4' },
    { title: '30 Days of JavaScript', platform: 'GitHub', color: '#333333' },
  ],
  react: [
    { title: 'React in 100 Seconds', platform: 'YouTube', color: '#FF0000' },
    { title: 'Official React Docs', platform: 'react.dev', color: '#61DAFB' },
    { title: 'Build a React App', platform: 'freeCodeCamp', color: '#0A0A23' },
  ],
};

const DEFAULT_RESOURCES = [
  { title: 'Full Course on YouTube', platform: 'YouTube', color: '#FF0000' },
  { title: 'Official Documentation', platform: 'Web', color: '#4285F4' },
  { title: 'Practice Project Guide', platform: 'GitHub', color: '#333333' },
];

const SKILL_PROJECTS: Record<string, { name: string; description: string }> = {
  terminal: { name: 'Build a CLI task manager app', description: 'Create a command-line todo app with file persistence.' },
  'html-css': { name: 'Clone a real website homepage', description: 'Pixel-perfect clone of a popular site using pure CSS.' },
  'adv-js': { name: 'Build a real-time chat with WebSockets', description: 'Bidirectional messaging app using native WebSocket API.' },
  react: { name: 'Create a weather dashboard with React', description: 'Fetch live data, manage state, animate transitions.' },
  sql: { name: 'Build a blog with full CRUD operations', description: 'PostgreSQL + REST API with complex relational queries.' },
};

const DEFAULT_PROJECT = { name: 'Apply this skill in a side project', description: 'Practice the concepts through hands-on building.' };

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

// ─── SkillIcon ────────────────────────────────────────────────────────────────

function SkillIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon size={size} color={color} /> : null;
}

// ─── Sheet Content ────────────────────────────────────────────────────────────

function SheetContent({
  skill,
  onClose,
  onComplete,
  completing,
  isDesktop,
}: {
  skill: Skill;
  onClose: () => void;
  onComplete: () => void;
  completing: boolean;
  isDesktop: boolean;
}) {
  const description = SKILL_DESCRIPTIONS[skill.id] ?? 'Master this skill to advance through your learning roadmap.';
  const resources = SKILL_RESOURCES[skill.id] ?? DEFAULT_RESOURCES;
  const project = SKILL_PROJECTS[skill.id] ?? DEFAULT_PROJECT;

  const statusConfig = {
    completed: { label: 'Completed', bg: '#E8F9D9', text: '#2E7D32' },
    next: { label: 'Next Up', bg: '#FFF8E1', text: '#CC9F00' },
    available: { label: 'Available', bg: '#F5F0E8', text: '#6B6B6B' },
    locked: { label: 'Locked', bg: '#F5F0E8', text: '#ABABAB' },
  }[skill.status];

  return (
    <div>
      {!isDesktop && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 bg-[#D4C9B0] rounded-full" />
        </div>
      )}
      {isDesktop && (
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F0E8] transition-colors">
            <X size={18} color="#6B6B6B" />
          </button>
        </div>
      )}

      <div className="px-5 pb-4 pt-2">
        <div className="inline-block rounded-full px-3 py-1 text-xs font-semibold mb-2" style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}>
          {statusConfig.label}
        </div>
        <div className="text-[22px] font-bold text-[#1A1A1A] mt-1">{skill.label}</div>
        <div className="text-sm font-semibold text-[#FFC800] mt-1">+{skill.xp} XP</div>
      </div>

      {skill.status !== 'completed' && (
        <div className="px-5 mb-4">
          <motion.button
            className="w-full h-12 rounded-xl font-bold text-[15px] text-[#1A1A1A] transition-colors"
            style={{ backgroundColor: completing ? '#4CAF50' : '#FFC800', boxShadow: '0 4px 0 #CC9F00' }}
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={onComplete}
          >
            {completing ? '✓ Completed!' : 'Mark as Complete ✓'}
          </motion.button>
        </div>
      )}

      <div className="border-t border-[#E8E0D0] mx-5" />

      <div className="px-5 py-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#ABABAB] mb-2.5">About this skill</div>
        <p className="text-sm text-[#4A4A4A] leading-relaxed">{description}</p>
      </div>

      <div className="px-5 pb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#ABABAB] mb-3">Free Resources</div>
        <div className="flex flex-col gap-2.5">
          {resources.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[#F5F0E8] rounded-xl cursor-pointer hover:bg-[#F0EBE0] transition-colors">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.color }}>
                <span className="text-sm font-bold text-white">{r.platform[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A1A1A] truncate">{r.title}</div>
                <div className="text-xs text-[#6B6B6B]">{r.platform}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-[#E8F9D9] text-[#2E7D32] rounded-full px-2 py-0.5 text-[11px] font-semibold">Free</div>
                <ExternalLink size={14} color="#ABABAB" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#ABABAB] mb-2.5">Build This</div>
        <div className="bg-[#FFF8E1] border border-[#FFC800] rounded-xl p-3.5">
          <div className="text-[13px] font-bold text-[#1A1A1A]">{project.name}</div>
          <div className="text-xs text-[#6B6B6B] mt-1">{project.description}</div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[11px] text-[#ABABAB]">Weekend project</span>
            <div className="flex gap-0.5">
              <span className="text-[#FFC800]">●</span>
              <span className="text-[#FFC800]">●</span>
              <span className="text-[#ABABAB]">○</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skill Sheet (drawer / bottom sheet) ─────────────────────────────────────

function SkillSheet({
  skill,
  isDesktop,
  onClose,
  onMarkComplete,
}: {
  skill: Skill;
  isDesktop: boolean;
  onClose: () => void;
  onMarkComplete: (id: string, xp: number) => void;
}) {
  const [completing, setCompleting] = useState(false);

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => onMarkComplete(skill.id, skill.xp), 300);
  };

  if (isDesktop) {
    return (
      <>
        <motion.div className="fixed inset-0 z-[59] bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div
          className="fixed top-0 right-0 h-full w-[380px] bg-white border-l border-[#E8E0D0] z-[60] overflow-y-auto"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <SheetContent skill={skill} onClose={onClose} onComplete={handleComplete} completing={completing} isDesktop />
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-[69] bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '75vh', overflowY: 'auto' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <SheetContent skill={skill} onClose={onClose} onComplete={handleComplete} completing={completing} isDesktop={false} />
      </motion.div>
    </>
  );
}

// ─── Desktop Skill Tree ───────────────────────────────────────────────────────

function DesktopSkillTree({ phases, onSkillTap }: { phases: Phase[]; onSkillTap: (s: Skill) => void }) {
  return (
    <div className="flex flex-col p-8 overflow-y-auto">
      {phases.map((phase, phaseIdx) => (
        <motion.div
          key={phase.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: phaseIdx * 0.12, duration: 0.4 }}
          className="mb-10"
        >
          {/* Phase header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-shrink-0">
              {/* Connector line segment */}
              {phaseIdx > 0 && (
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-0.5 h-10"
                  style={{
                    backgroundColor: phase.status === 'locked' ? 'transparent' : '#D4C9B0',
                    backgroundImage: phase.status === 'locked' ? 'repeating-linear-gradient(to bottom, #D4C9B0 0, #D4C9B0 4px, transparent 4px, transparent 8px)' : 'none',
                  }}
                />
              )}

              {phase.status === 'completed' && (
                <div className="w-14 h-14 bg-[#FFC800] rounded-full flex items-center justify-center">
                  <CheckCircle2 size={28} color="white" />
                </div>
              )}
              {phase.status === 'in-progress' && (
                <motion.div
                  className="w-14 h-14 bg-[#FFC800] rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Zap size={28} color="white" />
                </motion.div>
              )}
              {phase.status === 'locked' && (
                <div className="w-14 h-14 bg-[#D4C9B0] rounded-full flex items-center justify-center">
                  <Lock size={24} color="#8B7355" />
                </div>
              )}
            </div>

            <div>
              <div className={cn('text-[22px] font-bold', phase.status === 'locked' ? 'text-[#ABABAB]' : 'text-[#1A1A1A]')}>
                {phase.label}
              </div>
              <div className={cn('text-sm', phase.status === 'locked' ? 'text-[#ABABAB]' : 'text-[#6B6B6B]')}>
                {phase.status === 'completed' && `Completed ${phase.completedCount}/${phase.totalCount} Skills`}
                {phase.status === 'in-progress' && `In Progress: ${phase.completedCount}/${phase.totalCount} Skills`}
                {phase.status === 'locked' && 'Locked Phase'}
              </div>
            </div>
          </div>

          {/* Skills list */}
          <div className="flex flex-col gap-3 pl-[72px]">
            {phase.skills.map((skill, skillIdx) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: phaseIdx * 0.2 + skillIdx * 0.08, duration: 0.35 }}
              >
                {skill.status === 'completed' && (
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-white rounded-xl border border-[#E8E0D0]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F5F0E8] rounded-lg flex items-center justify-center flex-shrink-0">
                        <SkillIcon name={skill.icon} size={16} color="#8B7355" />
                      </div>
                      <span className="text-[15px] font-semibold text-[#1A1A1A]">{skill.label}</span>
                    </div>
                    <CheckCircle2 size={22} color="#4CAF50" />
                  </div>
                )}

                {skill.status === 'next' && (
                  <motion.div
                    className="flex items-center justify-between gap-3 px-5 py-3.5 bg-white rounded-xl cursor-pointer"
                    style={{ border: '2px solid #FFC800', boxShadow: '0 2px 8px rgba(255,200,0,0.2)' }}
                    animate={{ boxShadow: ['0 2px 8px rgba(255,200,0,0.15)', '0 4px 16px rgba(255,200,0,0.4)', '0 2px 8px rgba(255,200,0,0.15)'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => { haptic('light'); onSkillTap(skill); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#FFF8E1] rounded-lg flex items-center justify-center flex-shrink-0">
                        <SkillIcon name={skill.icon} size={16} color="#FFC800" />
                      </div>
                      <span className="text-[15px] font-semibold text-[#1A1A1A]">{skill.label}</span>
                    </div>
                    <div className="bg-[#FFC800] rounded-full px-3 py-1 text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wide flex-shrink-0">
                      Next Up
                    </div>
                  </motion.div>
                )}

                {skill.status === 'available' && (
                  <div
                    className="group flex items-center justify-between gap-3 px-5 py-3.5 bg-white rounded-xl border border-[#E8E0D0] cursor-pointer hover:border-[#FFC800] hover:bg-[#FFFDF0] transition-all"
                    onClick={() => { haptic('light'); onSkillTap(skill); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F5F0E8] rounded-lg flex items-center justify-center flex-shrink-0">
                        <SkillIcon name={skill.icon} size={16} color="#8B7355" />
                      </div>
                      <span className="text-[15px] font-medium text-[#1A1A1A]">{skill.label}</span>
                    </div>
                    <CheckCircle2 size={18} color="#ABABAB" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                {skill.status === 'locked' && (
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#F5F0E8] rounded-xl border border-dashed border-[#D4C9B0] cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E8E0D0] rounded-lg flex items-center justify-center flex-shrink-0">
                        <SkillIcon name={skill.icon} size={16} color="#ABABAB" />
                      </div>
                      <span className="text-[15px] font-normal text-[#ABABAB]">{skill.label}</span>
                    </div>
                    <Lock size={18} color="#ABABAB" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Desktop Progress Panel ───────────────────────────────────────────────────

function ProgressPanel() {
  return (
    <div className="hidden lg:flex flex-col p-8 border-l border-[#E8E0D0] bg-[#FAFAF5] gap-4 overflow-y-auto">
      {/* My Progress */}
      <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-[#1A1A1A]">My Progress</span>
          <div className="bg-[#FFC800] rounded-full px-3 py-1 text-xs font-bold text-[#1A1A1A]">50% DONE</div>
        </div>
        <div className="w-full h-2.5 bg-[#E8E0D0] rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-[#FFC800] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '50%' }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#E8F7FF] rounded-xl p-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#1CB0F6] mb-1">Skills</div>
            <div className="text-2xl font-extrabold text-[#1CB0F6]">16/32</div>
          </div>
          <div className="bg-[#FFF0F0] rounded-xl p-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#FF4B4B] mb-1">Streak</div>
            <div className="text-2xl font-extrabold text-[#FF4B4B]">12d</div>
          </div>
        </div>
      </div>

      {/* Weekly Sprint */}
      <div className="bg-[#F5F0E8] rounded-2xl border border-[#E8E0D0] p-5">
        <div className="flex items-center gap-2.5 mb-2.5">
          <Timer size={20} color="#FF4B4B" />
          <span className="text-base font-bold text-[#1A1A1A]">Weekly Sprint</span>
        </div>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">{PROGRESS.weeklySprintMessage}</p>
        <motion.button
          className="w-full h-11 bg-white border-2 border-[#E8E0D0] rounded-xl text-sm font-bold text-[#1A1A1A]"
          style={{ boxShadow: '0 3px 0 #D1D1D1' }}
          whileTap={{ scale: 0.97, y: 2 }}
        >
          Continue Sprint
        </motion.button>
      </div>

      {/* Current Role */}
      <div className="bg-white rounded-2xl border border-[#E8E0D0] overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#ABABAB] mb-1">Current Role</div>
            <div className="text-lg font-bold text-[#1A1A1A]">{PROGRESS.currentRole}</div>
          </div>
          <button className="w-8 h-8 rounded-full bg-[#F5F0E8] border border-[#E8E0D0] flex items-center justify-center hover:bg-[#FFF8E1] hover:border-[#FFC800] transition-colors">
            <ArrowLeftRight size={16} color="#6B6B6B" />
          </button>
        </div>
        <div className="relative h-40 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A9E8A, #16766A)' }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Monitor size={80} color="white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
            <span className="text-[13px] font-semibold text-white">Explore: Cloud Architect Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Tree ──────────────────────────────────────────────────────────────

function MobileTree({ phases, onSkillTap }: { phases: Phase[]; onSkillTap: (s: Skill) => void }) {
  const allItems: Array<{ type: 'phase'; phase: Phase } | { type: 'skill'; skill: Skill; phase: Phase }> = [];
  for (const phase of phases) {
    allItems.push({ type: 'phase', phase });
    for (const skill of phase.skills) {
      allItems.push({ type: 'skill', skill, phase });
    }
  }

  return (
    <div className="relative px-4 py-6">
      {/* Spine line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-[#D4C9B0]" />

      <div className="flex flex-col items-center gap-0">
        {allItems.map((item, idx) => {
          if (item.type === 'phase') {
            const { phase } = item;
            return (
              <motion.div
                key={`phase-${phase.id}`}
                className="relative z-10 my-5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.06, duration: 0.35 }}
              >
                {phase.status === 'completed' && (
                  <div className="bg-[#FFC800] rounded-full px-4 py-1.5 text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                    {phase.label}
                  </div>
                )}
                {phase.status === 'in-progress' && (
                  <div className="bg-[#4A3800] rounded-full px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                    <span className="text-[#FFC800]">●</span>
                    {phase.label}
                  </div>
                )}
                {phase.status === 'locked' && (
                  <div className="bg-[#E8E0D0] rounded-full px-4 py-1.5 text-xs font-semibold text-[#8B7355] uppercase tracking-wide flex items-center gap-1.5">
                    <Lock size={11} color="#8B7355" />
                    {phase.label}
                  </div>
                )}
              </motion.div>
            );
          }

          const { skill } = item;
          return (
            <motion.div
              key={`skill-${skill.id}`}
              className="relative z-10 flex flex-col items-center gap-2 my-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
            >
              {skill.status === 'completed' && (
                <>
                  <div className="relative w-16 h-16 rounded-[14px] bg-[#FFC800] flex items-center justify-center" style={{ boxShadow: '0 4px 0 #CC9F00' }}>
                    <SkillIcon name={skill.icon} size={28} color="white" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center">
                      <CheckCircle2 size={12} color="white" />
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-[#4A4A4A] text-center max-w-[90px]">{skill.label}</span>
                </>
              )}

              {skill.status === 'next' && (
                <>
                  <div className="bg-[#FF4B4B] rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase">ACTIVE</div>
                  <motion.div
                    className="w-[72px] h-[72px] rounded-2xl bg-white flex items-center justify-center cursor-pointer"
                    style={{ border: '3px solid #FFC800', boxShadow: '0 0 0 6px rgba(255,200,0,0.2), 0 4px 12px rgba(255,200,0,0.3)' }}
                    animate={{
                      boxShadow: ['0 0 0 6px rgba(255,200,0,0.2), 0 4px 12px rgba(255,200,0,0.3)', '0 0 0 10px rgba(255,200,0,0.1), 0 4px 20px rgba(255,200,0,0.5)', '0 0 0 6px rgba(255,200,0,0.2), 0 4px 12px rgba(255,200,0,0.3)'],
                      scale: [1, 1.03, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => { haptic('light'); onSkillTap(skill); }}
                  >
                    <SkillIcon name={skill.icon} size={28} color="#FFC800" />
                  </motion.div>
                  <span className="text-sm font-bold text-[#FFC800] text-center max-w-[90px]">{skill.label}</span>
                </>
              )}

              {skill.status === 'available' && (
                <>
                  <div
                    className="w-16 h-16 rounded-[14px] bg-[#F5F0E8] border-2 border-[#D4C9B0] flex items-center justify-center cursor-pointer hover:border-[#FFC800] transition-colors"
                    onClick={() => { haptic('light'); onSkillTap(skill); }}
                  >
                    <SkillIcon name={skill.icon} size={24} color="#ABABAB" />
                  </div>
                  <span className="text-[13px] font-normal text-[#ABABAB] text-center max-w-[90px]">{skill.label}</span>
                </>
              )}

              {skill.status === 'locked' && (
                <>
                  <div className="w-16 h-16 rounded-[14px] bg-[#F0EBE0] border border-dashed border-[#D4C9B0] flex items-center justify-center">
                    <SkillIcon name={skill.icon} size={24} color="#C8B48C" />
                  </div>
                  <span className="text-[13px] font-normal text-[#ABABAB] text-center max-w-[90px]">{skill.label}</span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const { showXP } = useXPToast();

  const handleSkillTap = useCallback((skill: Skill) => {
    if (skill.status === 'locked') return;
    haptic('light');
    setSelectedSkill(skill);
    setSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setSelectedSkill(null), 350);
  }, []);

  const handleMarkComplete = useCallback((skillId: string, xp: number) => {
    setPhases(prev =>
      prev.map(phase => ({
        ...phase,
        skills: phase.skills.map(s =>
          s.id === skillId ? { ...s, status: 'completed' as SkillStatus } : s
        ),
        completedCount: phase.skills.some(s => s.id === skillId)
          ? phase.completedCount + 1
          : phase.completedCount,
      }))
    );
    haptic('success');
    const skill = phases.flatMap(p => p.skills).find(s => s.id === skillId);
    if (skill) showXP(xp, skill.label + ' mastered');
    setTimeout(handleCloseSheet, 300);
  }, [phases, showXP, handleCloseSheet]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      <Sidebar />

      {/* ── Desktop layout ── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_320px] lg:ml-[220px] min-h-screen w-full">
        <DesktopSkillTree phases={phases} onSkillTap={handleSkillTap} />
        <ProgressPanel />
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex flex-col lg:hidden w-full pb-24">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-[#F5F0E8] border-b border-[#E8E0D0] h-[52px] px-4 flex items-center justify-between">
          <span className="text-xl font-extrabold text-[#CC9F00]">Cari</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Flame size={18} color="#F59E0B" />
              <span className="text-[13px] font-semibold text-[#F59E0B]">12</span>
            </div>
            <Trophy size={18} color="#7C5CBF" />
          </div>
        </div>

        {/* Page title */}
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A]">My Roadmap</h1>
        </div>

        {/* Mastery card */}
        <div className="mx-4 mt-3 bg-white rounded-2xl border border-[#E8E0D0] p-4 flex gap-4 items-center">
          <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
            <motion.div
              className="w-20 h-20 rounded-full border-[3px] border-[#FFC800] bg-[#FFF8E1] overflow-hidden flex items-center justify-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/cuppy-placeholder.png"
                alt="Cuppy"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={e => {
                  const t = e.currentTarget;
                  t.style.display = 'none';
                  const parent = t.parentElement;
                  if (parent) {
                    parent.style.background = '#FFC800';
                    parent.innerHTML = '<span style="font-size:32px">☕</span>';
                  }
                }}
              />
            </motion.div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#FF4B4B] rounded-full px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
              LVL 12
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-[#1A1A1A]">Overall Mastery</span>
              <span className="text-base font-extrabold text-[#FFC800]">50%</span>
            </div>
            <div className="w-full h-2 bg-[#E8E0D0] rounded-full mb-3 overflow-hidden">
              <motion.div
                className="h-full bg-[#FFC800] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '50%' }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <div className="bg-[#E8F7FF] rounded-xl p-3 border border-[#1CB0F6]/20">
              <p className="text-[13px] italic text-[#1A1A1A] leading-relaxed">
                &ldquo;{PROGRESS.cuppyMessage}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Mobile roadmap tree */}
        <MobileTree phases={phases} onSkillTap={handleSkillTap} />
      </div>

      {/* Skill sheet */}
      <AnimatePresence>
        {sheetOpen && selectedSkill && (
          <SkillSheet
            skill={selectedSkill}
            isDesktop={isDesktop}
            onClose={handleCloseSheet}
            onMarkComplete={handleMarkComplete}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
