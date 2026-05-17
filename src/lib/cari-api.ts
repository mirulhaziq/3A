import type { AnalysisResult } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CARI_API_URL ?? 'http://localhost:3001/api/v1';

export type UserRole = 'JOB_SEEKER' | 'COMPANY';
export type ApplicationStatus =
  | 'APPLIED'
  | 'VIEWED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'OFFER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  targetRole: string | null;
  onboarded: boolean;
  xp: number;
  streak: number;
  level: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  tokenType: string;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession | null;
  company?: { id: string; name: string } | null;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  avatarUrl: string | null;
  targetRole: string | null;
  profileData: Record<string, unknown>;
  onboarded: boolean;
  xp: number;
  streak: number;
  level: string;
  atsScore: number;
  skillMatch: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobResponse {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  postedDate: string;
  isActive: boolean;
}

export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyId: string;
  userId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  appliedDate: string;
  status: ApplicationStatus;
  tailoredResumeId: string | null;
  coverNote: string | null;
  updatedAt: string;
}

export interface CompanyResponse {
  id: string;
  ownerId: string;
  name: string;
  logoUrl: string | null;
  industry: string;
  size: string;
  description: string;
  website: string;
  credibilityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDashboardResponse {
  company: {
    id: string;
    name: string;
    industry: string;
    size: string;
    credibilityScore: number;
  };
  stats: {
    activeJobs: number;
    inactiveJobs: number;
    totalApplications: number;
    viewedApplications: number;
    interviewApplications: number;
    offerApplications: number;
  };
  recentApplications: ApplicationResponse[];
}

export interface CompanyPortalJobResponse {
  id: string;
  title: string;
  location: string;
  workMode: JobResponse['workMode'];
  type: JobResponse['type'];
  salaryMin: number;
  salaryMax: number;
  currency: string;
  isActive: boolean;
  postedDate: string;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const ACCESS_TOKEN_KEY = 'cari_access_token';
const REFRESH_TOKEN_KEY = 'cari_refresh_token';
const USER_KEY = 'cari_user';

export const cariAuth = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setSession(session: AuthSession, user: AuthUser): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = cariAuth.getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? `Request failed with ${response.status}`);
  }

  if (payload.data === undefined) {
    throw new Error('API response did not include data.');
  }

  return payload.data;
}

export const cariApi = {
  async register(input: {
    email: string;
    password: string;
    role: UserRole;
    fullName?: string;
    companyName?: string;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async me(): Promise<{ user: AuthUser }> {
    return apiRequest<{ user: AuthUser }>('/auth/me');
  },
  async getProfile(): Promise<{ profile: UserProfileResponse }> {
    return apiRequest<{ profile: UserProfileResponse }>('/profile/me');
  },
  async updateProfile(
    input: Partial<UserProfileResponse>
  ): Promise<{ profile: UserProfileResponse }> {
    return apiRequest<{ profile: UserProfileResponse }>('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  async listJobs(): Promise<{
    jobs: JobResponse[];
    pagination: { limit: number; offset: number; count: number };
  }> {
    return apiRequest('/jobs');
  },
  async applyToJob(jobId: string): Promise<{ application: ApplicationResponse }> {
    return apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  },
  async listApplications(): Promise<{
    applications: ApplicationResponse[];
    pagination: { limit: number; offset: number; count: number };
  }> {
    return apiRequest('/applications');
  },
  async analyse(input: {
    cvText: string;
    jobDescription: string;
    jobId?: string | null;
  }): Promise<{
    analysis: {
      id: string;
      jobId: string | null;
      model: string;
      result: AnalysisResult;
      createdAt: string;
    };
  }> {
    return apiRequest('/analysis', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async generateResume(input: {
    title: string;
    profileData?: Record<string, unknown>;
    baseResumeText?: string;
    jobDescription?: string;
    jobId?: string | null;
  }): Promise<{ resume: unknown }> {
    return apiRequest('/resumes/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async upsertCompany(input: {
    name: string;
    industry?: string;
    size?: string;
    description?: string;
    website?: string;
    credibilityScore?: number;
  }): Promise<{ company: CompanyResponse }> {
    return apiRequest('/companies/me', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async companyDashboard(): Promise<{ dashboard: CompanyDashboardResponse }> {
    return apiRequest('/company-portal/dashboard');
  },
  async companyJobs(): Promise<{
    jobs: CompanyPortalJobResponse[];
    pagination: { limit: number; offset: number; count: number };
  }> {
    return apiRequest('/company-portal/jobs');
  },
  async getJob(jobId: string): Promise<{ job: JobResponse }> {
    return apiRequest(`/jobs/${jobId}`);
  },
  async createJob(input: {
    title: string;
    location: string;
    workMode: JobResponse['workMode'];
    type: JobResponse['type'];
    salaryMin: number;
    salaryMax: number;
    currency: string;
    description: string;
    requiredSkills: string[];
    niceToHaveSkills: string[];
    isActive: boolean;
  }): Promise<{ job: JobResponse }> {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async updateJob(
    jobId: string,
    input: Partial<{
      title: string;
      location: string;
      workMode: JobResponse['workMode'];
      type: JobResponse['type'];
      salaryMin: number;
      salaryMax: number;
      currency: string;
      description: string;
      requiredSkills: string[];
      niceToHaveSkills: string[];
      isActive: boolean;
    }>
  ): Promise<{ job: JobResponse }> {
    return apiRequest(`/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
  ): Promise<{ application: ApplicationResponse }> {
    return apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  async companyApplicants(jobId: string): Promise<{
    job: CompanyPortalJobResponse;
    applicants: ApplicationResponse[];
    pagination: { limit: number; offset: number; count: number };
  }> {
    return apiRequest(`/company-portal/jobs/${jobId}/applicants`);
  },
};
