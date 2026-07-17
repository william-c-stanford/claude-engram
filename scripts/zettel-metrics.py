#!/usr/bin/env python3
"""zettel-metrics.py — stamp per-note graph metrics into zettel frontmatter.

Writes two numeric frontmatter keys onto every folder-nested Zettelkasten note so
a graph view (Extended Graph today, a custom Cytoscape view later) can size and
colour nodes:

  subtree_size  number of DESCENDANT notes beneath this one in the address tree
                (self EXCLUDED — a leaf is 0). Matches zettel-index.py's `subtree`
                semantics. DERIVED: this script owns it and rewrites it every run.

  cards_due     number of FSRS flashcards currently due for review on this note.
                EXTERNALLY OWNED: a future FSRS integration writes the real count.
                This script only SEEDS a `0` stub when the key is absent, and never
                overwrites an existing value — so re-running to refresh subtree_size
                cannot clobber scheduler state.

The address tree comes from .vault-meta/zettel-index.json (each note's `children`
list). By default the index is rebuilt first (via scripts/zettel-index.py) so
subtree sizes reflect the notes on disk; pass --no-rebuild to skip that.

Frontmatter is edited SURGICALLY — only the two scalar lines are inserted or
replaced inside the first `---`…`---` block. The rest of the block (ordering,
quoting, block-style lists, comments) is left byte-for-byte intact, so this never
reserializes YAML through the deliberately-small parser its siblings use.

CLI:
  zettel-metrics.py [--root wiki/zettel] [--no-rebuild] [--dry-run]

Exit codes:
  0 — success
  2 — usage error (bad --root, or index unavailable)
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parent.parent
META_DIR = VAULT_ROOT / ".vault-meta"
INDEX_PATH = META_DIR / "zettel-index.json"
INDEX_SCRIPT = VAULT_ROOT / "scripts" / "zettel-index.py"


def rebuild_index(root_rel):
    """Rebuild the index sidecar via the sibling script so metrics are fresh."""
    cmd = [sys.executable, str(INDEX_SCRIPT)]
    if root_rel:
        cmd += ["--root", root_rel]
    cmd.append("rebuild")
    subprocess.run(cmd, check=True, cwd=str(VAULT_ROOT),
                   stdout=subprocess.DEVNULL)


def load_notes():
    """Return the {address: record} map from the index, or exit if unusable."""
    try:
        data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        sys.exit(f"error: cannot read {INDEX_PATH}: {exc}")
    notes = data.get("notes")
    if not isinstance(notes, dict):
        sys.exit(f"error: {INDEX_PATH} has no 'notes' map")
    return notes


def compute_subtree_sizes(notes):
    """Descendant count (self excluded) per address, memoized and cycle-safe."""
    sizes = {}

    def descendants(addr, seen):
        if addr in sizes:
            return sizes[addr]
        if addr in seen:            # cycle guard — count nothing past the loop
            return 0
        seen = seen | {addr}
        rec = notes.get(addr)
        total = 0
        for child in (rec.get("children") if rec else []) or []:
            if child in notes:
                total += 1 + descendants(child, seen)
        sizes[addr] = total
        return total

    for addr in notes:
        descendants(addr, set())
    return sizes


# ─── Surgical frontmatter edit ───────────────────────────────────────────────

def _split_lines_keepends(text):
    """Split into lines, remembering whether the file ended with a newline."""
    ends_nl = text.endswith("\n")
    return text.split("\n"), ends_nl


def set_frontmatter_metric(text, key, value, overwrite):
    """Insert or replace `key: value` in the first frontmatter block.

    Returns (new_text, changed). When overwrite is False and the key already
    exists, the value is left untouched (changed=False). Only edits inside the
    opening `---` … closing `---`; if there is no frontmatter block, returns the
    text unchanged.
    """
    lines, ends_nl = _split_lines_keepends(text)
    if not lines or lines[0].strip() != "---":
        return text, False
    # locate the closing delimiter of the first block
    close = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            close = i
            break
    if close is None:
        return text, False

    key_re = re.compile(r"^" + re.escape(key) + r":\s*(.*)$")
    for i in range(1, close):
        m = key_re.match(lines[i])
        if m:
            if not overwrite:
                return text, False
            if m.group(1).strip() == str(value):
                return text, False        # already correct — no churn
            lines[i] = f"{key}: {value}"
            return ("\n".join(lines) + ("\n" if ends_nl else ""), True)

    # key absent — insert just before the closing delimiter
    lines.insert(close, f"{key}: {value}")
    return ("\n".join(lines) + ("\n" if ends_nl else ""), True)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default="wiki/zettel",
                    help="index scan root passed to zettel-index.py (default wiki/zettel)")
    ap.add_argument("--no-rebuild", action="store_true",
                    help="use the existing index sidecar without rebuilding it first")
    ap.add_argument("--dry-run", action="store_true",
                    help="report what would change without writing any file")
    args = ap.parse_args()

    if not args.no_rebuild:
        try:
            rebuild_index(args.root)
        except (subprocess.CalledProcessError, OSError) as exc:
            sys.exit(f"error: index rebuild failed: {exc}")

    notes = load_notes()
    sizes = compute_subtree_sizes(notes)

    size_writes = seeded = skipped = 0
    for addr, rec in sorted(notes.items()):
        path = VAULT_ROOT / rec["path"]
        try:
            text = path.read_text(encoding="utf-8")
        except OSError as exc:
            print(f"skip {rec['path']}: {exc}", file=sys.stderr)
            continue

        new_text, changed_size = set_frontmatter_metric(
            text, "subtree_size", sizes.get(addr, 0), overwrite=True)
        new_text, seeded_due = set_frontmatter_metric(
            new_text, "cards_due", 0, overwrite=False)

        if new_text == text:
            skipped += 1
            continue

        if changed_size:
            size_writes += 1
        if seeded_due:
            seeded += 1
        if not args.dry_run:
            path.write_text(new_text, encoding="utf-8")

    verb = "would write" if args.dry_run else "wrote"
    print(f"{verb}: {size_writes} subtree_size updated, {seeded} cards_due seeded, "
          f"{skipped} unchanged ({len(notes)} notes)")


if __name__ == "__main__":
    main()
