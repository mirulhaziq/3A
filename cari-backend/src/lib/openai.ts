import OpenAI from 'openai';
import { env } from '../config/env';

// ilmu.ai proxy — nemo-super for lightweight/small-output calls (<350 tokens)
const ANALYSIS_MODEL = 'nemo-super';
const RESUME_MODEL = 'nemo-super';

// gpt-4o via real OpenAI — for large structured outputs (resume gen/parse, analysis, roadmap, chat)
const GPT4_MODEL = 'gpt-4o';

function isOpenAIConfigured(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

function isGPT4Configured(): boolean {
  return Boolean(env.GPT4_API_KEY);
}

/** ilmu.ai client — nemo-super, for small output calls (bullet enhance, skill resources, etc.) */
function getOpenAIClient(): OpenAI {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY.');
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
  });
}

/**
 * GPT-4o client — for large structured outputs (resume parse, generate, analysis, roadmap, chat).
 * Uses GPT4_BASE_URL (real OpenAI: https://api.openai.com/v1) if set.
 * Falls back to OPENAI_BASE_URL (ilmu.ai proxy) if GPT4_BASE_URL is not configured.
 */
function getGPT4Client(): OpenAI {
  if (!isGPT4Configured()) {
    throw new Error('GPT-4 is not configured. Set GPT4_API_KEY in .env.');
  }

  // Prefer dedicated GPT4_BASE_URL; fall back to the shared ilmu.ai proxy URL
  const baseURL = env.GPT4_BASE_URL ?? env.OPENAI_BASE_URL;

  return new OpenAI({
    apiKey: env.GPT4_API_KEY,
    baseURL,
  });
}

// ilmu.ai does not support response_format json_object — parse raw content instead
function extractJson(content: string): unknown {
  const trimmed = content.trim();
  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  return JSON.parse(fenced);
}

export {
  ANALYSIS_MODEL,
  RESUME_MODEL,
  GPT4_MODEL,
  getOpenAIClient,
  getGPT4Client,
  isOpenAIConfigured,
  isGPT4Configured,
  extractJson,
};
