#!/bin/bash

PROJECT_NAME="نظام إدارة تكاليف الشحن والجمارك الأردنية"
VERSION="1.0.1"
RELEASES_DIR="releases"
BUILD_DIR="build"

echo "🔨 بدء بناء تطبيق Windows..."
echo ""

# إنشاء المجلدات
mkdir -p "$RELEASES_DIR" "$BUILD_DIR/app"

echo "📁 نسخ الملفات..."

# نسخ dist
cp -r dist "$BUILD_DIR/app/" 2>/dev/null || echo "⚠️  dist غير موجود"

# نسخ الملفات الأساسية
cp electron-main.js "$BUILD_DIR/app/" 2>/dev/null
cp preload.js "$BUILD_DIR/app/" 2>/dev/null
cp package.json "$BUILD_DIR/app/" 2>/dev/null
cp -r assets "$BUILD_DIR/app/" 2>/dev/null

echo "✅ تم نسخ الملفات"
echo ""

# إنشاء ZIP
echo "📦 إنشاء نسخة محمولة (ZIP)..."
cd "$BUILD_DIR"
zip -r -q "../$RELEASES_DIR/${PROJECT_NAME}-${VERSION}-portable.zip" "app"
cd ..

ZIP_SIZE=$(du -h "$RELEASES_DIR/${PROJECT_NAME}-${VERSION}-portable.zip" | cut -f1)
echo "✅ ZIP: $ZIP_SIZE"
echo ""

# إنشاء TAR.GZ
echo "🗜️  إنشاء أرشيف مضغوط (TAR.GZ)..."
tar -czf "$RELEASES_DIR/${PROJECT_NAME}-${VERSION}.tar.gz" -C "$BUILD_DIR" "app"

TAR_SIZE=$(du -h "$RELEASES_DIR/${PROJECT_NAME}-${VERSION}.tar.gz" | cut -f1)
echo "✅ TAR.GZ: $TAR_SIZE"
echo ""

# إنشاء checksums
echo "🔐 إنشاء checksums..."
cd "$RELEASES_DIR"
sha256sum *.zip *.tar.gz > SHA256SUMS.txt 2>/dev/null
cd ..

echo "✅ تم إنشاء checksums"
echo ""

# طباعة الملخص
echo "============================================================"
echo "✅ تم بناء التطبيق بنجاح!"
echo "============================================================"
echo ""
echo "📦 الملفات المُنشأة:"
echo ""
ls -lh "$RELEASES_DIR"/*.zip "$RELEASES_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "✨ اكتمل البناء بنجاح!"
echo ""

