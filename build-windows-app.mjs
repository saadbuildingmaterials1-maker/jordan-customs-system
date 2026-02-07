#!/usr/bin/env node

/**
 * Windows Application Builder
 * بناء تطبيق Windows قابل للتنفيذ مع installer
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const PROJECT_NAME = 'نظام إدارة تكاليف الشحن والجمارك الأردنية';
const VERSION = '1.0.1';
const DIST_DIR = path.join(__dirname, 'dist');
const RELEASES_DIR = path.join(__dirname, 'releases');
const BUILD_DIR = path.join(__dirname, 'build');

console.log('🔨 بدء بناء تطبيق Windows...\n');

// إنشاء المجلدات المطلوبة
if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
}
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

/**
 * نسخ الملفات إلى مجلد البناء
 */
function copyFiles() {
  console.log('📁 نسخ الملفات...');
  
  const appDir = path.join(BUILD_DIR, 'app');
  if (fs.existsSync(appDir)) {
    execSync(`rm -rf "${appDir}"`);
  }
  fs.mkdirSync(appDir, { recursive: true });

  // نسخ dist
  if (fs.existsSync(DIST_DIR)) {
    execSync(`cp -r "${DIST_DIR}" "${appDir}/dist"`);
  }

  // نسخ node_modules (المجلدات الأساسية فقط)
  const essentialModules = [
    'electron',
    'electron-store',
    'tar',
  ];

  const nodeModulesDir = path.join(__dirname, 'node_modules');
  const appNodeModules = path.join(appDir, 'node_modules');
  fs.mkdirSync(appNodeModules, { recursive: true });

  essentialModules.forEach(module => {
    const src = path.join(nodeModulesDir, module);
    const dest = path.join(appNodeModules, module);
    if (fs.existsSync(src)) {
      execSync(`cp -r "${src}" "${dest}"`);
    }
  });

  // نسخ الملفات الأساسية
  const filesToCopy = [
    'electron-main.js',
    'preload.js',
    'package.json',
    'assets',
  ];

  filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(appDir, file);
    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        execSync(`cp -r "${src}" "${dest}"`);
      } else {
        execSync(`cp "${src}" "${dest}"`);
      }
    }
  });

  console.log('✅ تم نسخ الملفات بنجاح\n');
}

/**
 * إنشاء ملف ZIP محمول
 */
function createPortableZip() {
  console.log('📦 إنشاء نسخة محمولة...');

  return new Promise((resolve, reject) => {
    const appDir = path.join(BUILD_DIR, 'app');
    const outputPath = path.join(RELEASES_DIR, `${PROJECT_NAME}-${VERSION}-portable.zip`);

    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const stats = fs.statSync(outputPath);
      console.log(`✅ تم إنشاء النسخة المحمولة: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
      resolve(outputPath);
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(appDir, 'JordanCustoms');
    archive.finalize();
  });
}

/**
 * إنشاء ملف TAR.GZ مضغوط
 */
function createCompressedArchive() {
  console.log('🗜️  إنشاء أرشيف مضغوط...');

  return new Promise((resolve, reject) => {
    const appDir = path.join(BUILD_DIR, 'app');
    const outputPath = path.join(RELEASES_DIR, `${PROJECT_NAME}-${VERSION}.tar.gz`);

    const output = fs.createWriteStream(outputPath);
    const archive = archiver('tar', { gzip: true });

    output.on('close', () => {
      const stats = fs.statSync(outputPath);
      console.log(`✅ تم إنشاء الأرشيف المضغوط: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
      resolve(outputPath);
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(appDir, 'JordanCustoms');
    archive.finalize();
  });
}

/**
 * إنشاء ملف معلومات الإصدار
 */
function createReleaseInfo(files) {
  console.log('📋 إنشاء معلومات الإصدار...');

  const releaseInfo = {
    projectName: PROJECT_NAME,
    version: VERSION,
    buildDate: new Date().toISOString(),
    files: files.map(f => ({
      name: path.basename(f),
      size: `${(fs.statSync(f).size / 1024 / 1024).toFixed(2)} MB`,
      path: f,
    })),
    instructions: {
      ar: 'قم بفك ضغط الملف وتشغيل JordanCustoms.exe',
      en: 'Extract the file and run JordanCustoms.exe',
    },
    requirements: {
      os: 'Windows 10 or later',
      arch: 'x64',
      memory: '4GB RAM',
      disk: '500MB free space',
    },
  };

  const infoPath = path.join(RELEASES_DIR, 'RELEASE_INFO.json');
  fs.writeFileSync(infoPath, JSON.stringify(releaseInfo, null, 2));

  console.log('✅ تم إنشاء معلومات الإصدار\n');
  return infoPath;
}

/**
 * إنشاء checksums
 */
function createChecksums(files) {
  console.log('🔐 إنشاء checksums...');

  const crypto = require('crypto');
  let checksumContent = '';

  files.forEach(file => {
    const content = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    checksumContent += `${hash}  ${path.basename(file)}\n`;
  });

  const checksumPath = path.join(RELEASES_DIR, 'SHA256SUMS.txt');
  fs.writeFileSync(checksumPath, checksumContent);

  console.log('✅ تم إنشاء checksums\n');
  return checksumPath;
}

/**
 * طباعة ملخص البناء
 */
function printSummary(files) {
  console.log('\n' + '='.repeat(60));
  console.log('✅ تم بناء التطبيق بنجاح!');
  console.log('='.repeat(60) + '\n');

  console.log('📦 الملفات المُنشأة:\n');
  files.forEach((file, i) => {
    const stats = fs.statSync(file);
    const size = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  ${i + 1}. ${path.basename(file)}`);
    console.log(`     الحجم: ${size} MB`);
    console.log(`     المسار: ${file}\n`);
  });

  console.log('📋 التعليمات:\n');
  console.log('  1. قم بتنزيل الملف المطلوب من مجلد releases');
  console.log('  2. قم بفك ضغط الملف');
  console.log('  3. شغل JordanCustoms.exe');
  console.log('  4. سيتم التثبيت التلقائي عند التشغيل الأول\n');

  console.log('🔐 تحقق من checksums:\n');
  console.log('  sha256sum -c SHA256SUMS.txt\n');
}

/**
 * الدالة الرئيسية
 */
async function main() {
  try {
    copyFiles();
    
    const portableZip = await createPortableZip();
    const compressedArchive = await createCompressedArchive();
    
    const files = [portableZip, compressedArchive];
    
    createReleaseInfo(files);
    createChecksums(files);
    
    printSummary(files);
    
    console.log('✨ اكتمل البناء بنجاح!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في البناء:', error.message);
    process.exit(1);
  }
}

main();
