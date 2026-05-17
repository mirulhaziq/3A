import { ForbiddenError, NotFoundError } from '../middleware/error.middleware';
import { getSupabaseAdmin } from '../lib/supabase';
import type {
  CompanyPayloadInput,
  CreateJobInput,
  ListJobsQueryInput,
  UpdateCompanyInput,
  UpdateJobInput,
} from '../schemas/job.schema';
import type { Database, JobType, WorkMode } from '../types/database.types';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];

interface CompanyResponse {
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

interface JobResponse {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  workMode: WorkMode;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  postedDate: string;
  isActive: boolean;
  companyProfile: CompanyResponse | null;
  createdAt: string;
  updatedAt: string;
}

interface JobListResponse {
  jobs: JobResponse[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

async function getCompanyForOwner(
  ownerId: string
): Promise<CompanyResponse | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapCompany(data) : null;
}

async function upsertCompanyForOwner(
  ownerId: string,
  input: CompanyPayloadInput
): Promise<CompanyResponse> {
  const existingCompany = await getCompanyForOwner(ownerId);

  if (existingCompany) {
    return updateCompanyForOwner(ownerId, input);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .insert({
      owner_id: ownerId,
      name: input.name,
      logo_url: input.logoUrl,
      industry: input.industry,
      size: input.size,
      description: input.description,
      website: input.website,
      credibility_score: input.credibilityScore,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCompany(data);
}

async function updateCompanyForOwner(
  ownerId: string,
  input: UpdateCompanyInput
): Promise<CompanyResponse> {
  const existingCompany = await getCompanyForOwner(ownerId);

  if (!existingCompany) {
    throw new NotFoundError('Company profile not found');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .update({
      name: input.name,
      logo_url: input.logoUrl,
      industry: input.industry,
      size: input.size,
      description: input.description,
      website: input.website,
      credibility_score: input.credibilityScore,
    })
    .eq('id', existingCompany.id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCompany(data);
}

async function listJobs(input: ListJobsQueryInput): Promise<JobListResponse> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .order('posted_at', { ascending: false })
    .range(input.offset, input.offset + input.limit - 1);

  if (input.activeOnly) query = query.eq('is_active', true);
  if (input.companyId) query = query.eq('company_id', input.companyId);
  if (input.workMode) query = query.eq('work_mode', input.workMode);
  if (input.type) query = query.eq('type', input.type);
  if (input.q) query = query.ilike('title', `%${input.q}%`);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const jobs = data ?? [];
  const companiesById = await getCompaniesById(
    jobs.map((job) => job.company_id)
  );

  return {
    jobs: jobs.map((job) => mapJob(job, companiesById.get(job.company_id))),
    pagination: {
      limit: input.limit,
      offset: input.offset,
      count: count ?? jobs.length,
    },
  };
}

async function getJobById(jobId: string): Promise<JobResponse> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new NotFoundError('Job not found');
  }

  const company = await getCompanyById(data.company_id);
  return mapJob(data, company);
}

async function createJobForCompanyOwner(
  ownerId: string,
  input: CreateJobInput
): Promise<JobResponse> {
  const company = await getCompanyForOwner(ownerId);

  if (!company) {
    throw new NotFoundError('Create a company profile before posting jobs');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: company.id,
      title: input.title,
      location: input.location,
      work_mode: input.workMode,
      type: input.type,
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      currency: input.currency,
      description: input.description,
      required_skills: input.requiredSkills,
      nice_to_have_skills: input.niceToHaveSkills,
      is_active: input.isActive,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapJob(data, company);
}

async function updateJobForCompanyOwner(
  ownerId: string,
  jobId: string,
  input: UpdateJobInput
): Promise<JobResponse> {
  const company = await getCompanyForOwner(ownerId);

  if (!company) {
    throw new NotFoundError('Company profile not found');
  }

  const existingJob = await getJobRowById(jobId);

  if (existingJob.company_id !== company.id) {
    throw new ForbiddenError('You can only update your own company jobs');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('jobs')
    .update({
      title: input.title,
      location: input.location,
      work_mode: input.workMode,
      type: input.type,
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      currency: input.currency,
      description: input.description,
      required_skills: input.requiredSkills,
      nice_to_have_skills: input.niceToHaveSkills,
      is_active: input.isActive,
    })
    .eq('id', jobId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapJob(data, company);
}

async function deleteJobForCompanyOwner(
  ownerId: string,
  jobId: string
): Promise<void> {
  const company = await getCompanyForOwner(ownerId);

  if (!company) {
    throw new NotFoundError('Company profile not found');
  }

  const existingJob = await getJobRowById(jobId);

  if (existingJob.company_id !== company.id) {
    throw new ForbiddenError('You can only delete your own company jobs');
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);

  if (error) {
    throw new Error(error.message);
  }
}

async function getJobRowById(jobId: string): Promise<JobRow> {
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

async function getCompanyById(
  companyId: string
): Promise<CompanyResponse | null> {
  const companies = await getCompaniesById([companyId]);
  return companies.get(companyId) ?? null;
}

async function getCompaniesById(
  companyIds: string[]
): Promise<Map<string, CompanyResponse>> {
  const uniqueCompanyIds = [...new Set(companyIds)];
  const companiesById = new Map<string, CompanyResponse>();

  if (uniqueCompanyIds.length === 0) {
    return companiesById;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .in('id', uniqueCompanyIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const company of data ?? []) {
    companiesById.set(company.id, mapCompany(company));
  }

  return companiesById;
}

function mapCompany(row: CompanyRow): CompanyResponse {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    logoUrl: row.logo_url,
    industry: row.industry,
    size: row.size,
    description: row.description,
    website: row.website,
    credibilityScore: row.credibility_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapJob(
  row: JobRow,
  company: CompanyResponse | null | undefined
): JobResponse {
  return {
    id: row.id,
    title: row.title,
    company: company?.name ?? '',
    companyId: row.company_id,
    location: row.location,
    workMode: row.work_mode,
    type: row.type,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    currency: row.currency,
    description: row.description,
    requiredSkills: row.required_skills,
    niceToHaveSkills: row.nice_to_have_skills,
    postedDate: row.posted_at,
    isActive: row.is_active,
    companyProfile: company ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export {
  createJobForCompanyOwner,
  deleteJobForCompanyOwner,
  getCompanyForOwner,
  getJobById,
  listJobs,
  updateCompanyForOwner,
  updateJobForCompanyOwner,
  upsertCompanyForOwner,
};
export type { CompanyResponse, JobListResponse, JobResponse };
