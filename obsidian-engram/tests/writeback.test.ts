import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar } from "../src/cards/types";
import { computeCardsDue, reconcileCardsDue, FrontmatterPort } from "../src/frontmatter/compute";

const NOW = Date.parse("2026-07-17T09:00:00.000Z");
const red: CardState = { due: "2026-07-16T00:00:00.000Z", interval: 1, ease: 2.5, reviews: [] };
const green: CardState = { due: "2026-08-20T00:00:00.000Z", interval: 25, ease: 2.5, reviews: [] };

function sidecarWith(address: string, states: CardState[]): ParsedSidecar {
  const cards: Card[] = states.map((state, i) => ({
    id: `${address}-${String(i + 1).padStart(2, "0")}`,
    type: "free",
    content: "**Prompt**\nq\n**Answer**\na",
    notes: "",
    state,
  }));
  return { noteAddress: address, noteTitle: address, cards, orphanedStateIds: [], retiredLines: [], warnings: [] };
}

function entry(address: string, notePath: string, children: string[], states: CardState[]): NoteEntry {
  return { address, notePath, title: notePath, childrenAddresses: children, sidecar: states.length ? sidecarWith(address, states) : undefined };
}

const index = new FlashcardIndex(
  [
    entry("c-000001", "wiki/zettel/Root.md", ["c-000002"], [green]),
    entry("c-000002", "wiki/zettel/Root/A.md", ["c-000003"], [red]),
    entry("c-000003", "wiki/zettel/Root/A/A1.md", [], [red, red]),
  ],
  new Set(["wiki/zettel", "wiki/zettel/Root", "wiki/zettel/Root/A"])
);

describe("computeCardsDue (R13)", () => {
  it("parents carry subtree red rollups, leaves their own red count", () => {
    const values = computeCardsDue(index, NOW, 24);
    expect(values.get("wiki/zettel/Root.md")).toBe(3); // 0 own + 1 + 2
    expect(values.get("wiki/zettel/Root/A.md")).toBe(3); // 1 own + 2 below
    expect(values.get("wiki/zettel/Root/A/A1.md")).toBe(2); // leaf: own cards only
  });

  it("covers every indexed note so cleared subtrees drop to zero", () => {
    const values = computeCardsDue(index, Date.parse("2026-09-01T00:00:00.000Z"), 24);
    // far future: everything overdue -> all red
    expect(values.get("wiki/zettel/Root.md")).toBe(4);
    expect([...values.keys()]).toHaveLength(3);
  });
});

describe("reconcileCardsDue (KTD5 diff guard)", () => {
  function port(fms: Record<string, Record<string, unknown> | null>) {
    const writes: [string, number][] = [];
    const p: FrontmatterPort = {
      getFrontmatter: (path) => fms[path] ?? null,
      writeCardsDue: async (path, value) => {
        if (path.includes("locked")) throw new Error("locked");
        writes.push([path, value]);
      },
    };
    return { p, writes };
  }

  it("writes only changed values — unchanged notes get no write call", async () => {
    const { p, writes } = port({
      "a.md": { type: "zettel", cards_due: 3 },
      "b.md": { type: "zettel", cards_due: 0 },
    });
    const result = await reconcileCardsDue(new Map([["a.md", 3], ["b.md", 2]]), p);
    expect(writes).toEqual([["b.md", 2]]);
    expect(result.written).toEqual(["b.md"]);
  });

  it("skips non-zettel notes and missing frontmatter; adds the field when absent", async () => {
    const { p, writes } = port({
      "plain.md": { type: "note", cards_due: 0 },
      "gone.md": null,
      "new.md": { type: "zettel" }, // no cards_due field yet
    });
    await reconcileCardsDue(new Map([["plain.md", 5], ["gone.md", 5], ["new.md", 5]]), p);
    expect(writes).toEqual([["new.md", 5]]);
  });

  it("a failing write is reported and does not stop the rest", async () => {
    const { p, writes } = port({
      "locked.md": { type: "zettel", cards_due: 0 },
      "ok.md": { type: "zettel", cards_due: 0 },
    });
    const result = await reconcileCardsDue(new Map([["locked.md", 1], ["ok.md", 2]]), p);
    expect(result.failed).toEqual(["locked.md"]);
    expect(result.written).toEqual(["ok.md"]);
    expect(writes).toEqual([["ok.md", 2]]);
  });
});
