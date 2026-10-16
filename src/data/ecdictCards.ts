import pack from "./generated/ecdict-cards.json";
import type { Card } from "../types";

const tagLabels: Readonly<Record<string, string>> = { zk: "中考", gk: "高考", cet4: "四级", cet6: "六级", ielts: "雅思" };

/** @functionId ECDICT-PRELOAD-001 @summary Validate and map a bundled ECDICT pack @module dictionary @input unknown JSON @output Card[] @permission none @precondition pinned generated pack @postcondition real provenance,stable ids,no downloaded-audio claims @sideEffects none @offline supported @idempotency deterministic @errors invalid pack throws ECDICT_INVALID_PACK @concurrency synchronous @performance O(n) @test src/data/ecdictCards.test.ts @since 1.0.0 */
export function getEcdictCards(value: unknown = pack): Card[] {
  if (!value || typeof value !== "object") throw new Error("ECDICT_INVALID_PACK");
  const source = value as Record<string, unknown>;
  if (source.schemaVersion !== 1 || source.provider !== "ecdict" || source.license !== "MIT" || typeof source.revision !== "string" || !/^[a-f0-9]{40}$/.test(source.revision) || !Array.isArray(source.entries) || source.count !== source.entries.length) throw new Error("ECDICT_INVALID_PACK");
  const cards: Card[] = []; const seen = new Set<string>();
  for (const value of source.entries) {
    if (!value || typeof value !== "object") throw new Error("ECDICT_INVALID_PACK");
    const row = value as Record<string, unknown>;
    if (typeof row.w !== "string" || !row.w.trim() || typeof row.t !== "string" || !row.t.trim() || typeof row.p !== "string" || typeof row.d !== "string" || !Array.isArray(row.tags) || row.tags.length === 0) throw new Error("ECDICT_INVALID_PACK");
    const id = `ecdict-${row.w.toLowerCase()}`;
    if (seen.has(id)) throw new Error("ECDICT_DUPLICATE_WORD");
    seen.add(id); const tags: string[] = [];
    for (const tag of row.tags) { if (typeof tag !== "string" || !tagLabels[tag]) throw new Error("ECDICT_INVALID_TAG"); tags.push(tagLabels[tag]); }
    const category = tags.includes("四级") ? "四级核心" : tags.includes("六级") ? "六级进阶" : tags.includes("雅思") ? "雅思高频" : "ECDICT 离线";
    cards.push({ id, kind: "word", text: row.w, translation: row.t, pronunciation: row.p || undefined, definition: row.d || undefined, category, bookTags: tags, sourceType: "curated", contentProvider: "ecdict", contentLicense: "MIT", openDictionarySource: { name: "ECDICT", url: "https://github.com/skywind3000/ECDICT", revision: source.revision, license: "MIT" }, audioAvailable: false, pronunciationProvider: "google-extension" });
  }
  return cards;
}
