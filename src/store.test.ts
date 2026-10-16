import { it, expect, vi } from "vitest";
import { useAppStore } from "./store";
import { mapRowsToCards } from "./domain/bookImport";
import { preloadedCards } from "./data/preloadedCards";
import { getDailyQueue } from "./domain/scheduler";

it("keeps the in-memory import unchanged if persistent storage fails", () => {
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("quota exceeded"); } });
  const before = useAppStore.getState().cards;
  expect(() => useAppStore.getState().importCards(mapRowsToCards([{ rowNumber: 1, kind: "word", text: "unique-import-test", translation: "测试" }]))).toThrow("quota exceeded");
  expect(useAppStore.getState().cards).toBe(before); vi.unstubAllGlobals();
});

it("adds the new real word pack to an existing profile without duplicates or lost reviews", () => {
  const demo = preloadedCards.find((card) => card.id === "card-adapt")!;
  const learningItem = { id: `item-${demo.id}`, cardId: demo.id, skill: "meaning_recognition" as const, dueAt: "2026-10-16T00:00:00.000Z", state: "review" as const, stability: 3, difficulty: 4, revision: 7, reviewCount: 5 };
  const original = { cards: [demo], learningItems: [learningItem], reviewEvents: [{ eventId: "retained-event" }] };
  let raw = JSON.stringify(original);
  vi.stubGlobal("localStorage", { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } });
  useAppStore.getState().initialize(); useAppStore.getState().initialize();
  const state = useAppStore.getState();
  expect(state.cards.filter((card) => card.contentProvider === "ecdict")).toHaveLength(8512);
  expect(new Set(state.learningItems.map((item) => item.cardId)).size).toBe(state.learningItems.length);
  expect(state.learningItems.find((item) => item.cardId === demo.id)).toEqual(learningItem);
  expect(state.reviewEvents[0].eventId).toBe("retained-event");
  expect(getDailyQueue(state.learningItems).every((item) => state.cards.some((card) => card.id === item.cardId))).toBe(true);
  state.importCards(mapRowsToCards([{ rowNumber: 1, kind: "word", text: "special-local-fixture", translation: "用户词条" }]));
  const stored = JSON.parse(raw);
  expect(stored.cards.some((card: { contentProvider: string }) => card.contentProvider === "ecdict")).toBe(false);
  expect(stored.cards.some((card: { text: string }) => card.text === "special-local-fixture")).toBe(true);
  useAppStore.getState().initialize();
  expect(useAppStore.getState().cards.filter((card) => card.contentProvider === "ecdict")).toHaveLength(8512);
  expect(useAppStore.getState().learningItems.find((item) => item.cardId === demo.id)?.reviewCount).toBe(5);
  vi.unstubAllGlobals();
});
