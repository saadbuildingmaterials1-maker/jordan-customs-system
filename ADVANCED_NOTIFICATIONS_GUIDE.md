# نظام الإشعارات المتقدمة - دليل شامل

## المقدمة

نظام إشعارات متقدم يدعم قنوات متعددة (البريد الإلكتروني، SMS، Push، WhatsApp، Telegram) مع تتبع شامل وتفضيلات المستخدم.

---

## 1. القنوات المدعومة

### البريد الإلكتروني (Email)
- ✅ إرسال فوري
- ✅ قوالب HTML احترافية
- ✅ تتبع الفتح
- ✅ إعادة محاولة تلقائية

### رسائل نصية (SMS)
- ✅ إرسال فوري
- ✅ رسائل قصيرة (160 حرف)
- ✅ تتبع التسليم
- ✅ دعم Unicode

### إشعارات الويب (Push)
- ✅ إشعارات فورية
- ✅ أيقونات مخصصة
- ✅ تفاعل المستخدم
- ✅ تخزين محلي

### WhatsApp
- ✅ رسائل فورية
- ✅ وسائط (صور، ملفات)
- ✅ قوائم تفاعلية
- ✅ تتبع التسليم

### Telegram
- ✅ رسائل فورية
- ✅ أزرار تفاعلية
- ✅ تنبيهات صوتية
- ✅ تتبع الحالة

---

## 2. أنواع الإشعارات

### إشعارات المعاملات
```typescript
{
  type: 'transaction',
  title: 'معاملة جديدة',
  message: 'تم إضافة معاملة جديدة برقم #12345',
  data: {
    transactionId: '12345',
    amount: 1000,
    currency: 'JOD',
  },
  channels: ['email', 'sms', 'push'],
}
```

### إشعارات الدفع
```typescript
{
  type: 'payment',
  title: 'تم استقبال الدفعة',
  message: 'تم استقبال دفعة بقيمة 500 دينار',
  data: {
    paymentId: 'pay_123',
    amount: 500,
    status: 'completed',
  },
  channels: ['email', 'whatsapp'],
}
```

### إشعارات الفواتير
```typescript
{
  type: 'invoice',
  title: 'فاتورة جديدة',
  message: 'تم إنشاء فاتورة جديدة برقم INV-2026-001',
  data: {
    invoiceId: 'INV-2026-001',
    amount: 1500,
    dueDate: '2026-02-25',
  },
  channels: ['email', 'pdf_attachment'],
}
```

### إشعارات النسخ الاحتياطية
```typescript
{
  type: 'backup',
  title: 'النسخة الاحتياطية مكتملة',
  message: 'تم إنشاء نسخة احتياطية بنجاح في 2026-01-25',
  data: {
    backupId: 'backup_123',
    size: '2.5 MB',
    duration: '5 minutes',
  },
  channels: ['email', 'telegram'],
}
```

---

## 3. تفضيلات المستخدم

### إعدادات الإشعارات

```typescript
interface NotificationPreferences {
  // القنوات المفضلة
  preferredChannels: ('email' | 'sms' | 'push' | 'whatsapp' | 'telegram')[];
  
  // أنواع الإشعارات المفعلة
  enabledTypes: {
    transactions: boolean;
    payments: boolean;
    invoices: boolean;
    backups: boolean;
    security: boolean;
    marketing: boolean;
  };
  
  // أوقات الإرسال
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
  
  // تجميع الإشعارات
  grouping: {
    enabled: boolean;
    interval: number; // بالدقائق
  };
}
```

### واجهة إدارة التفضيلات

```typescript
export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>();
  
  const handleChannelToggle = (channel: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredChannels: prev.preferredChannels.includes(channel)
        ? prev.preferredChannels.filter(c => c !== channel)
        : [...prev.preferredChannels, channel],
    }));
  };
  
  return (
    <div className="space-y-6">
      <h1>تفضيلات الإشعارات</h1>
      
      {/* القنوات */}
      <div>
        <h2>القنوات المفضلة</h2>
        {['email', 'sms', 'push', 'whatsapp', 'telegram'].map(channel => (
          <label key={channel}>
            <input
              type="checkbox"
              checked={preferences?.preferredChannels.includes(channel)}
              onChange={() => handleChannelToggle(channel)}
            />
            {channel}
          </label>
        ))}
      </div>
      
      {/* أنواع الإشعارات */}
      <div>
        <h2>أنواع الإشعارات</h2>
        {Object.entries(preferences?.enabledTypes || {}).map(([type, enabled]) => (
          <label key={type}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => handleTypeToggle(type)}
            />
            {type}
          </label>
        ))}
      </div>
      
      {/* ساعات الهدوء */}
      <div>
        <h2>ساعات الهدوء</h2>
        <label>
          <input
            type="checkbox"
            checked={preferences?.quietHours.enabled}
          />
          تفعيل ساعات الهدوء
        </label>
        {preferences?.quietHours.enabled && (
          <div className="space-y-2">
            <input
              type="time"
              value={preferences.quietHours.startTime}
            />
            <input
              type="time"
              value={preferences.quietHours.endTime}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 4. معالجة الإشعارات

### إرسال إشعار

```typescript
export async function sendNotification(notification: Notification) {
  const user = await getUser(notification.userId);
  const preferences = await getUserPreferences(notification.userId);
  
  // التحقق من تفعيل النوع
  if (!preferences.enabledTypes[notification.type]) {
    return;
  }
  
  // التحقق من ساعات الهدوء
  if (isQuietHours(preferences)) {
    await queueNotification(notification);
    return;
  }
  
  // إرسال عبر القنوات المفضلة
  for (const channel of preferences.preferredChannels) {
    try {
      await sendViaChannel(channel, notification, user);
    } catch (error) {
      console.error(`Failed to send via ${channel}:`, error);
      await logFailure(notification.id, channel, error);
    }
  }
  
  // تسجيل الإشعار
  await logNotification(notification);
}
```

### إرسال عبر البريد الإلكتروني

```typescript
async function sendViaEmail(notification: Notification, user: User) {
  const template = getEmailTemplate(notification.type);
  const html = template.render(notification.data);
  
  await sendEmail({
    to: user.email,
    subject: notification.title,
    html: html,
    attachments: notification.attachments,
  });
}
```

### إرسال عبر WhatsApp

```typescript
async function sendViaWhatsApp(notification: Notification, user: User) {
  const message = formatWhatsAppMessage(notification);
  
  await whatsappClient.messages.create({
    from: 'whatsapp:+1234567890',
    to: `whatsapp:${user.phone}`,
    body: message,
  });
}
```

### إرسال عبر Telegram

```typescript
async function sendViaTelegram(notification: Notification, user: User) {
  const message = formatTelegramMessage(notification);
  
  await telegramBot.sendMessage(user.telegramChatId, message, {
    parse_mode: 'HTML',
    reply_markup: getTelegramButtons(notification),
  });
}
```

---

## 5. تتبع الإشعارات

### سجل الإشعارات

```typescript
interface NotificationLog {
  id: string;
  userId: number;
  type: string;
  channel: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt: Date;
  deliveredAt?: Date;
  failureReason?: string;
  openedAt?: Date;
  clickedAt?: Date;
}
```

### لوحة تحكم التتبع

```typescript
export function NotificationDashboard() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState({
    sent: 0,
    delivered: 0,
    failed: 0,
    openRate: 0,
    clickRate: 0,
  });
  
  useEffect(() => {
    const fetchLogs = async () => {
      const response = await fetch('/api/notifications/logs');
      const data = await response.json();
      setLogs(data);
      calculateStats(data);
    };
    fetchLogs();
  }, []);
  
  return (
    <div className="space-y-6">
      <h1>لوحة تحكم الإشعارات</h1>
      
      {/* الإحصائيات */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="مرسل" value={stats.sent} />
        <StatCard label="مسلم" value={stats.delivered} />
        <StatCard label="فاشل" value={stats.failed} />
        <StatCard label="معدل الفتح" value={`${stats.openRate}%`} />
        <StatCard label="معدل النقر" value={`${stats.clickRate}%`} />
      </div>
      
      {/* جدول السجلات */}
      <table className="w-full">
        <thead>
          <tr>
            <th>النوع</th>
            <th>القناة</th>
            <th>الحالة</th>
            <th>الوقت</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.type}</td>
              <td>{log.channel}</td>
              <td><Badge status={log.status} /></td>
              <td>{formatDate(log.sentAt)}</td>
              <td>
                <button onClick={() => handleRetry(log.id)}>
                  إعادة محاولة
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 6. اختبارات شاملة

### اختبار الإرسال

```typescript
describe('Notification Sending', () => {
  it('should send notification via email', async () => {
    const notification = createTestNotification('email');
    await sendNotification(notification);
    
    expect(emailService.send).toHaveBeenCalled();
  });
  
  it('should respect user preferences', async () => {
    const user = await createTestUser({ 
      preferences: { preferredChannels: ['sms'] }
    });
    const notification = createTestNotification('email');
    
    await sendNotification(notification);
    
    expect(emailService.send).not.toHaveBeenCalled();
    expect(smsService.send).toHaveBeenCalled();
  });
});
```

---

## 7. الخلاصة

تم توثيق نظام الإشعارات المتقدم مع دعم قنوات متعددة وتفضيلات مستخدم شاملة.
