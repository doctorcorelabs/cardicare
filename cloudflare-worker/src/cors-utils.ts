// Flexible CORS handling for the CardiCare application

/**
 * Gets CORS headers based on the request origin
 * @param request The incoming request
 * @returns An object containing appropriate CORS headers
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  // Extract the origin from the request
  const requestOrigin = request.headers.get('Origin') || '';
  
  // Base CORS headers that are applied to all responses
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, x-client-version',
    'Access-Control-Max-Age': '86400'
  };
  
  // Whitelist of allowed origins
  const allowedOrigins = [
    'https://cardicare.daivanlabs.site',
    'http://localhost:8080',
    'http://localhost:5173'
  ];
  
  // Decide which origin to allow
  if (allowedOrigins.includes(requestOrigin)) {
    corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
  } else {
    // Default to the production domain
    corsHeaders['Access-Control-Allow-Origin'] = 'https://cardicare.daivanlabs.site';
  }
  
  return corsHeaders;
}

/**
 * Handle CORS preflight requests
 * @param request The incoming request
 * @returns A Response for OPTIONS requests, or null for other methods
 */
export function handleCorsPreflightRequest(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request)
    });
  }
  return null;
}

/**
 * Apply CORS headers to an existing response
 * @param response The original response
 * @param request The original request
 * @returns A new response with CORS headers added
 */
export function applyCorsHeaders(response: Response, request: Request): Response {
  const corsHeaders = getCorsHeaders(request);
  
  // Create a new response with the same body and status, but with CORS headers
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
