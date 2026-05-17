import { ToolDefinition, AgentToolName } from '../../types/agent.types';
import { resumeTailorTool } from './resume-tailor';
import { emailDraftTool } from './email-draft';
import { jobFetcherTool } from './job-fetcher';
import { nudgeSchedulerTool } from './nudge-scheduler';

const tools: ToolDefinition[] = [
  resumeTailorTool,
  emailDraftTool,
  jobFetcherTool,
  nudgeSchedulerTool,
];

function getAllTools(): ToolDefinition[] {
  return tools;
}

function getToolExecutor(name: AgentToolName): ToolDefinition['execute'] {
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  return tool.execute;
}

export { getAllTools, getToolExecutor };
