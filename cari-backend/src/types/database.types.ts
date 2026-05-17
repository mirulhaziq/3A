export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'JOB_SEEKER' | 'COMPANY';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
export type ApplicationStatus =
  | 'APPLIED'
  | 'VIEWED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'OFFER';
export type AnalysisLabel = 'Strong Match' | 'Close Match' | 'Not Ready Yet';
export type CuppyState =
  | 'idle'
  | 'happy'
  | 'judgy'
  | 'thinking'
  | 'celebrate';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          target_role: string | null;
          profile_data: Json;
          onboarded: boolean;
          xp: number;
          streak: number;
          level: string;
          ats_score: number;
          skill_match: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          target_role?: string | null;
          profile_data?: Json;
          onboarded?: boolean;
          xp?: number;
          streak?: number;
          level?: string;
          ats_score?: number;
          skill_match?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          logo_url: string | null;
          industry: string;
          size: string;
          description: string;
          website: string;
          credibility_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          logo_url?: string | null;
          industry?: string;
          size?: string;
          description?: string;
          website?: string;
          credibility_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          location: string;
          work_mode: WorkMode;
          type: JobType;
          salary_min: number;
          salary_max: number;
          currency: string;
          description: string;
          required_skills: string[];
          nice_to_have_skills: string[];
          is_active: boolean;
          posted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          location: string;
          work_mode: WorkMode;
          type: JobType;
          salary_min: number;
          salary_max: number;
          currency?: string;
          description: string;
          required_skills?: string[];
          nice_to_have_skills?: string[];
          is_active?: boolean;
          posted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          tailored_resume_id: string | null;
          status: ApplicationStatus;
          cover_note: string | null;
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          tailored_resume_id?: string | null;
          status?: ApplicationStatus;
          cover_note?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['applications']['Insert']>;
        Relationships: [];
      };
      analysis_results: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          match_score: number;
          label: AnalysisLabel;
          cuppy_state: CuppyState;
          result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id?: string | null;
          match_score: number;
          label: AnalysisLabel;
          cuppy_state: CuppyState;
          result: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['analysis_results']['Insert']>;
        Relationships: [];
      };
      generated_resumes: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          title: string;
          resume_json: Json;
          model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id?: string | null;
          title: string;
          resume_json: Json;
          model: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['generated_resumes']['Insert']>;
        Relationships: [];
      };
      github_snapshots: {
        Row: {
          id: string;
          user_id: string;
          github_username: string;
          data: Json;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          github_username: string;
          data: Json;
          fetched_at?: string;
        };
        Update: Partial<Database['public']['Tables']['github_snapshots']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      health_check: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      work_mode: WorkMode;
      job_type: JobType;
      application_status: ApplicationStatus;
      analysis_label: AnalysisLabel;
      cuppy_state: CuppyState;
    };
    CompositeTypes: Record<string, never>;
  };
}
