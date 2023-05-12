import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReactDiagramax",
      fileName: (format) => `diagramax.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
    outDir: "dist",
    sourcemap: true,
  },
});
