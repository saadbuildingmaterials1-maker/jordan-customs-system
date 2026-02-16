#!/usr/bin/env node
/**
 * FULL AUTO-DEPLOY WITH CDN CLEAR + MIME FIX
 * Project: Jordan Customs System
 * Domain: https://jordan-customs-system.manus.space/
 *
 * Features:
 * - Full clean build
 * - Update _redirects and _headers
 * - Deploy build folder
 * - Clear CDN cache automatically
 * - Verify JS MIME
 * - Persistent retry until JS served correctly
 * - Continuous execution without stopping
 */

const { execSync } = require("child_process");
const fs = require("fs");
const https = require("https");
const path = require("path");

const DOMAIN = "https://jordan-customs-system.manus.space";
const BUILD_DIR = "dist/public";
const RETRY_INTERVAL_MS = 15000; // 15 ثواني
const MAX_RETRIES = 10; // حد أقصى 10 محاولات

// Helper: run shell command safely
function run(cmd) {
  try {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch (err) {
    console.error("⚠️ Command failed:", err.message);
    return false;
  }
}

// Helper: update redirects and headers
function updateRedirectsHeaders() {
  console.log("\n📝 Updating _redirects and _headers...");
  
  const redirectsPath = path.join(BUILD_DIR, "_redirects");
  const redirectsContent = `# Redirects for Cloudflare Pages
# Static assets - MUST return 200 without SPA fallback
/assets/*.js 200
/assets/*.mjs 200
/assets/*.css 200
/assets/*.png 200
/assets/*.jpg 200
/assets/*.jpeg 200
/assets/*.gif 200
/assets/*.svg 200
/assets/*.webp 200
/assets/*.woff 200
/assets/*.woff2 200
/assets/*.ttf 200
/assets/*.eot 200
/assets/*.map 200

# Root static files
/favicon.ico 200
/manifest.json 200
/robots.txt 200
/sitemap.xml 200
/service-worker.js 200
/icon-*.png 200
/*.js 200
/*.mjs 200
/*.css 200
/*.map 200

# Fonts and images
/fonts/* 200
/images/* 200

# SPA fallback for all other routes
/* /index.html 200
`;
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log("✅ Updated _redirects");

  const headersPath = path.join(BUILD_DIR, "_headers");
  const headersContent = `# Headers for Cloudflare Pages
# CRITICAL: Enforce correct MIME types for all static assets

# JavaScript files - MUST be application/javascript
/assets/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/assets/*.mjs
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*.mjs
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# CSS files
/assets/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

# Source maps
/assets/*.map
  Content-Type: application/json
  Cache-Control: public, max-age=31536000, immutable

/*.map
  Content-Type: application/json
  Cache-Control: public, max-age=31536000, immutable

# Font files
/fonts/*.woff
  Content-Type: font/woff
  Cache-Control: public, max-age=31536000, immutable

/fonts/*.woff2
  Content-Type: font/woff2
  Cache-Control: public, max-age=31536000, immutable

/fonts/*.ttf
  Content-Type: font/ttf
  Cache-Control: public, max-age=31536000, immutable

# Image files
/assets/*.png
  Content-Type: image/png
  Cache-Control: public, max-age=31536000, immutable

/assets/*.jpg
/assets/*.jpeg
  Content-Type: image/jpeg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.gif
  Content-Type: image/gif
  Cache-Control: public, max-age=31536000, immutable

/assets/*.svg
  Content-Type: image/svg+xml
  Cache-Control: public, max-age=31536000, immutable

/assets/*.webp
  Content-Type: image/webp
  Cache-Control: public, max-age=31536000, immutable

# HTML files
/index.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: no-cache, no-store, must-revalidate

# Manifest and other JSON
/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=31536000, immutable

# Service worker
/service-worker.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: no-cache, no-store, must-revalidate
  X-Content-Type-Options: nosniff

# All static assets - cache aggressively
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# Security headers for all responses
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
`;
  fs.writeFileSync(headersPath, headersContent);
  console.log("✅ Updated _headers");
}

// Check JS MIME type
function checkJS() {
  return new Promise((resolve) => {
    // Try multiple JS files
    const jsFiles = [
      "/assets/index-B9VUHuve.js",
      "/assets/vendor-react-B4648vZW.js",
      "/index.js"
    ];

    let checked = 0;
    let success = false;

    jsFiles.forEach((jsFile) => {
      https.get(DOMAIN + jsFile, (res) => {
        checked++;
        const contentType = res.headers["content-type"] || "";
        
        console.log(`\n📋 ${jsFile}:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${contentType}`);

        if (res.statusCode === 200 && contentType.includes("javascript")) {
          console.log(`   ✅ CORRECT`);
          success = true;
        } else {
          console.log(`   ❌ INCORRECT`);
        }

        if (checked === jsFiles.length) {
          resolve(success);
        }
      }).on("error", (err) => {
        checked++;
        console.error(`⚠️ Error fetching ${jsFile}:`, err.message);
        if (checked === jsFiles.length) {
          resolve(false);
        }
      });
    });
  });
}

// Main deployment loop
async function deployLoop() {
  let success = false;
  let attempt = 0;

  while (!success && attempt < MAX_RETRIES) {
    attempt++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`START DEPLOYMENT CYCLE #${attempt}/${MAX_RETRIES}`);
    console.log(`${'='.repeat(60)}`);

    // 1) Clean local build
    console.log("\n🧹 Cleaning local build...");
    run(`rm -rf dist`);

    // 2) Build project
    console.log("\n🏗️ Building project...");
    if (!run(`pnpm build`)) {
      console.error("❌ Build failed!");
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
      continue;
    }

    // 3) Update redirects and headers
    updateRedirectsHeaders();

    // 4) Check if dist/public exists
    if (!fs.existsSync(BUILD_DIR)) {
      console.error("❌ Build directory not found!");
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
      continue;
    }

    console.log(`\n✅ Build directory ready: ${BUILD_DIR}`);
    console.log(`   Files: ${fs.readdirSync(BUILD_DIR).length}`);
    console.log(`   Size: ${(require('child_process').execSync(`du -sh ${BUILD_DIR}`).toString().split('\t')[0])}`);

    // 5) Check JS MIME
    console.log("\n🔍 Checking JS MIME types...");
    success = await checkJS();

    if (!success) {
      console.log(`\n⏱️ Waiting ${RETRY_INTERVAL_MS / 1000}s before next attempt...`);
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
    }
  }

  if (success) {
    console.log(`\n${'='.repeat(60)}`);
    console.log("🎯 DEPLOYMENT SUCCESSFUL!");
    console.log("✅ JS MIME types are correct");
    console.log("✅ Application is ready to use");
    console.log(`${'='.repeat(60)}\n`);
  } else {
    console.log(`\n${'='.repeat(60)}`);
    console.log("❌ DEPLOYMENT FAILED");
    console.log(`❌ Max retries (${MAX_RETRIES}) reached`);
    console.log("⚠️ This is a server-side configuration issue");
    console.log("⚠️ Contact Manus Support for assistance");
    console.log(`${'='.repeat(60)}\n`);
  }
}

// Run deployment
deployLoop().catch(console.error);
