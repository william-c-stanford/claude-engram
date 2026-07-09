#!/usr/bin/env python3
"""test_zettel_index.py — hermetic tests for scripts/zettel-index.py.

Covers rebuild/find/children/subtree/ancestors/collisions/upsert/remove on the
DragonScale `address` identity scheme, first-frontmatter-only parsing,
missing/corrupt-index recovery, atomic writes, cycle termination, root scoping,
and the outside-the-vault CWD guard. No network, no LLM. Pure stdlib.

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
    """Point the module's path constants at a fresh temp vault (tmp resolved so
    relative_to(VAULT_ROOT) works on macOS /var -> /private/var)."""
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


def write_note(wiki, relpath, address, title, parent="", children=None,
               aliases=None, body=""):
    children = children or []
    aliases = aliases or []
    p = wiki / relpath
    p.parent.mkdir(parents=True, exist_ok=True)
    fm = ["---", "type: zettel", f'address: "{address}"', f'title: "{title}"',
          f'parent: "{parent}"']
    if children:
        fm.append("children:")
        fm += [f'  - "{c}"' for c in children]
    else:
        fm.append("children: []")
    if aliases:
        fm.append("aliases:")
        fm += [f'  - "{a}"' for a in aliases]
    fm.append("---")
    p.write_text("\n".join(fm) + "\n\n" + body + "\n", encoding="utf-8")
    return p


def standard_tree(wiki):
    paths = {}
    paths["c-1"] = write_note(
        wiki, "Tokenization.md", "c-000001", "Tokenization",
        parent="", children=["c-000002", "c-000004"])
    paths["c-2"] = write_note(
        wiki, "Tokenization/Byte-Pair-Encoding.md", "c-000002", "Byte-Pair Encoding",
        parent="c-000001", children=["c-000003"], aliases=["BPE"])
    paths["c-3"] = write_note(
        wiki, "Tokenization/Byte-Pair-Encoding/BPE-Merge-Algorithm.md", "c-000003",
        "BPE Merge Algorithm", parent="c-000002")
    paths["c-4"] = write_note(
        wiki, "Tokenization/Special-Tokens.md", "c-000004", "Special Tokens",
        parent="c-000001", aliases=["EOS handling"])
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
        bpe = idx["c-000002"]
        assert_eq("bpe path", "wiki/Tokenization/Byte-Pair-Encoding.md", bpe["path"])
        assert_eq("bpe parent", "c-000001", bpe["parent"])
        assert_eq("bpe children", ["c-000003"], bpe["children"])
        assert_eq("bpe slug", "Byte-Pair-Encoding", bpe["slug"])
        assert_eq("bpe aliases", ["BPE"], bpe["aliases"])


# ─── rebuild: ignores address in a fenced code block in the body ─────────────
def test_rebuild_ignores_body_codeblock_address():
    with patched_vault() as (tmp, wiki):
        write_note(wiki, "Real.md", "c-000009", "Real Note",
                   body="Example:\n```yaml\naddress: \"c-999999\"\nparent: \"nope\"\n```\n")
        idx = zi.rebuild()
        assert_true("only real address indexed", "c-000009" in idx and "c-999999" not in idx,
                    hint=f"keys={list(idx)}")


# ─── find: title / alias / substring / miss ──────────────────────────────────
def test_find_matches():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.load_index()
        assert_eq("find exact title", "c-000002", zi.find(idx, "Byte-Pair Encoding")[0]["address"])
        assert_eq("find by alias", "c-000002", zi.find(idx, "BPE")[0]["address"])
        assert_eq("find case-diff substring", "c-000001", zi.find(idx, "tokeni")[0]["address"])
        assert_eq("find miss returns empty", [], zi.find(idx, "quantization"))


# ─── children / subtree / ancestors ──────────────────────────────────────────
def test_tree_queries():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.load_index()
        kids = {r["address"] for r in zi.children(idx, "c-000001")}
        assert_eq("children of root (direct only)", {"c-000002", "c-000004"}, kids)
        sub = {r["address"] for r in zi.subtree(idx, "c-000001")}
        assert_eq("subtree of root (all descendants)", {"c-000002", "c-000004", "c-000003"}, sub)
        anc = [r["address"] for r in zi.ancestors(idx, "c-000003")]
        assert_eq("ancestors (nearest first)", ["c-000002", "c-000001"], anc)


# ─── collisions ──────────────────────────────────────────────────────────────
def test_collisions():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.load_index()
        assert_eq("no collisions in clean tree", {}, zi.collisions(idx))
        write_note(wiki, "A/Overview.md", "c-000010", "Overview A")
        write_note(wiki, "B/Overview.md", "c-000011", "Overview B")
        idx = zi.rebuild()
        col = zi.collisions(idx)
        assert_true("Overview slug flagged", "Overview" in col and len(col["Overview"]) == 2,
                    hint=str(col))


# ─── upsert / remove isolation ───────────────────────────────────────────────
def test_upsert_and_remove():
    with patched_vault() as (tmp, wiki):
        paths = standard_tree(wiki)
        zi.rebuild()
        new = write_note(wiki, "Tokenization/Fertility.md", "c-000020", "Fertility",
                         parent="c-000001")
        rec = zi.upsert(str(new))
        assert_eq("upsert returns new record address", "c-000020", rec["address"])
        idx = zi.load_index()
        assert_eq("upsert added exactly one (5 total)", 5, len(idx))
        assert_true("existing record untouched", idx["c-000002"]["parent"] == "c-000001")
        removed = zi.remove(str(paths["c-4"]))
        assert_true("remove reports success", removed)
        idx = zi.load_index()
        assert_true("removed record gone", "c-000004" not in idx)
        assert_eq("remove dropped exactly one (4 left)", 4, len(idx))


# ─── recovery: missing / corrupt index ──────────────────────────────────────
def test_missing_index_recovers():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        idx = zi.load_index(recover=True)
        assert_eq("read auto-rebuilt to 4 notes", 4, len(idx))
        assert_true("index file now exists", (tmp / ".vault-meta" / "zettel-index.json").exists())


def test_corrupt_index_recovers():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        (tmp / ".vault-meta" / "zettel-index.json").write_text("{ this is not json", encoding="utf-8")
        idx = zi.load_index(recover=True)
        assert_eq("corrupt index rebuilt to 4 notes", 4, len(idx))


# ─── atomic write leaves valid JSON ──────────────────────────────────────────
def test_mutations_leave_valid_json():
    with patched_vault() as (tmp, wiki):
        standard_tree(wiki)
        zi.rebuild(); index_is_valid_json(tmp)
        new = write_note(wiki, "Extra.md", "c-000030", "Extra")
        zi.upsert(str(new)); index_is_valid_json(tmp)
        zi.remove(str(new)); index_is_valid_json(tmp)
        print("OK   index is valid JSON after rebuild/upsert/remove")


# ─── malformed tree termination ──────────────────────────────────────────────
def test_malformed_tree_terminates():
    with patched_vault() as (tmp, wiki):
        write_note(wiki, "Loop.md", "c-000040", "Loop", parent="c-000040")
        write_note(wiki, "Orphan.md", "c-000041", "Orphan", parent="c-999998")
        idx = zi.rebuild()
        assert_eq("self-parent ancestors terminate empty", [], zi.ancestors(idx, "c-000040"))
        assert_eq("missing-parent ancestors terminate empty", [], zi.ancestors(idx, "c-000041"))
        assert_eq("self-parent subtree terminates empty", [], zi.subtree(idx, "c-000040"))


def test_two_node_cycle_terminates():
    with patched_vault() as (tmp, wiki):
        write_note(wiki, "A.md", "c-000050", "A", parent="c-000051", children=["c-000051"])
        write_note(wiki, "B.md", "c-000051", "B", parent="c-000050", children=["c-000050"])
        idx = zi.rebuild()
        sub = {r["address"] for r in zi.subtree(idx, "c-000050")}
        assert_eq("cycle subtree visits the other node once", {"c-000051"}, sub)


# ─── root scoping ────────────────────────────────────────────────────────────
def test_root_scoping_excludes_outside_notes():
    with patched_vault() as (tmp, wiki):
        write_note(wiki, "Existing-Flat.md", "c-000060", "Existing Flat")
        (wiki / "zettel").mkdir()
        write_note(wiki / "zettel", "Topic.md", "c-000061", "Topic")
        with mock.patch.object(zi, "WIKI_DIR", wiki / "zettel"):
            idx = zi.rebuild()
        assert_true("scoped rebuild indexes only the subtree note",
                    set(idx) == {"c-000061"}, hint=f"keys={list(idx)}")
        assert_true("flat note outside root excluded", "c-000060" not in idx)


def test_stored_root_persisted():
    with patched_vault() as (tmp, wiki):
        (wiki / "zettel").mkdir()
        write_note(wiki / "zettel", "Topic.md", "c-000061", "Topic")
        with mock.patch.object(zi, "WIKI_DIR", wiki / "zettel"):
            zi.rebuild()
        data = index_is_valid_json(tmp)
        assert_eq("stored root is the scoped subtree", "wiki/zettel", data.get("root"))
        assert_eq("_read_stored_root reads it back", "wiki/zettel", zi._read_stored_root())


# ─── CWD guard: path outside the vault exits 2 with context ──────────────────
def test_upsert_outside_vault_guard():
    with patched_vault() as (tmp, wiki):
        outside = Path(tempfile.gettempdir()).resolve() / "definitely-not-in-vault.md"
        raised = False
        try:
            zi.upsert(str(outside))
        except SystemExit as e:
            raised = True
            assert_eq("guard exits with code 2", 2, e.code)
        assert_true("upsert on out-of-vault path raises SystemExit", raised)


def main():
    print("=== test_zettel_index.py ===")
    test_rebuild_captures_fields()
    test_rebuild_ignores_body_codeblock_address()
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
    test_upsert_outside_vault_guard()
    print("\nAll zettel-index tests passed.")


if __name__ == "__main__":
    main()
