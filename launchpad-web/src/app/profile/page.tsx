'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Code2, Zap, Briefcase, GraduationCap, Award, Trophy,
  ChevronDown, Moon, Sun, Bell, LogOut,
  FileDown, Share2, Plus, Trash2, Info, CheckCircle2, ExternalLink, Flame,
} from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';
import { useXPToast } from '@/components/XPToast';
import { useThemeToggle } from '@/lib/use-theme-toggle';
import { MOCK_PROFILE, type UserProfile } from '@/lib/mock-data';
import { cariApi, cariAuth, type GitHubSnapshot } from '@/lib/cari-api';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0"
      style={{
        width: 36,
        height: 20,
        borderRadius: 9999,
        backgroundColor: on ? '#FFC800' : 'var(--border)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 200ms',
      }}
    >
      <motion.div
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'absolute',
          top: 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({
  id, title, icon: Icon, expanded, onToggle, children, delay = 0,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-5 cursor-pointer"
        onClick={() => onToggle(id)}
        style={{ background: 'none', border: 'none' }}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} color="var(--text-gray)" />
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} color="var(--text-gray)" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Profile Health Ring ──────────────────────────────────────────────────────

function ProfileHealthCard() {
  const R = 48;
  const CIRC = 2 * Math.PI * R;
  const score = 0.75;
  const offset = CIRC - score * CIRC;

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="text-center text-[11px] font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-light)' }}>
        Profile Health
      </div>

      <div className="flex justify-center mb-4">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={R} fill="none" stroke="var(--border)" strokeWidth={10} />
          <motion.circle
            cx={60} cy={60} r={R}
            fill="none"
            stroke="#FFC800"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            transform="rotate(-90 60 60)"
          />
          <text x={60} y={60} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 20, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif' }}>
            75%
          </text>
        </svg>
      </div>

      <div className="text-center font-bold mb-2" style={{ fontSize: 15, color: 'var(--text-primary)' }}>Strong Start!</div>
      <p className="text-center mb-4 leading-relaxed" style={{ fontSize: 13, color: 'var(--text-gray)' }}>
        Add 2 more projects to reach the &ldquo;Elite&rdquo; profile status.
      </p>

      <div className="flex flex-col gap-2">
        {[
          { label: 'Avatar set (+10%)', done: true },
          { label: 'Summary updated (+15%)', done: true },
          { label: 'Skill assessments (0/3)', done: false },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <CheckCircle2 size={16} color={item.done ? '#4CAF50' : 'var(--text-light)'} />
            <span style={{ fontSize: 13, color: item.done ? 'var(--text-primary)' : 'var(--text-light)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cuppy Tip Card ───────────────────────────────────────────────────────────

function CuppyTipCard() {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: '#E8F7FF', border: '1px solid #1CB0F6' }}>
      <p className="mb-3 italic leading-relaxed" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
        &ldquo;Looking sharp! Your resume is 3 skills away from matching that Senior Dev role we found.&rdquo;
      </p>
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-[#FFF8E1] border-2 border-[#FFC800] flex items-center justify-center flex-shrink-0">
          <span style={{ fontSize: 20 }}>☕</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1CB0F6' }}>Cuppy&apos;s Tip</span>
      </div>
    </div>
  );
}

// ─── Quick Actions Card ───────────────────────────────────────────────────────

function QuickActionsCard({ onAction, fullName }: { onAction: (msg: string) => void; fullName?: string }) {
  const router = useRouter();
  const handle = (fullName ?? 'user').split(' ')[0]?.toLowerCase() ?? 'user';
  const actions = [
    {
      icon: FileDown, iconColor: '#FFC800',
      label: 'Export PDF', sub: 'Your resume as PDF',
      onClick: () => { window.print(); },
    },
    {
      icon: Zap, iconColor: '#7C5CBF',
      label: 'Tailor Resume', sub: 'Match a specific job',
      onClick: () => router.push('/jobs'),
    },
    {
      icon: Share2, iconColor: '#4CAF50',
      label: 'Share Profile', sub: `Public URL: cari.app/${handle}`,
      onClick: () => {
        navigator.clipboard.writeText(`https://cari.app/${handle}`).catch(() => {});
        onAction('Profile link copied!');
      },
    },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-light)' }}>Quick Actions</div>
      <div className="flex flex-col gap-2.5">
        {actions.map(({ icon: Icon, iconColor, label, sub, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-left transition-all group"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', width: '100%' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FFC800')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-card)' }}>
              <Icon size={18} color={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{label}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-gray)' }}>{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Resume Preview ───────────────────────────────────────────────────────────

function ResumePreview({ profile }: { profile: UserProfile }) {
  const { personal, summary, education, certifications, projects, experience, skills, awards, extracurricular } = profile;

  const Bullet = ({ text }: { text: string }) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 2, alignItems: 'flex-start' }}>
      <span style={{ color: '#1A1A1A', fontSize: 11, marginTop: 1, flexShrink: 0, lineHeight: 1.6 }}>▪</span>
      <span style={{ fontSize: 11, color: '#2A2A2A', lineHeight: 1.6 }}>{text}</span>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ marginTop: 12, marginBottom: 4, borderBottom: '1px solid #1A1A1A', paddingBottom: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', color: '#1A1A1A', textTransform: 'uppercase' }}>{title}</span>
    </div>
  );

  const contactItems = [personal.location, personal.phone, personal.email, personal.linkedin, personal.github].filter(Boolean);

  return (
    <div
      id="resume-print-area"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        fontFamily: 'Georgia, "Times New Roman", serif',
        padding: '40px 48px',
        maxWidth: 760,
        margin: '0 auto',
        border: '1px solid var(--border)',
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#1A1A1A', fontFamily: 'Arial, sans-serif' }}>
          {personal.fullName || 'YOUR NAME'}
        </div>
        {contactItems.length > 0 && (
          <div style={{ fontSize: 10, color: '#333', marginTop: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 10px' }}>
            {contactItems.map((v, i) => <span key={i}>{v}</span>)}
          </div>
        )}
        <div style={{ marginTop: 8, height: 1, backgroundColor: '#1A1A1A' }} />
      </div>

      {/* Summary */}
      {summary && (
        <>
          <SectionHeader title="Summary" />
          <p style={{ fontSize: 11, color: '#2A2A2A', lineHeight: 1.65, marginBottom: 4 }}>{summary}</p>
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <SectionHeader title="Education" />
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{e.institution}</span>
                <span style={{ fontSize: 10, color: '#555' }}>{e.dateRange}</span>
              </div>
              <div style={{ fontSize: 11, color: '#444' }}>{[e.degree, e.field].filter(Boolean).join(' — ')}{e.grade ? ` | ${e.grade}` : ''}</div>
            </div>
          ))}
        </>
      )}

      {/* Certification */}
      {certifications.length > 0 && (
        <>
          <SectionHeader title="Certification" />
          {certifications.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: '#1A1A1A' }}>{c.name}</span>
              <span style={{ fontSize: 10, color: '#555' }}>{[c.issuer, c.date].filter(Boolean).join(' · ')}</span>
            </div>
          ))}
        </>
      )}

      {/* Projects */}
      {projects.filter(p => p.showOnResume).length > 0 && (
        <>
          <SectionHeader title="Project" />
          {projects.filter(p => p.showOnResume).map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{p.name}</span>
                <span style={{ fontSize: 10, color: '#555' }}>{p.date}</span>
              </div>
              {p.bullets.map((b, j) => <Bullet key={j} text={b} />)}
            </div>
          ))}
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <SectionHeader title="Relevant Experience" />
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{e.company}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontStyle: 'italic', color: '#333' }}>{e.role}{e.type ? ` (${e.type})` : ''}</span>
                <span style={{ fontSize: 10, color: '#555' }}>{e.dateRange}</span>
              </div>
              {e.bullets.map((b, j) => <Bullet key={j} text={b} />)}
            </div>
          ))}
        </>
      )}

      {/* Technical Skills */}
      {(skills.languages.length > 0 || skills.frameworks.length > 0 || skills.tools.length > 0 || skills.soft.length > 0) && (
        <>
          <SectionHeader title="Technical Skills" />
          {[
            { label: 'Languages', items: skills.languages },
            { label: 'Frameworks', items: skills.frameworks },
            { label: 'Tools & Platforms', items: skills.tools },
            { label: 'Soft Skills', items: skills.soft },
          ].filter(g => g.items.length > 0).map(({ label, items }) => (
            <div key={label} style={{ fontSize: 11, marginBottom: 2, display: 'flex', gap: 4 }}>
              <span style={{ fontWeight: 700, minWidth: 130, flexShrink: 0 }}>{label}</span>
              <span style={{ color: '#2A2A2A' }}>: {items.join(', ')}</span>
            </div>
          ))}
        </>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <>
          <SectionHeader title="Awards & Honours" />
          {awards.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: '#1A1A1A' }}>{a.name}{a.issuer ? `, ${a.issuer}` : ''}</span>
              <span style={{ fontSize: 10, color: '#555' }}>{a.date}</span>
            </div>
          ))}
        </>
      )}

      {/* Extracurricular */}
      {extracurricular.length > 0 && (
        <>
          <SectionHeader title="Extracurricular Involvement" />
          {extracurricular.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{e.name}</span>
                <span style={{ fontSize: 10, color: '#555' }}>{e.date}</span>
              </div>
              {e.organization && <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>{e.organization}</div>}
              {(e as { bullets?: string[] }).bullets?.map((b, j) => <Bullet key={j} text={b} />)}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function extractGitHubUsername(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^github\.com\//i, '')
    .split(/[/?#]/)[0]
    .trim();
}

function applyGitHubSnapshotToProfile(
  profile: UserProfile,
  snapshot: GitHubSnapshot
): UserProfile {
  const githubProjects = snapshot.topRepositories.slice(0, 6).map((repo) => ({
    id: `github-${repo.id}`,
    name: repo.name,
    description: repo.description ?? 'Public GitHub project imported into Cari.',
    tech: mergeUnique([
      ...(repo.primaryLanguage ? [repo.primaryLanguage] : []),
      ...repo.topics.slice(0, 5),
    ]),
    showOnResume: true,
    bullets: [
      repo.description ?? `Built and maintained ${repo.name} as a public repository.`,
      `Repository shows ${repo.stars} stars, ${repo.forks} forks, and public project activity.`,
    ],
    date: new Date(repo.updatedAt).getFullYear().toString(),
    url: repo.url.replace(/^https?:\/\//i, ''),
  }));
  const existingProjectIds = new Set(profile.projects.map((project) => project.id));
  const importedProjects = githubProjects.filter(
    (project) => !existingProjectIds.has(project.id)
  );
  const languageSkills = snapshot.languages.map((language) => language.name);
  const topicSkills = snapshot.topics.map((topic) => topic.name);

  return {
    ...profile,
    personal: {
      ...profile.personal,
      github: `github.com/${snapshot.username}`,
    },
    skills: {
      ...profile.skills,
      languages: mergeUnique([...profile.skills.languages, ...languageSkills]),
      tools: mergeUnique([...profile.skills.tools, 'GitHub']),
      frameworks: mergeUnique([...profile.skills.frameworks, ...topicSkills.slice(0, 8)]),
    },
    projects: [...importedProjects, ...profile.projects],
    skillMatch: Math.min(100, Math.max(profile.skillMatch, 70 + snapshot.languages.length)),
  };
}

function mergeUnique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export default function ProfilePage() {
  const router = useRouter();
  const { showXP } = useXPToast();
  const { isDark, toggle } = useThemeToggle();
  const [activeTab, setActiveTab] = useState<'profile' | 'resume'>('profile');
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary']);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<UserProfile>(MOCK_PROFILE);
  const [resumeSubTab, setResumeSubTab] = useState<'foundation' | 'tailored'>('foundation');
  const [notifications, setNotifications] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [githubSummary, setGithubSummary] = useState<GitHubSnapshot | null>(null);
  const [aiEnhancing, setAiEnhancing] = useState<Record<string, boolean>>({});
  const [cvImporting, setCvImporting] = useState(false);
  const cvUploadRef = useRef<HTMLInputElement>(null);
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({ languages: '', frameworks: '', tools: '', soft: '' });
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [newItemDraft, setNewItemDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    cariApi
      .getProfile()
      .then(({ profile }) => {
        if (!active) return;
        const profileData = profile.profileData as Partial<UserProfile> & {
          githubSnapshot?: GitHubSnapshot;
        };
        setGithubSummary(profileData.githubSnapshot ?? null);
        setEditData({
          ...MOCK_PROFILE,
          ...profileData,
          summary: (profileData.summary as string | undefined) ?? '',
          projects: (profileData.projects as UserProfile['projects'] | undefined) ?? [],
          experience: (profileData.experience as UserProfile['experience'] | undefined) ?? [],
          skills: (profileData.skills as UserProfile['skills'] | undefined) ?? { languages: [], frameworks: [], tools: [], soft: [] },
          education: (profileData.education as UserProfile['education'] | undefined) ?? [],
          certifications: (profileData.certifications as UserProfile['certifications'] | undefined) ?? [],
          awards: (profileData.awards as UserProfile['awards'] | undefined) ?? [],
          extracurricular: (profileData.extracurricular as UserProfile['extracurricular'] | undefined) ?? [],
          personal: {
            ...MOCK_PROFILE.personal,
            ...(profileData.personal ?? {}),
            fullName: profile.fullName ?? (profileData.personal as { fullName?: string } | undefined)?.fullName ?? '',
            email: profile.email,
          },
          targetRole: profile.targetRole ?? (profileData as { targetRole?: string }).targetRole ?? '',
          onboarded: profile.onboarded,
          xp: profile.xp,
          streak: profile.streak,
          level: profile.level as UserProfile['level'],
          atsScore: profile.atsScore,
          skillMatch: profile.skillMatch,
        });
      })
      .catch(() => {
        // Keep the mock profile when offline or logged out.
      });

    return () => {
      active = false;
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const saveProfileToSupabase = useCallback(async (data: UserProfile): Promise<void> => {
    await cariApi.updateProfile({
      fullName: data.personal.fullName || null,
      targetRole: data.targetRole || null,
      profileData: data as unknown as Record<string, unknown>,
      onboarded: data.onboarded,
      xp: data.xp,
      streak: data.streak,
      level: String(data.level) || 'NEWCOMER',
      atsScore: Math.min(100, Math.max(0, Math.round(data.atsScore))),
      skillMatch: Math.min(100, Math.max(0, Math.round(data.skillMatch))),
    });
    // Signal all pages that profile has changed so they re-fetch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cari:profile:updated'));
    }
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      await saveProfileToSupabase(editData);
      setIsEditMode(false);
      showToast('Profile saved!');
      haptic('success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save profile');
    }
  };

  const handleGithubSync = async () => {
    const username = extractGitHubUsername(editData.personal.github);
    if (!username) {
      showToast('Add your GitHub username first');
      return;
    }

    setGithubSyncing(true);
    try {
      const { github } = await cariApi.scrapeGitHub({
        username,
        includeForks: false,
        maxRepos: 30,
      });
      const nextProfile = applyGitHubSnapshotToProfile(editData, github.snapshot);
      await saveProfileToSupabase({
        ...nextProfile,
        ...({ githubSnapshot: github.snapshot } as unknown as UserProfile),
      } as UserProfile);
      setEditData(nextProfile);
      setGithubSummary(github.snapshot);
      showToast('GitHub synced into your profile');
      haptic('success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not sync GitHub');
    } finally {
      setGithubSyncing(false);
    }
  };

  const applyParsedResume = (r: import('@/lib/cari-api').GeneratedResume) => {
    setEditData(prev => ({
      ...prev,
      summary: r.summary || prev.summary,
      skills: {
        languages: r.skills.languages.length ? r.skills.languages : prev.skills.languages,
        frameworks: r.skills.frameworks.length ? r.skills.frameworks : prev.skills.frameworks,
        tools: r.skills.toolsAndPlatforms.length ? r.skills.toolsAndPlatforms : prev.skills.tools,
        soft: r.skills.softSkills.length ? r.skills.softSkills : prev.skills.soft,
      },
      projects: r.projects.length ? r.projects.map((p, i) => ({
        id: `resume-project-${i}`,
        name: p.name,
        description: p.description ?? '',
        tech: p.techStack,
        showOnResume: true,
        bullets: p.bullets,
        date: '',
        url: p.repoUrl?.replace(/^https?:\/\//i, '') ?? '',
      })) : prev.projects,
      experience: r.experience.length ? r.experience.map((e, i) => ({
        id: `resume-experience-${i}`,
        role: e.role,
        company: e.company,
        type: e.type ?? '',
        dateRange: [e.startDate, e.endDate].filter(Boolean).join(' – '),
        bullets: e.bullets,
      })) : prev.experience,
      education: r.education.length ? r.education.map(e => ({
        institution: e.institution,
        degree: e.degree ?? '',
        field: e.field ?? '',
        dateRange: [e.startDate, e.endDate].filter(Boolean).join(' – '),
        grade: e.grade ?? '',
      })) : prev.education,
      certifications: r.certifications.length ? r.certifications.map(c => ({
        name: c.name,
        issuer: c.issuer ?? '',
        date: c.date ?? '',
      })) : prev.certifications,
      awards: r.awards.length ? r.awards.map(a => ({
        name: a.title,
        issuer: a.issuer ?? '',
        date: a.year ?? '',
      })) : prev.awards,
      personal: {
        ...prev.personal,
        fullName: r.personal.fullName || prev.personal.fullName,
        location: r.personal.location ?? prev.personal.location,
        phone: r.personal.phone ?? prev.personal.phone,
        linkedin: r.personal.linkedin ?? prev.personal.linkedin,
        github: r.personal.github ?? prev.personal.github,
      },
    }));
  };

  const handleUploadAndImport = async (file: File) => {
    setCvImporting(true);
    try {
      const { parsed } = await cariApi.parseResume(file);
      applyParsedResume(parsed.resume);
      showToast('CV imported! Review your profile and save.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not parse CV — try a PDF or DOCX');
    } finally {
      setCvImporting(false);
    }
  };

  const handleImportFromCv = async () => {
    setCvImporting(true);
    try {
      const { parsed } = await cariApi.importFromCv();
      applyParsedResume(parsed.resume);
      showToast('CV imported! Review your profile and save.');
    } catch {
      // No stored CV — prompt user to upload one instead
      cvUploadRef.current?.click();
    } finally {
      setCvImporting(false);
    }
  };

  const handleEnhanceSummary = async () => {
    if (!editData.summary.trim()) { showToast('Add a summary first before enhancing'); return; }
    setAiEnhancing(prev => ({ ...prev, summary: true }));
    try {
      const result = await cariApi.enhanceSection({
        sectionType: 'summary',
        content: editData.summary,
        context: editData.targetRole || undefined,
      });
      const next = { ...editData, summary: result.enhanced as string };
      setEditData(next);
      await saveProfileToSupabase(next);
      showToast('Summary enhanced & saved!');
    } catch {
      showToast('Could not enhance summary — try again');
    } finally {
      setAiEnhancing(prev => ({ ...prev, summary: false }));
    }
  };

  const handleEnhanceExperience = async (expId: string, bullets: string[]) => {
    setAiEnhancing(prev => ({ ...prev, [`exp-${expId}`]: true }));
    try {
      const result = await cariApi.enhanceSection({
        sectionType: 'experience_bullets',
        content: bullets,
        context: editData.targetRole || undefined,
      });
      const next = {
        ...editData,
        experience: editData.experience.map(e => e.id === expId ? { ...e, bullets: result.enhanced as string[] } : e),
      };
      setEditData(next);
      await saveProfileToSupabase(next);
      showToast('Experience enhanced & saved!');
    } catch {
      showToast('Could not enhance bullets — try again');
    } finally {
      setAiEnhancing(prev => ({ ...prev, [`exp-${expId}`]: false }));
    }
  };

  const handleEnhanceProject = async (projectId: string, bullets: string[]) => {
    setAiEnhancing(prev => ({ ...prev, [`proj-${projectId}`]: true }));
    try {
      const result = await cariApi.enhanceSection({
        sectionType: 'project_bullets',
        content: bullets,
        context: editData.targetRole || undefined,
      });
      const next = {
        ...editData,
        projects: editData.projects.map(p => p.id === projectId ? { ...p, bullets: result.enhanced as string[] } : p),
      };
      setEditData(next);
      await saveProfileToSupabase(next);
      showToast('Project enhanced & saved!');
    } catch {
      showToast('Could not enhance project — try again');
    } finally {
      setAiEnhancing(prev => ({ ...prev, [`proj-${projectId}`]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    cariAuth.clear();
    document.cookie = 'lp_onboarded=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    router.push('/login');
  };

  const profileSections = [
    { id: 'summary', title: 'Professional Summary', icon: FileText },
    { id: 'projects', title: 'Projects', icon: Code2 },
    { id: 'skills', title: 'Skills', icon: Zap },
    { id: 'experience', title: 'Experience', icon: Briefcase },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'certifications', title: 'Certifications', icon: Award },
    { id: 'awards', title: 'Awards', icon: Trophy },
  ];

  // ── Right Panel (shared) ──────────────────────────────────────────────────

  const RightPanel = () => (
    <div className="flex flex-col gap-4">
      <ProfileHealthCard />
      <CuppyTipCard />
      <QuickActionsCard onAction={showToast} fullName={editData.personal.fullName} />
    </div>
  );

  // ── Profile Header ────────────────────────────────────────────────────────

  const ProfileHeader = ({ mobile = false }: { mobile?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('rounded-2xl', mobile ? 'mx-4 mt-4 mb-4 p-5 text-center flex flex-col items-center gap-2' : 'p-6 mb-5 flex gap-5 items-start')}
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="relative">
        <img
          src="/mascot-face.png"
          alt="Profile avatar"
          style={{
            width: mobile ? 72 : 88,
            height: mobile ? 72 : 88,
            borderRadius: 16,
            border: '3px solid #FFC800',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <div
          className="absolute text-center font-bold"
          style={{
            bottom: mobile ? -8 : -6,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: mobile ? '#FF4B4B' : '#FFC800',
            color: mobile ? 'white' : '#1A1A1A',
            borderRadius: 9999,
            padding: '2px 10px',
            fontSize: 11,
            whiteSpace: 'nowrap',
          }}
        >
          LVL {editData.level}
        </div>
      </div>

      <div className={cn(mobile ? 'flex flex-col items-center mt-2' : 'flex-1')}>
        <div style={{ fontSize: mobile ? 20 : 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          {editData.personal.fullName || 'Your Name'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-gray)', marginTop: 4 }}>
          {editData.targetRole || 'Set your target role'}
        </div>
        <div className={cn('flex gap-2 mt-3', mobile && 'justify-center flex-wrap')}>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFC800' }}>
            <Flame size={13} color="#F59E0B" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>{editData.streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: '#F0EBFF', border: '1px solid #7C5CBF' }}>
            <span style={{ fontSize: 13 }}>⭐</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7C5CBF' }}>{editData.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      <div className={cn('flex gap-2', mobile && 'mt-2 w-full')}>
        {!isEditMode ? (
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={() => setIsEditMode(true)}
            className={cn('rounded-xl font-bold', mobile ? 'w-full py-2.5' : 'px-5 py-2.5')}
            style={{ background: '#FFC800', color: '#1A1A1A', fontSize: 13, boxShadow: '0 3px 0 #CC9F00', border: 'none', cursor: 'pointer' }}
          >
            Edit Profile
          </motion.button>
        ) : (
          <div className="flex flex-col gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="rounded-xl font-bold px-4 py-2" style={{ background: '#FFC800', color: '#1A1A1A', fontSize: 13, border: 'none', cursor: 'pointer' }}>
              Save Changes
            </motion.button>
            <button onClick={() => setIsEditMode(false)} className="rounded-xl font-semibold px-4 py-2" style={{ background: 'none', color: 'var(--text-gray)', fontSize: 13, border: '1px solid var(--border)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  // ── Tab Switcher ──────────────────────────────────────────────────────────

  const TabSwitcher = ({ className }: { className?: string }) => (
    <div className={cn('flex', className)} style={{ borderBottom: '1px solid var(--border)' }}>
      {(['profile', 'resume'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className="font-semibold capitalize cursor-pointer"
          style={{
            fontSize: 15,
            padding: '12px 4px',
            marginRight: 32,
            marginBottom: -1,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab ? '2px solid #FFC800' : '2px solid transparent',
            color: activeTab === tab ? '#FFC800' : 'var(--text-gray)',
            cursor: 'pointer',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  // ── Profile Tab Content ───────────────────────────────────────────────────

  const ProfileTabContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="profile-tab"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-3 mt-6"
      >
        {/* CV Import Banner */}
        {editData.projects.length === 0 && editData.experience.length === 0 && editData.skills.languages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#FFF8E1', border: '2px solid #FFC800' }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 24 }}>📄</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Your profile is empty</div>
                  <div style={{ fontSize: 13, color: '#6B6B6B' }}>Upload your CV to auto-fill all sections</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => cvUploadRef.current?.click()}
                  disabled={cvImporting}
                  className="rounded-xl font-bold px-4 py-2"
                  style={{ backgroundColor: '#FFC800', color: '#1A1A1A', fontSize: 13, border: 'none', cursor: cvImporting ? 'wait' : 'pointer', opacity: cvImporting ? 0.7 : 1, boxShadow: '0 3px 0 #CC9F00' }}
                >
                  {cvImporting ? 'Importing...' : '⬆ Upload CV'}
                </button>
              </div>
            </div>
            {cvImporting && (
              <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 8 }}>
                Parsing your CV with AI — this takes ~10 seconds...
              </div>
            )}
          </motion.div>
        )}
        <input
          ref={cvUploadRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUploadAndImport(file);
            e.target.value = '';
          }}
        />

        {/* Professional Summary */}
        <AccordionSection id="summary" title="Professional Summary" icon={FileText} expanded={expandedSections.includes('summary')} onToggle={toggleSection} delay={0}>
          {!isEditMode ? (
            <>
              <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: editData.summary ? 'var(--text-primary)' : 'var(--text-light)' }}>
                {editData.summary || 'No summary yet. Click Edit Profile to add your professional summary.'}
              </div>
              <button
                onClick={handleEnhanceSummary}
                disabled={aiEnhancing.summary}
                className="flex items-center gap-1.5 mt-3 font-semibold"
                style={{ background: 'none', border: 'none', cursor: aiEnhancing.summary ? 'wait' : 'pointer', color: '#FFC800', fontSize: 13, opacity: aiEnhancing.summary ? 0.6 : 1 }}
              >
                <Zap size={14} />{aiEnhancing.summary ? 'Enhancing...' : '✦ Improve with AI'}
              </button>
            </>
          ) : (
            <textarea
              value={editData.summary}
              onChange={e => setEditData(prev => ({ ...prev, summary: e.target.value }))}
              className="w-full rounded-xl p-4 text-sm leading-relaxed resize-none"
              style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', minHeight: 120, outline: 'none', fontFamily: 'Nunito, sans-serif' }}
            />
          )}
        </AccordionSection>

        {/* Projects */}
        <AccordionSection id="projects" title="Projects" icon={Code2} expanded={expandedSections.includes('projects')} onToggle={toggleSection} delay={0.06}>
          {/* GitHub Sync Banner */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: '#E8F7FF', border: '1px solid #1CB0F6' }}>
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1CB0F6' }}>
                {githubSummary
                  ? `GitHub synced: ${githubSummary.stats.sourceRepoCount} repos, ${githubSummary.languages.length} languages`
                  : 'GitHub sync ready'}
              </span>
            </div>
            <button
              onClick={handleGithubSync}
              disabled={githubSyncing}
              style={{ background: 'none', border: 'none', cursor: githubSyncing ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700, color: '#1CB0F6', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: githubSyncing ? 0.7 : 1 }}
            >
              {githubSyncing ? 'Syncing...' : 'Refresh Now'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {editData.projects.map(project => (
              <div key={project.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{project.name}</div>
                <div className="mt-1 leading-relaxed" style={{ fontSize: 13, color: 'var(--text-gray)' }}>{project.description}</div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {project.tech.map(t => (
                    <span key={t} className="rounded-md px-2 py-0.5" style={{ fontSize: 12, fontWeight: 600, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-gray)' }}>{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <span style={{ fontSize: 12, color: 'var(--text-gray)' }}>Feature on resume</span>
                  <Toggle on={project.showOnResume} onChange={() => setEditData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === project.id ? { ...p, showOnResume: !p.showOnResume } : p) }))} />
                </div>
                {project.bullets.length > 0 && (
                  <button
                    onClick={() => handleEnhanceProject(project.id, project.bullets)}
                    disabled={!!aiEnhancing[`proj-${project.id}`]}
                    className="flex items-center gap-1.5 mt-2 font-semibold"
                    style={{ background: 'none', border: 'none', cursor: aiEnhancing[`proj-${project.id}`] ? 'wait' : 'pointer', color: '#FFC800', fontSize: 12, opacity: aiEnhancing[`proj-${project.id}`] ? 0.6 : 1, padding: 0 }}
                  >
                    <Zap size={12} />{aiEnhancing[`proj-${project.id}`] ? 'Enhancing...' : '✦ Improve with AI'}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 mt-3 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFC800', fontSize: 13 }}>
            <Plus size={16} color="#FFC800" />Add manual project
          </button>
        </AccordionSection>

        {/* Skills */}
        <AccordionSection id="skills" title="Skills" icon={Zap} expanded={expandedSections.includes('skills')} onToggle={toggleSection} delay={0.12}>
          {[
            { label: 'Languages', key: 'languages' as const },
            { label: 'Frameworks', key: 'frameworks' as const },
            { label: 'Tools & Platforms', key: 'tools' as const },
            { label: 'Soft Skills', key: 'soft' as const },
          ].map(({ label, key }, idx, arr) => (
            <div key={key}>
              <div className="mb-2 uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', letterSpacing: '0.5px' }}>{label}</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {editData.skills[key].map(skill => (
                  <div key={skill} className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {skill}
                    {isEditMode && <button onClick={() => setEditData(prev => ({ ...prev, skills: { ...prev.skills, [key]: prev.skills[key].filter(s => s !== skill) } }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 12, marginLeft: 2, display: 'flex', alignItems: 'center' }}>×</button>}
                  </div>
                ))}
                {isEditMode && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSkillInputs[key] ?? ''}
                      onChange={e => setNewSkillInputs(prev => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = newSkillInputs[key]?.trim();
                          if (val && !editData.skills[key].includes(val)) {
                            setEditData(prev => ({ ...prev, skills: { ...prev.skills, [key]: [...prev.skills[key], val] } }));
                          }
                          setNewSkillInputs(prev => ({ ...prev, [key]: '' }));
                        }
                      }}
                      placeholder={`Add ${label.toLowerCase()}...`}
                      className="rounded-full px-3 py-1"
                      style={{ fontSize: 13, border: '1.5px dashed #FFC800', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', minWidth: 130 }}
                    />
                    {(newSkillInputs[key] ?? '').trim() && (
                      <button
                        onClick={() => {
                          const val = newSkillInputs[key]?.trim();
                          if (val && !editData.skills[key].includes(val)) {
                            setEditData(prev => ({ ...prev, skills: { ...prev.skills, [key]: [...prev.skills[key], val] } }));
                          }
                          setNewSkillInputs(prev => ({ ...prev, [key]: '' }));
                        }}
                        className="rounded-full w-7 h-7 flex items-center justify-center font-bold"
                        style={{ fontSize: 14, backgroundColor: '#FFC800', color: '#1A1A1A', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                      >+</button>
                    )}
                  </div>
                )}
              </div>
              {idx < arr.length - 1 && <div className="mb-3" style={{ height: 1, backgroundColor: 'var(--border)' }} />}
            </div>
          ))}
          <div className="flex items-center gap-1.5 mt-2">
            <Info size={14} color="#FFC800" />
            <span style={{ fontSize: 12, color: 'var(--text-gray)' }}>Updating skills also updates your roadmap</span>
          </div>
        </AccordionSection>

        {/* Experience */}
        <AccordionSection id="experience" title="Experience" icon={Briefcase} expanded={expandedSections.includes('experience')} onToggle={toggleSection} delay={0.18}>
          {editData.experience.map((exp, idx) => (
            <div key={exp.id}>
              {isEditMode ? (
                <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[['role', 'Role / Title'], ['company', 'Company'], ['type', 'Type (Full-time / Internship)'], ['dateRange', 'Date Range']].map(([field, placeholder]) => (
                      <input key={field} value={(exp as Record<string, string>)[field] ?? ''} onChange={e => setEditData(prev => ({ ...prev, experience: prev.experience.map(ex => ex.id === exp.id ? { ...ex, [field]: e.target.value } : ex) }))} placeholder={placeholder} className="rounded-lg px-3 py-1.5 col-span-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }} />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5 mb-2">
                    {exp.bullets.map((b, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="rounded-full flex-shrink-0" style={{ width: 5, height: 5, backgroundColor: '#FFC800', marginTop: 0 }} />
                        <input value={b} onChange={e => setEditData(prev => ({ ...prev, experience: prev.experience.map(ex => ex.id === exp.id ? { ...ex, bullets: ex.bullets.map((bul, bi) => bi === i ? e.target.value : bul) } : ex) }))} className="flex-1 rounded-lg px-3 py-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }} />
                        <button onClick={() => setEditData(prev => ({ ...prev, experience: prev.experience.map(ex => ex.id === exp.id ? { ...ex, bullets: ex.bullets.filter((_, bi) => bi !== i) } : ex) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={13} color="#FF4B4B" /></button>
                      </div>
                    ))}
                    <button onClick={() => setEditData(prev => ({ ...prev, experience: prev.experience.map(ex => ex.id === exp.id ? { ...ex, bullets: [...ex.bullets, ''] } : ex) }))} className="flex items-center gap-1 mt-1 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1CB0F6', fontSize: 12 }}>
                      <Plus size={12} color="#1CB0F6" />Add bullet
                    </button>
                  </div>
                  <button onClick={() => setEditData(prev => ({ ...prev, experience: prev.experience.filter(ex => ex.id !== exp.id) }))} className="flex items-center gap-1 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF4B4B', fontSize: 12 }}>
                    <Trash2 size={13} />Remove experience
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{exp.role}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-gray)', marginTop: 2 }}>{exp.company}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{exp.dateRange}</div>
                      <div className="mt-1 rounded-full px-2 py-0.5 inline-block" style={{ fontSize: 11, backgroundColor: '#E8F7FF', color: '#1CB0F6' }}>{exp.type}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-2">
                    {exp.bullets.map((b, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="rounded-full flex-shrink-0 mt-1.5" style={{ width: 5, height: 5, backgroundColor: '#FFC800' }} />
                        <span style={{ fontSize: 13, color: 'var(--text-gray)', lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={() => handleEnhanceExperience(exp.id, exp.bullets)}
                disabled={!!aiEnhancing[`exp-${exp.id}`]}
                className="flex items-center gap-1.5 mb-3 font-semibold"
                style={{ background: 'none', border: 'none', cursor: aiEnhancing[`exp-${exp.id}`] ? 'wait' : 'pointer', color: '#FFC800', fontSize: 13, opacity: aiEnhancing[`exp-${exp.id}`] ? 0.6 : 1 }}
              >
                <Zap size={14} />{aiEnhancing[`exp-${exp.id}`] ? 'Enhancing...' : '✦ Improve with AI'}
              </button>
              {idx < editData.experience.length - 1 && !isEditMode && <div className="mb-4" style={{ height: 1, backgroundColor: 'var(--border)' }} />}
            </div>
          ))}
          {isEditMode && (
            addingSection === 'experience' ? (
              <div className="rounded-xl p-3 mt-2" style={{ backgroundColor: 'var(--bg)', border: '1.5px dashed #FFC800' }}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[['role', 'Role / Title'], ['company', 'Company'], ['type', 'Type'], ['dateRange', 'Date Range']].map(([field, placeholder]) => (
                    <input key={field} value={newItemDraft[field] ?? ''} onChange={e => setNewItemDraft(prev => ({ ...prev, [field]: e.target.value }))} placeholder={placeholder} className="rounded-lg px-3 py-1.5" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }} />
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { if (!newItemDraft.role) return; setEditData(prev => ({ ...prev, experience: [...prev.experience, { id: `exp-${Date.now()}`, role: newItemDraft.role ?? '', company: newItemDraft.company ?? '', type: newItemDraft.type ?? '', dateRange: newItemDraft.dateRange ?? '', bullets: [] }] })); setAddingSection(null); setNewItemDraft({}); }} className="rounded-lg px-3 py-1.5 font-bold" style={{ fontSize: 13, backgroundColor: '#FFC800', color: '#1A1A1A', border: 'none', cursor: 'pointer' }}>Add</button>
                  <button onClick={() => { setAddingSection(null); setNewItemDraft({}); }} className="rounded-lg px-3 py-1.5" style={{ fontSize: 13, backgroundColor: 'var(--bg-card)', color: 'var(--text-gray)', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingSection('experience')} className="flex items-center gap-2 mt-2 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFC800', fontSize: 13 }}>
                <Plus size={16} color="#FFC800" />Add Experience
              </button>
            )
          )}
          {!isEditMode && (
            <button className="flex items-center gap-2 mt-2 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFC800', fontSize: 13 }}
              onClick={() => { setIsEditMode(true); setAddingSection('experience'); }}>
              <Plus size={16} color="#FFC800" />Add Experience
            </button>
          )}
        </AccordionSection>

        {/* Education */}
        <AccordionSection id="education" title="Education" icon={GraduationCap} expanded={expandedSections.includes('education')} onToggle={toggleSection} delay={0.24}>
          {editData.education.map((edu, idx) => (
            <div key={edu.institution}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{edu.institution}</div>
              <div style={{ fontSize: 13, color: 'var(--text-gray)', marginTop: 2 }}>{edu.degree} — {edu.field}</div>
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{edu.dateRange}</span>
                <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{edu.grade}</span>
              </div>
              {idx < editData.education.length - 1 && <div className="my-3" style={{ height: 1, backgroundColor: 'var(--border)' }} />}
            </div>
          ))}
        </AccordionSection>

        {/* Certifications */}
        <AccordionSection id="certifications" title="Certifications" icon={Award} expanded={expandedSections.includes('certifications')} onToggle={toggleSection} delay={0.30}>
          {editData.certifications.map((cert, idx) => (
            <div key={`${cert.name}-${idx}`} className="flex justify-between items-center py-2.5" style={{ borderBottom: idx < editData.certifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <div className="flex gap-2">
                    <input value={cert.name} onChange={e => setEditData(prev => ({ ...prev, certifications: prev.certifications.map((c, ci) => ci === idx ? { ...c, name: e.target.value } : c) }))} placeholder="Certification name" className="flex-1 rounded-lg px-2 py-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                    <input value={cert.issuer} onChange={e => setEditData(prev => ({ ...prev, certifications: prev.certifications.map((c, ci) => ci === idx ? { ...c, issuer: e.target.value } : c) }))} placeholder="Issuer" className="w-28 rounded-lg px-2 py-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                    <input value={cert.date} onChange={e => setEditData(prev => ({ ...prev, certifications: prev.certifications.map((c, ci) => ci === idx ? { ...c, date: e.target.value } : c) }))} placeholder="Date" className="w-24 rounded-lg px-2 py-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                    <button onClick={() => setEditData(prev => ({ ...prev, certifications: prev.certifications.filter((_, ci) => ci !== idx) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={14} color="#FF4B4B" /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{cert.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-gray)' }}>{cert.issuer}</div>
                  </>
                )}
              </div>
              {!isEditMode && <span style={{ fontSize: 13, color: 'var(--text-light)', flexShrink: 0, marginLeft: 8 }}>{cert.date}</span>}
            </div>
          ))}
          {isEditMode && (
            addingSection === 'cert' ? (
              <div className="flex gap-2 mt-3 flex-wrap">
                {[['cert_name', 'Certification name'], ['cert_issuer', 'Issuer'], ['cert_date', 'Date']].map(([field, placeholder]) => (
                  <input key={field} value={newItemDraft[field] ?? ''} onChange={e => setNewItemDraft(prev => ({ ...prev, [field]: e.target.value }))} placeholder={placeholder} className="rounded-lg px-2 py-1.5 flex-1" style={{ fontSize: 13, border: '1.5px dashed #FFC800', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', minWidth: 80 }} />
                ))}
                <button onClick={() => { if (!newItemDraft.cert_name) return; setEditData(prev => ({ ...prev, certifications: [...prev.certifications, { name: newItemDraft.cert_name ?? '', issuer: newItemDraft.cert_issuer ?? '', date: newItemDraft.cert_date ?? '' }] })); setAddingSection(null); setNewItemDraft({}); }} className="rounded-lg px-3 py-1.5 font-bold" style={{ fontSize: 13, backgroundColor: '#FFC800', color: '#1A1A1A', border: 'none', cursor: 'pointer' }}>Add</button>
                <button onClick={() => { setAddingSection(null); setNewItemDraft({}); }} className="rounded-lg px-3 py-1.5" style={{ fontSize: 13, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-gray)', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setAddingSection('cert')} className="flex items-center gap-2 mt-3 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFC800', fontSize: 13 }}>
                <Plus size={16} color="#FFC800" />Add Certification
              </button>
            )
          )}
        </AccordionSection>

        {/* Awards */}
        <AccordionSection id="awards" title="Awards" icon={Trophy} expanded={expandedSections.includes('awards')} onToggle={toggleSection} delay={0.36}>
          {editData.awards.map((award, idx) => (
            <div key={`${award.name}-${idx}`} className="flex justify-between items-center py-2.5" style={{ borderBottom: idx < editData.awards.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <div className="flex gap-2">
                    <input value={award.name} onChange={e => setEditData(prev => ({ ...prev, awards: prev.awards.map((a, ai) => ai === idx ? { ...a, name: e.target.value } : a) }))} placeholder="Award name" className="flex-1 rounded-lg px-2 py-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                    <input value={award.issuer} onChange={e => setEditData(prev => ({ ...prev, awards: prev.awards.map((a, ai) => ai === idx ? { ...a, issuer: e.target.value } : a) }))} placeholder="Issuer" className="w-28 rounded-lg px-2 py-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                    <input value={award.date} onChange={e => setEditData(prev => ({ ...prev, awards: prev.awards.map((a, ai) => ai === idx ? { ...a, date: e.target.value } : a) }))} placeholder="Year" className="w-20 rounded-lg px-2 py-1" style={{ fontSize: 13, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} />
                    <button onClick={() => setEditData(prev => ({ ...prev, awards: prev.awards.filter((_, ai) => ai !== idx) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={14} color="#FF4B4B" /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{award.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-gray)' }}>{award.issuer}</div>
                  </>
                )}
              </div>
              {!isEditMode && <span style={{ fontSize: 13, color: 'var(--text-light)', flexShrink: 0, marginLeft: 8 }}>{award.date}</span>}
            </div>
          ))}
          {isEditMode && (
            addingSection === 'award' ? (
              <div className="flex gap-2 mt-3 flex-wrap">
                {[['award_name', 'Award name'], ['award_issuer', 'Issuer'], ['award_date', 'Year']].map(([field, placeholder]) => (
                  <input key={field} value={newItemDraft[field] ?? ''} onChange={e => setNewItemDraft(prev => ({ ...prev, [field]: e.target.value }))} placeholder={placeholder} className="rounded-lg px-2 py-1.5 flex-1" style={{ fontSize: 13, border: '1.5px dashed #FFC800', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', minWidth: 80 }} />
                ))}
                <button onClick={() => { if (!newItemDraft.award_name) return; setEditData(prev => ({ ...prev, awards: [...prev.awards, { name: newItemDraft.award_name ?? '', issuer: newItemDraft.award_issuer ?? '', date: newItemDraft.award_date ?? '' }] })); setAddingSection(null); setNewItemDraft({}); }} className="rounded-lg px-3 py-1.5 font-bold" style={{ fontSize: 13, backgroundColor: '#FFC800', color: '#1A1A1A', border: 'none', cursor: 'pointer' }}>Add</button>
                <button onClick={() => { setAddingSection(null); setNewItemDraft({}); }} className="rounded-lg px-3 py-1.5" style={{ fontSize: 13, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-gray)', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setAddingSection('award')} className="flex items-center gap-2 mt-3 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFC800', fontSize: 13 }}>
                <Plus size={16} color="#FFC800" />Add Award
              </button>
            )
          )}
        </AccordionSection>

        {/* App Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.35 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>App Settings</div>

          {/* Dark mode */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
                {isDark ? <Sun size={18} color="#FFC800" /> : <Moon size={18} color="#FFC800" />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Switch to {isDark ? 'light' : 'dark'} theme</div>
              </div>
            </div>
            <Toggle on={isDark} onChange={() => { haptic('light'); toggle(); }} />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
                <Bell size={18} color="#FFC800" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Smart Notifications</div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Get job match alerts</div>
              </div>
            </div>
            <Toggle on={notifications} onChange={() => setNotifications(n => !n)} />
          </div>

          {/* Danger zone */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => { if (confirm('Clear all app data?')) { localStorage.clear(); router.push('/login'); } }} className="font-semibold uppercase hover:underline block" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF4B4B', fontSize: 12, letterSpacing: '0.5px', marginBottom: 12 }}>
              Clear App Data
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl font-bold" style={{ height: 44, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>
              <LogOut size={18} />Sign Out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // ── Resume Tab Content ────────────────────────────────────────────────────

  const ResumeTabContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="resume-tab"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="mt-6"
      >
        {/* Sub-tabs */}
        <div className="flex gap-2 mb-6">
          {(['foundation', 'tailored'] as const).map(sub => (
            <button
              key={sub}
              onClick={() => setResumeSubTab(sub)}
              className="rounded-full px-4 py-2 font-semibold capitalize"
              style={{
                fontSize: 13,
                cursor: 'pointer',
                border: resumeSubTab === sub ? 'none' : '1px solid var(--border)',
                backgroundColor: resumeSubTab === sub ? '#FFC800' : 'var(--bg)',
                color: resumeSubTab === sub ? '#1A1A1A' : 'var(--text-gray)',
              }}
            >
              {sub}
            </button>
          ))}
        </div>

        {resumeSubTab === 'foundation' ? (
          <>
            <ResumePreview profile={editData} />
            <div className="flex gap-3 mt-4 pb-8 flex-wrap">
              <button onClick={() => window.print()} className="rounded-xl font-semibold px-4 py-2.5" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>
                Export PDF
              </button>
              <button onClick={() => showToast('Profile link copied!')} className="rounded-xl font-semibold px-4 py-2.5" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>
                Share Link
              </button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push('/jobs')} className="rounded-xl font-bold px-4 py-2.5" style={{ backgroundColor: '#FFC800', color: '#1A1A1A', fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 3px 0 #CC9F00' }}>
                Create Tailored →
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-12 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-full bg-[#FFF8E1] border-2 border-[#FFC800] flex items-center justify-center mb-4">
              <span style={{ fontSize: 32 }}>☕</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No tailored resume yet</div>
            <p className="text-center mb-6 max-w-xs" style={{ fontSize: 14, color: 'var(--text-gray)', lineHeight: 1.6 }}>
              Browse jobs and click &apos;Tailor Resume&apos; to create a role-specific version.
            </p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push('/jobs')} className="rounded-xl font-bold px-6 py-3" style={{ backgroundColor: '#FFC800', color: '#1A1A1A', fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 3px 0 #CC9F00' }}>
              Browse Jobs →
            </motion.button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar />

      {/* ── Desktop layout ── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_300px] lg:ml-[220px] min-h-screen w-full">
        {/* Center column */}
        <div className="flex flex-col p-8 overflow-y-auto">
          <TabSwitcher className="mb-0" />
          <ProfileHeader />
          {activeTab === 'profile' ? <ProfileTabContent /> : <ResumeTabContent />}
        </div>

        {/* Right panel */}
        <div className="flex flex-col p-8 gap-4 overflow-y-auto sticky top-0 h-screen" style={{ borderLeft: '1px solid var(--border)' }}>
          <RightPanel />
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex flex-col lg:hidden w-full pb-24">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-4" style={{ height: 56, backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#FFC800' }}>Cari</span>
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {isDark ? <Sun size={20} color="#FFC800" /> : <Moon size={20} color="#FFC800" />}
          </button>
        </div>

        <ProfileHeader mobile />

        {/* Mobile right panel cards */}
        <ProfileHealthCard />
        <div className="mx-4 mb-4"><CuppyTipCard /></div>
        <div className="mx-4 mb-4"><QuickActionsCard onAction={showToast} fullName={editData.personal.fullName} /></div>

        {/* Tab switcher */}
        <div className="mx-4 mb-4">
          <TabSwitcher />
        </div>

        {/* Tab content */}
        <div className="mx-4">
          {activeTab === 'profile' ? <ProfileTabContent /> : <ResumeTabContent />}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] rounded-full px-5 py-2.5 font-semibold text-sm shadow-lg"
            style={{ backgroundColor: '#1A1A1A', color: 'white', whiteSpace: 'nowrap' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
