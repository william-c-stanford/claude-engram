#!/usr/bin/env python3
"""zettel-index.py — index + query cache for folder-nested Zettelkasten notes.

Maintains a rebuildable index sidecar at .vault-meta/zettel-index.json mapping
each note's DragonScale address to its path, title, aliases, parent, and
children. The index is a CACHE, not the source of truth: the note files' first
frontmatter block is authoritative, and `rebuild` reconstructs the index by
scanning wiki/**/*.md. This mirrors scripts/allocate-address.sh's counter
recovery and scripts/wiki-mode.py's atomic JSON writes.

Identity is the single DragonScale scheme: every zettel carries `address:`
(c-NNNNNN or l-NNNNNN, allocated by scripts/allocate-address.sh), and the tree
is expressed with `parent:` (a parent's address, "" for a root) and `children:`
(a list of child addresses). There is no separate `id:`; the address IS the id,
so the same page participates in DragonScale address validation (wiki-lint) with
no parallel identity scheme.

The index exists so consumers (comprehensive-zettel, wiki-ingest) can answer
"does a note for X already exist / where" and "what does this branch cover"
without reading every file in the vault.

CLI:
  zettel-index.py [--root wiki/zettel] rebuild   # scan subtree, (re)write index
  zettel-index.py get <address>                  # one record as JSON
  zettel-index.py find <text>                    # candidates by title/alias/slug
  zettel-index.py children <address>             # direct children records
  zettel-index.py subtree <address>              # all descendants (self excluded)
  zettel-index.py ancestors <address>            # parent chain, nearest-first
  zettel-index.py collisions                     # slugs used by >1 note
  zettel-index.py upsert <path>                  # add/replace one note's record
  zettel-index.py remove <path>                  # drop one note's record

All read commands auto-recover: a missing/empty/corrupt index triggers a
transparent rebuild (INFO to stderr) before answering. This helper NEVER writes
to note files.

Exit codes:
  0 — success
  2 — usage error (including a path outside the vault root)
  3 — not found (get, or upsert on a file with no address)
"""

import argparse
import json
import os
import re
import sys
import tempfile
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ROOT = "wiki"
# WIKI_DIR is THE scan root — the subtree rebuild walks. Defaults to wiki/ but
# can be scoped to a subtree (e.g. wiki/zettel/) via `--root` / ZETTEL_ROOT so an
# index can cover a fresh corpus without pulling in pre-existing pages.
WIKI_DIR = VAULT_ROOT / DEFAULT_ROOT
META_DIR = VAULT_ROOT / ".vault-meta"
INDEX_PATH = META_DIR / "zettel-index.json"

SCHEMA_VERSION = 2  # v2: identity is `address` (was timestamp `id` in v1)


def _apply_root(root_rel):
    """Point the scan root at a vault-relative subtree (e.g. 'wiki/zettel')."""
    global WIKI_DIR
    WIKI_DIR = VAULT_ROOT / root_rel


def _current_root_rel():
    """The scan root as a vault-relative string, for storage in the index."""
    try:
        return str(WIKI_DIR.resolve().relative_to(VAULT_ROOT))
    except ValueError:
        return DEFAULT_ROOT


def _read_stored_root():
    """The `root` recorded in an existing index file, or None."""
    if not INDEX_PATH.is_file():
        return None
    try:
        return json.loads(INDEX_PATH.read_text(encoding="utf-8")).get("root")
    except (OSError, ValueError, json.JSONDecodeError):
        return None


def _vault_relative(path):
    """Return `path` as a vault-relative string, or raise SystemExit(2) with
    agent-actionable context when it resolves outside the vault.

    Paths are resolved against the current working directory, so an agent that
    invokes this from the wrong CWD gets a precise, self-correcting error rather
    than a bare ValueError traceback.
    """
    resolved = Path(path).resolve()
    try:
        return str(resolved.relative_to(VAULT_ROOT))
    except ValueError:
        sys.stderr.write(
            "ERR: path is outside the vault root.\n"
            f"  given:       {path}\n"
            f"  resolved to: {resolved}\n"
            f"  vault root:  {VAULT_ROOT}\n"
            "  Cause: relative paths resolve against the current working "
            "directory (CWD), and this CWD is not the vault root.\n"
            "  Fix: pass a path inside the vault, or re-run with the vault root "
            f"as CWD (cd {VAULT_ROOT}) and pass a vault-relative path "
            "(e.g. wiki/zettel/Foo.md).\n"
        )
        raise SystemExit(2)


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
    """Build an index record from a note file, or None if it has no address."""
    fm = parse_frontmatter(path)
    if not fm:
        return None
    address = fm.get("address")
    if not address or not isinstance(address, str):
        return None
    rel = str(Path(path).resolve().relative_to(VAULT_ROOT))
    aliases = fm.get("aliases")
    if not isinstance(aliases, list):
        aliases = []
    children = fm.get("children")
    if not isinstance(children, list):
        children = []
    parent = fm.get("parent")
    if not isinstance(parent, str):
        parent = ""
    return {
        "address": address,
        "path": rel,
        "slug": _slug_of(path),
        "title": fm.get("title", "") if isinstance(fm.get("title"), str) else "",
        "aliases": aliases,
        "parent": parent,
        "children": children,
    }


# ─── Index load / save ───────────────────────────────────────────────────────

def _scan_records():
    """Walk WIKI_DIR and return {address: record} for every note with an address."""
    records = {}
    if not WIKI_DIR.is_dir():
        return records
    for path in sorted(WIKI_DIR.rglob("*.md")):
        rec = _record_from_file(path)
        if rec:
            records[rec["address"]] = rec
    return records


def rebuild():
    """Reconstruct the index from the vault and write it atomically."""
    records = _scan_records()
    _write_index(records)
    return records


def _write_index(records):
    META_DIR.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(
        {"schema_version": SCHEMA_VERSION, "root": _current_root_rel(), "notes": records},
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
    """Return {address: record}. On missing/empty/corrupt index, rebuild if allowed."""
    if not INDEX_PATH.is_file():
        if recover:
            print("INFO: zettel index missing; rebuilding from vault scan", file=sys.stderr)
            return rebuild()
        return {}
    try:
        data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
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


def children(index, address):
    """Direct children of the note at `address`, ordered by path."""
    kids = [r for r in index.values() if r.get("parent") == address]
    kids.sort(key=lambda r: r.get("path", ""))
    return kids


def subtree(index, address):
    """All descendants of `address` (self excluded), breadth-first, cycle-safe."""
    out = []
    seen = {address}
    frontier = [address]
    while frontier:
        nxt = []
        for pid in frontier:
            for kid in children(index, pid):
                if kid["address"] in seen:
                    continue
                seen.add(kid["address"])
                out.append(kid)
                nxt.append(kid["address"])
        frontier = nxt
    return out


def ancestors(index, address):
    """Parent chain from nearest parent up to the root, cycle-safe."""
    out = []
    seen = {address}
    rec = index.get(address)
    while rec:
        pid = rec.get("parent") or ""
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
    rel = _vault_relative(path)
    rec = _record_from_file(Path(path))
    if not rec:
        return None
    index = load_index(recover=True)
    index = {a: r for a, r in index.items() if r.get("path") != rel}
    index[rec["address"]] = rec
    _write_index(index)
    return rec


def remove(path):
    """Drop the record whose path matches. Returns True if something was removed."""
    rel = _vault_relative(path)
    index = load_index(recover=True)
    before = len(index)
    index = {a: r for a, r in index.items() if r.get("path") != rel}
    _write_index(index)
    return len(index) < before


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Index + query cache for nested Zettelkasten notes.")
    parser.add_argument("--root", default=None,
                        help="Vault-relative subtree to scan (e.g. wiki/zettel). "
                             "Overrides $ZETTEL_ROOT and any root stored in the index. "
                             "Scopes the index so it excludes pages outside the subtree.")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("rebuild", help="Scan the subtree and rewrite the index")
    sp_get = sub.add_parser("get", help="Print one record by address")
    sp_get.add_argument("address")
    sp_find = sub.add_parser("find", help="Candidates matching title/alias/slug")
    sp_find.add_argument("text")
    sp_children = sub.add_parser("children", help="Direct children of an address")
    sp_children.add_argument("address")
    sp_subtree = sub.add_parser("subtree", help="All descendants of an address")
    sp_subtree.add_argument("address")
    sp_anc = sub.add_parser("ancestors", help="Parent chain of an address")
    sp_anc.add_argument("address")
    sub.add_parser("collisions", help="Slugs used by more than one note")
    sp_up = sub.add_parser("upsert", help="Add/replace one note's record")
    sp_up.add_argument("path")
    sp_rm = sub.add_parser("remove", help="Drop one note's record by path")
    sp_rm.add_argument("path")

    args = parser.parse_args()

    # Resolve the scan root once, for every command: explicit --root wins, then
    # $ZETTEL_ROOT, then the root recorded in an existing index, else wiki/.
    if args.root:
        _apply_root(args.root)
    elif os.environ.get("ZETTEL_ROOT"):
        _apply_root(os.environ["ZETTEL_ROOT"])
    else:
        stored = _read_stored_root()
        if stored:
            _apply_root(stored)

    if args.cmd == "rebuild":
        recs = rebuild()
        print(f"Indexed {len(recs)} notes -> {INDEX_PATH.relative_to(VAULT_ROOT)}")
        return 0
    if args.cmd == "upsert":
        rec = upsert(args.path)
        if not rec:
            print(f"ERR: no `address:` frontmatter in {args.path}", file=sys.stderr)
            return 3
        print(json.dumps(rec, indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "remove":
        print("removed" if remove(args.path) else "no matching record")
        return 0

    index = load_index(recover=True)

    if args.cmd == "get":
        rec = index.get(args.address)
        if not rec:
            print(f"ERR: no note with address {args.address}", file=sys.stderr)
            return 3
        print(json.dumps(rec, indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "find":
        print(json.dumps(find(index, args.text), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "children":
        print(json.dumps(children(index, args.address), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "subtree":
        print(json.dumps(subtree(index, args.address), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "ancestors":
        print(json.dumps(ancestors(index, args.address), indent=2, ensure_ascii=False))
        return 0
    if args.cmd == "collisions":
        print(json.dumps(collisions(index), indent=2, ensure_ascii=False))
        return 0

    return 2


if __name__ == "__main__":
    sys.exit(main())
