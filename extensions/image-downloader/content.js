const CHANNEL = "ci-buddy-image-downloader-v1";
const MAX_ITEMS = 100;

function absoluteUrl(value) {
  try {
    const url = new URL(value, location.href);
    return ["http:", "https:", "data:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function addCandidate(items, seen, value, source) {
  const url = absoluteUrl(value);
  if (!url || seen.has(url) || items.length >= MAX_ITEMS) return;
  seen.add(url);
  items.push({ id: `${source}-${items.length}`, url, source });
}

function scanImages() {
  const items = [];
  const seen = new Set();
  document.querySelectorAll("img").forEach((image) => {
    addCandidate(items, seen, image.currentSrc || image.src, "img");
  });
  document.querySelectorAll("[style*='background-image']").forEach((element) => {
    const style = getComputedStyle(element).backgroundImage;
    const match = style.match(/url\(["']?(.*?)["']?\)/);
    if (match) addCandidate(items, seen, match[1], "background");
  });
  return { ok: true, channel: CHANNEL, title: document.title || "当前网页", items };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.channel !== CHANNEL || message.type !== "scan") return;
  sendResponse(scanImages());
  return true;
});

