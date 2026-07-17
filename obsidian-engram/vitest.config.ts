import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// The integration harness drives the real ReviewModal against a faithful
// obsidian stub; unit tests never import "obsidian" and are unaffected.
export default defineConfig({
  resolve: {
    alias: {
      obsidian: fileURLToPath(new URL("./tests/integration/obsidian-stub.ts", import.meta.url)),
    },
  },
});
