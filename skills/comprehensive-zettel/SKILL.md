---
name: comprehensive-zettel
description: "Write Zettelkasten notes that are simultaneously atomic (one claim per note) and comprehensive (the full topic is covered somewhere in the tree). Notes nest by folder under wiki/zettel/: a parent note's children live in a same-named folder beside it, recursively. Filenames are plain slugs (no date/ID prefix); the DragonScale address/parent/children frontmatter triad carries the hierarchy so paths can be reorganized without breaking references. All math is real LaTeX. Triggers on: comprehensive zettel, atomic note, decompose into zettels, zettelkasten note, split into atomic notes, nested zettel folders."
allowed-tools: Read Write Edit Bash
---

# comprehensive-zettel: Atomic + Comprehensive Zettelkasten Notes

Luhmann's rule ("one claim per note") and the requirement that a topic be *fully* covered pull in opposite directions. This skill resolves the tension with a **decomposition tree**: atomicity is enforced only at the leaves; a parent note is a synthesis + index over its children, never a restatement of their content. Comprehensiveness is a property of the whole tree, not of any single note.

---

## Naming and Folder Structure

The corpus is rooted at `wiki/zettel/` (the vault's Zettelkasten mode root — see `scripts/wiki-mode.py`). Filenames are the plain slug — **no date or ID prefix**.

- A root-level note with no children: `wiki/zettel/<slug>.md`
- A note WITH children becomes both things at once:
  - the note itself: `wiki/zettel/<slug>.md`
  - a same-named folder holding its children: `wiki/zettel/<slug>/<child-slug>.md`
- Recursion is just repeating the pattern: if a child itself has children, it in turn becomes `wiki/zettel/<parent-slug>/<child-slug>.md` *and* `wiki/zettel/<parent-slug>/<child-slug>/<grandchild-slug>.md`.

```
wiki/zettel/
  Tokenization.md                                  <- parent/synthesis note
  Tokenization/
    Why-Subwords.md                                <- leaf (atomic)
    Byte-Pair-Encoding.md                           <- has its own children
    Byte-Pair-Encoding/
      BPE-Merge-Algorithm.md                        <- leaf (atomic)
      BPE-Vocabulary-Size-Tradeoff.md                <- leaf (atomic)
    Special-Tokens.md                               <- leaf (atomic)
```

The folder path *is* the parent chain — you can see the tree by looking at the filesystem. The `address` (below) is what stays stable if a note is ever renamed or moved to a different parent.

## Frontmatter

```yaml
---
type: zettel
address: "{{address}}"       # allocate with: ./scripts/allocate-address.sh  (c-NNNNNN)
title: "{{title}}"
created: "{{date}}"
parent: "{{parent-address}}" # "" for a root note
children: []                 # populated as children are written; stays [] for a leaf
tags: []
---
```

`address:` is the **single identity scheme** — the same DragonScale creation-order address (`c-NNNNNN`) used by every other addressed page in the vault, so zettels participate in `wiki-lint` address validation with no parallel `id:` scheme. Allocate it with `./scripts/allocate-address.sh` (atomic, flock-guarded), and record the path→address mapping in `.raw/.manifest.json`'s `address_map` exactly as `wiki-ingest` does for any new page. `parent:` and `children:` hold **addresses**, not filenames — because the folder path already encodes the hierarchy, these address references survive a rename or re-parent without going stale.

> [!important] Prerequisite: DragonScale addresses (and `flock`)
> This skill **requires** DragonScale address allocation — the `address` is the note's identity, not an optional field. `scripts/allocate-address.sh` uses **`flock`**, which is preinstalled on Linux but **not on macOS** (`brew install flock`). If `flock` is missing, address allocation fails and notes cannot be minted. This is the one hard prerequisite for Zettelkasten mode; Generic / LYT / PARA modes have no such dependency.

> **See also: [[local-wiki-index]]** — the companion skill that indexes this frontmatter into a fast lookup cache and owns the attach/promote placement procedure (where a new atomic note goes). Consult it when you need to find an existing note, check what a branch already covers, or detect a slug collision without reading the whole vault.

## Math: Real LaTeX Only

Never substitute unicode glyphs (√ ∈ ℝ Σ θ η α β →) for math. Every equation is either:

- Inline: `$...$` — e.g. `$P(x_t \mid x_{<t})$`
- Block: `$$...$$` — for displayed/multi-line equations

Use proper LaTeX commands: `\mathbb{R}`, `\sqrt{}`, `\sum`, `\theta`, `\eta`, `\rightarrow`, `\in`, `\cdot`, `\text{...}` for word operators, `\begin{cases}...\end{cases}` for piecewise definitions. This matches Obsidian's MathJax/KaTeX renderer — see `skills/obsidian-markdown/SKILL.md` §Math for the canonical reference.

---

## The Decomposition Algorithm

1. **Draft comprehensively first.** Write (or start from) a complete treatment of the topic — nothing is lost or summarized away yet. This draft is scratch material, not a note.
2. **Atomicity test.** For each candidate section of the draft, ask: can its core claim be stated in 1-3 sentences? Is it really *one* idea, or several stapled together?
   - Pass → it's a leaf. File it using the **Leaf Template** below.
   - Fail → it's a parent. Split it into child candidates and recurse step 2 on each child.
3. **No orphaned detail.** Every fact, formula, trade-off, and example from the draft must land in exactly one leaf. If something doesn't fit any child, that's a sign a child is missing — add one, don't force it into the parent.
4. **Parent notes synthesize, they don't restate.** Once a note has children, rewrite it using the **Parent Template**: a short unifying claim (why these children belong together) plus a one-line pointer to each child. Delete the detailed content that has now moved to children — duplication between a parent and its children is a decomposition bug, not thoroughness.
5. **Recurse until stable.** Re-run the atomicity test on every leaf. A note that still bundles multiple claims gets split again (and becomes a folder). Stop when every leaf passes the 1-3-sentence test.
6. **Coverage audit.** Walk the finished tree and confirm every claim from the original comprehensive draft appears in exactly one node (parent synthesis or some leaf). This is the check that atomicity didn't cost completeness.
7. **Collision check before naming.** Before committing to a slug for any new note, run `python3 scripts/zettel-index.py collisions` (or `find "<slug>"`). If the slug is already used elsewhere in the tree, disambiguate it or ensure references use a path-qualified wikilink — bare `[[slug]]` links are only sibling-unique. See [[local-wiki-index]].
8. **Update the index after every write.** After creating a leaf, splitting a note, or promoting a leaf to a parent, run `python3 scripts/zettel-index.py upsert <path>` for each note created or changed (the new leaf, and on a promotion both the rewritten parent-synthesis node and the moved child). The index is a cache; keeping it current is what lets `wiki-ingest` place the *next* note without re-reading the vault.

---

## Templates

### Leaf Template (atomic — no children)

```markdown
---
type: zettel
address: "{{address}}"
title: "{{title}}"
created: "{{date}}"
parent: "{{parent-address}}"
children: []
tags: []
---

# {{title}}

## Claim

(One atomic claim, 1-3 sentences. If it needs more, it isn't atomic yet — split it.)

## Reasoning

(Why is this claim true? What does it rest on? Include the formula, in real LaTeX, if the claim is quantitative.)

## Sources

- (external citations)
- Parent zettel: [[{{parent-slug}}]]

## Cross-references

- [[{{related-slug}}]] — (nature of the relationship)
```

### Parent Template (has children — lives at `wiki/zettel/<slug>.md` beside `wiki/zettel/<slug>/`)

```markdown
---
type: zettel
address: "{{address}}"
title: "{{title}}"
created: "{{date}}"
parent: "{{parent-address}}"
children:
  - "{{child-address-1}}"
  - "{{child-address-2}}"
tags: []
---

# {{title}}

## Synthesis

(The one unifying claim that ties the children together — why they form a single topic, not a restatement of each child's content.)

## Children

- [[{{child-slug-1}}]] — (one-line claim summary)
- [[{{child-slug-2}}]] — (one-line claim summary)

## Sources

- (external citations for the topic as a whole)
- Parent zettel: [[{{parent-slug}}]] (omit if this is a root note)

## Cross-references

- [[{{related-slug}}]] — (nature of the relationship)
```

---

## Worked Example

`wiki/zettel/Tokenization.md` (parent) synthesizes: "Tokenization converts text to discrete units the transformer can process; the choice of granularity and algorithm trades off vocabulary size, sequence length, and multilingual coverage." It points to:

- `wiki/zettel/Tokenization/Why-Subwords.md` — atomic claim: subword tokenization is the trade-off sweet spot between character- and word-level granularity.
- `wiki/zettel/Tokenization/Byte-Pair-Encoding.md` — not atomic on its own (algorithm + variants + practice), so it becomes its own parent with children:
  - `wiki/zettel/Tokenization/Byte-Pair-Encoding/BPE-Merge-Algorithm.md` — atomic claim: BPE iteratively merges the most frequent adjacent symbol pair.
  - `wiki/zettel/Tokenization/Byte-Pair-Encoding/BPE-Vocabulary-Size-Tradeoff.md` — atomic claim: larger vocabularies (128K vs 32K) improve multilingual/code coverage at the cost of a larger embedding table.
- `wiki/zettel/Tokenization/Special-Tokens.md` — atomic claim: special tokens are structural, not semantic, and must never receive an SFT loss signal.

Nothing from the original comprehensive draft on tokenization is missing — it's just distributed one claim per leaf, with `Tokenization.md` and `Byte-Pair-Encoding.md` acting purely as synthesis/index nodes.

---

## What NOT to Do

- Do not put a date or ID in the filename — the slug is the whole filename.
- Do not let a parent note duplicate content that also lives in a child — that's the decomposition failing, not extra diligence.
- Do not stop decomposing just because a note "feels" short enough — apply the 1-3-sentence claim test explicitly.
- Do not use unicode math symbols as a substitute for `$...$`/`$$...$$` LaTeX, even in a quick draft.
- Do not skip the coverage audit — atomicity without it silently drops information.
