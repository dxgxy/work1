chrome.runtime.onMessage.addListener(function handleSpeechRequest(message, sender, sendResponse) {
  let url;
  try { url = new URL(sender.url); } catch { return false; }
  if (!["http://localhost:4173", "http://127.0.0.1:4173"].includes(url.origin) || message?.type !== "ci-buddy-speak" || typeof message.text !== "string" || !message.text.trim() || message.text.length > 5000 || !Number.isFinite(message.rate) || message.rate < 0.5 || message.rate > 2) return false;
  let finished = false;
  const timer = setTimeout(function timeOut() { respond({ ok: false, message: "Google 语音未开始播放，请检查语音服务或网络。" }); }, 6500);
  function respond(result) { if (finished) return; finished = true; clearTimeout(timer); sendResponse(result); }
  chrome.tts.getVoices(function selectGoogleVoice(voices) {
    if (chrome.runtime.lastError) { respond({ ok: false, message: chrome.runtime.lastError.message }); return; }
    const voice = voices.find(function isGoogleEnglishVoice(entry) { return /^en(?:-|$)/i.test(entry.lang ?? "") && /google/i.test(entry.voiceName ?? ""); });
    if (!voice) { respond({ ok: false, message: "未检测到 Google 英语语音。请先安装支持 chrome.tts 的 Google 英语语音引擎；本助手本身不提供语音引擎。" }); return; }
    chrome.tts.stop();
    chrome.tts.speak(message.text, { voiceName: voice.voiceName, lang: voice.lang, extensionId: voice.extensionId, rate: message.rate, enqueue: false, requiredEventTypes: ["start", "error"], onEvent: function speechEvent(event) {
      if (event.type === "start") respond({ ok: true, message: `正在通过 ${voice.voiceName} 播放`, voiceName: voice.voiceName });
      if (event.type === "error" || event.type === "interrupted" || event.type === "cancelled") respond({ ok: false, message: event.errorMessage || "发音已中断，请重试。" });
    } }, function checkSpeakError() { if (chrome.runtime.lastError) respond({ ok: false, message: chrome.runtime.lastError.message }); });
  });
  return true;
});
