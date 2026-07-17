import { ParsedSidecar } from "../cards/types";

/** One zettel note as fed to the index by the scanner. */
export interface NoteEntry {
  address: string;
  notePath: string; // vault-relative path to <Note>.md
  title: string;
  /** Child addresses in the parent's frontmatter order (may be empty). */
  childrenAddresses: string[];
  sidecar?: ParsedSidecar;
  sidecarPath?: string;
}

export interface OrphanSidecar {
  sidecarPath: string;
  noteAddress: string;
}

/** Strip ".md" and return the same-named folder path a parent note pairs with. */
export function pairedFolderPath(notePath: string): string {
  return notePath.replace(/\.md$/, "");
}

export function isSidecarPath(path: string): boolean {
  return path.endsWith(".cards.md");
}

/** Sidecar path for a note path: <Note>.md -> <Note>.cards.md */
export function sidecarPathFor(notePath: string): string {
  return notePath.replace(/\.md$/, ".cards.md");
}

/**
 * Pure in-memory index of the zettel tree + flashcards. The persisted
 * .vault-meta/flashcard-index.json is a cache of this structure; the sidecar
 * and note files stay authoritative and the index is rebuilt from them.
 */
export class FlashcardIndex {
  readonly byAddress = new Map<string, NoteEntry>();
  readonly byNotePath = new Map<string, NoteEntry>();
  readonly orphanSidecars: OrphanSidecar[] = [];
  /** Folder paths that exist under the zettel root (for pairing and fallback ordering). */
  readonly folderPaths: Set<string>;

  constructor(entries: NoteEntry[], folderPaths: Set<string>, orphans: OrphanSidecar[] = []) {
    this.folderPaths = folderPaths;
    for (const e of entries) {
      this.byAddress.set(e.address, e);
      this.byNotePath.set(e.notePath, e);
    }
    this.orphanSidecars.push(...orphans);
  }

  /** The note paired with a folder row: folder X/ pairs with sibling X.md. */
  noteForFolder(folderPath: string): NoteEntry | undefined {
    return this.byNotePath.get(`${folderPath}.md`);
  }

  /** Whether a note has a same-named folder (i.e., is a parent note). */
  hasFolder(entry: NoteEntry): boolean {
    return this.folderPaths.has(pairedFolderPath(entry.notePath));
  }

  /**
   * Resolved children of a note in review order: frontmatter `children` order
   * first, then any notes physically in the paired folder that the frontmatter
   * missed, sorted by path.
   */
  childrenOf(entry: NoteEntry): NoteEntry[] {
    const out: NoteEntry[] = [];
    const seen = new Set<string>();
    for (const addr of entry.childrenAddresses) {
      const child = this.byAddress.get(addr);
      if (child) {
        out.push(child);
        seen.add(child.notePath);
      }
    }
    const folder = pairedFolderPath(entry.notePath);
    const strays = [...this.byNotePath.values()]
      .filter((n) => !seen.has(n.notePath) && n.notePath.startsWith(`${folder}/`))
      .filter((n) => !n.notePath.slice(folder.length + 1).includes("/"))
      .sort((a, b) => a.notePath.localeCompare(b.notePath));
    out.push(...strays);
    return out;
  }

  /**
   * Depth-first topological walk from a root note: the note itself, then each
   * child subtree recursively in children order. This IS the mental-palace
   * order (KTD9); session queues and rollups both consume it.
   */
  subtreeOf(address: string): NoteEntry[] {
    const root = this.byAddress.get(address);
    if (!root) return [];
    const out: NoteEntry[] = [];
    const visit = (n: NoteEntry, seen: Set<string>) => {
      if (seen.has(n.address)) return; // defensive: frontmatter cycles must not hang
      seen.add(n.address);
      out.push(n);
      for (const child of this.childrenOf(n)) visit(child, seen);
    };
    visit(root, new Set());
    return out;
  }

  /**
   * Ancestor titles from the first node inside the zettel root down to the
   * entry itself (plan 003 KTD1): the folder path is the parent chain, each
   * ancestor segment resolves its paired note's title, and a folder with no
   * paired note falls back to its folder name.
   */
  lineageOf(entry: NoteEntry, zettelRoot: string): string[] {
    const rel = entry.notePath.startsWith(`${zettelRoot}/`)
      ? entry.notePath.slice(zettelRoot.length + 1)
      : entry.notePath;
    const segments = rel.replace(/\.md$/, "").split("/");
    const out: string[] = [];
    let folder = zettelRoot;
    for (let i = 0; i < segments.length - 1; i++) {
      folder = `${folder}/${segments[i]}`;
      out.push(this.byNotePath.get(`${folder}.md`)?.title ?? segments[i]!);
    }
    out.push(entry.title);
    return out;
  }

  /** Root entries directly under a folder path (used for folder rows with no paired note). */
  notesDirectlyIn(folderPath: string): NoteEntry[] {
    return [...this.byNotePath.values()]
      .filter((n) => n.notePath.startsWith(`${folderPath}/`))
      .filter((n) => !n.notePath.slice(folderPath.length + 1).includes("/"))
      .sort((a, b) => a.notePath.localeCompare(b.notePath));
  }

  toJSON(): unknown {
    return {
      version: 1,
      builtAt: new Date().toISOString(),
      notes: [...this.byAddress.values()].map((n) => ({
        address: n.address,
        notePath: n.notePath,
        title: n.title,
        children: n.childrenAddresses,
        cards: n.sidecar?.cards.length ?? 0,
      })),
      orphanSidecars: this.orphanSidecars,
    };
  }
}
