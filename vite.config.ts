import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : '/',
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
  // Define external API endpoints for production build
  define: {
    'import.meta.env.VITE_API_URL': mode === 'production' 
      ? JSON.stringify('https://heart-health-ai-assistant.daivanlabs.workers.dev')
      : JSON.stringify('http://localhost:8787'),
    'import.meta.env.VITE_API_URL_FALLBACK': mode === 'production'
      ? JSON.stringify('https://heart-health-ai-assistant.daivanlabs.workers.dev')
      : JSON.stringify('http://localhost:8787'),
    'import.meta.env.VITE_DRUG_INTERACTION_URL': mode === 'production'
      ? JSON.stringify('https://drug-interaction-worker.daivanlabs.workers.dev')
      : JSON.stringify('http://localhost:8789'),
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
