/**
 * Application Entry Point
 * 
 * نقطة دخول التطبيق
 * 
 * @module client/src/main
 */
// Ensure React is loaded first (critical for createContext)
import React from 'react';
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { initializePerformanceMonitoring } from "@/lib/performance";
import { initializeAnalytics } from "@/lib/analytics";
import "./index.css";

if (import.meta.env.DEV) {
  console.log("[main.tsx] Starting application...");
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Initialize analytics (Google Analytics and Sentry)
if (typeof window !== 'undefined') {
  initializeAnalytics({
    googleAnalytics: {
      measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
      enabled: !!import.meta.env.VITE_GA_MEASUREMENT_ID,
    },
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      enabled: !!import.meta.env.VITE_SENTRY_DSN,
    },
  }).catch(err => {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Failed to initialize:', err);
    }
  });
}

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

if (import.meta.env.DEV) {
  console.log("[main.tsx] Creating React root...");
}
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
const root = createRoot(rootElement);

try {
  if (import.meta.env.DEV) {
    console.log("[main.tsx] Attempting to render App...");
  }
  
  root.render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
  
  if (import.meta.env.DEV) {
    console.log("[main.tsx] App rendered successfully");
  }
} catch (error) {
  console.error("[main.tsx] Fatal error rendering app:", error);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 20px; color: red; font-family: monospace; white-space: pre-wrap; background: #f0f0f0; margin: 20px;';
  errorDiv.textContent = `Error: ${error instanceof Error ? error.message : String(error)}\n\nStack:\n${error instanceof Error ? error.stack : ''}`;
  rootElement.appendChild(errorDiv);
  throw error;
}
