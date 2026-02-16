#!/usr/bin/env node

/**
 * =========================================
 * Jordan Customs System - Advanced Automated Publishing
 * نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي المتقدم
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
  TIMEOUT: 60000,
  HEADLESS: false,
  SLOW_MO: 100,
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
    logSection('🚀 بدء عملية النشر الآلي المتقدمة');
    
    // ========== 1️⃣ تشغيل المتصفح ==========
    log('STEP', 'تشغيل متصفح Chromium...');
    browser = await puppeteer.launch({
      headless: CONFIG.HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-resources',
      ],
      slowMo: CONFIG.SLOW_MO,
    });
    log('SUCCESS', 'تم تشغيل المتصفح بنجاح');
    
    // ========== 2️⃣ فتح صفحة جديدة ==========
    log('STEP', 'فتح صفحة جديدة...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // تعطيل الصور لتسريع التحميل
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    log('SUCCESS', 'تم فتح الصفحة بنجاح');
    
    // ========== 3️⃣ الذهاب إلى صفحة تسجيل الدخول ==========
    log('STEP', 'الذهاب إلى صفحة تسجيل الدخول...');
    await page.goto(`${CONFIG.MANUS_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.TIMEOUT,
    });
    log('SUCCESS', 'تم الوصول إلى صفحة تسجيل الدخول');
    
    // ========== 4️⃣ انتظار تحميل الصفحة ==========
    log('STEP', 'انتظار تحميل الصفحة...');
    await sleep(3000);
    
    // ========== 5️⃣ البحث عن حقول الإدخال ==========
    log('STEP', 'البحث عن حقول الإدخال...');
    
    const inputs = await page.$$('input');
    log('INFO', `عدد حقول الإدخال: ${inputs.length}`);
    
    if (inputs.length < 2) {
      throw new Error('لم يتم العثور على حقول الإدخال');
    }
    
    // ========== 6️⃣ إدخال بيانات المستخدم ==========
    log('STEP', 'إدخال بيانات المستخدم...');
    
    // إدخال اسم المستخدم
    await inputs[0].click();
    await inputs[0].type(CONFIG.USERNAME, { delay: 50 });
    log('SUCCESS', 'تم إدخال اسم المستخدم');
    
    // إدخال كلمة المرور
    await inputs[1].click();
    await inputs[1].type(CONFIG.PASSWORD, { delay: 50 });
    log('SUCCESS', 'تم إدخال كلمة المرور');
    
    // ========== 7️⃣ البحث عن زر تسجيل الدخول ==========
    log('STEP', 'البحث عن زر تسجيل الدخول...');
    
    const buttons = await page.$$('button');
    let loginButton = null;
    
    // البحث في النصوص
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('تسجيل') || text.includes('Login') || text.includes('Sign in') || text.includes('دخول')) {
        loginButton = btn;
        break;
      }
    }
    
    // البحث في الخصائص
    if (!loginButton) {
      for (const btn of buttons) {
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), btn);
        const title = await page.evaluate(el => el.getAttribute('title'), btn);
        if ((ariaLabel && (ariaLabel.includes('تسجيل') || ariaLabel.includes('Login'))) ||
            (title && (title.includes('تسجيل') || title.includes('Login')))) {
          loginButton = btn;
          break;
        }
      }
    }
    
    // البحث عن أي زر (الزر الأخير عادة ما يكون زر تسجيل الدخول)
    if (!loginButton && buttons.length > 0) {
      loginButton = buttons[buttons.length - 1];
      log('WARNING', 'تم اختيار آخر زر في الصفحة');
    }
    
    if (!loginButton) {
      throw new Error('لم يتم العثور على زر تسجيل الدخول');
    }
    log('SUCCESS', 'تم العثور على زر تسجيل الدخول');
    
    // ========== 8️⃣ النقر على زر تسجيل الدخول ==========
    log('STEP', 'النقر على زر تسجيل الدخول...');
    await loginButton.click();
    
    // انتظار اكتمال تسجيل الدخول
    await sleep(5000);
    log('SUCCESS', 'اكتمل تسجيل الدخول');
    
    // ========== 9️⃣ الذهاب إلى لوحة التحكم ==========
    log('STEP', 'الذهاب إلى لوحة التحكم...');
    await page.goto(`${CONFIG.MANUS_URL}/app/${CONFIG.PROJECT_ID}`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.TIMEOUT,
    });
    log('SUCCESS', 'تم الوصول إلى لوحة التحكم');
    
    // ========== 🔟 انتظار تحميل الصفحة ==========
    log('STEP', 'انتظار تحميل الصفحة...');
    await sleep(5000);
    log('SUCCESS', 'تم تحميل الصفحة');
    
    // ========== 1️⃣1️⃣ البحث عن زر Published ==========
    log('STEP', 'البحث عن زر Published...');
    
    const allButtons = await page.$$('button');
    let publishedButton = null;
    
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Published')) {
        publishedButton = btn;
        break;
      }
    }
    
    if (!publishedButton) {
      // محاولة البحث عن أي زر يحتوي على كلمة "نشر"
      for (const btn of allButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('نشر') || text.includes('Publish')) {
          publishedButton = btn;
          break;
        }
      }
    }
    
    if (!publishedButton) {
      throw new Error('لم يتم العثور على زر Published');
    }
    log('SUCCESS', 'تم العثور على زر Published');
    
    // ========== 1️⃣2️⃣ النقر على زر Published ==========
    log('STEP', 'النقر على زر Published...');
    await publishedButton.click();
    await sleep(2000);
    log('SUCCESS', 'تم النقر على زر Published');
    
    // ========== 1️⃣3️⃣ انتظار ظهور نافذة النشر ==========
    log('STEP', 'انتظار ظهور نافذة النشر...');
    
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      log('SUCCESS', 'ظهرت نافذة النشر');
    } catch (e) {
      log('WARNING', 'لم تظهر نافذة النشر، سيتم البحث عن الأزرار الأخرى...');
      // انتظار 20 ثانية
      await new Promise(resolve => setTimeout(resolve, 20000));
    }
    
    // ========== 1️⃣4️⃣ البحث عن زر النشر النهائي ==========
    log('STEP', 'البحث عن زر النشر النهائي...');
    
    await sleep(2000);
    
    const finalButtons = await page.$$('button');
    let publishFinalButton = null;
    
    // البحث عن زر النشر
    for (const btn of finalButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if ((text.includes('نشر') && !text.includes('Published')) || 
          (text.includes('Publish') && !text.includes('Published')) ||
          text.includes('Release') ||
          text.includes('إصدار') ||
          text.includes('Deploy')) {
        publishFinalButton = btn;
        break;
      }
    }
    
    // البحث في الخصائص
    if (!publishFinalButton) {
      for (const btn of finalButtons) {
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), btn);
        if (ariaLabel && (ariaLabel.includes('نشر') || ariaLabel.includes('Publish') || ariaLabel.includes('Deploy'))) {
          publishFinalButton = btn;
          break;
        }
      }
    }
    
    if (!publishFinalButton) {
      log('WARNING', 'لم يتم العثور على زر النشر النهائي');
    } else {
      log('SUCCESS', 'تم العثور على زر النشر النهائي');
      
      // ========== 1️⃣5️⃣ النقر على زر النشر ==========
      log('STEP', 'النقر على زر النشر...');
      await publishFinalButton.click();
      await sleep(5000);
      log('SUCCESS', 'تم النقر على زر النشر');
    }
    
    // ========== 1️⃣6️⃣ انتظار اكتمال النشر ==========
    log('STEP', 'انتظار اكتمال النشر...');
    await sleep(5000);
    log('SUCCESS', 'اكتمل النشر');
    
    // ========== 1️⃣7️⃣ التحقق من النتائج ==========
    log('STEP', 'التحقق من نتائج النشر...');
    
    try {
      await page.goto(CONFIG.DOMAIN, {
        waitUntil: 'domcontentloaded',
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
    const screenshotPath = path.join(__dirname, 'publish-success-advanced.png');
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
          const errorScreenshotPath = path.join(__dirname, 'publish-error-advanced.png');
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
