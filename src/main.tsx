import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupDnsPrefetch } from './lib/dns-helper'

// Initialize DNS prefetching as early as possible
setupDnsPrefetch();

// Add meta tags for DNS prefetching in the head
if (typeof document !== 'undefined') {
  // Add DNS prefetch meta tag
  const metaDnsPrefetch = document.createElement('meta');
  metaDnsPrefetch.httpEquiv = 'x-dns-prefetch-control';
  metaDnsPrefetch.content = 'on';
  document.head.appendChild(metaDnsPrefetch);
}

createRoot(document.getElementById("root")!).render(<App />);
