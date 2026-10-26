import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const toolsSchema = [
  {
    name: 'read_file',
    description: 'Read the contents of a target file in the project workspace.',
    parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
  },
  {
    name: 'write_file',
    description: 'Write or overwrite code contents to a specified file.',
    parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] }
  },
  {
    name: 'exec_command',
    description: 'Run a bash/shell command in the local workspace terminal.',
    parameters: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] }
  }
];

export async function executeTool(name: string, args: any): Promise<string> {
  try {
    if (name === 'read_file') {
      return await fs.readFile(args.path, 'utf-8');
    }
    if (name === 'write_file') {
      await fs.writeFile(args.path, args.content, 'utf-8');
      return `File ${args.path} written successfully.`;
    }
    if (name === 'exec_command') {
      const { stdout, stderr } = await execPromise(args.command);
      return stdout || stderr || 'Command executed with no output.';
    }
    throw new Error(`Unknown tool: ${name}`);
  } catch (err: any) {
    return `Error executing ${name}: ${err.message}`;
  }
}
