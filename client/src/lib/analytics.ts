/**
 * Analytics Integration Utility
 * Handles Google Analytics and Sentry integration
 */

// ============================================================================
// Google Analytics Integration
// ============================================================================

export interface GoogleAnalyticsConfig {
  measurementId: string;
  enabled?: boolean;
}

let gaConfig: GoogleAnalyticsConfig | null = null;

/**
 * Initialize Google Analytics
 */
export function initializeGoogleAnalytics(config: GoogleAnalyticsConfig) {
  if (!config.enabled && config.enabled !== undefined) {
    console.log('[Analytics] Google Analytics disabled');
    return;
  }

  gaConfig = config;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  
  gtag('js', new Date());
  gtag('config', config.measurementId, {
    'page_path': window.location.pathname,
    'anonymize_ip': true,
  });

  console.log('[Analytics] Google Analytics initialized');
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!gaConfig) return;

  if (typeof gtag !== 'undefined') {
    gtag('config', gaConfig.measurementId, {
      'page_path': path,
      'page_title': title || document.title,
    });
  }
}

/**
 * Track event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!gaConfig) return;

  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventParams);
  }

  console.log(`[Analytics] Event tracked: ${eventName}`, eventParams);
}

/**
 * Track performance metrics
 */
export function trackPerformanceMetrics(metrics: Record<string, number>) {
  Object.entries(metrics).forEach(([name, value]) => {
    trackEvent('performance_metric', {
      metric_name: name,
      metric_value: value,
    });
  });
}

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, any>) {
  trackEvent('exception', {
    description: error.message,
    fatal: false,
    ...context,
  });

  console.error('[Analytics] Error tracked:', error, context);
}

// ============================================================================
// Sentry Integration
// ============================================================================

export interface SentryConfig {
  dsn: string;
  environment?: string;
  tracesSampleRate?: number;
  enabled?: boolean;
}

let sentryConfig: SentryConfig | null = null;

/**
 * Initialize Sentry for error tracking
 */
export async function initializeSentry(config: SentryConfig) {
  if (!config.enabled && config.enabled !== undefined) {
    console.log('[Sentry] Sentry disabled');
    return;
  }

  sentryConfig = config;

  try {
    // Sentry is optional - only initialize if DSN is provided
    if (!config.dsn) {
      console.log('[Sentry] Sentry DSN not configured');
      return;
    }

    // Try to initialize Sentry if available
    try {
      const Sentry = await import('@sentry/react');
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment || 'production',
        tracesSampleRate: config.tracesSampleRate || 1.0,
      });
      console.log('[Sentry] Sentry initialized');
    } catch (importError) {
      console.warn('[Sentry] @sentry/react not available, skipping initialization');
    }
  } catch (error) {
    console.warn('[Sentry] Failed to initialize Sentry:', error);
  }
}

/**
 * Capture exception in Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryConfig) return;

  try {
    // Only try to capture if Sentry is available
    if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
      const Sentry = (window as any).__SENTRY__;
      if (Sentry.captureException) {
        Sentry.captureException(error, { contexts: { custom: context } });
      }
    }
  } catch (e) {
    // Silently fail if Sentry is not available
  }

  console.error('[Sentry] Exception captured:', error, context);
}

/**
 * Capture message in Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryConfig) return;

  try {
    // Only try to capture if Sentry is available
    if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
      const Sentry = (window as any).__SENTRY__;
      if (Sentry.captureMessage) {
        Sentry.captureMessage(message, level);
      }
    }
  } catch (e) {
    // Silently fail if Sentry is not available
  }

  console.log(`[Sentry] Message captured (${level}):`, message);
}

/**
 * Set user context in Sentry
 */
export function setSentryUser(userId: string, email?: string, username?: string) {
  if (!sentryConfig) return;

  try {
    // Only try to set user if Sentry is available
    if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
      const Sentry = (window as any).__SENTRY__;
      if (Sentry.setUser) {
        Sentry.setUser({
          id: userId,
          email,
          username,
        });
      }
    }
  } catch (e) {
    // Silently fail if Sentry is not available
  }
}

/**
 * Clear user context in Sentry
 */
export function clearSentryUser() {
  if (!sentryConfig) return;

  try {
    // Only try to clear user if Sentry is available
    if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
      const Sentry = (window as any).__SENTRY__;
      if (Sentry.setUser) {
        Sentry.setUser(null);
      }
    }
  } catch (e) {
    // Silently fail if Sentry is not available
  }
}

// ============================================================================
// Global Error Handler
// ============================================================================

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);
    
    trackError(error, {
      type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    captureException(error, {
      type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));

    trackError(error, {
      type: 'unhandled_rejection',
    });

    captureException(error, {
      type: 'unhandled_rejection',
    });
  });

  console.log('[Analytics] Global error handlers initialized');
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize all analytics services
 */
export async function initializeAnalytics(options: {
  googleAnalytics?: GoogleAnalyticsConfig;
  sentry?: SentryConfig;
}) {
  if (options.googleAnalytics) {
    initializeGoogleAnalytics(options.googleAnalytics);
  }

  if (options.sentry) {
    await initializeSentry(options.sentry);
  }

  setupGlobalErrorHandlers();
}

export default {
  initializeGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackPerformanceMetrics,
  trackError,
  initializeSentry,
  captureException,
  captureMessage,
  setSentryUser,
  clearSentryUser,
  setupGlobalErrorHandlers,
  initializeAnalytics,
};
