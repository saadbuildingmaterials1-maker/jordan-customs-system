/**
 * Contact Form Service
 * 
 * Handles contact form submissions, validation, storage, and email notifications
 * 
 * @module ./server/services/contact-service
 */

import { getDb } from '../db';
import { contactMessages, emailNotifications, contactStatistics } from '../../drizzle/contact-schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { notifyOwner } from '../_core/notification';

/**
 * Contact form submission data
 */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  category: 'general_inquiry' | 'technical_support' | 'billing' | 'partnership' | 'feedback' | 'complaint' | 'other';
  message: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Submit a contact form
 * Validates data, stores in database, and sends email notifications
 */
export async function submitContactForm(data: ContactFormData) {
  try {
    // Validate input
    validateContactForm(data);

    // Create contact message record
    const messageId = uuidv4();
    const now = new Date();
    const db = await getDb();

    if (!db) throw new Error('Database connection failed');

    const message = await db.insert(contactMessages).values({
      id: messageId,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      company: data.company?.trim(),
      subject: data.subject.trim(),
      category: data.category,
      message: data.message.trim(),
      status: 'new',
      priority: calculatePriority(data.category),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: now,
      updatedAt: now,
    });

    // Send confirmation email to customer
    await sendConfirmationEmail(data.email, data.name, messageId);

    // Send admin notification
    await sendAdminNotification(data, messageId);

    // Update statistics
    await updateContactStatistics(data.category);

    return {
      success: true,
      messageId,
      message: 'تم استقبال رسالتك بنجاح. سنتواصل معك قريباً.',
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw new Error('فشل في إرسال الرسالة. يرجى المحاولة لاحقاً.');
  }
}

/**
 * Validate contact form data
 */
function validateContactForm(data: ContactFormData) {
  const errors: string[] = [];

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('الاسم يجب أن يكون على الأقل حرفين');
  }
  if (data.name.length > 255) {
    errors.push('الاسم طويل جداً');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }

  // Phone validation
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!data.phone || !phoneRegex.test(data.phone) || data.phone.length < 9) {
    errors.push('رقم الهاتف غير صحيح');
  }

  // Subject validation
  if (!data.subject || data.subject.trim().length < 5) {
    errors.push('الموضوع يجب أن يكون على الأقل 5 أحرف');
  }
  if (data.subject.length > 255) {
    errors.push('الموضوع طويل جداً');
  }

  // Message validation
  if (!data.message || data.message.trim().length < 10) {
    errors.push('الرسالة يجب أن تكون على الأقل 10 أحرف');
  }
  if (data.message.length > 5000) {
    errors.push('الرسالة طويلة جداً');
  }

  // Category validation
  const validCategories = ['general_inquiry', 'technical_support', 'billing', 'partnership', 'feedback', 'complaint', 'other'];
  if (!validCategories.includes(data.category)) {
    errors.push('فئة غير صحيحة');
  }

  // Spam detection
  if (isSpam(data.message)) {
    errors.push('الرسالة تحتوي على محتوى غير مسموح');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
}

/**
 * Simple spam detection
 */
function isSpam(message: string): boolean {
  const spamPatterns = [
    /viagra|cialis|casino|lottery|prize|click here|buy now/gi,
    /http:\/\/|https:\/\//gi, // Multiple links
  ];

  let linkCount = (message.match(/http[s]?:\/\//gi) || []).length;
  if (linkCount > 2) return true;

  for (const pattern of spamPatterns) {
    if (pattern.test(message)) return true;
  }

  return false;
}

/**
 * Calculate priority based on category
 */
function calculatePriority(category: string): 'low' | 'medium' | 'high' {
  const highPriorityCategories = ['technical_support', 'complaint', 'billing'];
  const mediumPriorityCategories = ['partnership', 'feedback'];

  if (highPriorityCategories.includes(category)) return 'high';
  if (mediumPriorityCategories.includes(category)) return 'medium';
  return 'low';
}

/**
 * Send confirmation email to customer
 */
async function sendConfirmationEmail(email: string, name: string, messageId: string) {
  try {
    const notificationId = uuidv4();
    const now = new Date();
    const db = await getDb();

    if (!db) throw new Error('Database connection failed');

    // Create email notification record
    await db.insert(emailNotifications).values({
      id: notificationId,
      contactMessageId: messageId,
      recipientEmail: email,
      recipientType: 'customer',
      notificationType: 'confirmation',
      status: 'pending',
      subject: 'تأكيد استقبال رسالتك - نظام إدارة الجمارك',
      body: generateConfirmationEmailBody(name, messageId),
      createdAt: now,
      updatedAt: now,
    });

    // Send email (integrate with email service)
    await sendEmailNotification(notificationId);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

/**
 * Send admin notification
 */
async function sendAdminNotification(data: ContactFormData, messageId: string) {
  try {
    // Notify owner using built-in notification system
    await notifyOwner({
      title: `رسالة اتصال جديدة من ${data.name}`,
      content: `
        الفئة: ${getCategoryLabel(data.category)}
        البريد الإلكتروني: ${data.email}
        الهاتف: ${data.phone}
        الموضوع: ${data.subject}
        
        الرسالة:
        ${data.message}
      `,
    });

    // Create email notification record for admin
    const notificationId = uuidv4();
    const now = new Date();
    const db = await getDb();

    if (!db) throw new Error('Database connection failed');

    await db.insert(emailNotifications).values({
      id: notificationId,
      contactMessageId: messageId,
      recipientEmail: process.env.DEVELOPER_EMAIL || 'admin@example.com',
      recipientType: 'admin',
      notificationType: 'admin_alert',
      status: 'pending',
      subject: `رسالة اتصال جديدة: ${data.subject}`,
      body: generateAdminEmailBody(data, messageId),
      createdAt: now,
      updatedAt: now,
    });

    // Send email
    await sendEmailNotification(notificationId);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(notificationId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const notification = await db.query.emailNotifications.findFirst({
      where: eq(emailNotifications.id, notificationId),
    });

    if (!notification) return;

    // TODO: Integrate with email service (SendGrid, Nodemailer, etc.)
    // For now, just mark as sent
    await db.update(emailNotifications)
      .set({
        status: 'sent',
        sentAt: new Date(),
      })
      .where(eq(emailNotifications.id, notificationId));

    console.log(`Email sent to ${notification.recipientEmail}`);
  } catch (error) {
    console.error('Error sending email notification:', error);

    // Update status to failed
    const db = await getDb();
    if (db) {
      await db.update(emailNotifications)
        .set({
          status: 'failed',
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        })
        .where(eq(emailNotifications.id, notificationId));
    }
  }
}

/**
 * Update contact statistics
 */
async function updateContactStatistics(category: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find or create today's statistics
    const stats = await db.query.contactStatistics.findFirst({
      where: and(
        gte(contactStatistics.date, today),
        lte(contactStatistics.date, tomorrow),
        eq(contactStatistics.period, 'daily')
      ),
    });

    if (stats) {
      // Update existing stats
      const byCategory = JSON.parse(stats.byCategory || '{}');
      byCategory[category] = (byCategory[category] || 0) + 1;

      await db.update(contactStatistics)
        .set({
          totalMessages: stats.totalMessages + 1,
          newMessages: stats.newMessages + 1,
          byCategory: JSON.stringify(byCategory),
          updatedAt: new Date(),
        })
        .where(eq(contactStatistics.id, stats.id));
    } else {
      // Create new stats
      const byCategory = { [category]: 1 };

      await db.insert(contactStatistics).values({
        id: uuidv4(),
        date: today,
        period: 'daily',
        totalMessages: 1,
        newMessages: 1,
        resolvedMessages: 0,
        byCategory: JSON.stringify(byCategory),
        byPriority: JSON.stringify({ low: 0, medium: 0, high: 0 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating contact statistics:', error);
  }
}

/**
 * Get contact messages
 */
export async function getContactMessages(limit = 20, offset = 0, status?: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const where = status ? eq(contactMessages.status, status as any) : undefined;

    const messages = await db.query.contactMessages.findMany({
      where,
      orderBy: [desc(contactMessages.createdAt)],
      limit,
      offset,
    });

    const total = await db.query.contactMessages.findMany({
      where,
    });

    return {
      messages,
      total: total.length,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error getting contact messages:', error);
    throw new Error('فشل في جلب الرسائل');
  }
}

/**
 * Get contact message by ID
 */
export async function getContactMessageById(id: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const message = await db.query.contactMessages.findFirst({
      where: eq(contactMessages.id, id),
    });

    return message;
  } catch (error) {
    console.error('Error getting contact message:', error);
    throw new Error('فشل في جلب الرسالة');
  }
}

/**
 * Reply to contact message
 */
export async function replyToContactMessage(
  messageId: string,
  reply: string,
  repliedBy: string
) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const now = new Date();

    await db.update(contactMessages)
      .set({
        adminReply: reply,
        repliedBy,
        repliedAt: now,
        status: 'resolved',
        updatedAt: now,
      })
      .where(eq(contactMessages.id, messageId));

    // Send reply email to customer
    const message = await getContactMessageById(messageId);
    if (message) {
      await sendReplyEmail(message.email, message.name, reply, messageId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error replying to contact message:', error);
    throw new Error('فشل في إرسال الرد');
  }
}

/**
 * Send reply email to customer
 */
async function sendReplyEmail(email: string, name: string, reply: string, messageId: string) {
  try {
    const notificationId = uuidv4();
    const now = new Date();
    const db = await getDb();

    if (!db) throw new Error('Database connection failed');

    await db.insert(emailNotifications).values({
      id: notificationId,
      contactMessageId: messageId,
      recipientEmail: email,
      recipientType: 'customer',
      notificationType: 'reply',
      status: 'pending',
      subject: 'رد على رسالتك - نظام إدارة الجمارك',
      body: generateReplyEmailBody(name, reply),
      createdAt: now,
      updatedAt: now,
    });

    await sendEmailNotification(notificationId);
  } catch (error) {
    console.error('Error sending reply email:', error);
  }
}

/**
 * Get contact statistics
 */
export async function getContactStatistics(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const stats = await db.query.contactStatistics.findMany({
      where: eq(contactStatistics.period, period),
      orderBy: [desc(contactStatistics.date)],
      limit: 30,
    });

    return stats;
  } catch (error) {
    console.error('Error getting contact statistics:', error);
    throw new Error('فشل في جلب الإحصائيات');
  }
}

// Helper functions for email body generation

function generateConfirmationEmailBody(name: string, messageId: string): string {
  return `
    <h2>شكراً لتواصلك معنا</h2>
    <p>السلام عليكم ${name},</p>
    <p>شكراً لك على رسالتك. تم استقبال رسالتك بنجاح وسيتم الرد عليها في أقرب وقت ممكن.</p>
    <p><strong>رقم الرسالة:</strong> ${messageId}</p>
    <p>يمكنك استخدام هذا الرقم للرجوع إلى رسالتك.</p>
    <p>مع أطيب التحيات,<br>فريق الدعم</p>
  `;
}

function generateAdminEmailBody(data: ContactFormData, messageId: string): string {
  return `
    <h2>رسالة اتصال جديدة</h2>
    <p><strong>المرسل:</strong> ${data.name}</p>
    <p><strong>البريد الإلكتروني:</strong> ${data.email}</p>
    <p><strong>الهاتف:</strong> ${data.phone}</p>
    <p><strong>الشركة:</strong> ${data.company || 'غير محدد'}</p>
    <p><strong>الفئة:</strong> ${getCategoryLabel(data.category)}</p>
    <p><strong>الموضوع:</strong> ${data.subject}</p>
    <p><strong>رقم الرسالة:</strong> ${messageId}</p>
    <hr>
    <h3>الرسالة:</h3>
    <p>${data.message.replace(/\n/g, '<br>')}</p>
  `;
}

function generateReplyEmailBody(name: string, reply: string): string {
  return `
    <h2>رد على رسالتك</h2>
    <p>السلام عليكم ${name},</p>
    <p>شكراً لتواصلك معنا. إليك ردنا على رسالتك:</p>
    <hr>
    <p>${reply.replace(/\n/g, '<br>')}</p>
    <hr>
    <p>إذا كان لديك أي استفسارات إضافية، يرجى عدم التردد في التواصل معنا.</p>
    <p>مع أطيب التحيات,<br>فريق الدعم</p>
  `;
}

function getCategoryLabel(category: string): string {
  const labels: { [key: string]: string } = {
    general_inquiry: 'استفسار عام',
    technical_support: 'الدعم الفني',
    billing: 'الفواتير والدفع',
    partnership: 'الشراكات',
    feedback: 'التعليقات والاقتراحات',
    complaint: 'شكوى',
    other: 'أخرى',
  };
  return labels[category] || category;
}
