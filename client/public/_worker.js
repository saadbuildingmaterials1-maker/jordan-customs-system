/**
 * Cloudflare Worker Script
 * يصحح MIME types لملفات JavaScript
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // معالجة ملفات JavaScript
    if (pathname.endsWith('.js') || pathname.includes('/assets/') && pathname.endsWith('.js')) {
      const response = await env.ASSETS.fetch(request);
      
      // إنشاء response جديد مع MIME type صحيح
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      // تصحيح MIME type
      if (pathname.endsWith('.js')) {
        newResponse.headers.set('Content-Type', 'application/javascript; charset=utf-8');
        newResponse.headers.set('X-Content-Type-Options', 'nosniff');
      }

      // إضافة headers أمان
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return newResponse;
    }

    // معالجة ملفات CSS
    if (pathname.endsWith('.css')) {
      const response = await env.ASSETS.fetch(request);
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      newResponse.headers.set('Content-Type', 'text/css; charset=utf-8');
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return newResponse;
    }

    // معالجة ملفات JSON
    if (pathname.endsWith('.json') && !pathname.endsWith('manifest.json')) {
      const response = await env.ASSETS.fetch(request);
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      newResponse.headers.set('Content-Type', 'application/json; charset=utf-8');

      return newResponse;
    }

    // معالجة manifest.json
    if (pathname.endsWith('manifest.json')) {
      const response = await env.ASSETS.fetch(request);
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      newResponse.headers.set('Content-Type', 'application/manifest+json; charset=utf-8');
      newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

      return newResponse;
    }

    // معالجة ملفات SVG
    if (pathname.endsWith('.svg')) {
      const response = await env.ASSETS.fetch(request);
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      newResponse.headers.set('Content-Type', 'image/svg+xml');
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');

      return newResponse;
    }

    // معالجة ملفات الخطوط
    if (pathname.endsWith('.woff') || pathname.endsWith('.woff2') || pathname.endsWith('.ttf')) {
      const response = await env.ASSETS.fetch(request);
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      if (pathname.endsWith('.woff')) {
        newResponse.headers.set('Content-Type', 'font/woff');
      } else if (pathname.endsWith('.woff2')) {
        newResponse.headers.set('Content-Type', 'font/woff2');
      } else if (pathname.endsWith('.ttf')) {
        newResponse.headers.set('Content-Type', 'font/ttf');
      }

      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');

      return newResponse;
    }

    // معالجة ملفات الصور
    if (pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || pathname.endsWith('.gif') || pathname.endsWith('.webp')) {
      const response = await env.ASSETS.fetch(request);
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      if (pathname.endsWith('.png')) {
        newResponse.headers.set('Content-Type', 'image/png');
      } else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
        newResponse.headers.set('Content-Type', 'image/jpeg');
      } else if (pathname.endsWith('.gif')) {
        newResponse.headers.set('Content-Type', 'image/gif');
      } else if (pathname.endsWith('.webp')) {
        newResponse.headers.set('Content-Type', 'image/webp');
      }

      newResponse.headers.set('Cache-Control', 'public, max-age=2592000');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');

      return newResponse;
    }

    // معالجة ملفات أخرى
    return env.ASSETS.fetch(request);
  }
};
