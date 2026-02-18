/**
 * خدمة Rate Limiting
 * تحد من عدد الطلبات من نفس المستخدم
 */

import { RateLimitError } from './error-handler';

interface RateLimitConfig {
  windowMs: number; // مدة النافذة بالميلي ثانية
  maxRequests: number; // الحد الأقصى للطلبات
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static requests = new Map<string, RequestRecord>();
  private static defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000, // دقيقة واحدة
    maxRequests: 100,
  };

  /**
   * التحقق من حد الطلبات
   */
  static checkLimit(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
  ): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();

    let record = this.requests.get(identifier);

    // إنشاء سجل جديد إذا لم يكن موجوداً
    if (!record) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + finalConfig.windowMs,
      });
      return;
    }

    // إعادة تعيين إذا انتهت النافذة
    if (now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + finalConfig.windowMs,
      });
      return;
    }

    // زيادة العداد
    record.count++;

    // التحقق من تجاوز الحد
    if (record.count > finalConfig.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      throw new RateLimitError(
        `تم تجاوز حد الطلبات. حاول مرة أخرى بعد ${retryAfter} ثانية`,
        retryAfter
      );
    }
  }

  /**
   * إعادة تعيين الحد للمستخدم
   */
  static reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * الحصول على معلومات الحد الحالية
   */
  static getInfo(identifier: string): {
    remaining: number;
    resetTime: Date;
  } | null {
    const record = this.requests.get(identifier);
    if (!record) return null;

    return {
      remaining: Math.max(0, this.defaultConfig.maxRequests - record.count),
      resetTime: new Date(record.resetTime),
    };
  }

  /**
   * تنظيف السجلات القديمة
   */
  static cleanup(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    this.requests.forEach((value, key) => {
      if (now > value.resetTime) {
        entriesToDelete.push(key);
      }
    });

    entriesToDelete.forEach((key) => this.requests.delete(key));
  }
}

/**
 * Middleware لـ Express
 */
export const rateLimitMiddleware = (config?: Partial<RateLimitConfig>) => {
  return (req: any, res: any, next: any) => {
    try {
      const identifier = req.user?.id || req.ip;
      RateLimiter.checkLimit(identifier, config);
      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({
          error: error.message,
          retryAfter: error.retryAfter,
        });
      } else {
        next(error);
      }
    }
  };
};

// تنظيف دوري للسجلات القديمة (كل ساعة)
setInterval(() => {
  RateLimiter.cleanup();
}, 60 * 60 * 1000);
