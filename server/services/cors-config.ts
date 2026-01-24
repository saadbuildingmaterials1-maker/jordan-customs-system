/**
 * إعدادات CORS الآمنة
 * تحدد الأصول المسموحة والطرق والرؤوس
 */

import cors from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.VITE_FRONTEND_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // السماح بالطلبات بدون origin (مثل الطلبات من Mobile apps أو Electron)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 ساعة
};

export const corsMiddleware = cors(corsOptions);

/**
 * إعدادات CORS مخصصة لـ tRPC
 */
export const tRPCCorsOptions = {
  ...corsOptions,
  methods: ['GET', 'POST', 'OPTIONS'],
};
