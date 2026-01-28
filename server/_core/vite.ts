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
    hmr: { server },
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

  // استخدام Vite middleware للملفات
  app.use(vite.middlewares);

  // معالج لـ index.html
  app.get("/", async (req, res, next) => {
    try {
      const clientTemplate = path.join(clientPath, "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // استخدام transformIndexHtml لتحويل الملف بشكل صحيح
      const page = await vite.transformIndexHtml("/", template);
      res.set({ "Content-Type": "text/html; charset=utf-8" }).end(page);
    } catch (e) {
      console.error("[Vite] Error serving index.html:", e);
      vite.ssrFixStacktrace(e as Error);
      res.status(500).send("Internal Server Error");
    }
  });

  // معالج fallback لـ SPA routing
  app.get("*", async (req, res, next) => {
    // تجاهل الملفات الثابتة والملفات ذات الامتدادات
    if (req.path.includes(".") && !req.path.endsWith(".html")) {
      return next();
    }
    
    try {
      const clientTemplate = path.join(clientPath, "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.set({ "Content-Type": "text/html; charset=utf-8" }).end(page);
    } catch (e) {
      console.error("[Vite] Error serving SPA:", e);
      vite.ssrFixStacktrace(e as Error);
      res.status(500).send("Internal Server Error");
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
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
