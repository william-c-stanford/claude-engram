# Flashcard Sidecar Format (v1)

The single source of truth for the flashcard file format consumed by the `engram-flashcards` Obsidian plugin (parser) and produced by the `/zettel-flashcards` Claude skill (generator). If either side needs a behavior the spec doesn't define, change the spec first.

## Sidecar files

Every atomic zettel note `<Note>.md` may have exactly one sidecar `<Note>.cards.md` in the same folder. The sidecar holds the note's flashcards and their scheduling state.

Frontmatter (required):

```yaml
---
type: flashcards
note_address: "c-000022"   # the DragonScale address of the bound note — the durable binding
note_title: "MoE Architecture"   # informational; the address is authoritative
format: 1                  # spec version
---
```

Binding is by `note_address`, never by path: if the note is renamed or moved (with its sidecar), the plugin rebinds by address and all scheduling history survives. A sidecar whose address resolves to no existing note is **orphaned**: excluded from rollups and sessions, surfaced in a plugin notice, never deleted automatically.

## Card blocks

Each card is a level-3 heading block:

```markdown
### card c-000022-01
type: cloze

<content, format depends on type>
```

- Card ID: `<note_address>-<nn>`, `nn` two digits, allocated sequentially, **never reused** after a card is retired.
- `type:` is the first non-blank line after the heading. One of: `cloze`, `mcq`, `free`, `derivation`, `pseudocode`.
- A card block ends at the next `### card` heading, the state-block section, or end of file.
- Unknown `type:` values: the parser skips the card with a logged warning; remaining cards still parse.

## Card types

### cloze — fill-in-the-blank

The answer spans are wrapped in `{{c::...}}` within the content. Multiple spans are all masked together (one card, one reveal).

```markdown
### card c-000022-01
type: cloze

A MoE layer keeps only the top-$K$ experts per token, so active parameters are a {{c::$K/N$}} fraction of FFN capacity.
```

**Cloze-inside-LaTeX rule.** A `{{c::...}}` span may sit inside `$...$` or `$$...$$`. Rendering: the plugin strips the markers and replaces the span — with `\boxed{\;?\;}` when the span is inside math delimiters, with a styled `____` blank otherwise — then renders through Obsidian's MarkdownRenderer. Reveal renders the original content with the span highlighted. A span must be entirely inside or entirely outside math delimiters; generators must not straddle a `$` boundary. The span content itself must be valid LaTeX when inside math.

### mcq — multiple choice

Prompt prose, then a task list. Checked = correct (exactly one). The plugin shuffles option order at render time.

```markdown
### card c-000022-02
type: mcq

Why do MoE models report both "total" and "active" parameter counts?

- [ ] Total counts include the router; active excludes it
- [x] Only $K$ of $N$ experts run per token, so per-token compute uses a fraction of stored parameters
- [ ] Active parameters are the ones updated during fine-tuning
- [ ] It is a marketing convention with no technical meaning
```

### free / derivation / pseudocode — reveal and self-grade

Two sections marked by bold labels. `derivation` prompts ask to derive or write out an equation (answer in LaTeX); `pseudocode` prompts ask for algorithm sketches (answer in a fenced code block); `free` is open prose. All three render prompt → reveal → self-grade.

```markdown
### card c-000022-03
type: derivation

**Prompt**

Write the MoE layer output as a sum over experts, defining the gating term.

**Answer**

$$\text{MoE}(x) = \sum_{i=1}^{N} g_i(x)\, E_i(x), \qquad g(x) = \text{TopK}(\text{softmax}(W_r x))$$

with $g_i(x)$ non-zero only for the top-$K$ experts.
```

## Scheduling state blocks

Plugin-managed. One Obsidian comment line per card, grouped at the end of the file. Generators create cards **without** state lines (absent state = new card); the plugin adds and updates them. Humans and skills must not edit them.

```markdown
%% srs c-000022-01 {"due":"2026-07-18T09:00:00Z","interval":4,"ease":2.5,"reviews":[{"at":"2026-07-17T09:00:00Z","rating":"good"}]} %%
%% srs c-000022-02 {"state":"new"} %%
```

JSON fields: `due` (ISO 8601 UTC), `interval` (days, fractional allowed), `ease` (effective ease at last review, informational), `easeDelta` (the card's accumulated adjustment from Hard/Easy/Again; authoritative — effective ease is the settings base plus this delta, floored at 1.3, so changing the settings ease applies to all future reviews without rewriting state), `reviews` (append-only log of `{at, rating}`), or `{"state":"new"}` for never-reviewed cards. A state line whose card ID no longer exists in the file is preserved untouched and flagged orphaned by the parser (never crashes, never deleted by the plugin).

## Regeneration rules (for generators)

When regenerating cards for a note that already has a sidecar:

1. Keep the card ID and block for any card whose tested knowledge is unchanged (light rewording is fine — keep the ID).
2. New cards take the next unused `nn`.
3. For a removed card, delete the block but rewrite its state line prefix to `%% srs-retired ... %%` — history is preserved, and the parser ignores retired lines for scheduling.
4. Never modify `%% srs` lines except that one retirement rewrite. Take a `wiki-lock` on the sidecar path for the whole rewrite.

## Card-writing principles (for generators)

- Atomic prompts: one fact/step per card; a note usually yields 2–6 cards, not 10.
- Both directions where meaningful (term → definition and definition → term).
- Equations get both a `derivation` card (produce it) and a `cloze` card (fill a masked term inside it).
- MCQ distractors must be plausible — near-misses from sibling notes are ideal.
- No yes/no questions; no prompts answerable without understanding the note's claim.
