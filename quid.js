#!/usr/bin/env node
import readline from 'readline';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    const args = process.argv.slice(2);
    const prompt = args.join(' ');
    
    if (!prompt) {
        console.log("Usage: quid <your prompt>");
        rl.close();
        process.exit(0);
    }

    console.log("🚀 Initializing Quid CLI...\n");
    const ollamaUrl = 'http://localhost:11434';
    let model = 'qwen2.5-coder';

    try {
        const res = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
            const data = await res.json();
            model = data.models?.[0]?.name || 'qwen2.5-coder';
            const answer = await question(`Found local AI at ${ollamaUrl} (Model: ${model}). Connect? [Y/n]: `);
            if (answer.toLowerCase() === 'n') {
                console.log("Exiting.");
                rl.close();
                return;
            }
        } else {
            throw new Error();
        }
    } catch {
        const answer = await question('No active local AI found. Pull qwen2.5-coder via Ollama? [Y/n]: ');
        if (answer.toLowerCase() === 'n') {
            console.log("Exiting.");
            rl.close();
            return;
        }
        try {
            await execPromise('ollama pull qwen2.5-coder');
        } catch (e) {
            console.error("Failed to pull model. Ensure Ollama is running.");
            rl.close();
            return;
        }
    }

    console.log(`\n🤖 Quid AI ready! Task: "${prompt}"`);
    rl.close();
}

main();
