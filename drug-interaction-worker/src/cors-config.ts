// cors-config.ts
// CORS configuration for the drug interaction worker

// Update allowedOrigins for your project
export const allowedOrigins = [
  'http://localhost:5173', // Common Vite dev server
  'http://localhost:3000', // Common Node dev server
  'http://localhost:8787', // Wrangler dev server
  'http://localhost:8080', // Vite dev server (common alternative port)
  'http://localhost:8081', // Another Vite dev server port
  'http://localhost:4173', // Vite preview server
  'http://127.0.0.1:5173', // Alternative Vite local address
  'http://127.0.0.1:3000', // Alternative Node local address
  'http://127.0.0.1:8080', // Alternative Vite local address
  'http://127.0.0.1:8081', // Alternative Vite local address
  // Add your production frontend URL here, e.g., 'https://your-app.com'
];

// Whether to allow any origin (for development purposes only)
export const allowAnyOrigin = true; // Set to false in production!

// Helper function for CORS headers
export function handleOptions(request: Request) {
  const headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS preflight requests.
    const origin = request.headers.get('Origin');
    
    // Set Access-Control-Allow-Origin based on config
    let allowOrigin = allowAnyOrigin ? (origin || '*') : allowedOrigins[0];
    
    // If not allowing any origin, check if the specific origin is in our allowed list
    if (!allowAnyOrigin && origin && allowedOrigins.includes(origin)) {
      allowOrigin = origin;
    }
    
    console.log(`CORS preflight from origin: ${origin}, setting Access-Control-Allow-Origin: ${allowOrigin}`);

    const respHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': headers.get('Access-Control-Request-Headers') || 'Content-Type',
      'Access-Control-Max-Age': '86400', // Cache preflight for 1 day
      'Access-Control-Allow-Credentials': 'true'
    };
    return new Response(null, { headers: respHeaders });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: 'GET, POST, OPTIONS',
      },
    });
  }
}

// Get CORS headers for responses
export function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  
  // Set Access-Control-Allow-Origin based on config
  let allowOrigin = allowAnyOrigin ? (origin || '*') : allowedOrigins[0];
  
  // If not allowing any origin, check if the specific origin is in our allowed list
  if (!allowAnyOrigin && origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  }
  
  console.log(`Request from origin: ${origin}, setting Access-Control-Allow-Origin: ${allowOrigin}`);
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
}
