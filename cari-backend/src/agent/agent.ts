import { StagedAction, AgentToolName } from '../types/agent.types';
import type { Tool, ToolUseBlock } from '../ai/claude';
import { buildAgentMemory } from './memory';
import { stageAction } from './staging';
import { getAllTools, getToolExecutor } from './tools';
import { callClaude } from '../ai/claude';
import { AGENT_PLANNER_PROMPT } from '../ai/prompts/agent-planner';
import { logger } from '../lib/logger';

async function runAgentLoop(userId: string): Promise<StagedAction | null> {
  try {
    // PERCEIVE
    const memory = await buildAgentMemory(userId);
    logger.debug({ memory }, 'Agent memory snapshot');

    // PLAN
    const toolDefs = getAllTools();
    const claudeTools: Tool[] = toolDefs.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema,
    }));

    const response = await callClaude(
      [{ role: 'user', content: JSON.stringify(memory) }],
      AGENT_PLANNER_PROMPT,
      claudeTools,
      1024
    );

    const toolUseBlock = response.content.find(
      (block): block is ToolUseBlock => block.type === 'tool_use'
    );

    if (!toolUseBlock) {
      logger.warn({ userId }, 'Agent produced no tool_use block');
      return null;
    }

    // ACT
    const toolName = toolUseBlock.name as AgentToolName;
    const toolInput = toolUseBlock.input as Record<string, unknown>;

    const executor = getToolExecutor(toolName);
    const toolOutput = await executor(toolInput, userId);

    const staged = await stageAction(userId, toolName, toolInput, toolOutput);

    return staged;
  } catch (err) {
    logger.error({ err, userId }, 'Agent loop failed');
    return null;
  }
}

export { runAgentLoop };
