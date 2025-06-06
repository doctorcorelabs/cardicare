/**
 * API utilities for handling request failures and retries
 */

/**
 * Attempts to fetch from primary URL, falls back to secondary URL if primary fails
 * @param primaryUrl The primary URL to fetch from
 * @param fallbackUrl The fallback URL to use if primary fails
 * @param options Fetch options
 * @param maxRetries Maximum number of retries (defaults to 2)
 * @returns Response from successful fetch
 */
export async function fetchWithFallback(
  primaryUrl: string, 
  fallbackUrl: string,
  options: RequestInit,
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;

  // Try primary URL
  try {
    console.log(`Attempting to fetch from primary URL: ${primaryUrl}`);
    return await fetch(primaryUrl, options);
  } catch (error) {
    console.error(`Error fetching from primary URL: ${error}`);
    lastError = error instanceof Error ? error : new Error(String(error));
  }

  // Try fallback URL
  try {
    console.log(`Primary URL failed. Trying fallback URL: ${fallbackUrl}`);
    return await fetch(fallbackUrl, options);
  } catch (error) {
    console.error(`Error fetching from fallback URL: ${error}`);
    lastError = error instanceof Error ? error : new Error(String(error));
  }

  // Try a few more times with exponential backoff
  for (let i = 0; i < maxRetries; i++) {
    const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
    console.log(`Retry attempt ${i+1}/${maxRetries} after ${delay}ms`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      return await fetch(fallbackUrl, options);
    } catch (error) {
      console.error(`Retry ${i+1} failed: ${error}`);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error("Failed to fetch from all sources");
}

/**
 * Get diagnostic information about the current network state
 * Useful for debugging connection issues
 */
export async function getDiagnosticInfo(): Promise<{
  connected: boolean,
  timestamp: string,
  userAgent: string,
  error?: string
}> {
  try {
    // Test connection by fetching a known endpoint
    const testFetch = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { 
      method: 'GET',
      cache: 'no-store'
    });
    
    return {
      connected: testFetch.ok,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
