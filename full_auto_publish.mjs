#!/usr/bin/env node

/**
 * =========================================
 * Jordan Customs System - Full Auto-Publish via Manus Web Control
 * نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي الكامل
 * =========================================
 * 🔹 يحاكي التفاعل مع لوحة التحكم لإنهاء النشر بدون تدخل يدوي
 */

import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========== الإعدادات ==========
const BUILD_DIR = path.resolve(__dirname, './dist');
const JS_FILES = ['index.js']; // ملفات JS الناتجة من البناء
const DOMAIN = 'https://jordan-customs-system.manus.space';
const DASHBOARD_URL = '/dashboard';
const DEPLOY_COMMAND = "echo 'ضع هنا أمر النشر المحلي للملفات إذا لزم'";
const CDN_CLEAR_COMMAND = "echo 'ضع هنا أمر تنظيف CDN إذا لزم'";
const RETRY_INTERVAL_MS = 10000;

// بيانات تسجيل الدخول Manus
const USERNAME = 'neko';
const PASSWORD = 'c8449373fb96d0c1';
const PROJECT_CHECKPOINT = 'manus-webdev://b0144228';
const MANUS_URL = 'https://manus.im';
const PROJECT_ID = 'HddKyGBLCtF9eYLPYfNmAn';

// ========== الألوان ==========
const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
};

// ========== دوال مساعدة ==========
function log(type, message) {
  const prefix = {
    INFO: `${COLORS.BLUE}ℹ️  ${COLORS.RESET}`,
    SUCCESS: `${COLORS.GREEN}✅ ${COLORS.RESET}`,
    ERROR: `${COLORS.RED}❌ ${COLORS.RESET}`,
    WARNING: `${COLORS.YELLOW}⚠️  ${COLORS.RESET}`,
    STEP: `${COLORS.CYAN}→ ${COLORS.RESET}`,
  };
  console.log(`${prefix[type] || ''}${message}`);
}

function logSection(title) {
  console.log(`\n${COLORS.BRIGHT}${COLORS.BLUE}${'═'.repeat(70)}${COLORS.RESET}`);
  console.log(`${COLORS.BRIGHT}${COLORS.BLUE}  ${title}${COLORS.RESET}`);
  console.log(`${COLORS.BRIGHT}${COLORS.BLUE}${'═'.repeat(70)}${COLORS.RESET}\n`);
}

// ========== الدالة الرئيسية ==========
(async () => {
  logSection('🚀 بدء السكريبت الآلي للنشر الكامل بدون تدخل يدوي');

  let browser;
  
  try {
    // ========== تشغيل المتصفح ==========
    log('STEP', 'تشغيل متصفح Chromium...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--disable-popup-blocking', '--no-sandbox', '--disable-setuid-sandbox'],
    });
    log('SUCCESS', 'تم تشغيل المتصفح');

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // ========== 1️⃣ تسجيل الدخول تلقائياً ==========
    logSection('1️⃣ تسجيل الدخول');
    
    log('STEP', 'الذهاب إلى صفحة تسجيل الدخول...');
    await page.goto(`${MANUS_URL}/login`, { waitUntil: 'networkidle2', timeout: 60000 });
    log('SUCCESS', 'تم الوصول إلى صفحة تسجيل الدخول');

    log('STEP', 'إدخال بيانات المستخدم...');
    
    // محاولة العثور على حقول الإدخال
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].type(USERNAME, { delay: 50 });
      await inputs[1].type(PASSWORD, { delay: 50 });
      log('SUCCESS', 'تم إدخال بيانات المستخدم');
    }

    // البحث عن زر تسجيل الدخول والنقر عليه
    const buttons = await page.$$('button');
    let loginButton = null;
    
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('تسجيل') || text.includes('Login') || text.includes('دخول')) {
        loginButton = btn;
        break;
      }
    }

    if (!loginButton && buttons.length > 0) {
      loginButton = buttons[buttons.length - 1];
    }

    if (loginButton) {
      await loginButton.click();
      log('SUCCESS', 'تم النقر على زر تسجيل الدخول');
    }

    log('STEP', 'انتظار اكتمال تسجيل الدخول...');
    await new Promise(r => setTimeout(r, 15000));
    log('SUCCESS', 'اكتمل تسجيل الدخول');

    // ========== 2️⃣ الذهاب إلى لوحة التحكم ==========
    logSection('2️⃣ الذهاب إلى لوحة التحكم');
    
    log('STEP', 'الذهاب إلى صفحة المشروع...');
    await page.goto(`${MANUS_URL}/app/${PROJECT_ID}`, { waitUntil: 'networkidle2', timeout: 60000 });
    log('SUCCESS', 'تم الوصول إلى لوحة التحكم');

    // ========== 3️⃣ الضغط على زر Publish ==========
    logSection('3️⃣ الضغط على زر Publish');
    
    log('STEP', 'البحث عن زر Publish...');
    
    try {
      // انتظار تحميل الصفحة
      await new Promise(r => setTimeout(r, 5000));

      // البحث عن زر Published
      const publishButtons = await page.$$('button');
      let publishButton = null;

      for (const btn of publishButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Published')) {
          publishButton = btn;
          break;
        }
      }

      if (publishButton) {
        log('SUCCESS', 'تم العثور على زر Published');
        await publishButton.click();
        log('SUCCESS', 'تم الضغط على Publish');
        
        // انتظار إظهار خيارات النطاق
        await new Promise(r => setTimeout(r, 5000));

        // اختيار النطاق الأول تلقائياً
        const rangeButtons = await page.$$('button');
        let rangeButton = null;

        for (const btn of rangeButtons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes('jordan-customs-system.manus.space') || text.includes('النطاق')) {
            rangeButton = btn;
            break;
          }
        }

        if (rangeButton) {
          await rangeButton.click();
          log('SUCCESS', 'تم اختيار النطاق للنشر');
        } else {
          log('WARNING', 'لم يتم العثور على زر اختيار النطاق');
        }
      } else {
        log('ERROR', 'لم يتم العثور على زر Published');
      }
    } catch (err) {
      log('ERROR', `خطأ في الضغط على Publish: ${err.message}`);
    }

    // ========== 4️⃣ تنفيذ نشر محلي إذا لزم ==========
    logSection('4️⃣ تنفيذ أوامر النشر');
    
    try {
      log('STEP', 'تنفيذ أمر النشر المحلي...');
      execSync(DEPLOY_COMMAND, { stdio: 'inherit' });
      log('SUCCESS', 'تم تنفيذ أمر النشر');
    } catch (err) {
      log('WARNING', 'فشل أمر النشر المحلي');
    }

    // ========== 5️⃣ تنظيف CDN إذا لزم ==========
    try {
      log('STEP', 'تنفيذ أمر تنظيف CDN...');
      execSync(CDN_CLEAR_COMMAND, { stdio: 'inherit' });
      log('SUCCESS', 'تم تنفيذ أمر تنظيف CDN');
    } catch (err) {
      log('WARNING', 'فشل أمر تنظيف CDN');
    }

    // ========== 6️⃣ التحقق التلقائي حتى النجاح ==========
    logSection('6️⃣ التحقق التلقائي من النشر');
    
    let success = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!success && attempts < maxAttempts) {
      attempts++;
      log('STEP', `محاولة التحقق ${attempts}/${maxAttempts}...`);

      let jsOk = true;
      
      for (const file of JS_FILES) {
        try {
          const response = await page.goto(`${DOMAIN}/${file}`, { waitUntil: 'networkidle2', timeout: 30000 });
          const ct = response.headers()['content-type'] || '';
          
          if (!ct.includes('javascript')) {
            log('WARNING', `${file} MIME غير صحيح: ${ct}`);
            jsOk = false;
          } else {
            log('SUCCESS', `${file} MIME صحيح: ${ct}`);
          }
        } catch (err) {
          log('WARNING', `فشل التحقق من ${file}: ${err.message}`);
          jsOk = false;
        }
      }

      let dashOk = false;
      
      try {
        await page.goto(`${DOMAIN}${DASHBOARD_URL}`, { waitUntil: 'networkidle2', timeout: 30000 });
        const exists = await page.$('div#dashboard-root') !== null;
        
        if (exists) {
          log('SUCCESS', '/dashboard يعمل بشكل صحيح');
          dashOk = true;
        } else {
          log('WARNING', '/dashboard موجود لكن بدون محتوى');
        }
      } catch (err) {
        log('WARNING', `فشل التحقق من /dashboard: ${err.message}`);
      }

      if (jsOk && dashOk) {
        success = true;
        logSection('🎯 جميع الاختبارات ناجحة!');
        log('SUCCESS', 'النشر اكتمل و /dashboard يعمل');
      } else {
        if (attempts < maxAttempts) {
          log('STEP', `إعادة المحاولة بعد ${RETRY_INTERVAL_MS / 1000} ثواني...`);
          await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
          
          try {
            execSync(DEPLOY_COMMAND, { stdio: 'inherit' });
          } catch {}
          
          try {
            execSync(CDN_CLEAR_COMMAND, { stdio: 'inherit' });
          } catch {}
          
          log('STEP', '🔄 حاول النشر مرة أخرى تلقائياً');
        }
      }
    }

    if (success) {
      logSection('✅ اكتمل النشر بنجاح!');
      log('SUCCESS', 'جميع الخطوات اكتملت بنجاح');
      log('INFO', 'المتصفح والجلسة يبقيان مفتوحين لضمان الاستقرار الكامل بعد النشر');
    } else {
      log('ERROR', 'فشل النشر بعد عدة محاولات');
    }

  } catch (error) {
    log('ERROR', `حدث خطأ: ${error.message}`);
    console.error(error);
  }
})();
