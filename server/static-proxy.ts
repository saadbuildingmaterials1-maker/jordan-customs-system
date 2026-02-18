/**
 * Static File Proxy Server
 * حل متقدم لمشكلة SPA fallback على Cloudflare Pages
 */

import { type Express, type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createReadStream } from "fs";

const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.html': 'text/html; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function getCacheControl(filePath: string): string {
  if (filePath.includes('/assets/')) return 'public, max-age=31536000, immutable';
  if (filePath.endsWith('.html')) return 'public, max-age=3600, must-revalidate';
  if (filePath.endsWith('sw.js')) return 'no-cache, no-store, must-revalidate';
  if (filePath.endsWith('manifest.json')) return 'public, max-age=86400';
  return 'public, max-age=3600';
}

function isStaticAsset(pathname: string): boolean {
  const patterns = ['/assets/', '/fonts/', '/images/', '/icons/', '/downloads/', '/releases/', '/__manus__/', '/sw.js', '/manifest.json', '/robots.txt'];
  if (patterns.some(p => pathname.includes(p))) return true;
  const ext = path.extname(pathname).toLowerCase();
  return Object.keys(MIME_TYPES).includes(ext);
}

export function setupStaticProxy(app: Express, distPath: string) {
  console.log(`[StaticProxy] Initializing with dist path: ${distPath}`);
  
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pathname = req.path || req.url;
      
      if (pathname.startsWith('/api/') || pathname.startsWith('/trpc')) {
        return next();
      }
      
      if (!isStaticAsset(pathname)) {
        return next();
      }
      
      let filePath = path.join(distPath, pathname);
      
      if (!filePath.startsWith(distPath)) {
        console.warn(`[StaticProxy] Security violation: ${pathname}`);
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
          const indexStats = fs.statSync(filePath);
          if (!indexStats.isFile()) {
            return next();
          }
        }
        
        const mimeType = getMimeType(filePath);
        const cacheControl = getCacheControl(filePath);
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', cacheControl);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        console.log(`[StaticProxy] ✅ ${req.method} ${pathname} -> ${mimeType}`);
        
        const stream = createReadStream(filePath);
        stream.pipe(res);
        
        stream.on('error', (error) => {
          console.error(`[StaticProxy] Stream error for ${filePath}:`, error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
        
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          console.log(`[StaticProxy] ❌ File not found: ${pathname}`);
          return res.status(404).json({ error: 'Not Found' });
        }
        
        console.error(`[StaticProxy] Error accessing file ${filePath}:`, error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
    } catch (error) {
      console.error('[StaticProxy] Unexpected error:', error);
      next(error);
    }
  });
}

export function setupSPAFallback(app: Express, distPath: string) {
  console.log('[SPAFallback] Initializing SPA fallback handler');
  
  app.use((req: Request, res: Response, next: NextFunction) => {
    try {
      const pathname = req.path || req.url;
      
      if (pathname.startsWith('/api/') || pathname.startsWith('/trpc')) {
        return next();
      }
      
      if (isStaticAsset(pathname)) {
        return next();
      }
      
      const indexPath = path.join(distPath, 'index.html');
      
      try {
        const indexStats = fs.statSync(indexPath);
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Length', indexStats.size);
        res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        console.log(`[SPAFallback] Serving index.html for ${pathname}`);
        
        const stream = createReadStream(indexPath);
        stream.pipe(res);
        
        stream.on('error', (error) => {
          console.error('[SPAFallback] Stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
        
      } catch (error) {
        console.error('[SPAFallback] Error reading index.html:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
      
    } catch (error) {
      console.error('[SPAFallback] Unexpected error:', error);
      next(error);
    }
  });
}

export default { setupStaticProxy, setupSPAFallback };
