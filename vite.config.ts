/**
 * vite.config
 * 
 * @module ./vite.config
 */
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 500,
    minify: "esbuild",
    cssCodeSplit: true,
    reportCompressedSize: false,
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      external: ['@sentry/react'],
      output: {
        manualChunks: (id) => {
          // Split large utility libraries
          if (id.includes("node_modules/lodash")) return "vendor-lodash";
          if (id.includes("node_modules/moment")) return "vendor-moment";
          if (id.includes("node_modules/echarts")) return "vendor-echarts";
          
          // Vendor chunks - React
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }

          // Vendor chunks - UI Library
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-ui";
          }

          // Vendor chunks - Stripe
          if (id.includes("node_modules/stripe")) {
            return "vendor-stripe";
          }

          // Vendor chunks - Charts
          if (id.includes("node_modules/recharts")) {
            return "vendor-charts";
          }

          // Vendor chunks - PDF
          if (id.includes("node_modules/pdfjs") || id.includes("node_modules/pdf")) {
            return "vendor-pdf";
          }

          // Vendor chunks - Date/Time
          if (id.includes("node_modules/date-fns") || id.includes("node_modules/dayjs")) {
            return "vendor-date";
          }

          // Vendor chunks - Form
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/zod")) {
            return "vendor-form";
          }

          // Vendor chunks - HTTP
          if (id.includes("node_modules/axios") || id.includes("node_modules/fetch")) {
            return "vendor-http";
          }

          // Vendor chunks - Other utilities (split into smaller chunks)
          if (id.includes("node_modules")) {
            if (id.includes("node_modules/@")) {
              return "vendor-scoped";
            }
            return "vendor-utils";
          }

          // Page chunks
          if (id.includes("client/src/pages/")) {
            const match = id.match(/pages\/([^/]+)/);
            if (match) {
              return `page-${match[1].replace(".tsx", "")}`;
            }
          }

          // Component chunks
          if (id.includes("client/src/components/")) {
            return "components";
          }

          // Hook chunks
          if (id.includes("client/src/hooks/")) {
            return "hooks";
          }

          // Context chunks
          if (id.includes("client/src/contexts/")) {
            return "contexts";
          }

          // Lib chunks
          if (id.includes("client/src/lib/")) {
            return "lib";
          }
        },
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        compact: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'wouter', 'lucide-react'],
    exclude: ['@vite/client'],
  },
  server: {
    host: true,
    warmup: {
      clientFiles: ['./src/App.tsx', './src/pages/Home.tsx', './src/pages/DeclarationsList.tsx'],
    },
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
      "mp3-app.com",
      "www.mp3-app.com",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
