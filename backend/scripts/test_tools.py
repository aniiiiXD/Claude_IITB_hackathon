"""
Smoke test for the disease-lookup tools.

Verifies that search_omim and get_omim_entry return real data (not stub) for
diseases outside the 8-disease offline stub set.

Run from backend/:
    python scripts/test_tools.py
"""

import asyncio
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools import search_omim, get_omim_entry, search_orphanet  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

# Diseases NOT in the 8-disease stub — must come from a real source
NON_STUB_DISEASES = [
    ("Fabry disease", "301500"),
    ("Homocystinuria", "236200"),
    ("Sandhoff disease", "268800"),
    ("Mucopolysaccharidosis type I", "607014"),
    ("Krabbe disease", "245200"),
]

# A disease that IS in the stub — should now also come from a real source first
STUB_DISEASE = ("Gaucher disease type 1", "230800")


def _fmt(d: dict, max_len: int = 280) -> str:
    s = json.dumps(d, indent=2, ensure_ascii=False)
    return s if len(s) <= max_len else s[:max_len] + "…"


async def main() -> int:
    failures = 0

    print("\n=== search_omim — non-stub diseases ===")
    for name, expected_mim in NON_STUB_DISEASES:
        result = await search_omim(name, limit=2)
        source = result.get("source")
        results = result.get("results", [])
        first_omim = results[0].get("omim_id") if results else None

        ok = source in ("medgen", "wikipedia") and bool(results)
        marker = "✓" if ok else "✗"
        print(f"  {marker} {name:40s}  source={source:10s}  hits={len(results)}  first_omim={first_omim}")
        if not ok:
            failures += 1
            print(_fmt(result))

    print("\n=== search_omim — stub disease (should now use real source) ===")
    name, expected_mim = STUB_DISEASE
    result = await search_omim(name, limit=2)
    source = result.get("source")
    print(f"  source={source}  hits={len(result.get('results', []))}")
    if source == "stub":
        failures += 1
        print(f"  ✗ Expected MedGen/Wikipedia, got stub. Investigate.")
    else:
        print(f"  ✓ Real data for stub disease")

    print("\n=== get_omim_entry — by MIM number ===")
    for name, mim in NON_STUB_DISEASES[:3]:
        result = await get_omim_entry(mim)
        source = result.get("source")
        title = result.get("entry", {}).get("title", "")
        ok = source in ("medgen", "wikipedia") and bool(title)
        marker = "✓" if ok else "✗"
        print(f"  {marker} MIM {mim} ({name:25s})  source={source:10s}  title={title!r}")
        if not ok:
            failures += 1

    print("\n=== Cache hit ===")
    name, _ = NON_STUB_DISEASES[0]
    r1 = await search_omim(name, limit=2)
    r2 = await search_omim(name, limit=2)
    cache_hit = r2.get("cache") is True
    print(f"  {'✓' if cache_hit else '✗'} Second call cached: {cache_hit}")
    if not cache_hit:
        failures += 1

    print("\n=== search_orphanet ===")
    result = await search_orphanet("Gaucher disease")
    source = result.get("source")
    hits = len(result.get("results", []))
    print(f"  source={source}  hits={hits}")

    print(f"\n{'─' * 60}")
    if failures:
        print(f"FAILED: {failures} test(s) failed")
        return 1
    print("ALL PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
