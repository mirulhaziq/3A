import { JobDescription } from '../types';
import { supabase } from '../lib/supabase';
import { callClaude, callClaudeWithVision } from '../ai/claude';
import {
  buildJDExtractionPromptFromText,
  buildJDExtractionPromptFromImage,
} from '../ai/prompts/jd-extractor';

interface ExtractedJDData {
  job_title: string;
  company: string;
  location: string;
  seniority_level: string;
  salary_range: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  about_company: string;
}

async function parseJDResponse(text: string): Promise<ExtractedJDData> {
  try {
    return JSON.parse(text) as ExtractedJDData;
  } catch {
    throw new Error('Failed to parse JD extraction response as JSON');
  }
}

async function extractFromText(
  rawText: string,
  sourceUrl: string,
  userId: string
): Promise<JobDescription> {
  const prompt = buildJDExtractionPromptFromText(rawText, sourceUrl);

  const response = await callClaude(
    [{ role: 'user', content: rawText }],
    prompt,
    [],
    1024
  );

  const responseText =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const parsed = await parseJDResponse(responseText);

  const { data, error } = await supabase
    .from('job_descriptions')
    .insert({
      user_id: userId,
      raw_text: rawText,
      structured_data: parsed,
      job_title: parsed.job_title,
      company: parsed.company,
      location: parsed.location,
      seniority_level: parsed.seniority_level,
      salary_range: parsed.salary_range,
      source_url: sourceUrl ?? '',
      capture_method: 'dom_text',
      compatibility_pct: 0,
      applied: false,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to save JD: ${error?.message}`);
  }

  return data as JobDescription;
}

async function extractFromImage(
  imageBase64: string,
  imageMimetype: string,
  sourceUrl: string,
  userId: string
): Promise<JobDescription> {
  const prompt = buildJDExtractionPromptFromImage(sourceUrl);

  const responseText = await callClaudeWithVision(
    imageBase64,
    imageMimetype,
    prompt,
    1024
  );

  const parsed = await parseJDResponse(responseText);

  const { data, error } = await supabase
    .from('job_descriptions')
    .insert({
      user_id: userId,
      raw_text: `[Extracted from screenshot] ${parsed.job_title} at ${parsed.company}`,
      structured_data: parsed,
      job_title: parsed.job_title,
      company: parsed.company,
      location: parsed.location,
      seniority_level: parsed.seniority_level,
      salary_range: parsed.salary_range,
      source_url: sourceUrl ?? '',
      capture_method: 'screenshot',
      compatibility_pct: 0,
      applied: false,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to save JD from screenshot: ${error?.message}`);
  }

  return data as JobDescription;
}

async function updateCompatibility(
  jdId: string,
  compatibilityPct: number
): Promise<void> {
  await supabase
    .from('job_descriptions')
    .update({ compatibility_pct: compatibilityPct })
    .eq('id', jdId);
}

export { extractFromText, extractFromImage, updateCompatibility };
