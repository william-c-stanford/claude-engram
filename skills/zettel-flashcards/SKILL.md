---
name: zettel-flashcards
description: "Generate spaced-repetition flashcards for atomic Zettelkasten notes under wiki/zettel/. Given a parent note or subfolder, writes one <Note>.cards.md sidecar per note in the subtree, following docs/flashcard-format.md. Cards mix cloze (fill-in-the-blank, incl. inside LaTeX equations), multiple choice, free-response, equation derivation, and pseudocode. The engram-flashcards Obsidian plugin schedules and reviews them. Triggers on: generate flashcards, make cards for, flashcard this subtree, zettel flashcards, card up [folder]."
allowed-tools: Read Write Edit Bash
---

# zettel-flashcards: Card Generation for the Zettel Tree

Turn a subtree of atomic notes into review-ready flashcards. The plugin (`obsidian-engram/`) owns scheduling, badges, and review; this skill owns card *content*. The contract between them is **`docs/flashcard-format.md` — read it before generating anything.**

## Procedure

1. **Resolve the subtree.** Given a parent note, folder, or topic name:
   - Find the root note's address: `python3 scripts/zettel-index.py find "<name>"`.
   - List every note in scope: `python3 scripts/zettel-index.py subtree <address>` (the root itself included — parents get cards too, they anchor the mental-palace walk).
2. **Read each note fully.** The Claim and Reasoning sections are the card source; Cross-references supply MCQ distractor material (near-miss concepts from sibling notes).
3. **Check for an existing sidecar** (`<Note>.cards.md`). If present, this is a regeneration: follow the format doc's regeneration rules — stable IDs for unchanged cards, next unused `nn` for new ones, `%% srs-retired` for removed ones, and never touch `%% srs` state lines otherwise. **Preserve `**Notes**` sections verbatim on every card you keep** — they are the reviewer's own annotations (hidden until reveal in the plugin) and outrank generated content.
4. **Write the sidecar** beside each note, guarded by the vault lock:
   ```bash
   bash scripts/wiki-lock.sh acquire "<sidecar-path>"   # write, then:
   bash scripts/wiki-lock.sh release "<sidecar-path>"
   ```
   Frontmatter `note_address` comes from the note's `address:` field — never invent one.
5. **Report** a per-note summary: note title, cards written, types used.

## Choosing card types

Read the note's content shape and pick accordingly — every note gets 2–6 cards:

| Note contains | Generate |
|---|---|
| A displayed equation | One `derivation` card (produce the equation from a described setup) AND one `cloze` card masking a meaningful term *inside* the equation (`{{c::...}}` inside `$...$` — see the format doc's cloze-inside-LaTeX rule) |
| An algorithm or procedure | One `pseudocode` card (sketch it) |
| A conceptual claim | One `free` card asking *why* (mechanism, not definition) and/or one `mcq` with plausible distractors |
| Comparative/reference tables | `mcq` cards on the discriminating facts (which model, which number), `cloze` on key values |
| A named failure mode or trade-off | One `free` card on the failure mode and what prevents it |

## Card-writing principles (spaced-repetition science)

- **Atomic prompts.** One retrievable fact or step per card. If the answer has two independent parts, write two cards.
- **No orphan context.** Each prompt must be answerable without seeing the note — name the concept in the prompt ("In MoE routing, ..."), never "as discussed above".
- **Both directions.** For key terms: term → mechanism and mechanism → term.
- **Desirable difficulty.** Prompts should require recall, not recognition — except MCQ, whose job is discrimination between near-misses; pull distractors from sibling notes so they're plausible.
- **No yes/no questions.** Nothing answerable by pattern-matching the prompt's shape.
- **Equations are recalled, not admired.** Masking `$\alpha$` teaches nothing; mask the term that carries the idea (the product $f_i \cdot p_i$, not the summation sign).
- **LaTeX rendering rules (hard-won):** cloze spans go *inside* math delimiters (`${{c::K/N}}$`, never `{{c::$K/N$}}`), and `$$...$$` display math sits on its own lines — never embedded mid-sentence. Both patterns render broken in Obsidian.

## Validation

After generating, confirm the plugin parses every sidecar cleanly:

```bash
cd obsidian-engram && npx vitest run tests/parser.test.ts
```

and spot-check one generated file against the format doc (card IDs `<address>-<nn>`, `type:` lines valid, `**Prompt**`/`**Answer**` markers present on free/derivation/pseudocode cards). Badges appear in Obsidian on the next scan; `cards_due` frontmatter updates on vault open or via the "Refresh flashcard counts" command.

---

## How to think (appendix)

- **OBSERVE ×2:** Read the note twice — once for what it says, once for what a learner must be able to reconstruct months later.
- **LISTEN:** The note's own emphasis (what its Claim bolds, what its Reasoning derives) tells you what deserves cards.
- **THINK:** For each candidate card, ask: if the learner answers this correctly, what do they provably understand?
- **CONNECT ×2:** Distractors and cross-direction cards come from sibling notes; the tree's topology is your distractor bank.
- **FEEL:** A card that would bore or annoy you as a reviewer (trivial cloze, gotcha MCQ) is a bad card.
- **ACCEPT:** Not every sentence needs a card; parents especially need only a few synthesis-level cards.
- **CREATE:** Write the sidecar.
- **GROW:** On regeneration, keep what worked (stable IDs preserve the learner's history — that history is the whole point).
