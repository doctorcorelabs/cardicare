import { getDiagnosticInfo } from './api-utils'; // Import the diagnostic utility

/**
 * API status and health check utilities
 */

// API Health Check Endpoints
const DEFAULT_PRIMARY_API_BASE = 'https://heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev';
const DEFAULT_FALLBACK_API_BASE = 'https://heart-health-ai-assistant.workers.dev'; 

// Get API URLs with hardcoded fallbacks if environment variables fail to resolve
const API_BASES = {
  PRIMARY: (import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || DEFAULT_PRIMARY_API_BASE),
  FALLBACK: (import.meta.env.VITE_API_URL_FALLBACK?.replace(/\/+$/, '') || DEFAULT_FALLBACK_API_BASE),
  LOCAL: '/api' // For local development proxy
};

// Define specific ping endpoints
const PING_ENDPOINTS = {
  PRIMARY: `${API_BASES.PRIMARY}/ping`,
  FALLBACK: `${API_BASES.FALLBACK}/ping`,
  LOCAL: `${API_BASES.LOCAL}/ping`
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
      // For dev, use a simple fetch to the local /api/ping
      const response = await fetch(PING_ENDPOINTS.LOCAL, { 
        method: 'GET', // Changed to GET for consistency, assuming ping endpoint supports it
        cache: 'no-store',
        signal: AbortSignal.timeout(3000) // 3s timeout for local
      });
      
      const endTime = performance.now();
      return {
        status: response.ok ? 'online' : 'offline',
        primaryAvailable: response.ok, // In dev, primaryAvailable represents local availability
        fallbackAvailable: false, // No fallback concept for local dev proxy typically
        latencyMs: Math.round(endTime - startTime),
        message: response.ok ? 'Local dev server API is online.' : 'Local dev server API is offline.',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'offline',
        primaryAvailable: false,
        fallbackAvailable: false,
        message: `Local dev server API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // For production, perform comprehensive checks
  let primaryAvailable = false;
  let fallbackAvailable = false;
  let ipAvailable = false; 
  let detailedMessage: string | undefined;

  const diagnostics = await getDiagnosticInfo();
  console.log('API Health - Initial network diagnostics:', diagnostics);

  const generalNetworkOnline = diagnostics.connected || diagnostics.navigatorOnline;
  // A more specific check for potential DNS issues affecting *our* API services
  const potentialApiDnsIssue = 
    diagnostics.dnsTestResults?.api_service_primary_ping === false || 
    diagnostics.dnsTestResults?.api_service_fallback_ping === false;

  if (typeof document !== 'undefined') {
    try {
      const addDnsPrefetch = (baseUrl: string) => {
        if (!baseUrl || !baseUrl.startsWith('http')) return; 
        const origin = new URL(baseUrl).origin;
        if (!document.querySelector(`link[rel="dns-prefetch"][href="${origin}"]`)) {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = origin;
          document.head.appendChild(link);
          console.log(`Added DNS prefetch for ${origin}`);
        }
      };
      addDnsPrefetch(API_BASES.PRIMARY);
      addDnsPrefetch(API_BASES.FALLBACK);
    } catch (e) {
      console.warn('Failed to set up DNS prefetch:', e);
    }
  }
  
  const performPing = async (url: string, type: string, customHeaders?: Record<string, string>) => {
    const controller = new AbortController(); // controller can be defined outside try/catch
    let timeoutId: NodeJS.Timeout | number; // Declare timeoutId here for wider scope in function

    try {
      console.log(`Checking ${type} API at: ${url}`);
      timeoutId = setTimeout(() => controller.abort(), 5000); 
      
      const response = await fetch(url, {
        method: 'GET', 
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        headers: {
          'Accept': '*/*', 
          'Cache-Control': 'no-cache',
          ...(customHeaders || {})
        }
      });
      clearTimeout(timeoutId);
      console.log(`${type} API check result: ${response.ok ? 'SUCCESS' : `FAILED (${response.status})`}`);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId); // Ensure timeout is cleared on error too
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`${type} API check failed with error:`, errorMessage);
      if (errorMessage.includes('abort')) {
        console.warn(`${type} API check timed out after 5 seconds`);
      } else if (errorMessage.toLowerCase().includes('name not resolved') || errorMessage.toLowerCase().includes('dns')) {
        console.warn(`${type} API DNS resolution failed - DNS issue detected`);
      }
      return false;
    }
  };

  if (generalNetworkOnline) {
    primaryAvailable = await performPing(PING_ENDPOINTS.PRIMARY, 'Primary');
    if (!primaryAvailable) {
      fallbackAvailable = await performPing(PING_ENDPOINTS.FALLBACK, 'Fallback');
    }
  }

  const directIPConfigs = [
    // Ensure these IPs and hostnames are correct for your environment
    { ip: '104.21.36.155', host: new URL(API_BASES.PRIMARY).hostname, name: 'Primary IP Target' }, 
    { ip: '172.67.150.37', host: new URL(API_BASES.FALLBACK).hostname, name: 'Fallback IP Target' } 
  ];
  
  if (!primaryAvailable && !fallbackAvailable && generalNetworkOnline && potentialApiDnsIssue) {
    console.log('Attempting API health check via direct IP addresses due to potential DNS issues...');
    for (const ipConfig of directIPConfigs) {
      const ipUrl = `https://${ipConfig.ip}/ping`;
      const success = await performPing(ipUrl, ipConfig.name, { 'Host': ipConfig.host });
      if (success) {
        ipAvailable = true;
        detailedMessage = `Connected via IP address (${ipConfig.name}: ${ipConfig.ip}). This may indicate DNS resolution problems with standard domains.`;
        break; 
      }
    }
  }
  
  const endTime = performance.now();
  let status: 'online' | 'offline' | 'fallback' | 'unknown';
  
  if (primaryAvailable) {
    status = 'online';
    detailedMessage = detailedMessage || 'Primary API is online.';
  } else if (fallbackAvailable) {
    status = 'fallback';
    detailedMessage = detailedMessage || 'Using backup API server.';
  } else if (ipAvailable) {
    status = 'fallback'; // detailedMessage already set for IP success
  } else {
    status = 'offline';
    // Use diagnostics.error if available, otherwise craft a message
    if (diagnostics.error) {
        detailedMessage = diagnostics.error;
    } else if (!diagnostics.navigatorOnline) {
        detailedMessage = 'Browser reports network is offline.';
    } else if (!diagnostics.connected) {
        detailedMessage = 'Cannot connect to external services. Check firewall or local DNS configuration.';
    } else if (potentialApiDnsIssue) {
        detailedMessage = 'API servers unreachable. Potential DNS resolution problem with API domains.';
    } else {
        detailedMessage = 'API servers are unreachable. Please check your connection or try again later.';
    }
  }
  
  return {
    status,
    primaryAvailable,
    fallbackAvailable, // This reflects domain-based fallback, not IP.
    latencyMs: Math.round(endTime - startTime),
    message: detailedMessage,
    timestamp: new Date().toISOString()
  };
}
