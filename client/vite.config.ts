import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// DO NOT include async plugins inside defineConfig (Vite doesn't support it here)
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Remove REPL-only plugin for Vercel compatibility
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  // ❗️ DO NOT set 'root' here — you're already in client/
  build: {
    outDir: "dist",  // what Vercel expects
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
