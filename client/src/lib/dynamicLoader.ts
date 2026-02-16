/**
 * محمل ديناميكي متقدم للملفات مع معالجة الأخطاء والإعادة التلقائية
 */

interface LoadOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 ثانية
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 ثانية

/**
 * تحميل ملف JavaScript ديناميكياً مع معالجة الأخطاء
 */
export async function loadScript(
  src: string,
  options: LoadOptions = {}
): Promise<void> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[Loader] Loading script (attempt ${attempt + 1}/${retries + 1}): ${src}`);
      
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Script load timeout after ${timeout}ms: ${src}`));
        }, timeout);

        const script = document.createElement('script');
        script.src = src;
        script.type = 'module';
        script.crossOrigin = 'anonymous';

        script.onload = () => {
          clearTimeout(timeoutId);
          console.log(`[Loader] Script loaded successfully: ${src}`);
          resolve();
        };

        script.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
      });

      return; // نجح - خروج من الحلقة
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Loader] Attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < retries) {
        console.log(`[Loader] Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError || new Error(`Failed to load script after ${retries + 1} attempts: ${src}`);
}

/**
 * تحميل ملف CSS ديناميكياً
 */
export async function loadStylesheet(
  href: string,
  options: LoadOptions = {}
): Promise<void> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[Loader] Loading stylesheet (attempt ${attempt + 1}/${retries + 1}): ${href}`);
      
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Stylesheet load timeout after ${timeout}ms: ${href}`));
        }, timeout);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.crossOrigin = 'anonymous';

        link.onload = () => {
          clearTimeout(timeoutId);
          console.log(`[Loader] Stylesheet loaded successfully: ${href}`);
          resolve();
        };

        link.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to load stylesheet: ${href}`));
        };

        document.head.appendChild(link);
      });

      return; // نجح - خروج من الحلقة
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Loader] Attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < retries) {
        console.log(`[Loader] Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError || new Error(`Failed to load stylesheet after ${retries + 1} attempts: ${href}`);
}

/**
 * تحميل موارد متعددة بالتوازي
 */
export async function loadResources(
  resources: Array<{ type: 'script' | 'stylesheet'; src: string }>,
  options: LoadOptions = {}
): Promise<void> {
  const promises = resources.map((resource) => {
    if (resource.type === 'script') {
      return loadScript(resource.src, options);
    } else {
      return loadStylesheet(resource.src, options);
    }
  });

  await Promise.all(promises);
}

/**
 * التحقق من صحة استجابة الملف
 */
export async function validateAsset(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    
    if (response.status !== 200) {
      console.warn(`[Loader] Invalid status for ${url}: ${response.status}`);
      return false;
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (url.endsWith('.js')) {
      // ملف JS يجب أن يكون application/javascript أو text/javascript
      if (!contentType.includes('javascript')) {
        console.error(`[Loader] Invalid MIME type for JS file ${url}: ${contentType}`);
        return false;
      }
    } else if (url.endsWith('.css')) {
      // ملف CSS يجب أن يكون text/css
      if (!contentType.includes('text/css')) {
        console.warn(`[Loader] Unexpected MIME type for CSS file ${url}: ${contentType}`);
      }
    }

    return true;
  } catch (error) {
    console.error(`[Loader] Validation failed for ${url}:`, error);
    return false;
  }
}
