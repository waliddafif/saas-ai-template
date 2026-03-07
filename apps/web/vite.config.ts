import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    // vendor-ai (heavy AI/chat runtime) is lazy-loaded via ChatPage — warning is a false alarm
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Heavy AI/chat runtime — isolated (lazy-loaded via ChatPage)
            if (id.includes("@assistant-ui") || id.includes("@ai-sdk") || id.includes("openai")) {
              return "vendor-ai";
            }
            // TanStack ecosystem
            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }
            // Radix UI primitives (large collection)
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // React core
            if (id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react";
            }
          }
        },
      },
    },
  },
});
