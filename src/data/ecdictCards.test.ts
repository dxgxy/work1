import { describe, it, expect } from "vitest";
import { getEcdictCards } from "./ecdictCards";
import pack from "./generated/ecdict-cards.json";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

describe("real offline ECDICT pack", () => {
  it("contains all selected tagged entries and preserves source, meaning and phonetics", () => {
    const cards = getEcdictCards(); expect(cards).toHaveLength(8512);
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
    const adapt = cards.find((card) => card.text === "adapt")!;
    expect(adapt.translation).toContain("适应"); expect(adapt.pronunciation).toBeTruthy(); expect(adapt.definition).toContain("new purpose");
    expect(adapt.bookTags).toContain("四级"); expect(adapt.contentProvider).toBe("ecdict"); expect(adapt.contentLicense).toBe("MIT"); expect(adapt.audioAvailable).toBe(false);
    expect(cards.filter((card) => card.bookTags?.includes("中考"))).toHaveLength(1601);
    expect(cards.filter((card) => card.bookTags?.includes("四级"))).toHaveLength(3846);
    expect(cards.filter((card) => card.bookTags?.includes("六级"))).toHaveLength(5406);
    expect(cards.filter((card) => card.bookTags?.includes("雅思"))).toHaveLength(5040);
    expect(cards.every((card) => card.translation.length > 0 && !card.translation.includes("\\n"))).toBe(true);
  });
  it("rejects incomplete packs, duplicate words and unrecognized tags", () => {
    expect(() => getEcdictCards({ ...pack, count: 1 })).toThrow("ECDICT_INVALID_PACK");
    expect(() => getEcdictCards({ ...pack, count: 2, entries: [pack.entries[0], pack.entries[0]] })).toThrow("ECDICT_DUPLICATE_WORD");
    expect(() => getEcdictCards({ ...pack, count: 1, entries: [{ ...pack.entries[0], tags: ["unknown"] }] })).toThrow("ECDICT_INVALID_TAG");
  });
  it("retains the pinned artifact hash and upstream MIT notice", () => {
    const manifest = JSON.parse(readFileSync("docs/data/ecdict-manifest.json", "utf8"));
    expect(createHash("sha256").update(readFileSync("src/data/generated/ecdict-cards.json")).digest("hex")).toBe(manifest.packSha256);
    expect(readFileSync("public/licenses/ECDICT-MIT.txt", "utf8")).toContain("Permission is hereby granted");
  });
});
