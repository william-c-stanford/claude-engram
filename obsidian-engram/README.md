# Engram Flashcards

Spaced-repetition flashcards over a folder-nested Zettelkasten vault. Companion Obsidian plugin to the [claude-engram](https://github.com/william-c-stanford/claude-engram) wiki system: Claude generates flashcards per atomic note (`/zettel-flashcards` skill), this plugin schedules and reviews them.

## What it does

- **Due-count badges in the file explorer.** Every zettel folder and its paired parent note show colored chips: red = due/overdue, yellow = due soon, green = healthy. Folder and parent-note rows carry identical subtree rollups; leaf notes show their own cards.
- **Click a chip to review.** Red opens the subtree's due cards, yellow opens early review, green opens practice-ahead (optional).
- **Mental-palace sessions.** A folder session walks the tree topologically — parent-note cards first, then each child subtree recursively — instead of shuffling the whole folder. All-green parents contribute a small reorientation sample first (skippable in settings).
- **Ease-factor scheduling.** First success ≈ 1 day, second ≈ 4 days, then each success multiplies the interval by an adjustable ease factor (default 2.5): 1 → 4 → 10 → 25 → 60 → 150 days. Again lapses to the start. Every review is kept in an append-only log.
- **Graph groundwork.** Each note's current due count is written to its `cards_due` frontmatter field (subtree rollup on parents), so graph tooling can color nodes by memory state.

Cards live in `<Note>.cards.md` sidecar files bound to notes by DragonScale address — see [docs/flashcard-format.md](../docs/flashcard-format.md) for the format.

## Install via BRAT

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) community plugin.
2. BRAT → *Add beta plugin* → `william-c-stanford/claude-engram`.
3. Enable **Engram Flashcards** in Community plugins.

## Settings

| Setting | Default | Meaning |
|---|---|---|
| Zettel root | `wiki/zettel` | Vault-relative folder holding the nested zettel tree |
| Warn window | 24h | Cards due within this window show yellow |
| Ease factor | 2.5 | Interval multiplier on a successful review |
| Hide card sidecars | on | Hide `*.cards.md` rows in the file explorer |
| Practice ahead | on | Green chips open a practice-ahead session |
| Skip green parents | off | Skip reorientation samples in folder sessions |
| Reorientation sample size | 3 | Cards an all-green parent contributes before its children |

## Development

```bash
npm install
npm test        # vitest
npm run build   # emits main.js
```

Copy `main.js`, `manifest.json`, `styles.css` into `<vault>/.obsidian/plugins/engram-flashcards/` to test locally.
