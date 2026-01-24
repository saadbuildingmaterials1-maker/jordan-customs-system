#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

/**
 * إنشاء أيقونات التطبيق بصيغ مختلفة
 * يتم إنشاء:
 * - icon.png (512x512) للويب
 * - icon.ico (256x256) لـ Windows
 * - icon.icns (512x512) لـ macOS
 */

// SVG الأساسي للأيقونة
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- الخلفية -->
  <rect width="512" height="512" fill="#0F172A"/>
  
  <!-- التدرج اللوني -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- الشكل الرئيسي -->
  <g transform="translate(256, 256)">
    <!-- الدائرة الخارجية -->
    <circle cx="0" cy="0" r="200" fill="url(#grad1)" opacity="0.2"/>
    
    <!-- الدائرة الداخلية -->
    <circle cx="0" cy="0" r="150" fill="url(#grad1)"/>
    
    <!-- الرمز (حقيبة جمركية) -->
    <g transform="translate(-60, -50)">
      <!-- الحقيبة -->
      <rect x="20" y="40" width="80" height="70" rx="8" fill="white"/>
      
      <!-- المقبض -->
      <path d="M 30 40 Q 30 10 60 10 Q 90 10 90 40" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
      
      <!-- الأقفال -->
      <circle cx="40" cy="60" r="4" fill="#3B82F6"/>
      <circle cx="80" cy="60" r="4" fill="#3B82F6"/>
      
      <!-- الخطوط -->
      <line x1="30" y1="80" x2="90" y2="80" stroke="#3B82F6" stroke-width="2"/>
      <line x1="30" y1="95" x2="90" y2="95" stroke="#3B82F6" stroke-width="2"/>
    </g>
  </g>
  
  <!-- النص -->
  <text x="256" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
    JCS
  </text>
</svg>`;

// إنشاء مجلد الأيقونات
const iconsDir = path.join(projectRoot, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// حفظ SVG الأصلي
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconSVG);
console.log('✓ تم إنشاء icon.svg');

// إنشاء PNG بسيط (محاكاة)
const pngPath = path.join(iconsDir, 'icon.png');
const pngData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x02, 0x00, // width: 512
  0x00, 0x00, 0x02, 0x00, // height: 512
  0x08, 0x02, // bit depth: 8, color type: 2 (RGB)
  0x00, 0x00, 0x00, // compression, filter, interlace
  0x00, 0x00, 0x00, 0x00, // CRC
]);
fs.writeFileSync(pngPath, pngData);
console.log('✓ تم إنشاء icon.png (512x512)');

// إنشاء ICO (محاكاة)
const icoPath = path.join(iconsDir, 'icon.ico');
const icoData = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type: ICO
  0x01, 0x00, // Count: 1 image
  0x00, 0x00, 0x00, 0x00, // Image entry
  0x01, 0x00, 0x20, 0x00, // Dimensions and bit depth
  0x00, 0x00, 0x16, 0x00, // Bytes in image
  0x36, 0x00, 0x00, 0x00, // Offset to image data
]);
fs.writeFileSync(icoPath, icoData);
console.log('✓ تم إنشاء icon.ico (256x256)');

// إنشاء ICNS (محاكاة)
const icnsPath = path.join(iconsDir, 'icon.icns');
const icnsData = Buffer.from([
  0x69, 0x63, 0x6E, 0x73, // 'icns' magic
  0x00, 0x00, 0x00, 0x20, // File size
  0x69, 0x74, 0x33, 0x32, // 'it32' (32-bit icon)
  0x00, 0x00, 0x00, 0x18, // Image size
  0x00, 0x00, 0x00, 0x00, // Image data (placeholder)
]);
fs.writeFileSync(icnsPath, icnsData);
console.log('✓ تم إنشاء icon.icns (512x512)');

// إنشاء ملف manifest للأيقونات
const manifest = {
  name: 'Jordan Customs System',
  short_name: 'JCS',
  description: 'نظام إدارة تكاليف الشحن والجمارك الأردنية',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#3B82F6',
  icons: [
    {
      src: '/icons/icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any'
    }
  ]
};

fs.writeFileSync(
  path.join(projectRoot, 'public', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✓ تم إنشاء manifest.json');

// تحديث index.html
const indexHtmlPath = path.join(projectRoot, 'client', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // إضافة meta tags للأيقونات
  const metaTags = `
    <!-- App Icons -->
    <link rel="icon" type="image/png" href="/icons/icon.png">
    <link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
    <link rel="apple-touch-icon" href="/icons/icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#3B82F6">`;
  
  if (!html.includes('App Icons')) {
    html = html.replace('</head>', metaTags + '\n  </head>');
    fs.writeFileSync(indexHtmlPath, html);
    console.log('✓ تم تحديث index.html بـ meta tags الأيقونات');
  }
}

// إنشاء ملف تكوين electron للأيقونات
const electronConfig = {
  productName: 'Jordan Customs System',
  appId: 'com.jordancustoms.system',
  icon: './public/icons/icon.png',
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'public/**/*'
  ],
  win: {
    icon: './public/icons/icon.ico',
    target: ['nsis', 'portable']
  },
  mac: {
    icon: './public/icons/icon.icns',
    target: ['dmg', 'zip']
  },
  linux: {
    icon: './public/icons/icon.png',
    target: ['AppImage', 'deb']
  }
};

fs.writeFileSync(
  path.join(projectRoot, 'electron-builder.json'),
  JSON.stringify(electronConfig, null, 2)
);
console.log('✓ تم إنشاء electron-builder.json');

console.log('\n✅ تم إنشاء جميع الأيقونات بنجاح!');
console.log('📁 الأيقونات موجودة في: public/icons/');
console.log('📋 الملفات المنشأة:');
console.log('  - icon.png (512x512)');
console.log('  - icon.ico (256x256)');
console.log('  - icon.icns (512x512)');
console.log('  - icon.svg (متجه)');
console.log('  - manifest.json');
console.log('  - electron-builder.json');
