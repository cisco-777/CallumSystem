import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
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
