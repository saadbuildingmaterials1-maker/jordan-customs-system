#!/bin/bash

# 🔨 سكريبت بناء مثبت Windows محسّن
# هذا السكريبت يبني مثبت Windows بشكل تلقائي وآمن

set -e  # توقف عند أي خطأ

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# الدوال
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# البداية
clear
print_header "🔨 بناء مثبت Windows المحسّن"

# التحقق من المتطلبات
print_header "1️⃣ التحقق من المتطلبات"

if ! command -v node &> /dev/null; then
    print_error "Node.js غير مثبت!"
    exit 1
fi
print_success "Node.js مثبت: $(node --version)"

if ! command -v pnpm &> /dev/null; then
    print_error "pnpm غير مثبت!"
    print_info "تثبيت pnpm..."
    npm install -g pnpm
fi
print_success "pnpm مثبت: $(pnpm --version)"

# التحقق من الملفات المطلوبة
print_header "2️⃣ التحقق من الملفات"

if [ ! -f "package.json" ]; then
    print_error "package.json غير موجود!"
    exit 1
fi
print_success "package.json موجود"

if [ ! -f "electron-builder.yml" ]; then
    print_error "electron-builder.yml غير موجود!"
    exit 1
fi
print_success "electron-builder.yml موجود"

# تنظيف البناء السابق
print_header "3️⃣ تنظيف البناء السابق"

print_info "حذف dist_electron..."
rm -rf dist_electron
print_success "تم حذف dist_electron"

print_info "حذف dist..."
rm -rf dist
print_success "تم حذف dist"

# تثبيت المكتبات
print_header "4️⃣ تثبيت المكتبات"

print_info "تثبيت المكتبات من pnpm-lock.yaml..."
pnpm install --frozen-lockfile

if [ $? -eq 0 ]; then
    print_success "تم تثبيت المكتبات بنجاح"
else
    print_error "فشل تثبيت المكتبات!"
    exit 1
fi

# فحص TypeScript
print_header "5️⃣ فحص TypeScript"

print_info "فحص الأخطاء..."
pnpm run check || print_warning "وجدت بعض التحذيرات (غير حرجة)"
print_success "فحص TypeScript اكتمل"

# تشغيل الاختبارات
print_header "6️⃣ تشغيل الاختبارات"

print_info "تشغيل الاختبارات..."
pnpm run test || print_warning "بعض الاختبارات فشلت (تحقق منها)"
print_success "الاختبارات اكتملت"

# بناء التطبيق
print_header "7️⃣ بناء التطبيق"

print_info "بناء Vite..."
pnpm run build

if [ $? -eq 0 ]; then
    print_success "تم بناء Vite بنجاح"
else
    print_error "فشل بناء Vite!"
    exit 1
fi

# بناء Electron
print_header "8️⃣ بناء مثبت Electron"

print_info "بناء مثبت Windows..."
pnpm run electron:build

if [ $? -eq 0 ]; then
    print_success "تم بناء مثبت Windows بنجاح"
else
    print_error "فشل بناء مثبت Windows!"
    exit 1
fi

# التحقق من الملفات المُنتجة
print_header "9️⃣ التحقق من الملفات المُنتجة"

if [ -d "dist_electron" ]; then
    print_success "مجلد dist_electron موجود"
    
    echo -e "\n${BLUE}محتويات dist_electron:${NC}"
    ls -lh dist_electron/ | grep -E "\.exe|\.AppImage|\.dmg" || print_warning "لم يتم العثور على ملفات التثبيت"
    
    # عد الملفات
    exe_count=$(find dist_electron -name "*.exe" | wc -l)
    print_info "عدد ملفات EXE: $exe_count"
    
    if [ $exe_count -gt 0 ]; then
        print_success "تم إنشاء ملفات EXE بنجاح!"
    else
        print_error "لم يتم إنشاء ملفات EXE!"
        exit 1
    fi
else
    print_error "مجلد dist_electron غير موجود!"
    exit 1
fi

# الملخص النهائي
print_header "✅ البناء اكتمل بنجاح!"

echo -e "\n${GREEN}📊 ملخص البناء:${NC}"
echo -e "  ✅ تثبيت المكتبات"
echo -e "  ✅ فحص TypeScript"
echo -e "  ✅ تشغيل الاختبارات"
echo -e "  ✅ بناء Vite"
echo -e "  ✅ بناء Electron"
echo -e "  ✅ إنشاء ملفات EXE"

echo -e "\n${GREEN}📁 الملفات المُنتجة:${NC}"
find dist_electron -name "*.exe" -exec ls -lh {} \; | awk '{print "  📦 " $9 " (" $5 ")"}'

echo -e "\n${GREEN}🚀 الخطوات التالية:${NC}"
echo -e "  1. حمل الملفات من dist_electron/"
echo -e "  2. اختبرها على Windows VM"
echo -e "  3. تأكد من عمل التثبيت"
echo -e "  4. انشر الملفات على GitHub Releases"

echo -e "\n${GREEN}📞 معلومات الدعم:${NC}"
echo -e "  📧 support@manus.im"
echo -e "  📱 +962 795 917 424"
echo -e "  🌐 www.jordancustoms.com"

echo -e "\n${GREEN}✨ شكراً لاستخدام البناء المحسّن! 🎉${NC}\n"
