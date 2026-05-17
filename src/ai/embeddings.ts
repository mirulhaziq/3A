import OpenAI from 'openai';
import { retry } from '../lib/retry';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function embed(text: string): Promise<number[]> {
  const truncated = text.length > 8000 ? text.slice(0, 8000) : text;

  const response = await retry(() =>
    openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: truncated,
    })
  );

  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;

  return dot / magnitude;
}

export { embed, cosineSimilarity };
