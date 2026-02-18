#!/bin/bash
# Script شامل لمشروع jordan-customs-system
# يقوم بالتحقق الكامل، تسجيل ما تم عمله، وإنتاج تقرير نهائي مع خطوات الإصلاح

REPORT="full_project_report.txt"
echo "تقرير شامل لمشروع jordan-customs-system" > $REPORT
echo "=============================================" >> $REPORT
echo "" >> $REPORT
echo "📌 التاريخ: $(date)" >> $REPORT
echo "" >> $REPORT

# 1️⃣ التحقق من الملفات الأساسية
echo "1️⃣ التحقق من الملفات الأساسية:" >> $REPORT
FILES=("index.html" "tsconfig.json" "package.json" "src" "public")
for f in "${FILES[@]}"; do
    if [ -e "/home/ubuntu/jordan-customs-system/$f" ]; then
        echo "$f: موجود ✅" >> $REPORT
        echo "→ تم التحقق من وجود $f" >> $REPORT
    else
        echo "$f: مفقود ❌" >> $REPORT
        echo "→ يحتاج إنشاء أو رفع $f" >> $REPORT
    fi
done
echo "" >> $REPORT

# 2️⃣ التحقق من Build وأخطاء TypeScript
echo "2️⃣ التحقق من Build وأخطاء TypeScript:" >> $REPORT
cd /home/ubuntu/jordan-customs-system || exit
BUILD_OUTPUT=$(npm run build 2>&1)
echo "$BUILD_OUTPUT" >> $REPORT
if echo "$BUILD_OUTPUT" | grep -q "error"; then
    echo "→ أخطاء موجودة في Build / TypeScript ❌" >> $REPORT
else
    echo "→ Build ناجح ✅" >> $REPORT
fi
echo "" >> $REPORT

# 3️⃣ حالة الخادم والموارد
echo "3️⃣ حالة الخادم والموارد:" >> $REPORT
if systemctl is-active --quiet jordan-customs-system.service; then
    echo "الخادم: يعمل ✅" >> $REPORT
    echo "→ الخادم قيد التشغيل" >> $REPORT
else
    echo "الخادم: متوقف ❌" >> $REPORT
    echo "→ يحتاج إعادة تشغيل" >> $REPORT
fi
echo "استهلاك الذاكرة والمعالج:" >> $REPORT
free -h >> $REPORT
echo "" >> $REPORT

# 4️⃣ التحقق من النطاقات
echo "4️⃣ التحقق من النطاقات:" >> $REPORT
DOMAINS=("jordan-customs-system.manus.space" "mp3-app.com" "www.mp3-app.com")
for d in "${DOMAINS[@]}"; do
    if nslookup $d > /dev/null 2>&1; then
        echo "$d: متصل ✅" >> $REPORT
        echo "→ تم التحقق من DNS لـ $d" >> $REPORT
    else
        echo "$d: غير متصل ❌" >> $REPORT
        echo "→ يحتاج ضبط DNS وربطه في Manus" >> $REPORT
    fi
done
echo "" >> $REPORT

# 5️⃣ التحقق من SSL / HTTPS
echo "5️⃣ التحقق من SSL / HTTPS:" >> $REPORT
for d in "${DOMAINS[@]}"; do
    if openssl s_client -connect "$d:443" -servername "$d" < /dev/null 2>/dev/null | grep -q "Verify return code: 0 (ok)"; then
        echo "$d: SSL مفعل ✅" >> $REPORT
        echo "→ تم تفعيل HTTPS" >> $REPORT
    else
        echo "$d: SSL غير مفعل ❌" >> $REPORT
        echo "→ يحتاج تفعيل SSL داخل Manus" >> $REPORT
    fi
done
echo "" >> $REPORT

# 6️⃣ اختبار الوصول للصفحة
echo "6️⃣ اختبار الوصول للصفحة:" >> $REPORT
for d in "${DOMAINS[@]}"; do
    STATUS=$(curl -o /dev/null -s -w "%{http_code}" "https://$d")
    echo "$d: حالة HTTP = $STATUS" >> $REPORT
    if [ "$STATUS" -eq 200 ]; then
        echo "→ الصفحة تعمل بالكامل ✅" >> $REPORT
    else
        echo "→ المشكلة تحتاج متابعة ❌" >> $REPORT
    fi
done
echo "" >> $REPORT

# 7️⃣ تسجيل كل ما تم عمله لكل مهمة
echo "7️⃣ ما تم عمله فعليًا:" >> $REPORT
echo "→ تحقق من الملفات: تم التحقق من وجود الملفات الأساسية" >> $REPORT
echo "→ Build: تم تنفيذ Build ومراجعة الأخطاء" >> $REPORT
echo "→ الخادم: تم التحقق من تشغيل الخادم ومراقبة الموارد" >> $REPORT
echo "→ النطاقات: تم التحقق من الاتصال وDNS لكل نطاق" >> $REPORT
echo "→ SSL / HTTPS: تم التحقق من حالة الشهادات لكل نطاق" >> $REPORT
echo "→ اختبار الوصول: تم فتح جميع الروابط والتحقق من تحميل الصفحات" >> $REPORT
echo "" >> $REPORT

# 8️⃣ اقتراح خطوات الإصلاح النهائي
echo "8️⃣ خطوات الإصلاح النهائي:" >> $REPORT
echo "→ إصلاح أخطاء TypeScript والمكتبات المفقودة" >> $REPORT
echo "→ تحسين استهلاك الذاكرة أو إعادة تشغيل الخادم" >> $REPORT
echo "→ ربط النطاقات وضبط DNS في Namecheap + التحقق في Manus" >> $REPORT
echo "→ تفعيل SSL وHTTPS لكل النطاقات" >> $REPORT
echo "→ اختبار التطبيق على كل رابط للتأكد من تحميل كامل الصفحة" >> $REPORT
echo "" >> $REPORT

echo "=============================================" >> $REPORT
echo "تم إنشاء التقرير النهائي: $REPORT"
echo "يرجى مراجعة التقرير لمعرفة كل المشاكل وخطوات الإصلاح النهائي."
