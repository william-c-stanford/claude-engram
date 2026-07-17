/**
 * Minimal faithful stub of the obsidian module surface the plugin touches,
 * enough to drive ReviewModal headlessly. Rendering is recorded as raw
 * markdown text; the element tree mimics Obsidian's HTMLElement helpers.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Listener = (evt: any) => void;

export class FakeEl {
  tag: string;
  classes = new Set<string>();
  children: FakeEl[] = [];
  parent: FakeEl | null = null;
  textContent = "";
  value = "";
  disabled = false;
  attrs: Record<string, string> = {};
  private listeners: Record<string, Listener[]> = {};
  private hidden = false;

  constructor(tag = "div", opts?: { cls?: string; text?: string; type?: string; placeholder?: string }) {
    this.tag = tag;
    if (opts?.cls) for (const c of opts.cls.split(/\s+/)) if (c) this.classes.add(c);
    if (opts?.text) this.textContent = opts.text;
    if (opts?.type) this.attrs["type"] = opts.type;
  }

  get childElementCount(): number {
    return this.children.length;
  }

  private add(tag: string, opts?: any): FakeEl {
    const el = new FakeEl(tag, opts);
    el.parent = this;
    this.children.push(el);
    return el;
  }

  createDiv(opts?: any): FakeEl {
    return this.add("div", opts);
  }
  createSpan(opts?: any): FakeEl {
    return this.add("span", opts);
  }
  createEl(tag: string, opts?: any): FakeEl {
    return this.add(tag, opts);
  }

  empty(): void {
    this.children = [];
    this.textContent = "";
  }
  remove(): void {
    if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
  }
  setText(t: string): void {
    this.textContent = t;
  }
  setAttribute(k: string, v: string): void {
    this.attrs[k] = v;
  }
  addClass(...cls: string[]): void {
    for (const c of cls) this.classes.add(c);
  }
  removeClass(...cls: string[]): void {
    for (const c of cls) this.classes.delete(c);
  }
  toggleClass(cls: string, on: boolean): void {
    if (on) this.classes.add(cls);
    else this.classes.delete(cls);
  }
  hide(): void {
    this.hidden = true;
  }
  show(): void {
    this.hidden = false;
  }
  isShown(): boolean {
    return !this.hidden;
  }
  focus(): void {
    (globalThis as any).document.activeElement = { tagName: this.tag.toUpperCase(), el: this };
  }
  blur(): void {
    (globalThis as any).document.activeElement = null;
  }

  addEventListener(evt: string, cb: Listener): void {
    (this.listeners[evt] ??= []).push(cb);
  }
  dispatch(evt: string, payload: any = { preventDefault() {} }): void {
    for (const cb of this.listeners[evt] ?? []) cb(payload);
  }
  click(): void {
    this.dispatch("click", { preventDefault() {}, stopPropagation() {} });
  }

  /** Depth-first search of the subtree, self included. */
  find(pred: (el: FakeEl) => boolean): FakeEl | null {
    if (pred(this)) return this;
    for (const c of this.children) {
      const hit = c.find(pred);
      if (hit) return hit;
    }
    return null;
  }
  findAll(pred: (el: FakeEl) => boolean, out: FakeEl[] = []): FakeEl[] {
    if (pred(this)) out.push(this);
    for (const c of this.children) c.findAll(pred, out);
    return out;
  }
  /** Supports ".class" and "tag" selectors — all the plugin uses. */
  private matches(sel: string): (el: FakeEl) => boolean {
    if (sel.startsWith(".")) return (el) => el.classes.has(sel.slice(1));
    return (el) => el.tag === sel;
  }
  querySelector(sel: string): FakeEl | null {
    const m = this.matches(sel);
    for (const c of this.children) {
      const hit = c.find(m);
      if (hit) return hit;
    }
    return null;
  }
  querySelectorAll(sel: string): FakeEl[] {
    const m = this.matches(sel);
    const out: FakeEl[] = [];
    for (const c of this.children) c.findAll(m, out);
    return out;
  }
  /** All rendered text in the subtree. */
  allText(): string {
    return [this.textContent, ...this.children.map((c) => c.allText())].join("\n");
  }
}

(globalThis as any).document ??= { activeElement: null };

export class TFile {
  path: string;
  basename: string;
  extension: string;
  constructor(path: string) {
    this.path = path;
    const base = path.split("/").pop() ?? path;
    this.basename = base.replace(/\.md$/, "");
    this.extension = base.includes(".") ? base.split(".").pop()! : "";
  }
}

export class TFolder {
  path = "";
  children: unknown[] = [];
}

export class Component {
  load(): void {}
  unload(): void {}
}

export class Notice {
  static messages: string[] = [];
  constructor(message: string, _timeout?: number) {
    Notice.messages.push(String(message));
  }
  static reset(): void {
    Notice.messages = [];
  }
}

export interface KeyReg {
  key: string;
  cb: (evt: any) => void;
}

export class Scope {
  registered: KeyReg[] = [];
  register(_mods: string[], key: string, cb: (evt: any) => void): void {
    this.registered.push({ key, cb });
  }
  press(key: string): void {
    for (const r of this.registered) if (r.key === key) r.cb({ preventDefault() {} });
  }
}

export class Modal {
  app: any;
  modalEl = new FakeEl("div");
  contentEl = new FakeEl("div");
  scope = new Scope();
  isOpen = false;
  constructor(app: any) {
    this.app = app;
  }
  open(): void {
    this.isOpen = true;
    (this as any).onOpen?.();
  }
  close(): void {
    this.isOpen = false;
    (this as any).onClose?.();
  }
}

export const MarkdownRenderer = {
  // Record the raw markdown as rendered text — LaTeX fidelity is proven by
  // the unit tests; the harness asserts on content presence.
  render: async (_app: any, markdown: string, el: FakeEl, _sourcePath: string, _component: Component): Promise<void> => {
    el.setText(markdown);
  },
};

export class Plugin {}
export class PluginSettingTab {}
export class Setting {}
export class WorkspaceLeaf {}
