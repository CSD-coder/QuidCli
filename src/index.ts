#!/usr/bin/env node
import { Command } from 'commander';
import { resolveLLMProvider } from './detector.js';
import { runAgentLoop } from './agent.js';

const program = new Command();

program
  .name('quid')
  .description('Local AI Agentic Coding Platform CLI')
  .version('1.0.0');

program
  .argument('<prompt>', 'Task prompt for the agent to complete')
  .action(async (promptStr: string) => {
    console.log('🚀 Initializing Quid CLI agent...\n');
    const llmConfig = await resolveLLMProvider();
    await runAgentLoop(promptStr, llmConfig);
  });

program.parse(process.argv);
