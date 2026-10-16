import { useState, type ChangeEvent, type ReactElement } from "react";
import { Volume2 } from "lucide-react";
import { useAppStore } from "../store";
import type { Card, StoreState } from "../types";
import { BookImportModal } from "./BookImportModal";

const PAGE_SIZE = 48;
const filters = ["全部", "中考", "高考", "四级", "六级", "雅思", "我的导入", "我的卡片", "演示"];

/** @functionId LIBRARY-CARDS-001 @summary Select only library cards @module books @input StoreState @output Card[] @permission none @precondition store initialized @postcondition no mutation @sideEffects none @offline supported @idempotency pure @errors none @concurrency read only @performance O(1) @test src/data/ecdictCards.test.ts @since 1.0.0 */
function selectCards(state: StoreState): Card[] { return state.cards; }

/** @functionId LIBRARY-PAGE-001 @summary Browse and search bundled offline word books @module books @input speak callback @output ReactElement @permission local user @precondition profile initialized @postcondition at most 48 cards rendered at once @sideEffects local-db-write,media @offline supported except pronunciation @idempotency filters do not change data @errors import failures shown in modal @concurrency render scoped @performance O(n) filter,48 rendered cards @test output/playwright/library-smoke.json @since 1.0.0 */
export function LibraryPage({ speak }: { speak: (text: string) => void }): ReactElement {
  const cards = useAppStore(selectCards);
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("全部"); const [page, setPage] = useState(0); const [importing, setImporting] = useState(false);
  const [adding, setAdding] = useState(false); const [word, setWord] = useState(""); const [translation, setTranslation] = useState(""); const [message, setMessage] = useState("");
  const keyword = query.trim().toLowerCase(); const matching: Card[] = []; const exact: Card[] = []; let ecdictCount = 0;
  for (const card of cards) {
    if (card.contentProvider === "ecdict") ecdictCount += 1;
    const categoryMatch = filter === "全部" || card.bookTags?.includes(filter) || (filter === "我的导入" && card.sourceType === "imported") || (filter === "我的卡片" && card.sourceType === "user") || (filter === "演示" && card.contentProvider === "demo-fixture");
    if (categoryMatch && `${card.text} ${card.translation} ${card.definition ?? ""}`.toLowerCase().includes(keyword)) {
      if (keyword && card.text.toLowerCase() === keyword) { if (card.contentProvider === "ecdict") exact.unshift(card); else exact.push(card); }
      else matching.push(card);
    }
  }
  matching.unshift(...exact);
  const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE)); const currentPage = Math.min(page, totalPages - 1);
  const visible = matching.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  /** @functionId LIBRARY-SEARCH-001 @summary Update search without losing cards @module books @input input event @output void @permission local user @precondition mounted @postcondition first page selected @sideEffects none @offline supported @idempotency same query same view @errors none @concurrency render state @performance O(1) @test output/playwright/library-smoke.json @since 1.0.0 */
  function handleSearch(event: ChangeEvent<HTMLInputElement>): void { setQuery(event.target.value); setPage(0); }
  /** @functionId LIBRARY-ADD-001 @summary Save a user-authored card @module books @input local form fields @output void @permission local user @precondition required fields @postcondition card persisted before closing @sideEffects local-db-write @offline supported @idempotency unique ID per save @errors storage failure displayed @concurrency synchronous @performance O(n) store append @test src/store.test.ts @since 1.0.0 */
  function submitCard(): void {
    if (!word.trim() || !translation.trim()) return;
    try { useAppStore.getState().addCard({ id: `user-${crypto.randomUUID()}`, kind: "word", text: word.trim(), translation: translation.trim(), category: "我的卡片", sourceType: "user", contentProvider: "user", contentLicense: "user-owned", audioAvailable: false, pronunciationProvider: "google-extension" }); setAdding(false); setWord(""); setTranslation(""); setMessage(""); }
    catch { setMessage("本地保存失败，请先导出备份并释放存储空间。"); }
  }

  return <><div className="section-intro"><div><span className="section-kicker">OFFLINE WORD BOOKS</span><h2>词库与卡片</h2><p>已内置 {ecdictCount.toLocaleString()} 个 ECDICT 单词，含中文释义与可用音标，无需 API。</p></div><div className="intro-actions"><button className="secondary-button" onClick={(): void => setImporting(true)}>批量导入</button><button className="primary" onClick={(): void => setAdding(true)}>添加卡片</button></div></div>
    <section className="panel dictionary-summary"><h3>ECDICT 离线英汉学习词库</h3><p>按中考、高考、四级、六级、雅思标签筛选；同一单词可属于多个词书，分类数量不可直接相加。标签来自上游历史数据，不代表当前官方考试大纲。</p><p><a href="https://github.com/skywind3000/ECDICT" target="_blank" rel="noreferrer">词库来源：skywind3000/ECDICT</a> · <a href="/licenses/ECDICT-MIT.txt" target="_blank" rel="noreferrer">MIT 许可证</a> · <strong>文字卡片已随应用内置，可离线查看</strong></p></section>
    <div className="library-toolbar"><div className="tabs book-filter">{filters.map((label: string): ReactElement => <button key={label} className={filter === label ? "active" : ""} onClick={(): void => { setFilter(label); setPage(0); }}>{label}</button>)}</div><label className="search-field">搜索词库<input aria-label="搜索词库" value={query} onChange={handleSearch} placeholder="输入英文、中文或释义" /></label></div>
    <p role="status">找到 {matching.length.toLocaleString()} 张卡片 · 第 {currentPage + 1} / {totalPages} 页 · 每页 {PAGE_SIZE} 张</p>
    <div className="card-grid">{visible.map((card: Card): ReactElement => <DictionaryCard key={card.id} card={card} speak={speak} />)}</div>
    {!matching.length && <div className="empty-state"><h3>没有匹配的卡片</h3><p>试试其他分类或关键词。</p></div>}
    <div className="library-pagination"><button className="secondary-button" disabled={currentPage === 0} onClick={(): void => setPage(currentPage - 1)}>上一页</button><span>{currentPage + 1} / {totalPages}</span><button className="secondary-button" disabled={currentPage + 1 >= totalPages} onClick={(): void => setPage(currentPage + 1)}>下一页</button></div>
    {importing && <BookImportModal onClose={(): void => setImporting(false)} />}
    {adding && <div className="modal-backdrop"><section className="modal-card compact" role="dialog" aria-modal="true" aria-labelledby="add-title"><button className="close-button" aria-label="关闭添加卡片" onClick={(): void => setAdding(false)}>×</button><h2 id="add-title">添加我的单词卡</h2><label>原文<input value={word} maxLength={5000} onChange={(event: ChangeEvent<HTMLInputElement>): void => setWord(event.target.value)} /></label><label>中文释义<input value={translation} maxLength={5000} onChange={(event: ChangeEvent<HTMLInputElement>): void => setTranslation(event.target.value)} /></label><button className="primary" disabled={!word.trim() || !translation.trim()} onClick={submitCard}>保存卡片</button><p role="status">{message}</p></section></div>}
  </>;
}

/** @functionId LIBRARY-CARD-001 @summary Render a real dictionary entry with provenance @module books @input Card,speak callback @output ReactElement @permission local user @precondition typed card @postcondition provider labelled accurately @sideEffects media on user click @offline text supported @idempotency render only @errors speech notice owned by parent @concurrency render scoped @performance O(1) @test output/playwright/library-smoke.json @since 1.0.0 */
function DictionaryCard({ card, speak }: { card: Card; speak: (text: string) => void }): ReactElement {
  const source = card.contentProvider === "ecdict" ? "ECDICT · MIT" : card.contentProvider === "oxford-dictionaries-api" ? "Oxford 授权词条" : card.contentProvider === "demo-fixture" ? "演示数据" : card.sourceType === "imported" ? "用户导入" : "我的卡片";
  return <article className="word-card"><div className="word-card-top"><span className="tag">{card.bookTags?.join(" · ") || card.category}</span><button className="icon-button" title={`播放 ${card.text} 发音`} onClick={(): void => speak(card.text)}><Volume2 size={16} /></button></div><h3>{card.text}</h3>{card.pronunciation && <span className="pronunciation muted">{card.pronunciation}</span>}<p className="dictionary-translation">{card.translation}</p>{card.definition && (card.definition.length > 300 ? <details className="dictionary-details"><summary>展开英文释义</summary><p className="muted-text dictionary-definition">{card.definition}</p></details> : <p className="muted-text dictionary-definition">{card.definition}</p>)}<div className="word-card-footer"><span>{card.partOfSpeech || (card.kind === "word" ? "单词" : "句卡")}</span><span>{source}</span></div></article>;
}
