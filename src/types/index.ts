export interface User {
  id: string;
  email: string;
}

export interface ResumeSection {
  name: string;
  score: number;
  issues: string[];
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
  improvement: number;
  needs_retry: boolean;
}

export interface ResumeAnalysis {
  ats_score: number;
  section_scores: ResumeSection[];
  rewrites: BulletRewrite[];
  keyword_gaps: string[];
  overall_verdict: string;
}

export type SkillCategory = 'technical' | 'tool' | 'soft' | 'domain';

export interface Skill {
  name: string;
  category: SkillCategory;
  user_score: number;
  benchmark_score: number;
  gap: number;
}

export interface SkillGapResult {
  compatibility_pct: number;
  skills: Skill[];
  top_gaps: Skill[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'free' | 'paid' | 'hands_on';
}

export interface RoadmapWeek {
  week_number: number;
  skill_focus: string;
  daily_time_minutes: number;
  resources: Resource[];
  milestone_project: string | null;
}

export type ApplicationStatus =
  | 'submitted'
  | 'followed_up'
  | 'interviewing'
  | 'offered'
  | 'rejected';

export interface Application {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  jd_url: string;
  applied_at: string;
  status: ApplicationStatus;
  tailored_cv_id?: string;
  followup_7_sent: boolean;
  followup_14_sent: boolean;
}

export interface OnboardingMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RealityCheckReport {
  ats_score: number;
  realistic_timeline_weeks: number;
  top_blockers: string[];
  priority_actions: string[];
  overall_assessment: string;
}

export interface SkillGap {
  name: string;
  category: SkillCategory;
  gap: number;
  benchmark_score: number;
}

export interface JobDescription {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string;
  seniority_level: string;
  salary_range: string;
  raw_text: string;
  structured_data: {
    required_skills: string[];
    preferred_skills: string[];
    responsibilities: string[];
    about_company: string;
  };
  source_url: string;
  source_site: string;
  capture_method: 'dom_text' | 'screenshot';
  compatibility_pct: number;
  applied: boolean;
  created_at: string;
}
