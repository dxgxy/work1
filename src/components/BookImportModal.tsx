import { useState, type ChangeEvent, type ReactElement } from "react";
import { parseBookFile, mapRowsToCards, getCardKey, mapImportErrors, importLimits, type ImportPreview } from "../domain/bookImport";
import { useAppStore } from "../store";

/** @functionId IMPORT-PREVIEW-001 @summary Preview and confirm a local word-book import @module books @input onClose @output ReactElement @permission local user @precondition mounted @postcondition storage changes only after explicit confirmation @sideEffects local-db-write @offline supported @idempotency duplicate rows skipped @errors STORAGE_FAILED,FILE_READ_FAILED @concurrency file selection disabled while reading @performance bounded to 10 MiB @test output/playwright/import-smoke.json @since 1.0.0 */
export function BookImportModal({ onClose }: { onClose: () => void }): ReactElement {
  const cards = useAppStore((state) => state.cards);
  const importCards = useAppStore((state) => state.importCards);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [allowPartial, setAllowPartial] = useState(false);
  const [done, setDone] = useState(false);
  const known = new Set(cards.map(getCardKey));
  const fresh = preview?.rows.filter((row) => !known.has(getCardKey(row))) ?? [];
  const skipped = (preview?.duplicateRows.length ?? 0) + (preview ? preview.rows.length - fresh.length : 0);

  /** @functionId IMPORT-SELECT-001 @summary Read a local file into preview state @module books @input change event @output Promise<void> @permission local user @precondition selected file @postcondition no cards written @sideEffects local-db-read @offline supported @idempotency preview replaced @errors displayed read error @concurrency picker disabled while reading @performance 10MiB bound @test output/playwright/import-smoke.json @since 1.0.0 */
  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]; setPreview(null); setMessage(""); setAllowPartial(false); setDone(false);
    if (!file) return;
    if (file.size > importLimits.maxBytes) { setMessage("文件超过 10 MiB，请拆分后再导入。"); return; }
    setBusy(true);
    try { setPreview(parseBookFile(await file.arrayBuffer(), file.name)); } catch { setMessage("无法读取文件，请重新选择。"); } finally { setBusy(false); }
  }

  /** @functionId IMPORT-CONFIRM-001 @summary Commit explicitly confirmed valid rows @module books @input preview state @output void @permission local user @precondition valid rows and partial consent when needed @postcondition success only after durable write @sideEffects local-db-write @offline supported @idempotency existing cards skipped @errors STORAGE_FAILED @concurrency synchronous localStorage write @performance O(n) @test src/store.test.ts @since 1.0.0 */
  function submitBookImport(): void {
    if (!preview || !fresh.length || (preview.errors.length > 0 && !allowPartial)) return;
    try { importCards(mapRowsToCards(fresh)); setDone(true); setMessage(`已导入 ${fresh.length} 张卡片，跳过 ${skipped} 条重复记录。`); }
    catch { setMessage("保存失败：本地存储可能已满。卡片未导入，请导出备份、释放空间后重试。"); }
  }

  return <div className="modal-backdrop"><section className="modal-card import-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
    <button className="close-button" onClick={onClose} aria-label="关闭导入">×</button><h2 id="import-title">批量导入词书</h2>
    <p>先下载模板，再按固定列填写。UTF-8 编码，最多 10 MiB / 10,000 条；不会上传文件。</p>
    <p><a href="/templates/wordbook.csv" download>CSV 模板</a> · <a href="/templates/wordbook.txt" download>TXT 制表符模板</a> · <a href="/templates/wordbook.json" download>JSON 模板</a> · <a href="/templates/format.html" target="_blank" rel="noreferrer">完整格式说明</a></p>
    <div className="setting-hint"><span>必填：<code>kind,text,translation</code>。kind 只能是 word 或 sentence；可选列必须依次追加。CSV 含逗号、引号或换行时用双引号包裹，不能直接导入普通词汇清单或备份 JSON。</span></div>
    <label>选择词书文件<input type="file" accept=".csv,.txt,.json" disabled={busy} onChange={handleFileSelection} /></label>
    {busy && <p role="status">正在读取与校验…</p>}
    {preview && !done && <><p>可导入 {fresh.length} 条 · 重复 {skipped} 条 · 错误 {preview.errors.length} 条</p>
      {preview.errors.length > 0 && <div className="import-errors"><ul>{preview.errors.slice(0, 10).map((error, index) => <li key={index}>第 {error.rowNumber} 行：{error.message}</li>)}</ul><a download="wordbook-errors.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(mapImportErrors(preview.errors))}`}>下载全部错误</a>{fresh.length > 0 && <label><input type="checkbox" checked={allowPartial} onChange={(event) => setAllowPartial(event.target.checked)} />我确认仅导入有效记录，跳过错误行</label>}</div>}
      {fresh.length > 0 && <div className="import-table"><table><thead><tr><th>行</th><th>类型</th><th>原文</th><th>译文</th></tr></thead><tbody>{fresh.slice(0, 20).map((row) => <tr key={row.rowNumber}><td>{row.rowNumber}</td><td>{row.kind}</td><td>{row.text}</td><td>{row.translation}</td></tr>)}</tbody></table>{fresh.length > 20 && <p>仅预览前 20 条，确认后导入全部有效记录。</p>}</div>}
      <button className="primary wide" disabled={busy || fresh.length === 0 || (preview.errors.length > 0 && !allowPartial)} onClick={submitBookImport}>确认导入 {fresh.length} 张卡片</button></>}
    {message && <p role="status">{message}</p>}{done && <button className="primary" onClick={onClose}>完成</button>}
  </section></div>;
}
