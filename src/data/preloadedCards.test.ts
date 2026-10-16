import { it, expect } from "vitest";
import { getPreloadedCards } from "./preloadedCards";

it("never marks demo content as Oxford and rejects unlicensed packs", () => {
  expect(getPreloadedCards({ cards: [{ text: "adapt" }] }).every((card) => card.contentProvider === "demo-fixture")).toBe(true);
  const cards = getPreloadedCards({ schemaVersion: 1, provider: "oxford-dictionaries-api", language: "en-gb", licenseReference: "licensed-test-fixture", generatedAt: new Date().toISOString(), cards: [{ id: "test", text: "adapt", definition: "test definition", kind: "word", contentProvider: "oxford-dictionaries-api", contentLicense: "licensed-api" }] });
  expect(cards[0].dictionarySource?.licenseReference).toBe("licensed-test-fixture"); expect(cards[0].contentProvider).toBe("oxford-dictionaries-api"); expect(cards[0].audioAvailable).toBe(false);
});
