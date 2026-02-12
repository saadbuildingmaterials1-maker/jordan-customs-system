/**
 * Performance Monitoring & Optimization Utilities
 * Handles Web Vitals tracking, Lazy Loading, and performance metrics
 */

import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

// ============================================================================
// Core Web Vitals Tracking
// ============================================================================

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fcb?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

const metrics: PerformanceMetrics = {};

/**
 * Initialize Web Vitals tracking
 * Sends metrics to analytics service (Google Analytics, Sentry, etc.)
 */
export function initializeWebVitals(onMetric?: (metric: PerformanceMetrics) => void) {
  // Largest Contentful Paint
  onLCP((metric) => {
    metrics.lcp = metric.value;
    console.log(`[Performance] LCP: ${metric.value.toFixed(2)}ms`);
    onMetric?.(metrics);
  });

  // First Input Delay (deprecated in web-vitals 5.x, using INP instead)
  // Note: FID is replaced by INP (Interaction to Next Paint) in newer versions

  // Cumulative Layout Shift
  onCLS((metric) => {
    metrics.cls = metric.value;
    console.log(`[Performance] CLS: ${metric.value.toFixed(4)}`);
    onMetric?.(metrics);
  });

  // First Contentful Paint
  onFCP((metric) => {
    metrics.fcb = metric.value;
    console.log(`[Performance] FCP: ${metric.value.toFixed(2)}ms`);
    onMetric?.(metrics);
  });

  // Time to First Byte
  onTTFB((metric) => {
    metrics.ttfb = metric.value;
    console.log(`[Performance] TTFB: ${metric.value.toFixed(2)}ms`);
    onMetric?.(metrics);
  });
}

/**
 * Get current performance metrics
 */
export function getMetrics(): PerformanceMetrics {
  return { ...metrics };
}

// ============================================================================
// Lazy Loading Utilities
// ============================================================================

/**
 * Setup Intersection Observer for lazy loading images
 * Usage: Add data-lazy-src attribute to images
 */
export function setupLazyLoadingImages() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const lazySrc = img.getAttribute('data-lazy-src');
        
        if (lazySrc) {
          img.src = lazySrc;
          img.removeAttribute('data-lazy-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px', // Start loading 50px before image enters viewport
  });

  // Observe all images with data-lazy-src
  document.querySelectorAll('img[data-lazy-src]').forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
}

/**
 * Setup Intersection Observer for lazy loading components
 * Usage: Add data-lazy-component attribute to components
 */
export function setupLazyLoadingComponents() {
  const componentObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        element.classList.add('lazy-loaded');
        observer.unobserve(element);
        
        // Trigger custom event for component initialization
        element.dispatchEvent(new CustomEvent('lazy-load'));
      }
    });
  }, {
    rootMargin: '100px',
  });

  // Observe all components with data-lazy-component
  document.querySelectorAll('[data-lazy-component]').forEach((component) => {
    componentObserver.observe(component);
  });

  return componentObserver;
}

// ============================================================================
// Performance Optimization Utilities
// ============================================================================

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  return result;
}

/**
 * Measure async function execution time
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  return result;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn(...args);
      lastCall = now;
    }
  };
}

/**
 * Request Idle Callback polyfill with fallback
 */
export function requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 0,
    } as IdleDeadline);
  }, 1);
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, type: 'script' | 'style' | 'font') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
  }
  
  document.head.appendChild(link);
}

/**
 * Prefetch resources
 */
export function prefetchResource(href: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize all performance monitoring and optimization
 */
export function initializePerformanceMonitoring() {
  // Initialize Web Vitals tracking
  initializeWebVitals((metrics) => {
    // Send metrics to analytics service
    console.log('[Performance] Metrics updated:', metrics);
  });

  // Setup lazy loading
  setupLazyLoadingImages();
  setupLazyLoadingComponents();

  // Log memory usage periodically (development only)
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const memory = getMemoryUsage();
      if (memory) {
        console.log(
          `[Memory] ${(memory.percentage).toFixed(2)}% (${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB)`
        );
      }
    }, 30000); // Every 30 seconds
  }
}

export default {
  initializePerformanceMonitoring,
  initializeWebVitals,
  setupLazyLoadingImages,
  setupLazyLoadingComponents,
  measurePerformance,
  measurePerformanceAsync,
  debounce,
  throttle,
  requestIdleCallback,
  preloadResource,
  prefetchResource,
  getMemoryUsage,
  getMetrics,
};
