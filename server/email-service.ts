import nodemailer from "nodemailer";

/**
 * خدمة البريد الإلكتروني
 * تتعامل مع إرسال جميع الإشعارات البريدية
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface ShareNotificationData {
  recipientName: string;
  senderName: string;
  itemName: string;
  itemType: "calculation" | "report";
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
  shareLink: string;
  expiresIn?: string;
}

interface ReportNotificationData {
  recipientName: string;
  reportName: string;
  reportDate: string;
  reportUrl: string;
  summary: string;
}

/**
 * إنشاء transporter البريد
 * يمكن تعديل البيانات حسب خدمة البريد المستخدمة
 */
function createTransporter() {
  // هنا يتم استخدام بيانات الخادم البريدي
  // يمكن استخدام Gmail, SendGrid, Mailgun, إلخ
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * قالب البريد الأساسي
 */
function getBaseTemplate(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          color: #333;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          background-color: #667eea;
          color: white;
          padding: 12px 30px;
          border-radius: 4px;
          text-decoration: none;
          margin: 20px 0;
          font-weight: 600;
        }
        .button:hover {
          background-color: #764ba2;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        .info-box {
          background-color: #f0f4ff;
          border-right: 4px solid #667eea;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .permission-item {
          display: flex;
          align-items: center;
          margin: 8px 0;
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .permission-item.allowed {
          background-color: #e8f5e9;
        }
        .permission-item.denied {
          background-color: #ffebee;
        }
        .check {
          color: #4caf50;
          margin-left: 10px;
          font-weight: bold;
        }
        .cross {
          color: #f44336;
          margin-left: 10px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
          <p>جميع الحقوق محفوظة</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * قالب إشعار المشاركة
 */
function getShareNotificationTemplate(data: ShareNotificationData): string {
  const permissionsList = `
    <div style="margin: 20px 0;">
      <h3>الأذونات الممنوحة:</h3>
      <div class="permission-item ${data.permissions.canView ? "allowed" : "denied"}">
        <span>عرض</span>
        ${data.permissions.canView ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}
      </div>
      <div class="permission-item ${data.permissions.canEdit ? "allowed" : "denied"}">
        <span>تعديل</span>
        ${data.permissions.canEdit ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}
      </div>
      <div class="permission-item ${data.permissions.canDelete ? "allowed" : "denied"}">
        <span>حذف</span>
        ${data.permissions.canDelete ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}
      </div>
      <div class="permission-item ${data.permissions.canShare ? "allowed" : "denied"}">
        <span>مشاركة مع آخرين</span>
        ${data.permissions.canShare ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}
      </div>
    </div>
  `;

  const content = `
    <p>مرحباً ${data.recipientName},</p>
    
    <p>تم مشاركة ${data.itemType === "calculation" ? "حساب" : "تقرير"} معك من قبل <strong>${data.senderName}</strong>.</p>
    
    <div class="info-box">
      <strong>اسم ${data.itemType === "calculation" ? "الحساب" : "التقرير"}:</strong> ${data.itemName}
    </div>
    
    ${permissionsList}
    
    ${data.expiresIn ? `<p><strong>صلاحية المشاركة:</strong> ${data.expiresIn}</p>` : ""}
    
    <p>يمكنك الوصول إلى ${data.itemType === "calculation" ? "الحساب" : "التقرير"} من خلال الرابط التالي:</p>
    
    <a href="${data.shareLink}" class="button">الوصول إلى ${data.itemType === "calculation" ? "الحساب" : "التقرير"}</a>
    
    <p>إذا كان لديك أي أسئلة أو استفسارات، لا تتردد في التواصل معنا.</p>
    
    <p>مع أطيب التحيات،<br>فريق النظام</p>
  `;

  return getBaseTemplate(content, `تم مشاركة ${data.itemType === "calculation" ? "حساب" : "تقرير"} معك`);
}

/**
 * قالب إشعار التقرير
 */
function getReportNotificationTemplate(data: ReportNotificationData): string {
  const content = `
    <p>مرحباً ${data.recipientName},</p>
    
    <p>تقريرك الجديد جاهز الآن!</p>
    
    <div class="info-box">
      <strong>اسم التقرير:</strong> ${data.reportName}<br>
      <strong>تاريخ الإنشاء:</strong> ${data.reportDate}
    </div>
    
    <h3>ملخص التقرير:</h3>
    <p>${data.summary}</p>
    
    <p>يمكنك عرض التقرير الكامل من خلال الرابط التالي:</p>
    
    <a href="${data.reportUrl}" class="button">عرض التقرير</a>
    
    <p>يمكنك أيضاً تحميل التقرير بصيغ مختلفة (PDF, Excel, CSV) من صفحة التقارير.</p>
    
    <p>مع أطيب التحيات،<br>فريق النظام</p>
  `;

  return getBaseTemplate(content, "تقريرك الجديد جاهز");
}

/**
 * إرسال بريد إلكتروني
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@jordancosts.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });

    console.log(`✓ تم إرسال بريد إلى ${options.to}`);
    return true;
  } catch (error) {
    console.error(`✗ فشل إرسال البريد إلى ${options.to}:`, error);
    return false;
  }
}

/**
 * إرسال إشعار المشاركة
 */
export async function sendShareNotification(
  email: string,
  data: ShareNotificationData
): Promise<boolean> {
  const html = getShareNotificationTemplate(data);
  return sendEmail({
    to: email,
    subject: `تم مشاركة ${data.itemType === "calculation" ? "حساب" : "تقرير"} معك - ${data.itemName}`,
    html,
  });
}

/**
 * إرسال إشعار التقرير
 */
export async function sendReportNotification(
  email: string,
  data: ReportNotificationData
): Promise<boolean> {
  const html = getReportNotificationTemplate(data);
  return sendEmail({
    to: email,
    subject: `تقريرك الجديد جاهز - ${data.reportName}`,
    html,
  });
}

/**
 * إرسال إشعار قبول المشاركة
 */
export async function sendShareAcceptedNotification(
  email: string,
  recipientName: string,
  itemName: string,
  itemType: "calculation" | "report"
): Promise<boolean> {
  const content = `
    <p>مرحباً ${recipientName},</p>
    
    <p>تم قبول دعوة المشاركة الخاصة بك!</p>
    
    <div class="info-box">
      <strong>اسم ${itemType === "calculation" ? "الحساب" : "التقرير"}:</strong> ${itemName}
    </div>
    
    <p>يمكنك الآن الوصول إلى ${itemType === "calculation" ? "الحساب" : "التقرير"} من لوحة التحكم الخاصة بك.</p>
    
    <p>مع أطيب التحيات،<br>فريق النظام</p>
  `;

  const html = getBaseTemplate(content, "تم قبول دعوة المشاركة");
  return sendEmail({
    to: email,
    subject: `تم قبول دعوة المشاركة - ${itemName}`,
    html,
  });
}

/**
 * إرسال إشعار رفض المشاركة
 */
export async function sendShareRejectedNotification(
  email: string,
  recipientName: string,
  itemName: string,
  itemType: "calculation" | "report"
): Promise<boolean> {
  const content = `
    <p>مرحباً ${recipientName},</p>
    
    <p>تم رفض دعوة المشاركة الخاصة بك.</p>
    
    <div class="info-box">
      <strong>اسم ${itemType === "calculation" ? "الحساب" : "التقرير"}:</strong> ${itemName}
    </div>
    
    <p>إذا كان لديك أي استفسارات، يرجى التواصل مع المرسل.</p>
    
    <p>مع أطيب التحيات،<br>فريق النظام</p>
  `;

  const html = getBaseTemplate(content, "تم رفض دعوة المشاركة");
  return sendEmail({
    to: email,
    subject: `تم رفض دعوة المشاركة - ${itemName}`,
    html,
  });
}
