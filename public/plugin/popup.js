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

function showError(message) {
  state.textContent = message;
  state.classList.add("error");
  count.textContent = "无法扫描";
}

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

function updateDownloadState() {
  const selected = list.querySelectorAll("input:checked");
  downloadButton.disabled = selected.length === 0;
  selectAllButton.textContent = selected.length === items.length ? "取消全选" : "全选";
}

async function scan() {
  if (typeof chrome === "undefined" || !chrome.tabs) {
    items = demoItems;
    render();
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return showError("无法读取当前标签页。请在普通网页中重试。");
  chrome.tabs.sendMessage(tab.id, { channel: CHANNEL, type: "scan" }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) return showError("当前页面不允许扩展读取图片，请换一个普通网页。");
    items = response.items || [];
    render();
  });
}

downloadButton.addEventListener("click", async () => {
  const selected = [...list.querySelectorAll("input:checked")].map((input) => input.dataset.url);
  if (typeof chrome === "undefined" || !chrome.downloads) {
    state.textContent = `演示模式：已选择 ${selected.length} 张图片。`;
    return;
  }
  for (const [index, url] of selected.entries()) {
    const extension = url.startsWith("data:image/png") ? "png" : "jpg";
    await chrome.downloads.download({ url, filename: `ci-buddy-images/image-${String(index + 1).padStart(2, "0")}.${extension}`, saveAs: false, conflictAction: "uniquify" });
  }
  state.textContent = `已提交 ${selected.length} 个下载任务，请查看浏览器下载列表。`;
});

selectAllButton.addEventListener("click", () => {
  const all = list.querySelectorAll("input");
  const shouldCheck = [...all].some((input) => !input.checked);
  all.forEach((input) => { input.checked = shouldCheck; });
  updateDownloadState();
});

scan();
