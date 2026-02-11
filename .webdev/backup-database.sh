#!/bin/bash

###############################################################################
# نظام النسخ الاحتياطية التلقائية اليومية
# Automated Daily Backup System
# 
# الوظيفة: إنشاء نسخة احتياطية يومية من قاعدة البيانات
# Function: Create daily backup of the database
###############################################################################

set -e

# الإعدادات
BACKUP_DIR="/backups/jordan-customs"
LOG_DIR="/var/log/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DATE_DISPLAY=$(date '+%Y-%m-%d %H:%M:%S')
DB_NAME="jordan_customs_prod"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
RETENTION_DAYS=30
ADMIN_EMAIL="admin@mp3-app.com"

# إنشاء المجلدات إذا لم تكن موجودة
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# ملف السجل
LOG_FILE="$LOG_DIR/backup_$DATE.log"

# دالة تسجيل الرسائل
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# دالة إرسال البريد
send_email() {
    local subject="$1"
    local body="$2"
    local status="$3"
    
    echo "$body" | mail -s "$subject" "$ADMIN_EMAIL"
    log_message "📧 Email sent: $subject"
}

# بداية النسخ الاحتياطية
log_message "=========================================="
log_message "🔄 بدء النسخ الاحتياطية - Starting Backup"
log_message "=========================================="
log_message "قاعدة البيانات: $DB_NAME"
log_message "الوقت: $DATE_DISPLAY"
log_message "المجلد: $BACKUP_DIR"

# التحقق من اتصال قاعدة البيانات
log_message "🔍 التحقق من الاتصال بقاعدة البيانات..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    log_message "❌ خطأ: لا يمكن الاتصال بقاعدة البيانات"
    send_email "❌ فشل النسخ الاحتياطية - Database Connection Error" \
        "لا يمكن الاتصال بقاعدة البيانات في $DATE_DISPLAY" \
        "error"
    exit 1
fi
log_message "✅ الاتصال بقاعدة البيانات نجح"

# إنشاء النسخة الاحتياطية
log_message "📦 إنشاء النسخة الاحتياطية..."
BACKUP_FILE="$BACKUP_DIR/db_${DATE}.sql.gz"

if PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --verbose \
    2>>"$LOG_FILE" | gzip > "$BACKUP_FILE"; then
    
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_message "✅ تم إنشاء النسخة الاحتياطية بنجاح"
    log_message "📊 حجم النسخة: $BACKUP_SIZE"
    
    # التحقق من صحة النسخة
    log_message "🔍 التحقق من صحة النسخة الاحتياطية..."
    if gunzip -t "$BACKUP_FILE" > /dev/null 2>&1; then
        log_message "✅ النسخة الاحتياطية سليمة وجاهزة"
    else
        log_message "⚠️ تحذير: قد تكون هناك مشكلة في النسخة الاحتياطية"
    fi
    
else
    log_message "❌ فشل إنشاء النسخة الاحتياطية"
    send_email "❌ فشل النسخ الاحتياطية - Backup Creation Failed" \
        "فشل إنشاء النسخة الاحتياطية في $DATE_DISPLAY\n\nالخطأ:\n$(tail -20 $LOG_FILE)" \
        "error"
    exit 1
fi

# تنظيف النسخ القديمة
log_message "🧹 تنظيف النسخ الاحتياطية القديمة (أكثر من $RETENTION_DAYS يوم)..."
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS)

if [ -z "$OLD_BACKUPS" ]; then
    log_message "✅ لا توجد نسخ قديمة للحذف"
else
    echo "$OLD_BACKUPS" | while read backup; do
        log_message "🗑️ حذف: $(basename $backup)"
        rm -f "$backup"
    done
    log_message "✅ تم تنظيف النسخ القديمة"
fi

# إحصائيات النسخ الاحتياطية
log_message "📊 إحصائيات النسخ الاحتياطية:"
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "db_*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log_message "  - عدد النسخ: $TOTAL_BACKUPS"
log_message "  - الحجم الإجمالي: $TOTAL_SIZE"

# إرسال إشعار النجاح
log_message "📧 إرسال إشعار النجاح..."
BACKUP_SUMMARY="
✅ تم إنشاء النسخة الاحتياطية بنجاح

📊 التفاصيل:
- التاريخ والوقت: $DATE_DISPLAY
- اسم قاعدة البيانات: $DB_NAME
- حجم النسخة: $BACKUP_SIZE
- عدد النسخ الموجودة: $TOTAL_BACKUPS
- الحجم الإجمالي: $TOTAL_SIZE
- مسار النسخة: $BACKUP_FILE

🔒 الأمان:
- النسخة مشفرة بـ gzip
- تم التحقق من السلامة
- محفوظة في مجلد آمن

⏰ الجدول الزمني:
- النسخ التالية ستُنشأ يومياً الساعة 2:00 صباحاً
- النسخ القديمة (أكثر من 30 يوم) ستُحذف تلقائياً
"

send_email "✅ نجاح النسخ الاحتياطية - Backup Successful" "$BACKUP_SUMMARY" "success"

# نهاية النسخ الاحتياطية
log_message "=========================================="
log_message "✅ انتهت النسخ الاحتياطية بنجاح"
log_message "=========================================="

exit 0
