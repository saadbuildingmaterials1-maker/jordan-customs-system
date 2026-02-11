/**
 * notification-websocket
 * 
 * @module ./server/notification-websocket
 */
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as db from './db';

interface NotificationPayload {
  id: string;
  type: 'container_status' | 'declaration_status' | 'payment' | 'alert' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
  timestamp: number;
  read: boolean;
}

interface UserSocket {
  userId: number;
  socketId: string;
  connectedAt: number;
}

/**
 * خدمة الإشعارات الفورية باستخدام WebSockets
 * توفر تحديثات فعلية لحالة الحاويات والبيانات الجمركية
 */
export class NotificationService {
  private io: SocketIOServer;
  private userSockets: Map<number, UserSocket[]> = new Map();
  private notificationQueue: NotificationPayload[] = [];
  private maxQueueSize = 1000;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHealthCheck();
  }

  /**
   * إعداد middleware للتحقق من المستخدم
   */
  private setupMiddleware() {
    this.io.use(async (socket: any, next: any) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('التوكن مطلوب'));
        }

        // استخراج userId من التوكن (مبسط)
        const parts = token.split('.');
        if (parts.length !== 3) {
          return next(new Error('توكن غير صحيح'));
        }

        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          socket.data.userId = payload.userId || payload.sub;
          socket.data.userRole = payload.role || 'user';
        } catch (e) {
          return next(new Error('فشل فك التوكن'));
        }
        next();
      } catch (error) {
        next(new Error('فشل التحقق من الاتصال'));
      }
    });
  }

  /**
   * إعداد معالجات الأحداث
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      console.log(`[WebSocket] المستخدم ${userId} متصل - Socket ID: ${socket.id}`);

      // تسجيل الاتصال
      this.registerUserSocket(userId, socket.id);

      // الاستماع للأحداث
      socket.on('subscribe_container', (containerId: string) => {
        socket.join(`container:${containerId}`);
        console.log(`[WebSocket] المستخدم ${userId} اشترك في الحاوية ${containerId}`);
      });

      socket.on('unsubscribe_container', (containerId: string) => {
        socket.leave(`container:${containerId}`);
        console.log(`[WebSocket] المستخدم ${userId} ألغى الاشتراك من الحاوية ${containerId}`);
      });

      socket.on('subscribe_declaration', (declarationId: string) => {
        socket.join(`declaration:${declarationId}`);
        console.log(`[WebSocket] المستخدم ${userId} اشترك في البيان ${declarationId}`);
      });

      socket.on('get_notifications', async () => {
        try {
          const notifications = await db.getNotificationsByUserId(userId);
          socket.emit('notifications_list', notifications);
        } catch (error: any) {
          socket.emit('error', 'فشل جلب الإشعارات');
        }
      });

      socket.on('mark_notification_read', async (notificationId: string) => {
        try {
          await db.markNotificationAsRead(parseInt(notificationId));
          this.io.to(`user:${userId}`).emit('notification_read', { notificationId });
        } catch (error: any) {
        }
      });

      socket.on('mark_all_read', async () => {
        try {
          await db.markAllNotificationsAsRead(userId);
          this.io.to(`user:${userId}`).emit('all_notifications_read');
        } catch (error: any) {
        }
      });

      socket.on('disconnect', () => {
        this.unregisterUserSocket(userId, socket.id);
        console.log(`[WebSocket] المستخدم ${userId} قطع الاتصال`);
      });

      socket.on('error', (error: any) => {
      });
    });
  }

  /**
   * تسجيل اتصال المستخدم
   */
  private registerUserSocket(userId: number, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }

    const sockets = this.userSockets.get(userId)!;
    sockets.push({
      userId,
      socketId,
      connectedAt: Date.now(),
    });

    // الانضمام إلى غرفة المستخدم
    this.io.sockets.sockets.get(socketId)?.join(`user:${userId}`);
  }

  /**
   * إلغاء تسجيل اتصال المستخدم
   */
  private unregisterUserSocket(userId: number, socketId: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      const index = sockets.findIndex(s => s.socketId === socketId);
      if (index !== -1) {
        sockets.splice(index, 1);
      }

      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  /**
   * إرسال إشعار إلى المستخدم
   */
  async sendNotification(
    userId: number,
    notification: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'>
  ) {
    const payload: NotificationPayload = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    // حفظ الإشعار في قائمة الانتظار
    this.notificationQueue.push(payload);
    if (this.notificationQueue.length > this.maxQueueSize) {
      this.notificationQueue.shift();
    }

    // حفظ في قاعدة البيانات
    try {
      const notifData = {
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        data: JSON.stringify(payload.data || {}),
        read: false,
        createdAt: new Date(),
      };
      await db.createNotification(notifData as any);
    } catch (error: any) {
    }

    // إرسال الإشعار عبر WebSocket
    this.io.to(`user:${userId}`).emit('new_notification', payload);

    // إرسال صوت التنبيه إذا كان الأولوية عالية
    if (payload.priority === 'high' || payload.priority === 'critical') {
      this.io.to(`user:${userId}`).emit('play_sound', { priority: payload.priority });
    }
  }

  /**
   * إرسال إشعار إلى مجموعة من المستخدمين
   */
  async sendNotificationToUsers(
    userIds: number[],
    notification: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'>
  ) {
    for (const userId of userIds) {
      await this.sendNotification(userId, notification);
    }
  }

  /**
   * إرسال تحديث حالة الحاوية
   */
  async broadcastContainerStatusUpdate(
    containerId: string,
    status: string,
    location?: { lat: number; lng: number }
  ) {
    const payload = {
      containerId,
      status,
      location,
      timestamp: Date.now(),
    };

    this.io.to(`container:${containerId}`).emit('container_status_updated', payload);

    // إرسال إشعار للمستخدمين المشتركين
    const notification: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'> = {
      type: 'container_status',
      title: `تحديث حالة الحاوية ${containerId}`,
      message: `تم تحديث حالة الحاوية إلى: ${status}`,
      priority: 'medium',
      data: payload,
    };

    // إرسال إلى جميع المستخدمين المتصلين
    this.io.emit('container_broadcast', { notification, containerId });
  }

  /**
   * إرسال تحديث حالة البيان الجمركي
   */
  async broadcastDeclarationStatusUpdate(
    declarationId: string,
    status: string,
    details?: Record<string, any>
  ) {
    const payload = {
      declarationId,
      status,
      details,
      timestamp: Date.now(),
    };

    this.io.to(`declaration:${declarationId}`).emit('declaration_status_updated', payload);
  }

  /**
   * إرسال تنبيه نظام
   */
  async sendSystemAlert(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    const notification: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'> = {
      type: 'system',
      title,
      message,
      priority,
    };

    // إرسال إلى جميع المستخدمين المتصلين
    this.io.emit('system_alert', notification);
  }

  /**
   * فحص صحة الاتصالات
   */
  private startHealthCheck() {
    setInterval(() => {
      const connectedUsers = this.userSockets.size;
      const totalSockets = Array.from(this.userSockets.values()).reduce(
        (sum, sockets) => sum + sockets.length,
        0
      );

      console.log(`[WebSocket Health] المستخدمون المتصلون: ${connectedUsers}, الاتصالات: ${totalSockets}`);

      // تنظيف الاتصالات المنقطعة
      this.cleanupStaleConnections();
    }, 60000); // كل دقيقة
  }

  /**
   * تنظيف الاتصالات المنقطعة
   */
  private cleanupStaleConnections() {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 دقائق

    for (const [userId, sockets] of Array.from(this.userSockets.entries())) {
      const activeSockets = sockets.filter((s: UserSocket) => {
        const isActive = this.io.sockets.sockets.has(s.socketId);
        const isNotStale = now - s.connectedAt < staleThreshold;
        return isActive && isNotStale;
      });

      if (activeSockets.length === 0) {
        this.userSockets.delete(userId);
      } else if (activeSockets.length < sockets.length) {
        this.userSockets.set(userId, activeSockets);
      }
    }
  }

  /**
   * الحصول على إحصائيات الاتصالات
   */
  getStats() {
    return {
      connectedUsers: this.userSockets.size,
      totalConnections: Array.from(this.userSockets.values()).reduce(
        (sum: number, sockets: UserSocket[]) => sum + sockets.length,
        0
      ),
      queuedNotifications: this.notificationQueue.length,
      connectedSockets: (this.io.engine as any).clientsCount,
    };
  }

  /**
   * إغلاق الخدمة
   */
  close() {
    this.io.close();
    this.userSockets.clear();
    this.notificationQueue = [];
  }
}

// تصدير الخدمة
let notificationService: NotificationService | null = null;

export function initializeNotificationService(httpServer: HTTPServer): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService(httpServer);
  }
  return notificationService;
}

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    throw new Error('خدمة الإشعارات لم تتم تهيئتها');
  }
  return notificationService;
}
