/**
 * websocket
 * 
 * @module ./server/websocket
 */
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export type WebSocketEventType = 
  | 'declaration:created' 
  | 'declaration:updated' 
  | 'declaration:deleted'
  | 'item:created'
  | 'item:updated'
  | 'item:deleted'
  | 'notification:new'
  | 'dashboard:refresh'
  | 'toast:show'
  | 'sync:data';

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
  timestamp: number;
  userId?: string;
}

export interface WebSocketClient {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<WebSocketEventType>;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, WebSocketClient> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private maxQueueSize = 1000;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });
    this.setupConnections();
  }

  private setupConnections() {
    this.wss.on('connection', (ws: WebSocket) => {
      const client: WebSocketClient = {
        ws,
        subscriptions: new Set(),
      };

      this.clients.set(ws, client);
      console.log(`[WebSocket] عميل جديد متصل. العدد الكلي: ${this.clients.size}`);

      ws.on('message', (message: string) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] عميل قطع الاتصال. العدد الكلي: ${this.clients.size}`);
      });

      ws.on('error', (error: Error) => {
        console.error('[WebSocket] خطأ:', error.message);
      });

      // إرسال رسالة ترحيب
      this.sendToClient(ws, {
        type: 'sync:data',
        data: { message: 'مرحباً بك في نظام التحديثات الفورية' },
        timestamp: Date.now(),
      });
    });
  }

  private handleMessage(ws: WebSocket, message: string) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(ws);

      if (!client) return;

      // معالجة الاشتراك في الأحداث
      if (data.action === 'subscribe') {
        const eventType = data.event as WebSocketEventType;
        client.subscriptions.add(eventType);
        console.log(`[WebSocket] اشتراك في: ${eventType}`);
      }

      // معالجة إلغاء الاشتراك
      if (data.action === 'unsubscribe') {
        const eventType = data.event as WebSocketEventType;
        client.subscriptions.delete(eventType);
        console.log(`[WebSocket] إلغاء اشتراك من: ${eventType}`);
      }

      // معالجة تعيين معرف المستخدم
      if (data.action === 'identify') {
        client.userId = data.userId;
        console.log(`[WebSocket] معرف المستخدم: ${data.userId}`);
      }
    } catch (error) {
      console.error('[WebSocket] خطأ في معالجة الرسالة:', error);
    }
  }

  public broadcast(event: WebSocketMessage) {
    // إضافة الرسالة إلى قائمة الانتظار
    this.messageQueue.push(event);
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue.shift();
    }

    // إرسال الرسالة إلى جميع العملاء المشتركين
    this.clients.forEach((client) => {
      if (client.subscriptions.has(event.type)) {
        this.sendToClient(client.ws, event);
      }
    });
  }

  public broadcastToUser(userId: string, event: WebSocketMessage) {
    this.clients.forEach((client) => {
      if (client.userId === userId && client.subscriptions.has(event.type)) {
        this.sendToClient(client.ws, event);
      }
    });
  }

  public broadcastToUsers(userIds: string[], event: WebSocketMessage) {
    this.clients.forEach((client) => {
      if (
        client.userId &&
        userIds.includes(client.userId) &&
        client.subscriptions.has(event.type)
      ) {
        this.sendToClient(client.ws, event);
      }
    });
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public getMessageQueueSize(): number {
    return this.messageQueue.length;
  }

  public getRecentMessages(limit: number = 50): WebSocketMessage[] {
    return this.messageQueue.slice(-limit);
  }

  public close() {
    this.wss.close();
    console.log('[WebSocket] تم إغلاق خادم WebSocket');
  }
}

// إنشاء متغير عام للإدارة
let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: Server): WebSocketManager {
  wsManager = new WebSocketManager(server);
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}

// دوال مساعدة للبث
export function broadcastEvent(event: WebSocketMessage) {
  wsManager?.broadcast(event);
}

export function broadcastToUser(userId: string, event: WebSocketMessage) {
  wsManager?.broadcastToUser(userId, event);
}

export function broadcastToUsers(userIds: string[], event: WebSocketMessage) {
  wsManager?.broadcastToUsers(userIds, event);
}
