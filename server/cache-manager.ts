/**
 * مدير التخزين المؤقت
 * يوفر نظام تخزين مؤقت فعال لتحسين الأداء
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageHits: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits = 0;
  private misses = 0;
  private maxEntries = 10000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * تخزين قيمة في الذاكرة المؤقتة
   */
  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const entry: CacheEntry<T> = {
      value,
      expiresAt,
      createdAt: Date.now(),
      hits: 0,
    };

    this.cache.set(key, entry);

    // تنظيف إذا تجاوزنا الحد الأقصى
    if (this.cache.size > this.maxEntries) {
      this.evictLRU();
    }
  }

  /**
   * الحصول على قيمة من الذاكرة المؤقتة
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.misses++;
      return null;
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // تحديث عدد الضربات
    entry.hits++;
    this.hits++;

    return entry.value;
  }

  /**
   * حذف قيمة من الذاكرة المؤقتة
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * التحقق من وجود مفتاح
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * الحصول على قيمة أو تعيينها
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fn();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * مسح جميع المفاتيح التي تطابق نمط
   */
  deletePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * مسح جميع السجلات المنتهية الصلاحية
   */
  cleanup(): number {
    let count = 0;
    const now = Date.now();

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * إزالة أقل العناصر استخداماً (LRU)
   */
  private evictLRU(): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => a.hits - b.hits || a.createdAt - b.createdAt);

    // حذف 10% من العناصر الأقل استخداماً
    const toDelete = Math.ceil(this.maxEntries * 0.1);
    for (let i = 0; i < toDelete && i < entries.length; i++) {
      this.cache.delete(entries[i].key);
    }
  }

  /**
   * بدء تنظيف دوري
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // كل دقيقة
  }

  /**
   * إيقاف التنظيف الدوري
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * مسح الذاكرة المؤقتة بالكامل
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * الحصول على إحصائيات الذاكرة المؤقتة
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;
    const averageHits =
      this.cache.size > 0
        ? Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0) /
          this.cache.size
        : 0;

    return {
      totalEntries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      averageHits,
    };
  }

  /**
   * الحصول على حجم الذاكرة المستخدمة (تقريبي)
   */
  getSize(): number {
    let size = 0;
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      size += key.length + JSON.stringify(entry.value).length;
    }
    return size;
  }
}

export const cacheManager = CacheManager.getInstance();

/**
 * Decorator لتخزين نتائج الدالة في الذاكرة المؤقتة
 */
export function Cacheable(ttlSeconds: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      const cached = cacheManager.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cacheManager.set(cacheKey, result, ttlSeconds);
      return result;
    };

    return descriptor;
  };
}
