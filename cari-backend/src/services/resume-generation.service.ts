import { RESUME_MODEL, GPT4_MODEL, getOpenAIClient, getGPT4Client, extractJson } from '../lib/openai';
import { supabase as legacySupabase, getSupabaseAdmin } from '../lib/supabase';
import { NotFoundError } from '../middleware/error.middleware';
import { parseCV } from '../lib/pdf-parser';
import { retry } from '../lib/retry';
import { logger } from '../lib/logger';
import {
  generatedResumeSchema,
  type GeneratedResume,
  type ResumeListQueryInput,
  type ResumeGenerationRequestInput,
  type UpdateGeneratedResumeInput,
} from '../schemas/resume-generation.schema';
import { buildResumeTemplateInstructions } from '../templates/cari-resume-template';
import type { Json } from '../types/database.types';
import type { ApplicationStatus, Database } from '../types/database.types';

type GeneratedResumeRow =
  Database['public']['Tables']['generated_resumes']['Row'];

interface SavedResumeResponse {
  id: string;
  jobId: string | null;
  title: string;
  model: string;
  resume: GeneratedResume;
  applicationStatus: ApplicationStatus | null;
  createdAt: string;
  updatedAt: string;
}

interface ResumeListResponse {
  resumes: SavedResumeResponse[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

interface ParsedResumeResponse {
  rawText: string;
  resume: GeneratedResume;
  templateId: string;
}

async function generateResumeForUser(
  userId: string,
  input: ResumeGenerationRequestInput
): Promise<SavedResumeResponse> {
  const resume = await generateResume(input);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('generated_resumes')
    .insert({
      user_id: userId,
      job_id: input.jobId ?? null,
      title: input.title,
      resume_json: toJson(resume),
      model: RESUME_MODEL,
    })
    .select('id,job_id,title,model,resume_json,created_at,updated_at,user_id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSavedResume(data, null);
}


function buildEmptyResume(rawText: string): GeneratedResume {
  const nameMatch = rawText.match(/^([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)+)/m);
  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const phoneMatch = rawText.match(/(\+?6?0[\d -]{8,13}|\+?1[0-9]{10})/);
  return {
    metadata: { title: 'Parsed Resume', targetRole: null, tailoredForJob: false, keywords: [] },
    personal: {
      fullName: nameMatch?.[0] ?? 'Unknown',
      location: null, phone: phoneMatch?.[0] ?? null,
      email: emailMatch?.[0] ?? null, linkedin: null, github: null,
    },
    summary: '',
    skills: { languages: [], frameworks: [], toolsAndPlatforms: [], softSkills: [] },
    experience: [], projects: [], education: [], certifications: [], awards: [], extracurricular: [],
  };
}

async function parseResumeFromText(rawText: string): Promise<GeneratedResume> {
  const cv = rawText.slice(0, 8000);
  const openai = getGPT4Client();

  let content = '';
  try {
    const completion = await retry(() => openai.chat.completions.create({
      model: GPT4_MODEL,
      temperature: 0.1,
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: 'You are a precise CV data extractor. Extract all data from the CV exactly as written. Return only valid JSON, no markdown.',
        },
        {
          role: 'user',
          content: `Extract all information from this CV and return this exact JSON. Fill every field present in the CV. Use null for missing scalar fields and [] for missing arrays.

{"fullName":"","location":null,"phone":null,"email":null,"linkedin":null,"github":null,"targetRole":null,"summary":"","languages":[],"frameworks":[],"tools":[],"soft":[],"experience":[{"company":"","role":"","type":null,"startDate":null,"endDate":null,"current":false,"bullets":[]}],"education":[{"institution":"","degree":null,"field":null,"startDate":null,"endDate":null,"grade":null}],"certifications":[{"name":"","issuer":null,"date":null}],"projects":[{"name":"","description":null,"techStack":[],"bullets":[],"repoUrl":null,"liveUrl":null}],"awards":[{"title":"","issuer":null,"year":null}],"extracurricular":[{"title":"","organization":null,"date":null,"bullets":[]}]}

CV TEXT:
${cv}`,
        },
      ],
    }));
    content = completion.choices[0]?.message?.content ?? '';
  } catch (err) {
    logger.error({ err }, 'GPT-4o CV parse failed — returning skeleton');
    return buildEmptyResume(rawText);
  }

  if (!content) {
    logger.warn('Empty GPT-4o response for CV parsing');
    return buildEmptyResume(rawText);
  }

  let raw: Record<string, unknown>;
  try {
    raw = extractJson(content) as Record<string, unknown>;
  } catch (err) {
    logger.error({ err, content: content.slice(0, 200) }, 'extractJson failed');
    return buildEmptyResume(rawText);
  }

  const strings = (arr: unknown): string[] =>
    Array.isArray(arr) ? (arr as unknown[]).filter((x): x is string => typeof x === 'string') : [];

  return {
    metadata: {
      title: 'Parsed Foundation Resume',
      targetRole: (raw.targetRole as string | null) ?? null,
      tailoredForJob: false,
      keywords: strings(raw.languages),
    },
    personal: {
      fullName: (raw.fullName as string) || 'Unknown',
      location: (raw.location as string | null) ?? null,
      phone: (raw.phone as string | null) ?? null,
      email: (raw.email as string | null) ?? null,
      linkedin: (raw.linkedin as string | null) ?? null,
      github: (raw.github as string | null) ?? null,
    },
    summary: (raw.summary as string) || '',
    skills: {
      languages: strings(raw.languages),
      frameworks: strings(raw.frameworks),
      toolsAndPlatforms: strings(raw.tools),
      softSkills: strings(raw.soft),
    },
    experience: (Array.isArray(raw.experience) ? raw.experience : []).map((e: Record<string, unknown>) => ({
      company: (e.company as string) || '',
      role: (e.role as string) || '',
      type: (e.type as string | null) ?? null,
      startDate: (e.startDate as string | null) ?? null,
      endDate: (e.endDate as string | null) ?? null,
      current: Boolean(e.current),
      bullets: strings(e.bullets),
    })),
    projects: (Array.isArray(raw.projects) ? raw.projects : []).map((p: Record<string, unknown>) => ({
      name: (p.name as string) || '',
      description: (p.description as string | null) ?? null,
      techStack: strings(p.techStack),
      bullets: strings(p.bullets),
      repoUrl: (p.repoUrl as string | null) ?? null,
      liveUrl: (p.liveUrl as string | null) ?? null,
    })),
    education: (Array.isArray(raw.education) ? raw.education : []).map((e: Record<string, unknown>) => ({
      institution: (e.institution as string) || '',
      degree: (e.degree as string | null) ?? null,
      field: (e.field as string | null) ?? null,
      startDate: (e.startDate as string | null) ?? null,
      endDate: (e.endDate as string | null) ?? null,
      grade: (e.grade as string | null) ?? null,
    })),
    certifications: (Array.isArray(raw.certifications) ? raw.certifications : [])
      .filter((c: Record<string, unknown>) => c.name)
      .map((c: Record<string, unknown>) => ({
        name: (c.name as string) || '',
        issuer: (c.issuer as string | null) ?? null,
        date: (c.date as string | null) ?? null,
      })),
    awards: (Array.isArray(raw.awards) ? raw.awards : [])
      .filter((a: Record<string, unknown>) => a.title)
      .map((a: Record<string, unknown>) => ({
        title: (a.title as string) || '',
        issuer: (a.issuer as string | null) ?? null,
        year: (a.year as string | null) ?? null,
      })),
    extracurricular: (Array.isArray(raw.extracurricular) ? raw.extracurricular : [])
      .filter((e: Record<string, unknown>) => e.title)
      .map((e: Record<string, unknown>) => ({
        title: (e.title as string) || '',
        organization: (e.organization as string | null) ?? null,
        date: (e.date as string | null) ?? null,
        bullets: strings(e.bullets),
      })),
  };
}



async function parseResumeUpload(
  file: Express.Multer.File
): Promise<ParsedResumeResponse> {
  const rawText = await parseCV(file.buffer, file.mimetype);

  if (rawText.length < 80) {
    throw new Error('Resume text is too short to parse.');
  }

  const resume = await parseResumeFromText(rawText);
  return { rawText, resume, templateId: 'cari-amirul-single-column-v1' };
}

async function listGeneratedResumesForUser(
  userId: string,
  input: ResumeListQueryInput
): Promise<ResumeListResponse> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('generated_resumes')
    .select('id,job_id,title,model,resume_json,created_at,updated_at,user_id', {
      count: 'exact',
    })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(input.offset, input.offset + input.limit - 1);

  if (input.jobId) query = query.eq('job_id', input.jobId);
  if (input.q) query = query.ilike('title', `%${input.q}%`);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const statuses = await getApplicationStatusesForResumeIds(
    userId,
    rows.map((row) => row.id)
  );

  return {
    resumes: rows.map((row) => mapSavedResume(row, statuses.get(row.id) ?? null)),
    pagination: {
      limit: input.limit,
      offset: input.offset,
      count: count ?? rows.length,
    },
  };
}

async function getGeneratedResumeForUser(
  userId: string,
  resumeId: string
): Promise<SavedResumeResponse> {
  const row = await getGeneratedResumeRowForUser(userId, resumeId);
  const statuses = await getApplicationStatusesForResumeIds(userId, [resumeId]);
  return mapSavedResume(row, statuses.get(resumeId) ?? null);
}

async function updateGeneratedResumeForUser(
  userId: string,
  resumeId: string,
  input: UpdateGeneratedResumeInput
): Promise<SavedResumeResponse> {
  await getGeneratedResumeRowForUser(userId, resumeId);
  const supabase = getSupabaseAdmin();

  const payload: Database['public']['Tables']['generated_resumes']['Update'] = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.resume !== undefined) payload.resume_json = toJson(input.resume);

  const { data, error } = await supabase
    .from('generated_resumes')
    .update(payload)
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select('id,job_id,title,model,resume_json,created_at,updated_at,user_id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const statuses = await getApplicationStatusesForResumeIds(userId, [resumeId]);
  return mapSavedResume(data, statuses.get(resumeId) ?? null);
}

async function generateResume(
  input: ResumeGenerationRequestInput
): Promise<GeneratedResume> {
  const openai = getGPT4Client();

  const completion = await openai.chat.completions.create({
    model: GPT4_MODEL,
    temperature: 0.2,
    max_tokens: 2500,
    messages: [
      {
        role: 'system',
        content:
          'You are Cari, an expert resume writer for tech graduates and career pivoters. Return only valid JSON. Do not use markdown. Make the resume concise, truthful, ATS-friendly, and formatted for a software role.',
      },
      {
        role: 'user',
        content: buildResumePrompt(input),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned an empty resume response.');
  }

  return generatedResumeSchema.parse(extractJson(content));
}

function buildResumePrompt(input: ResumeGenerationRequestInput): string {
  return `
Generate a structured resume JSON object.

Return exactly this JSON shape:
{
  "metadata": {
    "title": "string",
    "targetRole": "string or null",
    "tailoredForJob": true,
    "keywords": ["string"]
  },
  "personal": {
    "fullName": "string",
    "location": "string or null",
    "phone": "string or null",
    "email": "string or null",
    "linkedin": "string or null",
    "github": "string or null"
  },
  "summary": "string",
  "skills": {
    "languages": ["string"],
    "frameworks": ["string"],
    "toolsAndPlatforms": ["string"],
    "softSkills": ["string"]
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "type": "string or null",
      "startDate": "string or null",
      "endDate": "string or null",
      "current": false,
      "bullets": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string or null",
      "techStack": ["string"],
      "bullets": ["string"],
      "repoUrl": "string or null",
      "liveUrl": "string or null"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string or null",
      "field": "string or null",
      "startDate": "string or null",
      "endDate": "string or null",
      "grade": "string or null"
    }
  ],
  "certifications": [{ "name": "string", "issuer": "string or null", "date": "string or null" }],
  "awards": [{ "title": "string", "issuer": "string or null", "year": "string or null" }]
}

Rules:
- Do not invent employers, schools, certifications, links, or dates.
- You may rewrite bullets for clarity and impact, but keep them grounded in the source.
- If a section has no source data, return an empty array for list sections or null for nullable fields.
- If a job description is provided, tailor summary, keywords, skills ordering, bullets, and project emphasis to it.
- Keep bullets action-oriented and concise.
- Follow the Cari resume template instructions below.

CARI RESUME TEMPLATE:
${buildResumeTemplateInstructions()}

TITLE:
${input.title}

PROFILE DATA JSON:
${JSON.stringify(input.profileData ?? {}, null, 2)}

BASE RESUME TEXT:
${input.baseResumeText ?? ''}

JOB DESCRIPTION:
${input.jobDescription ?? ''}
`.trim();
}

async function getGeneratedResumeRowForUser(
  userId: string,
  resumeId: string
): Promise<GeneratedResumeRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('generated_resumes')
    .select('id,job_id,title,model,resume_json,created_at,updated_at,user_id')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new NotFoundError('Generated resume not found');
  }

  return data;
}

async function getApplicationStatusesForResumeIds(
  userId: string,
  resumeIds: string[]
): Promise<Map<string, ApplicationStatus>> {
  const statuses = new Map<string, ApplicationStatus>();
  if (resumeIds.length === 0) return statuses;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('applications')
    .select('tailored_resume_id,status')
    .eq('user_id', userId)
    .in('tailored_resume_id', resumeIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const application of data ?? []) {
    if (application.tailored_resume_id) {
      statuses.set(application.tailored_resume_id, application.status);
    }
  }

  return statuses;
}

function mapSavedResume(
  row: GeneratedResumeRow,
  applicationStatus: ApplicationStatus | null
): SavedResumeResponse {
  return {
    id: row.id,
    jobId: row.job_id,
    title: row.title,
    model: row.model,
    resume: generatedResumeSchema.parse(row.resume_json),
    applicationStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

interface BulletSuggestion {
  id: string;
  original: string;
  enhanced: string;
}

async function enhanceResumeBullets(
  bullets: string[],
  jobDescription?: string
): Promise<BulletSuggestion[]> {
  const openai = getGPT4Client();

  const prompt = `You are a professional resume coach. Rewrite each bullet point using the STAR/SMART method:
- Specific action verb + concrete task
- Measurable outcome (add realistic numbers if none given, e.g. "reduced by ~30%")
- Relevant to the job description if provided
- Concise (max 20 words each)

Return ONLY a valid JSON array, no markdown:
[{ "id": "0", "original": "...", "enhanced": "..." }, ...]

BULLETS TO ENHANCE:
${bullets.map((b, i) => `${i}. ${b}`).join('\n')}

${jobDescription ? `JOB DESCRIPTION CONTEXT:\n${jobDescription.slice(0, 1500)}` : ''}`;

  const completion = await openai.chat.completions.create({
    model: GPT4_MODEL,
    temperature: 0.3,
    max_tokens: 1200,
    messages: [
      {
        role: 'system',
        content: 'Return only valid JSON. No markdown. Return a JSON object with a single key "suggestions" containing the array.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty AI response for bullet enhancement');

  const parsed = extractJson(content);
  let suggestions: BulletSuggestion[];
  if (Array.isArray(parsed)) {
    suggestions = parsed as BulletSuggestion[];
  } else {
    suggestions = ((parsed as Record<string, unknown>).suggestions as BulletSuggestion[] | undefined) ?? [];
  }

  return suggestions.map((s, i) => ({
    id: String(s.id ?? i),
    original: s.original ?? bullets[i] ?? '',
    enhanced: s.enhanced ?? bullets[i] ?? '',
  }));
}

async function enhanceSection(
  sectionType: 'summary' | 'experience_bullets' | 'project_bullets',
  content: string | string[],
  context?: string
): Promise<string | string[]> {
  const openai = getOpenAIClient();

  let prompt: string;

  if (sectionType === 'summary') {
    prompt = `You are a professional resume coach. Rewrite this professional summary to be punchy, specific, and impactful for a tech job seeker.

Rules:
- Max 3 sentences, ~60 words
- Lead with the candidate's strongest value proposition
- Include their tech stack and experience level naturally
- Avoid clichés ("passionate", "team player", "results-driven")
- Write in first-person implied (no "I")

${context ? `Target role context: ${context}\n` : ''}Current summary:
${content as string}

Return ONLY the improved summary text — no JSON, no markdown, no quotes.`;
  } else {
    const bullets = Array.isArray(content) ? content : [content as string];
    prompt = `You are a professional resume coach. Rewrite each bullet point using STAR/SMART format:
- Start with a strong action verb
- Add measurable outcomes (use realistic estimates like "~30%" if no numbers given)
- Keep each bullet under 20 words
- ${context ? `Tailor to: ${context}` : 'Make it ATS-friendly'}

Return ONLY a JSON array of enhanced strings, in the same order as input. No markdown, no wrapper object.
Example: ["Enhanced bullet 1", "Enhanced bullet 2"]

Bullets to enhance:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}`;
  }

  const completion = await openai.chat.completions.create({
    model: RESUME_MODEL,
    temperature: 0.3,
    max_tokens: 600,
    messages: [
      { role: 'system', content: 'You are a professional resume writing assistant.' },
      { role: 'user', content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty AI response for section enhancement');

  if (sectionType === 'summary') {
    return raw.trim().replace(/^["']|["']$/g, '');
  }

  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  const parsed = JSON.parse(trimmed) as string[];
  const inputBullets = Array.isArray(content) ? content : [content as string];
  return parsed.map((s, i) => s ?? inputBullets[i] ?? '');
}

async function importProfileFromStoredCv(userId: string): Promise<ParsedResumeResponse> {
  const supabase = getSupabaseAdmin();

  // Primary: get raw CV text from cv_versions
  const { data: cvRow } = await supabase
    .from('cv_versions')
    .select('cv_text')
    .eq('user_id', userId)
    .eq('type', 'master')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const cvText = (cvRow as Record<string, unknown> | null)?.cv_text as string | undefined;

  if (cvText && cvText.length >= 80) {
    const resume = await parseResumeFromText(cvText);
    await saveResumeAsProfile(userId, resume);
    return { rawText: cvText, resume, templateId: 'cari-amirul-single-column-v1' };
  }

  // Fallback: reconstruct from profiles.profile_data (written by saveResumeAsProfile on every parse)
  // This handles users who uploaded a CV before cv_versions was being saved correctly.
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .single();

  const pd = (profileRow as Record<string, unknown> | null)?.profile_data as Record<string, unknown> | undefined;
  const pdPersonal = pd?.personal as Record<string, string> | undefined;
  const pdExperience = pd?.experience as unknown[] | undefined;

  if (pd && (pdPersonal?.fullName || (pdExperience && pdExperience.length > 0))) {
    const resume = profileDataToResume(pd);
    const rawText = resumeToRawText(resume);
    // Backfill cv_versions so future calls use the primary path
    const { error: backfillError } = await legacySupabase.from('cv_versions').insert({
      user_id: userId,
      type: 'master',
      cv_text: rawText,
      ats_score: 0,
    });
    if (backfillError) {
      logger.warn({ error: backfillError }, 'cv_versions backfill failed');
    }
    return { rawText, resume, templateId: 'cari-amirul-single-column-v1' };
  }

  throw new NotFoundError('No CV found. Please upload your CV first.');
}

function profileDataToResume(pd: Record<string, unknown>): GeneratedResume {
  const personal = (pd.personal ?? {}) as Record<string, string>;
  const skills = (pd.skills ?? {}) as Record<string, string[]>;
  const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
  const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]).filter(s => typeof s === 'string') : []);

  return {
    metadata: {
      title: 'Foundation Resume',
      targetRole: str(personal.targetRole),
      tailoredForJob: false,
      keywords: arr(skills.languages),
    },
    personal: {
      fullName: personal.fullName || 'Unknown',
      location: str(personal.location),
      phone: str(personal.phone),
      email: str(personal.email),
      linkedin: str(personal.linkedin),
      github: str(personal.github),
    },
    summary: typeof pd.summary === 'string' ? pd.summary : '',
    skills: {
      languages: arr(skills.languages),
      frameworks: arr(skills.frameworks),
      toolsAndPlatforms: arr(skills.tools),
      softSkills: arr(skills.soft),
    },
    experience: (Array.isArray(pd.experience) ? pd.experience : []).map((e: Record<string, unknown>) => ({
      company: String(e.company ?? ''),
      role: String(e.role ?? ''),
      type: str(e.type),
      startDate: null,
      endDate: null,
      current: false,
      bullets: arr(e.bullets),
    })),
    projects: (Array.isArray(pd.projects) ? pd.projects : []).map((p: Record<string, unknown>) => ({
      name: String(p.name ?? ''),
      description: str(p.description),
      techStack: arr(p.tech),
      bullets: arr(p.bullets),
      repoUrl: str(p.url),
      liveUrl: null,
    })),
    education: (Array.isArray(pd.education) ? pd.education : []).map((e: Record<string, unknown>) => ({
      institution: String(e.institution ?? ''),
      degree: str(e.degree),
      field: str(e.field),
      startDate: null,
      endDate: null,
      grade: str(e.grade),
    })),
    certifications: (Array.isArray(pd.certifications) ? pd.certifications : []).map((c: Record<string, unknown>) => ({
      name: String(c.name ?? ''),
      issuer: str(c.issuer),
      date: str(c.date),
    })),
    awards: (Array.isArray(pd.awards) ? pd.awards : []).map((a: Record<string, unknown>) => ({
      title: String(a.name ?? ''),
      issuer: str(a.issuer),
      year: str(a.date),
    })),
    extracurricular: [],
  };
}

function resumeToRawText(r: GeneratedResume): string {
  const lines: string[] = [
    r.personal.fullName,
    [r.personal.email, r.personal.phone, r.personal.location].filter(Boolean).join(' | '),
    '',
    r.summary,
    '',
    'SKILLS',
    [...r.skills.languages, ...r.skills.frameworks, ...r.skills.toolsAndPlatforms].join(', '),
    '',
  ];
  for (const e of r.experience) {
    lines.push(`${e.role} at ${e.company}`, ...e.bullets.map(b => `- ${b}`), '');
  }
  for (const e of r.education) {
    lines.push(`${e.institution} — ${e.degree ?? ''} ${e.field ?? ''}`.trim(), '');
  }
  for (const p of r.projects) {
    lines.push(`Project: ${p.name}`, ...p.bullets.map(b => `- ${b}`), '');
  }
  return lines.join('\n').trim();
}

/**
 * Persists parsed resume data into profiles.profile_data (the user's foundation profile).
 * Called automatically after every successful CV parse or import.
 */
async function saveResumeAsProfile(userId: string, resume: GeneratedResume): Promise<void> {
  const supabase = getSupabaseAdmin();

  const dateRange = (start: string | null, end: string | null, current?: boolean): string => {
    if (!start && !end) return '';
    if (current) return `${start ?? ''} – Present`;
    return [start, end].filter(Boolean).join(' – ');
  };

  const profileData = {
    personal: {
      fullName: resume.personal.fullName || '',
      targetRole: resume.metadata.targetRole || '',
      location: resume.personal.location || '',
      phone: resume.personal.phone || '',
      email: resume.personal.email || '',
      linkedin: resume.personal.linkedin || '',
      github: resume.personal.github || '',
    },
    summary: resume.summary || '',
    skills: {
      languages: resume.skills.languages ?? [],
      frameworks: resume.skills.frameworks ?? [],
      tools: resume.skills.toolsAndPlatforms ?? [],
      soft: resume.skills.softSkills ?? [],
    },
    experience: (resume.experience ?? []).map((e, i) => ({
      id: `exp-${i}`,
      role: e.role || '',
      company: e.company || '',
      type: e.type || '',
      dateRange: dateRange(e.startDate, e.endDate, e.current),
      bullets: e.bullets ?? [],
    })),
    projects: (resume.projects ?? []).map((p, i) => ({
      id: `proj-${i}`,
      name: p.name || '',
      description: p.description || '',
      tech: p.techStack ?? [],
      showOnResume: true,
      bullets: p.bullets ?? [],
      date: '',
      url: p.liveUrl || p.repoUrl || '',
    })),
    education: (resume.education ?? []).map(e => ({
      institution: e.institution || '',
      degree: e.degree || '',
      field: e.field || '',
      dateRange: dateRange(e.startDate, e.endDate),
      grade: e.grade || '',
    })),
    certifications: (resume.certifications ?? []).map(c => ({
      name: c.name || '',
      issuer: c.issuer || '',
      date: c.date || '',
    })),
    awards: (resume.awards ?? []).map(a => ({
      name: a.title || '',
      issuer: a.issuer || '',
      date: a.year || '',
    })),
    extracurricular: (resume.extracurricular ?? []).map(e => ({
      name: e.title || '',
      organization: e.organization || '',
      date: e.date || '',
    })),
  };

  await supabase
    .from('profiles')
    .update({
      full_name: resume.personal.fullName || null,
      target_role: resume.metadata.targetRole || null,
      profile_data: toJson(profileData),
      onboarded: true,
    })
    .eq('id', userId);
}

export {
  enhanceResumeBullets,
  enhanceSection,
  importProfileFromStoredCv,
  saveResumeAsProfile,
  generateResumeForUser,
  getGeneratedResumeForUser,
  listGeneratedResumesForUser,
  parseResumeUpload,
  updateGeneratedResumeForUser,
};
export type { BulletSuggestion, ParsedResumeResponse, ResumeListResponse, SavedResumeResponse };
