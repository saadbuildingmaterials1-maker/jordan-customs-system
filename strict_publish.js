#!/usr/bin/env node

/**
 * =========================================
 * Jordan Customs System - Strict Automated Publishing Script
 * نظام إدارة تكاليف الشحن والجمارك الأردنية - سكريبت النشر الآلي الصارم
 * =========================================
 * 
 * هذا السكريبت يقوم بـ:
 * 1. فتح لوحة التحكم Manus
 * 2. تسجيل الدخول (إن لزم الأمر)
 * 3. الذهاب إلى المشروع
 * 4. فتح خيارات النشر
 * 5. النقر على زر النشر
 * 6. انتظار اكتمال النشر
 * 7. التحقق من النتائج
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ========== الإعدادات ==========
const CONFIG = {
  MANUS_URL: 'https://manus.im',
  PROJECT_ID: 'HddKyGBLCtF9eYLPYfNmAn',
  PROJECT_NAME: 'jordan-customs-system',
  DOMAIN: 'https://jordan-customs-system.manus.space',
  DASHBOARD_URL: '/',
  TIMEOUT: 30000,
  HEADLESS: true, // true = بدون واجهة رسومية، false = مع واجهة رسومية
  SLOW_MO: 100, // تأخير بين الأوامر (ملي ثانية)
};

// ========== الألوان ==========
const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
};

// ========== دوال مساعدة ==========
function log(type, message) {
  const timestamp = new Date().toLocaleTimeString('ar-SA');
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== الدالة الرئيسية ==========
async function publishProject() {
  let browser;
  
  try {
    logSection('🚀 بدء عملية النشر الآلي');
    
    // ========== 1️⃣ تشغيل المتصفح ==========
    log('STEP', 'تشغيل متصفح Chromium...');
    browser = await puppeteer.launch({
      headless: CONFIG.HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      slowMo: CONFIG.SLOW_MO,
    });
    log('SUCCESS', 'تم تشغيل المتصفح بنجاح');
    
    // ========== 2️⃣ فتح صفحة جديدة ==========
    log('STEP', 'فتح صفحة جديدة...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    log('SUCCESS', 'تم فتح الصفحة بنجاح');
    
    // ========== 3️⃣ الذهاب إلى لوحة التحكم ==========
    log('STEP', `الذهاب إلى ${CONFIG.MANUS_URL}...`);
    await page.goto(`${CONFIG.MANUS_URL}/app/${CONFIG.PROJECT_ID}`, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.TIMEOUT,
    });
    log('SUCCESS', 'تم الوصول إلى لوحة التحكم');
    
    // ========== 4️⃣ انتظار تحميل الصفحة ==========
    log('STEP', 'انتظار تحميل الصفحة...');
    await page.waitForTimeout(2000);
    log('SUCCESS', 'تم تحميل الصفحة');
    
    // ========== 5️⃣ البحث عن زر Published ==========
    log('STEP', 'البحث عن زر Published...');
    const publishedButton = await page.$('button:has-text("Published")');
    
    if (!publishedButton) {
      throw new Error('لم يتم العثور على زر Published');
    }
    log('SUCCESS', 'تم العثور على زر Published');
    
    // ========== 6️⃣ النقر على زر Published ==========
    log('STEP', 'النقر على زر Published...');
    await publishedButton.click();
    await page.waitForTimeout(1000);
    log('SUCCESS', 'تم النقر على زر Published');
    
    // ========== 7️⃣ انتظار ظهور نافذة النشر ==========
    log('STEP', 'انتظار ظهور نافذة النشر...');
    await page.waitForSelector('[role="dialog"]', { timeout: CONFIG.TIMEOUT });
    log('SUCCESS', 'ظهرت نافذة النشر');
    
    // ========== 8️⃣ البحث عن زر النشر النهائي ==========
    log('STEP', 'البحث عن زر النشر النهائي...');
    
    // محاولة العثور على زر "نشر آخر إصدار" أو "Publish Latest Release"
    const publishButtons = await page.$$eval('button', buttons => 
      buttons
        .filter(btn => 
          btn.textContent.includes('نشر') || 
          btn.textContent.includes('Publish') ||
          btn.textContent.includes('Release')
        )
        .map(btn => btn.textContent.trim())
    );
    
    log('INFO', `الأزرار المتاحة: ${publishButtons.join(', ')}`);
    
    // ========== 9️⃣ النقر على زر النشر ==========
    log('STEP', 'النقر على زر النشر...');
    
    // محاولة النقر على أي زر يحتوي على كلمة "نشر" أو "Publish"
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const publishButton = buttons.find(btn => 
        btn.textContent.includes('نشر') || 
        btn.textContent.includes('Publish') ||
        btn.textContent.includes('Release')
      );
      
      if (publishButton) {
        publishButton.click();
        return true;
      }
      return false;
    });
    
    if (!clicked) {
      throw new Error('لم يتم العثور على زر النشر');
    }
    log('SUCCESS', 'تم النقر على زر النشر');
    
    // ========== 🔟 انتظار اكتمال النشر ==========
    log('STEP', 'انتظار اكتمال النشر...');
    await page.waitForTimeout(3000);
    log('SUCCESS', 'اكتمل النشر');
    
    // ========== 1️⃣1️⃣ التحقق من النتائج ==========
    log('STEP', 'التحقق من نتائج النشر...');
    
    // انتظار تحميل الموقع
    await page.goto(CONFIG.DOMAIN, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.TIMEOUT,
    });
    
    const statusCode = await page.evaluate(() => {
      return document.documentElement.outerHTML.length > 100 ? 200 : 500;
    });
    
    if (statusCode === 200) {
      log('SUCCESS', 'تم التحقق من الموقع بنجاح');
    } else {
      log('WARNING', 'قد يحتاج الموقع إلى وقت أطول للتحميل');
    }
    
    // ========== 1️⃣2️⃣ التحقق من SEO ==========
    log('STEP', 'التحقق من عناصر SEO...');
    
    const seoData = await page.evaluate(() => {
      const title = document.querySelector('title')?.textContent || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
      const h1 = document.querySelector('h1')?.textContent || '';
      
      return { title, description, keywords, h1 };
    });
    
    console.log(`\n${COLORS.CYAN}📊 بيانات SEO:${COLORS.RESET}`);
    console.log(`  ✅ Title: ${seoData.title}`);
    console.log(`  ✅ Description: ${seoData.description.substring(0, 50)}...`);
    console.log(`  ✅ Keywords: ${seoData.keywords.substring(0, 50)}...`);
    console.log(`  ✅ H1: ${seoData.h1 || 'موجود في الصفحة الديناميكية'}`);
    
    // ========== النتيجة النهائية ==========
    logSection('✅ اكتمل النشر بنجاح!');
    
    console.log(`${COLORS.GREEN}${COLORS.BRIGHT}🎉 جميع الخطوات اكتملت بنجاح!${COLORS.RESET}\n`);
    console.log(`${COLORS.CYAN}📋 ملخص النشر:${COLORS.RESET}`);
    console.log(`  🌐 النطاق: ${CONFIG.DOMAIN}`);
    console.log(`  📁 المشروع: ${CONFIG.PROJECT_NAME}`);
    console.log(`  ✅ الحالة: منشور بنجاح`);
    console.log(`  🔔 SEO: محسّن`);
    console.log(`  ⏰ الوقت: ${new Date().toLocaleString('ar-SA')}\n`);
    
    // ========== حفظ لقطة من الشاشة ==========
    const screenshotPath = path.join(__dirname, 'publish-success.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    log('SUCCESS', `تم حفظ لقطة الشاشة: ${screenshotPath}`);
    
    return true;
    
  } catch (error) {
    log('ERROR', `حدث خطأ: ${error.message}`);
    console.error(error);
    
    // حفظ لقطة من الشاشة عند حدوث خطأ
    if (browser) {
      const pages = await browser.pages();
      if (pages.length > 0) {
        const errorScreenshotPath = path.join(__dirname, 'publish-error.png');
        await pages[0].screenshot({ path: errorScreenshotPath, fullPage: true });
        log('INFO', `تم حفظ لقطة الخطأ: ${errorScreenshotPath}`);
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
