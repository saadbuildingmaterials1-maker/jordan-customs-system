/**
 * Memory Optimization Service
 * تحسين استخدام الذاكرة والموارد
 */

export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private cacheSize = 0;
  private maxCacheSize = 50 * 1024 * 1024; // 50MB

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  // تنظيف الذاكرة بشكل دوري
  cleanupMemory() {
    if (global.gc) {
      global.gc();
    }
  }

  // مراقبة استخدام الذاكرة
  monitorMemory() {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (heapUsedPercent > 85) {
      this.cleanupMemory();
    }

    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      percent: heapUsedPercent.toFixed(2),
    };
  }

  // تحسين الاستعلامات من قاعدة البيانات
  optimizeQuery(query: string) {
    // إضافة LIMIT افتراضي
    if (!query.toUpperCase().includes('LIMIT')) {
      query += ' LIMIT 1000';
    }
    return query;
  }

  // تخزين مؤقت ذكي
  smartCache<T>(key: string, value: T, ttl: number = 3600000): T {
    this.cacheSize += JSON.stringify(value).length;
    
    if (this.cacheSize > this.maxCacheSize) {
      this.cleanupMemory();
      this.cacheSize = 0;
    }

    return value;
  }
}

export const memoryOptimizer = MemoryOptimizer.getInstance();
