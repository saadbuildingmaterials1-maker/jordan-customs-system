/**
 * نظام الإشعارات البريدية
 * 
 * يتعامل مع إرسال الإشعارات البريدية للمستخدمين
 */

export interface EmailNotification {
  userId: number;
  email: string;
  subject: string;
  type: 'shipment_update' | 'invoice_due' | 'declaration_approved' | 'payment_received' | 'system_alert';
  data: Record<string, any>;
  sentAt?: Date;
  read?: boolean;
}

export interface NotificationTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

/**
 * قوالب الإشعارات
 */
export const notificationTemplates: Record<string, NotificationTemplate> = {
  shipment_update: {
    subject: 'تحديث حالة الشحنة',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>تحديث حالة الشحنة</h2>
        <p>مرحباً {{userName}},</p>
        <p>تم تحديث حالة شحنتك:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>رقم الشحنة:</strong> {{shipmentNumber}}</p>
          <p><strong>الحالة الجديدة:</strong> {{newStatus}}</p>
          <p><strong>التاريخ:</strong> {{date}}</p>
          <p><strong>الملاحظات:</strong> {{notes}}</p>
        </div>
        <p><a href="{{trackingLink}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تتبع الشحنة</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
      </div>
    `,
    textBody: `
      تحديث حالة الشحنة
      
      مرحباً {{userName}},
      
      تم تحديث حالة شحنتك:
      
      رقم الشحنة: {{shipmentNumber}}
      الحالة الجديدة: {{newStatus}}
      التاريخ: {{date}}
      الملاحظات: {{notes}}
      
      تتبع الشحنة: {{trackingLink}}
      
      هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية
    `
  },
  invoice_due: {
    subject: 'فاتورة مستحقة الدفع',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>فاتورة مستحقة الدفع</h2>
        <p>مرحباً {{userName}},</p>
        <p>لديك فاتورة مستحقة الدفع:</p>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #f59e0b;">
          <p><strong>رقم الفاتورة:</strong> {{invoiceNumber}}</p>
          <p><strong>المبلغ:</strong> {{amount}} د.أ</p>
          <p><strong>تاريخ الاستحقاق:</strong> {{dueDate}}</p>
          <p><strong>الحالة:</strong> {{status}}</p>
        </div>
        <p><a href="{{paymentLink}}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">دفع الآن</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
      </div>
    `,
    textBody: `
      فاتورة مستحقة الدفع
      
      مرحباً {{userName}},
      
      لديك فاتورة مستحقة الدفع:
      
      رقم الفاتورة: {{invoiceNumber}}
      المبلغ: {{amount}} د.أ
      تاريخ الاستحقاق: {{dueDate}}
      الحالة: {{status}}
      
      دفع الآن: {{paymentLink}}
      
      هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية
    `
  },
  declaration_approved: {
    subject: 'تم الموافقة على البيان الجمركي',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>تم الموافقة على البيان الجمركي</h2>
        <p>مرحباً {{userName}},</p>
        <p>تم الموافقة على بيانك الجمركي:</p>
        <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #10b981;">
          <p><strong>رقم البيان:</strong> {{declarationNumber}}</p>
          <p><strong>الدولة:</strong> {{country}}</p>
          <p><strong>القيمة:</strong> {{value}} د.أ</p>
          <p><strong>تاريخ الموافقة:</strong> {{approvalDate}}</p>
        </div>
        <p><a href="{{declarationLink}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">عرض البيان</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
      </div>
    `,
    textBody: `
      تم الموافقة على البيان الجمركي
      
      مرحباً {{userName}},
      
      تم الموافقة على بيانك الجمركي:
      
      رقم البيان: {{declarationNumber}}
      الدولة: {{country}}
      القيمة: {{value}} د.أ
      تاريخ الموافقة: {{approvalDate}}
      
      عرض البيان: {{declarationLink}}
      
      هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية
    `
  },
  payment_received: {
    subject: 'تم استقبال الدفعة',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>تم استقبال الدفعة</h2>
        <p>مرحباً {{userName}},</p>
        <p>شكراً لك! تم استقبال دفعتك بنجاح:</p>
        <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #10b981;">
          <p><strong>رقم الدفعة:</strong> {{paymentNumber}}</p>
          <p><strong>المبلغ:</strong> {{amount}} د.أ</p>
          <p><strong>طريقة الدفع:</strong> {{paymentMethod}}</p>
          <p><strong>التاريخ:</strong> {{date}}</p>
          <p><strong>رقم المرجع:</strong> {{referenceNumber}}</p>
        </div>
        <p><a href="{{receiptLink}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تحميل الإيصال</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
      </div>
    `,
    textBody: `
      تم استقبال الدفعة
      
      مرحباً {{userName}},
      
      شكراً لك! تم استقبال دفعتك بنجاح:
      
      رقم الدفعة: {{paymentNumber}}
      المبلغ: {{amount}} د.أ
      طريقة الدفع: {{paymentMethod}}
      التاريخ: {{date}}
      رقم المرجع: {{referenceNumber}}
      
      تحميل الإيصال: {{receiptLink}}
      
      هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية
    `
  },
  system_alert: {
    subject: 'تنبيه نظام مهم',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>تنبيه نظام مهم</h2>
        <p>مرحباً {{userName}},</p>
        <p>هناك تنبيه مهم يتطلب انتباهك:</p>
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #ef4444;">
          <p><strong>نوع التنبيه:</strong> {{alertType}}</p>
          <p><strong>الرسالة:</strong> {{message}}</p>
          <p><strong>الأولوية:</strong> {{priority}}</p>
          <p><strong>التاريخ:</strong> {{date}}</p>
        </div>
        <p><a href="{{actionLink}}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">اتخاذ إجراء</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
      </div>
    `,
    textBody: `
      تنبيه نظام مهم
      
      مرحباً {{userName}},
      
      هناك تنبيه مهم يتطلب انتباهك:
      
      نوع التنبيه: {{alertType}}
      الرسالة: {{message}}
      الأولوية: {{priority}}
      التاريخ: {{date}}
      
      اتخاذ إجراء: {{actionLink}}
      
      هذا البريد تم إرساله من نظام إدارة تكاليف الشحن والجمارك الأردنية
    `
  }
};

/**
 * استبدال المتغيرات في القالب
 */
export function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  });
  return result;
}

/**
 * إنشاء إشعار بريدي
 */
export async function createEmailNotification(
  userId: number,
  email: string,
  type: EmailNotification['type'],
  data: Record<string, any>
): Promise<EmailNotification> {
  const template = notificationTemplates[type];
  
  if (!template) {
    throw new Error(`قالب الإشعار ${type} غير موجود`);
  }

  const subject = replaceTemplateVariables(template.subject, data);
  const htmlBody = replaceTemplateVariables(template.htmlBody, data);
  const textBody = replaceTemplateVariables(template.textBody, data);

  // في بيئة الإنتاج، سيتم إرسال البريد الإلكتروني هنا
  console.log(`[NOTIFICATION] Sending email to ${email}`);
  console.log(`Subject: ${subject}`);

  return {
    userId,
    email,
    subject,
    type,
    data,
    sentAt: new Date(),
    read: false
  };
}

/**
 * إرسال إشعار تحديث الشحنة
 */
export async function notifyShipmentUpdate(
  userId: number,
  email: string,
  userName: string,
  shipmentNumber: string,
  newStatus: string,
  notes: string = ''
) {
  return createEmailNotification(userId, email, 'shipment_update', {
    userName,
    shipmentNumber,
    newStatus,
    date: new Date().toLocaleDateString('ar-JO'),
    notes: notes || 'لا توجد ملاحظات',
    trackingLink: `${process.env.VITE_APP_URL || 'https://app.example.com'}/tracking/${shipmentNumber}`
  });
}

/**
 * إرسال إشعار الفاتورة المستحقة
 */
export async function notifyInvoiceDue(
  userId: number,
  email: string,
  userName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  status: string = 'مستحقة'
) {
  return createEmailNotification(userId, email, 'invoice_due', {
    userName,
    invoiceNumber,
    amount: amount.toLocaleString('ar-JO'),
    dueDate,
    status,
    paymentLink: `${process.env.VITE_APP_URL || 'https://app.example.com'}/payments/${invoiceNumber}`
  });
}

/**
 * إرسال إشعار الموافقة على البيان
 */
export async function notifyDeclarationApproved(
  userId: number,
  email: string,
  userName: string,
  declarationNumber: string,
  country: string,
  value: number,
  approvalDate: string
) {
  return createEmailNotification(userId, email, 'declaration_approved', {
    userName,
    declarationNumber,
    country,
    value: value.toLocaleString('ar-JO'),
    approvalDate,
    declarationLink: `${process.env.VITE_APP_URL || 'https://app.example.com'}/declarations/${declarationNumber}`
  });
}

/**
 * إرسال إشعار استقبال الدفعة
 */
export async function notifyPaymentReceived(
  userId: number,
  email: string,
  userName: string,
  paymentNumber: string,
  amount: number,
  paymentMethod: string,
  referenceNumber: string
) {
  return createEmailNotification(userId, email, 'payment_received', {
    userName,
    paymentNumber,
    amount: amount.toLocaleString('ar-JO'),
    paymentMethod,
    date: new Date().toLocaleDateString('ar-JO'),
    referenceNumber,
    receiptLink: `${process.env.VITE_APP_URL || 'https://app.example.com'}/receipts/${paymentNumber}`
  });
}

/**
 * إرسال تنبيه نظام
 */
export async function notifySystemAlert(
  userId: number,
  email: string,
  userName: string,
  alertType: string,
  message: string,
  priority: 'عالي' | 'متوسط' | 'منخفض' = 'متوسط'
) {
  return createEmailNotification(userId, email, 'system_alert', {
    userName,
    alertType,
    message,
    priority,
    date: new Date().toLocaleDateString('ar-JO'),
    actionLink: `${process.env.VITE_APP_URL || 'https://app.example.com'}/alerts`
  });
}
