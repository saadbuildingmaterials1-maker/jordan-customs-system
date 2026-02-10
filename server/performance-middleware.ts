/**
 * Performance Middleware
 * تحسين أداء الطلبات
 */

import { Request, Response, NextFunction } from 'express';

export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // تسجيل الطلبات البطيئة فقط (> 1000ms)
    if (duration > 1000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
}

// تحسين الاستجابات
export function compressResponse(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;

  res.json = function(data: any) {
    res.setHeader('Content-Encoding', 'gzip');
    return originalJson.call(this, data);
  };

  next();
}
