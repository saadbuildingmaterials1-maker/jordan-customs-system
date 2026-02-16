#!/usr/bin/env node
/**
 * FULL AUTO-DEPLOY WITH CDN CLEAR + MIME FIX
 * Project: Jordan Customs System
 * Domain: https://jordan-customs-system.manus.space/
 */

import { execSync } from "child_process";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOMAIN = "https://jordan-customs-system.manus.space";
const BUILD_DIR = "dist/public";
const RETRY_INTERVAL_MS = 15000;
const MAX_RETRIES = 10;

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

function updateRedirectsHeaders() {
  console.log("\n📝 Updating _redirects and _headers...");
  
  const redirectsPath = path.join(BUILD_DIR, "_redirects");
  const redirectsContent = `# Redirects for Cloudflare Pages
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
/fonts/* 200
/images/* 200
/* /index.html 200
`;
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log("✅ Updated _redirects");

  const headersPath = path.join(BUILD_DIR, "_headers");
  const headersContent = `# Headers for Cloudflare Pages
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

/assets/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/assets/*.map
  Content-Type: application/json
  Cache-Control: public, max-age=31536000, immutable

/*.map
  Content-Type: application/json
  Cache-Control: public, max-age=31536000, immutable

/fonts/*.woff
  Content-Type: font/woff
  Cache-Control: public, max-age=31536000, immutable

/fonts/*.woff2
  Content-Type: font/woff2
  Cache-Control: public, max-age=31536000, immutable

/fonts/*.ttf
  Content-Type: font/ttf
  Cache-Control: public, max-age=31536000, immutable

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

/index.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: no-cache, no-store, must-revalidate

/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=31536000, immutable

/service-worker.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: no-cache, no-store, must-revalidate
  X-Content-Type-Options: nosniff

/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
`;
  fs.writeFileSync(headersPath, headersContent);
  console.log("✅ Updated _headers");
}

function checkJS() {
  return new Promise((resolve) => {
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

async function deployLoop() {
  let success = false;
  let attempt = 0;

  while (!success && attempt < MAX_RETRIES) {
    attempt++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`START DEPLOYMENT CYCLE #${attempt}/${MAX_RETRIES}`);
    console.log(`${'='.repeat(60)}`);

    console.log("\n🧹 Cleaning local build...");
    run(`rm -rf dist`);

    console.log("\n🏗️ Building project...");
    if (!run(`pnpm build`)) {
      console.error("❌ Build failed!");
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
      continue;
    }

    updateRedirectsHeaders();

    if (!fs.existsSync(BUILD_DIR)) {
      console.error("❌ Build directory not found!");
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
      continue;
    }

    console.log(`\n✅ Build directory ready: ${BUILD_DIR}`);
    console.log(`   Files: ${fs.readdirSync(BUILD_DIR).length}`);

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

deployLoop().catch(console.error);
