import pack from "./generated/oxford-cards.json";
import { sampleCards } from "./sampleCards";
import type { Card } from "../types";

/** @functionId OXFORD-PRELOAD-001 @summary Load an authorized Oxford pack or explicitly labelled fixtures @module dictionary @input bundled JSON @output Card[] @permission local user @precondition build-time pack @postcondition provenance kept @sideEffects none @offline supported @idempotency deterministic @errors invalid pack falls back to demo @concurrency immutable import @performance O(n) @test src/data/preloadedCards.test.ts @since 1.0.0 */
export function getPreloadedCards(value: unknown = pack): Card[] {
  if (!value || typeof value !== "object") return sampleCards;
  const source = value as Record<string, unknown>;
  if (source.schemaVersion !== 1 || source.provider !== "oxford-dictionaries-api" || typeof source.licenseReference !== "string" || !source.licenseReference || typeof source.generatedAt !== "string" || !Number.isFinite(Date.parse(source.generatedAt)) || !["en-gb", "en-us"].includes(String(source.language)) || !Array.isArray(source.cards) || !source.cards.length) return sampleCards;
  const cards: Card[] = [];
  const ids = new Set<string>();
  for (const value of source.cards) {
    const card = value as Partial<Card>;
    if (!card || typeof card.id !== "string" || !card.id || ids.has(card.id) || typeof card.text !== "string" || !card.text.trim() || typeof card.definition !== "string" || !card.definition || card.kind !== "word" || card.contentProvider !== "oxford-dictionaries-api" || card.contentLicense !== "licensed-api") return sampleCards;
    ids.add(card.id);
    cards.push({ ...card, translation: card.translation || "未提供中文译文（查看英文释义）", category: "Oxford 授权词书", sourceType: "curated", audioAvailable: false, pronunciationProvider: "google-extension", dictionarySource: { url: "https://developer.oxforddictionaries.com/", language: String(source.language), generatedAt: source.generatedAt, licenseReference: source.licenseReference } } as Card);
  }
  return cards;
}

export const preloadedCards = getPreloadedCards();
