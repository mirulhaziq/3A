import { RESUME_MODEL, getOpenAIClient } from '../lib/openai';
import { getSupabaseAdmin } from '../lib/supabase';
import {
  generatedResumeSchema,
  type GeneratedResume,
  type ResumeGenerationRequestInput,
} from '../schemas/resume-generation.schema';
import type { Json } from '../types/database.types';

interface SavedResumeResponse {
  id: string;
  jobId: string | null;
  title: string;
  model: string;
  resume: GeneratedResume;
  createdAt: string;
  updatedAt: string;
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
    .select('id,job_id,title,model,resume_json,created_at,updated_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    jobId: data.job_id,
    title: data.title,
    model: data.model,
    resume: generatedResumeSchema.parse(data.resume_json),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

async function generateResume(
  input: ResumeGenerationRequestInput
): Promise<GeneratedResume> {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: RESUME_MODEL,
    temperature: 0.2,
    max_tokens: 2500,
    response_format: { type: 'json_object' },
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

  return generatedResumeSchema.parse(parseJsonObject(content));
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

function parseJsonObject(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse OpenAI resume JSON.');
  }
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export { generateResumeForUser };
export type { SavedResumeResponse };
