'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X, FileUp, FileCheck, Plus, Check } from 'lucide-react';
import CuppyImageComponent from '@/components/CuppyImage';

// ─── Types ──────────────────────────────────────────────────────────────────

interface OnboardingData {
  name: string;
  targetRole: string;
  skills: string[];
  cvFile: File | null;
  cvFileName: string | null;
  githubUsername: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PREDEFINED_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
  'Next.js', 'Node.js', 'Python', 'Java', 'Go', 'Kotlin', 'Swift', 'Dart',
  'PHP', 'SQL', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Docker', 'Git',
  'Linux', 'Figma', 'Tailwind', 'REST APIs', 'GraphQL', 'Flutter', 'FastAPI',
  'Spring Boot', 'Django',
];

const ROLE_SUGGESTIONS = [
  'Software Engineering',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'Cloud Engineer',
  'DevOps',
  'Cybersecurity',
  'Mobile Developer',
];

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Identity' },
  { id: 3, label: 'Career Goals' },
  { id: 4, label: 'Skill Audit' },
  { id: 5, label: 'Portfolio' },
  { id: 6, label: 'Integration' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    targetRole: '',
    skills: [],
    cvFile: null,
    cvFileName: null,
    githubUsername: '',
  });
  const [dragOver, setDragOver] = useState(false);
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [showXpBadge, setShowXpBadge] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const progressPercent = ((currentStep - 1) / 5) * 100;

  // ─── Navigation ─────────────────────────────────────────────────────────

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((p) => p + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
    } else {
      router.push('/login');
    }
  };

  const handleComplete = () => {
    document.cookie = 'lp_onboarded=true; path=/';
    localStorage.setItem('lp_onboarded', 'true');
    localStorage.setItem('lp_user', JSON.stringify(data));
    setShowCompletion(true);
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  const handleStepClick = (id: number) => {
    if (id < currentStep) setCurrentStep(id);
  };

  // ─── Skill helpers ──────────────────────────────────────────────────────

  const toggleSkill = (skill: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      setData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setCustomSkill('');
    setShowCustomSkill(false);
  };

  // ─── File helpers ───────────────────────────────────────────────────────

  const handleFileChange = (file: File) => {
    setData((prev) => ({ ...prev, cvFile: file, cvFileName: file.name }));
    setShowXpBadge(true);
    setTimeout(() => setShowXpBadge(false), 3000);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      handleFileChange(file);
    }
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  // ─── Speech bubbles per step ─────────────────────────────────────────────

  const bubbleText: Record<number, string> = {
    1: "Welcome aboard, co-pilot! I'm Cuppy. I'll be helping you navigate the tech job market with ease and style. Ready to get started?",
    2: 'What should I call you, co-pilot?',
    3: "Be specific — it helps me build the perfect roadmap for you!",
    4: "Pick everything you know. Don't be shy — I'll find the gaps anyway 😏",
    5: "Upload your CV and I'll extract all your amazing skills automatically. Plus, it's worth +50 XP!",
    6: "Got a GitHub? I'll scan your repos and tech stack. Makes your profile 10x stronger!",
  };

  const mobileBubbleText: Record<number, string> = {
    1: "Hey! I'm Cuppy. Let's get you hired 🚀",
    2: 'What should I call you, co-pilot?',
    3: "Be specific — it helps me build the perfect roadmap for you!",
    4: "Pick everything you know. Don't be shy — I'll find the gaps anyway 😏",
    5: "Upload your CV and I'll extract all your amazing skills automatically. Plus +50 XP!",
    6: "Got a GitHub? I'll scan your repos and tech stack. Makes your profile 10x stronger!",
  };

  // ─── Reusable sub-components (inline) ───────────────────────────────────

  const CuppyImage = () => <CuppyImageComponent state="wave" size="large" />;

  const MobileCuppySection = ({ step }: { step: number }) => (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Speech bubble */}
      <div className="bg-white rounded-2xl border border-[#E8E0D0] px-5 py-4 mb-4 relative max-w-xs text-center">
        <div
          className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '12px solid white',
          }}
        />
        <p className="text-base font-semibold text-[#1A1A1A]">{mobileBubbleText[step]}</p>
      </div>
      {/* Cuppy image */}
      <div className="w-[200px] h-[200px] rounded-full bg-[#FFE88A] overflow-hidden mt-4 flex items-center justify-center">
        <motion.div
          className="w-full h-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CuppyImage />
        </motion.div>
      </div>
    </div>
  );

  const YellowButton = ({
    onClick,
    disabled,
    children,
    fullWidth,
    className,
  }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    fullWidth?: boolean;
    className?: string;
  }) => (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97, y: 3 }}
      className={`bg-[#FFC800] text-[#1A1A1A] text-[17px] font-bold rounded-[14px] px-8 py-3.5 shadow-[0_4px_0_#CC9F00] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
    >
      {children}
    </motion.button>
  );

  const OutlinedButton = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="border-2 border-[#E8E0D0] bg-white text-[#6B6B6B] text-[15px] font-semibold rounded-xl px-6 py-3"
    >
      {children}
    </button>
  );

  // ─── Upload zone ─────────────────────────────────────────────────────────

  const UploadZone = ({ compact }: { compact?: boolean }) => (
    <>
      {!data.cvFile ? (
        <motion.div
          animate={{ scale: dragOver ? 1.01 : 1 }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-[#FFC800] rounded-[20px] text-center cursor-pointer transition-colors ${compact ? 'p-8' : 'p-12'} ${dragOver ? 'border-solid bg-[#FFF8E1]' : 'bg-[#FFFDF0]'}`}
        >
          <FileUp size={48} className="text-[#FFC800] mx-auto mb-3" />
          <p className="text-xl font-bold text-[#FFC800] mt-3">Drag &amp; Drop CV</p>
          <p className="text-[13px] text-[#6B6B6B] mt-1.5">Supports PDF, DOCX (Max 5MB)</p>
        </motion.div>
      ) : (
        <div className="bg-white border-2 border-[#FFC800] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
          <FileCheck size={32} className="text-[#FFC800] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1A1A1A] truncate">{data.cvFileName}</p>
            {data.cvFile && (
              <p className="text-[13px] text-[#6B6B6B]">{(data.cvFile.size / 1024).toFixed(0)} KB</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[13px] text-[#FFC800] font-medium hover:underline cursor-pointer flex-shrink-0"
          >
            Replace
          </button>
          <AnimatePresence>
            {showXpBadge && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-2 right-2 bg-[#FFF8E1] border border-[#FFC800] text-[#CC9F00] text-xs font-bold rounded-full px-3 py-1"
              >
                +50 XP
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );

  // ─── Skill chips ─────────────────────────────────────────────────────────

  const SkillChipGrid = ({ small }: { small?: boolean }) => {
    const customSkills = data.skills.filter((s) => !PREDEFINED_SKILLS.includes(s));
    const allSkills = [...PREDEFINED_SKILLS, ...customSkills];
    const px = small ? 'px-3 py-1.5' : 'px-4 py-2';
    const txt = small ? 'text-xs' : 'text-[13px]';

    return (
      <div className="flex flex-wrap gap-2">
        {allSkills.map((skill) => {
          const selected = data.skills.includes(skill);
          return (
            <motion.button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              whileHover={{ scale: 1.02 }}
              animate={selected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`rounded-full ${px} ${txt} font-semibold cursor-pointer border-2 transition-colors ${
                selected
                  ? 'bg-[#FFC800] border-[#CC9F00] text-[#1A1A1A] font-bold'
                  : 'bg-white border-[#E8E0D0] text-[#6B6B6B] hover:border-[#FFC800] hover:text-[#1A1A1A]'
              }`}
            >
              {selected ? `✓ ${skill}` : skill}
            </motion.button>
          );
        })}

        {/* Add custom skill chip */}
        {showCustomSkill ? (
          <input
            autoFocus
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCustomSkill();
              if (e.key === 'Escape') { setShowCustomSkill(false); setCustomSkill(''); }
            }}
            onBlur={addCustomSkill}
            placeholder="Type skill…"
            className="border-2 border-[#FFC800] rounded-full px-4 py-2 text-[13px] outline-none w-32"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomSkill(true)}
            className="border-2 border-dashed border-[#E8E0D0] rounded-full px-4 py-2 text-[13px] text-[#6B6B6B] cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add skill
          </button>
        )}
      </div>
    );
  };

  // ─── Step content ────────────────────────────────────────────────────────

  const renderStepContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-col flex-1"
      >
        {/* ── STEP 1 ─────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 px-16 py-12">
              <div className="flex gap-12 items-start">
                {/* Left */}
                <div className="flex-1">
                  <h1 className="text-[40px] font-extrabold text-[#1A1A1A] leading-tight mb-8">
                    The journey starts here!
                  </h1>
                  {/* Speech bubble */}
                  <div className="bg-white rounded-2xl border border-[#E8E0D0] p-6 max-w-[420px] relative">
                    <div
                      className="absolute bottom-[-16px] left-8 w-0 h-0"
                      style={{
                        borderLeft: '16px solid transparent',
                        borderRight: '16px solid transparent',
                        borderTop: '16px solid white',
                      }}
                    />
                    <p className="text-lg font-semibold text-[#1A1A1A] leading-relaxed">
                      {bubbleText[1]}
                    </p>
                  </div>
                  <YellowButton onClick={handleNext} className="mt-8">
                    Let&apos;s Blast Off! <Rocket size={18} />
                  </YellowButton>
                </div>
                {/* Right — Cuppy */}
                <div className="w-80 flex-shrink-0">
                  <div className="w-[280px] h-[280px] rounded-full border-[6px] border-[#FFC800] bg-[#3A2800] overflow-hidden flex items-center justify-center">
                    <motion.div
                      className="w-full h-full"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <CuppyImage />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex flex-col flex-1">
              <div className="flex flex-col items-center px-4 py-6">
                {/* Speech bubble */}
                <div className="bg-white rounded-2xl border border-[#E8E0D0] px-5 py-4 mb-4 relative max-w-xs text-center">
                  <div
                    className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderTop: '12px solid white',
                    }}
                  />
                  <p className="text-base font-semibold text-[#1A1A1A]">{mobileBubbleText[1]}</p>
                </div>
                {/* Cuppy */}
                <div className="w-[280px] h-[280px] rounded-2xl overflow-hidden bg-[#FFE88A] flex items-center justify-center">
                  <motion.div
                    className="w-full h-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <CuppyImage />
                  </motion.div>
                </div>
              </div>
              {/* Bottom card */}
              <div className="bg-white rounded-t-[28px] px-6 pt-7 pb-10 mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <h2 className="text-[28px] font-extrabold text-[#1A1A1A]">Let&apos;s get you hired.</h2>
                  <p className="text-[15px] text-[#6B6B6B] mt-2.5 leading-relaxed">
                    We&apos;ll help you find the best tech roles tailored to your skills and personality. Ready to launch your career?
                  </p>
                  <YellowButton onClick={handleNext} fullWidth className="mt-6 h-14">
                    Let&apos;s Go 🚀
                  </YellowButton>
                </motion.div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 px-16 py-12">
              <h1 className="text-[36px] font-extrabold text-[#1A1A1A] mb-4">Tell us who you are.</h1>
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 inline-block mb-8">
                <p className="text-base font-semibold text-[#1A1A1A]">{bubbleText[2]}</p>
              </div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#6B6B6B] mb-2">
                YOUR NAME
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Amirul Haziq"
                className="w-full max-w-[480px] h-[52px] bg-white border-2 border-[#E8E0D0] rounded-xl px-5 text-base text-[#1A1A1A] placeholder:text-[#ABABAB] focus:border-[#FFC800] focus:outline-none"
              />
              <div className="mt-8 flex gap-3">
                <OutlinedButton onClick={handleBack}>Back</OutlinedButton>
                <YellowButton onClick={handleNext} disabled={data.name.trim().length < 2}>
                  Continue →
                </YellowButton>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex flex-col flex-1">
              <MobileCuppySection step={2} />
              <div className="bg-white rounded-t-[28px] px-6 pt-7 pb-10 mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <h2 className="text-[24px] font-extrabold text-[#1A1A1A] mb-4">What&apos;s your name?</h2>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Amirul Haziq"
                  className="w-full h-[52px] bg-white border-2 border-[#E8E0D0] rounded-xl px-5 text-base text-[#1A1A1A] placeholder:text-[#ABABAB] focus:border-[#FFC800] focus:outline-none"
                />
                <YellowButton onClick={handleNext} disabled={data.name.trim().length < 2} fullWidth className="mt-6">
                  Continue →
                </YellowButton>
                <button
                  type="button"
                  onClick={handleBack}
                  className="block w-full text-center text-[#6B6B6B] mt-3 text-sm"
                >
                  ← Back
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 px-16 py-12">
              <h1 className="text-[36px] font-extrabold text-[#1A1A1A] mb-4">What&apos;s your dream role?</h1>
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 inline-block mb-8">
                <p className="text-base font-semibold text-[#1A1A1A]">{bubbleText[3]}</p>
              </div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#6B6B6B] mb-2">
                TARGET ROLE
              </label>
              <input
                type="text"
                value={data.targetRole}
                onChange={(e) => setData((prev) => ({ ...prev, targetRole: e.target.value }))}
                placeholder="e.g. Software Engineer, Frontend Developer..."
                className="w-full max-w-[480px] h-[52px] bg-white border-2 border-[#E8E0D0] rounded-xl px-5 text-base text-[#1A1A1A] placeholder:text-[#ABABAB] focus:border-[#FFC800] focus:outline-none"
              />
              {/* Role chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {ROLE_SUGGESTIONS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, targetRole: chip }))}
                    className={`border rounded-full px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer ${
                      data.targetRole === chip
                        ? 'bg-[#FFF8E1] border-[#FFC800] text-[#1A1A1A]'
                        : 'bg-white border-[#E8E0D0] text-[#6B6B6B] hover:border-[#FFC800] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <OutlinedButton onClick={handleBack}>Back</OutlinedButton>
                <YellowButton onClick={handleNext} disabled={data.targetRole.trim().length < 2}>
                  Continue →
                </YellowButton>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex flex-col flex-1">
              <MobileCuppySection step={3} />
              <div className="bg-white rounded-t-[28px] px-6 pt-7 pb-10 mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <h2 className="text-[24px] font-extrabold text-[#1A1A1A] mb-4">What&apos;s your dream role?</h2>
                <input
                  type="text"
                  value={data.targetRole}
                  onChange={(e) => setData((prev) => ({ ...prev, targetRole: e.target.value }))}
                  placeholder="e.g. Software Engineer..."
                  className="w-full h-[52px] bg-white border-2 border-[#E8E0D0] rounded-xl px-5 text-base text-[#1A1A1A] placeholder:text-[#ABABAB] focus:border-[#FFC800] focus:outline-none"
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {ROLE_SUGGESTIONS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, targetRole: chip }))}
                      className={`border rounded-full px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer ${
                        data.targetRole === chip
                          ? 'bg-[#FFF8E1] border-[#FFC800] text-[#1A1A1A]'
                          : 'bg-white border-[#E8E0D0] text-[#6B6B6B] hover:border-[#FFC800] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <YellowButton onClick={handleNext} disabled={data.targetRole.trim().length < 2} fullWidth className="mt-6">
                  Continue →
                </YellowButton>
                <button
                  type="button"
                  onClick={handleBack}
                  className="block w-full text-center text-[#6B6B6B] mt-3 text-sm"
                >
                  ← Back
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 4 ─────────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 px-16 py-12">
              <h1 className="text-[36px] font-extrabold text-[#1A1A1A] mb-4">What&apos;s in your toolkit?</h1>
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 inline-block mb-8">
                <p className="text-base font-semibold text-[#1A1A1A]">{bubbleText[4]}</p>
              </div>
              <p className="text-sm font-semibold text-[#FFC800] mb-4">{data.skills.length} skills selected</p>
              <div className="max-w-2xl">
                <SkillChipGrid />
              </div>
              <div className="mt-8 flex gap-3">
                <OutlinedButton onClick={handleBack}>Back</OutlinedButton>
                <YellowButton onClick={handleNext}>Continue →</YellowButton>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex flex-col flex-1">
              <MobileCuppySection step={4} />
              <div className="bg-white rounded-t-[28px] px-6 pt-7 pb-10 mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <h2 className="text-[24px] font-extrabold text-[#1A1A1A] mb-2">Your toolkit</h2>
                <p className="text-sm font-semibold text-[#FFC800] mb-4">{data.skills.length} skills selected</p>
                <SkillChipGrid small />
                <YellowButton onClick={handleNext} fullWidth className="mt-6">
                  Continue →
                </YellowButton>
                <button
                  type="button"
                  onClick={handleBack}
                  className="block w-full text-center text-[#6B6B6B] mt-3 text-sm"
                >
                  ← Back
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 5 ─────────────────────────────────────────────────── */}
        {currentStep === 5 && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 px-16 py-12">
              <h1 className="text-[36px] font-extrabold text-[#1A1A1A] mb-4">Upload your CV.</h1>
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 inline-block mb-8">
                <p className="text-base font-semibold text-[#1A1A1A]">{bubbleText[5]}</p>
              </div>
              <div className="max-w-[560px]">
                <UploadZone />
              </div>
              <div className="mt-6 text-center max-w-[560px]">
                <p className="text-[13px] text-[#ABABAB]">— or —</p>
                <p className="text-[14px] text-[#6B6B6B] mt-4">Don&apos;t have a CV yet?</p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-[14px] text-[#FFC800] font-semibold cursor-pointer hover:underline"
                >
                  Create one from scratch →
                </button>
              </div>
              <div className="mt-8 flex gap-3">
                <OutlinedButton onClick={handleBack}>Back</OutlinedButton>
                <YellowButton onClick={handleNext} disabled={!data.cvFile}>
                  Continue →
                </YellowButton>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex flex-col flex-1">
              <MobileCuppySection step={5} />
              <div className="bg-white rounded-t-[28px] px-6 pt-7 pb-10 mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <h2 className="text-[24px] font-extrabold text-[#1A1A1A] mb-4">Upload your CV.</h2>
                <UploadZone compact />
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-[14px] text-[#FFC800] font-semibold cursor-pointer hover:underline"
                  >
                    Create from scratch →
                  </button>
                </div>
                <YellowButton onClick={handleNext} disabled={!data.cvFile} fullWidth className="mt-6">
                  Continue →
                </YellowButton>
                <button
                  type="button"
                  onClick={handleBack}
                  className="block w-full text-center text-[#6B6B6B] mt-3 text-sm"
                >
                  ← Back
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 6 ─────────────────────────────────────────────────── */}
        {currentStep === 6 && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 px-16 py-12">
              <h1 className="text-[36px] font-extrabold text-[#1A1A1A] mb-4">Connect your GitHub.</h1>
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 inline-block mb-8">
                <p className="text-base font-semibold text-[#1A1A1A]">{bubbleText[6]}</p>
              </div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#6B6B6B] mb-2">
                GITHUB USERNAME
              </label>
              <div className="flex items-center border-2 border-[#E8E0D0] rounded-xl bg-white px-4 h-[52px] max-w-[480px] focus-within:border-[#FFC800] transition-colors">
                <span className="text-[15px] text-[#ABABAB] flex-shrink-0">github.com/</span>
                <input
                  type="text"
                  value={data.githubUsername}
                  onChange={(e) => setData((prev) => ({ ...prev, githubUsername: e.target.value }))}
                  placeholder="your-username"
                  className="flex-1 border-none outline-none text-[15px] text-[#1A1A1A] bg-transparent pl-0.5 placeholder:text-[#ABABAB]"
                />
              </div>
              <p className="text-[13px] text-[#6B6B6B] italic mt-2">
                Optional — but makes your profile 10x better
              </p>
              {/* Benefit pills */}
              <div className="flex gap-2 mt-4">
                {['✓ Auto-scan projects', '✓ Tech stack detection', '✓ Validates your skills'].map((pill) => (
                  <span
                    key={pill}
                    className="bg-[#F5F0E8] border border-[#E8E0D0] rounded-full px-3 py-1.5 text-xs text-[#6B6B6B]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
              {/* Summary pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {data.name && (
                  <span className="bg-[#FFF8E1] border border-[#FFC800] text-[#CC9F00] text-xs font-semibold rounded-full px-3 py-1">
                    ✓ {data.name}
                  </span>
                )}
                {data.targetRole && (
                  <span className="bg-[#FFF8E1] border border-[#FFC800] text-[#CC9F00] text-xs font-semibold rounded-full px-3 py-1">
                    ✓ {data.targetRole}
                  </span>
                )}
                {data.cvFileName && (
                  <span className="bg-[#FFF8E1] border border-[#FFC800] text-[#CC9F00] text-xs font-semibold rounded-full px-3 py-1">
                    ✓ CV uploaded
                  </span>
                )}
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <OutlinedButton onClick={handleBack}>Back</OutlinedButton>
                <YellowButton onClick={handleComplete}>Let&apos;s go! →</YellowButton>
              </div>
              <button
                type="button"
                onClick={handleComplete}
                className="mt-3 text-[13px] text-[#ABABAB] cursor-pointer"
              >
                Skip for now →
              </button>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex flex-col flex-1">
              <MobileCuppySection step={6} />
              <div className="bg-white rounded-t-[28px] px-6 pt-7 pb-10 mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <h2 className="text-[24px] font-extrabold text-[#1A1A1A] mb-4">Connect your GitHub.</h2>
                <div className="flex items-center border-2 border-[#E8E0D0] rounded-xl bg-white px-4 h-[52px] focus-within:border-[#FFC800] transition-colors">
                  <span className="text-[15px] text-[#ABABAB] flex-shrink-0">github.com/</span>
                  <input
                    type="text"
                    value={data.githubUsername}
                    onChange={(e) => setData((prev) => ({ ...prev, githubUsername: e.target.value }))}
                    placeholder="your-username"
                    className="flex-1 border-none outline-none text-[15px] text-[#1A1A1A] bg-transparent pl-0.5 placeholder:text-[#ABABAB]"
                  />
                </div>
                <p className="text-[13px] text-[#6B6B6B] italic mt-2">
                  Optional — but makes your profile 10x better
                </p>
                {/* Summary pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.name && (
                    <span className="bg-[#FFF8E1] border border-[#FFC800] text-[#CC9F00] text-xs font-semibold rounded-full px-3 py-1">
                      ✓ {data.name}
                    </span>
                  )}
                  {data.targetRole && (
                    <span className="bg-[#FFF8E1] border border-[#FFC800] text-[#CC9F00] text-xs font-semibold rounded-full px-3 py-1">
                      ✓ {data.targetRole}
                    </span>
                  )}
                  {data.cvFileName && (
                    <span className="bg-[#FFF8E1] border border-[#FFC800] text-[#CC9F00] text-xs font-semibold rounded-full px-3 py-1">
                      ✓ CV uploaded
                    </span>
                  )}
                </div>
                <YellowButton onClick={handleComplete} fullWidth className="mt-6">
                  Let&apos;s go! →
                </YellowButton>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="block w-full text-center text-[#ABABAB] mt-3 text-sm cursor-pointer"
                >
                  Skip for now →
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="block w-full text-center text-[#6B6B6B] mt-2 text-sm"
                >
                  ← Back
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-[#F5F0E8]">
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[300px] flex-shrink-0 bg-[#2D2D2D] flex-col fixed left-0 top-0 h-full z-40 p-8">
        {/* Logo */}
        <div className="flex items-center mb-12">
          <div className="w-11 h-11 rounded-[10px] bg-[#FFC800] flex items-center justify-center">
            <Rocket size={22} className="text-white" />
          </div>
          <span className="ml-3 text-[22px] font-extrabold text-white">Cari</span>
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-2">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isFuture = step.id > currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors text-left ${
                  isCurrent ? 'bg-[rgba(255,200,0,0.08)]' : 'bg-transparent'
                } ${isFuture ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isFuture
                      ? 'bg-[#3A3A3A] border-2 border-[#4A4A4A]'
                      : 'bg-[#FFC800]'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-[#1A1A1A]" />
                  ) : (
                    <span
                      className={`text-sm font-${isCurrent ? 'bold' : 'semibold'} ${
                        isFuture ? 'text-[#6B6B6B]' : 'text-[#1A1A1A]'
                      }`}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-sm ${
                    isCurrent
                      ? 'text-white font-bold'
                      : 'text-[#6B6B6B]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="flex-1" />
        <div className="border-t border-[#3A3A3A] mb-5" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#6B6B6B] mb-2.5">STATUS</p>
        <div className="bg-[#3A3A3A] h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FFC800] rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-[#6B6B6B] mt-1.5">Step {currentStep} of 6</p>
      </aside>

      {/* ── Right area ───────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-[300px] flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-40 bg-[#F5F0E8] px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1A1A1A]">Step {currentStep} of 6</span>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[#6B6B6B]"
            >
              <X size={20} />
            </button>
          </div>
          <div className="bg-[#E8E0D0] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <motion.div
              className="h-full bg-[#FFC800] rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="flex flex-col flex-1">
          {renderStepContent()}
        </div>
      </div>

      {/* ── Completion overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-[#FFC800] flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[200px] h-[200px] rounded-full overflow-hidden flex items-center justify-center bg-[#3A2800]"
            >
              <CuppyImage />
            </motion.div>
            <h2 className="text-[28px] font-extrabold text-[#1A1A1A] mt-5">
              All set, {data.name || 'there'}! 🎉
            </h2>
            <p className="text-base text-[#1A1A1A] mt-2">Your journey begins now.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hidden file input ────────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleInputFileChange}
      />
    </div>
  );
}
