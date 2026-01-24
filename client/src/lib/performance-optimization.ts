// تحسينات الأداء للتطبيق

/**
 * قياس أداء العملية
 */
export function measurePerformance(label: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
}

/**
 * تأخير العملية (Debounce)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * تقليل العمليات (Throttle)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * تحميل الموارد بشكل كسول (Lazy Loading)
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          image.src = src;
          observer.unobserve(image);
        }
      });
    });
    observer.observe(img);
  } else {
    img.src = src;
  }

  if (placeholder) {
    img.src = placeholder;
  }
}

/**
 * قياس Web Vitals
 */
export function measureWebVitals() {
  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('[Web Vitals] LCP:', lastEntry.renderTime || lastEntry.loadTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('[Web Vitals] FID:', entry.processingDuration);
    });
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('[Web Vitals] CLS:', clsValue);
      }
    });
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

/**
 * تخزين مؤقت للبيانات (Memoization)
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * تحسين استهلاك الذاكرة
 */
export function optimizeMemory() {
  // تنظيف الذاكرة غير المستخدمة
  const perfMemory = (performance as any).memory;
  if (perfMemory) {
    console.log('[Memory]', {
      usedJSHeapSize: `${(perfMemory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(perfMemory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(perfMemory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
}

/**
 * تحديد الموارد الثقيلة
 */
export function identifyHeavyResources() {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const heavyResources = resources
    .filter((r) => r.duration > 1000)
    .sort((a, b) => b.duration - a.duration);

  console.log('[Heavy Resources]', heavyResources.slice(0, 10));
}

/**
 * تقرير الأداء الشامل
 */
export function generatePerformanceReport() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,
  };
}
