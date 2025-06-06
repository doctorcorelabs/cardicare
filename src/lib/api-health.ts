/**
 * API status and health check utilities
 */

// API Health Check Endpoints
const API_PATHS = {
  PRIMARY: import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '',
  FALLBACK: import.meta.env.VITE_API_URL_FALLBACK?.replace(/\/+$/, '') || '',
  LOCAL: '/api'
};

interface ApiHealthStatus {
  status: 'online' | 'offline' | 'fallback' | 'unknown';
  primaryAvailable: boolean;
  fallbackAvailable: boolean;
  latencyMs?: number;
  message?: string;
  timestamp: string;
}

/**
 * Check API health by testing connectivity with the endpoints
 * @returns ApiHealthStatus object with availability information
 */
export async function checkApiHealth(): Promise<ApiHealthStatus> {
  const startTime = performance.now();
  const isDev = import.meta.env.DEV === true;
  
  // In development, we just check the local endpoint
  if (isDev) {
    try {
      const response = await fetch(`${API_PATHS.LOCAL}/ping`, { 
        method: 'HEAD',
        cache: 'no-store',
      });
      
      const endTime = performance.now();
      return {
        status: response.ok ? 'online' : 'offline',
        primaryAvailable: response.ok,
        fallbackAvailable: false,
        latencyMs: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'offline',
        primaryAvailable: false,
        fallbackAvailable: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // For production, check both primary and fallback
  let primaryAvailable = false;
  let fallbackAvailable = false;
  
  // Check primary endpoint
  try {
    const primaryResponse = await fetch(`${API_PATHS.PRIMARY}/ping`, {
      method: 'HEAD',
      cache: 'no-store',
      // 3 second timeout
      signal: AbortSignal.timeout(3000)
    });
    primaryAvailable = primaryResponse.ok;
  } catch (error) {
    console.log('Primary API check failed:', error);
    primaryAvailable = false;
  }
  
  // Check fallback endpoint if primary is unavailable
  if (!primaryAvailable) {
    try {
      const fallbackResponse = await fetch(`${API_PATHS.FALLBACK}/ping`, {
        method: 'HEAD',
        cache: 'no-store',
        // 3 second timeout
        signal: AbortSignal.timeout(3000)
      });
      fallbackAvailable = fallbackResponse.ok;
    } catch (error) {
      console.log('Fallback API check failed:', error);
      fallbackAvailable = false;
    }
  }
  
  const endTime = performance.now();
  
  // Determine overall status
  let status: 'online' | 'offline' | 'fallback' | 'unknown';
  if (primaryAvailable) {
    status = 'online';
  } else if (fallbackAvailable) {
    status = 'fallback';
  } else {
    status = 'offline';
  }
  
  return {
    status,
    primaryAvailable,
    fallbackAvailable,
    latencyMs: Math.round(endTime - startTime),
    timestamp: new Date().toISOString()
  };
}
