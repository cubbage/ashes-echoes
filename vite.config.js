import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        dashboard: fileURLToPath(new URL("./index.html", import.meta.url)),
        agentContext: fileURLToPath(new URL("./agent-context.html", import.meta.url))
      }
    }
  }
});
