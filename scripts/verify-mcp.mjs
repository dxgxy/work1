import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** @functionId TOOL-REQUEST-001 @summary Exchange one bounded JSON-RPC request. */
function createClient(command, args) {
  const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, env: { ...process.env, OTEL_SDK_DISABLED: 'true' } });
  let buffer = '';
  let nextId = 1;
  let stderr = '';
  const pending = new Map();
  child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-1500); });
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    while (buffer.includes('\n')) {
      const index = buffer.indexOf('\n');
      const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
      try {
        const message = JSON.parse(line);
        if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
      } catch { /* Non-protocol startup output is ignored. */ }
    }
  });
  return {
    async request(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timeout: ${stderr}`)); }, 90000);
        pending.set(id, (message) => { clearTimeout(timeout); message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result); });
        child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
      });
    },
    notify(method) { child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method }) + '\n'); },
    close() { child.stdin.end(); child.kill(); },
  };
}

/** @functionId TOOL-VERIFY-001 @summary Verify MCP handshake, tools, and a real browser launch. */
async function verifyStdio(name, packageName, extraArgs = []) {
  const localEntry = resolve(name === 'context7' ? 'node_modules/@upstash/context7-mcp/dist/index.js' : 'node_modules/@playwright/mcp/cli.js');
  const cachedEntry = existsSync(localEntry) ? localEntry : name === 'context7' ? process.env.CONTEXT7_MCP_ENTRY : undefined;
  const client = cachedEntry ? createClient(process.execPath, [cachedEntry, ...extraArgs]) : createClient('cmd.exe', ['/d', '/s', '/c', `npx.cmd -y ${packageName} ${extraArgs.join(' ')}`]);
  try {
    const initialized = await client.request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'ci-buddy-setup-check', version: '1.0.0' } });
    client.notify('notifications/initialized');
    const listed = await client.request('tools/list');
    const result = { name, status: 'passed', server: initialized.serverInfo, tools: listed.tools.map((tool) => tool.name) };
    if (name === 'playwright') {
      const navigation = await client.request('tools/call', { name: 'browser_navigate', arguments: { url: 'about:blank' } });
      if (navigation.isError) throw new Error(JSON.stringify(navigation.content));
      result.browser = 'Microsoft Edge launched; about:blank navigation passed';
      await client.request('tools/call', { name: 'browser_close', arguments: {} });
    }
    return result;
  } catch (error) { return { name, status: 'failed', error: String(error) }; }
  finally { client.close(); }
}

/** @functionId TOOL-DOCS-001 @summary Verify the public OpenAI documentation MCP handshake. */
async function verifyDocs() {
  try {
    const response = await fetch('https://developers.openai.com/mcp', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'ci-buddy-setup-check', version: '1.0.0' } } }),
      signal: AbortSignal.timeout(30000),
    });
    const body = await response.text();
    if (!response.ok || !body.includes('serverInfo')) throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
    return { name: 'openaiDeveloperDocs', status: 'passed', httpStatus: response.status };
  } catch (error) { return { name: 'openaiDeveloperDocs', status: 'failed', error: String(error) }; }
}

const checks = await Promise.all([
  verifyStdio('playwright', '@playwright/mcp@0.0.83', ['--headless', '--browser', 'msedge']),
  verifyStdio('context7', '@upstash/context7-mcp@4.4.2'),
  verifyDocs(),
]);
await mkdir('docs/setup', { recursive: true });
await writeFile('docs/setup/mcp-verification.json', JSON.stringify({ verifiedAt: new Date().toISOString(), checks }, null, 2));
console.log(JSON.stringify(checks, null, 2));
process.exitCode = checks.some((check) => check.status === 'failed') ? 1 : 0;

