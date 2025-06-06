import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy /api requests to Cloudflare Worker dev server
      '/api': {
        target: 'http://localhost:8787', // Default wrangler dev port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: remove /api prefix if your worker doesn't expect it
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
