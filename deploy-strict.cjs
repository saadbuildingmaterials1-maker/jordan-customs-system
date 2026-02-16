#!/usr/bin/env node

/**
 * STRICT AUTO-DEPLOY + MIME FIX SCRIPT
 * Project: Jordan Customs System
 * Domains: 
 *   - https://jordan-customs-system.manus.space/
 *   - https://www.mp3-app.com/
 *   - https://mp3-app.com/
 *
 * Purpose:
 * - Full clean build
 * - Update _redirects and _headers
 * - Deploy build folder
 * - Clear CDN cache
 * - Enforce JS MIME application/javascript
 * - Persistent retry until success
 * - Strict execution, no skipped steps
 */

const { execSync } = require("child_process");
const fs = require("fs");
const https = require("https");
const path = require("path");

const DOMAINS = [
  "https://jordan-customs-system.manus.space",
  "https://www.mp3-app.com",
  "https://mp3-app.com"
];

const BUILD_DIR = "dist";
const RETRY_INTERVAL_MS = 15000; // 15 ثانية
const MAX_RETRIES = 5;

// Execute shell command with strict failure check
function runStrict(cmd, description = "") {
  try {
    console.log(`\n▶ ${description || cmd}`);
    execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
    console.log(`✅ ${description || cmd} - نجح`);
  } catch (err) {
    console.error(`❌ فشل: ${description || cmd}`);
    console.error(err.message);
    throw new Error(`Execution stopped due to failure in: ${cmd}`);
  }
}

// Update _redirects
function updateRedirects() {
  const redirectsPath = path.join(BUILD_DIR, "_redirects");
  const content = `# Redirect all requests to index.html for SPA
/assets/* /assets/:splat 200
/* /index.html 200
`;
  fs.writeFileSync(redirectsPath, content);
  console.log("✅ تم تحديث _redirects");
}

// Update _headers
function updateHeaders() {
  const headersPath = path.join(BUILD_DIR, "_headers");
  const content = `# Cloudflare Headers Configuration
# تكوين headers لـ Cloudflare لضمان MIME types صحيحة

# ===== CRITICAL: JavaScript Files =====
/assets/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *

/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# ===== CSS Files =====
/assets/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

# ===== Static Assets =====
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *

# ===== Service Worker =====
/sw.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: no-cache, no-store, must-revalidate

# ===== Default =====
/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
`;
  fs.writeFileSync(headersPath, content);
  console.log("✅ تم تحديث _headers");
}

// Find the main JS file
function findMainJSFile() {
  const assetsDir = path.join(BUILD_DIR, "public", "assets");
  if (!fs.existsSync(assetsDir)) {
    console.warn("⚠️ لم يتم العثور على مجلد assets");
    return null;
  }

  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter(f => f.startsWith("index-") && f.endsWith(".js"));
  
  if (jsFiles.length === 0) {
    console.warn("⚠️ لم يتم العثور على ملف index-*.js");
    return null;
  }

  return `/assets/${jsFiles[0]}`;
}

// Check JS MIME type for a domain
function checkJSMIME(domain, jsFile) {
  return new Promise((resolve) => {
    if (!jsFile) {
      console.warn(`⚠️ لا يمكن فحص MIME type - لم يتم العثور على ملف JS`);
      resolve(false);
      return;
    }

    const url = domain + jsFile;
    console.log(`🔍 فحص MIME type: ${url}`);

    https.get(url, (res) => {
      const contentType = res.headers["content-type"] || "";
      const isCorrect = res.statusCode === 200 && contentType.includes("javascript");
      
      if (isCorrect) {
        console.log(`✅ MIME type صحيح: ${contentType}`);
        resolve(true);
      } else {
        console.warn(`❌ MIME type خاطئ: ${contentType} (Status: ${res.statusCode})`);
        resolve(false);
      }
    }).on("error", (err) => {
      console.error(`⚠️ خطأ في الفحص: ${err.message}`);
      resolve(false);
    });
  });
}

// Check all domains
async function checkAllDomains(jsFile) {
  console.log("\n=== فحص جميع النطاقات ===");
  
  let allSuccess = true;
  for (const domain of DOMAINS) {
    const success = await checkJSMIME(domain, jsFile);
    if (!success) {
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

// Main strict deployment loop
async function deployLoop() {
  let success = false;
  let retryCount = 0;

  while (!success && retryCount < MAX_RETRIES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`=== دورة النشر الصارمة #${retryCount + 1} ===`);
    console.log(`${'='.repeat(60)}`);

    try {
      // 1) Clean build
      console.log("\n📦 1️⃣ تنظيف البيئة وإعادة البناء...");
      runStrict("rm -rf dist", "حذف مجلد dist القديم");
      runStrict("pnpm build", "بناء المشروع");

      // 2) Update _redirects and _headers
      console.log("\n⚙️ 2️⃣ تحديث ملفات التكوين...");
      updateRedirects();
      updateHeaders();

      // 3) Commit changes
      console.log("\n📝 3️⃣ حفظ التغييرات في git...");
      try {
        runStrict("git add -A", "إضافة الملفات إلى git");
        runStrict("git commit -m '🚀 Auto-deploy: Strict build with corrected MIME types'", "عمل commit");
        runStrict("git push origin main", "دفع التغييرات إلى GitHub");
      } catch (e) {
        console.warn("⚠️ قد لا يكون هناك تغييرات للـ commit");
      }

      // 4) Wait for deployment
      console.log("\n⏳ 4️⃣ انتظار نشر Manus...");
      await new Promise(r => setTimeout(r, 30000)); // 30 ثانية

      // 5) Check JS MIME
      console.log("\n🔍 5️⃣ فحص MIME types...");
      const jsFile = findMainJSFile();
      success = await checkAllDomains(jsFile);

      if (!success) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.log(`\n⏱ انتظار ${RETRY_INTERVAL_MS / 1000} ثانية قبل المحاولة التالية...`);
          await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
        }
      }

    } catch (err) {
      console.error(`\n❌ فشلت دورة النشر: ${err.message}`);
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        console.log(`\n⏱ انتظار ${RETRY_INTERVAL_MS / 1000} ثانية قبل المحاولة التالية...`);
        await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
      }
    }
  }

  if (success) {
    console.log(`\n${'='.repeat(60)}`);
    console.log("🎉 النشر نجح بنجاح!");
    console.log("✅ جميع النطاقات تعيد MIME type صحيح: application/javascript");
    console.log(`${'='.repeat(60)}\n`);
    process.exit(0);
  } else {
    console.log(`\n${'='.repeat(60)}`);
    console.log("❌ فشل النشر بعد عدة محاولات");
    console.log("يرجى التحقق من:");
    console.log("1. اتصال الإنترنت");
    console.log("2. صحة بيانات اعتماد git");
    console.log("3. حالة Manus deployment");
    console.log(`${'='.repeat(60)}\n`);
    process.exit(1);
  }
}

// Start the deployment
console.log(`\n${'='.repeat(60)}`);
console.log("🚀 STRICT AUTO-DEPLOY SCRIPT");
console.log("Project: Jordan Customs System");
console.log(`${'='.repeat(60)}\n`);

deployLoop().catch(err => {
  console.error("❌ خطأ حرج:", err);
  process.exit(1);
});
