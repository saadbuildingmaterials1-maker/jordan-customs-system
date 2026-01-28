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
    appType: "custom",
  });

  // في وضع التطوير، نستخدم express.static أولاً لتقديم الملفات الثابتة
  // ثم Vite middleware للملفات الأخرى
  const distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  
  // تقديم الملفات الثابتة من dist/public
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
      },
    })
  );

  // ثم استخدم Vite middleware للملفات الأخرى
  app.use(vite.middlewares);

  // Fallback to index.html for SPA routing
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
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
