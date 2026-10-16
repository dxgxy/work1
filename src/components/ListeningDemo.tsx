import { useState, type ReactElement } from "react";

/** @functionId SPEECH-DEMO-001 @summary Present sentence pronunciation examples @module listening @input speak callback @output ReactElement @permission local user @precondition mounted @postcondition no cached-audio claims @sideEffects media,network @offline unavailable @idempotency repeatable @errors displayed by shared notice @concurrency bridge handles start acknowledgement @performance O(1) @test output/playwright/import-smoke.json @since 1.0.0 */
export function ListeningDemo({ speak }: { speak: (text: string, rate: number) => void }): ReactElement {
  const [speed, setSpeed] = useState(1);
  return <><div className="section-intro"><div><span className="section-kicker">LISTENING LAB</span><h2>句子发音练习</h2><p>通过独立 Google 发音助手试听示例句。这些句子没有离线音频文件。</p></div></div>
    <section className="panel settings-panel"><label>语速<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option></select></label>
    {["Small habits sustain long-term progress.", "You do not need a perfect plan to start.", "Just return to the next useful moment."].map((line) => <p key={line}><button className="secondary-button" onClick={() => speak(line, speed)}>播放</button> {line}</p>)}</section></>;
}
