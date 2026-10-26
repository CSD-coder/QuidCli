import execa from 'child_process';
import { confirm } from '@inquirer/prompts';

export interface LLMConfig {
  baseUrl: string;
  model: string;
  type: 'ollama' | 'standalone';
}

export async function resolveLLMProvider(): Promise<LLMConfig> {
  const ollamaUrl = 'http://localhost:11434';
  
  // 1. Check if Ollama service is active
  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      const data = (await res.json()) as { models: Array<{ name: string }> };
      const modelName = data.models?.[0]?.name || 'qwen2.5-coder';
      
      const connect = await confirm({
        message: `Found local AI service running at ${ollamaUrl} (Model: ${modelName}). Connect?`,
        default: true
      });

      if (connect) {
        return { baseUrl: ollamaUrl, model: modelName, type: 'ollama' };
      }
    }
  } catch {
    // Service not running
  }

  // 2. Fallback check: Install/download path
  const shouldDownload = await confirm({
    message: 'No active local AI service found. Download and setup a local model (Qwen 2.5 Coder)?',
    default: true
  });

  if (!shouldDownload) {
    console.log('[Quid] Operational cancellation. Exiting.');
    process.exit(0);
  }

  console.log('[Quid] Provisioning local model via Ollama CLI...');
  try {
    execa.execSync('ollama pull qwen2.5-coder', { stdio: 'inherit' });
    return { baseUrl: ollamaUrl, model: 'qwen2.5-coder', type: 'ollama' };
  } catch (err) {
    console.error('[Quid] Failed to pull model automatically. Ensure Ollama is installed.');
    process.exit(1);
  }
}
