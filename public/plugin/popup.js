const CHANNEL = "ci-buddy-image-downloader-v1";
const state = document.querySelector("#state");
const list = document.querySelector("#list");
const count = document.querySelector("#count");
const downloadButton = document.querySelector("#download");
const selectAllButton = document.querySelector("#selectAll");
let items = [];
const demoItems = [
  { id: "demo-1", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 90'%3E%3Crect width='120' height='90' fill='%23dff1e8'/%3E%3Ccircle cx='60' cy='43' r='25' fill='%23167556'/%3E%3C/svg%3E" },
  { id: "demo-2", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 90'%3E%3Crect width='120' height='90' fill='%23fff0d5'/%3E%3Crect x='38' y='18' width='44' height='54' rx='8' fill='%23d38f55'/%3E%3C/svg%3E" },
  { id: "demo-3", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 90'%3E%3Crect width='120' height='90' fill='%23ece8ff'/%3E%3Cpath d='M25 70 60 18l35 52Z' fill='%23756bc0'/%3E%3C/svg%3E" },
];

/** Show a user-readable scan or download failure. */
function showError(message) {
  state.textContent = message;
  state.classList.add("error");
  count.textContent = "无法扫描";
}

/** Render the current scan result and reset the selection controls. */
function render() {
  list.replaceChildren();
  if (!items.length) {
    state.textContent = "当前网页没有找到可下载的图片。";
    count.textContent = "0 张";
    downloadButton.disabled = true;
    return;
  }
  state.textContent = "勾选图片后下载到本地。";
  count.textContent = `${items.length} 张`;
  for (const item of items) {
    const row = document.createElement("label");
    row.className = "item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.dataset.url = item.url;
    checkbox.addEventListener("change", updateDownloadState);
    const image = document.createElement("img");
    image.src = item.url;
    image.alt = "网页图片预览";
    const text = document.createElement("span");
    text.textContent = item.url;
    row.append(checkbox, image, text);
    list.append(row);
  }
  updateDownloadState();
}

/** Keep the download button and select-all label in sync with checked rows. */
function updateDownloadState() {
  const selected = list.querySelectorAll("input:checked");
  downloadButton.disabled = selected.length === 0;
  selectAllButton.textContent = selected.length === items.length ? "取消全选" : "全选";
}

/** Return a safe image extension for the browser download filename. */
function getImageExtension(value) {
  if (value.startsWith("data:image/png")) return "png";
  if (value.startsWith("data:image/gif")) return "gif";
  if (value.startsWith("data:image/webp")) return "webp";
  try {
    const pathname = decodeURIComponent(new URL(value).pathname);
    const match = pathname.match(/\.([a-z0-9]{2,5})$/i);
    if (match && ["avif", "gif", "jpeg", "jpg", "png", "webp"].includes(match[1].toLowerCase())) return match[1].toLowerCase();
  } catch { /* malformed URLs are rejected by content.js before reaching here */ }
  return "jpg";
}

/** Request a scan from the content script while preserving runtime.lastError. */
function requestScan(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { channel: CHANNEL, type: "scan" }, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!response?.ok) return reject(new Error("scan failed"));
      resolve(response);
    });
  });
}

/** Read the active page and render the image candidates. */
async function scan() {
  if (new URLSearchParams(location.search).has("demo")) {
    items = demoItems;
    render();
    return;
  }
  if (typeof chrome === "undefined" || !chrome.tabs) {
    items = demoItems;
    render();
    return;
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("no active tab");
    const response = await requestScan(tab.id);
    items = response.items || [];
    render();
  } catch {
    showError("当前页面不允许扩展读取图片，请换一个普通网页。已打开 chrome:// 的页面无法扫描。");
  }
}

/** Submit the selected image URLs and report partial download failures. */
async function downloadSelected() {
  const selected = [...list.querySelectorAll("input:checked")].map((input) => input.dataset.url).filter(Boolean);
  if (typeof chrome === "undefined" || !chrome.downloads) {
    state.textContent = `演示模式：已选择 ${selected.length} 张图片。`;
    return;
  }
  let completed = 0;
  for (const [index, url] of selected.entries()) {
    try {
      await chrome.downloads.download({ url, filename: `ci-buddy-images/image-${String(index + 1).padStart(2, "0")}.${getImageExtension(url)}`, saveAs: false, conflictAction: "uniquify" });
      completed += 1;
    } catch { /* continue so one inaccessible image does not hide successful downloads */ }
  }
  state.textContent = completed === selected.length
    ? `已提交 ${completed} 个下载任务，请查看浏览器下载列表。`
    : `已提交 ${completed}/${selected.length} 个下载任务，失败图片可能受网页权限限制。`;
}

downloadButton.addEventListener("click", downloadSelected);
selectAllButton.addEventListener("click", () => {
  const all = list.querySelectorAll("input");
  const shouldCheck = [...all].some((input) => !input.checked);
  all.forEach((input) => { input.checked = shouldCheck; });
  updateDownloadState();
});

scan();


