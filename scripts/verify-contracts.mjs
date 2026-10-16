import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// A compact schema validator verifies only the keywords used by the registry schema.
function validate(value, schema, location = "$") {
  if (schema.const !== undefined && value !== schema.const) throw new Error(`${location}: invalid const`);
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${location}: invalid enum`);
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location}: expected object`);
    for (const key of schema.required ?? []) if (!(key in value)) throw new Error(`${location}: missing ${key}`);
    for (const key of Object.keys(value)) { if (schema.additionalProperties === false && !schema.properties?.[key]) throw new Error(`${location}: unexpected ${key}`); if (schema.properties?.[key]) validate(value[key], schema.properties[key], `${location}.${key}`); }
  }
  if (schema.type === "array") {
    if (!Array.isArray(value) || value.length < (schema.minItems ?? 0)) throw new Error(`${location}: invalid array`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) throw new Error(`${location}: duplicate array items`);
    for (const item of value) validate(item, schema.items, location + "[]");
  }
  if (schema.type === "string" && (typeof value !== "string" || value.length < (schema.minLength ?? 0) || (schema.pattern && !new RegExp(schema.pattern).test(value)))) throw new Error(`${location}: invalid string`);
}
const registry = JSON.parse(await readFile("docs/functions/function-registry.json", "utf8"));
const schema = JSON.parse(await readFile("docs/functions/registry.schema.json", "utf8"));
validate(registry, schema);
for (const entry of registry.functions) {
  const source = await readFile(entry.implementationPath, "utf8");
  if (!source.includes(entry.functionId) || !source.includes(`function ${entry.name}(`)) throw new Error(`Missing implementation ${entry.functionId}`);
  for (const ref of [entry.inputSchema, entry.outputSchema]) { const [path, fragment] = ref.split("#/$defs/"); const contract = JSON.parse(await readFile(resolve("docs/functions", path), "utf8")); if (!contract.$defs?.[fragment]) throw new Error(`Missing schema ${ref}`); }
  for (const path of entry.testPaths) await readFile(path);
}
console.log(`Validated ${registry.functions.length} public function contracts and their implementation/schema/test references.`);
