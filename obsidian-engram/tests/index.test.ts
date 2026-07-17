import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, NEW_STATE, ParsedSidecar } from "../src/cards/types";

function sidecar(address: string, cardCount: number): ParsedSidecar {
  const cards: Card[] = [];
  for (let i = 1; i <= cardCount; i++) {
    cards.push({ id: `${address}-${String(i).padStart(2, "0")}`, type: "free", content: "**Prompt**\nq\n**Answer**\na",
    notes: "", state: NEW_STATE });
  }
  return { noteAddress: address, noteTitle: address, cards, orphanedStateIds: [], retiredLines: [], warnings: [] };
}

function entry(address: string, notePath: string, children: string[] = [], cards = 0): NoteEntry {
  return {
    address,
    notePath,
    title: notePath,
    childrenAddresses: children,
    sidecar: cards > 0 ? sidecar(address, cards) : undefined,
    sidecarPath: cards > 0 ? notePath.replace(/\.md$/, ".cards.md") : undefined,
  };
}

// Tree: LLMs (root) -> [Architecture -> [MoE -> [MoE-Arch, Load-Balancing], Tokenization], Optimization]
const entries: NoteEntry[] = [
  entry("c-000100", "wiki/zettel/LLMs.md", ["c-000101", "c-000105"], 2),
  entry("c-000101", "wiki/zettel/LLMs/Architecture.md", ["c-000102", "c-000104"], 1),
  entry("c-000102", "wiki/zettel/LLMs/Architecture/Mixture-of-Experts.md", ["c-000103"], 2),
  entry("c-000103", "wiki/zettel/LLMs/Architecture/Mixture-of-Experts/MoE-Architecture.md", [], 3),
  entry("c-000104", "wiki/zettel/LLMs/Architecture/Tokenization.md", [], 1),
  entry("c-000105", "wiki/zettel/LLMs/Optimization-Methods.md", [], 2),
];
const folders = new Set([
  "wiki/zettel",
  "wiki/zettel/LLMs",
  "wiki/zettel/LLMs/Architecture",
  "wiki/zettel/LLMs/Architecture/Mixture-of-Experts",
]);

const index = new FlashcardIndex(entries, folders);

describe("FlashcardIndex", () => {
  it("pairs a folder with its same-named sibling note", () => {
    expect(index.noteForFolder("wiki/zettel/LLMs/Architecture")!.address).toBe("c-000101");
    expect(index.noteForFolder("wiki/zettel/Nope")).toBeUndefined();
  });

  it("subtreeOf walks depth-first in children order (mental-palace order)", () => {
    expect(index.subtreeOf("c-000101").map((n) => n.address)).toEqual([
      "c-000101", // Architecture (parent first)
      "c-000102", // MoE
      "c-000103", // MoE-Architecture (descend before siblings)
      "c-000104", // Tokenization
    ]);
  });

  it("root subtree covers the whole tree, parent before children", () => {
    const order = index.subtreeOf("c-000100").map((n) => n.address);
    expect(order[0]).toBe("c-000100");
    expect(order.indexOf("c-000101")).toBeLessThan(order.indexOf("c-000102"));
    expect(order.indexOf("c-000102")).toBeLessThan(order.indexOf("c-000103"));
    expect(order).toHaveLength(6);
  });

  it("falls back to folder membership for children missing from frontmatter", () => {
    const stray = entry("c-000199", "wiki/zettel/LLMs/Architecture/Stray-Note.md");
    const idx2 = new FlashcardIndex([...entries, stray], folders);
    const children = idx2.childrenOf(idx2.byAddress.get("c-000101")!).map((n) => n.address);
    expect(children).toEqual(["c-000102", "c-000104", "c-000199"]);
  });

  it("lineageOf resolves every ancestor title root→source (AE1)", () => {
    const leaf = index.byAddress.get("c-000103")!;
    expect(index.lineageOf(leaf, "wiki/zettel")).toEqual([
      "wiki/zettel/LLMs.md",
      "wiki/zettel/LLMs/Architecture.md",
      "wiki/zettel/LLMs/Architecture/Mixture-of-Experts.md",
      "wiki/zettel/LLMs/Architecture/Mixture-of-Experts/MoE-Architecture.md",
    ]); // fixture titles are the note paths
  });

  it("lineageOf on a root-level note is a single element (AE2)", () => {
    const root = index.byAddress.get("c-000100")!;
    expect(index.lineageOf(root, "wiki/zettel")).toEqual(["wiki/zettel/LLMs.md"]);
  });

  it("lineageOf falls back to the folder name when an ancestor has no paired note", () => {
    const stray = entry("c-000198", "wiki/zettel/LLMs/NoNote/Stray.md");
    const idx = new FlashcardIndex([...entries, stray], folders);
    expect(idx.lineageOf(stray, "wiki/zettel")).toEqual([
      "wiki/zettel/LLMs.md",
      "NoNote",
      "wiki/zettel/LLMs/NoNote/Stray.md",
    ]);
  });

  it("lineageOf respects a custom zettel root (nothing above it appears)", () => {
    const moe = index.byAddress.get("c-000102")!;
    expect(index.lineageOf(moe, "wiki/zettel/LLMs")).toEqual([
      "wiki/zettel/LLMs/Architecture.md",
      "wiki/zettel/LLMs/Architecture/Mixture-of-Experts.md",
    ]);
  });

  it("survives a frontmatter cycle without hanging", () => {
    const a = entry("c-000201", "wiki/zettel/A.md", ["c-000202"]);
    const b = entry("c-000202", "wiki/zettel/A/B.md", ["c-000201"]);
    const idx3 = new FlashcardIndex([a, b], new Set(["wiki/zettel", "wiki/zettel/A"]));
    expect(idx3.subtreeOf("c-000201").map((n) => n.address)).toEqual(["c-000201", "c-000202"]);
  });
});
