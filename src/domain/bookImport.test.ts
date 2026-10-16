import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseBookFile, mapRowsToCards } from "./bookImport";

function parse(text: string, name = "book.csv") { return parseBookFile(new TextEncoder().encode(text).buffer, name); }

describe("word-book import boundary", () => {
  it("accepts the downloadable templates", () => {
    for (const extension of ["csv", "txt", "json"]) { const data = readFileSync(`public/templates/wordbook.${extension}`); const result = parseBookFile(Uint8Array.from(data).buffer, `book.${extension}`); expect(result.errors).toEqual([]); expect(result.rows).toHaveLength(2); }
  });
  it("parses quoted commas, newlines, escaped quotes and UTF-8 BOM", () => {
    const result = parse('\uFEFFkind,text,translation\r\nsentence,"Hello, ""friend"".\nWelcome.",你好\r\n');
    expect(result.errors).toEqual([]); expect(result.rows[0].text).toBe('Hello, "friend". Welcome.');
  });
  it("rejects missing headers, unmatched quotes and wrong column counts", () => {
    for (const value of ["adapt,适应", 'kind,text,translation\nword,"adapt,适应', "kind,text,translation\nword,adapt,适应,extra"]) expect(parse(value).errors.length).toBeGreaterThan(0);
  });
  it("rejects empty books instead of presenting an empty success preview", () => {
    expect(parse("kind,text,translation").errors[0].message).toContain("没有数据");
    expect(parse('{"schemaVersion":1,"cards":[]}', "book.json").errors[0].message).toContain("没有数据");
  });
  it("does not silently truncate row limits or accept non UTF-8", () => {
    expect(parse("kind,text,translation\n" + Array.from({ length: 10001 }, (_, index) => `word,w${index},译文`).join("\n")).rows).toEqual([]);
    expect(parseBookFile(new Uint8Array([0xff]).buffer, "book.csv").errors[0].message).toContain("UTF-8");
    expect(parseBookFile(new ArrayBuffer(10 * 1024 * 1024 + 1), "book.csv").rows).toEqual([]);
  });
  it("deduplicates by kind and normalized text while reporting invalid records", () => {
    const result = parse("kind,text,translation\nword,adapt,适应\nword, ADAPT ,适应\nsentence,adapt,适应\nother,hello,你好\nword,missing,");
    expect(result.rows).toHaveLength(2); expect(result.duplicateRows).toEqual([3]); expect(result.errors.map((error) => error.rowNumber)).toEqual([5, 6]);
    const cards = mapRowsToCards(result.rows); expect(cards.every((card) => card.contentProvider === "imported" && !card.audioAvailable)).toBe(true);
  });
  it("rejects backups and non-string JSON required fields", () => {
    expect(parse('{"cards":[]}', "book.json").errors.length).toBeGreaterThan(0);
    expect(parse('{"schemaVersion":1,"cards":[{"kind":"word","text":123,"translation":"译文"}]}', "book.json").rows).toEqual([]);
  });
});
