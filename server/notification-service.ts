/**
 * notification-service
 * @module ./server/notification-service
 */
import axios from 'axios';
import nodemailer from 'nodemailer';

/**
 * خدمة الإشعارات المتقدمة
 * تدعم: Email, Slack, Discord, Telegram, SMS
 */

interface NotificationConfig {
  type: 'email' | 'slack' | 'discord' | 'telegram' | 'sms';
  recipient: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
}

interface DiscordMessage {
  content?: string;
  embeds?: any[];
}

export class NotificationService {
  private emailTransporter: any;
  private slackWebhookUrl: string;
  private discordWebhookUrl: string;
  private telegramBotToken: string;
  private telegramChatId: string;

  constructor() {
    // إعداد البريد الإلكتروني
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // إعداد Slack
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';

    // إعداد Discord
    this.discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || '';

    // إعداد Telegram
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';
  }

  /**
   * إرسال إشعار
   */
  async send(config: NotificationConfig): Promise<boolean> {
    try {
      switch (config.type) {
        case 'email':
          return await this.sendEmail(config);
        case 'slack':
          return await this.sendSlack(config);
        case 'discord':
          return await this.sendDiscord(config);
        case 'telegram':
          return await this.sendTelegram(config);
        case 'sms':
          return await this.sendSMS(config);
        default:
          return false;
      }
    } catch (error) {
      console.error(`خطأ في إرسال الإشعار (${config.type}):`, error);
      return false;
    }
  }

  /**
   * إرسال بريد إلكتروني
   */
  private async sendEmail(config: NotificationConfig): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: config.recipient,
        subject: config.title,
        html: this.formatEmailBody(config),
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`✅ تم إرسال بريد إلكتروني إلى ${config.recipient}`);
      return true;
    } catch (error) {
      console.error('خطأ في إرسال البريد الإلكتروني:', error);
      return false;
    }
  }

  /**
   * إرسال رسالة Slack
   */
  private async sendSlack(config: NotificationConfig): Promise<boolean> {
    if (!this.slackWebhookUrl) return false;

    try {
      const color = this.getPriorityColor(config.priority);
      const message: SlackMessage = {
        channel: config.recipient,
        text: config.title,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${config.title}*\n${config.message}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `_الأولوية: ${config.priority || 'عادية'}_`,
              },
            ],
          },
        ],
      };

      await axios.post(this.slackWebhookUrl, message);
      console.log(`✅ تم إرسال رسالة Slack`);
      return true;
    } catch (error) {
      console.error('خطأ في إرسال رسالة Slack:', error);
      return false;
    }
  }

  /**
   * إرسال رسالة Discord
   */
  private async sendDiscord(config: NotificationConfig): Promise<boolean> {
    if (!this.discordWebhookUrl) return false;

    try {
      const color = this.getPriorityColorHex(config.priority);
      const message: DiscordMessage = {
        embeds: [
          {
            title: config.title,
            description: config.message,
            color: color,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: 'الأولوية',
                value: config.priority || 'عادية',
                inline: true,
              },
            ],
          },
        ],
      };

      await axios.post(this.discordWebhookUrl, message);
      console.log(`✅ تم إرسال رسالة Discord`);
      return true;
    } catch (error) {
      console.error('خطأ في إرسال رسالة Discord:', error);
      return false;
    }
  }

  /**
   * إرسال رسالة Telegram
   */
  private async sendTelegram(config: NotificationConfig): Promise<boolean> {
    if (!this.telegramBotToken || !this.telegramChatId) return false;

    try {
      const telegramUrl = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      const message = `*${config.title}*\n\n${config.message}\n\n_الأولوية: ${config.priority || 'عادية'}_`;

      await axios.post(telegramUrl, {
        chat_id: this.telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      });

      console.log(`✅ تم إرسال رسالة Telegram`);
      return true;
    } catch (error) {
      console.error('خطأ في إرسال رسالة Telegram:', error);
      return false;
    }
  }

  /**
   * إرسال رسالة SMS
   */
  private async sendSMS(config: NotificationConfig): Promise<boolean> {
    // محاكاة إرسال SMS
    console.log(`📱 SMS إلى ${config.recipient}: ${config.title}`);
    return true;
  }

  /**
   * تنسيق نص البريد الإلكتروني
   */
  private formatEmailBody(config: NotificationConfig): string {
    return `
      <html dir="rtl">
        <head>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; background-color: #f8f9fa; margin-top: 10px; border-radius: 5px; }
            .priority { color: ${this.getPriorityColor(config.priority)}; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${config.title}</h2>
            </div>
            <div class="content">
              <p>${config.message}</p>
              <p class="priority">الأولوية: ${config.priority || 'عادية'}</p>
            </div>
            <div class="footer">
              <p>نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
              <p>${new Date().toLocaleString('ar-JO')}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * الحصول على لون الأولوية
   */
  private getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'critical':
        return '#dc3545';
      case 'high':
        return '#fd7e14';
      case 'normal':
        return '#007bff';
      case 'low':
        return '#28a745';
      default:
        return '#007bff';
    }
  }

  /**
   * الحصول على لون الأولوية بصيغة Hex
   */
  private getPriorityColorHex(priority?: string): number {
    switch (priority) {
      case 'critical':
        return 0xdc3545;
      case 'high':
        return 0xfd7e14;
      case 'normal':
        return 0x007bff;
      case 'low':
        return 0x28a745;
      default:
        return 0x007bff;
    }
  }

  /**
   * إرسال إشعارات متعددة
   */
  async sendMultiple(configs: NotificationConfig[]): Promise<boolean[]> {
    return Promise.all(configs.map(config => this.send(config)));
  }

  /**
   * إرسال إشعار فوري (عالي الأولوية)
   */
  async sendUrgent(title: string, message: string, recipients: string[]): Promise<boolean[]> {
    const configs = recipients.map(recipient => ({
      type: 'email' as const,
      recipient,
      title,
      message,
      priority: 'critical' as const,
    }));

    return this.sendMultiple(configs);
  }

  /**
   * إرسال إشعار جمركي
   */
  async sendCustomsNotification(
    title: string,
    message: string,
    customsData: Record<string, any>
  ): Promise<boolean> {
    const config: NotificationConfig = {
      type: 'email',
      recipient: process.env.CUSTOMS_ADMIN_EMAIL || '',
      title: `🔔 إشعار جمركي: ${title}`,
      message: `${message}\n\nالبيانات:\n${JSON.stringify(customsData, null, 2)}`,
      priority: 'high',
      metadata: customsData,
    };

    return this.send(config);
  }

  /**
   * إرسال إشعار خطأ
   */
  async sendErrorNotification(error: Error, context: string): Promise<boolean> {
    const config: NotificationConfig = {
      type: 'email',
      recipient: process.env.ERROR_ALERT_EMAIL || '',
      title: `❌ خطأ في النظام: ${context}`,
      message: `${error.message}\n\n${error.stack}`,
      priority: 'critical',
      metadata: { error: error.toString(), context },
    };

    return this.send(config);
  }
}

export const notificationService = new NotificationService();
