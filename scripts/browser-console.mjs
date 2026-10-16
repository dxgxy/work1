import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const child = spawn(process.execPath, ["node_modules/@playwright/mcp/cli.js", "--headless", "--browser", "msedge", "--isolated"], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
let buffer = ""; let nextId = 1; const pending = new Map();
child.stdout.on("data", function receiveChunk(chunk) {
  buffer += chunk;
  while (buffer.includes("\n")) {
    const index = buffer.indexOf("\n"); const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
    try { const response = JSON.parse(line); pending.get(response.id)?.(response); } catch { /* ignore non-protocol startup text */ }
  }
});
child.stderr.on("data", function ignoreStartupLog() {});

/** @functionId TOOL-BROWSER-001 @summary Issue bounded Playwright MCP requests @module tools @input method,params @output Promise<object> @permission local developer @precondition dev server running @postcondition response returned @sideEffects media @offline supported @idempotency read operations repeatable @errors timeout or MCP error @concurrency JSON RPC request IDs @performance 30 second timeout @test output/playwright/import-smoke.json @since 1.0.0 */
export function request(method, params) {
  const id = nextId++;
  return new Promise(function awaitResponse(resolve, reject) {
    const timer = setTimeout(function timeOut() { pending.delete(id); reject(new Error("MCP timeout")); }, 30000);
    pending.set(id, function complete(response) { clearTimeout(timer); pending.delete(id); response.error ? reject(new Error(JSON.stringify(response.error))) : resolve(response.result); });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}

await request("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "ci-buddy-browser-console", version: "1.0.0" } });
child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
export function close() { child.stdin.end(); child.kill(); }

if (process.argv[1]?.endsWith("browser-console.mjs")) {
  const lines = createInterface({ input: process.stdin });
  try { for await (const line of lines) { if (line === "exit") break; try { console.log(JSON.stringify(await request("tools/call", JSON.parse(line)))); } catch (error) { console.log(String(error)); } } }
  finally { close(); }
}
