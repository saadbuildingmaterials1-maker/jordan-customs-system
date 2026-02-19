import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
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

  // Vite middleware MUST come first to handle source file transformations
  app.use(vite.middlewares);
  
  // Serve static files from client/public directory
  const publicPath = path.resolve(import.meta.dirname, "../..", "client", "public");
  app.use(express.static(publicPath));
  
  // Fallback to index.html for client-side routing (but NOT for source files)
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip if this is an API route, Vite internal, or file with extension
    // Improved: match actual file extensions instead of any dot
    if (
      url.startsWith("/api/") || 
      url.startsWith("/@") ||
      url.startsWith("/__manus__/") ||
      url.match(/\.(js|jsx|ts|tsx|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|mp4|webm|pdf|txt|html)$/)
    ) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // Read index.html and let Vite transform it
      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // Vite will automatically handle module transformation in development mode
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

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
