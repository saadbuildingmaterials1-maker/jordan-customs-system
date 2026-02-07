/**
 * asset-handler
 * 
 * @module ./server/_core/asset-handler
 */
import { type Express, type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";

// دالة بسيطة للحصول على نوع MIME
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
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
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".html": "text/html; charset=utf-8",
  };
  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}

/**
 * Middleware متقدم لتقديم الملفات الثابتة والأصول
 * يتعامل مع مشاكل Cloudflare والـ CDN
 */
export function setupAssetHandler(app: Express, distPath: string) {
  // قائمة بامتدادات الملفات الثابتة
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
  ]);

  // Middleware لتقديم الملفات الثابتة مع رؤوس صحيحة
  app.use((req: Request, res: Response, next: NextFunction) => {
    // تخطي طلبات API و tRPC
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc")) {
      return next();
    }

    // الحصول على امتداد الملف
    const ext = path.extname(req.path).toLowerCase();

    // إذا كان الملف من الملفات الثابتة، قدّمه مباشرة
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

        // الحصول على نوع MIME
        const mimeType = getMimeType(ext);

        // تعيين رؤوس HTTP
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Length", stat.size);

        // رؤوس مهمة لـ Cloudflare
        res.setHeader("X-Content-Type-Options", "nosniff");

        // رؤوس الـ Cache
        if (ext === ".html") {
          // لا تخزن ملفات HTML مؤقتاً
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (req.path.includes("/assets/") && ext.match(/\.(js|css)$/)) {
          // خزّن الملفات المجزأة لمدة سنة (لأنها تحتوي على hash)
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          // خزّن الملفات الأخرى لمدة معقولة
          res.setHeader("Cache-Control", "public, max-age=86400");
        }

        // إرسال الملف
        return res.sendFile(filePath);
      }
    }

    // إذا لم يكن ملف ثابت أو لم يكن موجوداً، انتقل إلى الـ middleware التالي
    next();
  });
}

/**
 * Middleware لتقديم index.html للمسارات غير الموجودة (SPA fallback)
 * يجب أن يأتي بعد middleware الملفات الثابتة
 */
export function setupSPAFallback(app: Express, distPath: string) {
  app.use((req: Request, res: Response) => {
    // تخطي طلبات API و tRPC
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc")) {
      return res.status(404).json({ error: "Not found" });
    }

    // تقديم index.html لجميع المسارات الأخرى
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      return res.sendFile(indexPath);
    }

    res.status(404).json({ error: "Not found" });
  });
}
