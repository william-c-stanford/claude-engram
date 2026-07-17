import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prod = process.argv[2] === "production";

const here = path.dirname(fileURLToPath(import.meta.url));
// Where the vault loads the plugin from — a copy, not this source dir. Override
// with ENGRAM_INSTALL_DIR when building against a different vault (or set it to
// "" / "none" to skip the deploy, e.g. in CI/release builds).
const installDir =
  process.env.ENGRAM_INSTALL_DIR ??
  path.resolve(here, "..", ".obsidian", "plugins", "engram-flashcards");
const DEPLOY_FILES = ["main.js", "manifest.json", "styles.css"];

async function deploy() {
  if (!installDir || installDir === "none") return;
  try {
    await mkdir(installDir, { recursive: true });
    for (const f of DEPLOY_FILES) {
      const src = path.resolve(here, f);
      if (existsSync(src)) await copyFile(src, path.join(installDir, f));
    }
    console.log(`[engram] deployed to ${installDir} — reload the plugin in Obsidian`);
  } catch (e) {
    console.warn(`[engram] deploy skipped: ${e.message}`);
  }
}

// esbuild plugin: fires after every (re)build, so both `build` and watch `dev`
// keep the installed copy in sync.
const deployPlugin = {
  name: "engram-deploy",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length === 0) return deploy();
    });
  },
};

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins,
  ],
  format: "cjs",
  target: "es2020",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  minify: prod,
  plugins: [deployPlugin],
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
