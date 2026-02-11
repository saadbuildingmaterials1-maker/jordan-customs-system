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
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { resourceMonitor } from "./resource-monitor";
import { healthChecker } from "./health-check";
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
  
  // ========== STATIC FILES FIRST ==========
  // يجب أن تأتي الملفات الثابتة قبل middleware الأمان
  // لأن middleware الأمان قد يعدل رؤوس الاستجابة
  if (process.env.NODE_ENV === "development") {
    // في وضع التطوير، سيتم إعداد Vite لاحقاً
  } else {
    serveStatic(app);
  }
  
  // ========== SECURITY MIDDLEWARE ==========
  // تطبيق Helmet للأمان الشامل
  app.use(helmet(helmetOptions as any));
  
  // تطبيق CORS
  app.use(cors(corsOptions as any));
  
  // تسجيل الطلبات
  app.use(requestLogger);
  
  // إضافة رؤوس الأمان
  app.use(securityHeaders);
  
  // تسجيل الطلبات المريبة
  app.use(suspiciousRequestLogger);
  
  // التحقق من صحة الطلب
  app.use(requestValidation);
  
  // تطبيق Rate Limiting العام
  app.use(generalLimiter as any);
  
  // ========== BODY PARSER ==========
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // تنظيف البيانات المدخلة
  app.use(sanitizeInput);
  
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
  
  // ========== HEALTH CHECK ROUTE ==========
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    const health = healthChecker.performCheck();
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 202 : 503;
    res.status(statusCode).json(health);
  });

  // Resource stats endpoint
  app.get("/api/stats", (req, res) => {
    const stats = resourceMonitor.getStats();
    const health = healthChecker.performCheck();
    res.json({
      stats,
      health,
    });
  });

  // ========== STATIC FILES & SPA FALLBACK ==========
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }


  // ========== ERROR HANDLING ==========
  // معالج الأخطاء الأمنية (يجب أن يأتي بعد جميع المعالجات الأخرى)
  app.use(securityErrorHandler);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Start resource monitoring
    resourceMonitor.start((stats) => {
      // Optional: Send stats to monitoring service
    });
    
    // Start health checks
    healthChecker.start((result) => {
      // Optional: Send health status to monitoring service
    });
    
    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("[Server] SIGTERM received, shutting down gracefully...");
      resourceMonitor.stop();
      healthChecker.stop();
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });
    
    process.on("SIGINT", () => {
      console.log("[Server] SIGINT received, shutting down gracefully...");
      resourceMonitor.stop();
      healthChecker.stop();
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });
  });
}

startServer().catch(console.error);

// Memory monitoring
import { memoryOptimizer } from '../memory-optimization';
setInterval(() => {
  const mem = memoryOptimizer.monitorMemory();
  if (Number(mem.percent) > 80) {
    console.warn(`⚠️ High memory usage: ${mem.percent}%`);
  }
}, 30000);
