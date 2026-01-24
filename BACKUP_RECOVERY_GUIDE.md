# نظام النسخ الاحتياطية والاستعادة - دليل شامل

## المقدمة

هذا الدليل يوضح كيفية تطبيق نظام النسخ الاحتياطية والاستعادة الآمن والموثوق في التطبيق.

---

## 1. مميزات النظام

### الأمان
- ✅ تشفير AES-256-GCM
- ✅ التحقق من السلامة بـ SHA-256
- ✅ إخفاء البيانات الحساسة
- ✅ معايير PCI DSS

### الموثوقية
- ✅ ضغط البيانات بـ gzip
- ✅ التحقق من صحة النسخة
- ✅ سجل تدقيق كامل
- ✅ استعادة سريعة

### الأداء
- ✅ نسخ احتياطية متزايدة
- ✅ تخزين موزع
- ✅ معالجة متوازية
- ✅ استعادة مرحلية

---

## 2. هيكل النسخة الاحتياطية

```
backup/
├── metadata.json          # معلومات النسخة
├── data.json.gz.enc       # البيانات المضغوطة والمشفرة
├── checksum.sha256        # التحقق من السلامة
└── timestamp.txt          # وقت الإنشاء
```

### ملف metadata.json

```json
{
  "version": "1.0",
  "timestamp": "2026-01-25T12:00:00Z",
  "size": 1024000,
  "tables": ["users", "declarations", "payments"],
  "encryption": "AES-256-GCM",
  "compression": "gzip",
  "checksum": "sha256:abc123...",
  "status": "completed"
}
```

---

## 3. عملية النسخ الاحتياطية

### الخطوة 1: جمع البيانات

```typescript
// جمع جميع البيانات من الجداول
const data = {
  users: await db.select().from(users),
  declarations: await db.select().from(customsDeclarations),
  payments: await db.select().from(payments),
};
```

### الخطوة 2: ضغط البيانات

```typescript
// ضغط البيانات باستخدام gzip
const compressed = await gzip(JSON.stringify(data));
```

### الخطوة 3: التشفير

```typescript
// تشفير البيانات المضغوطة
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([
  cipher.update(compressed),
  cipher.final(),
]);
const authTag = cipher.getAuthTag();
```

### الخطوة 4: التخزين

```typescript
// حفظ النسخة الاحتياطية
await saveToStorage({
  metadata: metadata,
  data: encrypted,
  authTag: authTag,
  checksum: calculateChecksum(encrypted),
});
```

---

## 4. عملية الاستعادة

### الخطوة 1: التحقق من السلامة

```typescript
// التحقق من checksum
const storedChecksum = await getChecksum(backupId);
const calculatedChecksum = calculateChecksum(encryptedData);
if (storedChecksum !== calculatedChecksum) {
  throw new Error('Backup corrupted');
}
```

### الخطوة 2: فك التشفير

```typescript
// فك تشفير البيانات
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(authTag);
const decrypted = Buffer.concat([
  decipher.update(encrypted),
  decipher.final(),
]);
```

### الخطوة 3: فك الضغط

```typescript
// فك ضغط البيانات
const decompressed = await gunzip(decrypted);
const data = JSON.parse(decompressed.toString());
```

### الخطوة 4: استعادة البيانات

```typescript
// استعادة البيانات إلى قاعدة البيانات
for (const [table, records] of Object.entries(data)) {
  await db.insert(tables[table]).values(records);
}
```

---

## 5. جدولة النسخ الاحتياطية

### النسخ الاحتياطية اليومية

```typescript
// كل يوم في الساعة 2 صباحاً
schedule.scheduleJob('0 2 * * *', async () => {
  await createBackup('daily');
});
```

### النسخ الاحتياطية الأسبوعية

```typescript
// كل يوم أحد في الساعة 3 صباحاً
schedule.scheduleJob('0 3 * * 0', async () => {
  await createBackup('weekly');
});
```

### النسخ الاحتياطية الشهرية

```typescript
// أول يوم من الشهر في الساعة 4 صباحاً
schedule.scheduleJob('0 4 1 * *', async () => {
  await createBackup('monthly');
});
```

---

## 6. واجهة إدارة النسخ الاحتياطية

### عرض النسخ الاحتياطية

```typescript
// client/src/pages/BackupManagement.tsx
export function BackupManagement() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBackups = async () => {
      setLoading(true);
      const response = await fetch('/api/backups');
      const data = await response.json();
      setBackups(data);
      setLoading(false);
    };
    fetchBackups();
  }, []);

  return (
    <div className="space-y-4">
      <h1>إدارة النسخ الاحتياطية</h1>
      {backups.map(backup => (
        <BackupCard key={backup.id} backup={backup} />
      ))}
    </div>
  );
}
```

### إنشاء نسخة احتياطية

```typescript
const handleCreateBackup = async () => {
  try {
    const response = await fetch('/api/backups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'manual' }),
    });
    const backup = await response.json();
    toast.success('تم إنشاء النسخة الاحتياطية بنجاح');
  } catch (error) {
    toast.error('فشل إنشاء النسخة الاحتياطية');
  }
};
```

### استعادة النسخة الاحتياطية

```typescript
const handleRestore = async (backupId: string) => {
  try {
    const response = await fetch(`/api/backups/${backupId}/restore`, {
      method: 'POST',
    });
    const result = await response.json();
    toast.success('تم استعادة النسخة الاحتياطية بنجاح');
  } catch (error) {
    toast.error('فشل استعادة النسخة الاحتياطية');
  }
};
```

---

## 7. سياسة الاحتفاظ

| النوع | المدة | العدد الأقصى |
|------|------|-----------|
| يومية | 7 أيام | 7 نسخ |
| أسبوعية | 30 يوم | 4 نسخ |
| شهرية | 1 سنة | 12 نسخة |

---

## 8. المراقبة والتنبيهات

### تتبع النسخ الاحتياطية

```typescript
// تسجيل كل عملية نسخ احتياطية
await logBackupEvent({
  type: 'backup_created',
  backupId: backup.id,
  size: backup.size,
  duration: endTime - startTime,
  status: 'success',
  timestamp: new Date(),
});
```

### التنبيهات

```typescript
// إرسال تنبيه عند فشل النسخة الاحتياطية
if (backup.status === 'failed') {
  await sendAlert({
    title: 'فشل النسخة الاحتياطية',
    message: `فشلت النسخة الاحتياطية ${backup.id}`,
    severity: 'critical',
  });
}
```

---

## 9. اختبارات شاملة

### اختبار إنشاء النسخة

```typescript
describe('Backup Creation', () => {
  it('should create encrypted backup', async () => {
    const backup = await createBackup();
    expect(backup.id).toBeDefined();
    expect(backup.encrypted).toBe(true);
    expect(backup.size).toBeGreaterThan(0);
  });
});
```

### اختبار الاستعادة

```typescript
describe('Backup Restoration', () => {
  it('should restore data correctly', async () => {
    const backup = await createBackup();
    await restoreBackup(backup.id);
    const restored = await db.select().from(users);
    expect(restored.length).toBeGreaterThan(0);
  });
});
```

---

## 10. الخلاصة

تم توثيق نظام النسخ الاحتياطية والاستعادة الشامل مع جميع الميزات الأمنية والموثوقة.
