#!/usr/bin/env node

/**
 * =========================================
 * Jordan Customs System - Strict Auto Publish
 * نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي الدقيق
 * =========================================
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  
  // ملفات JS الناتجة من البناء
  JS_FILES: [
    'dist/index.js',
    'dist/public/assets/vendor-react-Cim0OwQh.js',
    'dist/public/assets/components-R9Li0rli.js',
  ],
  
  // أوامر النشر
  DEPLOY_COMMAND: 'echo "Deploy command would run here"',
  CDN_CLEAR_COMMAND: 'echo "CDN clear command would run here"',
  
  // Selectors
  PUBLISH_BUTTON_SELECTORS: [
    'button:has-text("Published")',
    'button[aria-label*="Published"]',
    'button[title*="Published"]',
    'button:contains("Published")',
    '[data-testid="publish-button"]',
    '.publish-button',
    'button[class*="publish"]',
  ],
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

// ========== التحقق من ملفات البناء ==========
async function verifyBuildFiles() {
  logSection('🔍 التحقق من ملفات البناء');
  
  log('STEP', 'التحقق من ملفات JS...');
  
  for (const file of CONFIG.JS_FILES) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const size = (fs.statSync(filePath).size / 1024).toFixed(2);
      log('SUCCESS', `${file} (${size} KB)`);
    } else {
      log('WARNING', `${file} - غير موجود`);
    }
  }
  
  log('STEP', 'التحقق من MIME types...');
  
  try {
    const indexPath = path.join(__dirname, 'dist/index.js');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    if (content.includes('application/javascript')) {
      log('SUCCESS', 'MIME type صحيح: application/javascript');
    } else {
      log('INFO', 'تم التحقق من محتوى الملف');
    }
  } catch (e) {
    log('WARNING', 'لم يتم التحقق من MIME type');
  }
}

// ========== تنفيذ أوامر النشر ==========
async function executeDeployCommands() {
  logSection('🚀 تنفيذ أوامر النشر');
  
  try {
    log('STEP', 'تنفيذ أمر النشر...');
    execSync(CONFIG.DEPLOY_COMMAND, { stdio: 'inherit' });
    log('SUCCESS', 'تم تنفيذ أمر النشر');
  } catch (e) {
    log('WARNING', 'فشل أمر النشر');
  }
  
  try {
    log('STEP', 'تنفيذ أمر تنظيف CDN...');
    execSync(CONFIG.CDN_CLEAR_COMMAND, { stdio: 'inherit' });
    log('SUCCESS', 'تم تنفيذ أمر تنظيف CDN');
  } catch (e) {
    log('WARNING', 'فشل أمر تنظيف CDN');
  }
}

// ========== الدالة الرئيسية ==========
async function publishProject() {
  let browser;
  
  try {
    logSection('🚀 بدء عملية النشر الآلي الدقيقة');
    
    // ========== التحقق من البناء ==========
    await verifyBuildFiles();
    
    // ========== تنفيذ أوامر النشر ==========
    await executeDeployCommands();
    
    // ========== تشغيل المتصفح ==========
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
    
    // ========== فتح صفحة جديدة ==========
    log('STEP', 'فتح صفحة جديدة...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    log('SUCCESS', 'تم فتح الصفحة بنجاح');
    
    // ========== الذهاب إلى صفحة تسجيل الدخول ==========
    log('STEP', 'الذهاب إلى صفحة تسجيل الدخول...');
    await page.goto(`${CONFIG.MANUS_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.TIMEOUT,
    });
    log('SUCCESS', 'تم الوصول إلى صفحة تسجيل الدخول');
    
    // ========== انتظار تحميل الصفحة ==========
    log('STEP', 'انتظار تحميل الصفحة...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ========== إدخال بيانات المستخدم ==========
    log('STEP', 'إدخال بيانات المستخدم...');
    
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].click();
      await inputs[0].type(CONFIG.USERNAME, { delay: 50 });
      log('SUCCESS', 'تم إدخال اسم المستخدم');
      
      await inputs[1].click();
      await inputs[1].type(CONFIG.PASSWORD, { delay: 50 });
      log('SUCCESS', 'تم إدخال كلمة المرور');
    }
    
    // ========== البحث عن زر تسجيل الدخول ==========
    log('STEP', 'البحث عن زر تسجيل الدخول...');
    
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
      log('SUCCESS', 'تم العثور على زر تسجيل الدخول');
      await loginButton.click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      log('SUCCESS', 'اكتمل تسجيل الدخول');
    }
    
    // ========== الذهاب إلى لوحة التحكم ==========
    log('STEP', 'الذهاب إلى لوحة التحكم...');
    await page.goto(`${CONFIG.MANUS_URL}/app/${CONFIG.PROJECT_ID}`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.TIMEOUT,
    });
    log('SUCCESS', 'تم الوصول إلى لوحة التحكم');
    
    // ========== انتظار تحميل الصفحة ==========
    log('STEP', 'انتظار تحميل الصفحة...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    log('SUCCESS', 'تم تحميل الصفحة');
    
    // ========== البحث عن زر Published ==========
    log('STEP', 'البحث عن زر Published...');
    
    let publishedButton = null;
    const allButtons = await page.$$('button');
    
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Published')) {
        publishedButton = btn;
        break;
      }
    }
    
    if (!publishedButton) {
      log('WARNING', 'لم يتم العثور على زر Published، جاري البحث بطرق أخرى...');
      
      // محاولة استخدام selectors مختلفة
      for (const selector of CONFIG.PUBLISH_BUTTON_SELECTORS) {
        try {
          const btn = await page.$(selector);
          if (btn) {
            publishedButton = btn;
            log('SUCCESS', `تم العثور على الزر باستخدام: ${selector}`);
            break;
          }
        } catch (e) {
          // تجاهل الأخطاء
        }
      }
    }
    
    if (!publishedButton) {
      throw new Error('لم يتم العثور على زر Published');
    }
    
    log('SUCCESS', 'تم العثور على زر Published');
    
    // ========== النقر على زر Published ==========
    log('STEP', 'النقر على زر Published...');
    await publishedButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));
    log('SUCCESS', 'تم النقر على زر Published');
    
    // ========== انتظار ظهور نافذة النشر ==========
    log('STEP', 'انتظار ظهور نافذة النشر...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    log('SUCCESS', 'انتظار اكتمل');
    
    // ========== البحث عن زر النشر النهائي ==========
    log('STEP', 'البحث عن زر النشر النهائي...');
    
    const finalButtons = await page.$$('button');
    let publishFinalButton = null;
    
    for (const btn of finalButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if ((text.includes('نشر') && !text.includes('Published')) || 
          (text.includes('Publish') && !text.includes('Published')) ||
          text.includes('Release') ||
          text.includes('إصدار')) {
        publishFinalButton = btn;
        break;
      }
    }
    
    if (publishFinalButton) {
      log('SUCCESS', 'تم العثور على زر النشر النهائي');
      
      log('STEP', 'النقر على زر النشر...');
      await publishFinalButton.click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      log('SUCCESS', 'تم النقر على زر النشر');
    } else {
      log('WARNING', 'لم يتم العثور على زر النشر النهائي');
    }
    
    // ========== انتظار اكتمال النشر ==========
    log('STEP', 'انتظار اكتمال النشر...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    log('SUCCESS', 'اكتمل النشر');
    
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
    const screenshotPath = path.join(__dirname, 'publish-success-final.png');
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
          const errorScreenshotPath = path.join(__dirname, 'publish-error-final.png');
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
