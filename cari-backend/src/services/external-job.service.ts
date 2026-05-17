import axios from 'axios';
import { env } from '../config/env';
import type { ExternalJobSearchQueryInput } from '../schemas/job.schema';
import type { JobType, WorkMode } from '../types/database.types';

interface ExternalJobResponse {
  id: string;
  externalId: string;
  source: 'jsearch';
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
  applyUrl: string | null;
  employerLogo: string | null;
}

interface ExternalJobSearchResponse {
  jobs: ExternalJobResponse[];
  provider: 'jsearch';
  query: string;
}

interface JSearchJob {
  job_id?: unknown;
  job_title?: unknown;
  employer_name?: unknown;
  employer_logo?: unknown;
  job_city?: unknown;
  job_state?: unknown;
  job_country?: unknown;
  job_is_remote?: unknown;
  job_employment_type?: unknown;
  job_min_salary?: unknown;
  job_max_salary?: unknown;
  job_salary_currency?: unknown;
  job_description?: unknown;
  job_required_skills?: unknown;
  job_highlights?: unknown;
  job_posted_at_datetime_utc?: unknown;
  job_apply_link?: unknown;
}

async function searchExternalJobs(
  input: ExternalJobSearchQueryInput
): Promise<ExternalJobSearchResponse> {
  if (!env.RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  const response = await getJSearchResponse(input);

  const jobs = extractJSearchJobs(response.data).map(mapJSearchJob);

  return {
    jobs,
    provider: 'jsearch',
    query: input.query,
  };
}

async function getJSearchResponse(
  input: ExternalJobSearchQueryInput
): Promise<{ data: unknown }> {
  try {
    return await axios.get<unknown>(`${env.JSEARCH_BASE_URL}/search-v2`, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': env.RAPIDAPI_HOST,
      },
      params: {
        query: input.query,
        country: input.country,
        date_posted: input.datePosted,
        num_pages: input.numPages,
      },
      timeout: 15000,
    });
  } catch (error) {
    const externalError = new Error(formatJSearchError(error)) as Error & {
      status: number;
    };
    externalError.status = 502;
    throw externalError;
  }
}

function formatJSearchError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return 'JSearch rejected the RapidAPI credentials. Check RAPIDAPI_KEY and RAPIDAPI_HOST.';
    }
    if (status === 429) {
      return 'JSearch rate limit reached. Please try again later.';
    }
    if (status !== undefined) {
      return `JSearch request failed with status ${status}.`;
    }
    if (error.code === 'ECONNABORTED') {
      return 'JSearch request timed out.';
    }
    return 'Unable to reach JSearch right now.';
  }
  return 'Unable to search external jobs right now.';
}

function extractJSearchJobs(payload: unknown): JSearchJob[] {
  if (!isRecord(payload)) return [];
  const data = payload.data;
  if (Array.isArray(data)) return data.filter(isRecord) as JSearchJob[];
  if (isRecord(data) && Array.isArray(data.jobs)) {
    return data.jobs.filter(isRecord) as JSearchJob[];
  }
  return [];
}

function mapJSearchJob(job: JSearchJob): ExternalJobResponse {
  const externalId = asString(job.job_id) || cryptoSafeId(job);
  const city = asString(job.job_city);
  const state = asString(job.job_state);
  const country = asString(job.job_country);
  const location = [city, state, country].filter(Boolean).join(', ') || 'Not specified';
  const requiredSkills = asStringArray(job.job_required_skills);

  return {
    id: `jsearch:${externalId}`,
    externalId,
    source: 'jsearch',
    title: asString(job.job_title) || 'Untitled Role',
    company: asString(job.employer_name) || 'Unknown Company',
    companyId: `jsearch:${asSlug(asString(job.employer_name) || 'unknown')}`,
    location,
    workMode: job.job_is_remote === true ? 'Remote' : 'On-site',
    type: mapJobType(asString(job.job_employment_type)),
    salaryMin: asNumber(job.job_min_salary),
    salaryMax: Math.max(asNumber(job.job_max_salary), asNumber(job.job_min_salary)),
    currency: asString(job.job_salary_currency) || 'USD',
    description: asString(job.job_description) || 'No description provided.',
    requiredSkills,
    niceToHaveSkills: extractNiceToHaveSkills(job.job_highlights, requiredSkills),
    postedDate: asString(job.job_posted_at_datetime_utc) || new Date().toISOString(),
    isActive: true,
    applyUrl: asString(job.job_apply_link) || null,
    employerLogo: asString(job.employer_logo) || null,
  };
}

function extractNiceToHaveSkills(
  highlights: unknown,
  requiredSkills: string[]
): string[] {
  if (!isRecord(highlights)) return [];
  const qualifications = asStringArray(highlights.Qualifications);
  return qualifications
    .flatMap((item) => item.split(/[,\n]/))
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !requiredSkills.includes(item))
    .slice(0, 8);
}

function mapJobType(value: string): JobType {
  const normalized = value.toLowerCase();
  if (normalized.includes('part')) return 'Part-time';
  if (normalized.includes('intern')) return 'Internship';
  if (normalized.includes('contract')) return 'Contract';
  return 'Full-time';
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed));
  }
  return 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function asSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'unknown';
}

function cryptoSafeId(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url').slice(0, 32);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export { searchExternalJobs };
export type { ExternalJobResponse, ExternalJobSearchResponse };
