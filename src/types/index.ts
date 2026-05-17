export type UserLevel =
  'NEWCOMER' | 'TRAINEE' | 'PILOT' | 'EXPERT' | 'HIRED';

export type CuppyState =
  'idle' | 'happy' | 'judgy' | 'thinking' | 'celebrate';

export type NodeStatus =
  'completed' | 'in-progress' | 'available' | 'locked';

export interface User {
  name: string;
  targetRole: string;
  skills: string[];
  cvFileName: string | null;
  githubUsername: string | null;
  xp: number;
  streak: number;
  level: UserLevel;
  onboarded: boolean;
  atsScore: number;
  skillMatch: number;
}

export interface AnalysisStrength {
  title: string;
  description: string;
}

export interface AnalysisGap {
  title: string;
  fix: string;
}

export interface CVFix {
  original: string;
  rewritten: string;
}

export interface AnalysisResult {
  matchScore: number;
  label: 'Strong Match' | 'Close Match' | 'Not Ready Yet';
  cuppyState: CuppyState;
  verdict: string;
  strengths: AnalysisStrength[];
  gaps: AnalysisGap[];
  cvFixes: CVFix[];
  missingKeywords: string[];
  presentKeywords: string[];
}

export interface RoadmapNode {
  id: string;
  label: string;
  status: NodeStatus;
  phase: 'Foundation' | 'Core Development' | 'Advanced Mastery' | 'Job Ready';
  description: string;
  resources: {
    title: string;
    platform: string;
    url: string;
  }[];
  x: number;
  y: number;
  parentIds: string[];
}

export interface Quest {
  id: string;
  label: string;
  xp: number;
  completed: boolean;
}

export interface OnboardingState {
  step: number;
  name: string;
  targetRole: string;
  skills: string[];
  cvFileName: string | null;
  githubUsername: string | null;
}
