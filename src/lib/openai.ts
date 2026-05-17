import OpenAI from 'openai';
import { env } from '../config/env';

const ANALYSIS_MODEL = 'gpt-4o-mini';
const RESUME_MODEL = 'gpt-4.1-mini';

function isOpenAIConfigured(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

function getOpenAIClient(): OpenAI {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY.');
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export {
  ANALYSIS_MODEL,
  RESUME_MODEL,
  getOpenAIClient,
  isOpenAIConfigured,
};
