# دليل الميزات المتقدمة

## نظرة عامة

يحتوي هذا الدليل على شرح شامل للميزات المتقدمة التي تم إضافتها إلى نظام إدارة تكاليف الشحن والجمارك الأردنية.

---

## 1. نظام الإشعارات المتقدم

### الميزات الرئيسية

- **WebSocket Real-time**: إشعارات فورية بدون تأخير
- **Push Notifications**: إشعارات فورية على الهاتف
- **Scheduled Notifications**: جدولة الإشعارات للمستقبل
- **Notification History**: سجل كامل للإشعارات

### الاستخدام

```typescript
import { notificationService } from '@/server/advanced-notifications-service';

// إنشاء إشعار جديد
await notificationService.createNotification(
  userId,
  'عنوان الإشعار',
  'محتوى الإشعار',
  'success' // أو 'error', 'warning', 'info'
);

// إرسال إشعار لمجموعة مستخدمين
await notificationService.broadcastNotification(
  [userId1, userId2, userId3],
  'عنوان الإشعار',
  'محتوى الإشعار',
  'info'
);

// الحصول على الإشعارات غير المقروءة
const unreadCount = await notificationService.getUnreadCount(userId);

// تحديد إشعار كمقروء
await notificationService.markAsRead(notificationId);
```

---

## 2. لوحة Analytics المتقدمة

### الرسوم البيانية المتاحة

1. **رسم بياني الإيرادات والمصاريف** - مقارنة يومية
2. **توزيع الرسوم** - رسم بياني دائري
3. **عدد البيانات الجمركية** - رسم بياني عمودي
4. **جدول التفاصيل** - بيانات مفصلة

### مؤشرات الأداء الرئيسية (KPIs)

- إجمالي الإيرادات
- إجمالي المصاريف
- عدد البيانات الجمركية
- متوسط الانحراف

### نطاقات الوقت المتاحة

- أسبوع (7 أيام)
- شهر (30 يوم)
- 3 أشهر (90 يوم)
- سنة (365 يوم)

---

## 3. خدمة التنبيهات الذكية

### القواعس الافتراضية

#### 1. انحراف كبير
- **الشرط**: الانحراف > 15%
- **الخطورة**: تحذير
- **الرسالة**: "تم اكتشاف انحراف كبير"

#### 2. رسوم جمركية عالية
- **الشرط**: الرسوم > 50% من قيمة FOB
- **الخطورة**: تحذير
- **الرسالة**: "الرسوم الجمركية عالية جداً"

#### 3. عدم تطابق الأوزان
- **الشرط**: الفرق > 30%
- **الخطورة**: تحذير
- **الرسالة**: "الفرق بين الأوزان كبير جداً"

#### 4. عدد طرود غير عادي
- **الشرط**: الطرود > 1000 أو < 1
- **الخطورة**: معلومة
- **الرسالة**: "عدد الطرود غير عادي"

#### 5. قيمة FOB منخفضة
- **الشرط**: FOB < 100
- **الخطورة**: معلومة
- **الرسالة**: "قيمة FOB منخفضة جداً"

#### 6. أصناف بدون وصف
- **الشرط**: وجود أصناف بدون اسم
- **الخطورة**: تحذير
- **الرسالة**: "يوجد أصناف بدون وصف"

#### 7. غرامات مرتفعة
- **الشرط**: وجود غرامات
- **الخطورة**: خطأ
- **الرسالة**: "توجد غرامات"

#### 8. تأمين غير كافي
- **الشرط**: التأمين < 0.5% من FOB
- **الخطورة**: تحذير
- **الرسالة**: "التأمين قد يكون غير كافي"

### الاستخدام

```typescript
import { smartAlertsService } from '@/server/smart-alerts-service';

// فحص بيان جمركي واحد
const alerts = await smartAlertsService.checkDeclaration(declarationId, userId);

// فحص جميع البيانات الجمركية
const allAlerts = await smartAlertsService.checkAllDeclarations(userId);

// الحصول على القواعس النشطة
const activeRules = smartAlertsService.getActiveRules();

// تعطيل قاعدة مؤقتاً
smartAlertsService.disableRule('high-variance');

// إعادة تفعيل قاعدة
smartAlertsService.enableRule('high-variance');
```

---

## 4. مكونات UI المحسّنة

### المكونات المتاحة

#### 1. EnhancedToast
إشعار قابل للإغلاق مع إغلاق تلقائي

```typescript
<EnhancedToast
  type="success"
  title="نجاح"
  message="تم حفظ البيانات بنجاح"
  onClose={() => {}}
  autoClose={5000}
/>
```

#### 2. Skeleton
عنصر تحميل هيكلي

```typescript
<Skeleton count={3} height="h-4" width="w-full" />
```

#### 3. EnhancedProgressBar
شريط تقدم محسّن

```typescript
<EnhancedProgressBar value={75} max={100} showLabel={true} color="blue" />
```

#### 4. EnhancedBadge
شارة ملونة

```typescript
<EnhancedBadge label="نشط" variant="success" size="md" />
```

#### 5. EmptyState
حالة فارغة مع رسالة

```typescript
<EmptyState
  title="لا توجد بيانات"
  description="لم يتم العثور على أي بيانات"
  action={{ label: "إضافة جديد", onClick: () => {} }}
/>
```

#### 6. EnhancedTabs
علامات تبويب محسّنة

```typescript
<EnhancedTabs
  items={[
    { label: "الأساسية", content: <div>محتوى 1</div> },
    { label: "المتقدمة", content: <div>محتوى 2</div> },
  ]}
  defaultTab={0}
/>
```

#### 7. EnhancedModal
نافذة حوار محسّنة

```typescript
<EnhancedModal
  isOpen={true}
  title="تأكيد الحذف"
  onClose={() => {}}
  actions={[
    { label: "حذف", onClick: () => {}, variant: "danger" },
    { label: "إلغاء", onClick: () => {}, variant: "secondary" },
  ]}
>
  هل أنت متأكد من الحذف؟
</EnhancedModal>
```

#### 8. EnhancedAlertBox
صندوق تنبيه محسّن

```typescript
<EnhancedAlertBox
  type="warning"
  title="تحذير"
  message="هذا الإجراء قد يؤثر على البيانات"
  onClose={() => {}}
/>
```

---

## 5. خدمة التصدير المتقدمة

### الصيغ المدعومة

- **Excel (.xlsx)** - جداول منسقة
- **PDF** - تقارير احترافية
- **CSV** - للاستيراد في أنظمة أخرى

### الاستخدام

```typescript
import { 
  exportDeclarationToExcel,
  exportDeclarationToPDF,
  exportDeclarationToCSV,
  exportBulkDeclarations
} from '@/server/advanced-export-service';

// تصدير بيان واحد إلى Excel
const result = await exportDeclarationToExcel(declarationId);

// تصدير بيان واحد إلى PDF
const result = await exportDeclarationToPDF(declarationId);

// تصدير بيان واحد إلى CSV
const csv = await exportDeclarationToCSV(declarationId);

// تصدير عدة بيانات دفعة واحدة
const results = await exportBulkDeclarations([id1, id2, id3], 'xlsx');
```

---

## 6. أفضل الممارسات

### 1. استخدام الإشعارات بحكمة

```typescript
// ✅ جيد - إشعار مهم
await notificationService.createNotification(
  userId,
  'غرامة جديدة',
  'تم فرض غرامة على البيان #123',
  'error'
);

// ❌ سيء - إشعارات كثيرة
for (let i = 0; i < 100; i++) {
  await notificationService.createNotification(userId, 'إشعار', 'رسالة', 'info');
}
```

### 2. معالجة الأخطاء

```typescript
// ✅ جيد
try {
  const alerts = await smartAlertsService.checkDeclaration(id, userId);
  // معالجة النتائج
} catch (error) {
  console.error('خطأ في فحص التنبيهات:', error);
  // عرض رسالة خطأ للمستخدم
}
```

### 3. تحسين الأداء

```typescript
// ✅ جيد - استخدام Memoization
const memoizedCheck = useMemo(() => {
  return smartAlertsService.checkDeclaration(id, userId);
}, [id, userId]);
```

---

## 7. الخطوات التالية

1. **دمج Firebase Cloud Messaging** - لإشعارات فورية على الهاتف
2. **إضافة قواعس تنبيه مخصصة** - السماح للمستخدمين بإنشاء قواعسهم الخاصة
3. **تحسين لوحة Analytics** - إضافة رسوم بيانية تفاعلية أكثر
4. **نظام التقارير المجدول** - إرسال تقارير دورية تلقائياً

---

**آخر تحديث**: يناير 2026
**الإصدار**: 3.0.0
