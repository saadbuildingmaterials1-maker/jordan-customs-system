/**
 * Email Service
 * Handles email notifications
 */

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

/**
 * Send email notification
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    // خدمة إرسال البريد الإلكتروني
    // يمكن استخدام: Nodemailer, SendGrid, Mailgun, AWS SES

    console.log('[Email Service] Sending email:', {
      to: payload.to,
      subject: payload.subject,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error);
    return false;
  }
}

/**
 * Generate account added email
 */
export function generateAccountAddedEmail(
  accountName: string,
  bankName: string,
  ibanMasked: string
): EmailPayload {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e40af; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px; background-color: #f9fafb; margin-top: 20px; border-radius: 5px; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>تم إضافة حساب بنكي جديد</h1>
        </div>
        
        <div class="content">
          <p>مرحباً بك،</p>
          
          <p>تم إضافة حساب بنكي جديد إلى حسابك بنجاح:</p>
          
          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>اسم الحساب</strong></td>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${accountName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>البنك</strong></td>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${bankName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>رقم IBAN</strong></td>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb; font-family: monospace;">${ibanMasked}</td>
            </tr>
          </table>
          
          <div class="alert">
            <strong>⚠️ تنبيه أمني:</strong>
            <p>يرجى التحقق من هذا الحساب قبل استخدامه في المعاملات. سيتم إرسال رمز تحقق إلى بريدك الإلكتروني.</p>
          </div>
          
          <p>إذا لم تقم بإضافة هذا الحساب، يرجى التواصل معنا فوراً.</p>
          
          <p>
            <a href="https://jordan-customs.manus.space/bank-accounts" class="button">إدارة الحسابات</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
          <p>هذا البريد تم إرساله تلقائياً. يرجى عدم الرد عليه.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: 'تم إضافة حساب بنكي جديد',
    htmlContent,
    textContent: `تم إضافة حساب بنكي جديد: ${accountName} - ${bankName} - ${ibanMasked}`,
  } as EmailPayload;
}

/**
 * Generate account verified email
 */
export function generateAccountVerifiedEmail(
  accountName: string,
  bankName: string
): EmailPayload {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px; background-color: #f9fafb; margin-top: 20px; border-radius: 5px; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        .success { background-color: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ تم التحقق من الحساب البنكي</h1>
        </div>
        
        <div class="content">
          <p>مرحباً بك،</p>
          
          <p>تم التحقق من حسابك البنكي بنجاح:</p>
          
          <div class="success">
            <strong>✓ ${accountName}</strong><br>
            <strong>البنك:</strong> ${bankName}
          </div>
          
          <p>يمكنك الآن استخدام هذا الحساب للمعاملات المالية والدفعات.</p>
          
          <p>
            <a href="https://jordan-customs.manus.space/bank-accounts" style="display: inline-block; background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">عرض الحسابات</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: 'تم التحقق من الحساب البنكي',
    htmlContent,
    textContent: `تم التحقق من الحساب: ${accountName} - ${bankName}`,
  } as EmailPayload;
}

/**
 * Generate transaction completed email
 */
export function generateTransactionCompletedEmail(
  amount: number,
  currency: string,
  description: string,
  transactionId: string
): EmailPayload {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px; background-color: #f9fafb; margin-top: 20px; border-radius: 5px; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ تم إكمال المعاملة</h1>
        </div>
        
        <div class="content">
          <p>مرحباً بك،</p>
          
          <p>تم إكمال المعاملة بنجاح:</p>
          
          <div class="amount">${amount} ${currency}</div>
          
          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>الوصف</strong></td>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${description}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>رقم المعاملة</strong></td>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb; font-family: monospace;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;"><strong>الوقت</strong></td>
              <td style="padding: 10px; background-color: white; border: 1px solid #e5e7eb;">${new Date().toLocaleString('ar-JO')}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: 'تم إكمال المعاملة',
    htmlContent,
    textContent: `تم إكمال المعاملة: ${amount} ${currency} - ${description}`,
  } as EmailPayload;
}

/**
 * Generate transaction failed email
 */
export function generateTransactionFailedEmail(
  amount: number,
  currency: string,
  reason: string,
  transactionId: string
): EmailPayload {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px; background-color: #f9fafb; margin-top: 20px; border-radius: 5px; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        .error { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✗ فشلت المعاملة</h1>
        </div>
        
        <div class="content">
          <p>مرحباً بك،</p>
          
          <p>فشلت المعاملة. التفاصيل:</p>
          
          <div class="error">
            <strong>المبلغ:</strong> ${amount} ${currency}<br>
            <strong>السبب:</strong> ${reason}<br>
            <strong>رقم المعاملة:</strong> ${transactionId}
          </div>
          
          <p>يرجى محاولة المعاملة مرة أخرى أو التواصل مع الدعم الفني إذا استمرت المشكلة.</p>
        </div>
        
        <div class="footer">
          <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: 'فشلت المعاملة',
    htmlContent,
    textContent: `فشلت المعاملة: ${amount} ${currency} - السبب: ${reason}`,
  } as EmailPayload;
}

/**
 * Generate security alert email
 */
export function generateSecurityAlertEmail(alertMessage: string): EmailPayload {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px; background-color: #f9fafb; margin-top: 20px; border-radius: 5px; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        .alert { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ تنبيه أمني</h1>
        </div>
        
        <div class="content">
          <p>مرحباً بك،</p>
          
          <div class="alert">
            <strong>تنبيه أمني مهم:</strong><br>
            ${alertMessage}
          </div>
          
          <p>إذا لم تقم بهذا الإجراء، يرجى تغيير كلمة المرور فوراً والتواصل مع الدعم الفني.</p>
        </div>
        
        <div class="footer">
          <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: 'تنبيه أمني',
    htmlContent,
    textContent: `تنبيه أمني: ${alertMessage}`,
  } as EmailPayload;
}
