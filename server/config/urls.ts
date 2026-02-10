/**
 * Centralized URLs Configuration
 * جميع الـ URLs في مكان واحد
 */

export const URLs = {
  // Payment & Banking
  BANK_AUDI: process.env.BANK_AUDI_URL || 'https://www.bankaudi.com.jo/saadboos',
  PAYPAL: process.env.PAYPAL_URL || 'https://paypal.me/saadboos',
  ALIPAY: process.env.ALIPAY_URL || 'https://alipay.com/saadboos',
  
  // App Stores
  APP_STORE: process.env.APP_STORE_URL || 'https://apps.apple.com/app/jordan-customs',
  PLAY_STORE: process.env.PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.jordancustoms',
  
  // API Endpoints
  FORGE_API: process.env.VITE_FRONTEND_FORGE_API_URL || 'https://forge.butterfly-effect.dev',
  QR_CODE_API: process.env.QR_CODE_API_URL || 'https://api.qrserver.com/v1/create-qr-code/',
  
  // File Storage
  FILES_CDN: process.env.FILES_CDN_URL || 'https://files.manuscdn.com/user_upload_by_module/session_file/',
  
  // Analytics
  ANALYTICS: process.env.VITE_ANALYTICS_ENDPOINT || 'https://manus-analytics.com',
  
  // Fonts
  GOOGLE_FONTS: 'https://fonts.googleapis.com',
  GOOGLE_FONTS_STATIC: 'https://fonts.gstatic.com',
  
  // App URLs
  CUSTOMS_SYSTEM: process.env.CUSTOMS_SYSTEM_URL || 'https://customs-system.manus.space',
  MAIN_APP: process.env.MAIN_APP_URL || 'https://mp3-app.com',
  
  // Development
  DEV_SERVER: process.env.DEV_SERVER_URL || 'http://localhost:5173',
  DEV_API: process.env.DEV_API_URL || 'http://localhost:3000',
};

export const CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.MAIN_APP_URL || 'https://mp3-app.com',
  process.env.CUSTOMS_SYSTEM_URL || 'https://customs-system.manus.space',
];

export const CSP_DIRECTIVES = {
  scriptSrc: ["'self'", "'unsafe-inline'", URLs.ANALYTICS, 'blob:'],
  styleSrc: ["'self'", "'unsafe-inline'", URLs.GOOGLE_FONTS],
  fontSrc: ["'self'", 'data:', URLs.GOOGLE_FONTS_STATIC],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'", 'https:', URLs.ANALYTICS, URLs.FORGE_API],
};
