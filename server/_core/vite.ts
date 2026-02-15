/**
 * vite
 * 
 * @module ./server/_core/vite
 */
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmm: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "mpa",
  });

  // تقديم الملفات من client/public
  const clientPath = path.resolve(import.meta.dirname, "../..", "client");
  app.use(
    express.static(path.join(clientPath, "public"), {
      maxAge: "1h",
      etag: true,
      lastModified: true,
    })
  );

  // معالج لـ index.html (الصفحة الرئيسية)
  app.get("/", async (req, res, next) => {
    try {
      const clientTemplate = path.join(clientPath, "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // استخدام transformIndexHtml لتحويل الملف بشكل صحيح
      const page = await vite.transformIndexHtml("/", template);
      res.set({ "Content-Type": "text/html; charset=utf-8" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      res.status(500).send("Internal Server Error");
    }
  });

  // معالج fallback لـ SPA routing - يجب أن يأتي قبل vite.middlewares
  // حتى يتمكن من إعادة index.html للصفحات الداخلية قبل أن يحاول Vite معالجتها
  app.get("*", async (req, res, next) => {
    // تجاهل طلبات API
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // تجاهل طلبات Vite الخاصة
    if (req.path.startsWith("/@") || req.path.startsWith("/node_modules/") || req.path.startsWith("/src/")) {
      return next();
    }
    
    // تجاهل الملفات ذات الامتدادات المعروفة
    // حتى يتمكن vite.middlewares من معالجتها
    const knownExtensions = /\.(js|jsx|ts|tsx|css|scss|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|map|txt|md|mjs)$/i;
    if (knownExtensions.test(req.path)) {
      return next();
    }
    
    // إعادة index.html للصفحات الداخلية
    try {
      const clientTemplate = path.join(clientPath, "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.set({ "Content-Type": "text/html; charset=utf-8" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      res.status(500).send("Internal Server Error");
    }
  });

  // استخدام Vite middleware للملفات (بعد معالج SPA)
  app.use(vite.middlewares);
}
export function serveStatic(app: Express) {
  // محاولة المسارات المختلفة للعثور على dist/public
  const possiblePaths = [
    // المسار في الحاوية (Manus)
    path.resolve("/usr/src/dist/public"),
    // المسار المحلي أثناء التطوير
    path.resolve(import.meta.dirname, "../..", "dist", "public"),
    // المسار البديل
    path.resolve(process.cwd(), "dist", "public"),
  ];
  
  let distPath = "";
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      console.log(`[serveStatic] Found dist at: ${distPath}`);
      break;
    }
  }
  
  if (!distPath) {
    const errorMsg = `Could not find the build directory in any of these locations: ${possiblePaths.join(", ")}. Make sure to build the client first.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // استخدام express.static مع خيارات محسّنة
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        // لا تخزن ملفات HTML مؤقتاً
        if (ext === ".html") {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
          res.setHeader("Pragma", "no-cache");
        }
        // خزّن الملفات المجزأة لمدة طويلة
        else if (filePath.match(/\.[a-f0-9]{8}\.(js|css)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        // رؤوس مهمة لـ Cloudflare
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    })
  );

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
