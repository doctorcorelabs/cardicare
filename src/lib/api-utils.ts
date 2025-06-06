import dnsCache from './dns-cache'; // Import the DNS cache

/**
 * API utilities for handling request failures and retries
 */

// Top-level helper functions
const isValidUrl = (url: string): boolean => {
  try {
    if (typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

const ensureChatEndpoint = (url: string, defaultBase: string): string => {
  const urlStr = String(url); 
  if (!isValidUrl(urlStr) || !urlStr.endsWith('/chat')) {
    const base = isValidUrl(urlStr) ? new URL(urlStr).origin : defaultBase;
    const chatUrl = `${base}/chat`;
    // console.warn(`URL "${urlStr}" was invalid or not a chat endpoint, adjusted to: ${chatUrl}`);
    return chatUrl;
  }
  return urlStr;
};


/**
 * Attempts to fetch from primary URL, falls back to secondary URL if primary fails
 * @param primaryUrlInput The primary URL to fetch from
 * @param fallbackUrlInput The fallback URL to use if primary fails
 * @param options Fetch options
 * @param maxRetries Maximum number of retries (defaults to 2)
 * @returns Response from successful fetch
 */
export async function fetchWithFallback(
  primaryUrlInput: string, 
  fallbackUrlInput: string,
  options: RequestInit,
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;
  const allErrors: { url: string, error: string, type: string }[] = [];
  const DEFAULT_TIMEOUT = 5000; 

  let processedPrimaryUrl = ensureChatEndpoint(primaryUrlInput, "https://heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev");
  let processedFallbackUrl = ensureChatEndpoint(fallbackUrlInput, "https://heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev");

  const endpointConfigs = [
    { type: 'primary', getUrl: () => processedPrimaryUrl, isDomain: true, originalHost: isValidUrl(processedPrimaryUrl) ? new URL(processedPrimaryUrl).hostname : '', needsHostHeader: false, hostHeaderValue: '' },
    { type: 'fallback', getUrl: () => processedFallbackUrl, isDomain: true, originalHost: isValidUrl(processedFallbackUrl) ? new URL(processedFallbackUrl).hostname : '', needsHostHeader: false, hostHeaderValue: '' },
    { type: 'hardcoded_domain_1', getUrl: () => ensureChatEndpoint("https://heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev", ""), isDomain: true, originalHost: 'heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev', needsHostHeader: false, hostHeaderValue: '' },
    { type: 'hardcoded_domain_2', getUrl: () => ensureChatEndpoint("https://heart-health-ai-assistant.workers.dev", ""), isDomain: true, originalHost: 'heart-health-ai-assistant.workers.dev', needsHostHeader: false, hostHeaderValue: '' },
    { type: 'ip_1', getUrl: () => "https://104.21.36.155/chat", isDomain: false, originalHost: 'heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev', needsHostHeader: true, hostHeaderValue: 'heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev' }, 
    { type: 'ip_2', getUrl: () => "https://172.67.150.37/chat", isDomain: false, originalHost: 'heart-health-ai-assistant.workers.dev', needsHostHeader: true, hostHeaderValue: 'heart-health-ai-assistant.workers.dev' }  
  ];
  
  const baseFetchOptions: RequestInit = {
    mode: 'cors' as RequestMode,
    credentials: 'omit' as RequestCredentials,
    cache: 'no-store' as RequestCache,
    headers: {
      ...(options.headers || {}), 
      'Accept': 'text/plain, application/json, */*',
      'X-Client-Version': '2.0.3', // Updated client version for DNS cache integration
    }
  };

  if (typeof document !== 'undefined') {
    const uniqueOrigins = new Set<string>();
    endpointConfigs.forEach(config => {
      if (config.isDomain) { // Only prefetch domains
        try {
          const url = config.getUrl();
          if (isValidUrl(url)) {
            uniqueOrigins.add(new URL(url).origin);
          }
        } catch (e) { console.warn(`Could not parse origin for DNS prefetch: ${config.getUrl()}`, e); }
      }
    });

    uniqueOrigins.forEach(origin => {
      if (!document.querySelector(`link[rel="dns-prefetch"][href="${origin}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = origin;
        document.head.appendChild(link);
        console.log(`Added DNS prefetch for ${origin}`);
      }
    });
  }

  const attemptFetch = async (urlToFetch: string, fetchOpts: RequestInit, type: string, originalHostnameForCache?: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      console.log(`Attempting [${type}] fetch from: ${urlToFetch}`);
      const response = await fetch(urlToFetch, { ...fetchOpts, signal: controller.signal });
      clearTimeout(timeoutId);
      console.log(`[${type}] fetch successful from ${urlToFetch} with status: ${response.status}`);
      
      // If successful with a direct IP that was not from cache, cache it.
      if (type.startsWith('ip_') && originalHostnameForCache && response.ok) {
         // Extract IP from urlToFetch (e.g. "https://1.2.3.4/chat" -> "1.2.3.4")
        const ipMatch = urlToFetch.match(/https?:\/\/([^/]+)/);
        if (ipMatch && ipMatch[1]) {
            dnsCache.set(originalHostnameForCache, ipMatch[1]);
        }
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${type}] Error fetching from ${urlToFetch}: ${errorMessage}`);
      allErrors.push({ url: urlToFetch, error: errorMessage, type });
      if (error instanceof TypeError && (errorMessage.includes('fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch'))) {
        console.warn(`Network error detected for ${urlToFetch}, likely DNS or connectivity issue.`);
      }
      lastError = error instanceof Error ? error : new Error(errorMessage);
      throw lastError; 
    }
  };

  // Initial pass
  for (const config of endpointConfigs) {
    let currentUrlToTry = config.getUrl(); 
    const currentOptions: RequestInit = {
      ...baseFetchOptions,
      headers: { ...(baseFetchOptions.headers || {}) } 
    };
    let attemptType = config.type;

    if (config.isDomain && config.originalHost) {
      const cachedIp = dnsCache.get(config.originalHost);
      if (cachedIp) {
        try {
          const originalUrlParts = new URL(currentUrlToTry); // currentUrlToTry is domain based here
          const ipBasedUrl = `${originalUrlParts.protocol}//${cachedIp}${originalUrlParts.pathname}${originalUrlParts.search}`;
          
          const ipOptions = { ...currentOptions };
          if (ipOptions.headers) {
            (ipOptions.headers as Record<string, string>)['Host'] = config.originalHost;
          }
          console.log(`DNS Cache HIT for ${config.originalHost}. Attempting fetch via cached IP: ${ipBasedUrl}`);
          return await attemptFetch(ipBasedUrl, ipOptions, `${config.type}-cached-ip`);
        } catch (ipFetchError) {
          console.warn(`Fetch via cached IP ${cachedIp} for ${config.originalHost} failed. Proceeding with domain.`, ipFetchError);
          dnsCache.remove(config.originalHost); // Remove bad entry
        }
      }
    }
    
    // If not using cached IP, or if cached IP fetch failed:
    if (config.needsHostHeader && currentOptions.headers) {
      (currentOptions.headers as Record<string, string>)['Host'] = config.hostHeaderValue;
    }
    
    try {
      // Pass originalHost for potential caching on success if it's a direct IP config
      const originalHostForCaching = (!config.isDomain && config.originalHost) ? config.originalHost : undefined;
      return await attemptFetch(currentUrlToTry, currentOptions, attemptType, originalHostForCaching);
    } catch (e) {
      // Error logged by attemptFetch
    }
  }

  // Retries
  console.log('Initial fetch attempts failed for all endpoints. Starting retries...');
  for (let i = 0; i < maxRetries; i++) {
    const delay = Math.pow(2, i) * 1000; 
    console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));

    for (const config of endpointConfigs) { // Retry all configs
      let currentUrlToTry = config.getUrl();
      const retryFetchOptions: RequestInit = {
        ...baseFetchOptions, 
        headers: { 'Accept': '*/*' }, // Simplified headers for retry
        keepalive: true, 
      };
      const originalContentType = (options.headers as Record<string, string>)?.['Content-Type'] || (baseFetchOptions.headers as Record<string, string>)?.['Content-Type'];
      if (originalContentType && retryFetchOptions.headers) {
        (retryFetchOptions.headers as Record<string, string>)['Content-Type'] = originalContentType;
      }
      let attemptType = `${config.type}-retry-${i+1}`;

      // DNS Cache check for domain-based URLs during retries as well
      if (config.isDomain && config.originalHost) {
        const cachedIp = dnsCache.get(config.originalHost);
        if (cachedIp) {
          try {
            const originalUrlParts = new URL(currentUrlToTry);
            const ipBasedUrl = `${originalUrlParts.protocol}//${cachedIp}${originalUrlParts.pathname}${originalUrlParts.search}`;
            const ipOptions = { ...retryFetchOptions };
            if (ipOptions.headers) {
              (ipOptions.headers as Record<string, string>)['Host'] = config.originalHost;
            }
            console.log(`DNS Cache HIT (retry) for ${config.originalHost}. Attempting fetch via cached IP: ${ipBasedUrl}`);
            return await attemptFetch(ipBasedUrl, ipOptions, `${config.type}-cached-ip-retry-${i+1}`);
          } catch (ipFetchError) {
            console.warn(`Fetch (retry) via cached IP ${cachedIp} for ${config.originalHost} failed.`, ipFetchError);
            dnsCache.remove(config.originalHost);
          }
        }
      }
      
      if (config.needsHostHeader && retryFetchOptions.headers) {
        (retryFetchOptions.headers as Record<string, string>)['Host'] = config.hostHeaderValue;
      }

      try {
        const originalHostForCaching = (!config.isDomain && config.originalHost) ? config.originalHost : undefined;
        return await attemptFetch(currentUrlToTry, retryFetchOptions, attemptType, originalHostForCaching);
      } catch (e) {
        // Error logged
      }
    }
  }

  const finalErrorMessage = `Failed to fetch from all API endpoints after ${maxRetries} retries. Collected errors: ${JSON.stringify(allErrors, null, 2)}`;
  console.error(finalErrorMessage);
  throw lastError || new Error(finalErrorMessage);
}

interface DiagnosticResults {
  connected: boolean;
  timestamp: string;
  userAgent: string;
  apiServiceReachable: boolean;
  cloudflareReachable: boolean;
  googleReachable: boolean;
  navigatorOnline: boolean;
  networkType?: string;
  dnsTestResults?: Record<string, boolean>;
  error?: string; 
}

export async function getDiagnosticInfo(): Promise<DiagnosticResults> {
  const defaultPrimaryBase = "https://heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev";
  const defaultFallbackBase = "https://heart-health-ai-assistant.workers.dev"; 

  const diagPrimaryBase = import.meta.env.VITE_API_URL || defaultPrimaryBase;
  const diagFallbackBase = import.meta.env.VITE_API_URL_FALLBACK || defaultFallbackBase;

  const diagnosticPingPrimaryUrl = ensureChatEndpoint(diagPrimaryBase, defaultPrimaryBase).replace('/chat', '/ping');
  const diagnosticPingFallbackUrl = ensureChatEndpoint(diagFallbackBase, defaultFallbackBase).replace('/chat', '/ping');

  const results: DiagnosticResults = {
    connected: false,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    apiServiceReachable: false,
    cloudflareReachable: false,
    googleReachable: false,
    navigatorOnline: typeof navigator !== 'undefined' ? navigator.onLine : true, 
    networkType: 'unknown',
    dnsTestResults: {},
    error: undefined 
  };
  
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn) {
      results.networkType = conn.effectiveType || conn.type || 'unknown';
    }
  }

  const testEndpoints = [
    { name: 'cloudflare_trace', url: 'https://www.cloudflare.com/cdn-cgi/trace', property: 'cloudflareReachable' as keyof DiagnosticResults},
    { name: 'google_generate_204', url: 'https://www.google.com/generate_204', property: 'googleReachable' as keyof DiagnosticResults},
    { name: 'api_service_primary_ping',  url: diagnosticPingPrimaryUrl, property: 'apiServiceReachable' as keyof DiagnosticResults},
    { name: 'api_service_fallback_ping', url: diagnosticPingFallbackUrl, property: 'apiServiceReachable' as keyof DiagnosticResults}
  ];
  
  let anApiServiceReachable = false;
  for (const endpoint of testEndpoints) {
    try {
      await fetch(endpoint.url, { 
        method: 'GET', 
        cache: 'no-store',
        mode: 'no-cors', 
        signal: AbortSignal.timeout(3000) 
      });
      
      if (results.dnsTestResults) { 
        results.dnsTestResults[endpoint.name] = true;
      }
      
      if (endpoint.property === 'apiServiceReachable') {
        anApiServiceReachable = true;
      } else if (endpoint.property === 'cloudflareReachable') {
        results.cloudflareReachable = true;
      } else if (endpoint.property === 'googleReachable') {
        results.googleReachable = true;
      }
      results.connected = true; 
    } catch (error) {
      console.warn(`Connectivity test to ${endpoint.name} (${endpoint.url}) failed:`, error);
      if (results.dnsTestResults) { 
        results.dnsTestResults[endpoint.name] = false;
      }
    }
  }
  results.apiServiceReachable = anApiServiceReachable;

  if (!results.apiServiceReachable && (results.cloudflareReachable || results.googleReachable)) {
    results.error = "API service unreachable but internet connection to other services is working. Possible DNS or server issue with our API.";
  } else if (!results.connected && results.navigatorOnline) {
     results.error = "Browser reports online, but cannot connect to any external services. Check firewall or DNS configuration.";
  } else if (!results.navigatorOnline) {
    results.error = "Browser reports offline. Please check your internet connection.";
  } else if (!results.connected) { 
    results.error = "Cannot connect to any services despite browser reporting online. Check network configuration.";
  }

  return results;
}
