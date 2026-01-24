# دليل التوقيع الرقمي والأيقونات

## نظرة عامة

هذا الدليل يشرح كيفية إعداد التوقيع الرقمي للتطبيق وإدارة الأيقونات.

---

## الأيقونات

### الأيقونات الموجودة

تم التحقق من وجود الأيقونات التالية:

**أيقونات Linux:**
- 16x16 pixels
- 32x32 pixels
- 48x48 pixels
- 64x64 pixels
- 128x128 pixels
- 256x256 pixels
- 512x512 pixels

**أيقونات macOS:**
- 16x16 pixels
- 32x32 pixels
- 48x48 pixels
- 64x64 pixels
- 128x128 pixels
- 256x256 pixels
- 512x512 pixels

**أيقونات Windows:**
- icon.ico (دعم أحجام متعددة)

### متطلبات الأيقونات

**الحد الأدنى:**
- 256x256 pixels للأيقونة الأساسية
- PNG أو ICO format
- خلفية شفافة

**الموصى به:**
- 512x512 pixels للأيقونة الأساسية
- PNG format مع transparency
- تصميم بسيط وواضح
- ألوان متناسقة

### كيفية إنشاء أيقونات جديدة

**الخطوة 1: تصميم الأيقونة**
1. استخدم برنامج تصميم مثل Figma أو Adobe Illustrator
2. ابدأ برسم الأيقونة بحجم 512x512 pixels
3. استخدم ألوان بسيطة وواضحة
4. تأكد من وضوح الأيقونة بأحجام صغيرة

**الخطوة 2: تصدير الأيقونة**
1. صدّر الأيقونة بصيغة PNG مع خلفية شفافة
2. احفظ نسخة بحجم 512x512 pixels

**الخطوة 3: إنشاء أحجام مختلفة**
```bash
# استخدام ImageMagick
convert icon-512.png -resize 256x256 icon-256.png
convert icon-512.png -resize 128x128 icon-128.png
convert icon-512.png -resize 64x64 icon-64.png
convert icon-512.png -resize 48x48 icon-48.png
convert icon-512.png -resize 32x32 icon-32.png
convert icon-512.png -resize 16x16 icon-16.png
```

**الخطوة 4: إنشاء ICO للـ Windows**
```bash
# استخدام ImageMagick
convert icon-256.png icon.ico
```

**الخطوة 5: وضع الأيقونات في المجلدات**
```
assets/
├── icons/
│   ├── linux/
│   │   ├── 16x16.png
│   │   ├── 32x32.png
│   │   ├── 48x48.png
│   │   ├── 64x64.png
│   │   ├── 128x128.png
│   │   ├── 256x256.png
│   │   └── 512x512.png
│   ├── macos/
│   │   ├── 16x16.png
│   │   ├── 32x32.png
│   │   ├── 48x48.png
│   │   ├── 64x64.png
│   │   ├── 128x128.png
│   │   ├── 256x256.png
│   │   └── 512x512.png
│   └── windows/
│       └── icon.ico
```

---

## التوقيع الرقمي

### ما هو التوقيع الرقمي؟

التوقيع الرقمي هو آلية تشفيرية تثبت هوية المطور وتضمن عدم تعديل التطبيق.

**الفوائد:**
- إثبات الهوية والثقة
- حماية من التعديل غير المصرح به
- الامتثال للمعايير الدولية
- تحسين سمعة التطبيق

### أنواع التوقيع

**1. توقيع Electron (Code Signing)**

يستخدم لتوقيع تطبيقات Electron على Windows و macOS.

**2. توقيع Windows**

يستخدم لتوقيع ملفات EXE و MSI على Windows.

**3. توقيع macOS**

يستخدم لتوقيع تطبيقات DMG و PKG على macOS.

**4. توقيع Linux**

يستخدم لتوقيع ملفات AppImage و DEB على Linux.

### الحصول على شهادة التوقيع

**للـ Windows:**
1. اشتر شهادة Code Signing من مزود موثوق (مثل DigiCert أو Sectigo)
2. التكلفة: 200-400 دولار سنويًا
3. المدة: عادة 1-3 سنوات

**للـ macOS:**
1. اشتر شهادة Developer ID من Apple
2. التكلفة: 99 دولار سنويًا
3. المدة: سنة واحدة

**للـ Linux:**
1. استخدم GPG keys (مجاني)
2. إنشاء مفتاح GPG خاص بك
3. توقيع الملفات باستخدام المفتاح

### إعداد التوقيع في Electron

**الخطوة 1: إنشاء المفاتيح (Linux)**

```bash
# إنشاء مفتاح GPG جديد
gpg --gen-key

# تصدير المفتاح العام
gpg --export -a "Your Name" > public-key.asc

# تصدير المفتاح الخاص
gpg --export-secret-key -a "Your Name" > private-key.asc
```

**الخطوة 2: إعداد electron-builder**

```yaml
# electron-builder.yml
appId: com.jordancustoms.system
productName: Jordan Customs System

build:
  files:
    - dist/**/*
    - node_modules/**/*
  directories:
    buildResources: assets

win:
  certificateFile: path/to/certificate.pfx
  certificatePassword: your-password
  signingHashAlgorithms: [sha256]
  sign: ./customSign.js

mac:
  certificateFile: path/to/certificate.p12
  certificatePassword: your-password
  identity: Developer ID Application

linux:
  target:
    - AppImage
    - deb
  artifactName: ${name}-${version}.${ext}
```

**الخطوة 3: إنشاء سكريبت التوقيع المخصص (Windows)**

```javascript
// customSign.js
const { execSync } = require('child_process');

module.exports = async function(configuration) {
  const { path, hash, isNested } = configuration;
  
  // استخدم أداة التوقيع من Windows SDK
  const command = `signtool sign /f certificate.pfx /p password /fd ${hash} /tr http://timestamp.server.com "${path}"`;
  
  execSync(command, { stdio: 'inherit' });
};
```

**الخطوة 4: توقيع الملفات**

```bash
# توقيع ملف على Linux
gpg --detach-sign --armor app-name-1.0.0.AppImage

# التحقق من التوقيع
gpg --verify app-name-1.0.0.AppImage.asc app-name-1.0.0.AppImage

# توقيع ملف على Windows
signtool sign /f certificate.pfx /p password /fd sha256 /tr http://timestamp.server.com app-name-1.0.0.exe

# توقيع ملف على macOS
codesign --deep --force --verify --verbose --sign "Developer ID Application" app-name-1.0.0.dmg
```

### التحقق من التوقيع

**على Linux:**
```bash
# التحقق من التوقيع
gpg --verify file.asc file

# عرض معلومات التوقيع
gpg --list-signatures
```

**على Windows:**
```bash
# التحقق من التوقيع
signtool verify /pa app-name.exe

# عرض معلومات التوقيع
signtool verify /v /pa app-name.exe
```

**على macOS:**
```bash
# التحقق من التوقيع
codesign --verify --verbose=4 app-name.dmg

# عرض معلومات التوقيع
codesign --display --verbose=4 app-name.dmg
```

---

## الأمان والخصوصية

### حماية المفاتيح

**لا تفعل:**
- لا تشارك المفاتيح الخاصة
- لا تضع المفاتيح في GitHub
- لا تستخدم كلمات مرور ضعيفة

**افعل:**
- احفظ المفاتيح في مكان آمن
- استخدم كلمات مرور قوية
- استخدم متغيرات البيئة للمفاتيح
- قم بعمل نسخة احتياطية من المفاتيح

### متغيرات البيئة

```bash
# في GitHub Actions
export WIN_CERTIFICATE_FILE=${{ secrets.WIN_CERTIFICATE_FILE }}
export WIN_CERTIFICATE_PASSWORD=${{ secrets.WIN_CERTIFICATE_PASSWORD }}
export MAC_CERTIFICATE_FILE=${{ secrets.MAC_CERTIFICATE_FILE }}
export MAC_CERTIFICATE_PASSWORD=${{ secrets.MAC_CERTIFICATE_PASSWORD }}
export GPG_PRIVATE_KEY=${{ secrets.GPG_PRIVATE_KEY }}
export GPG_PASSPHRASE=${{ secrets.GPG_PASSPHRASE }}
```

---

## استكشاف الأخطاء

### المشكلة: فشل التوقيع على Windows

**الحل:**
1. تأكد من أن الشهادة صحيحة
2. تأكد من أن كلمة المرور صحيحة
3. تأكد من أن signtool مثبت
4. جرب توقيع ملف بسيط أولاً

### المشكلة: فشل التحقق من التوقيع

**الحل:**
1. تأكد من أن الملف لم يتم تعديله
2. تأكد من أن التوقيع صحيح
3. تأكد من أن المفتاح العام موثوق

### المشكلة: فشل البناء مع التوقيع

**الحل:**
1. تأكد من أن جميع الملفات موجودة
2. تأكد من أن متغيرات البيئة صحيحة
3. جرب البناء بدون توقيع أولاً

---

## الخلاصة

التوقيع الرقمي والأيقونات الصحيحة تحسن من سمعة التطبيق وتوفر أماناً للمستخدمين. تأكد من اتباع أفضل الممارسات وحماية المفاتيح الخاصة بك.

---

## الموارد الإضافية

- [Electron Code Signing](https://www.electron.build/code-signing)
- [Windows Code Signing](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [macOS Code Signing](https://developer.apple.com/support/code-signing/)
- [GPG Documentation](https://gnupg.org/documentation/)
