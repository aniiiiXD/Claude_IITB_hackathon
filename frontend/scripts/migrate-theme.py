#!/usr/bin/env python3
"""
One-shot theme migration: cold/dark → warm/light across all .tsx files.

Run from frontend/:  python scripts/migrate-theme.py
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Files to process: every .tsx under app/ and components/
TARGETS = []
for d in (ROOT / "app", ROOT / "components"):
    for p in d.rglob("*.tsx"):
        # Skip the warm-themed pages we already wrote (they're correct already)
        if any(part in str(p) for part in ("how-it-works", "warm-landing")):
            continue
        TARGETS.append(p)

# Hex code mappings (case-insensitive)
HEX_MAP = {
    # Backgrounds
    "#030B18": "#F5EFE3",
    "#0A1628": "#FBF8F0",
    "#0A0F1A": "#F5EFE3",

    # Text — heading to muted, dark→ink
    "#D0E4F7": "#0F1828",
    "#C0D8F0": "#1E2D4A",
    "#A8C4DC": "#2D4060",
    "#8AACCC": "#4A5D7A",
    "#7A9AB8": "#6B7D93",
    "#5A7A94": "#6B7D93",
    "#5A8AAA": "#6B7D93",
    "#4A6A8A": "#8B96A8",
    "#3A5A74": "#A0AAB8",
    "#3D5A72": "#A0AAB8",
    "#2A4A62": "#A0AAB8",
    "#5A6A8A": "#8B96A8",
    "#6B7280": "#8B96A8",

    # Brand
    "#1ADFCB": "#5C7855",   # cyan→sage (success/confirmed)
    "#3D8EF5": "#1E2D4A",   # blue→ink (primary)
    "#7DB9FA": "#A04A1F",   # light blue→rust (links)
    "#A78BFA": "#8B6C9C",   # purple→muted purple (specialist)
    "#FB7185": "#A04A1F",   # pink→rust (inbox/error)
    "#F59E0B": "#B8842A",   # amber→ochre (warning/draft)
    "#F87171": "#A04A1F",   # red→rust
}

# rgba mappings — match prefix with same alpha
RGBA_PREFIX_MAP = {
    "rgba(255,255,255,":     "rgba(15,24,40,",      # white overlay → ink overlay
    "rgba(255, 255, 255,":   "rgba(15, 24, 40,",
    "rgba(26,223,203,":      "rgba(92,120,85,",     # sage
    "rgba(26, 223, 203,":    "rgba(92, 120, 85,",
    "rgba(61,142,245,":      "rgba(30,45,74,",      # ink
    "rgba(61, 142, 245,":    "rgba(30, 45, 74,",
    "rgba(167,139,250,":     "rgba(139,108,156,",   # purple
    "rgba(167, 139, 250,":   "rgba(139, 108, 156,",
    "rgba(251,113,133,":     "rgba(160,74,31,",     # rust
    "rgba(251, 113, 133,":   "rgba(160, 74, 31,",
    "rgba(245,158,11,":      "rgba(184,132,42,",    # ochre
    "rgba(245, 158, 11,":    "rgba(184, 132, 42,",
}


def migrate(text: str) -> tuple[str, int]:
    count = 0

    # Hex replacements (case-insensitive)
    for old, new in HEX_MAP.items():
        pattern = re.compile(re.escape(old), re.IGNORECASE)
        text, n = pattern.subn(new, text)
        count += n

    # rgba prefix replacements (preserves alpha)
    for old, new in RGBA_PREFIX_MAP.items():
        text2 = text.replace(old, new)
        count += (len(text) - len(text2)) // max(1, abs(len(old) - len(new)))
        text = text2

    return text, count


def main():
    total_files = 0
    total_changes = 0
    for path in TARGETS:
        original = path.read_text()
        migrated, n = migrate(original)
        if migrated != original:
            path.write_text(migrated)
            total_files += 1
            total_changes += n
            rel = path.relative_to(ROOT)
            print(f"  ✓ {rel}  ({n} replacements)")
    print(f"\n{total_files} files changed · {total_changes} total replacements")


if __name__ == "__main__":
    main()
