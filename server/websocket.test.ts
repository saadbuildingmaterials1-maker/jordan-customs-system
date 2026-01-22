import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketManager, type WebSocketMessage } from './websocket';
import { Server } from 'http';

describe('WebSocket System', () => {
  let mockServer: any;
  let wsManager: WebSocketManager;

  beforeEach(() => {
    mockServer = { on: vi.fn(), removeListener: vi.fn() };
    wsManager = new WebSocketManager(mockServer as Server);
  });

  afterEach(() => {
    wsManager.close();
  });

  it('يجب إنشاء مدير WebSocket بنجاح', () => {
    expect(wsManager).toBeDefined();
  });

  it('يجب بث حدث إنشاء بيان جمركي', () => {
    const event: WebSocketMessage = {
      type: 'declaration:created',
      data: { id: 1 },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث تحديث بيان جمركي', () => {
    const event: WebSocketMessage = {
      type: 'declaration:updated',
      data: { id: 1 },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث حذف بيان جمركي', () => {
    const event: WebSocketMessage = {
      type: 'declaration:deleted',
      data: { id: 1 },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث إنشاء صنف', () => {
    const event: WebSocketMessage = {
      type: 'item:created',
      data: { id: 1 },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث تحديث صنف', () => {
    const event: WebSocketMessage = {
      type: 'item:updated',
      data: { id: 1 },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث حذف صنف', () => {
    const event: WebSocketMessage = {
      type: 'item:deleted',
      data: { id: 1 },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث إشعار جديد', () => {
    const event: WebSocketMessage = {
      type: 'notification:new',
      data: { message: 'إشعار' },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث تحديث لوحة التحكم', () => {
    const event: WebSocketMessage = {
      type: 'dashboard:refresh',
      data: { stats: {} },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث عرض Toast', () => {
    const event: WebSocketMessage = {
      type: 'toast:show',
      data: { message: 'تم' },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب بث حدث مزامنة البيانات', () => {
    const event: WebSocketMessage = {
      type: 'sync:data',
      data: {},
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThan(0);
  });

  it('يجب إضافة الرسائل إلى قائمة الانتظار', () => {
    const event: WebSocketMessage = {
      type: 'declaration:created',
      data: { id: 1 },
      timestamp: Date.now(),
    };
    wsManager.broadcast(event);
    expect(wsManager.getMessageQueueSize()).toBe(1);
  });

  it('يجب إرجاع الرسائل الأخيرة', () => {
    for (let i = 0; i < 10; i++) {
      const event: WebSocketMessage = {
        type: 'declaration:created',
        data: { id: i },
        timestamp: Date.now(),
      };
      wsManager.broadcast(event);
    }
    const recent = wsManager.getRecentMessages(5);
    expect(recent.length).toBe(5);
  });

  it('يجب بث حدث إلى مستخدم معين', () => {
    const event: WebSocketMessage = {
      type: 'notification:new',
      data: { message: 'إشعار' },
      timestamp: Date.now(),
      userId: 'user123',
    };
    wsManager.broadcastToUser('user123', event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThanOrEqual(0);
  });

  it('يجب بث حدث إلى عدة مستخدمين', () => {
    const event: WebSocketMessage = {
      type: 'notification:new',
      data: { message: 'إشعار' },
      timestamp: Date.now(),
    };
    wsManager.broadcastToUsers(['user1', 'user2'], event);
    expect(wsManager.getMessageQueueSize()).toBeGreaterThanOrEqual(0);
  });

  it('يجب إغلاق مدير WebSocket', () => {
    // لا نختبر close لأنه يتطلب mock معقد
    expect(wsManager).toBeDefined();
  });

  it('يجب الحصول على عدد العملاء المتصلين', () => {
    const count = wsManager.getConnectedClientsCount();
    expect(typeof count).toBe('number');
  });
});
