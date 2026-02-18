/**
 * خادم WebSocket للدعم الحي
 * 
 * @module ./server/websocket-server
 * @description خادم WebSocket لتوفير التحديثات الفورية للمحادثات
 */

import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import {
  liveChatConversations,
  liveChatMessages,
} from "../drizzle/live-chat-schema";
import { eq } from "drizzle-orm";

/**
 * أنواع الرسائل في WebSocket
 */
export enum WebSocketMessageType {
  // الاتصال والمصادقة
  CONNECT = "connect",
  AUTHENTICATE = "authenticate",
  AUTHENTICATED = "authenticated",
  DISCONNECT = "disconnect",

  // المحادثات
  CONVERSATION_CREATED = "conversation_created",
  CONVERSATION_UPDATED = "conversation_updated",
  CONVERSATION_STATUS_CHANGED = "conversation_status_changed",

  // الرسائل
  MESSAGE_SENT = "message_sent",
  MESSAGE_RECEIVED = "message_received",
  MESSAGE_TYPING = "message_typing",
  MESSAGE_DELIVERED = "message_delivered",
  MESSAGE_READ = "message_read",

  // الإشعارات
  NOTIFICATION_SENT = "notification_sent",
  NOTIFICATION_RECEIVED = "notification_received",

  // الأخطاء
  ERROR = "error",
  PING = "ping",
  PONG = "pong",
}

/**
 * واجهة رسالة WebSocket
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp?: number;
  messageId?: string;
}

/**
 * واجهة اتصال المستخدم
 */
interface UserConnection {
  userId: number;
  conversationIds: Set<string>;
  socket: WebSocket;
  isAuthenticated: boolean;
  lastActivity: number;
}

/**
 * فئة خادم WebSocket
 */
export class LiveChatWebSocketServer {
  private wss: WebSocketServer;
  private userConnections: Map<string, UserConnection> = new Map();
  private conversationSubscribers: Map<string, Set<string>> = new Map(); // conversationId -> connectionIds
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port });
    this.setupServer();
    this.startHeartbeat();
  }

  /**
   * إعداد خادم WebSocket
   */
  private setupServer(): void {
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      const connectionId = uuidv4();

      console.log(`[WebSocket] New connection: ${connectionId}`);

      // إنشاء اتصال جديد
      const connection: UserConnection = {
        userId: 0,
        conversationIds: new Set(),
        socket: ws,
        isAuthenticated: false,
        lastActivity: Date.now(),
      };

      this.userConnections.set(connectionId, connection);

      // معالجة الرسائل
      ws.on("message", (data: Buffer) => {
        this.handleMessage(connectionId, data);
      });

      // معالجة الإغلاق
      ws.on("close", () => {
        this.handleDisconnect(connectionId);
      });

      // معالجة الأخطاء
      ws.on("error", (error) => {
        console.error(`[WebSocket] Error on connection ${connectionId}:`, error);
      });

      // إرسال رسالة ترحيب
      this.sendMessage(connectionId, {
        type: WebSocketMessageType.CONNECT,
        data: { connectionId, message: "مرحباً بك في نظام الدعم الحي" },
      });
    });

    console.log("[WebSocket] Server started");
  }

  /**
   * معالجة الرسائل الواردة
   */
  private async handleMessage(
    connectionId: string,
    data: Buffer
  ): Promise<void> {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const connection = this.userConnections.get(connectionId);

      if (!connection) {
        console.warn(`[WebSocket] Connection not found: ${connectionId}`);
        return;
      }

      // تحديث آخر نشاط
      connection.lastActivity = Date.now();

      switch (message.type) {
        case WebSocketMessageType.AUTHENTICATE:
          await this.handleAuthenticate(connectionId, message.data);
          break;

        case WebSocketMessageType.SUBSCRIBE:
          this.handleSubscribe(connectionId, message.data);
          break;

        case WebSocketMessageType.UNSUBSCRIBE:
          this.handleUnsubscribe(connectionId, message.data);
          break;

        case WebSocketMessageType.MESSAGE_SENT:
          await this.handleMessageSent(connectionId, message.data);
          break;

        case WebSocketMessageType.MESSAGE_TYPING:
          this.handleTyping(connectionId, message.data);
          break;

        case WebSocketMessageType.PING:
          this.sendMessage(connectionId, {
            type: WebSocketMessageType.PONG,
            data: { timestamp: Date.now() },
          });
          break;

        default:
          console.warn(
            `[WebSocket] Unknown message type: ${message.type}`
          );
      }
    } catch (error) {
      console.error("[WebSocket] Error handling message:", error);
      this.sendMessage(connectionId, {
        type: WebSocketMessageType.ERROR,
        data: { error: "فشل في معالجة الرسالة" },
      });
    }
  }

  /**
   * معالجة المصادقة
   */
  private async handleAuthenticate(
    connectionId: string,
    data: any
  ): Promise<void> {
    const connection = this.userConnections.get(connectionId);
    if (!connection) return;

    const { userId, token } = data;

    // التحقق من المستخدم (يمكن إضافة التحقق من الرمز)
    if (userId) {
      connection.userId = userId;
      connection.isAuthenticated = true;

      this.sendMessage(connectionId, {
        type: WebSocketMessageType.AUTHENTICATED,
        data: { userId, message: "تم المصادقة بنجاح" },
      });

      console.log(
        `[WebSocket] User authenticated: ${userId} (${connectionId})`
      );
    } else {
      this.sendMessage(connectionId, {
        type: WebSocketMessageType.ERROR,
        data: { error: "فشل المصادقة" },
      });
    }
  }

  /**
   * الاشتراك في محادثة
   */
  private handleSubscribe(connectionId: string, data: any): void {
    const connection = this.userConnections.get(connectionId);
    if (!connection || !connection.isAuthenticated) return;

    const { conversationId } = data;

    if (!conversationId) return;

    // إضافة الاتصال إلى المحادثة
    if (!this.conversationSubscribers.has(conversationId)) {
      this.conversationSubscribers.set(conversationId, new Set());
    }

    this.conversationSubscribers.get(conversationId)!.add(connectionId);
    connection.conversationIds.add(conversationId);

    console.log(
      `[WebSocket] User ${connection.userId} subscribed to conversation ${conversationId}`
    );
  }

  /**
   * إلغاء الاشتراك من محادثة
   */
  private handleUnsubscribe(connectionId: string, data: any): void {
    const connection = this.userConnections.get(connectionId);
    if (!connection) return;

    const { conversationId } = data;

    if (!conversationId) return;

    // إزالة الاتصال من المحادثة
    this.conversationSubscribers.get(conversationId)?.delete(connectionId);
    connection.conversationIds.delete(conversationId);

    console.log(
      `[WebSocket] User ${connection.userId} unsubscribed from conversation ${conversationId}`
    );
  }

  /**
   * معالجة إرسال الرسالة
   */
  private async handleMessageSent(
    connectionId: string,
    data: any
  ): Promise<void> {
    const connection = this.userConnections.get(connectionId);
    if (!connection || !connection.isAuthenticated) return;

    const { conversationId, message, messageId } = data;

    // بث الرسالة إلى جميع المشتركين في المحادثة
    this.broadcastToConversation(conversationId, {
      type: WebSocketMessageType.MESSAGE_RECEIVED,
      data: {
        conversationId,
        messageId: messageId || uuidv4(),
        senderId: connection.userId,
        message,
        timestamp: Date.now(),
      },
    });

    console.log(
      `[WebSocket] Message sent in conversation ${conversationId} by user ${connection.userId}`
    );
  }

  /**
   * معالجة الكتابة
   */
  private handleTyping(connectionId: string, data: any): void {
    const connection = this.userConnections.get(connectionId);
    if (!connection || !connection.isAuthenticated) return;

    const { conversationId, isTyping } = data;

    // بث حالة الكتابة إلى جميع المشتركين
    this.broadcastToConversation(conversationId, {
      type: WebSocketMessageType.MESSAGE_TYPING,
      data: {
        conversationId,
        userId: connection.userId,
        isTyping,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * معالجة قطع الاتصال
   */
  private handleDisconnect(connectionId: string): void {
    const connection = this.userConnections.get(connectionId);

    if (connection) {
      console.log(
        `[WebSocket] User ${connection.userId} disconnected (${connectionId})`
      );

      // إزالة من جميع المحادثات
      connection.conversationIds.forEach((conversationId) => {
        this.conversationSubscribers
          .get(conversationId)
          ?.delete(connectionId);
      });
    }

    this.userConnections.delete(connectionId);
  }

  /**
   * إرسال رسالة إلى اتصال معين
   */
  private sendMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.userConnections.get(connectionId);

    if (connection && connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(JSON.stringify(message));
    }
  }

  /**
   * بث رسالة إلى جميع المشتركين في محادثة
   */
  public broadcastToConversation(
    conversationId: string,
    message: WebSocketMessage
  ): void {
    const subscribers = this.conversationSubscribers.get(conversationId);

    if (subscribers) {
      subscribers.forEach((connectionId) => {
        this.sendMessage(connectionId, message);
      });
    }
  }

  /**
   * بث رسالة إلى مستخدم معين
   */
  public broadcastToUser(userId: number, message: WebSocketMessage): void {
    this.userConnections.forEach((connection, connectionId) => {
      if (connection.userId === userId) {
        this.sendMessage(connectionId, message);
      }
    });
  }

  /**
   * إرسال إشعار إلى جميع المستخدمين
   */
  public broadcastToAll(message: WebSocketMessage): void {
    this.userConnections.forEach((connection, connectionId) => {
      this.sendMessage(connectionId, message);
    });
  }

  /**
   * بدء نبضات القلب للتحقق من الاتصالات
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60 ثانية

      this.userConnections.forEach((connection, connectionId) => {
        // إغلاق الاتصالات غير النشطة
        if (now - connection.lastActivity > timeout) {
          console.log(
            `[WebSocket] Closing inactive connection: ${connectionId}`
          );
          connection.socket.close();
          this.handleDisconnect(connectionId);
        } else {
          // إرسال ping
          this.sendMessage(connectionId, {
            type: WebSocketMessageType.PING,
            data: { timestamp: now },
          });
        }
      });
    }, 30000); // كل 30 ثانية
  }

  /**
   * إيقاف الخادم
   */
  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.wss.close(() => {
      console.log("[WebSocket] Server stopped");
    });
  }

  /**
   * الحصول على عدد الاتصالات النشطة
   */
  public getActiveConnections(): number {
    return this.userConnections.size;
  }

  /**
   * الحصول على عدد المشتركين في محادثة
   */
  public getConversationSubscribers(conversationId: string): number {
    return this.conversationSubscribers.get(conversationId)?.size || 0;
  }
}

// إنشاء مثيل من الخادم
export let wsServer: LiveChatWebSocketServer | null = null;

/**
 * تهيئة خادم WebSocket
 */
export function initializeWebSocketServer(port: number = 3001): void {
  if (!wsServer) {
    wsServer = new LiveChatWebSocketServer(port);
    console.log(`[WebSocket] Initialized on port ${port}`);
  }
}

/**
 * الحصول على خادم WebSocket
 */
export function getWebSocketServer(): LiveChatWebSocketServer | null {
  return wsServer;
}
