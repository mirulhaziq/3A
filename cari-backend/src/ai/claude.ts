import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { Response } from 'express';
import { retry } from '../lib/retry';
import { logger } from '../lib/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const MODEL = 'gpt-5.4';

// ─── Unified types ────────────────────────────────────────────────────────────
// Exported so callers never need to import from @anthropic-ai/sdk.

export interface MessageParam {
  role: 'user' | 'assistant';
  content: string;
}

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  name: string;
  input: Record<string, unknown>;
}

export type ContentBlock = TextBlock | ToolUseBlock;

export interface AIMessage {
  content: ContentBlock[];
}

export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function toOpenAITools(tools: Tool[]): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema as Record<string, unknown>,
    },
  }));
}

function buildMessages(
  system: string,
  messages: MessageParam[]
): ChatCompletionMessageParam[] {
  return [
    { role: 'system', content: system },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];
}

function parseResponse(
  choice: OpenAI.Chat.Completions.ChatCompletion.Choice
): AIMessage {
  const content: ContentBlock[] = [];

  if (choice.message.content) {
    content.push({ type: 'text', text: choice.message.content });
  }

  if (choice.message.tool_calls) {
    for (const toolCall of choice.message.tool_calls) {
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      } catch {
        logger.warn({ toolCall }, 'Failed to parse tool call arguments');
      }
      content.push({
        type: 'tool_use',
        name: toolCall.function.name,
        input,
      });
    }
  }

  return { content };
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function streamToSSE(
  res: Response,
  messages: MessageParam[],
  system: string,
  tools?: Tool[]
): Promise<void> {
  const stream = await retry(() =>
    openai.chat.completions.create({
      model: MODEL,
      max_tokens: 2048,
      messages: buildMessages(system, messages),
      stream: true,
      ...(tools && tools.length > 0
        ? { tools: toOpenAITools(tools) }
        : {}),
    })
  );

  try {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(
          `data: ${JSON.stringify({ type: 'chunk', content: delta })}\n\n`
        );
      }
    }
    res.write('data: {"type":"done"}\n\n');
    res.end();
  } catch (err) {
    logger.error({ err }, 'SSE stream error');
    const message = err instanceof Error ? err.message : 'Stream error';
    res.write(
      `data: ${JSON.stringify({ type: 'error', content: message })}\n\n`
    );
    res.end();
  }
}

async function callClaude(
  messages: MessageParam[],
  system: string,
  tools?: Tool[],
  maxTokens: number = 4096
): Promise<AIMessage> {
  return retry(async () => {
    const response = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: buildMessages(system, messages),
      ...(tools && tools.length > 0
        ? { tools: toOpenAITools(tools), tool_choice: 'auto' }
        : {}),
    });

    return parseResponse(response.choices[0]);
  });
}

async function callClaudeWithVision(
  imageBase64: string,
  imageMimetype: string,
  prompt: string,
  maxTokens: number = 1024
): Promise<string> {
  return retry(async () => {
    const response = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimetype};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content ?? '';
  });
}

export { openai, MODEL, streamToSSE, callClaude, callClaudeWithVision };
