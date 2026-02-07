/**
 * أدوات تحسين الأداء
 * 
 * تحتوي على دوال لتحسين الأداء والتحسينات العامة
 */

/**
 * تأخير بسيط
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Debounce - تأخير تنفيذ الدالة
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - تحديد معدل تنفيذ الدالة
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize - تخزين مؤقت للنتائج
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * قياس الأداء
 */
export function measurePerformance(label: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
}

/**
 * تحسين الصور
 */
export function optimizeImage(src: string, width: number, height: number): string {
  // في بيئة الإنتاج، يمكن استخدام خدمة تحسين الصور
  // مثل Cloudinary أو ImageKit
  return src;
}

/**
 * تحميل كسول للصور
 */
export function lazyLoadImage(img: HTMLImageElement) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  } else {
    // Fallback للمتصفحات القديمة
    img.src = img.dataset.src || '';
  }
}

/**
 * تحسين الذاكرة
 */
export function clearMemory() {
  if (window.gc) {
    window.gc();
  }
}

/**
 * تحسين التخزين المؤقت
 */
export const cacheStorage = {
  set: (key: string, value: any, ttl: number = 3600000) => {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  get: (key: string) => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp > parsed.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

/**
 * تحسين الشبكة
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      await delay(1000);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * تحسين الرندرة
 */
export function requestAnimationFrame(callback: FrameRequestCallback) {
  return window.requestAnimationFrame(callback);
}

/**
 * تحسين البحث
 */
export function searchWithHighlight(
  text: string,
  query: string
): { text: string; highlighted: boolean }[] {
  if (!query) {
    return [{ text, highlighted: false }];
  }

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    highlighted: regex.test(part)
  }));
}

/**
 * تحسين الفرز
 */
export function sortByProperty<T>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal, 'ar')
        : bVal.localeCompare(aVal, 'ar');
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
}

/**
 * تحسين التصفية
 */
export function filterByMultipleProperties<T>(
  array: T[],
  filters: Partial<Record<keyof T, any>>
): T[] {
  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      const itemValue = item[key as keyof T];
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(String(value).toLowerCase());
      }
      return itemValue === value;
    });
  });
}

/**
 * تحسين التجميع
 */
export function groupByProperty<T>(
  array: T[],
  property: keyof T
): Map<any, T[]> {
  const grouped = new Map<any, T[]>();
  array.forEach((item) => {
    const key = item[property];
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  return grouped;
}

/**
 * تحسين الترقيم
 */
export function paginate<T>(
  array: T[],
  pageNumber: number,
  pageSize: number
): { items: T[]; total: number; pages: number } {
  const total = array.length;
  const pages = Math.ceil(total / pageSize);
  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: array.slice(start, end),
    total,
    pages
  };
}
