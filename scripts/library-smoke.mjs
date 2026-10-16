import { request, close } from "./browser-console.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const evidence = [];
/** @functionId ECDICT-BROWSER-001 @summary Record one local browser verification step @module tools @input tool name,args @output Promise<string> @permission local developer @precondition local preview running @postcondition errors fail check @sideEffects media @offline supported @idempotency read steps repeatable @errors MCP failure @concurrency sequential @performance bounded transport @test output/playwright/library-smoke.json @since 1.0.0 */
async function call(name, args = {}) {
  console.log(`Checking ${name}${args.element ? `: ${args.element}` : ""}`);
  const result = await request("tools/call", { name, arguments: args });
  let text = "";
  for (const item of result.content ?? []) if (item.type === "text") text += item.text + "\n";
  evidence.push({ tool: name, result: text });
  if (result.isError) throw new Error(text);
  return text;
}
/** @functionId ECDICT-REF-001 @summary Find a fresh accessibility reference @module tools @input visible snapshot text @output Promise<string> @permission local developer @precondition page loaded @postcondition interaction uses current ref @sideEffects none @offline supported @idempotency read only @errors missing reference @concurrency sequential @performance O(snapshot) @test output/playwright/library-smoke.json @since 1.0.0 */
async function getRef(text) {
  const snapshot = await call("browser_snapshot");
  for (const line of snapshot.split("\n")) if (line.includes(text) && line.includes("[ref=")) return line.match(/\[ref=([a-z]\w*)\]/)[1];
  throw new Error(`Missing ${text}: ${snapshot}`);
}
/** @functionId ECDICT-CLICK-001 @summary Click a current snapshot reference @module tools @input visible button text @output Promise<string> @permission local developer @precondition button visible @postcondition actual click completed @sideEffects media @offline supported @idempotency depends on button @errors MCP failure @concurrency sequential @performance bounded @test output/playwright/library-smoke.json @since 1.0.0 */
async function click(text) { return call("browser_click", { target: await getRef(text), element: text }); }

try {
  await call("browser_navigate", { url: "http://127.0.0.1:4174/" });
  await click('button "完整模式'); await click('button "进入我的学习空间'); await click('button "词库');
  const loaded = await call("browser_snapshot");
  if (!loaded.includes("8,512") || !loaded.includes("ECDICT · MIT") || !loaded.includes("MIT 许可证")) throw new Error("Real word book not loaded");
  await click('button "四级');
  if (!(await call("browser_snapshot")).includes("3,846")) throw new Error("CET4 tag count mismatch");
  await click('button "下一页');
  if (!(await call("browser_snapshot")).includes("第 2 /")) throw new Error("Pagination failed");
  await call("browser_type", { target: await getRef('textbox "搜索词库'), text: "adapt" });
  const searched = await call("browser_snapshot");
  if (!searched.includes('heading "adapt"') || !searched.includes("适应")) throw new Error("Search did not show real adapt entry");
  await call("browser_take_screenshot", { filename: resolve("output/playwright/ecdict-search.png"), fullPage: true, scale: "css" });
  // Browser context controls have no dedicated MCP tool; use this narrow snippet to exercise cached production reload.
  await call("browser_run_code_unsafe", { code: "async (page) => { await page.evaluate(async () => { await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker did not become ready')), 8000))]); }); await page.reload(); await page.waitForLoadState('networkidle'); await page.context().setOffline(true); await page.reload(); return { offline: true, title: await page.title() }; }" });
  await click('button "词库');
  await call("browser_type", { target: await getRef('textbox "搜索词库'), text: "adapt" });
  const offline = await call("browser_snapshot");
  if (!offline.includes('heading "adapt"') || !offline.includes("适应") || !offline.includes("8,512")) throw new Error("Offline wordbook unavailable");
  await call("browser_run_code_unsafe", { code: "async (page) => { await page.context().setOffline(false); return 'network restored'; }" });
  const messages = await call("browser_console_messages", { level: "error" });
  if (messages.includes("[ERROR]")) throw new Error(messages);
  await mkdir("output/playwright", { recursive: true });
  await writeFile("output/playwright/library-smoke.json", JSON.stringify({ status: "passed", verifiedAt: new Date().toISOString(), checks: ["8512 real entries", "3846 CET4 tag", "pagination", "English search and Chinese meaning", "production cached reload while offline"], limitations: ["Initial load must occur online/local preview running before caching", "Speech not tested"], evidence }, null, 2));
  console.log("ECDICT wordbook, filtering, search, pagination and offline reload passed."); console.log(messages);
} catch (error) { await mkdir("output/playwright", { recursive: true }); await writeFile("output/playwright/library-smoke-failure.json", JSON.stringify({ error: String(error), evidence }, null, 2)); console.error(error); process.exitCode = 1; }
finally { close(); }
