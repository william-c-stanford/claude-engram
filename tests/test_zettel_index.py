#!/usr/bin/env python3
"""test_zettel_index.py — hermetic tests for scripts/zettel-index.py.

Covers rebuild/find/children/subtree/ancestors/collisions/upsert/remove,
first-frontmatter-only parsing, missing/corrupt-index recovery, atomic writes,
and cycle/malformed-tree termination. No network, no LLM. Pure stdlib.

Usage:
  python3 tests/test_zettel_index.py
"""
import importlib.util
import json
import sys
import tempfile
from contextlib import contextmanager
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parent.parent
HELPER = ROOT / "scripts" / "zettel-index.py"

spec = importlib.util.spec_from_file_location("zettel_index", HELPER)
zi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(zi)


class Fail(SystemExit):
    pass


def assert_eq(label, expected, actual):
    if expected != actual:
        raise Fail(f"FAIL {label}: expected {expected!r}, got {actual!r}")
    print(f"OK   {label}")


def assert_true(label, cond, hint=""):
    if not cond:
        raise Fail(f"FAIL {label}{(': ' + hint) if hint else ''}")
    print(f"OK   {label}")


# ─── Fixture helpers ─────────────────────────────────────────────────────────

@contextmanager
def patched_vault():
    """Point the module's path constants at a fresh temp vault.

    tmp is resolved so that _record_from_file's relative_to(VAULT_ROOT) works on
    macOS, where tempfile hands back /var/... which resolves to /private/var/...
    """
    with tempfile.TemporaryDirectory() as raw:
        tmp = Path(raw).resolve()
        wiki = tmp / "wiki"
        meta = tmp / ".vault-meta"
        wiki.mkdir()
        meta.mkdir()
        with mock.patch.object(zi, "VAULT_ROOT", tmp), \
             mock.patch.object(zi, "WIKI_DIR", wiki), \
             mock.patch.object(zi, "META_DIR", meta), \
             mock.patch.object(zi, "INDEX_PATH", meta / "zettel-index.json"):
            yield tmp, wiki


def write_note(wiki, relpath, note_id, title, parent_id="", child_ids=None,
               aliases=None, body=""):
    child_ids = child_ids or []
    aliases = aliases or []
    p = wiki / relpath
    p.parent.mkdir(parents=True, exist_ok=True)
    fm = ["---", "type: zettel", f'id: "{note_id}"', f'title: "{title}"',
          f'parent_id: "{parent_id}"']
    if child_ids:
        fm.append("child_ids:")
        fm += [f'  - "{c}"' for c in child_ids]
    else:
        fm.append("child_ids: []")
    if aliases:
        fm.append("aliases:")
        fm += [f'  - "{a}"' for a in aliases]
    fm.append("---")
    p.write_text("\n".join(fm) + "\n\n" + body + "\n", encoding="utf-8")
    return p


def standard_tree(wiki):
    """A 4-note nested tree plus returns the note paths keyed by id."""
    paths = {}
    paths["id-tok"] = write_note(
        wiki, "Tokenization.md", "id-tok", "Tokenization",
        parent_id="", child_ids=["id-bpe", "id-special"])
    paths["id-bpe"] = write_note(
        wiki, "Tokenization/Byte-Pair-Encoding.md", "id-bpe", "Byte-Pair Encoding",
        parent_id="id-tok", child_ids=["id-merge"], aliases=["BPE"])
    paths["id-merge"] = write_note(
        wiki, "Tokenization/Byte-Pair-Encoding/BPE-Merge-Algorithm.md", "id-merge",
        "BPE Merge Algorithm", parent_id="id-bpe")
    paths["id-special"] = write_note(
        wiki, "Tokenization/Special-Tokens.md", "id-special", "Special Tokens",
        parent_id="id-tok", aliases=["EOS handling"])
    return paths


def index_is_valid_json(tmp):
    data = json.loads((tmp / ".vault-meta" / "zettel-index.json").read_text())
    assert isinstance(data.get("notes"), dict)
    return data


# ─── rebuild: correct fields ─────────────────────────────────────────────────
def test_rebuild_captures_fields():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.rebuild()
        assert_eq("rebuild indexes 4 notes", 4, len(idx))
        bpe = idx["id-bpe"]
        assert_eq("bpe path", "wiki/Tokenization/Byte-Pair-Encoding.md", bpe["path"])
        assert_eq("bpe parent", "id-tok", bpe["parent_id"])
        assert_eq("bpe child_ids", ["id-merge"], bpe["child_ids"])
        assert_eq("bpe slug", "Byte-Pair-Encoding", bpe["slug"])
        assert_eq("bpe aliases", ["BPE"], bpe["aliases"])


# ─── rebuild: ignores id in a fenced code block in the body ──────────────────
def test_rebuild_ignores_body_codeblock_id():
    with patched_vault() as (tmp, wiki):
        write_note(wiki, "Real.md", "id-real", "Real Note",
                   body="Example:\n```yaml\nid: \"fake-id\"\nparent_id: \"nope\"\n```\n")
        idx = zi.rebuild()
        assert_true("only real id indexed", "id-real" in idx and "fake-id" not in idx,
                    hint=f"keys={list(idx)}")


# ─── find: title / alias / substring / miss ──────────────────────────────────
def test_find_matches():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.load_index()
        assert_eq("find exact title", "id-bpe", zi.find(idx, "Byte-Pair Encoding")[0]["id"])
        assert_eq("find by alias", "id-bpe", zi.find(idx, "BPE")[0]["id"])
        assert_eq("find case-diff substring", "id-tok", zi.find(idx, "tokeni")[0]["id"])
        assert_eq("find miss returns empty", [], zi.find(idx, "quantization"))


# ─── children / subtree / ancestors ──────────────────────────────────────────
def test_tree_queries():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.load_index()
        kids = {r["id"] for r in zi.children(idx, "id-tok")}
        assert_eq("children of tok (direct only)", {"id-bpe", "id-special"}, kids)
        sub = {r["id"] for r in zi.subtree(idx, "id-tok")}
        assert_eq("subtree of tok (all descendants)", {"id-bpe", "id-special", "id-merge"}, sub)
        anc = [r["id"] for r in zi.ancestors(idx, "id-merge")]
        assert_eq("ancestors of merge (nearest first)", ["id-bpe", "id-tok"], anc)


# ─── collisions ──────────────────────────────────────────────────────────────
def test_collisions():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.load_index()
        assert_eq("no collisions in clean tree", {}, zi.collisions(idx))
        write_note(wiki, "A/Overview.md", "ov1", "Overview A")
        write_note(wiki, "B/Overview.md", "ov2", "Overview B")
        idx = zi.rebuild()
        col = zi.collisions(idx)
        assert_true("Overview slug flagged", "Overview" in col and len(col["Overview"]) == 2,
                    hint=str(col))


# ─── upsert / remove isolation ───────────────────────────────────────────────
def test_upsert_and_remove():
    with patched_vault() as (tmp, wiki):
        paths = standard_tree(wiki)
        zi.rebuild()
        new = write_note(wiki, "Tokenization/Fertility.md", "id-fert", "Fertility",
                         parent_id="id-tok")
        rec = zi.upsert(str(new))
        assert_eq("upsert returns new record id", "id-fert", rec["id"])
        idx = zi.load_index()
        assert_eq("upsert added exactly one (5 total)", 5, len(idx))
        assert_true("existing record untouched", idx["id-bpe"]["parent_id"] == "id-tok")
        removed = zi.remove(str(paths["id-special"]))
        assert_true("remove reports success", removed)
        idx = zi.load_index()
        assert_true("removed record gone", "id-special" not in idx)
        assert_eq("remove dropped exactly one (4 left)", 4, len(idx))


# ─── recovery: missing index auto-rebuilds on read ───────────────────────────
def test_missing_index_recovers():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        assert_true("index absent before read", not (tmp / ".vault-meta" / "zettel-index.json").exists())
        idx = zi.load_index(recover=True)
        assert_eq("read auto-rebuilt to 4 notes", 4, len(idx))
        assert_true("index file now exists", (tmp / ".vault-meta" / "zettel-index.json").exists())


# ─── recovery: corrupt index rebuilt ─────────────────────────────────────────
def test_corrupt_index_recovers():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        (tmp / ".vault-meta" / "zettel-index.json").write_text("{ this is not json", encoding="utf-8")
        idx = zi.load_index(recover=True)
        assert_eq("corrupt index rebuilt to 4 notes", 4, len(idx))


# ─── atomic write leaves valid JSON after every mutation ─────────────────────
def test_mutations_leave_valid_json():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        zi.rebuild(); index_is_valid_json(tmp)
        new = write_note(wiki, "Extra.md", "id-extra", "Extra")
        zi.upsert(str(new)); index_is_valid_json(tmp)
        zi.remove(str(new)); index_is_valid_json(tmp)
        print("OK   index is valid JSON after rebuild/upsert/remove")


# ─── malformed tree: self-parent and missing parent terminate ────────────────
def test_malformed_tree_terminates():
    with patched_vault() as (tmp, wiki):
        write_note(wiki, "Loop.md", "id-loop", "Loop", parent_id="id-loop")
        write_note(wiki, "Orphan.md", "id-orphan", "Orphan", parent_id="id-ghost")
        idx = zi.rebuild()
        assert_eq("self-parent ancestors terminate empty", [], zi.ancestors(idx, "id-loop"))
        assert_eq("missing-parent ancestors terminate empty", [], zi.ancestors(idx, "id-orphan"))
        assert_eq("self-parent subtree terminates empty", [], zi.subtree(idx, "id-loop"))


# ─── two-node cycle in subtree does not hang ─────────────────────────────────
def test_two_node_cycle_terminates():
    with patched_vault() as (tmp, wiki):
        write_note(wiki, "A.md", "id-a", "A", parent_id="id-b", child_ids=["id-b"])
        write_note(wiki, "B.md", "id-b", "B", parent_id="id-a", child_ids=["id-a"])
        idx = zi.rebuild()
        sub = {r["id"] for r in zi.subtree(idx, "id-a")}
        assert_eq("cycle subtree visits the other node once", {"id-b"}, sub)


# ─── root scoping: rebuild covers only the configured subtree ───────────────
def test_root_scoping_excludes_outside_notes():
    with patched_vault() as (tmp, wiki):
        # A pre-existing flat note directly under wiki/ ...
        write_note(wiki, "Existing-Flat.md", "id-flat", "Existing Flat")
        # ... and a fresh corpus under wiki/zettel/
        (wiki / "zettel").mkdir()
        write_note(wiki / "zettel", "Topic.md", "id-topic", "Topic")
        with mock.patch.object(zi, "WIKI_DIR", wiki / "zettel"):
            idx = zi.rebuild()
        assert_true("scoped rebuild indexes only the subtree note",
                    set(idx) == {"id-topic"}, hint=f"keys={list(idx)}")
        assert_true("flat note outside root excluded", "id-flat" not in idx)


# ─── root scoping: the chosen root is persisted in the index ────────────────
def test_stored_root_persisted():
    with patched_vault() as (tmp, wiki):
        (wiki / "zettel").mkdir()
        write_note(wiki / "zettel", "Topic.md", "id-topic", "Topic")
        with mock.patch.object(zi, "WIKI_DIR", wiki / "zettel"):
            zi.rebuild()
        data = index_is_valid_json(tmp)
        assert_eq("stored root is the scoped subtree", "wiki/zettel", data.get("root"))
        assert_eq("_read_stored_root reads it back", "wiki/zettel", zi._read_stored_root())


def main():
    print("=== test_zettel_index.py ===")
    test_rebuild_captures_fields()
    test_rebuild_ignores_body_codeblock_id()
    test_find_matches()
    test_tree_queries()
    test_collisions()
    test_upsert_and_remove()
    test_missing_index_recovers()
    test_corrupt_index_recovers()
    test_mutations_leave_valid_json()
    test_malformed_tree_terminates()
    test_two_node_cycle_terminates()
    test_root_scoping_excludes_outside_notes()
    test_stored_root_persisted()
    print("\nAll zettel-index tests passed.")


if __name__ == "__main__":
    main()
