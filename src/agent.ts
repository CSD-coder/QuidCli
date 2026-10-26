import { LLMConfig } from './detector.js';
import { toolsSchema, executeTool } from './tools/index.js';
import { confirm } from '@inquirer/prompts';

export async function runAgentLoop(prompt: string, config: LLMConfig) {
  const systemPrompt = `You are Quid CLI, an agentic AI developer. 
Available tools: ${JSON.stringify(toolsSchema)}.
Respond ONLY in JSON format:
{
  "thought": "Reasoning step",
  "action": "tool_name or finish",
  "args": { ...tool arguments... }
}`;

  let history = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  let completed = false;

  while (!completed) {
    const res = await fetch(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages: history, stream: false })
    });

    const data = (await res.json()) as any;
    const rawContent = data.message?.content || '{}';
    
    let parsed: any;
    try {
      parsed = JSON.parse(rawContent.substring(rawContent.indexOf('{'), rawContent.lastIndexOf('}') + 1));
    } catch {
      console.log(`[Quid Response]: ${rawContent}`);
      break;
    }

    console.log(`\n💭 [Thinking]: ${parsed.thought}`);

    if (parsed.action === 'finish') {
      console.log(`\n✅ Task Completed: ${parsed.args?.message || 'Done'}`);
      completed = true;
      break;
    }

    // Safety Prompt for Modifying Actions
    if (['write_file', 'exec_command'].includes(parsed.action)) {
      const proceed = await confirm({
        message: `Agent wants to execute [${parsed.action}] with args: ${JSON.stringify(parsed.args)}. Allow?`,
        default: true
      });

      if (!proceed) {
        history.push({ role: 'assistant', content: rawContent });
        history.push({ role: 'user', content: 'Execution denied by user. Choose a different step or stop.' });
        continue;
      }
    }

    // Execute Tool
    console.log(`⚡ [Executing Tool]: ${parsed.action}`);
    const output = await executeTool(parsed.action, parsed.args);
    
    history.push({ role: 'assistant', content: rawContent });
    history.push({ role: 'user', content: `Tool Output: ${output}` });
  }
}
