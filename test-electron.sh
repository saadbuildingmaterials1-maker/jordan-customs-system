#!/bin/bash

# ============================================
# سكريبت اختبار Electron الشامل
# ============================================

set -e

echo "🚀 بدء اختبارات Electron الشاملة..."
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# العد
PASSED=0
FAILED=0

# دالة لطباعة النتائج
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAILED++))
    fi
}

# ============================================
# 1. فحص المتطلبات
# ============================================
echo "1️⃣ فحص المتطلبات..."
echo ""

# فحص Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js غير مثبت"
    exit 1
fi

# فحص pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm: $PNPM_VERSION"
else
    echo "❌ pnpm غير مثبت"
    exit 1
fi

# فحص Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "⚠️  Python غير مثبت (قد يكون مطلوباً)"
fi

echo ""

# ============================================
# 2. تثبيت المكتبات
# ============================================
echo "2️⃣ تثبيت المكتبات..."
echo ""

if [ -d "node_modules" ]; then
    echo "✅ node_modules موجود"
else
    echo "📦 تثبيت المكتبات..."
    pnpm install
fi

echo ""

# ============================================
# 3. بناء التطبيق
# ============================================
echo "3️⃣ بناء التطبيق..."
echo ""

echo "🔨 بناء الواجهة الأمامية..."
pnpm build
print_result $? "بناء الواجهة الأمامية"

echo ""

# ============================================
# 4. فحص ملفات Electron
# ============================================
echo "4️⃣ فحص ملفات Electron..."
echo ""

# فحص electron-main.js
if [ -f "electron-main.js" ]; then
    echo "✅ electron-main.js موجود"
else
    echo "❌ electron-main.js غير موجود"
    ((FAILED++))
fi

# فحص electron-builder.yml
if [ -f "electron-builder.yml" ]; then
    echo "✅ electron-builder.yml موجود"
else
    echo "❌ electron-builder.yml غير موجود"
    ((FAILED++))
fi

# فحص مجلد electron
if [ -d "electron" ]; then
    echo "✅ مجلد electron موجود"
    echo "   محتويات: $(ls electron | wc -l) ملف"
else
    echo "❌ مجلد electron غير موجود"
    ((FAILED++))
fi

echo ""

# ============================================
# 5. اختبار البناء
# ============================================
echo "5️⃣ اختبار البناء..."
echo ""

# فحص نظام التشغيل
OS_TYPE=$(uname -s)

case "$OS_TYPE" in
    Linux*)
        echo "🐧 نظام التشغيل: Linux"
        echo "🔨 بناء AppImage و DEB..."
        
        # بناء AppImage
        if pnpm build:electron:linux 2>/dev/null; then
            print_result 0 "بناء AppImage"
        else
            print_result 1 "بناء AppImage"
        fi
        
        # فحص الملفات المُنتجة
        if [ -f "dist_electron/نظام_إدارة_تكاليف_الشحن_والجمارك-1.0.0.AppImage" ] || [ -f "dist_electron"/*.AppImage ]; then
            echo "✅ ملف AppImage موجود"
            ((PASSED++))
        else
            echo "⚠️  ملف AppImage غير موجود"
            ((FAILED++))
        fi
        ;;
        
    Darwin*)
        echo "🍎 نظام التشغيل: macOS"
        echo "🔨 بناء DMG و ZIP..."
        
        # بناء DMG
        if pnpm build:electron:mac 2>/dev/null; then
            print_result 0 "بناء DMG"
        else
            print_result 1 "بناء DMG"
        fi
        ;;
        
    MINGW*|MSYS*|CYGWIN*)
        echo "🪟 نظام التشغيل: Windows"
        echo "🔨 بناء NSIS و Portable..."
        
        # بناء Windows
        if pnpm build:electron:win 2>/dev/null; then
            print_result 0 "بناء Windows"
        else
            print_result 1 "بناء Windows"
        fi
        ;;
        
    *)
        echo "⚠️  نظام تشغيل غير معروف: $OS_TYPE"
        ;;
esac

echo ""

# ============================================
# 6. اختبار الملفات المُنتجة
# ============================================
echo "6️⃣ اختبار الملفات المُنتجة..."
echo ""

if [ -d "dist_electron" ]; then
    FILE_COUNT=$(ls dist_electron | wc -l)
    echo "✅ مجلد dist_electron موجود"
    echo "   عدد الملفات: $FILE_COUNT"
    echo "   الملفات:"
    ls -lh dist_electron | tail -n +2 | awk '{print "   - " $9 " (" $5 ")"}'
    ((PASSED++))
else
    echo "❌ مجلد dist_electron غير موجود"
    ((FAILED++))
fi

echo ""

# ============================================
# 7. اختبار الحجم
# ============================================
echo "7️⃣ اختبار حجم الملفات..."
echo ""

if [ -d "dist_electron" ]; then
    TOTAL_SIZE=$(du -sh dist_electron | awk '{print $1}')
    echo "📊 إجمالي حجم التطبيقات: $TOTAL_SIZE"
    ((PASSED++))
fi

echo ""

# ============================================
# 8. ملخص النتائج
# ============================================
echo "8️⃣ ملخص النتائج"
echo "================================"
echo -e "${GREEN}✅ نجح: $PASSED${NC}"
echo -e "${RED}❌ فشل: $FAILED${NC}"
echo "================================"

# الحالة النهائية
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 جميع الاختبارات نجحت!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  بعض الاختبارات فشلت${NC}"
    exit 1
fi
