"""Generate the offline ECDICT pack from a pinned public CSV; no API credentials.
Source: skywind3000/ECDICT at bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b.
Run: python scripts/build-ecdict-pack.py [.cache/ecdict/ecdict.csv]
"""
from __future__ import annotations
import csv
import hashlib
import json
from pathlib import Path
import re
import sys

REVISION = "bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b"
TAGS = {"zk", "gk", "cet4", "cet6", "ielts"}

def normalize_text(value: str) -> str:
    """@functionId ECDICT-TEXT-001 @summary Decode ECDICT literal newlines
    @module dictionary @input string @output string @permission none
    @precondition parsed CSV field @postcondition whitespace normalized
    @sideEffects none @offline supported @idempotency pure @errors none
    @concurrency synchronous @performance O(n) @test src/data/ecdictCards.test.ts @since 1.0.0
    """
    return value.replace("\\n", "\n").strip()

def build_pack(input_path: Path, output_path: Path) -> None:
    """@functionId ECDICT-BUILD-001 @summary Build deterministic offline cards
    @module dictionary @input CSV path,output path @output None @permission local developer
    @precondition pinned CSV and bundled MIT notice @postcondition stable pack and manifest
    @sideEffects local-db-read,local-db-write @offline supported @idempotency byte-identical input gives identical pack
    @errors ValueError for unexpected schema or missing data @concurrency single writer
    @performance O(n log n) @test src/data/ecdictCards.test.ts @since 1.0.0
    """
    rows: list[dict[str, object]] = []
    seen: set[str] = set()
    with input_path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not {"word", "phonetic", "translation", "definition", "tag", "frq", "bnc"}.issubset(reader.fieldnames or []):
            raise ValueError("Unexpected ECDICT CSV schema")
        for raw in reader:
            word = raw["word"].strip()
            tags = raw["tag"].split()
            translation = normalize_text(raw["translation"])
            if not translation or not TAGS.intersection(tags) or not re.fullmatch(r"[A-Za-z]+(?:[- '][A-Za-z]+)*", word) or word.lower() in seen:
                continue
            seen.add(word.lower())
            rank_text = raw["frq"] or raw["bnc"] or "0"
            rank = int(rank_text) if rank_text.isdigit() and int(rank_text) > 0 else 1_000_000
            rows.append({"w": word, "p": raw["phonetic"].strip(), "d": normalize_text(raw["definition"]), "t": translation, "tags": [tag for tag in tags if tag in TAGS], "rank": rank})
    # Rank is for stable order, not a claim that this is a current exam syllabus.
    rows.sort(key=sort_entry)
    if len(rows) < 8000:
        raise ValueError("Incomplete input: expected at least 8000 usable study entries")
    payload = {"schemaVersion": 1, "provider": "ecdict", "license": "MIT", "sourceUrl": "https://github.com/skywind3000/ECDICT", "revision": REVISION, "inputSha256": hashlib.sha256(input_path.read_bytes()).hexdigest(), "selectionTags": sorted(TAGS), "count": len(rows), "entries": rows}
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    manifest = {key: value for key, value in payload.items() if key != "entries"}
    manifest["packSha256"] = hashlib.sha256(output_path.read_bytes()).hexdigest()
    manifest["tagCounts"] = {tag: sum(tag in row["tags"] for row in rows) for tag in sorted(TAGS)}
    Path("docs/data/ecdict-manifest.json").parent.mkdir(parents=True, exist_ok=True)
    Path("docs/data/ecdict-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(rows)} ECDICT entries ({output_path.stat().st_size} bytes)")

def sort_entry(row: dict[str, object]) -> tuple[int, str]:
    """@functionId ECDICT-SORT-001 @summary Sort entries by source frequency then spelling
    @module dictionary @input entry @output tuple @permission none @precondition normalized entry
    @postcondition deterministic order @sideEffects none @offline supported @idempotency pure
    @errors none @concurrency synchronous @performance O(1) @test src/data/ecdictCards.test.ts @since 1.0.0
    """
    return int(str(row["rank"])), str(row["w"]).lower()

if __name__ == "__main__":
    build_pack(Path(sys.argv[1] if len(sys.argv) > 1 else ".cache/ecdict/ecdict.csv"), Path("src/data/generated/ecdict-cards.json"))
