import type { Card } from "../types";

export type ImportFormat = "csv" | "tsv" | "json";
export interface ImportRow {
  rowNumber: number;
  kind: Card["kind"];
  text: string;
  translation: string;
  partOfSpeech?: string;
  pronunciation?: string;
  definition?: string;
  example?: string;
  exampleTranslation?: string;
  category?: string;
}
export interface ImportError { rowNumber: number; message: string; raw?: string }
export interface ImportPreview { title: string; format: ImportFormat; rows: ImportRow[]; errors: ImportError[]; duplicateRows: number[] }

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 10_000;
const headers = ["kind", "text", "translation", "partOfSpeech", "pronunciation", "definition", "example", "exampleTranslation", "category"];

/** @functionId IMPORT-NORMALIZE-001 @summary Normalize import whitespace @module books @input string @output string @permission none @precondition string @postcondition whitespace collapsed @sideEffects none @offline supported @idempotency pure @errors none @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
function normalizeImportText(value: string): string { return value.trim().replace(/\s+/g, " "); }
/** @functionId IMPORT-KIND-001 @summary Validate imported card kind @module books @input string @output Card.kind|undefined @permission none @precondition string @postcondition unsupported kinds rejected @sideEffects none @offline supported @idempotency pure @errors undefined for invalid input @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
function parseKind(value: string): Card["kind"] | undefined { const kind = normalizeImportText(value).toLowerCase(); return kind === "word" || kind === "sentence" ? kind : undefined; }

/** @functionId IMPORT-CSV-001 @summary Parse a versioned word-book file into validated rows @module books @input UTF-8 bytes and filename @output ImportPreview @permission local user @precondition file bytes are available @postcondition no storage mutation @sideEffects none @offline supported @idempotency pure @errors INVALID_ENCODING,INVALID_SCHEMA,ROW_LIMIT @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
export function parseBookFile(bytes: ArrayBuffer, fileName: string): ImportPreview {
  if (bytes.byteLength > MAX_BYTES) return { title: fileName, format: parseImportFormat(fileName), rows: [], errors: [{ rowNumber: 0, message: "文件超过 10 MiB 限制" }], duplicateRows: [] };
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^\uFEFF/, ""); } catch { return { title: fileName, format: parseImportFormat(fileName), rows: [], errors: [{ rowNumber: 0, message: "文件必须是 UTF-8 编码" }], duplicateRows: [] }; }
  const format = parseImportFormat(fileName);
  if (!/\.(csv|txt|json)$/i.test(fileName)) return { title: fileName, format, rows: [], errors: [{ rowNumber: 0, message: "只支持 .csv、.txt 和 .json 文件" }], duplicateRows: [] };
  if (format === "json") return parseJson(text, fileName);
  try { return validateRows(parseDelimited(text, format === "tsv" ? "\t" : ","), format, fileName); }
  catch { return { title: fileName, format, rows: [], errors: [{ rowNumber: 0, message: "引号不匹配或引号后存在无效字符" }], duplicateRows: [] }; }
}

/** @functionId IMPORT-FORMAT-001 @summary Determine parser from filename @module books @input filename @output ImportFormat @permission none @precondition string @postcondition csv is default, caller rejects unsupported extensions @sideEffects none @offline supported @idempotency pure @errors none @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
function parseImportFormat(fileName: string): ImportFormat { const ext = fileName.toLowerCase().split(".").pop(); return ext === "json" ? "json" : ext === "txt" ? "tsv" : "csv"; }

/** @functionId IMPORT-DELIMITED-001 @summary Parse quoted CSV or tab-separated records @module books @input text,delimiter @output string[][] @permission none @precondition decoded UTF-8 @postcondition quote boundaries respected @sideEffects none @offline supported @idempotency pure @errors INVALID_QUOTES @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
function parseDelimited(text: string, delimiter: string): string[][] {
  const result: string[][] = []; let row: string[] = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') { if (quoted && text[index + 1] === '"') { field += '"'; index += 1; } else { if (!quoted && field) throw new Error("INVALID_QUOTES"); if (quoted && index + 1 < text.length && ![delimiter, "\r", "\n"].includes(text[index + 1])) throw new Error("INVALID_QUOTES"); quoted = !quoted; } continue; }
    if (char === delimiter && !quoted) { row.push(field); field = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && text[index + 1] === "\n") index += 1; row.push(field); if (row.some((cell) => cell.trim())) result.push(row); row = []; field = ""; continue; }
    field += char;
  }
  if (quoted) throw new Error("INVALID_QUOTES");
  if (field || row.length) { row.push(field); if (row.some((cell) => cell.trim())) result.push(row); }
  return result;
}

/** @functionId IMPORT-JSON-001 @summary Validate a versioned JSON book @module books @input text,filename @output ImportPreview @permission none @precondition decoded UTF-8 @postcondition unknown input never cast into cards @sideEffects none @offline supported @idempotency pure @errors row messages @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
function parseJson(text: string, fileName: string): ImportPreview {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || (value as { schemaVersion?: unknown }).schemaVersion !== 1 || !Array.isArray((value as { cards?: unknown }).cards)) return { title: fileName, format: "json", rows: [], errors: [{ rowNumber: 0, message: "JSON 必须包含 schemaVersion: 1 和 cards 数组" }], duplicateRows: [] };
    const rows = (value as { cards: unknown[] }).cards.map((card) => { if (!card || typeof card !== "object" || Array.isArray(card) || headers.some((key) => { const field = (card as Record<string, unknown>)[key]; return field !== undefined && typeof field !== "string"; })) return [""]; return headers.map((key) => { const field = (card as Record<string, unknown>)[key]; return typeof field === "string" ? field : ""; }); });
    return validateRows([headers, ...rows], "json", typeof (value as { title?: unknown }).title === "string" ? (value as { title: string }).title : fileName);
  } catch { return { title: fileName, format: "json", rows: [], errors: [{ rowNumber: 0, message: "JSON 语法无效" }], duplicateRows: [] }; }
}

/** @functionId IMPORT-VALIDATE-001 @summary Validate rows and detect in-file duplicates @module books @input cells,format,title @output ImportPreview @permission none @precondition parser returned cells @postcondition invalid rows separated from valid rows @sideEffects none @offline supported @idempotency pure @errors row messages @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
function validateRows(rawRows: string[][], format: ImportFormat, title: string): ImportPreview {
  const errors: ImportError[] = []; const rows: ImportRow[] = [];
  if (rawRows.length <= 1) return { title, format, rows, errors: [{ rowNumber: 1, message: "文件没有数据" }], duplicateRows: [] };
  const header = rawRows[0].map(normalizeImportText); const hasHeader = header.length >= 3 && header.length <= headers.length && header.every((key, index) => headers[index] === key);
  if (!hasHeader) { errors.push({ rowNumber: 1, message: `首行必须包含列：${headers.slice(0, 3).join(", ")}` }); return { title, format, rows, errors, duplicateRows: [] }; }
  if (rawRows.length - 1 > MAX_ROWS) errors.push({ rowNumber: 0, message: `最多导入 ${MAX_ROWS} 条记录` });
  const seen = new Set<string>(); const duplicateRows: number[] = [];
  rawRows.slice(1, MAX_ROWS + 1).forEach((cells, index) => {
    const rowNumber = format === "json" ? index + 1 : index + 2; const kind = parseKind(cells[0] ?? ""); const text = normalizeImportText(cells[1] ?? ""); const translation = normalizeImportText(cells[2] ?? "");
    if (cells.length !== header.length || cells.some((cell) => cell.length > 5000)) { errors.push({ rowNumber, message: "列数必须与表头一致，每个字段最多 5000 字符" }); return; }
    if (!kind || !text || !translation) { errors.push({ rowNumber, message: "kind 必须是 word/sentence，text 和 translation 不能为空", raw: cells.join(",") }); return; }
    const key = `${kind}:${text.toLocaleLowerCase()}`; if (seen.has(key)) { duplicateRows.push(rowNumber); return; } seen.add(key);
    const row: ImportRow = { rowNumber, kind, text, translation };
    const optional: (keyof Pick<ImportRow, "partOfSpeech" | "pronunciation" | "definition" | "example" | "exampleTranslation" | "category">)[] = ["partOfSpeech", "pronunciation", "definition", "example", "exampleTranslation", "category"];
    optional.forEach((key, offset) => { const value = normalizeImportText(cells[offset + 3] ?? ""); if (value) row[key] = value; }); rows.push(row);
  });
  if (rawRows.length - 1 > MAX_ROWS) rows.length = 0;
  return { title, format, rows, errors, duplicateRows };
}

/** @functionId IMPORT-KEY-001 @summary Compute a card deduplication key @module books @input kind,text @output string @permission none @precondition typed card @postcondition whitespace and case ignored @sideEffects none @offline supported @idempotency pure @errors none @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
export function getCardKey(card: Pick<Card, "kind" | "text">): string { return `${card.kind}:${normalizeImportText(card.text).toLocaleLowerCase()}`; }

/** @functionId IMPORT-CARD-001 @summary Convert validated import rows to cards @module books @input ImportRow[] and category @output Card[] @permission local user @precondition rows passed preview validation @postcondition imported provenance is explicit @sideEffects none @offline supported @idempotency caller controls dedupe @errors none @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
export function mapRowsToCards(rows: ImportRow[], category = "我的导入"): Card[] {
  return rows.map((row) => ({ id: `import-${crypto.randomUUID()}`, kind: row.kind, text: row.text, translation: row.translation, partOfSpeech: row.partOfSpeech, pronunciation: row.pronunciation, definition: row.definition, example: row.example, exampleTranslation: row.exampleTranslation, category: row.category || category, sourceType: "imported", contentProvider: "imported", contentLicense: "imported-by-user", audioAvailable: false, pronunciationProvider: "none" }));
}

/** @functionId IMPORT-ERRORS-001 @summary Export application-generated validation messages @module books @input ImportError[] @output CSV string @permission none @precondition errors from this parser @postcondition raw user content excluded @sideEffects none @offline supported @idempotency pure @errors none @concurrency synchronous @performance O(n) @test src/domain/bookImport.test.ts @since 1.0.0 */
export function mapImportErrors(errors: ImportError[]): string { return ["row,message", ...errors.map((error) => `${error.rowNumber},"${error.message.replaceAll('"', '""')}"`)].join("\n"); }
export const importLimits = { maxBytes: MAX_BYTES, maxRows: MAX_ROWS } as const;
