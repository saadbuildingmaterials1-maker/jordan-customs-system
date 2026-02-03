# 🪟 **بناء نسخة Windows من Linux**

---

## ⚠️ **ملاحظة مهمة**

بناء نسخة Windows من Linux يتطلب **Wine** وهو معقد جداً. الحل الأفضل هو:

### **الخيار 1: استخدام Windows مباشرة (الأفضل) ✅**

```bash
# على جهاز Windows:
npm install
npm run build:win

# النتائج:
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-Setup-1.0.0.exe
└── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.exe (Portable)
```

---

### **الخيار 2: استخدام GitHub Actions (موصى به)**

```yaml
# .github/workflows/build-windows.yml
name: Build Windows

on: [push]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build:win
      - uses: actions/upload-artifact@v2
        with:
          name: windows-build
          path: dist/
```

---

### **الخيار 3: استخدام Wine على Linux (معقد)**

```bash
# تثبيت Wine:
sudo apt-get install wine wine32 wine64

# تثبيت المتطلبات:
export WINEPREFIX=~/.wine
winetricks dotnet48

# محاولة البناء:
npm run build:win

# ملاحظة: قد لا ينجح هذا الخيار دائماً
```

---

## 📦 **الملفات المتوقعة**

### **على Windows:**

```
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-Setup-1.0.0.exe (معالج التثبيت)
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.exe (Portable)
└── win-unpacked/ (ملفات غير مضغوطة)
```

---

## 🔧 **الحل الحالي**

تم بناء الملفات غير المضغوطة بنجاح في:
```
dist/win-unpacked/
```

يمكنك:
1. نسخ هذا المجلد إلى جهاز Windows
2. تشغيل `npm run build:win` على Windows
3. أو استخدام GitHub Actions للبناء التلقائي

---

## 📝 **خطوات البناء على Windows**

### **1. التثبيت:**
```bash
git clone <repo>
cd jordan-customs-desktop
npm install
```

### **2. البناء:**
```bash
npm run build:win
```

### **3. النتائج:**
```
dist/
├── نظام إدارة تكاليف الشحن والجمارك الأردنية-Setup-1.0.0.exe
└── نظام إدارة تكاليف الشحن والجمارك الأردنية-1.0.0.exe
```

---

## ✅ **الحل الموصى به**

**استخدم GitHub Actions للبناء التلقائي:**

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

## 📞 **للمساعدة**

```
📧 saad.building.materials1@gmail.com
📱 00962795917424
```

---

*آخر تحديث: فبراير 2026*
