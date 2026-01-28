import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";

/**
 * Middleware محسّن لتقديم الملفات الثابتة مع رؤوس HTTP صحيحة
 */
export function setupStaticFilesHandler(app: Express, distPath: string) {
  // تحديد أنواع الملفات والرؤوس المناسبة لها
  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".map": "application/json",
  };

  // Middleware لتقديم الملفات الثابتة مع رؤوس مخصصة
  app.use((req: Request, res: Response, next: NextFunction) => {
    // تخطي الطلبات غير المتعلقة بالملفات الثابتة
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc")) {
      return next();
    }

    // الحصول على مسار الملف
    const filePath = path.join(distPath, req.path);
    
    // التحقق من أن المسار آمن (لا يحتوي على ..)
    if (!filePath.startsWith(distPath)) {
      return next();
    }

    // محاولة الوصول إلى الملف
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      
      // إذا كان المسار مجلداً، تخطي
      if (stat.isDirectory()) {
        return next();
      }

      // الحصول على امتداد الملف
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = mimeTypes[ext] || "application/octet-stream";

      // تعيين رؤوس HTTP المناسبة
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", stat.size);

      // رؤوس الـ Cache للملفات الثابتة
      if (ext === ".html") {
        // لا تخزن ملفات HTML مؤقتاً
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      } else if (ext === ".js" || ext === ".css" || ext === ".woff" || ext === ".woff2") {
        // خزّن الملفات المجزأة لمدة سنة واحدة
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        // خزّن الملفات الأخرى لمدة شهر
        res.setHeader("Cache-Control", "public, max-age=2592000");
      }

      // رؤوس الأمان
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-XSS-Protection", "1; mode=block");

      // إرسال الملف
      return res.sendFile(filePath);
    }

    // إذا لم يكن الملف موجوداً، انتقل إلى الـ middleware التالي
    next();
  });

  // Middleware لتقديم index.html للمسارات غير الموجودة (SPA fallback)
  app.use((req: Request, res: Response) => {
    // تخطي طلبات API
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc")) {
      return res.status(404).json({ error: "Not found" });
    }

    // تقديم index.html لجميع المسارات الأخرى
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      return res.sendFile(indexPath);
    }

    res.status(404).json({ error: "Not found" });
  });
}
