import type { NetworkPolicy, SpeechExtensionConfig, Result } from "../types";

export type SpeechError = "EXTENSION_DISABLED" | "OFFLINE" | "INVALID_INPUT" | "EXTENSION_UNAVAILABLE" | "EXTENSION_FAILED";
export type SpeechResult = Result<{ message: string; voiceName?: string }, SpeechError>;

/** @functionId SPEECH-ERROR-001 @summary Build a typed pronunciation failure @module speech @input code,message @output SpeechResult @permission none @precondition none @postcondition no false success @sideEffects none @offline supported @idempotency pure @errors none @concurrency synchronous @performance O(1) @test src/domain/pronunciation.test.ts @since 1.0.0 */
function speechFailure(code: SpeechError, message: string): SpeechResult { return { ok: false, error: { code, messageKey: `speech.${code}`, retryable: code === "EXTENSION_UNAVAILABLE" || code === "EXTENSION_FAILED", details: { message } } }; }

/** @functionId SPEECH-MESSAGE-001 @summary Map a speech result to its status text @module speech @input SpeechResult @output string @permission none @precondition typed result @postcondition success or error visible @sideEffects none @offline supported @idempotency pure @errors none @concurrency synchronous @performance O(1) @test src/domain/pronunciation.test.ts @since 1.0.0 */
export function getSpeechMessage(result: SpeechResult): string { return result.ok ? result.value.message : String(result.error.details?.message ?? result.error.messageKey); }

/** @functionId SPEECH-PLAY-001 @summary Request pronunciation from the bundled Chrome extension @module speech @input text,rate,configuration,networkPolicy @output Promise<SpeechResult> @permission local user @precondition user clicked play @postcondition only a real start event reports playback @sideEffects media,network @offline unavailable @idempotency requestId isolates replies @errors EXTENSION_DISABLED,OFFLINE,INVALID_INPUT,EXTENSION_UNAVAILABLE,EXTENSION_FAILED @concurrency listener removed after completion @performance timeout 8000ms @test src/domain/pronunciation.test.ts @since 1.0.0 */
export function playPronunciation(text: string, rate: number, config: SpeechExtensionConfig | undefined, policy: NetworkPolicy = "online", target: Window = window): Promise<SpeechResult> {
  if (policy !== "online") return Promise.resolve(speechFailure("OFFLINE", "Google 扩展可能使用网络，请先在设置中切换为在线模式。"));
  if (!config?.enabled) return Promise.resolve(speechFailure("EXTENSION_DISABLED", "请先在设置中启用并安装“词伴 Google 发音助手”扩展。"));
  if (!text.trim() || text.length > 5000 || !Number.isFinite(rate) || rate < 0.5 || rate > 2 || (config.extensionId && !/^[a-p]{32}$/.test(config.extensionId))) return Promise.resolve(speechFailure("INVALID_INPUT", "发音文本、语速或扩展 ID 无效。"));
  const requestId = crypto.randomUUID();
  return new Promise<SpeechResult>((resolve) => {
    const timer = setTimeout(() => finish(speechFailure("EXTENSION_UNAVAILABLE", "扩展未响应。请在 Chrome 中加载附带扩展，然后刷新网页。")), 8000);
    /** @functionId SPEECH-FINISH-001 @summary Complete and clean up a pronunciation request @module speech @input SpeechResult @output void @permission local user @precondition request pending @postcondition timer and listener cleared @sideEffects none @offline supported @idempotency Promise resolves once @errors none @concurrency request-scoped @performance O(1) @test src/domain/pronunciation.test.ts @since 1.0.0 */
    function finish(result: SpeechResult): void { clearTimeout(timer); target.removeEventListener("message", receive); resolve(result); }
    /** @functionId SPEECH-REPLY-001 @summary Validate bridge reply before completing request @module speech @input MessageEvent @output void @permission same window origin @precondition request pending @postcondition unrelated replies ignored @sideEffects none @offline unavailable @idempotency requestId isolated @errors returned typed result @concurrency request-scoped listener @performance O(1) @test src/domain/pronunciation.test.ts @since 1.0.0 */
    function receive(event: MessageEvent): void {
      if (event.source !== target || event.origin !== target.location.origin) return;
      const data = event.data;
      if (data?.channel !== "ci-buddy-speech-v1" || data.type !== "response" || data.requestId !== requestId || (config?.extensionId && data.extensionId !== config.extensionId)) return;
      if (typeof data.ok !== "boolean" || typeof data.message !== "string") return;
      finish(data.ok ? { ok: true, value: { message: data.message, voiceName: typeof data.voiceName === "string" ? data.voiceName : undefined } } : speechFailure("EXTENSION_FAILED", data.message));
    }
    target.addEventListener("message", receive);
    try { target.postMessage({ channel: "ci-buddy-speech-v1", type: "speak", requestId, text, rate }, target.location.origin); }
    catch { finish(speechFailure("EXTENSION_UNAVAILABLE", "无法连接发音扩展，请刷新网页后重试。")); }
  });
}
