import { useEffect, useState, type ReactElement } from "react";
import { getSpeechMessage, type SpeechResult } from "../domain/pronunciation";

/** @functionId SPEECH-NOTICE-001 @summary Announce actual speech status @module speech @input none @output ReactElement|null @permission local user @precondition mounted @postcondition unavailable speech is visible @sideEffects notification @offline supported @idempotency last result displayed @errors none @concurrency event listener cleaned up @performance O(1) @test output/playwright/import-smoke.json @since 1.0.0 */
export function SpeechNotice(): ReactElement | null {
  const [result, setResult] = useState<SpeechResult | null>(null);
  useEffect(() => {
    function announce(event: Event): void { setResult((event as CustomEvent<SpeechResult>).detail); }
    window.addEventListener("ci-buddy-speech-status", announce);
    return () => window.removeEventListener("ci-buddy-speech-status", announce);
  }, []);
  return result ? <div className="speech-notice" role="status"><span>{getSpeechMessage(result)}</span><button onClick={() => setResult(null)} aria-label="关闭发音提示">×</button></div> : null;
}
