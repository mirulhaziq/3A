import { ForbiddenError, NotFoundError } from '../middleware/error.middleware';
import { getSupabaseAdmin } from '../lib/supabase';
import type {
  ApplyToJobInput,
  ListApplicationsQueryInput,
  UpdateApplicationStatusInput,
} from '../schemas/application.schema';
import type {
  ApplicationStatus,
  Database,
  UserRole,
} from '../types/database.types';

type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];
type CompanyRow = Database['public']['Tables']['companies']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface ApplicationResponse {
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

interface ApplicationListResponse {
  applications: ApplicationResponse[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

async function applyToJob(
  userId: string,
  input: ApplyToJobInput
): Promise<ApplicationResponse> {
  const supabase = getSupabaseAdmin();
  const job = await getJobRow(input.jobId);

  if (!job.is_active) {
    throw new ForbiddenError('This job is no longer accepting applications');
  }

  if (input.tailoredResumeId) {
    await assertResumeBelongsToUser(userId, input.tailoredResumeId);
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      job_id: input.jobId,
      tailored_resume_id: input.tailoredResumeId ?? null,
      cover_note: input.coverNote ?? null,
      status: 'APPLIED',
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already applied to this job');
    }

    throw new Error(error.message);
  }

  return hydrateApplication(data);
}

async function listApplicationsForRole(
  userId: string,
  role: UserRole,
  input: ListApplicationsQueryInput
): Promise<ApplicationListResponse> {
  if (role === 'COMPANY') {
    return listCompanyApplications(userId, input);
  }

  return listJobSeekerApplications(userId, input);
}

async function updateApplicationStatusForRole(
  userId: string,
  role: UserRole,
  applicationId: string,
  input: UpdateApplicationStatusInput
): Promise<ApplicationResponse> {
  const application = await getApplicationRow(applicationId);

  if (role === 'JOB_SEEKER' && application.user_id !== userId) {
    throw new ForbiddenError('You can only update your own applications');
  }

  if (role === 'COMPANY') {
    await assertCompanyOwnsJob(userId, application.job_id);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('applications')
    .update({ status: input.status })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return hydrateApplication(data);
}

async function listJobSeekerApplications(
  userId: string,
  input: ListApplicationsQueryInput
): Promise<ApplicationListResponse> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('applications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })
    .range(input.offset, input.offset + input.limit - 1);

  if (input.status) query = query.eq('status', input.status);
  if (input.jobId) query = query.eq('job_id', input.jobId);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const applications = await hydrateApplications(data ?? []);

  return {
    applications,
    pagination: {
      limit: input.limit,
      offset: input.offset,
      count: count ?? applications.length,
    },
  };
}

async function listCompanyApplications(
  ownerId: string,
  input: ListApplicationsQueryInput
): Promise<ApplicationListResponse> {
  const company = await getCompanyForOwner(ownerId);

  if (!company) {
    return {
      applications: [],
      pagination: {
        limit: input.limit,
        offset: input.offset,
        count: 0,
      },
    };
  }

  const supabase = getSupabaseAdmin();
  let jobsQuery = supabase
    .from('jobs')
    .select('id')
    .eq('company_id', company.id);

  if (input.jobId) jobsQuery = jobsQuery.eq('id', input.jobId);

  const { data: jobs, error: jobsError } = await jobsQuery;

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  const jobIds = (jobs ?? []).map((job) => job.id);

  if (jobIds.length === 0) {
    return {
      applications: [],
      pagination: {
        limit: input.limit,
        offset: input.offset,
        count: 0,
      },
    };
  }

  let query = supabase
    .from('applications')
    .select('*', { count: 'exact' })
    .in('job_id', jobIds)
    .order('applied_at', { ascending: false })
    .range(input.offset, input.offset + input.limit - 1);

  if (input.status) query = query.eq('status', input.status);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const applications = await hydrateApplications(data ?? []);

  return {
    applications,
    pagination: {
      limit: input.limit,
      offset: input.offset,
      count: count ?? applications.length,
    },
  };
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
    getJobRow(application.job_id),
    getProfileRow(application.user_id),
  ]);
  const company = await getCompanyRow(job.company_id);

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

async function getApplicationRow(applicationId: string): Promise<ApplicationRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (error) {
    throw new NotFoundError('Application not found');
  }

  return data;
}

async function getJobRow(jobId: string): Promise<JobRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new NotFoundError('Job not found');
  }

  return data;
}

async function getCompanyRow(companyId: string): Promise<CompanyRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) {
    throw new NotFoundError('Company not found');
  }

  return data;
}

async function getCompanyForOwner(ownerId: string): Promise<CompanyRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getProfileRow(userId: string): Promise<ProfileRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new NotFoundError('Profile not found');
  }

  return data;
}

async function assertCompanyOwnsJob(
  ownerId: string,
  jobId: string
): Promise<void> {
  const job = await getJobRow(jobId);
  const company = await getCompanyRow(job.company_id);

  if (company.owner_id !== ownerId) {
    throw new ForbiddenError('You can only manage your own company applications');
  }
}

async function assertResumeBelongsToUser(
  userId: string,
  resumeId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('generated_resumes')
    .select('id')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new NotFoundError('Tailored resume not found');
  }
}

export {
  applyToJob,
  listApplicationsForRole,
  updateApplicationStatusForRole,
};
export type { ApplicationListResponse, ApplicationResponse };
