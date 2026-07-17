import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FakeEl } from "./integration/obsidian-stub";
import { ExplorerBadges } from "../src/ui/explorer-badges";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar } from "../src/cards/types";
import { DEFAULT_SETTINGS } from "../src/settings";

/**
 * Headless coverage of the plan's mechanical smoke steps (007 U3): render
 * ORDER (cadence first, then counts), divider GATING, and the showCadence
 * toggle. The purely-visual checks (yellow contrast in light theme, a live
 * click opening the modal) still need a human in Obsidian.
 */

const DAY = 86_400_000;
const newCard = (): CardState => ({ state: "new" });
const greenCard = (): CardState => ({ due: new Date(Date.now() + 365 * DAY).toISOString(), interval: 365, ease: 2.5, reviews: [] });

function sidecar(address: string, states: CardState[]): ParsedSidecar {
  const cards: Card[] = states.map((state, i) => ({
    id: `${address}-${String(i + 1).padStart(2, "0")}`,
    type: "free",
    content: "q",
    notes: "",
    state,
  }));
  return { noteAddress: address, noteTitle: address, cards, orphanedStateIds: [], retiredLines: [], warnings: [] };
}

function entry(address: string, notePath: string, children: string[], states: CardState[] | null): NoteEntry {
  return { address, notePath, title: notePath, childrenAddresses: children, sidecar: states ? sidecar(address, states) : undefined };
}

// Topic parent (1 new + 1 mature card) -> [Leaf, no cards]; plus an empty folder.
const index = new FlashcardIndex(
  [
    entry("c-1", "wiki/zettel/LLMs/Topic.md", ["c-2"], [newCard(), greenCard()]),
    entry("c-2", "wiki/zettel/LLMs/Topic/Leaf.md", [], null),
    entry("c-3", "wiki/zettel/Empty.md", [], null),
  ],
  new Set(["wiki/zettel", "wiki/zettel/LLMs", "wiki/zettel/LLMs/Topic", "wiki/zettel/Empty"])
);

function decorate(path: string, overrides: Partial<typeof DEFAULT_SETTINGS> = {}): FakeEl {
  const selfEl = new FakeEl("div");
  const leaf = { view: { fileItems: { [path]: { selfEl, el: selfEl } } } };
  const plugin = {
    app: { workspace: { getLeavesOfType: () => [leaf] } },
    settings: { ...DEFAULT_SETTINGS, zettelRoot: "wiki/zettel", showCadence: true, ...overrides },
    scanner: { index },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  new ExplorerBadges(plugin).decorate();
  return selfEl.querySelector(".engram-chips")!;
}

/** Kind of each rendered element in order (cadence | sep | red | yellow | green | uncovered). */
function kinds(wrap: FakeEl): string[] {
  return wrap.children.map((c) => {
    for (const k of ["cadence", "sep", "red", "yellow", "green", "uncovered"]) {
      if (c.classes.has(`engram-chip-${k}`)) return k;
    }
    return "?";
  });
}

describe("explorer strip render (007)", () => {
  it("renders cadence first, then a divider, then colored counts, then uncovered (R1, R2, R3, R4)", () => {
    const wrap = decorate("wiki/zettel/LLMs/Topic");
    expect(kinds(wrap)).toEqual(["cadence", "sep", "red", "green", "uncovered"]);
  });

  it("the divider is a middot and is inert", () => {
    const wrap = decorate("wiki/zettel/LLMs/Topic");
    const sep = wrap.children.find((c) => c.classes.has("engram-chip-sep"))!;
    expect(sep.textContent).toBe("·");
    expect(sep.classes.has("engram-chip-inert")).toBe(true);
  });

  it("count numbers carry no tile classes — just the color class + the plain-text base (R2)", () => {
    const wrap = decorate("wiki/zettel/LLMs/Topic");
    const red = wrap.children.find((c) => c.classes.has("engram-chip-red"))!;
    expect(red.textContent).toBe("1");
    expect([...red.classes]).toEqual(expect.arrayContaining(["engram-chip", "engram-chip-red"]));
  });

  it("the colored count is clickable (not inert); cadence, divider, and uncovered are inert (R5)", () => {
    const wrap = decorate("wiki/zettel/LLMs/Topic");
    const inertOf = (k: string) => wrap.children.find((c) => c.classes.has(`engram-chip-${k}`))!.classes.has("engram-chip-inert");
    expect(inertOf("red")).toBe(false);
    expect(inertOf("cadence")).toBe(true);
    expect(inertOf("sep")).toBe(true);
    expect(inertOf("uncovered")).toBe(true);
  });

  it("showCadence off drops the cadence AND the divider, keeping the colored counts (R7)", () => {
    const wrap = decorate("wiki/zettel/LLMs/Topic", { showCadence: false });
    expect(kinds(wrap)).toEqual(["red", "green", "uncovered"]);
  });

  it("a card-less-but-uncovered scope shows a lone gray numeral — no cadence, no divider (R4 gating)", () => {
    const wrap = decorate("wiki/zettel/Empty");
    expect(kinds(wrap)).toEqual(["uncovered"]);
    const unc = wrap.children[0]!;
    expect(unc.textContent).toBe("1");
  });

  it("clicking the red count opens a review session for that bucket (R5, smoke step 2)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = vi.spyOn(ExplorerBadges.prototype as any, "openSession").mockImplementation(() => {});
    const wrap = decorate("wiki/zettel/LLMs/Topic");
    const red = wrap.children.find((c) => c.classes.has("engram-chip-red"))!;
    red.click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![1]).toBe("red"); // (scope, bucket) — bucket is "red"
    expect(spy.mock.calls[0]![0]).toBeTruthy(); // a real scope was passed
    spy.mockRestore();
  });
});

/**
 * Smoke step 3 — yellow legibility in light theme — as an objective WCAG
 * contrast check on the ACTUAL colors shipped in styles.css, instead of an
 * eyeball. Only the yellow overrides are asserted: red/green are Obsidian's own
 * theme accents (var(--color-red/green)), unchanged and out of this plan's scope.
 */
describe("yellow numeral contrast meets WCAG AA (007 R6, KTD3)", () => {
  const css = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "styles.css"),
    "utf8"
  );
  const lightYellow = /\.theme-light\s+\.engram-chip-yellow\s*\{\s*color:\s*(#[0-9a-fA-F]{6})/.exec(css)?.[1];
  const darkYellow = /\.engram-chip-yellow\s*\{\s*[^}]*var\(--color-yellow,\s*(#[0-9a-fA-F]{6})/.exec(css)?.[1];

  const chan = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (hex: string): number => {
    const n = parseInt(hex.slice(1), 16);
    return 0.2126 * chan((n >> 16) & 255) + 0.7152 * chan((n >> 8) & 255) + 0.0722 * chan(n & 255);
  };
  const contrast = (a: string, b: string): number => {
    const la = luminance(a);
    const lb = luminance(b);
    const hi = Math.max(la, lb);
    const lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  };
  const AA = 4.5;

  it("resolves both theme colors from styles.css", () => {
    expect(lightYellow).toBeDefined();
    expect(darkYellow).toBeDefined();
  });

  it("light-theme yellow clears AA on the light sidebar (white and --background-secondary)", () => {
    expect(contrast(lightYellow!, "#ffffff")).toBeGreaterThanOrEqual(AA);
    expect(contrast(lightYellow!, "#f2f3f5")).toBeGreaterThanOrEqual(AA);
  });

  it("dark-theme yellow clears AA on the dark sidebar", () => {
    expect(contrast(darkYellow!, "#1e1e1e")).toBeGreaterThanOrEqual(AA);
    expect(contrast(darkYellow!, "#262626")).toBeGreaterThanOrEqual(AA);
  });
});
