import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),      // ⬅️ FIXED
      "@shared": path.resolve(__dirname, "shared"),      // ⬅️ FIXED
      "@assets": path.resolve(__dirname, "attached_assets"), // ⬅️ FIXED
    },
  },
  root: path.resolve(__dirname, "client"),               // ⬅️ FIXED
  build: {
    outDir: path.resolve(__dirname, "dist/public"),      // ⬅️ FIXED
    emptyOutDir: true,
  },
});
