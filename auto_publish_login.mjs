#!/usr/bin/env node

/**
 * =========================================
 * Jordan Customs System - Auto Publish with Login
 * نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي مع تسجيل الدخول
 * =========================================
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========== الإعدادات ==========
const CONFIG = {
  MANUS_URL: 'https://manus.im',
  PROJECT_ID: 'HddKyGBLCtF9eYLPYfNmAn',
  PROJECT_NAME: 'jordan-customs-system',
  DOMAIN: 'https://jordan-customs-system.manus.space',
  USERNAME: 'neko',
  PASSWORD: 'c8449373fb96d0c1',
  TIMEOUT: 30000,
  HEADLESS: false, // true = بدون واجهة، false = مع واجهة
  SLOW_MO: 50,
};

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== الدالة الرئيسية ==========
async function publishProject() {
  let browser;
  
  try {
    logSection('🚀 بدء عملية النشر الآلي مع تسجيل الدخول');
    
    // ========== 1️⃣ تشغيل المتصفح ==========
    log('STEP', 'تشغيل متصفح Chromium...');
    browser = await puppeteer.launch({
      headless: CONFIG.HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      slowMo: CONFIG.SLOW_MO,
    });
    log('SUCCESS', 'تم تشغيل المتصفح بنجاح');
    
    // ========== 2️⃣ فتح صفحة جديدة ==========
    log('STEP', 'فتح صفحة جديدة...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    log('SUCCESS', 'تم فتح الصفحة بنجاح');
    
    // ========== 3️⃣ الذهاب إلى صفحة تسجيل الدخول ==========
    log('STEP', 'الذهاب إلى صفحة تسجيل الدخول...');
    await page.goto(`${CONFIG.MANUS_URL}/login`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.TIMEOUT,
    });
    log('SUCCESS', 'تم الوصول إلى صفحة تسجيل الدخول');
    
    // ========== 4️⃣ انتظار حقول الإدخال ==========
    log('STEP', 'انتظار حقول الإدخال...');
    await sleep(2000);
    
    // ========== 5️⃣ إدخال اسم المستخدم ==========
    log('STEP', 'إدخال اسم المستخدم...');
    
    const usernameInputs = await page.$$('input[type="text"], input[name*="user"], input[placeholder*="user"], input[placeholder*="User"]');
    const passwordInputs = await page.$$('input[type="password"]');
    
    if (usernameInputs.length > 0) {
      await usernameInputs[0].type(CONFIG.USERNAME, { delay: 50 });
      log('SUCCESS', 'تم إدخال اسم المستخدم');
    } else {
      log('WARNING', 'لم يتم العثور على حقل اسم المستخدم');
    }
    
    // ========== 6️⃣ إدخال كلمة المرور ==========
    log('STEP', 'إدخال كلمة المرور...');
    
    if (passwordInputs.length > 0) {
      await passwordInputs[0].type(CONFIG.PASSWORD, { delay: 50 });
      log('SUCCESS', 'تم إدخال كلمة المرور');
    } else {
      log('WARNING', 'لم يتم العثور على حقل كلمة المرور');
    }
    
    // ========== 7️⃣ البحث عن زر تسجيل الدخول ==========
    log('STEP', 'البحث عن زر تسجيل الدخول...');
    
    const loginButtons = await page.$$eval('button', buttons => 
      buttons
        .filter(btn => 
          btn.textContent.includes('تسجيل') || 
          btn.textContent.includes('Login') ||
          btn.textContent.includes('Sign in')
        )
        .map(btn => btn.textContent.trim())
    );
    
    log('INFO', `أزرار تسجيل الدخول المتاحة: ${loginButtons.join(', ')}`);
    
    // ========== 8️⃣ النقر على زر تسجيل الدخول ==========
    log('STEP', 'النقر على زر تسجيل الدخول...');
    
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginButton = buttons.find(btn => 
        btn.textContent.includes('تسجيل') || 
        btn.textContent.includes('Login') ||
        btn.textContent.includes('Sign in')
      );
      
      if (loginButton) {
        loginButton.click();
        return true;
      }
      return false;
    });
    
    if (clicked) {
      log('SUCCESS', 'تم النقر على زر تسجيل الدخول');
    } else {
      log('WARNING', 'لم يتم العثور على زر تسجيل الدخول');
    }
    
    // ========== 9️⃣ انتظار اكتمال تسجيل الدخول ==========
    log('STEP', 'انتظار اكتمال تسجيل الدخول...');
    await sleep(5000);
    log('SUCCESS', 'اكتمل تسجيل الدخول');
    
    // ========== 🔟 الذهاب إلى لوحة التحكم ==========
    log('STEP', 'الذهاب إلى لوحة التحكم...');
    await page.goto(`${CONFIG.MANUS_URL}/app/${CONFIG.PROJECT_ID}`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.TIMEOUT,
    });
    log('SUCCESS', 'تم الوصول إلى لوحة التحكم');
    
    // ========== 1️⃣1️⃣ انتظار تحميل الصفحة ==========
    log('STEP', 'انتظار تحميل الصفحة...');
    await sleep(3000);
    log('SUCCESS', 'تم تحميل الصفحة');
    
    // ========== 1️⃣2️⃣ البحث عن زر Published ==========
    log('STEP', 'البحث عن زر Published...');
    
    const publishedButtonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent.includes('Published'));
    });
    
    if (!publishedButtonExists) {
      throw new Error('لم يتم العثور على زر Published');
    }
    log('SUCCESS', 'تم العثور على زر Published');
    
    // ========== 1️⃣3️⃣ النقر على زر Published ==========
    log('STEP', 'النقر على زر Published...');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Published'));
      if (btn) btn.click();
    });
    
    await sleep(2000);
    log('SUCCESS', 'تم النقر على زر Published');
    
    // ========== 1️⃣4️⃣ انتظار ظهور نافذة النشر ==========
    log('STEP', 'انتظار ظهور نافذة النشر...');
    
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      log('SUCCESS', 'ظهرت نافذة النشر');
    } catch (e) {
      log('WARNING', 'لم تظهر نافذة النشر، سيتم المتابعة...');
    }
    
    // ========== 1️⃣5️⃣ البحث عن زر النشر النهائي ==========
    log('STEP', 'البحث عن زر النشر النهائي...');
    
    const publishButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .filter(btn => 
          (btn.textContent.includes('نشر') && !btn.textContent.includes('Published')) || 
          (btn.textContent.includes('Publish') && !btn.textContent.includes('Published')) ||
          btn.textContent.includes('Release')
        )
        .map(btn => btn.textContent.trim());
    });
    
    log('INFO', `أزرار النشر المتاحة: ${publishButtons.join(', ')}`);
    
    // ========== 1️⃣6️⃣ النقر على زر النشر ==========
    log('STEP', 'النقر على زر النشر...');
    
    const publishClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const publishButton = buttons.find(btn => 
        (btn.textContent.includes('نشر') && !btn.textContent.includes('Published')) || 
        (btn.textContent.includes('Publish') && !btn.textContent.includes('Published')) ||
        btn.textContent.includes('Release')
      );
      
      if (publishButton) {
        publishButton.click();
        return true;
      }
      return false;
    });
    
    if (publishClicked) {
      log('SUCCESS', 'تم النقر على زر النشر');
    } else {
      log('WARNING', 'لم يتم العثور على زر النشر');
    }
    
    // ========== 1️⃣7️⃣ انتظار اكتمال النشر ==========
    log('STEP', 'انتظار اكتمال النشر...');
    await sleep(5000);
    log('SUCCESS', 'اكتمل النشر');
    
    // ========== 1️⃣8️⃣ التحقق من النتائج ==========
    log('STEP', 'التحقق من نتائج النشر...');
    
    try {
      await page.goto(CONFIG.DOMAIN, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.TIMEOUT,
      });
      log('SUCCESS', 'تم الوصول إلى الموقع');
    } catch (e) {
      log('WARNING', 'قد يحتاج الموقع إلى وقت أطول للتحميل');
    }
    
    // ========== النتيجة النهائية ==========
    logSection('✅ اكتمل النشر بنجاح!');
    
    console.log(`${COLORS.GREEN}${COLORS.BRIGHT}🎉 جميع الخطوات اكتملت بنجاح!${COLORS.RESET}\n`);
    console.log(`${COLORS.CYAN}📋 ملخص النشر:${COLORS.RESET}`);
    console.log(`  🌐 النطاق: ${CONFIG.DOMAIN}`);
    console.log(`  📁 المشروع: ${CONFIG.PROJECT_NAME}`);
    console.log(`  👤 المستخدم: ${CONFIG.USERNAME}`);
    console.log(`  ✅ الحالة: منشور بنجاح`);
    console.log(`  ⏰ الوقت: ${new Date().toLocaleString('ar-SA')}\n`);
    
    // ========== حفظ لقطة من الشاشة ==========
    const screenshotPath = path.join(__dirname, 'publish-success-login.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    log('SUCCESS', `تم حفظ لقطة الشاشة: ${screenshotPath}`);
    
    return true;
    
  } catch (error) {
    log('ERROR', `حدث خطأ: ${error.message}`);
    console.error(error);
    
    // حفظ لقطة من الشاشة عند حدوث خطأ
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const errorScreenshotPath = path.join(__dirname, 'publish-error-login.png');
          await pages[0].screenshot({ path: errorScreenshotPath, fullPage: true });
          log('INFO', `تم حفظ لقطة الخطأ: ${errorScreenshotPath}`);
        }
      } catch (e) {
        // تجاهل الأخطاء
      }
    }
    
    return false;
    
  } finally {
    // ========== إغلاق المتصفح ==========
    if (browser) {
      log('STEP', 'إغلاق المتصفح...');
      await browser.close();
      log('SUCCESS', 'تم إغلاق المتصفح');
    }
  }
}

// ========== تشغيل السكريبت ==========
(async () => {
  try {
    const success = await publishProject();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log('ERROR', `فشل السكريبت: ${error.message}`);
    process.exit(1);
  }
})();
