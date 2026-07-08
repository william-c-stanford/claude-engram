---
name: local-wiki-index
description: "Index and navigate the folder-nested Zettelkasten vault, and decide where a new atomic note goes. Maintains a rebuildable JSON cache (.vault-meta/zettel-index.json) mapping DragonScale address -> path/title/aliases/parent/children so existence checks and branch lookups are O(1) instead of a whole-vault read. Provides the attach/promote placement procedure wiki-ingest consults before filing. Triggers on: index the zettels, rebuild the zettel index, find a note, does this note exist, where does this note go, attach or promote, which parent, slug collision, navigate the zettel tree."
allowed-tools: Read Write Edit Bash
---

# local-wiki-index: Zettel Index + Placement

Companion to [[comprehensive-zettel]]. That skill defines what a note *is* (atomic + comprehensive, folder-nested, real LaTeX). This skill makes the resulting tree **navigable and safe to grow**: a fast index of what exists and where, plus the decision procedure for where a new atomic note attaches.

Backed by one script: `scripts/zettel-index.py`.

---

## Why this exists

Once you know a note's path, the filesystem answers navigation directly: children are `ls wiki/zettel/<slug>/`, the parent is one directory up. Three things the filesystem **cannot** answer, and each blocks correct ingestion:

- **Existence** — a deep path like `wiki/zettel/Tokenization/Byte-Pair-Encoding/BPE-Merge-Algorithm.md` isn't guessable from a concept name. Checking "does a note for this claim already exist" by reading candidate files blows the ingest read budget.
- **Placement** — which existing parent a new atomic note attaches under, or whether a leaf must be promoted into a parent to hold it.
- **Slug collisions** — filenames are plain slugs, unique only among siblings. Two `Overview.md` in different branches break bare `[[Overview]]` wikilinks.

The index turns existence and branch-shape into O(1) lookups. The placement procedure turns "where does this go" into a deterministic decision.

---

## Index Schema

`.vault-meta/zettel-index.json` is a **cache, not the source of truth** — each note's first frontmatter block (`address`/`parent`/`children`) is authoritative. If the index and reality ever disagree, run `rebuild`.

```json
{
  "schema_version": 2,
  "root": "wiki/zettel",
  "notes": {
    "c-000002": {
      "address": "c-000002",
      "path": "wiki/zettel/Tokenization/Byte-Pair-Encoding.md",
      "slug": "Byte-Pair-Encoding",
      "title": "Byte-Pair Encoding",
      "aliases": ["BPE"],
      "parent": "c-000001",
      "children": ["c-000003"]
    }
  }
}
```

Records are keyed by `address` — the DragonScale creation-order address (`c-NNNNNN`), the **same single identity scheme** as every other addressed page in the vault (no parallel `id:`). It is stable across renames/reparents; `path` is derived and refreshed on every `rebuild`/`upsert`. `parent`/`children` hold addresses. The file is gitignored like other `.vault-meta` runtime caches. The top-level `root` field records which subtree the index covers (see Scoping below).

### Scoping the index to a subtree

By default the index scans all of `wiki/`. To cover only a subtree — e.g. a fresh nested-zettel corpus at `wiki/zettel/` that must **not** pull in pre-existing flat pages elsewhere in `wiki/` — pass a scan root:

```bash
python3 scripts/zettel-index.py --root wiki/zettel rebuild
# or, for consumer skills:  ZETTEL_ROOT=wiki/zettel python3 scripts/zettel-index.py rebuild
```

Resolution precedence: `--root` > `$ZETTEL_ROOT` > the `root` stored in an existing index > default `wiki`. Because the chosen root is persisted in the index, later `upsert`/`remove`/read calls stay scoped to the same subtree with no flag needed. Paths in records remain vault-relative (`wiki/zettel/...`), so wikilinks and Obsidian resolution are unaffected.

---

## Command Reference

All read commands auto-recover: a missing, empty, or corrupt index rebuilds transparently before answering. The script never writes to note files.

| Command | Purpose |
|---|---|
| `python3 scripts/zettel-index.py rebuild` | Scan the scoped subtree and (re)write the index. Run after out-of-band file moves. |
| `python3 scripts/zettel-index.py find "<text>"` | Candidate records matching title / alias / slug (case-insensitive, ranked). The existence check. |
| `python3 scripts/zettel-index.py get <address>` | One record as JSON. |
| `python3 scripts/zettel-index.py children <address>` | Direct children only. |
| `python3 scripts/zettel-index.py subtree <address>` | All descendants — "what does this branch already cover" without opening files. |
| `python3 scripts/zettel-index.py ancestors <address>` | Parent chain, nearest-first, to the root. |
| `python3 scripts/zettel-index.py collisions` | Every slug used by more than one note (the wikilink hazard). |
| `python3 scripts/zettel-index.py upsert <path>` | Add/replace one note's record after writing it. |
| `python3 scripts/zettel-index.py remove <path>` | Drop one note's record. |

---

## The Placement Decision Procedure

This is the canonical copy. `wiki-ingest` and `comprehensive-zettel` link here rather than restating it. Given a new atomic claim **C** to file (during zettelkasten-mode ingestion):

1. **Exists already?** `find "<C's concept>"`. If an exact title/alias match comes back, C already has a note — **update or cross-reference it, do not duplicate.** Stop.
2. **Locate the parent.** From the source context, name the broadest concept C belongs under. `find` that parent.
3. **Decide attach vs promote vs root:**
   - **Parent exists and has children** (its record's `children` is non-empty, i.e. it already owns a folder) → **ATTACH**: allocate C's address (`./scripts/allocate-address.sh`), create C at `wiki/zettel/<parent-path-without-.md>/<C-slug>.md` as a child leaf, and add C's address to the parent's `children`.
   - **Parent exists but is a leaf** (empty `children`, no folder yet) → **PROMOTE**: create the parent's folder, keep the parent note as a *synthesis* node (rewrite per [[comprehensive-zettel]]'s Parent Template), re-file its former detailed content as a child leaf if it held any, then attach C as another child.
   - **No parent exists** → create a new **root** note for the topic under `wiki/zettel/` (which may itself need decomposition per [[comprehensive-zettel]]), then attach C under it.
4. **Collision check before writing.** `collisions` (or `find "<C-slug>"`). If C's slug is already used elsewhere in the tree, warn the caller and either disambiguate the slug or ensure every reference to C uses a path-qualified wikilink (`[[Tokenization/Byte-Pair-Encoding/BPE-Merge-Algorithm]]`).
5. **Write the note(s)** per [[comprehensive-zettel]] (Leaf or Parent template, real LaTeX), allocating an `address:` for each new note and recording it in `.raw/.manifest.json`'s `address_map`.
6. **Update the index.** `upsert <path>` for every note created or changed (the new leaf, and any promoted parent + moved child).

The payoff: the ingesting agent reads only the handful of notes on the candidate parent chain (found via `find`/`ancestors`) and asks `subtree` what a branch covers — never the whole vault.

---

## Collisions and path-qualified wikilinks

Because slugs are only sibling-unique, `collisions` is the guard against silent mis-linking. When it reports a shared slug:

- Prefer **disambiguating the new slug** (e.g., `BPE-Merge-Algorithm` rather than a bare `Merge`).
- Where a duplicate slug is unavoidable, **every** wikilink to either note must be path-qualified so Obsidian resolves it unambiguously.

Run `collisions` after any batch of new notes, and always before choosing a slug in step 4 above.

---

## Mode gate

Placement applies only when the vault is in Zettelkasten mode. Callers check first:

```bash
[ "$(python3 scripts/wiki-mode.py get)" = "zettelkasten" ] && echo "use placement procedure"
```

In generic / LYT / PARA modes, notes are folder-routed by `scripts/wiki-mode.py route` and this skill's placement procedure does not apply (the index/`find`/`collisions` reads are still harmless but the attach/promote logic assumes the nested-tree layout).

---

## Cross-reference

- Note format, decomposition, LaTeX rules: [[comprehensive-zettel]]
- Mode detection: `scripts/wiki-mode.py get`
- Consumed by: `skills/wiki-ingest/SKILL.md` (placement before filing new atomic notes)
- Backing script + tests: `scripts/zettel-index.py`, `tests/test_zettel_index.py` (`make test-zettel-index`)
