import { it, expect, vi } from "vitest";
import { useAppStore } from "./store";
import { mapRowsToCards } from "./domain/bookImport";

it("keeps the in-memory import unchanged if persistent storage fails", () => {
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("quota exceeded"); } });
  const before = useAppStore.getState().cards;
  expect(() => useAppStore.getState().importCards(mapRowsToCards([{ rowNumber: 1, kind: "word", text: "unique-import-test", translation: "测试" }]))).toThrow("quota exceeded");
  expect(useAppStore.getState().cards).toBe(before); vi.unstubAllGlobals();
});
