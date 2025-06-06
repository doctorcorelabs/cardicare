/**
 * DNS Resolution Helper Utilities
 * 
 * This module contains utilities to help diagnose and fix DNS resolution issues,
 * which are commonly encountered when accessing Cloudflare Workers.
 */

/**
 * DNS prefetch configuration for critical domains
 */
const CRITICAL_DOMAINS = [
  'heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev',
  'heart-health-ai-assistant.workers.dev',
  'daivanfebrijuansetiya.workers.dev',
  'workers.dev',
  'cloudflare.com'
];

/**
 * Direct IP addresses for API servers (as a last resort)
 * These should be replaced with actual IP addresses of your Cloudflare Workers
 */
export const API_IP_ADDRESSES = [
  '104.21.36.155',  // Example IP - replace with actual IP for your worker
  '172.67.150.37'   // Example IP - replace with actual IP for your worker
];

/**
 * Add DNS prefetch hints to improve DNS resolution speed
 */
export function setupDnsPrefetch(): void {
  if (typeof document === 'undefined') {
    return; // Not in browser environment
  }

  try {
    // Add DNS prefetch for critical domains
    for (const domain of CRITICAL_DOMAINS) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
      
      // Also add preconnect for the main API domain
      if (domain.includes('heart-health-ai-assistant')) {
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = `https://${domain}`;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      }
    }
    
    console.log('DNS prefetch setup completed for critical domains');
  } catch (error) {
    console.warn('Failed to set up DNS prefetch:', error);
  }
}

/**
 * Check if an error appears to be DNS-related
 */
export function isDnsError(error: Error | unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error 
    ? error.message.toLowerCase() 
    : String(error).toLowerCase();
  
  return (
    errorMessage.includes('net::err_name_not_resolved') ||
    errorMessage.includes('net::err_unknown_host') ||
    errorMessage.includes('dns') ||
    errorMessage.includes('name not resolved') ||
    errorMessage.includes('cannot resolve host') ||
    errorMessage.includes('domain name not found')
  );
}

/**
 * Test if a domain is resolvable using fetch with a small timeout
 */
export async function testDomainResolution(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
    
    // Attempt fetch with minimal settings
    await fetch(`https://${domain}/ping`, {
      method: 'HEAD',
      cache: 'no-store',
      mode: 'no-cors',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a URL using direct IP address with proper Host header
 */
export function generateIpBackupUrl(
  path: string = '/chat',
  host: string = 'heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev'
): { url: string; headers: Record<string, string> } {
  // Use the first IP in the list
  const ip = API_IP_ADDRESSES[0];
  
  return {
    url: `https://${ip}${path}`,
    headers: {
      'Host': host
    }
  };
}

/**
 * Add DNS diagnostic info to error messages
 */
export function enhanceErrorWithDnsInfo(error: Error): Error {
  if (isDnsError(error)) {
    error.message = `DNS resolution failed: ${error.message}. Try using a different DNS server (1.1.1.1, 8.8.8.8) or switch to mobile data.`;
  }
  return error;
}
