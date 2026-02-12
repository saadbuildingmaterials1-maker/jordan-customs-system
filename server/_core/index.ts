/**
 * index
 * 
 * @module ./server/_core/index
 */
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { resourceMonitor } from "./resource-monitor";
import { healthChecker } from "./health-check";
import { memoryOptimizer } from "../memory-optimization";
import {
  generalLimiter,
  authLimiter,
  apiLimiter,
  corsOptions,
  helmetOptions,
  suspiciousRequestLogger,
  securityHeaders,
  requestValidation,
  sanitizeInput,
  securityErrorHandler,
  requestLogger,
} from "./security-middleware";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // تفعيل Trust Proxy للعمل مع Rate Limiting
  app.set('trust proxy', 1);
  
  // ========== QUICK HEALTH CHECK FIRST ==========
  // Health check must be first and fast
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // ========== STATIC FILES FIRST ==========
  // يجب أن تأتي الملفات الثابتة قبل middleware الأمان
  // لأن middleware الأمان قد يعدل رؤوس الاستجابة
  if (process.env.NODE_ENV === "development") {
    // في وضع التطوير، سيتم إعداد Vite لاحقاً
  } else {
    serveStatic(app);
  }
  
  // ========== COMPRESSION MIDDLEWARE ==========
  // تفعيل Gzip/Brotli Compression لتقليل حجم الاستجابة
  app.use(compression({
    level: 6, // Balance between speed and compression ratio
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use the filter function from compression module
      return compression.filter(req, res);
    }
  }));
  
  // ========== SECURITY MIDDLEWARE ==========
  // تطبيق Helmet للأمان الشامل
  app.use(helmet(helmetOptions as any));
  
  // تطبيق CORS
  app.use(cors(corsOptions as any));
  
  // تطبيق Rate Limiting العام (قبل logging للأداء)
  app.use(generalLimiter as any);
  
  // تسجيل الطلبات
  app.use(requestLogger);
  
  // إضافة رؤوس الأمان
  app.use(securityHeaders);
  
  // تسجيل الطلبات المريبة
  app.use(suspiciousRequestLogger);
  
  // التحقق من صحة الطلب
  app.use(requestValidation);
  
  // ========== BODY PARSER ==========
  // Configure body parser with optimized size limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  
  // ========== RESPONSE OPTIMIZATION ==========
  // Add response headers for better caching and performance
  app.use((req, res, next) => {
    // Set cache headers for static assets
    if (req.path.startsWith('/assets/')) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Set cache headers for API responses
    else if (req.path.startsWith('/api/')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
  });
  
  // تنظيف البيانات المدخلة
  app.use(sanitizeInput);
  
  // ========== DISABLE UNNECESSARY MONITORING IN PRODUCTION ==========
  const isProduction = process.env.NODE_ENV === "production";
  const resourceMonitorEnabled = !isProduction;
  
  // ========== PERFORMANCE OPTIMIZATION ==========
  // Enable connection keep-alive for better performance
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  
  // Download route MUST be FIRST before any other middleware
  app.get("/api/download/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const downloadUrl = `https://files.manuscdn.com/user_upload_by_module/session_file/310519663107576035/${filename}`;
      
      console.log(`[Download] Fetching: ${downloadUrl}`);
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        return res.status(404).json({ error: "File not found" });
      }
      
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      
      console.log(`[Download] Success: ${filename} (${buffer.byteLength} bytes)`);
      
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(Buffer.from(buffer));
    } catch (error) {
      res.status(500).json({ error: "Download failed" });
    }
  });
  
  // ========== AUTHENTICATION ROUTES ==========
  // تطبيق Rate Limiting للمصادقة
  app.use('/api/oauth', authLimiter as any);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // ========== API ROUTES ==========
  // تطبيق Rate Limiting لـ API
  app.use('/api/trpc', apiLimiter as any);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // ========== HEALTH CHECK ROUTE (ENHANCED) ==========
  // Health check endpoint - simplified for faster response
  app.get("/api/health", (req, res) => {
    // Quick health check without full monitoring
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });

  // Resource stats endpoint (development only)
  if (!isProduction) {
    app.get("/api/stats", (req, res) => {
      const stats = resourceMonitor.getStats();
      const health = healthChecker.performCheck();
      res.json({
        stats,
        health,
      });
    });
  }

  // ========== STATIC FILES & SPA FALLBACK ==========
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // Already called above, skip duplicate
  }
  
  // ========== PERFORMANCE MONITORING ==========
  // Add response time tracking
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000 && resourceMonitorEnabled) {
        console.warn(`[Slow Request] ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    next();
  });


  // ========== ERROR HANDLING ==========
  // معالج الأخطاء الأمنية (يجب أن يأتي بعد جميع المعالجات الأخرى)
  app.use(securityErrorHandler);
  
  // ========== 404 HANDLER ==========
  // Handle 404 errors
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Compression: enabled`);
    console.log(`Keep-Alive: enabled`);
    
    // Start resource monitoring (only in development)
    if (resourceMonitorEnabled) {
      resourceMonitor.start((stats) => {
        // Optional: Send stats to monitoring service
      });
      
      // Start health checks (only in development)
      healthChecker.start((result) => {
        // Optional: Send health status to monitoring service
      });
    }
    
    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("[Server] SIGTERM received, shutting down gracefully...");
      if (resourceMonitorEnabled) resourceMonitor.stop();
      if (resourceMonitorEnabled) healthChecker.stop();
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });
    
    process.on("SIGINT", () => {
      console.log("[Server] SIGINT received, shutting down gracefully...");
      if (resourceMonitorEnabled) resourceMonitor.stop();
      if (resourceMonitorEnabled) healthChecker.stop();
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });
  });
}

startServer().catch(console.error);

// Memory monitoring (only in development)
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  setInterval(() => {
    const mem = memoryOptimizer.monitorMemory();
    if (Number(mem.percent) > 80) {
      console.warn(`⚠️ High memory usage: ${mem.percent}%`);
    }
  }, 30000);
}

