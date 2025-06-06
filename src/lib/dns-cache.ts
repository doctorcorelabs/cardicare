interface DnsCacheEntry {
  ipAddress: string;
  timestamp: number;
  ttl: number; // Time-to-live in milliseconds
}

const DNS_CACHE_KEY = 'dnsResolutionCache';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

class DnsCache {
  private cache: Map<string, DnsCacheEntry>;

  constructor() {
    this.cache = this.loadCacheFromStorage();
    this.cleanupExpiredEntries();
  }

  private loadCacheFromStorage(): Map<string, DnsCacheEntry> {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedCache = localStorage.getItem(DNS_CACHE_KEY);
        if (storedCache) {
          const parsed = JSON.parse(storedCache);
          // Revive Map from plain object
          return new Map(Object.entries(parsed));
        }
      }
    } catch (error) {
      console.error('Error loading DNS cache from localStorage:', error);
    }
    return new Map();
  }

  private saveCacheToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Convert Map to plain object for JSON.stringify
        const plainObjectCache = Object.fromEntries(this.cache);
        localStorage.setItem(DNS_CACHE_KEY, JSON.stringify(plainObjectCache));
      }
    } catch (error) {
      console.error('Error saving DNS cache to localStorage:', error);
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let changed = false;
    for (const [hostname, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(hostname);
        changed = true;
        console.log(`DNS Cache: Removed expired entry for ${hostname}`);
      }
    }
    if (changed) {
      this.saveCacheToStorage();
    }
  }

  public get(hostname: string): string | null {
    this.cleanupExpiredEntries(); // Ensure cache is fresh before get
    const entry = this.cache.get(hostname);
    if (entry && Date.now() < entry.timestamp + entry.ttl) {
      console.log(`DNS Cache: HIT for ${hostname} -> ${entry.ipAddress}`);
      return entry.ipAddress;
    }
    console.log(`DNS Cache: MISS for ${hostname}`);
    return null;
  }

  public set(hostname: string, ipAddress: string, ttl: number = DEFAULT_TTL): void {
    // Basic IP validation (very simple, can be improved)
    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ipAddress) && !/^[a-fA-F0-9:]+$/.test(ipAddress)) {
        console.warn(`DNS Cache: Invalid IP address format for ${hostname}: ${ipAddress}. Not caching.`);
        return;
    }

    const entry: DnsCacheEntry = {
      ipAddress,
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(hostname, entry);
    console.log(`DNS Cache: SET ${hostname} -> ${ipAddress} (TTL: ${ttl}ms)`);
    this.saveCacheToStorage();
  }

  public clear(): void {
    this.cache.clear();
    this.saveCacheToStorage();
    console.log('DNS Cache: Cleared all entries.');
  }

  public remove(hostname: string): void {
    if (this.cache.delete(hostname)) {
      this.saveCacheToStorage();
      console.log(`DNS Cache: Removed entry for ${hostname}`);
    }
  }

  // Periodically cleanup cache (e.g., every minute)
  public startPeriodicCleanup(intervalMs: number = 60 * 1000): void {
    setInterval(() => this.cleanupExpiredEntries(), intervalMs);
    console.log(`DNS Cache: Periodic cleanup started (every ${intervalMs / 1000}s).`);
  }
}

// Singleton instance
const dnsCache = new DnsCache();
// dnsCache.startPeriodicCleanup(); // Optionally start periodic cleanup

export default dnsCache;

// Example: How this might be used (conceptual, actual integration elsewhere)
// async function resolveWithCache(hostname: string): Promise<string | null> {
//   let ip = dnsCache.get(hostname);
//   if (ip) return ip;

//   // If not in cache, perform actual DNS lookup (e.g., via a DoH resolver or rely on system)
//   // This part is complex and might involve a DoH (DNS over HTTPS) client
//   // For now, we'll assume this function is called *after* a successful resolution
//   // and the IP is then put into the cache.

//   // Example: after a successful fetch where IP was somehow determined:
//   // const resolvedIp = "1.2.3.4"; // From DoH or other means
//   // dnsCache.set(hostname, resolvedIp);
//   // return resolvedIp;
//   return null; // Placeholder
// }
