/**
 * useWebSocket Hook
 * 
 * React Hook مخصص
 * 
 * @module ./client/src/hooks/useWebSocket
 */
import { useEffect, useRef, useCallback, useState } from 'react';

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

export function useWebSocket(userId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messageHandlers = useRef<Map<WebSocketEventType, Set<(data: any) => void>>>(
    new Map()
  );

  // الاتصال بخادم WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] متصل بنجاح');
        setIsConnected(true);

        // إرسال معرف المستخدم
        if (userId) {
          ws.send(JSON.stringify({
            action: 'identify',
            userId,
          }));
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // استدعاء المعالجات المسجلة
          const handlers = messageHandlers.current.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message.data));
          }
        } catch (error) {
          console.error('[WebSocket] خطأ في معالجة الرسالة:', error);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] قطع الاتصال');
        setIsConnected(false);
      };

      ws.onerror = (error: Event) => {
        console.error('[WebSocket] خطأ:', error);
      };

      wsRef.current = ws;

      return () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      };
    } catch (error) {
      console.error('[WebSocket] خطأ في الاتصال:', error);
    }
  }, [userId]);

  // الاشتراك في حدث معين
  const subscribe = useCallback((eventType: WebSocketEventType, handler: (data: any) => void) => {
    // إضافة المعالج
    if (!messageHandlers.current.has(eventType)) {
      messageHandlers.current.set(eventType, new Set());
    }
    messageHandlers.current.get(eventType)?.add(handler);

    // إرسال طلب الاشتراك إلى الخادم
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'subscribe',
        event: eventType,
      }));
    }

    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      messageHandlers.current.get(eventType)?.delete(handler);
      if (messageHandlers.current.get(eventType)?.size === 0) {
        messageHandlers.current.delete(eventType);

        // إرسال طلب إلغاء الاشتراك
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: 'unsubscribe',
            event: eventType,
          }));
        }
      }
    };
  }, []);

  // إلغاء الاشتراك عن حدث معين
  const unsubscribe = useCallback((eventType: WebSocketEventType) => {
    messageHandlers.current.delete(eventType);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'unsubscribe',
        event: eventType,
      }));
    }
  }, []);

  // إرسال رسالة مخصصة
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] الاتصال غير نشط');
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    subscribe,
    unsubscribe,
    send,
  };
}
