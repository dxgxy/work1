import { request, close } from "./browser-console.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const evidence = [];
async function call(name, args = {}) {
  const result = await request("tools/call", { name, arguments: args });
  const text = result.content?.filter((block) => block.type === "text").map((block) => block.text).join("\n") || "";
  evidence.push({ tool: name, result: text });
  if (result.isError) throw new Error(text);
  return text;
}
async function clickSnapshotText(text) {
  const snapshot = await call("browser_snapshot");
  const line = snapshot.split("\n").find((line) => line.includes(text) && line.includes("[ref="));
  const ref = line?.match(/\[ref=([a-z]\w*)\]/)?.[1];
  if (!ref) throw new Error(`No snapshot ref for ${text}: ${snapshot}`);
  return call("browser_click", { target: ref, element: text });
}

try {
  await call("browser_navigate", { url: "http://127.0.0.1:4173/" });
  await clickSnapshotText('button "完整模式');
  await clickSnapshotText('button "进入我的学习空间');
  await clickSnapshotText('button "词库');
  await clickSnapshotText('button "批量导入');
  await call("browser_snapshot");
  await clickSnapshotText('button "选择词书文件');
  await call("browser_file_upload", { paths: [resolve("public/templates/wordbook.csv")] });
  const preview = await call("browser_snapshot");
  if (!preview.includes("可导入 1 条") || !preview.includes("重复 1 条")) throw new Error(`Unexpected preview: ${preview}`);
  await clickSnapshotText('button "确认导入 1 张卡片');
  if (!(await call("browser_snapshot")).includes("已导入 1 张卡片")) throw new Error("Missing success notice");
  await clickSnapshotText('button "完成');
  await clickSnapshotText('button "设置');
  await clickSnapshotText('button "测试 Google 英语发音');
  if (!(await call("browser_snapshot")).includes("请先在设置中启用并安装")) throw new Error("Missing disabled-extension notice");
  await call("browser_resize", { width: 390, height: 844 });
  await call("browser_take_screenshot", { filename: resolve("output/playwright/settings-mobile.png"), fullPage: true, scale: "css" });
  const consoleMessages = await call("browser_console_messages", { level: "error" });
  console.log(consoleMessages);
  await mkdir("output/playwright", { recursive: true });
  await writeFile("output/playwright/import-smoke.json", JSON.stringify({ verifiedAt: new Date().toISOString(), status: "passed", browser: "Microsoft Edge headless, isolated", limitations: ["Google extension not installed in this test browser", "Actual audio and Oxford API calls not verified"], evidence }, null, 2));
  console.log("Import preview, confirmation, and disabled-extension notice passed.");
} catch (error) { console.error(error); process.exitCode = 1; }
finally { close(); }
