/**
 * performance-optimization Core
 * أداة أساسية
 * @module ./server/_core/performance-optimization
 */
import compression from 'compression';
import { Express } from 'express';

/**
 * تحسينات الأداء الشاملة
 */
export function setupPerformanceOptimizations(app: Express) {
  // 1. Compression - ضغط الاستجابات
  app.use(compression({
    level: 6,
    threshold: 1024,
  }));

  // 2. Caching Headers - رؤوس التخزين المؤقت
  app.use((req, res, next) => {
    if (req.path.startsWith('/assets/')) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.path.startsWith('/api/')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=3600');
    }
    next();
  });

  // 3. ETag - للتحقق من تغيير المحتوى
  app.set('etag', 'strong');

  // 4. Keep-Alive - الحفاظ على الاتصالات
  app.use((req, res, next) => {
    res.set('Connection', 'keep-alive');
    res.set('Keep-Alive', 'timeout=5, max=100');
    next();
  });

  // 5. Security Headers - رؤوس الأمان
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    next();
  });

  console.log('[Performance] Optimizations enabled:');
  console.log('  ✓ Compression (gzip)');
  console.log('  ✓ Caching headers');
  console.log('  ✓ ETag support');
  console.log('  ✓ Keep-Alive connections');
  console.log('  ✓ Security headers');
}

/**
 * مراقبة الأداء
 */
export function setupPerformanceMonitoring(app: Express) {
  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      const method = req.method;
      const path = req.path;

      if (duration > 1000) {
        console.warn(`[Slow Request] ${method} ${path} - ${duration}ms`);
      }

      if (status >= 400) {
        console.error(`[Error] ${method} ${path} - ${status} (${duration}ms)`);
      }
    });

    next();
  });

  console.log('[Performance] Monitoring enabled');
}

/**
 * إحصائيات الأداء
 */
export interface PerformanceStats {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowRequestCount: number;
}

let stats: PerformanceStats = {
  requestCount: 0,
  errorCount: 0,
  averageResponseTime: 0,
  slowRequestCount: 0,
};

export function getPerformanceStats(): PerformanceStats {
  return stats;
}

export function recordRequest(duration: number, status: number) {
  stats.requestCount++;
  stats.averageResponseTime =
    (stats.averageResponseTime * (stats.requestCount - 1) + duration) / stats.requestCount;

  if (status >= 400) {
    stats.errorCount++;
  }

  if (duration > 1000) {
    stats.slowRequestCount++;
  }
}
