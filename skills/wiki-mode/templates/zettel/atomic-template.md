---
type: zettel
address: "{{address}}"
title: "{{title}}"
created: "{{date}}"
parent: ""
children: []
tags: []
---

# {{title}}

## Claim

(One atomic claim, 1-3 sentences. If it needs more, it isn't atomic yet — split it
into children. See the comprehensive-zettel skill's decomposition algorithm.)

## Reasoning

(Why is this claim true? What does it rest on? Include the formula in real LaTeX —
`$...$` inline, `$$...$$` block — if the claim is quantitative.)

## Sources

- (external citations)
- Parent zettel: [[{{parent-slug}}]]

## Cross-references

- [[{{related-slug}}]] — (relationship)

<!--
Identity is the DragonScale `address` (c-NNNNNN), allocated with
./scripts/allocate-address.sh — the single vault-wide scheme (no separate id:).
`parent`/`children` hold addresses. Notes nest by folder under wiki/zettel/:
a parent note lives beside a same-named folder holding its children. A parent
note uses a `## Synthesis` + `## Children` shape instead of Claim/Reasoning.
See skills/comprehensive-zettel and skills/local-wiki-index.
-->
