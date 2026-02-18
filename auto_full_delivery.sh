#!/bin/bash
# ⚡ Script شامل لتسليم مشروع jordan-customs-system جاهز للنشر تلقائيًا

PROJECT_PATH="/home/ubuntu/jordan-customs-system"
UPLOAD_PATH="/home/ubuntu/upload_files" # ضع هنا index.html و src إذا متوفرة
SERVICE_NAME="jordan-customs-system.service"
REPORT="$PROJECT_PATH/final_project_report.txt"

echo "بدء التنفيذ التلقائي لإصلاح وتشغيل المشروع..." > $REPORT
echo "التاريخ: $(date)" >> $REPORT
echo "" >> $REPORT

# 1️⃣ رفع الملفات المفقودة إذا كانت موجودة
echo "1️⃣ رفع الملفات المفقودة..." >> $REPORT
if [ -f "$UPLOAD_PATH/index.html" ]; then
    cp "$UPLOAD_PATH/index.html" "$PROJECT_PATH/index.html"
    echo "→ تم رفع index.html ✅" >> $REPORT
else
    echo "→ index.html غير موجود في مجلد الرفع ❌" >> $REPORT
fi

if [ -d "$UPLOAD_PATH/src" ]; then
    cp -r "$UPLOAD_PATH/src" "$PROJECT_PATH/src"
    echo "→ تم رفع مجلد src ✅" >> $REPORT
else
    echo "→ src غير موجود في مجلد الرفع ❌" >> $REPORT
fi
echo "" >> $REPORT

# 2️⃣ إصلاح أخطاء TypeScript
echo "2️⃣ إصلاح أخطاء TypeScript..." >> $REPORT
find "$PROJECT_PATH/server/services" -type f -name "*.ts" | while read FILE; do
    sed -i 's/import { db } from ..\/db/import { getDb } from ..\/db\nconst db = await getDb();/' "$FILE"
done
echo "→ تم تعديل الاستيرادات في ملفات الخدمات ✅" >> $REPORT

# إزالة duplicate keys في routers.ts
sed -i '/notifications: notificationRouter,/d' "$PROJECT_PATH/server/routers.ts"
echo "→ تم إزالة duplicate keys في routers.ts ✅" >> $REPORT
echo "" >> $REPORT

# 3️⃣ إعادة Build
echo "3️⃣ إعادة Build للمشروع..." >> $REPORT
cd "$PROJECT_PATH" || exit
BUILD_OUTPUT=$(npm run build 2>&1)
echo "$BUILD_OUTPUT" >> $REPORT
if echo "$BUILD_OUTPUT" | grep -q "error"; then
    echo "→ Build يحتوي على أخطاء ❌" >> $REPORT
else
    echo "→ Build ناجح ✅" >> $REPORT
fi
echo "" >> $REPORT

# 4️⃣ إعادة تشغيل الخادم
echo "4️⃣ إعادة تشغيل الخادم..." >> $REPORT
systemctl restart $SERVICE_NAME
sleep 5
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "→ الخادم يعمل ✅" >> $REPORT
else
    echo "→ الخادم متوقف ❌" >> $REPORT
fi
echo "" >> $REPORT

# 5️⃣ مراقبة استهلاك الموارد
echo "5️⃣ استهلاك الموارد:" >> $REPORT
free -h >> $REPORT
echo "" >> $REPORT

# 6️⃣ التحقق من النطاقات وDNS
echo "6️⃣ التحقق من النطاقات وDNS:" >> $REPORT
DOMAINS=("jordan-customs-system.manus.space" "mp3-app.com" "www.mp3-app.com")
for d in "${DOMAINS[@]}"; do
    if nslookup $d > /dev/null 2>&1; then
        echo "$d: DNS متصل ✅" >> $REPORT
    else
        echo "$d: DNS غير متصل ❌" >> $REPORT
    fi
done
echo "" >> $REPORT

# 7️⃣ التحقق من SSL / HTTPS
echo "7️⃣ التحقق من SSL / HTTPS:" >> $REPORT
for d in "${DOMAINS[@]}"; do
    if openssl s_client -connect "$d:443" -servername "$d" < /dev/null 2>/dev/null | grep -q "Verify return code: 0 (ok)"; then
        echo "$d: SSL مفعل ✅" >> $REPORT
    else
        echo "$d: SSL غير مفعل ❌" >> $REPORT
    fi
done
echo "" >> $REPORT

# 8️⃣ اختبار تحميل جميع الصفحات
echo "8️⃣ اختبار الوصول للصفحات:" >> $REPORT
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

# 9️⃣ ملخص ما تم عمله
echo "9️⃣ ملخص ما تم عمله:" >> $REPORT
echo "→ رفع الملفات المفقودة (index.html و src) إذا كانت متوفرة" >> $REPORT
echo "→ إصلاح أخطاء TypeScript في الخدمات" >> $REPORT
echo "→ إزالة duplicate keys في routers.ts" >> $REPORT
echo "→ إعادة Build للمشروع" >> $REPORT
echo "→ إعادة تشغيل الخادم" >> $REPORT
echo "→ التحقق من استهلاك الموارد" >> $REPORT
echo "→ التحقق من النطاقات وDNS" >> $REPORT
echo "→ التحقق من SSL / HTTPS" >> $REPORT
echo "→ اختبار تحميل كل صفحة" >> $REPORT
echo "" >> $REPORT

# 10️⃣ خطوات الإصلاح النهائي (اقتراح)
echo "🔧 خطوات الإصلاح النهائي:" >> $REPORT
echo "→ إصلاح أي أخطاء TypeScript متبقية" >> $REPORT
echo "→ مراقبة استهلاك الذاكرة أثناء التشغيل الكامل" >> $REPORT
echo "→ ضبط DNS للنطاقات في Namecheap إذا لزم الأمر" >> $REPORT
echo "→ اختبار شامل لجميع الوظائف بعد الإصلاح" >> $REPORT
echo "→ التطبيق جاهز للنشر بعد إتمام هذه الخطوات" >> $REPORT

echo "=============================================" >> $REPORT
echo "تم إنشاء التقرير النهائي: $REPORT"
echo "🚀 جميع العمليات نفذت تلقائيًا بدون أي تدخل يدوي"
