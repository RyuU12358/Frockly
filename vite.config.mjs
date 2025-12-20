import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/Frockly/", // ★ GitHub Pages 用（リポジトリ名）
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: { exclude: ["fsevents"] },
  build: {
    target: "esnext",
    outDir: "build",
    rollupOptions: { external: ["fsevents"] },
  },
  server: { port: 3000, open: true },
});
