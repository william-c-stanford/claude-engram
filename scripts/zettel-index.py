#!/usr/bin/env python3
"""zettel-index.py — index + query cache for folder-nested Zettelkasten notes.

Maintains a rebuildable index sidecar at .vault-meta/zettel-index.json mapping
each note's stable id to its path, title, aliases, parent_id, and child_ids.
The index is a CACHE, not the source of truth: the note files' first-frontmatter
block is authoritative, and `rebuild` reconstructs the index by scanning
wiki/**/*.md. This mirrors scripts/allocate-address.sh's counter-recovery model
and scripts/wiki-mode.py's atomic JSON writes.

The index exists so consumers (comprehensive-zettel, wiki-ingest) can answer
"does a note for X already exist / where" and "what does this branch cover"
without reading every file in the vault.

CLI:
  zettel-index.py rebuild            # scan wiki/**/*.md, (re)write the index
  zettel-index.py get <id>           # one record as JSON
  zettel-index.py find <text>        # candidates matching title/alias/slug
  zettel-index.py children <id>      # direct children records
  zettel-index.py subtree <id>       # all descendants (self excluded)
  zettel-index.py ancestors <id>     # parent chain, nearest-first, to root
  zettel-index.py collisions         # slugs used by >1 note (wikilink hazard)
  zettel-index.py upsert <path>      # add/replace one note's record
  zettel-index.py remove <path>      # drop one note's record

All read commands auto-recover: a missing/empty/corrupt index triggers a
transparent rebuild (INFO to stderr) before answering. This helper NEVER writes
to note files.

Exit codes:
  0 — success
  2 — usage error
  3 — not found (get/upsert on a path with no parseable id)
"""

import argparse
import json
import re
import sys
import tempfile
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parent.parent
WIKI_DIR = VAULT_ROOT / "wiki"
META_DIR = VAULT_ROOT / ".vault-meta"
INDEX_PATH = META_DIR / "zettel-index.json"

SCHEMA_VERSION = 1


# ─── Frontmatter parsing ─────────────────────────────────────────────────────

def parse_frontmatter(path):
    """Return the first YAML frontmatter block of a note as a dict, or None.

    Only the FIRST frontmatter block (delimited by leading `---` lines) is read;
    body content and fenced code blocks are ignored, matching the scan
    discipline in allocate-address.sh. This is a deliberately small YAML subset
    (flat scalars + simple `- ` lists) sufficient for zettel frontmatter, so the
    script stays stdlib-only like its sibling helpers.
    """
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    fm = {}
    key = None
    list_acc = None
    for raw in lines[1:]:
        if raw.strip() == "---":
            break
        # list item under the current key
        m_item = re.match(r"^\s+-\s+(.*)$", raw)
        if m_item and key is not None and list_acc is not None:
            list_acc.append(_unquote(m_item.group(1).strip()))
            fm[key] = list_acc
            continue
        m_kv = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", raw)
        if m_kv:
            key = m_kv.group(1)
            val = m_kv.group(2).strip()
            if val == "":
                # could be the start of a block list; prime an accumulator
                list_acc = []
                fm[key] = ""
            else:
                list_acc = None
                fm[key] = _unquote(val)
    return fm


def _unquote(s):
    s = s.strip()
    if len(s) >= 2 and s[0] == s[-1] and s[0] in ("'", '"'):
        return s[1:-1]
    return s


def _slug_of(path):
    """The bare filename slug (no directory, no .md) — the wikilink target."""
    return Path(path).stem


def _record_from_file(path):
    """Build an index record from a note file, or None if it has no id."""
    fm = parse_frontmatter(path)
    if not fm:
        return None
    note_id = fm.get("id")
    if not note_id or not isinstance(note_id, str):
        return None
    rel = str(Path(path).resolve().relative_to(VAULT_ROOT))
    aliases = fm.get("aliases")
    if not isinstance(aliases, list):
        aliases = []
    child_ids = fm.get("child_ids")
    if not isinstance(child_ids, list):
        child_ids = []
    parent_id = fm.get("parent_id")
    if not isinstance(parent_id, str):
        parent_id = ""
    return {
        "id": note_id,
        "path": rel,
        "slug": _slug_of(path),
        "title": fm.get("title", "") if isinstance(fm.get("title"), str) else "",
        "aliases": aliases,
        "parent_id": parent_id,
        "child_ids": child_ids,
    }


# ─── Index load / save ───────────────────────────────────────────────────────

def _scan_records():
    """Walk WIKI_DIR and return {id: record} for every note with an id."""
    records = {}
    if not WIKI_DIR.is_dir():
        return records
    for path in sorted(WIKI_DIR.rglob("*.md")):
        rec = _record_from_file(path)
        if rec:
            records[rec["id"]] = rec
    return records


def rebuild():
    """Reconstruct the index from the vault and write it atomically."""
    records = _scan_records()
    _write_index(records)
    return records


def _write_index(records):
    META_DIR.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(
        {"schema_version": SCHEMA_VERSION, "notes": records},
        indent=2, ensure_ascii=False,
    ) + "\n"
    fd, tmp = tempfile.mkstemp(prefix="zettel-index.", suffix=".tmp", dir=str(META_DIR))
    try:
        with open(fd, "w", encoding="utf-8") as fh:
            fh.write(payload)
        Path(tmp).replace(INDEX_PATH)
    except Exception:
        try:
            Path(tmp).unlink()
        except OSError:
            pass
        raise


def load_index(recover=True):
    """Return {id: record}. On missing/empty/corrupt index, rebuild if allowed."""
    if not INDEX_PATH.is_file():
        if recover:
            print("INFO: zettel index missing; rebuilding from vault scan", file=sys.stderr)
            return rebuild()
        return {}
    try:
        raw = INDEX_PATH.read_text(encoding="utf-8")
        data = json.loads(raw)
        notes = data.get("notes", {})
        if not isinstance(notes, dict):
            raise ValueError("notes is not an object")
        return notes
    except (OSError, ValueError, json.JSONDecodeError) as e:
        if recover:
            print(f"INFO: zettel index unreadable ({e}); rebuilding", file=sys.stderr)
            return rebuild()
        return {}


# ─── Queries ─────────────────────────────────────────────────────────────────

def find(index, text):
    """Candidate records matching text on title, alias, or slug.

    Ranked: exact title (0) > exact alias (1) > substring in title/alias/slug (2).
    Case-insensitive. Returns a list of records, best first.
    """
    q = text.strip().lower()
    scored = []
    for rec in index.values():
        title = (rec.get("title") or "").lower()
        aliases = [a.lower() for a in rec.get("aliases", []) if isinstance(a, str)]
        slug = (rec.get("slug") or "").lower()
        if title == q:
            scored.append((0, rec))
        elif q in aliases:
            scored.append((1, rec))
        elif q and (q in title or q in slug or any(q in a for a in aliases)):
            scored.append((2, rec))
    scored.sort(key=lambda t: (t[0], t[1].get("path", "")))
    return [rec for _, rec in scored]


def children(index, note_id):
    """Direct children of note_id, ordered by path."""
    kids = [r for r in index.values() if r.get("parent_id") == note_id]
    kids.sort(key=lambda r: r.get("path", ""))
    return kids


def subtree(index, note_id):
    """All descendants of note_id (self excluded), breadth-first, cycle-safe."""
    out = []
    seen = {note_id}
    frontier = [note_id]
    while frontier:
        nxt = []
        for pid in frontier:
            for kid in children(index, pid):
                if kid["id"] in seen:
                    continue
                seen.add(kid["id"])
                out.append(kid)
                nxt.append(kid["id"])
        frontier = nxt
    return out


def ancestors(index, note_id):
    """Parent chain from nearest parent up to the root, cycle-safe."""
    out = []
    seen = {note_id}
    rec = index.get(note_id)
    while rec:
        pid = rec.get("parent_id") or ""
        if not pid or pid in seen:
            break
        seen.add(pid)
        parent = index.get(pid)
        if not parent:
            break
        out.append(parent)
        rec = parent
    return out


def collisions(index):
    """{slug: [records]} for every slug shared by more than one note."""
    by_slug = {}
    for rec in index.values():
        by_slug.setdefault(rec.get("slug", ""), []).append(rec)
    return {slug: recs for slug, recs in by_slug.items() if slug and len(recs) > 1}


# ─── Mutations ───────────────────────────────────────────────────────────────

def upsert(path):
    """Parse one note file, replace/add its record, write. Returns the record."""
    rec = _record_from_file(Path(path))
    if not rec:
        return None
    index = load_index(recover=True)
    # Drop any stale record that previously pointed at this path under a
    # different id (e.g., the id was changed by hand), keyed by path.
    index = {i: r for i, r in index.items() if r.get("path") != rec["path"]}
    index[rec["id"]] = rec
    _write_index(index)
    return rec


def remove(path):
    """Drop the record whose path matches. Returns True if something was removed."""
    rel = str(Path(path).resolve().relative_to(VAULT_ROOT)) if Path(path).is_absolute() else str(path)
    index = load_index(recover=True)
    before = len(index)
    index = {i: r for i, r in index.items() if r.get("path") != rel}
    _write_index(index)
    return len(index) < before


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Index + query cache for nested Zettelkasten notes.")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("rebuild", help="Scan the vault and rewrite the index")
    sp_get = sub.add_parser("get", help="Print one record by id")
    sp_get.add_argument("id")
    sp_find = sub.add_parser("find", help="Candidates matching title/alias/slug")
    sp_find.add_argument("text")
    sp_children = sub.add_parser("children", help="Direct children of an id")
    sp_children.add_argument("id")
    sp_subtree = sub.add_parser("subtree", help="All descendants of an id")
    sp_subtree.add_argument("id")
    sp_anc = sub.add_parser("ancestors", help="Parent chain of an id")
    sp_anc.add_argument("id")
    sub.add_parser("collisions", help="Slugs used by more than one note")
    sp_up = sub.add_parser("upsert", help="Add/replace one note's record")
    sp_up.add_argument("path")
    sp_rm = sub.add_parser("remove", help="Drop one note's record by path")
    sp_rm.add_argument("path")

    args = parser.parse_args()

    if args.cmd == "rebuild":
        recs = rebuild()
        print(f"Indexed {len(recs)} notes -> {INDEX_PATH.relative_to(VAULT_ROOT)}")
        return 0

    if args.cmd == "upsert":
        rec = upsert(args.path)
        if not rec:
            print(f"ERR: no parseable zettel id in {args.path}", file=sys.stderr)
            return 3
        print(json.dumps(rec, indent=2, ensure_ascii=False))
        return 0

    if args.cmd == "remove":
        removed = remove(args.path)
        print("removed" if removed else "no matching record")
        return 0

    index = load_index(recover=True)

    if args.cmd == "get":
        rec = index.get(args.id)
        if not rec:
            print(f"ERR: no note with id {args.id}", file=sys.stderr)
            return 3
        print(json.dumps(rec, indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "find":
        print(json.dumps(find(index, args.text), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "children":
        print(json.dumps(children(index, args.id), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "subtree":
        print(json.dumps(subtree(index, args.id), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "ancestors":
        print(json.dumps(ancestors(index, args.id), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "collisions":
        print(json.dumps(collisions(index), indent=2, ensure_ascii=False))
        return 0

    return 2


if __name__ == "__main__":
    sys.exit(main())
