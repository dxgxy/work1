import { describe, it, expect, vi } from "vitest";
import { playPronunciation } from "./pronunciation";

describe("pronunciation bridge", () => {
  it("never starts speech while offline or disabled", async () => {
    const postMessage = vi.fn(); const target = { postMessage } as unknown as Window;
    expect((await playPronunciation("hello", 1, { enabled: true, extensionId: "", extensionName: "test" }, "manual_offline", target)).ok).toBe(false);
    expect((await playPronunciation("hello", 1, undefined, "online", target)).ok).toBe(false); expect(postMessage).not.toHaveBeenCalled();
  });
  it("checks origin, request ID and configured extension ID, then cleans up", async () => {
    let receive: (event: MessageEvent) => void = () => undefined;
    let request: Record<string, unknown> = {};
    const removeEventListener = vi.fn();
    const target = { location: { origin: "http://127.0.0.1:4173" }, addEventListener: (_: string, listener: typeof receive) => { receive = listener; }, removeEventListener, postMessage: (message: Record<string, unknown>) => { request = message; } } as unknown as Window;
    const extensionId = "a".repeat(32);
    const result = playPronunciation("hello", 1, { enabled: true, extensionId, extensionName: "test" }, "online", target);
    receive({ source: target, origin: "https://untrusted.example", data: { ...request, type: "response", ok: true, message: "fake", extensionId: "trusted" } } as unknown as MessageEvent);
    expect(removeEventListener).not.toHaveBeenCalled();
    receive({ source: target, origin: target.location.origin, data: { ...request, type: "response", ok: false, message: "no voice", extensionId } } as unknown as MessageEvent);
    expect(await result).toMatchObject({ ok: false, error: { code: "EXTENSION_FAILED", details: { message: "no voice" } } }); expect(removeEventListener).toHaveBeenCalledOnce();
  });
});
