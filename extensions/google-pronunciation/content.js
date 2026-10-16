/* Bridge is deliberately limited to the local Vite/preview port. No remote pages or audio files are accessed. */
if (location.port === "4173") {
  window.addEventListener("message", async function receiveSpeechRequest(event) {
    if (event.source !== window || event.origin !== location.origin) return;
    const data = event.data;
    if (data?.channel !== "ci-buddy-speech-v1" || data.type !== "speak" || typeof data.requestId !== "string" || typeof data.text !== "string" || data.text.length > 5000 || !Number.isFinite(data.rate) || data.rate < 0.5 || data.rate > 2) return;
    let result;
    try { result = await chrome.runtime.sendMessage({ type: "ci-buddy-speak", text: data.text, rate: data.rate }); }
    catch { result = { ok: false, message: "扩展连接中断，请刷新网页后重试。" }; }
    window.postMessage({ ...result, channel: "ci-buddy-speech-v1", type: "response", requestId: data.requestId, extensionId: chrome.runtime.id }, location.origin);
  });
}
