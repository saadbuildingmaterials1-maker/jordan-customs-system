# 🔗 دليل التكامل - دمج الميزات الجديدة

## نظام إدارة تكاليف الشحن والجمارك الأردنية

---

## 📋 الميزات الجديدة المُضافة

### 1️⃣ نظام التحديثات التلقائي
### 2️⃣ نظام الإبلاغ عن الأخطاء المدمج
### 3️⃣ فيديوهات تعليمية شاملة

---

## 🔧 خطوات التكامل

### المرحلة 1: تحديث ملف routers.ts الرئيسي

في ملف `server/routers.ts`، أضف الـ routers الجديدة:

```typescript
import { updatesRouter } from "./routers/updates";
import { errorsRouter } from "./routers/errors";

export const appRouter = router({
  // الـ routers الموجودة...
  updates: updatesRouter,
  errors: errorsRouter,
});
```

---

### المرحلة 2: تحديث App.tsx

في ملف `client/src/App.tsx`، أضف الـ hooks والمكونات الجديدة:

```typescript
import { useAutoUpdate } from "@/hooks/useAutoUpdate";
import { useErrorReporter } from "@/hooks/useErrorReporter";
import { UpdateDialog } from "@/components/UpdateDialog";
import { ErrorReportDialog } from "@/components/ErrorReportDialog";

export function App() {
  // الـ hooks الموجودة...
  const { showUpdateDialog, setShowUpdateDialog, hasUpdate } = useAutoUpdate();
  const { showDialog: showErrorDialog, setShowDialog: setShowErrorDialog, errorInfo } = useErrorReporter();

  return (
    <>
      {/* المحتوى الرئيسي */}
      <div className="flex-1">
        {/* ... */}
      </div>

      {/* نافذة التحديثات */}
      <UpdateDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog} />

      {/* نافذة الإبلاغ عن الأخطاء */}
      <ErrorReportDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        initialError={errorInfo}
      />
    </>
  );
}
```

---

### المرحلة 3: إضافة زر الإبلاغ عن الأخطاء في القائمة

في ملف `client/src/components/DashboardLayout.tsx` أو أي مكون قائمة:

```typescript
import { useErrorReporter } from "@/hooks/useErrorReporter";
import { AlertTriangle } from "lucide-react";

export function DashboardLayout() {
  const { setShowDialog } = useErrorReporter();

  return (
    <div>
      {/* القائمة الموجودة */}
      
      {/* إضافة زر الإبلاغ عن الأخطاء */}
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
      >
        <AlertTriangle className="h-4 w-4" />
        إرسال تقرير خطأ
      </button>
    </div>
  );
}
```

---

### المرحلة 4: إضافة زر التحديثات في الإعدادات

في ملف `client/src/pages/Settings.tsx`:

```typescript
import { useAutoUpdate } from "@/hooks/useAutoUpdate";
import { Download } from "lucide-react";

export function Settings() {
  const { checkForUpdates } = useAutoUpdate();

  return (
    <div>
      {/* الإعدادات الموجودة */}
      
      {/* قسم التحديثات */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">التحديثات</h3>
        <button
          onClick={() => checkForUpdates()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded"
        >
          <Download className="h-4 w-4" />
          فحص التحديثات
        </button>
      </div>
    </div>
  );
}
```

---

### المرحلة 5: معالجة الأخطاء التلقائية

في ملف `client/src/main.tsx`، أضف معالج الأخطاء العام:

```typescript
import { useErrorReporter } from "@/hooks/useErrorReporter";

// معالج الأخطاء العام
window.addEventListener("error", (event) => {
  const { reportException } = useErrorReporter();
  reportException(event.error);
});

// معالج الأخطاء غير المعالجة
window.addEventListener("unhandledrejection", (event) => {
  const { reportException } = useErrorReporter();
  reportException(new Error(event.reason));
});
```

---

## 📊 جدول التكامل

| المكون | الملف | الحالة | الملاحظات |
|--------|------|--------|----------|
| UpdateChecker | server/updateChecker.ts | ✅ جاهز | منطق التحقق من التحديثات |
| Updates Router | server/routers/updates.ts | ✅ جاهز | API endpoints |
| UpdateDialog | client/src/components/UpdateDialog.tsx | ✅ جاهز | واجهة المستخدم |
| useAutoUpdate | client/src/hooks/useAutoUpdate.ts | ✅ جاهز | Hook للتحديثات |
| ErrorReporter | server/errorReporter.ts | ✅ جاهز | منطق جمع المعلومات |
| Errors Router | server/routers/errors.ts | ✅ جاهز | API endpoints |
| ErrorReportDialog | client/src/components/ErrorReportDialog.tsx | ✅ جاهز | واجهة المستخدم |
| useErrorReporter | client/src/hooks/useErrorReporter.ts | ✅ جاهز | Hook للإبلاغ |
| Integration | App.tsx | ⏳ قيد الانتظار | دمج الميزات |
| Menu Integration | DashboardLayout.tsx | ⏳ قيد الانتظار | إضافة الأزرار |
| Settings Integration | Settings.tsx | ⏳ قيد الانتظار | قسم التحديثات |

---

## 🧪 اختبار التكامل

### اختبار نظام التحديثات:

```bash
# 1. فتح التطبيق
npm run dev

# 2. الضغط على زر "فحص التحديثات"
# 3. التحقق من ظهور نافذة الحوار
# 4. التحقق من عرض معلومات الإصدار الجديد
# 5. الضغط على "تحميل التحديث"
```

### اختبار نظام الإبلاغ عن الأخطاء:

```bash
# 1. فتح التطبيق
npm run dev

# 2. الضغط على زر "إرسال تقرير خطأ"
# 3. ملء بيانات التقرير
# 4. الضغط على "إرسال"
# 5. التحقق من ظهور معرف التقرير
```

---

## 📝 قائمة التحقق

- [ ] تحديث ملف `server/routers.ts`
- [ ] تحديث ملف `client/src/App.tsx`
- [ ] إضافة زر الإبلاغ عن الأخطاء في القائمة
- [ ] إضافة قسم التحديثات في الإعدادات
- [ ] إضافة معالج الأخطاء العام
- [ ] اختبار نظام التحديثات
- [ ] اختبار نظام الإبلاغ عن الأخطاء
- [ ] اختبار على Windows 10
- [ ] اختبار على Windows 11
- [ ] توثيق الميزات الجديدة

---

## 🎯 الخطوات التالية

1. **دمج الميزات الجديدة** في التطبيق الرئيسي
2. **اختبار شامل** على Windows 10 و Windows 11
3. **إنشاء فيديوهات تعليمية** توضح الميزات الجديدة
4. **تحديث التوثيق** مع شرح الميزات الجديدة
5. **إصدار نسخة جديدة** (v1.0.2) مع الميزات الجديدة

---

## 📞 معلومات الاتصال

```
البريد الإلكتروني: support@manus.im
رقم الهاتف: +962 795 917 424
الموقع الإلكتروني: www.jordancustoms.com
GitHub: https://github.com/saadbuildingmaterials1-maker/jordan-customs-system
```

---

**آخر تحديث**: 2026-02-07  
**الإصدار**: v1.0.1  
**الحالة**: 🔄 قيد الإنشاء
