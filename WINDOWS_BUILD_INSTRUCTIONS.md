# 🪟 دليل بناء نسخة Windows

---

## ⚠️ **ملاحظة مهمة**

بناء نسخة Windows من بيئة Linux يتطلب **Wine** (محاكي Windows). هذا معقد وقد لا يعمل بشكل مثالي.

**الحل الأفضل:** استخدام جهاز Windows أو macOS للبناء.

---

## 🔧 **الخيار 1: البناء على جهاز Windows (الأفضل)**

### المتطلبات:
- Windows 7 أو أحدث
- Node.js v14+
- npm v6+

### خطوات البناء:

```bash
# 1. استخراج الملفات
unzip jordan-customs-desktop.zip
cd jordan-customs-desktop

# 2. تثبيت المكتبات
npm install

# 3. بناء نسخة Windows
npm run build:win
```

### النتائج:
```
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-Setup-1.0.0.exe
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.exe (Portable)
└── win-unpacked/ (ملفات غير مضغوطة)
```

---

## 🔧 **الخيار 2: البناء على Linux مع Wine**

### المتطلبات:
- Wine (محاكي Windows)
- Node.js v14+
- npm v6+

### تثبيت Wine على Linux:

```bash
# على Ubuntu/Debian:
sudo apt-get update
sudo apt-get install wine wine32 wine64

# على Fedora/RHEL:
sudo dnf install wine

# على Arch:
sudo pacman -S wine
```

### خطوات البناء:

```bash
# 1. الدخول للمجلد
cd jordan-customs-desktop

# 2. تثبيت المكتبات
npm install

# 3. بناء نسخة Windows
npm run build:win
```

### ملاحظات:
- قد يستغرق البناء وقتاً طويلاً (30-60 دقيقة)
- قد تظهر رسائل تحذير من Wine
- قد لا يعمل بشكل مثالي

---

## 🔧 **الخيار 3: استخدام Docker**

### المتطلبات:
- Docker
- Docker Compose

### Dockerfile:

```dockerfile
FROM electronuserland/builder:wine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build:win
```

### خطوات البناء:

```bash
docker build -t jordan-customs-builder .
docker run -v $(pwd)/dist:/app/dist jordan-customs-builder
```

---

## 🔧 **الخيار 4: استخدام GitHub Actions**

### ملف `.github/workflows/build-windows.yml`:

```yaml
name: Build Windows

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: windows-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build Windows
      run: npm run build:win
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v2
      with:
        name: windows-build
        path: dist/
```

---

## 📦 **محتويات الملف الناتج**

### Setup Installer:
```
نظام إدارة تكاليف الشحن والجمارك الأردنية-Setup-1.0.0.exe
```

**الميزات:**
- معالج تثبيت تفاعلي
- إنشاء أيقونة على سطح المكتب
- إنشاء اختصار في قائمة ابدأ
- خيار إزالة التطبيق

### Portable Version:
```
نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.exe
```

**الميزات:**
- ملف واحد فقط
- بدون تثبيت مطلوب
- 100% محمول

---

## 🔐 **التوقيع الرقمي (اختياري)**

لتوقيع الملف بشكل رسمي:

```bash
# تثبيت أداة التوقيع
npm install --save-dev electron-builder-notarize

# تكوين التوقيع في package.json
"build": {
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "password",
    "signingHashAlgorithms": ["sha256"],
    "sign": "./customSign.js"
  }
}
```

---

## 🐛 **استكشاف الأخطاء**

### خطأ: "wine is required"
```
السبب: Wine غير مثبت
الحل: قم بتثبيت Wine أو استخدم Windows/macOS
```

### خطأ: "Cannot find module"
```bash
الحل:
npm install
npm rebuild
```

### خطأ: "Permission denied"
```bash
الحل:
chmod +x dist/*.exe
```

### خطأ: "Icon not found"
```
السبب: ملف الأيقونة غير موجود
الحل: تأكد من وجود assets/icon.ico
```

---

## 📊 **معلومات الملف**

| المعلومة | التفصيل |
|---------|---------|
| **الحجم** | ~150-200 MB |
| **وقت البناء** | 15-30 دقيقة |
| **متطلبات التثبيت** | 500 MB |
| **الإصدار** | 1.0.0 |

---

## ✅ **التحقق من الملف**

بعد البناء:

```bash
# التحقق من وجود الملفات
ls -lh dist/

# اختبار الملف (على Windows)
dist/نظام\ إدارة\ تكاليف\ الشحن\ والجمارك\ الأردنية-1.0.0.exe
```

---

## 📞 **الدعم**

للمساعدة:
- 📧 support@jordancustoms.com
- 🌐 https://jordancustoms.com

---

**ملاحظة:** الطريقة الأفضل والأسرع هي استخدام جهاز Windows أو macOS للبناء! 🚀
