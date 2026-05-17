import { ForbiddenError, NotFoundError } from '../middleware/error.middleware';
import { getSupabaseAdmin } from '../lib/supabase';
import type {
  CompanyPortalApplicantsQueryInput,
  CompanyPortalListQueryInput,
} from '../schemas/company-portal.schema';
import type { ApplicationResponse } from './application.service';
import type {
  ApplicationStatus,
  Database,
  JobType,
  WorkMode,
} from '../types/database.types';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface CompanyPortalJob {
  id: string;
  title: string;
  location: string;
  workMode: WorkMode;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  isActive: boolean;
  postedDate: string;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

interface CompanyPortalDashboard {
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

interface CompanyPortalJobsResponse {
  jobs: CompanyPortalJob[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

interface CompanyPortalApplicantsResponse {
  job: CompanyPortalJob;
  applicants: ApplicationResponse[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

async function getCompanyDashboard(
  ownerId: string
): Promise<CompanyPortalDashboard> {
  const company = await requireCompanyForOwner(ownerId);
  const jobs = await getJobsForCompany(company.id);
  const applications = await getApplicationsForJobIds(jobs.map((job) => job.id));
  const recentApplications = await hydrateApplications(
    applications
      .sort((a, b) => b.applied_at.localeCompare(a.applied_at))
      .slice(0, 5)
  );

  return {
    company: {
      id: company.id,
      name: company.name,
      industry: company.industry,
      size: company.size,
      credibilityScore: company.credibility_score,
    },
    stats: {
      activeJobs: jobs.filter((job) => job.is_active).length,
      inactiveJobs: jobs.filter((job) => !job.is_active).length,
      totalApplications: applications.length,
      viewedApplications: countStatus(applications, 'VIEWED'),
      interviewApplications: countStatus(applications, 'INTERVIEW'),
      offerApplications: countStatus(applications, 'OFFER'),
    },
    recentApplications,
  };
}

async function listCompanyPortalJobs(
  ownerId: string,
  input: CompanyPortalListQueryInput
): Promise<CompanyPortalJobsResponse> {
  const company = await requireCompanyForOwner(ownerId);
  const supabase = getSupabaseAdmin();

  const { data, error, count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('company_id', company.id)
    .order('posted_at', { ascending: false })
    .range(input.offset, input.offset + input.limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  const jobs = data ?? [];
  const counts = await getApplicationCountsByJobId(jobs.map((job) => job.id));

  return {
    jobs: jobs.map((job) => mapPortalJob(job, counts.get(job.id) ?? 0)),
    pagination: {
      limit: input.limit,
      offset: input.offset,
      count: count ?? jobs.length,
    },
  };
}

async function listApplicantsForCompanyJob(
  ownerId: string,
  jobId: string,
  input: CompanyPortalApplicantsQueryInput
): Promise<CompanyPortalApplicantsResponse> {
  const company = await requireCompanyForOwner(ownerId);
  const job = await getCompanyJob(company.id, jobId);
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('applications')
    .select('*', { count: 'exact' })
    .eq('job_id', job.id)
    .order('applied_at', { ascending: false })
    .range(input.offset, input.offset + input.limit - 1);

  if (input.status) query = query.eq('status', input.status);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const applicants = await hydrateApplications(data ?? []);
  const totalCount = count ?? applicants.length;

  return {
    job: mapPortalJob(job, totalCount),
    applicants,
    pagination: {
      limit: input.limit,
      offset: input.offset,
      count: totalCount,
    },
  };
}

async function requireCompanyForOwner(ownerId: string): Promise<CompanyRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', ownerId)
    .single();

  if (error) {
    throw new NotFoundError('Company profile not found');
  }

  return data;
}

async function getJobsForCompany(companyId: string): Promise<JobRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function getCompanyJob(
  companyId: string,
  jobId: string
): Promise<JobRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new NotFoundError('Job not found');
  }

  if (data.company_id !== companyId) {
    throw new ForbiddenError('You can only view applicants for your own jobs');
  }

  return data;
}

async function getApplicationsForJobIds(
  jobIds: string[]
): Promise<ApplicationRow[]> {
  if (jobIds.length === 0) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .in('job_id', jobIds);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function getApplicationCountsByJobId(
  jobIds: string[]
): Promise<Map<string, number>> {
  const applications = await getApplicationsForJobIds(jobIds);
  const counts = new Map<string, number>();

  for (const application of applications) {
    counts.set(application.job_id, (counts.get(application.job_id) ?? 0) + 1);
  }

  return counts;
}

async function hydrateApplications(
  applications: ApplicationRow[]
): Promise<ApplicationResponse[]> {
  return Promise.all(applications.map((application) => hydrateApplication(application)));
}

async function hydrateApplication(
  application: ApplicationRow
): Promise<ApplicationResponse> {
  const [job, applicant] = await Promise.all([
    getJobById(application.job_id),
    getProfileById(application.user_id),
  ]);
  const company = await getCompanyById(job.company_id);

  return {
    id: application.id,
    jobId: application.job_id,
    jobTitle: job.title,
    company: company.name,
    companyId: company.id,
    userId: application.user_id,
    applicantName: applicant.full_name,
    applicantEmail: applicant.email,
    appliedDate: application.applied_at,
    status: application.status,
    tailoredResumeId: application.tailored_resume_id,
    coverNote: application.cover_note,
    updatedAt: application.updated_at,
  };
}

async function getJobById(jobId: string): Promise<JobRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw new NotFoundError('Job not found');
  return data;
}

async function getCompanyById(companyId: string): Promise<CompanyRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw new NotFoundError('Company not found');
  return data;
}

async function getProfileById(profileId: string): Promise<ProfileRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) throw new NotFoundError('Profile not found');
  return data;
}

function mapPortalJob(job: JobRow, applicationCount: number): CompanyPortalJob {
  return {
    id: job.id,
    title: job.title,
    location: job.location,
    workMode: job.work_mode,
    type: job.type,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    currency: job.currency,
    isActive: job.is_active,
    postedDate: job.posted_at,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    applicationCount,
  };
}

function countStatus(
  applications: ApplicationRow[],
  status: ApplicationStatus
): number {
  return applications.filter((application) => application.status === status).length;
}

export {
  getCompanyDashboard,
  listApplicantsForCompanyJob,
  listCompanyPortalJobs,
};
export type {
  CompanyPortalApplicantsResponse,
  CompanyPortalDashboard,
  CompanyPortalJobsResponse,
};
