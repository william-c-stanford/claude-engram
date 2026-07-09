# Distribution & Integration Gaps — local-wiki-index / comprehensive-zettel

Findings from a focused integration review of the `feat/local-wiki-index` work,
scoped to the question: **does this integrate with the repo's key features,
preserve existing functionality, and is it shareable as a fork?**

- **Reviewed:** `scripts/zettel-index.py`, `tests/test_zettel_index.py`,
  `.claude/skills/comprehensive-zettel/SKILL.md`,
  `.claude/skills/local-wiki-index/SKILL.md`, `skills/wiki-ingest/SKILL.md`,
  `Makefile`, `.gitignore`, and the pilot `wiki/zettel/` tree.
- **Date:** 2026-07-08
- **Verdict:** Ready with decisions — **not yet shareable as-is.** The code is
  sound (33 passing assertions, atomic writes, rebuild recovery, conventions
  mirroring `wiki-mode.py` / `allocate-address.sh`). The risks are all about how
  it fits the rest of the plugin.

> All findings below are **design decisions**, not mechanical fixes. Nothing was
> auto-applied, so as not to pre-empt those calls.

---

## Triage groups

| Group | Findings | Type | Preferred resolution |
|---|---|---|---|
| Distribution: new capability won't reach installers | #1, #4 | decision-gate | Decide whether the two new skills are plugin-shipped (move to `skills/`, document) or deliberately fork-local (say so). Resolves both. |
| Feature conflict: zettel notes vs DragonScale + modes | #2, #3 | decision-gate | One decision about how `id:`-based zettels coexist with `address:`-based DragonScale, then apply to lint + mode router. |
| Two competing zettelkasten corpora | #5 | decision-gate | Decide the fate of the 19 flat notes now that the nested tree exists. |

---

## P1 — High

### #1 · Distribution: the two new skills live in `.claude/skills/`, so plugin installers never get them
**Where:** `.claude/skills/comprehensive-zettel/`, `.claude/skills/local-wiki-index/`

The repo's 15 canonical skills all live in `skills/`; that is what the plugin
packages and what Claude Code loads for anyone who installs `claude-obsidian`
from the marketplace. `.claude/skills/` is *project-local* discovery — it only
activates for someone working inside a clone of this repo.

Consequence: if the fork is shared by having others **install the plugin**, they
get `scripts/zettel-index.py` (it ships, being under `scripts/`) but **not** the
two skills that document and drive it. The capability is invisible to installers;
only repo-cloners see it. Note this is a genuine trade-off, not an oversight —
`.claude/skills/` was chosen deliberately for live-editability. If both editability
and distribution are wanted, the skills belong in `skills/` and are edited there.

**Resolution options:**
- (a) Move both skills to `skills/` so they ship with the plugin (then #4 applies).
- (b) Keep them fork-local and document them explicitly as such (then #4 applies differently).

<RESOLUTION-INSTRUCTIONS>
We will assume that we are going to distribute it over the claude marketplace, so we should actually just convert the existing zettel skill to our comprehensive zettel skill, and update the mode documents accordinly - explaining that it provides a nested structure, etc

### #2 · Preservation: `/wiki-lint` will flag all 13 new zettel notes as missing a DragonScale address
**Where:** `wiki/zettel/**` vs `skills/wiki-lint/SKILL.md` (Address Validation, ~line 198)

DragonScale is active in this vault (`scripts/allocate-address.sh` +
`.vault-meta/address-counter.txt` both present → `DRAGONSCALE_ADDRESSES=1`).
wiki-lint's Address Validation requires every non-meta page with
`created: >= 2026-04-23` to carry `address: c-NNNNNN`. The new zettel notes are
`type: zettel`, `created: "2026-07-08"`, no `address:` → each is flagged
"post-rollout page missing address."

Root cause: comprehensive-zettel deliberately uses `id:` (timestamp) as its stable
primitive — a *parallel identity scheme* to DragonScale's `address:`. They don't
currently know about each other, so existing lint functionality is not preserved
for the new corpus.

**Resolution options:**
- (a) Exclude `wiki/zettel/` (or `type: zettel`) from address validation in wiki-lint.
- (b) Also stamp zettels with `address:`.
- (c) Document `id:`-vs-`address:` as intentional and teach lint to accept `id:` as the zettel identity.

<RESOLUTION-INSTRUCTIONS>
Convert our id system that we created for new zettel notes to match the old existing structure that way it works with the dragonscale_addresses - we only want a single identity scheme, not parallel, you will also need to update all notes that we've generated so far to match this 

---

## P2 — Moderate

### #3 · Integration: nested-zettel filing diverges from `wiki-mode.py` routing; only `wiki-ingest` was reconciled
**Where:** `scripts/wiki-mode.py` route (zettelkasten) vs `.claude/skills/comprehensive-zettel`

`wiki-mode.py route ... zettelkasten` still returns flat
`wiki/<timestamp>-<slug>.md`. `wiki-ingest` was reconciled to defer to the
placement procedure instead, but `save` and `autoresearch` also file via
`wiki-mode.py route` and would still create *flat* notes in zettelkasten mode,
inconsistent with the nested tree. So "zettelkasten mode" now means two different
things depending on which skill files the note.

**Resolution options:**
- (a) Update `wiki-mode.py`'s zettelkasten branch to the nested convention.
- (b) Document that only `wiki-ingest` produces nested zettels (save/autoresearch do not yet).
- 
<RESOLUTION-INSTRUCTIONS>
Update `wiki-mode.py`'s zettelkasten branch to the nested convention with the updated zettel skill that contains our new comprehensive zettel and nestedness instructions 

### #5 · Integration: two competing "zettelkasten" corpora now coexist
**Where:** `wiki/*.md` (19 flat notes) + `wiki/zettel/**` (13 nested notes)

The 19 flat notes from earlier this session (`wiki/<ts>-<slug>.md`, `type: zettel`,
with `id:`) and the new nested tree are both zettelkasten content. The scoped
index separates them cleanly, but Obsidian's graph/search and `/wiki-lint` see
both, and there is a latent wikilink ambiguity (`[[Tokenization]]` could resolve
to the new `Tokenization.md` or the old flat note aliased "Tokenization").

**Resolution:** decide the flat notes' fate — archive, delete, or migrate into the
tree — before sharing, or the fork ships with a confusing double representation.

<RESOLUTION-INSTRUCTIONS>
I think I've deleted the flat notes, if not, delete them. We want to do the nested structure. 

---

## P3 — Low

### #4 · Docs: README ("15 skills") and CLAUDE.md skill table don't mention the new skills
**Where:** `README.md` (~line 20), `CLAUDE.md`

Downstream of #1; act only after deciding where the skills live. If they move to
`skills/`, bump the count and add them to both tables. If they stay fork-local, add
a short "fork-local experimental skills" note so a sharer isn't surprised they are
missing after a plugin install.

<RESOLUTION-INSTRUCTIONS>
We are moving them to skills, but we are updating the zettel skill. 
The README should have a section at the bottom to reflect our changes from the original fork

### #6 · Robustness: `zettel-index.py upsert/remove` assume CWD is the vault root
**Where:** `scripts/zettel-index.py` — `_record_from_file`, `remove`

Paths are resolved via `Path(path).resolve().relative_to(VAULT_ROOT)`, which only
works when the caller passes a vault-relative path from the repo root (as the skill
docs show). Called from another CWD, `resolve()` computes the wrong absolute path
and `relative_to` could raise. Fine for the documented invocation; worth a one-line
guard or doc note if other callers appear.

<RESOLUTION-INSTRUCTIONS>
Add the guard, and also make sure that if called from another CWD, we provide error context that an agent would be able to understand to and adapt its calling strategy accordingly easily 
---

## Verified sound (no action)

- `zettel-index.py`: atomic temp+rename writes, rebuild-on-missing/corrupt
  recovery, cycle-safe tree walks, first-frontmatter-only parsing (ignores `id:`
  in code blocks), scoping precedence — all covered by 33 passing assertions.
- `wiki-lock` acquired/released around the 13 writes; DragonScale counter
  untouched by the pilot (zettels use `id:`, not `address:`).
- Scoped index correctly excludes the 19 flat notes and everything outside
  `wiki/zettel/` — the isolation requirement holds.

## Environment note (not a finding in this work)

`make test` halts at the pre-existing macOS `test-address` failure (BSD `wc -l`
whitespace padding in `tests/test_allocate_address.sh`) before reaching
`test-zettel-index`, so others running `make test` on macOS won't reach the new
test until that pre-existing failure is fixed.

---

## Recommended fix order

1. **#1** — decide skill location (move to `skills/` for distribution, or mark fork-local).
2. **#2** — reconcile `id:` zettels with DragonScale address validation in wiki-lint.
3. **#5** — decide the 19 flat notes' fate.
4. **#3** — reconcile or document the mode-router divergence.
5. **#4** — update README / CLAUDE.md (falls out of #1).

The single most impactful step is **#1**: move both skills into `skills/`, wire
them into the README/CLAUDE.md skill tables, and reconcile `wiki-lint` (#2) so a
plugin installer gets a coherent, self-consistent feature.
