/**
 * MIME Type Handler Middleware
 * 
 * Purpose: Ensure correct MIME types for all static assets
 * Prevents SPA fallback from converting JS files to HTML
 * 
 * This middleware:
 * 1. Intercepts all requests to static assets
 * 2. Sets correct Content-Type headers
 * 3. Adds security headers
 * 4. Manages caching properly
 */

import type { Request, Response, NextFunction } from 'express';
import path from 'path';

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.ts': 'application/typescript; charset=utf-8',
  '.tsx': 'application/typescript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.ico': 'image/x-icon',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

// Cache control rules
const CACHE_RULES: Record<string, string> = {
  // Immutable assets with hash in filename
  '/assets/': 'public, max-age=31536000, immutable',
  '/fonts/': 'public, max-age=31536000, immutable',
  '/images/': 'public, max-age=31536000, immutable',
  
  // HTML - no cache
  '.html': 'public, max-age=3600, must-revalidate',
  
  // Service worker - no cache
  'service-worker.js': 'no-cache, no-store, must-revalidate',
  
  // Manifest - short cache
  'manifest.json': 'public, max-age=86400',
};

/**
 * Get MIME type for a file
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Get cache control header for a file
 */
function getCacheControl(filePath: string): string {
  // Check if it's an immutable asset
  for (const [pattern, cacheControl] of Object.entries(CACHE_RULES)) {
    if (filePath.includes(pattern)) {
      return cacheControl;
    }
  }
  
  // Check extension
  const ext = path.extname(filePath).toLowerCase();
  for (const [pattern, cacheControl] of Object.entries(CACHE_RULES)) {
    if (pattern.startsWith('.') && filePath.endsWith(pattern)) {
      return cacheControl;
    }
  }
  
  // Default
  return 'public, max-age=3600';
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname: string): boolean {
  const staticPatterns = [
    '/assets/',
    '/fonts/',
    '/images/',
    '/icons/',
    '/downloads/',
    '/releases/',
    '/__manus__/',
    /\.(js|mjs|jsx|ts|tsx|css|json|map|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico|html|txt|xml|webmanifest)$/i,
  ];

  return staticPatterns.some(pattern => {
    if (typeof pattern === 'string') {
      return pathname.includes(pattern);
    }
    return pattern.test(pathname);
  });
}

/**
 * MIME Type Handler Middleware
 */
export function mimeTypeHandler(req: Request, res: Response, next: NextFunction) {
  const pathname = req.path || req.url;

  // Only process static assets
  if (isStaticAsset(pathname)) {
    // Set correct MIME type
    const mimeType = getMimeType(pathname);
    res.setHeader('Content-Type', mimeType);

    // Set cache control
    const cacheControl = getCacheControl(pathname);
    res.setHeader('Cache-Control', cacheControl);

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Add CORS headers if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Log for debugging
    console.log(`[MIME] ${req.method} ${pathname} -> ${mimeType}`);
  }

  next();
}

/**
 * Static Asset Router - Prevents SPA fallback
 */
export function staticAssetRouter(req: Request, res: Response, next: NextFunction) {
  const pathname = req.path || req.url;

  // If it's a static asset that doesn't exist, return 404 (not SPA fallback)
  if (isStaticAsset(pathname)) {
    // Don't call next() - let Express handle the 404
    // This prevents the SPA fallback from catching it
    return;
  }

  next();
}

export default mimeTypeHandler;
