// =============================================
// 🚀 سكربت التحقق العملي والنشر النهائي التلقائي
// التاريخ: 18 فبراير 2026
// =============================================
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import fs from 'fs';

(async () => {
  const URLS = [
    'https://jordan-customs-system.manus.space',
    'https://mp3-app.com',
    'https://www.mp3-app.com'
  ];

  console.log('🚀 بدء التحقق العملي من جميع النطاقات...\n');

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  let allReady = true;
  const results = [];

  for (const url of URLS) {
    console.log(`🔍 التحقق العملي من: ${url}`);
    const result = { url, ready: false, errors: [] };
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 60000 
      });
      
      // التحقق من HTTP Status
      const status = response.status();
      console.log(`  📊 HTTP Status: ${status}`);
      if (status !== 200) {
        result.errors.push(`HTTP Status ${status} (expected 200)`);
        allReady = false;
      }
      
      // التحقق من حالة الصفحة
      const readyState = await page.evaluate(() => document.readyState);
      console.log(`  📄 Document Ready State: ${readyState}`);
      if (readyState !== 'complete') {
        result.errors.push('Page not fully loaded');
        allReady = false;
      }
      
      // التحقق من المحتوى الأساسي
      const title = await page.title();
      console.log(`  📌 Page Title: ${title}`);
      if (!title || title.length === 0) {
        result.errors.push('Empty page title');
        allReady = false;
      }
      
      // التحقق من عدم وجود أخطاء JavaScript
      const jsErrors = [];
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      await page.waitForTimeout(2000); // انتظار 2 ثانية للتحقق من الأخطاء
      
      if (jsErrors.length > 0) {
        console.log(`  ⚠️ JavaScript Errors: ${jsErrors.length}`);
        result.errors.push(`${jsErrors.length} JS errors detected`);
      } else {
        console.log(`  ✅ No JavaScript Errors`);
      }
      
      // التحقق النهائي
      if (result.errors.length === 0) {
        result.ready = true;
        console.log(`  ✅ الصفحة جاهزة وLive\n`);
      } else {
        console.log(`  ❌ المشاكل المكتشفة: ${result.errors.join(', ')}\n`);
        allReady = false;
      }
      
    } catch (err) {
      console.log(`  ❌ خطأ في تحميل الصفحة: ${err.message}\n`);
      result.errors.push(err.message);
      allReady = false;
    }
    
    results.push(result);
  }

  await browser.close();

  // حفظ التقرير
  const reportPath = '/home/ubuntu/jordan-customs-system/puppeteer_verification_report.txt';
  let report = '🚀 تقرير التحقق العملي باستخدام Puppeteer\n';
  report += `التاريخ: ${new Date().toISOString()}\n`;
  report += '==========================================\n\n';
  
  results.forEach(r => {
    report += `النطاق: ${r.url}\n`;
    report += `الحالة: ${r.ready ? '✅ جاهز' : '❌ غير جاهز'}\n`;
    if (r.errors.length > 0) {
      report += `المشاكل:\n${r.errors.map(e => `  - ${e}`).join('\n')}\n`;
    }
    report += '\n';
  });
  
  report += '==========================================\n';
  report += `النتيجة النهائية: ${allReady ? '✅ جميع النطاقات جاهزة' : '❌ بعض النطاقات تحتاج إصلاح'}\n`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`📄 التقرير محفوظ في: ${reportPath}\n`);

  // النشر النهائي إذا كان كل شيء جاهز
  if (allReady) {
    console.log('🚀 كل النطاقات جاهزة! المشروع Live ويعمل بنجاح.');
    console.log('\n🌐 الروابط النشطة:');
    URLS.forEach(url => console.log(`  🔗 ${url}`));
  } else {
    console.log('⚠️ لم يتم تأكيد جاهزية جميع النطاقات. تحقق من المشاكل قبل النشر.');
  }
})();
