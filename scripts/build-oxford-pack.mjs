import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname } from "node:path";

const appId = process.env.OXFORD_APP_ID;
const appKey = process.env.OXFORD_APP_KEY;
const language = process.env.OXFORD_LANGUAGE || "en-gb";
const license = process.env.OXFORD_LICENSE_REFERENCE;
const input = process.argv[2];
const output = process.argv[3] || "src/data/generated/oxford-cards.json";
if (!appId || !appKey || !license || !input) throw new Error("Usage: OXFORD_APP_ID=... OXFORD_APP_KEY=... OXFORD_LICENSE_REFERENCE=... node scripts/build-oxford-pack.mjs words.txt [output.json]");
if (!["en-gb", "en-us"].includes(language)) throw new Error("OXFORD_LANGUAGE must be en-gb or en-us");
const words = (await readFile(input, "utf8")).split(/\r?\n/).map((word) => word.trim().toLowerCase()).filter(Boolean);
if (!words.length || words.length > 10000) throw new Error("Input must contain 1-10000 words");
const cards = [];
for (const word of [...new Set(words)]) {
  const before = cards.length;
  const url = `https://od-api.oxforddictionaries.com/api/v2/entries/${language}/${encodeURIComponent(word)}`;
  const response = await fetch(url, { headers: { app_id: appId, app_key: appKey }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Oxford request failed for ${word}: HTTP ${response.status}`);
  const payload = await response.json();
  const entries = payload.results?.flatMap((result) => result.lexicalEntries ?? []) ?? [];
  for (const entry of entries) for (const sense of entry.entries?.flatMap((item) => item.senses ?? []) ?? []) {
    const definition = sense.definitions?.[0]; if (!definition) continue;
    const pronunciations = [...(entry.pronunciations ?? []), ...(entry.entries?.flatMap((item) => item.pronunciations ?? []) ?? [])];
    const hash = createHash("sha256").update(`${word}:${entry.lexicalCategory?.id}:${definition}`).digest("hex").slice(0, 20);
    if (!cards.some((card) => card.id === `oxford-${hash}`)) cards.push({ id: `oxford-${hash}`, kind: "word", text: word, translation: "", partOfSpeech: entry.lexicalCategory?.text, pronunciation: pronunciations.find((item) => item.phoneticSpelling)?.phoneticSpelling, definition, example: sense.examples?.[0]?.text, category: "Oxford 授权词书", sourceType: "curated", contentProvider: "oxford-dictionaries-api", contentLicense: "licensed-api", audioAvailable: false, pronunciationProvider: "google-extension" });
  }
  if (cards.length === before) throw new Error(`Oxford returned no usable definitions for ${word}; existing output kept`);
}
if (!cards.length) throw new Error("Oxford returned no usable definitions");
const document = { schemaVersion: 1, provider: "oxford-dictionaries-api", language, licenseReference: license, generatedAt: new Date().toISOString(), source: "https://developer.oxforddictionaries.com/", cards };
document.sha256 = createHash("sha256").update(JSON.stringify(document)).digest("hex");
await mkdir(dirname(output), { recursive: true });
const temporary = `${output}.tmp-${process.pid}`;
await writeFile(temporary, JSON.stringify(document, null, 2), "utf8");
await rename(temporary, output);
console.log(`Wrote ${cards.length} Oxford cards to ${output}`);
