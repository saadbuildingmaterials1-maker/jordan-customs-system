/**
 * Performance Cache Service
 * تحسين الأداء من خلال التخزين المؤقت الذكي
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxEntries = 1000;

  set<T>(key: string, value: T, ttl: number = 3600000): void {
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      entries: this.cache.size,
      maxEntries: this.maxEntries,
    };
  }
}

export const performanceCache = new PerformanceCache();
