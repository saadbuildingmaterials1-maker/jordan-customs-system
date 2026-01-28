import { type Express, type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";

/**
 * Middleware لمعالجة مشكلة Cloudflare مع SPA
 * يضيف رؤوس HTTP صحيحة لتمييز الملفات الثابتة عن صفحات SPA
 */
export function setupCloudflareHandler(app: Express, distPath: string) {
  // قائمة بامتدادات الملفات الثابتة التي لا تحتاج إلى SPA fallback
  const staticExtensions = new Set([
    ".js",
    ".mjs",
    ".css",
    ".json",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".map",
    ".txt",
    ".xml",
    ".webmanifest",
    ".md",
    ".pdf",
    ".zip",
    ".tar",
    ".gz",
  ]);

  // Middleware لتقديم الملفات الثابتة مع رؤوس Cloudflare صحيحة
  app.use((req: Request, res: Response, next: NextFunction) => {
    // تخطي طلبات API و tRPC
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc")) {
      return next();
    }

    // الحصول على امتداد الملف
    const ext = path.extname(req.path).toLowerCase();

    // إذا كان الملف من الملفات الثابتة
    if (staticExtensions.has(ext)) {
      const filePath = path.join(distPath, req.path);

      // التحقق من الأمان
      if (!filePath.startsWith(distPath)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // التحقق من وجود الملف
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);

        // إذا كان مجلداً، تخطي
        if (stat.isDirectory()) {
          return next();
        }

        // رؤوس مهمة لـ Cloudflare
        // هذه الرؤوس تخبر Cloudflare بأن هذا ملف ثابت وليس صفحة SPA
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("X-Content-Type-Options", "nosniff");
        
        // رؤوس إضافية لتحسين الأداء
        res.setHeader("ETag", `"${stat.mtime.getTime()}-${stat.size}"`);
        res.setHeader("Last-Modified", stat.mtime.toUTCString());

        // إرسال الملف
        return res.sendFile(filePath);
      } else {
        // إذا كان الملف غير موجود، أرجع 404 بدلاً من 200
        // هذا يخبر Cloudflare بأن هذا ليس ملف ثابت
        return res.status(404).json({ error: "Not found" });
      }
    }

    // إذا لم يكن ملف ثابت، انتقل إلى الـ middleware التالي
    next();
  });
}

/**
 * Middleware لتقديم index.html للمسارات غير الموجودة (SPA fallback)
 * يجب أن يأتي بعد middleware الملفات الثابتة
 */
export function setupSPAFallbackWithCloudflare(app: Express, distPath: string) {
  app.use((req: Request, res: Response) => {
    // تخطي طلبات API و tRPC
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc")) {
      return res.status(404).json({ error: "Not found" });
    }

    // تقديم index.html لجميع المسارات الأخرى
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      // رؤوس مهمة لـ SPA
      // لا تخزن index.html مؤقتاً
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      
      // رؤوس إضافية للتوافق مع Cloudflare
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      
      return res.sendFile(indexPath);
    }

    res.status(404).json({ error: "Not found" });
  });
}
