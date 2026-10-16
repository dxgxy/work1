import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

interface TtsVoice { voiceName: string; lang: string; extensionId?: string }
interface TtsEvent { type: string; errorMessage?: string }
interface SpeakOptions { voiceName: string; onEvent: (event: TtsEvent) => void }
type Handler = (message: unknown, sender: { url: string }, reply: (value: unknown) => void) => boolean;

function getHarness(voices: TtsVoice[]) {
  let handler: Handler = () => false;
  const speak = vi.fn((_text: string, options: SpeakOptions) => options.onEvent({ type: "start" }));
  runInNewContext(readFileSync("extensions/google-pronunciation/background.js", "utf8"), {
    chrome: { runtime: { onMessage: { addListener: (listener: Handler) => { handler = listener; } } }, tts: { getVoices: (callback: (voices: TtsVoice[]) => void) => callback(voices), stop: vi.fn(), speak } }, URL, setTimeout, clearTimeout,
  });
  return { speak, invoke: (origin = "http://127.0.0.1:4173/") => { const reply = vi.fn(); handler({ type: "ci-buddy-speak", text: "hello", rate: 1 }, { url: origin }, reply); return reply; } };
}

describe("bundled extension voice routing", () => {
  it("does not substitute a system voice when no Google engine is installed", () => {
    const harness = getHarness([{ voiceName: "Microsoft English", lang: "en-US" }]); const reply = harness.invoke();
    expect(harness.speak).not.toHaveBeenCalled(); expect(reply).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
  });
  it("selects only Google English and acknowledges an actual start event", () => {
    const harness = getHarness([{ voiceName: "Google 中文", lang: "zh-CN" }, { voiceName: "Google US English", lang: "en-US" }]); const reply = harness.invoke();
    expect(harness.speak.mock.calls[0][1].voiceName).toBe("Google US English"); expect(reply).toHaveBeenCalledWith(expect.objectContaining({ ok: true, voiceName: "Google US English" }));
  });
  it("ignores requests outside the configured local origin", () => {
    const harness = getHarness([{ voiceName: "Google US English", lang: "en-US" }]);
    expect(harness.invoke("https://untrusted.example/")).not.toHaveBeenCalled(); expect(harness.speak).not.toHaveBeenCalled();
  });
});
