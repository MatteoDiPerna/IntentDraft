#!/usr/bin/env python3
"""
Allinea le colonne delle tabelle Markdown in file .md (padding spazi).
Uso: python scripts/align_markdown_tables.py [percorsi...]
Default: docs/product/*.md
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def split_cells(line: str) -> list[str] | None:
    stripped = line.strip()
    if not stripped.startswith("|") or not stripped.endswith("|"):
        return None
    inner = stripped[1:-1]
    return [c.strip() for c in inner.split("|")]


def is_separator_row(cells: list[str]) -> bool:
    return all(re.fullmatch(r":?-+:?", c.replace(" ", "")) for c in cells if c != "")


def format_separator(widths: list[int], cells: list[str]) -> str:
    parts: list[str] = []
    for i, w in enumerate(widths):
        raw = cells[i] if i < len(cells) else ""
        core = raw.replace(" ", "")
        left = core.startswith(":")
        right = core.endswith(":")
        dash_len = max(w, 3)
        if left and right:
            parts.append(":" + "-" * (dash_len - 2) + ":")
        elif left:
            parts.append(":" + "-" * (dash_len - 1))
        elif right:
            parts.append("-" * (dash_len - 1) + ":")
        else:
            parts.append("-" * dash_len)
    return "| " + " | ".join(parts) + " |"


def format_data_row(cells: list[str], widths: list[int]) -> str:
    parts: list[str] = []
    for i, w in enumerate(widths):
        text = cells[i] if i < len(cells) else ""
        parts.append(text.ljust(w))
    return "| " + " | ".join(parts) + " |"


def align_table_block(lines: list[str]) -> list[str]:
    rows: list[list[str]] = []
    for line in lines:
        cells = split_cells(line)
        if cells is None:
            break
        rows.append(cells)

    if len(rows) < 2:
        return lines

    col_count = max(len(r) for r in rows)
    widths = [0] * col_count
    for row in rows:
        for i in range(col_count):
            cell = row[i] if i < len(row) else ""
            if i < len(rows) and rows.index(row) == 1 and is_separator_row(row):
                continue
            widths[i] = max(widths[i], len(cell))

    # Larghezze da righe dati (escluso separatore)
    widths = [0] * col_count
    for i, row in enumerate(rows):
        if i == 1 and is_separator_row(row):
            continue
        for j in range(col_count):
            cell = row[j] if j < len(row) else ""
            widths[j] = max(widths[j], len(cell))
    for j in range(col_count):
        widths[j] = max(widths[j], 3)

    out: list[str] = []
    for i, row in enumerate(rows):
        padded = row + [""] * (col_count - len(row))
        if i == 1 and is_separator_row(padded):
            out.append(format_separator(widths, padded))
        else:
            out.append(format_data_row(padded, widths))
    return out + lines[len(rows) :]


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    result: list[str] = []
    i = 0
    changed = False

    while i < len(lines):
        line = lines[i]
        content = line.rstrip("\n\r")
        cells = split_cells(content)
        if cells is not None:
            block = [content]
            j = i + 1
            while j < len(lines):
                nxt = lines[j].rstrip("\n\r")
                if split_cells(nxt) is not None:
                    block.append(nxt)
                    j += 1
                else:
                    break
            aligned = align_table_block(block)
            if aligned != block:
                changed = True
            for k, al in enumerate(aligned):
                end = "\n" if (i + k < len(lines) and lines[i + k].endswith("\n")) else "\n"
                result.append(al + end)
            i = j
            continue
        result.append(line)
        i += 1

    if changed:
        path.write_text("".join(result), encoding="utf-8", newline="\n")
    return changed


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    if len(sys.argv) > 1:
        paths = [Path(p) for p in sys.argv[1:]]
    else:
        paths = sorted((root / "docs").rglob("*.md"))

    updated = 0
    for p in paths:
        if not p.is_file():
            print(f"Skip (missing): {p}", file=sys.stderr)
            continue
        if process_file(p):
            print(f"Aligned: {p}")
            updated += 1
        else:
            print(f"Unchanged: {p}")

    print(f"Done. {updated} file(s) updated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
