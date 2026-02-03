# 🍎 **بناء نسخة macOS من Linux**

---

## ⚠️ **ملاحظة مهمة**

بناء نسخة macOS من Linux **غير ممكن تقنياً**. يتطلب جهاز Mac فعلي.

---

## ✅ **الحل الموصى به**

### **الخيار 1: استخدام جهاز Mac (الأفضل)**

```bash
# على جهاز Mac:
npm install
npm run build:mac

# النتائج:
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.dmg
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.zip
└── mac/ (ملفات غير مضغوطة)
```

---

### **الخيار 2: استخدام GitHub Actions (موصى به) ✅**

```yaml
# .github/workflows/build-macos.yml
name: Build macOS

on: [push]

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build:mac
      - uses: actions/upload-artifact@v2
        with:
          name: macos-build
          path: dist/
```

---

## 📦 **الملفات المتوقعة**

### **على macOS:**

```
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.dmg (صورة قرص)
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.zip (ملف مضغوط)
└── mac/ (ملفات غير مضغوطة)
```

---

## 🔧 **خطوات البناء على macOS**

### **1. المتطلبات:**
```bash
# تثبيت Xcode Command Line Tools
xcode-select --install

# تثبيت Homebrew (إن لم يكن مثبتاً)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### **2. التثبيت:**
```bash
git clone <repo>
cd jordan-customs-desktop
npm install
```

### **3. البناء:**
```bash
npm run build:mac
```

### **4. النتائج:**
```
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.dmg
└── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.zip
```

---

## 🔐 **التوقيع والتصديق (اختياري)**

### **للتوقيع من Apple:**

```bash
# تعيين شهادة التوقيع
export CSC_IDENTITY_AUTO_DISCOVERY=false
export CSC_NAME="Developer ID Application: Your Name (XXXXXXXXXX)"

# البناء مع التوقيع
npm run build:mac
```

---

## 🚀 **الحل الكامل: GitHub Actions**

```yaml
name: Build All Platforms

on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v2
        with:
          name: ${{ matrix.os }}-build
          path: dist/
```

---

## 📝 **ملاحظات مهمة**

```
✅ البناء على macOS يتطلب جهاز Mac
✅ GitHub Actions هو الحل الأفضل للبناء التلقائي
✅ التوقيع من Apple اختياري لكن موصى به
✅ يمكنك استخدام Homebrew لتثبيت المتطلبات
```

---

## 📞 **للمساعدة**

```
📧 saad.building.materials1@gmail.com
📱 00962795917424
```

---

*آخر تحديث: فبراير 2026*
