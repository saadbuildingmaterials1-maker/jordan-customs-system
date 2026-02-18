import { CORS_ORIGINS } from '../config/urls';
/**
 * Security Middleware
 * يوفر حماية شاملة ضد الهجمات والاستخدام غير المصرح
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Rate Limiter العام
 * يحد من عدد الطلبات من نفس IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب
  message: 'عدد كبير جداً من الطلبات من هذا العنوان، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // تخطي جميع الطلبات في بيئة التطوير
    return process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate Limiter للمصادقة
 * حماية أقوى ضد محاولات كسر كلمات المرور
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // حد أقصى 5 محاولات
  message: 'عدد كبير جداً من محاولات المصادقة، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // لا تحسب المحاولات الناجحة
});

/**
 * Rate Limiter لـ API
 * حماية معتدلة للعمليات الحساسة
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 300, // حد أقصى 300 طلب
  message: 'عدد كبير جداً من طلبات API، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للتحميل
 * حماية ضد تحميل الملفات الكبيرة
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 10, // حد أقصى 10 تحميلات
  message: 'عدد كبير جداً من محاولات التحميل، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * إعدادات CORS الآمنة
 */
export const corsOptions: any = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      CORS_ORIGINS[0],
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
      // السماح بجميع النطاقات في بيئة التطوير
      ...(process.env.NODE_ENV === 'development' ? ['*'] : []),
    ].filter(Boolean);

    // في بيئة التطوير، السماح بجميع الأصول
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 ساعة
};

/**
 * إعدادات Helmet للأمان
 */
export const helmetOptions: any = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://manus-analytics.com', 'https://www.googletagmanager.com', 'https://www.google-analytics.com', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https:', 'wss:', 'https://manus-analytics.com', 'https://www.googletagmanager.com', 'https://www.google-analytics.com', 'blob:', 'http://localhost:*'],
      workerSrc: ["'self'", 'blob:', 'http://localhost:*'],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000, // سنة واحدة
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: 'strict-origin-when-cross-origin',
};

/**
 * Middleware لتسجيل الطلبات المريبة
 */
export const suspiciousRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  // تسجيل الطلبات بدون User-Agent
  if (!req.get('user-agent')) {
    console.warn(`[Security] Request without User-Agent from ${req.ip}`);
  }

  // تسجيل الطلبات بدون Referer من عمليات POST
  if (req.method === 'POST' && !req.get('referer')) {
    console.warn(`[Security] POST request without Referer from ${req.ip}`);
  }

  // تسجيل الطلبات بحجم كبير جداً
  if (req.get('content-length') && parseInt(req.get('content-length') || '0') > 50 * 1024 * 1024) {
    console.warn(`[Security] Large request (${req.get('content-length')} bytes) from ${req.ip}`);
  }

  next();
};

/**
 * Middleware لإضافة رؤوس الأمان الإضافية
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // منع تخزين البيانات الحساسة
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // منع MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // تفعيل XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // منع Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // تفعيل HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

/**
 * Middleware للتحقق من صحة الطلب
 */
export const requestValidation = (req: Request, res: Response, next: NextFunction) => {
  // التحقق من أن Content-Type صحيح
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      console.warn(`[Security] Invalid Content-Type: ${contentType} from ${req.ip}`);
    }
  }

  next();
};

/**
 * Middleware لتنظيف البيانات المدخلة
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // تنظيف الـ query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      if (typeof value === 'string') {
        // إزالة الأحرف الخطرة
        req.query[key] = value
          .replace(/[<>\"'`]/g, '')
          .substring(0, 1000); // حد أقصى 1000 حرف
      }
    });
  }

  // تنظيف الـ body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      if (typeof obj === 'string') {
        return obj.replace(/[<>\"'`]/g, '').substring(0, 10000);
      }
      return obj;
    };
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Middleware لمعالجة الأخطاء الأمنية
 */
export const securityErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    console.warn(`[Security] CORS violation from ${req.ip}: ${req.get('origin')}`);
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  if (err.status === 429) {
    console.warn(`[Security] Rate limit exceeded for ${req.ip}`);
    return res.status(429).json({ error: 'Too many requests' });
  }

  next(err);
};

/**
 * Middleware لتسجيل جميع الطلبات
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path;
    const ip = req.ip;

    // تسجيل الطلبات الفاشلة فقط في الإنتاج
    if (process.env.NODE_ENV === 'production' && statusCode >= 400) {
      console.log(`[Request] ${method} ${path} - ${statusCode} (${duration}ms) from ${ip}`);
    }
  });

  next();
};
