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
import { setupStaticProxy, setupSPAFallback } from "../static-proxy";

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
  app.use(vite.middlewares);
  app.use(express.static(path.join(clientPath, "public")));
  // SPA fallback
  app.use("*", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.sendFile(path.resolve(clientPath, "index.html"));
  });
}

export function serveStatic(app: Express) {
  // محاولة المسارات المختلفة للعثور على dist
  const possiblePaths = [
    // المسار الأساسي: المشروع الحالي
    path.resolve(process.cwd(), "dist"),
    // المسار في الحاوية (Manus)
    path.resolve("/usr/src/dist"),
    // المسار المحلي أثناء التطوير
    path.resolve(import.meta.dirname, "../..", "dist"),
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

  // استخدام Static Proxy بدلاً من express.static
  console.log('[serveStatic] Using Static Proxy for serving files');
  setupStaticProxy(app, distPath);
  setupSPAFallback(app, distPath);
}
