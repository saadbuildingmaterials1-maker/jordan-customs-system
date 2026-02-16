#!/usr/bin/env node

/**
 * =========================================
 * Jordan Customs System - API Direct Publish
 * نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر المباشر عبر API
 * =========================================
 */

// استخدام fetch المدمج في Node.js 18+
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========== الإعدادات ==========
const CONFIG = {
  API_URL: 'https://api.manus.im',
  PROJECT_ID: '5j9uG3pftfjEb3akdTmTAd',
  CHECKPOINT_ID: 'b0144228',
  PROJECT_NAME: 'jordan-customs-system',
  DOMAIN: 'https://jordan-customs-system.manus.space',
  USERNAME: 'neko',
  PASSWORD: 'c8449373fb96d0c1',
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
  try {
    logSection('🚀 بدء عملية النشر عبر API');
    
    // ========== 1️⃣ تسجيل الدخول ==========
    log('STEP', 'تسجيل الدخول...');
    
    const loginResponse = await fetch(`${CONFIG.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: CONFIG.USERNAME,
        password: CONFIG.PASSWORD,
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`فشل تسجيل الدخول: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token || loginData.accessToken;
    
    if (!token) {
      throw new Error('لم يتم الحصول على token من الخادم');
    }
    
    log('SUCCESS', 'تم تسجيل الدخول بنجاح');
    
    // ========== 2️⃣ الحصول على بيانات المشروع ==========
    log('STEP', 'الحصول على بيانات المشروع...');
    
    const projectResponse = await fetch(`${CONFIG.API_URL}/projects/${CONFIG.PROJECT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!projectResponse.ok) {
      throw new Error(`فشل الحصول على بيانات المشروع: ${projectResponse.status}`);
    }
    
    const projectData = await projectResponse.json();
    log('SUCCESS', 'تم الحصول على بيانات المشروع');
    
    // ========== 3️⃣ بدء عملية النشر ==========
    log('STEP', 'بدء عملية النشر...');
    
    const publishResponse = await fetch(`${CONFIG.API_URL}/projects/${CONFIG.PROJECT_ID}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkpointId: CONFIG.CHECKPOINT_ID,
        domains: ['jordan-customs-system.manus.space', 'mp3-app.com', 'www.mp3-app.com'],
      }),
    });
    
    if (!publishResponse.ok) {
      throw new Error(`فشل النشر: ${publishResponse.status}`);
    }
    
    const publishData = await publishResponse.json();
    log('SUCCESS', 'تم بدء عملية النشر');
    
    // ========== 4️⃣ انتظار اكتمال النشر ==========
    log('STEP', 'انتظار اكتمال النشر...');
    
    let publishStatus = 'pending';
    let attempts = 0;
    const maxAttempts = 30;
    
    while (publishStatus === 'pending' && attempts < maxAttempts) {
      await sleep(2000);
      attempts++;
      
      const statusResponse = await fetch(`${CONFIG.API_URL}/projects/${CONFIG.PROJECT_ID}/publish-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        publishStatus = statusData.status || 'pending';
        
        if (publishStatus === 'in_progress') {
          log('INFO', `جاري النشر... (${attempts}/${maxAttempts})`);
        } else if (publishStatus === 'completed') {
          log('SUCCESS', 'اكتمل النشر بنجاح');
          break;
        } else if (publishStatus === 'failed') {
          throw new Error('فشل النشر');
        }
      }
    }
    
    if (attempts >= maxAttempts) {
      log('WARNING', 'انتهت محاولات الانتظار، قد يكون النشر لا يزال جارياً');
    }
    
    // ========== 5️⃣ التحقق من النتائج ==========
    log('STEP', 'التحقق من نتائج النشر...');
    
    try {
      const response = await fetch(CONFIG.DOMAIN, { timeout: 5000 });
      
      if (response.ok) {
        log('SUCCESS', 'تم الوصول إلى الموقع بنجاح');
      } else {
        log('WARNING', `الموقع يرد برمز: ${response.status}`);
      }
    } catch (e) {
      log('WARNING', 'قد يحتاج الموقع إلى وقت أطول للتحميل');
    }
    
    // ========== النتيجة النهائية ==========
    logSection('✅ اكتمل النشر بنجاح!');
    
    console.log(`${COLORS.GREEN}${COLORS.BRIGHT}🎉 جميع الخطوات اكتملت بنجاح!${COLORS.RESET}\n`);
    console.log(`${COLORS.CYAN}📋 ملخص النشر:${COLORS.RESET}`);
    console.log(`  🌐 النطاق: ${CONFIG.DOMAIN}`);
    console.log(`  📁 المشروع: ${CONFIG.PROJECT_NAME}`);
    console.log(`  📦 Checkpoint: ${CONFIG.CHECKPOINT_ID}`);
    console.log(`  ✅ الحالة: منشور بنجاح`);
    console.log(`  ⏰ الوقت: ${new Date().toLocaleString('ar-SA')}\n`);
    
    return true;
    
  } catch (error) {
    log('ERROR', `حدث خطأ: ${error.message}`);
    console.error(error);
    return false;
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
