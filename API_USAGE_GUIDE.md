# دليل استخدام API - نظام إدارة تكاليف الشحن والجمارك الأردنية

## مقدمة

هذا النظام يستخدم **tRPC** - وهو إطار عمل حديث يوفر:
- ✅ Type-safe API calls
- ✅ Automatic validation
- ✅ Built-in error handling
- ✅ Real-time type hints

## جدول المحتويات

1. [المصادقة](#المصادقة)
2. [البيانات الجمركية](#البيانات-الجمركية)
3. [إدارة الأصناف](#إدارة-الأصناف)
4. [الانحرافات والتحليل](#الانحرافات-والتحليل)
5. [الملخصات المالية](#الملخصات-المالية)
6. [استيراد PDF](#استيراد-pdf)
7. [الإشعارات](#الإشعارات)
8. [تتبع الحاويات](#تتبع-الحاويات)
9. [الدفع والفواتير](#الدفع-والفواتير)
10. [معالجة الأخطاء](#معالجة-الأخطاء)

---

## المصادقة

### الحصول على بيانات المستخدم الحالي

```typescript
const { data: user } = trpc.auth.me.useQuery();

if (user) {
  console.log(`مرحباً ${user.name}`);
  console.log(`الدور: ${user.role}`);
}
```

### تسجيل الخروج

```typescript
const { mutate: logout } = trpc.auth.logout.useMutation({
  onSuccess: () => {
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = '/login';
  },
});

logout();
```

---

## البيانات الجمركية

### إنشاء بيان جمركي جديد

```typescript
const { mutate: createDeclaration } = trpc.customs.createDeclaration.useMutation({
  onSuccess: (declaration) => {
    console.log('تم إنشاء البيان:', declaration.id);
    // تحديث قائمة البيانات
    utils.customs.listDeclarations.invalidate();
  },
  onError: (error) => {
    console.error('خطأ:', error.message);
  },
});

createDeclaration({
  declarationNumber: 'DEC-2026-001',
  registrationDate: new Date().toISOString(),
  clearanceCenter: 'عمّان',
  exchangeRate: 0.71,
  exportCountry: 'الإمارات',
  billOfLadingNumber: 'BL-123456',
  grossWeight: 1000,
  netWeight: 950,
  numberOfPackages: 50,
  packageType: 'كرتون',
  fobValue: 10000,
  freightCost: 500,
  insuranceCost: 100,
  customsDuty: 2000,
  additionalFees: 200,
  customsServiceFee: 150,
  penalties: 0,
});
```

### الحصول على قائمة البيانات الجمركية

```typescript
const { data: declarations, isLoading } = trpc.customs.listDeclarations.useQuery();

if (isLoading) return <div>جاري التحميل...</div>;

return (
  <ul>
    {declarations?.map((decl) => (
      <li key={decl.id}>{decl.declarationNumber}</li>
    ))}
  </ul>
);
```

### الحصول على بيان جمركي محدد

```typescript
const { data: declaration } = trpc.customs.getDeclaration.useQuery({
  id: 123,
});

console.log(declaration?.totalLandedCost);
```

### تحديث بيان جمركي

```typescript
const { mutate: updateDeclaration } = trpc.customs.updateDeclaration.useMutation();

updateDeclaration({
  id: 123,
  data: {
    status: 'submitted',
    notes: 'تم التحقق من البيانات',
  },
});
```

### حذف بيان جمركي

```typescript
const { mutate: deleteDeclaration } = trpc.customs.deleteDeclaration.useMutation();

deleteDeclaration({ id: 123 });
```

---

## إدارة الأصناف

### إضافة صنف جديد

```typescript
const { mutate: createItem } = trpc.items.createItem.useMutation({
  onSuccess: () => {
    utils.items.getItems.invalidate();
  },
});

createItem({
  declarationId: 123,
  itemName: 'أجهزة إلكترونية',
  quantity: 100,
  unitPriceForeign: 50,
});
```

### الحصول على أصناف البيان

```typescript
const { data: items } = trpc.items.getItems.useQuery({
  declarationId: 123,
});

items?.forEach((item) => {
  console.log(`${item.itemName}: ${item.quantity} وحدة`);
});
```

### تحديث صنف

```typescript
const { mutate: updateItem } = trpc.items.updateItem.useMutation();

updateItem({
  id: 456,
  itemName: 'أجهزة إلكترونية - محدثة',
  quantity: 120,
});
```

### حذف صنف

```typescript
const { mutate: deleteItem } = trpc.items.deleteItem.useMutation();

deleteItem({ id: 456 });
```

---

## الانحرافات والتحليل

### الحصول على الانحرافات

```typescript
const { data: variances } = trpc.variances.getVariances.useQuery({
  declarationId: 123,
});

variances?.forEach((variance) => {
  console.log(`${variance.varianceType}: ${variance.variancePercentage}%`);
});
```

### إضافة ملاحظة انحراف

```typescript
const { mutate: addVarianceNote } = trpc.variances.addVarianceNote.useMutation();

addVarianceNote({
  varianceId: 789,
  note: 'الانحراف بسبب تقلبات سعر الصرف',
});
```

---

## الملخصات المالية

### الحصول على الملخص المالي

```typescript
const { data: summary } = trpc.financialSummary.getSummary.useQuery({
  declarationId: 123,
});

console.log(`إجمالي التكلفة: ${summary?.totalLandedCost} دينار`);
console.log(`الرسوم الجمركية: ${summary?.totalCustomsAndTaxes} دينار`);
```

---

## استيراد PDF

### استيراد بيان من ملف PDF

```typescript
const { mutate: importPdf } = trpc.pdfImport.importDeclaration.useMutation({
  onSuccess: (result) => {
    if (result.success) {
      console.log('تم الاستيراد بنجاح');
      console.log('مستوى الثقة:', result.confidence);
    } else {
      console.log('أخطاء التحقق:', result.validationErrors);
    }
  },
});

importPdf({
  filePath: '/path/to/declaration.pdf',
});
```

---

## الإشعارات

### الحصول على الإشعارات

```typescript
const { data: notifications } = trpc.notifications.getNotifications.useQuery({
  limit: 50,
  offset: 0,
});

notifications?.forEach((notif) => {
  console.log(notif.message);
});
```

### عد الإشعارات غير المقروءة

```typescript
const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery();

console.log(`لديك ${unreadCount} إشعارات غير مقروءة`);
```

### تحديد إشعار كمقروء

```typescript
const { mutate: markAsRead } = trpc.notifications.markAsRead.useMutation();

markAsRead({ notificationId: 999 });
```

### تحديد جميع الإشعارات كمقروءة

```typescript
const { mutate: markAllAsRead } = trpc.notifications.markAllAsRead.useMutation();

markAllAsRead();
```

### حذف إشعار

```typescript
const { mutate: deleteNotification } = trpc.notifications.delete.useMutation();

deleteNotification({ notificationId: 999 });
```

---

## تتبع الحاويات

### إنشاء حاوية جديدة

```typescript
const { mutate: createContainer } = trpc.tracking.createContainer.useMutation();

createContainer({
  containerNumber: 'CONT-123456',
  containerType: '40ft',
  shippingCompany: 'Maersk',
  billOfLadingNumber: 'BL-789',
  portOfLoading: 'دبي',
  portOfDischarge: 'العقبة',
  sealNumber: 'SEAL-001',
  loadingDate: new Date().toISOString(),
  estimatedArrivalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
});
```

### الحصول على الحاويات

```typescript
const { data: containers } = trpc.tracking.getContainers.useQuery();

containers?.forEach((container) => {
  console.log(`${container.containerNumber}: ${container.status}`);
});
```

### البحث عن حاوية

```typescript
const { data: results } = trpc.tracking.searchContainers.useQuery({
  query: 'CONT-123',
});
```

### إضافة حدث تتبع

```typescript
const { mutate: addTrackingEvent } = trpc.tracking.addTrackingEvent.useMutation();

addTrackingEvent({
  containerId: 123,
  eventType: 'departed',
  eventLocation: 'ميناء دبي',
  eventDescription: 'غادرت الحاوية الميناء',
  eventDateTime: new Date().toISOString(),
});
```

### الحصول على سجل التتبع

```typescript
const { data: history } = trpc.tracking.getTrackingHistory.useQuery({
  containerId: 123,
});

history?.forEach((event) => {
  console.log(`${event.eventType}: ${event.eventLocation}`);
});
```

### تحديث حالة الحاوية

```typescript
const { mutate: updateStatus } = trpc.tracking.updateContainerStatus.useMutation();

updateStatus({
  containerId: 123,
  status: 'arrived',
});
```

---

## الدفع والفواتير

### إنشاء عملية دفع

```typescript
const { mutate: createPayment } = trpc.stripe.createCheckoutSession.useMutation({
  onSuccess: (session) => {
    // إعادة التوجيه إلى صفحة الدفع
    window.location.href = session.url;
  },
});

createPayment({
  amount: 10000,
  currency: 'USD',
  description: 'دفع الرسوم الجمركية',
});
```

### الحصول على سجل الدفع

```typescript
const { data: payments } = trpc.stripe.getPayments.useQuery();

payments?.forEach((payment) => {
  console.log(`${payment.amount} ${payment.currency}: ${payment.status}`);
});
```

---

## معالجة الأخطاء

### معالجة الأخطاء في العمليات

```typescript
const { mutate: createDeclaration } = trpc.customs.createDeclaration.useMutation({
  onError: (error) => {
    if (error.code === 'UNAUTHORIZED') {
      console.log('يجب تسجيل الدخول أولاً');
    } else if (error.code === 'FORBIDDEN') {
      console.log('ليس لديك صلاحيات كافية');
    } else if (error.code === 'BAD_REQUEST') {
      console.log('البيانات المدخلة غير صحيحة');
      console.log(error.message);
    } else {
      console.log('خطأ غير متوقع:', error.message);
    }
  },
});
```

### معالجة الأخطاء في الاستعلامات

```typescript
const { data, isLoading, error } = trpc.customs.listDeclarations.useQuery();

if (isLoading) return <div>جاري التحميل...</div>;
if (error) return <div>خطأ: {error.message}</div>;
if (!data) return <div>لا توجد بيانات</div>;

return <div>{/* عرض البيانات */}</div>;
```

---

## أمثلة متقدمة

### تحديث متفائل (Optimistic Update)

```typescript
const utils = trpc.useUtils();

const { mutate: updateDeclaration } = trpc.customs.updateDeclaration.useMutation({
  onMutate: async (newData) => {
    // إلغاء الاستعلامات الجارية
    await utils.customs.getDeclaration.cancel();

    // الحصول على البيانات القديمة
    const previousData = utils.customs.getDeclaration.getData({ id: newData.id });

    // تحديث البيانات محلياً
    utils.customs.getDeclaration.setData({ id: newData.id }, (old) => ({
      ...old,
      ...newData.data,
    }));

    return { previousData };
  },
  onError: (err, newData, context) => {
    // استعادة البيانات القديمة في حالة الخطأ
    if (context?.previousData) {
      utils.customs.getDeclaration.setData(
        { id: newData.id },
        context.previousData
      );
    }
  },
  onSuccess: () => {
    // تحديث البيانات من الخادم
    utils.customs.getDeclaration.invalidate();
  },
});
```

### استخدام useCallback مع tRPC

```typescript
const { data: declarations } = trpc.customs.listDeclarations.useQuery();
const { mutate: deleteDeclaration } = trpc.customs.deleteDeclaration.useMutation();

const handleDelete = useCallback(
  (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا البيان؟')) {
      deleteDeclaration({ id });
    }
  },
  [deleteDeclaration]
);
```

---

## الموارد الإضافية

- [توثيق tRPC](https://trpc.io/docs)
- [دليل الأمان](./SECURITY_GUIDE.md)
- [دليل قاعدة البيانات](./DATABASE_GUIDE.md)

---

**آخر تحديث**: يناير 2026
**الإصدار**: 1.0.0
