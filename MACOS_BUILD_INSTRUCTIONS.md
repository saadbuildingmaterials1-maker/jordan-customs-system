# 🍎 دليل بناء نسخة macOS

---

## ⚠️ **ملاحظة مهمة**

بناء نسخة macOS يتطلب **جهاز Mac** (macOS 10.13 أو أحدث). لا يمكن بناء نسخة macOS من Linux أو Windows.

---

## 🔧 **البناء على جهاز Mac (الطريقة الوحيدة)**

### المتطلبات:
- macOS 10.13 أو أحدث
- Node.js v14+
- npm v6+
- Xcode Command Line Tools

### تثبيت Xcode Command Line Tools:

```bash
xcode-select --install
```

### خطوات البناء:

```bash
# 1. استخراج الملفات
unzip jordan-customs-desktop.zip
cd jordan-customs-desktop

# 2. تثبيت المكتبات
npm install

# 3. بناء نسخة macOS
npm run build:mac
```

### النتائج:
```
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.dmg
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.zip
└── mac/ (ملفات غير مضغوطة)
```

---

## 📦 **محتويات الملفات الناتجة**

### DMG (Disk Image):
```
نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.dmg
```

**الميزات:**
- صورة قرص قابلة للتثبيت
- واجهة تثبيت جميلة
- اختصار إلى مجلد Applications
- سهل الاستخدام

### ZIP:
```
نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.zip
```

**الميزات:**
- ملف مضغوط
- يحتوي على تطبيق macOS
- سهل النقل والمشاركة

---

## 🔐 **التوقيع والتصديق (اختياري)**

### التوقيع الرقمي:

```bash
# تثبيت أداة التوقيع
npm install --save-dev electron-builder-notarize

# تكوين في package.json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name (XXXXXXXXXX)",
    "certificateFile": "path/to/certificate.p12",
    "certificatePassword": "password"
  }
}
```

### التصديق من Apple (Notarization):

```bash
# تثبيت أداة التصديق
npm install --save-dev electron-notarize

# تكوين في package.json
"build": {
  "afterSign": "./notarize.js"
}
```

### ملف `notarize.js`:

```javascript
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productName;
  const appPath = `${appOutDir}/${appName}.app`;

  return await notarize({
    appBundleId: 'com.jordancustoms.desktop',
    appPath: appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
};
```

---

## 🔧 **الخيار البديل: استخدام GitHub Actions**

### ملف `.github/workflows/build-macos.yml`:

```yaml
name: Build macOS

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build macOS
      run: npm run build:mac
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v2
      with:
        name: macos-build
        path: dist/
```

---

## 🐛 **استكشاف الأخطاء**

### خطأ: "Cannot find Xcode"
```bash
الحل:
xcode-select --install
```

### خطأ: "Code signing identity not found"
```bash
الحل:
security find-identity -v -p codesigning
```

### خطأ: "Icon not found"
```
السبب: ملف الأيقونة غير موجود
الحل: تأكد من وجود assets/icon.icns
```

### خطأ: "Cannot find module"
```bash
الحل:
npm install
npm rebuild
```

---

## 📊 **معلومات الملف**

| المعلومة | التفصيل |
|---------|---------|
| **حجم DMG** | ~150-200 MB |
| **حجم ZIP** | ~120-150 MB |
| **وقت البناء** | 10-20 دقيقة |
| **متطلبات التثبيت** | 500 MB |
| **الإصدار** | 1.0.0 |

---

## ✅ **التحقق من الملف**

بعد البناء:

```bash
# التحقق من وجود الملفات
ls -lh dist/

# فتح DMG
open dist/نظام\ إدارة\ تكاليف\ الشحن\ والجمارك\ الأردنية-1.0.0.dmg

# اختبار التطبيق
open dist/mac/نظام\ إدارة\ تكاليف\ الشحن\ والجمارك\ الأردنية.app
```

---

## 🚀 **توزيع التطبيق**

### خيارات التوزيع:

1. **App Store:**
   - تقديم التطبيق إلى Mac App Store
   - متطلبات إضافية للتوقيع والتصديق

2. **التوزيع المباشر:**
   - نشر DMG على موقعك
   - نشر على GitHub Releases
   - نشر على خادم التحديثات

3. **Homebrew:**
   ```bash
   brew install jordancustoms-desktop
   ```

---

## 📞 **الدعم**

للمساعدة:
- 📧 support@jordancustoms.com
- 🌐 https://jordancustoms.com

---

**ملاحظة:** يجب أن يكون لديك جهاز Mac لبناء نسخة macOS! 🍎
