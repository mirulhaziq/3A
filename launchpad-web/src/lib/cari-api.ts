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
  source?: 'supabase' | 'jsearch';
  externalId?: string;
  applyUrl?: string | null;
  employerLogo?: string | null;
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

export interface GeneratedResume {
  metadata: {
    title: string;
    targetRole: string | null;
    tailoredForJob: boolean;
    keywords: string[];
    templateId?: string;
    matchScore?: number;
    atsOptimized?: boolean;
    company?: string | null;
    jobTitle?: string | null;
  };
  personal: {
    fullName: string;
    location: string | null;
    phone: string | null;
    email: string | null;
    linkedin: string | null;
    github: string | null;
  };
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    toolsAndPlatforms: string[];
    softSkills: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    type: string | null;
    startDate: string | null;
    endDate: string | null;
    current: boolean;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description: string | null;
    techStack: string[];
    bullets: string[];
    repoUrl: string | null;
    liveUrl: string | null;
  }>;
  education: Array<{
    institution: string;
    degree: string | null;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    grade: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string | null;
    date: string | null;
  }>;
  awards: Array<{
    title: string;
    issuer: string | null;
    year: string | null;
  }>;
  extracurricular: Array<{
    title: string;
    organization: string | null;
    date: string | null;
    bullets: string[];
  }>;
}

export interface SavedResumeResponse {
  id: string;
  jobId: string | null;
  title: string;
  model: string;
  resume: GeneratedResume;
  applicationStatus: ApplicationStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubSnapshot {
  username: string;
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    url: string;
    avatarUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
    location: string | null;
    blog: string | null;
    company: string | null;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    repoCount: number;
    sourceRepoCount: number;
    forkCount: number;
    totalStars: number;
    totalForks: number;
    recentlyActiveRepoCount: number;
  };
  languages: { name: string; repoCount: number }[];
  topics: { name: string; repoCount: number }[];
  topRepositories: Array<{
    id: number;
    name: string;
    fullName: string;
    url: string;
    description: string | null;
    fork: boolean;
    primaryLanguage: string | null;
    stars: number;
    forks: number;
    watchers: number;
    topics: string[];
    pushedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  fetchedAt: string;
}

export interface SavedGitHubSnapshot {
  id: string;
  snapshot: GitHubSnapshot;
  fetchedAt: string;
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

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem(REFRESH_TOKEN_KEY)
    : null;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (await res.json()) as ApiEnvelope<AuthSession>;
    if (!res.ok || !payload.success || !payload.data) return null;
    // Update stored tokens; preserve existing user object
    const user = cariAuth.getUser();
    if (user) cariAuth.setSession(payload.data, user);
    else {
      localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);
    }
    return payload.data.accessToken;
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  _retry = true
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = cariAuth.getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Auto-refresh on 401 and retry once
  if (response.status === 401 && _retry) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return apiRequest<T>(path, options, false);
    }
    // Refresh failed — clear session so UI redirects to login
    cariAuth.clear();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

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
  async searchExternalJobs(input: {
    query?: string;
    country?: string;
    datePosted?: 'all' | 'today' | '3days' | 'week' | 'month';
    numPages?: number;
  } = {}): Promise<{ jobs: JobResponse[]; provider: 'jsearch'; query: string }> {
    const params = new URLSearchParams();
    if (input.query) params.set('query', input.query);
    if (input.country) params.set('country', input.country);
    if (input.datePosted) params.set('datePosted', input.datePosted);
    if (input.numPages !== undefined) params.set('numPages', String(input.numPages));
    const query = params.toString();
    return apiRequest(`/jobs/external/search${query ? `?${query}` : ''}`);
  },
  async applyToJob(
    jobId: string,
    tailoredResumeId?: string | null
  ): Promise<{ application: ApplicationResponse }> {
    return apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, tailoredResumeId }),
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
  }): Promise<{ resume: SavedResumeResponse }> {
    return apiRequest('/resumes/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async listResumes(input: {
    q?: string;
    jobId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    resumes: SavedResumeResponse[];
    pagination: { limit: number; offset: number; count: number };
  }> {
    const params = new URLSearchParams();
    if (input.q) params.set('q', input.q);
    if (input.jobId) params.set('jobId', input.jobId);
    if (input.limit !== undefined) params.set('limit', String(input.limit));
    if (input.offset !== undefined) params.set('offset', String(input.offset));
    const query = params.toString();
    return apiRequest(`/resumes${query ? `?${query}` : ''}`);
  },
  async getResume(resumeId: string): Promise<{ resume: SavedResumeResponse }> {
    return apiRequest(`/resumes/${resumeId}`);
  },
  async updateResume(
    resumeId: string,
    input: { title?: string; resume?: GeneratedResume }
  ): Promise<{ resume: SavedResumeResponse }> {
    return apiRequest(`/resumes/${resumeId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  async parseResume(file: File): Promise<{
    parsed: { rawText: string; resume: GeneratedResume; templateId: string };
  }> {
    const formData = new FormData();
    formData.set('cv', file);

    const token = cariAuth.getAccessToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}/resumes/parse`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<{
      parsed: { rawText: string; resume: GeneratedResume; templateId: string };
    }>;

    if (!response.ok || !payload.success || payload.data === undefined) {
      throw new Error(payload.error ?? `Request failed with ${response.status}`);
    }

    return payload.data;
  },
  async scrapeGitHub(input: {
    username: string;
    includeForks?: boolean;
    maxRepos?: number;
  }): Promise<{ github: SavedGitHubSnapshot }> {
    return apiRequest('/github/scrape', {
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
  async trackExternalApplication(input: {
    jobTitle: string;
    company: string;
    applyUrl: string;
    location?: string;
  }): Promise<void> {
    await apiRequest('/applications/external', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async generateCustomRoadmap(input: {
    role: string;
  }): Promise<{ phases: import('@/lib/roadmap-data').RoadmapPhase[] }> {
    return apiRequest('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async getSkillResources(input: {
    skillId: string;
    skillLabel: string;
    role: string;
    description?: string;
  }): Promise<{ resources: Array<{ label: string; url: string }> }> {
    return apiRequest('/roadmap/skill-resources', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async enhanceBullets(input: {
    bullets: string[];
    jobDescription?: string;
  }): Promise<{
    suggestions: Array<{ id: string; original: string; enhanced: string }>;
  }> {
    return apiRequest('/resumes/enhance-bullets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async enhanceSection(input: {
    sectionType: 'summary' | 'experience_bullets' | 'project_bullets';
    content: string | string[];
    context?: string;
  }): Promise<{ enhanced: string | string[] }> {
    return apiRequest('/resumes/enhance-section', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async importFromCv(): Promise<{
    parsed: { rawText: string; resume: GeneratedResume; templateId: string };
  }> {
    return apiRequest('/resumes/import-from-cv', { method: 'POST' });
  },
};
