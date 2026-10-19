import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const extensionPath = resolve("extensions/image-downloader");
const browserCandidates = [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, "C:/Users/31918/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe", chromium.executablePath()].filter(Boolean);
const executablePath = browserCandidates.find((candidate) => existsSync(candidate));
if (!executablePath) throw new Error("No Playwright Chromium executable found");
const outputDir = resolve("output/playwright");
const downloadDir = resolve(outputDir, "extension-downloads");
await mkdir(downloadDir, { recursive: true });
const context = await chromium.launchPersistentContext(resolve(outputDir, ".extension-profile"), { executablePath, headless: true, acceptDownloads: true, downloadsPath: downloadDir, args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`] });
try {
  const demoUrl = process.env.CI_BUDDY_TEST_URL || "http://127.0.0.1:4173/plugin/demo.html";
  const demoPage = await context.newPage();
  await demoPage.goto(demoUrl);
  const manager = await context.newPage();
  await manager.goto("chrome://extensions");
  const extensionId = await manager.evaluate(() => {
    const list = document.querySelector("extensions-manager")?.shadowRoot?.querySelector("extensions-item-list")?.shadowRoot;
    const item = list?.querySelector("extensions-item");
    if (!item?.id) throw new Error("Loaded extension not found in chrome://extensions");
    return item.id;
  });
  const probe = await context.newPage();
  await probe.goto(`chrome-extension://${extensionId}/popup.html?demo=1`);
  await demoPage.bringToFront();
  const scan = await probe.evaluate(() => new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return resolve({ ok: false, error: "active demo tab not found" });
      chrome.tabs.sendMessage(tabs[0].id, { channel: "ci-buddy-image-downloader-v1", type: "scan" }, resolve);
    });
  }));
  if (!scan?.ok || scan.items?.length !== 4) throw new Error(`Expected 4 scanned images, got ${JSON.stringify(scan)}`);
  await probe.close();
  const popup = await context.newPage();
  await popup.setViewportSize({ width: 360, height: 480 });
  await popup.goto(`chrome-extension://${extensionId}/popup.html?demo=1`);
  if (await popup.locator(".item").count() !== 3) throw new Error("Demo popup did not render three preview items");
  await popup.screenshot({ path: resolve(outputDir, "image-downloader-real-popup.png"), fullPage: true });
  await popup.getByRole("button", { name: "下载选中图片" }).click();
  await writeFile(resolve(outputDir, "image-downloader-smoke.json"), JSON.stringify({ verifiedAt: new Date().toISOString(), status: "passed", browser: executablePath, extensionId, scannedItems: scan.items.length, popupItems: await popup.locator(".item").count(), screenshot: "output/playwright/image-downloader-real-popup.png", limitations: ["Download API is exercised in headless Chromium; Chrome Web Store publishing and GitHub Pages hosting remain manual submission steps."] }, null, 2));
  console.log("Extension scan and popup smoke passed.");
} finally {
  await context.close();
}

