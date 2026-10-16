import { useState, type ReactElement } from "react";
import { useAppStore } from "../store";
import { playPronunciation, getSpeechMessage } from "../domain/pronunciation";
import type { SpeechExtensionConfig } from "../types";

/** @functionId SPEECH-SETTINGS-001 @summary Configure and test the bundled speech extension @module speech @input none @output ReactElement @permission profile owner @precondition active profile @postcondition configuration saved locally @sideEffects local-db-write,media,network @offline settings supported @idempotency last-write-wins @errors extension and storage failures shown @concurrency test button disabled while pending @performance bounded @test output/playwright/import-smoke.json @since 1.0.0 */
export function SpeechSettings(): ReactElement {
  const profile = useAppStore((state) => state.profile)!;
  const update = useAppStore((state) => state.updateSpeechExtension);
  const [message, setMessage] = useState(""); const [testing, setTesting] = useState(false);
  /** @functionId SPEECH-CONFIG-001 @summary Save speech configuration and surface storage failures @module speech @input config patch @output void @permission profile owner @precondition active profile @postcondition UI changes only after persistence @sideEffects local-db-write @offline supported @idempotency last-write-wins @errors STORAGE_FAILED @concurrency synchronous @performance O(1) @test src/store.test.ts @since 1.0.0 */
  function updateSpeechConfig(config: Partial<SpeechExtensionConfig>): void { try { update(config); setMessage(""); } catch { setMessage("发音设置保存失败，请先释放本地存储空间。"); } }
  /** @functionId SPEECH-TEST-001 @summary Test the configured extension with one sentence @module speech @input current profile @output Promise<void> @permission profile owner @precondition user clicked test @postcondition actual result shown @sideEffects media,network @offline unavailable @idempotency repeatable @errors typed bridge result @concurrency test disabled while pending @performance 8000ms bound @test output/playwright/import-smoke.json @since 1.0.0 */
  async function handleSpeechTest(): Promise<void> { setTesting(true); const result = await playPronunciation("Welcome to your English learning journey.", 1, profile.speechExtension, profile.networkPolicy); setMessage(getSpeechMessage(result)); setTesting(false); }
  return <section className="panel settings-panel"><h3>Google 扩展发音</h3><p>附带扩展：词伴 Google 发音助手。通过 Chrome TTS 播放检测到的 Google 英语语音；它是本项目提供的助手，不是 Google 官方产品。</p>
    <ol><li>在 Chrome 打开 chrome://extensions，开启开发者模式。</li><li>点击“加载已解压的扩展程序”，选择项目下的 <code>extensions/google-pronunciation</code> 文件夹。</li><li>刷新当前网页，勾选启用后点击测试。没有 Google 英语语音时会提示，不会悄悄换成其他语音。</li></ol>
    <label><input type="checkbox" checked={profile.speechExtension?.enabled ?? false} onChange={(event) => updateSpeechConfig({ enabled: event.target.checked })} />启用词伴 Google 发音助手</label>
    <label>扩展 ID（可选，用于锁定已安装的助手）<input value={profile.speechExtension?.extensionId ?? ""} onChange={(event) => updateSpeechConfig({ extensionId: event.target.value.trim() })} placeholder="Chrome 扩展页面中的 32 位 ID" pattern="[a-p]{32}" /></label>
    <button className="secondary-button" disabled={testing} onClick={handleSpeechTest}>{testing ? "等待扩展…" : "测试 Google 英语发音"}</button><p role="status">{message}</p><small>播放内容会交给扩展和语音服务。手动离线及 Wi-Fi 手动模式下不启动该服务；实际发声需在安装了 Google 语音的 Chrome 环境验证。</small>
  </section>;
}
