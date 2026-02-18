/**
 * خطاف WebSocket للتحديثات الفورية
 * 
 * @module ./client/src/hooks/useWebSocket
 * @description خطاف React لإدارة اتصالات WebSocket للدعم الحي والإشعارات
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "./use-auth";

/**
 * أنواع الرسائل في WebSocket
 */
export enum WebSocketMessageType {
  // الاتصال والمصادقة
  CONNECT = "connect",
  AUTHENTICATE = "authenticate",
  AUTHENTICATED = "authenticated",
  DISCONNECT = "disconnect",
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",

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

  // الأخطاء والتحكم
  ERROR = "error",
  PING = "ping",
  PONG = "pong",

  // الأحداث القديمة (للتوافقية)
  DECLARATION_CREATED = "declaration:created",
  DECLARATION_UPDATED = "declaration:updated",
  DECLARATION_DELETED = "declaration:deleted",
  ITEM_CREATED = "item:created",
  ITEM_UPDATED = "item:updated",
  ITEM_DELETED = "item:deleted",
  NOTIFICATION_NEW = "notification:new",
  DASHBOARD_REFRESH = "dashboard:refresh",
  TOAST_SHOW = "toast:show",
  SYNC_DATA = "sync:data",
}

/**
 * واجهة رسالة WebSocket
 */
export interface WebSocketMessage {
  type: WebSocketMessageType | string;
  data: any;
  timestamp?: number;
  messageId?: string;
  userId?: string;
}

/**
 * واجهة خيارات الخطاف
 */
interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

/**
 * خطاف WebSocket الرئيسي
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
      window.location.hostname
    }:3001`,
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000,
  } = options;

  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<Function>>>(new Map());
  const subscribedConversationsRef = useRef<Set<string>>(new Set());

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  /**
   * الاتصال بخادم WebSocket
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        reconnectCountRef.current = 0;

        // المصادقة
        if (user?.id) {
          send({
            type: WebSocketMessageType.AUTHENTICATE,
            data: { userId: user.id },
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // معالجة المصادقة
          if (message.type === WebSocketMessageType.AUTHENTICATED) {
            setIsAuthenticated(true);
            console.log("[WebSocket] Authenticated");
          }

          // استدعاء المعالجات المسجلة
          const handlers = messageHandlersRef.current.get(message.type);
          if (handlers) {
            handlers.forEach((handler) => handler(message.data));
          }

          // استدعاء معالج عام
          const generalHandlers = messageHandlersRef.current.get("*");
          if (generalHandlers) {
            generalHandlers.forEach((handler) => handler(message));
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        setIsAuthenticated(false);
        wsRef.current = null;

        // محاولة إعادة الاتصال
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `[WebSocket] Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`
            );
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
    }
  }, [url, user?.id, reconnectAttempts, reconnectDelay]);

  /**
   * قطع الاتصال
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsAuthenticated(false);
  }, []);

  /**
   * إرسال رسالة
   */
  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("[WebSocket] Not connected, cannot send message");
    }
  }, []);

  /**
   * الاشتراك في محادثة
   */
  const subscribeToConversation = useCallback((conversationId: string) => {
    if (!subscribedConversationsRef.current.has(conversationId)) {
      send({
        type: WebSocketMessageType.SUBSCRIBE,
        data: { conversationId },
      });
      subscribedConversationsRef.current.add(conversationId);
    }
  }, [send]);

  /**
   * إلغاء الاشتراك من محادثة
   */
  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    if (subscribedConversationsRef.current.has(conversationId)) {
      send({
        type: WebSocketMessageType.UNSUBSCRIBE,
        data: { conversationId },
      });
      subscribedConversationsRef.current.delete(conversationId);
    }
  }, [send]);

  /**
   * إرسال رسالة في محادثة
   */
  const sendMessage = useCallback(
    (conversationId: string, message: string) => {
      send({
        type: WebSocketMessageType.MESSAGE_SENT,
        data: { conversationId, message },
      });
    },
    [send]
  );

  /**
   * إرسال حالة الكتابة
   */
  const sendTypingStatus = useCallback(
    (conversationId: string, isTyping: boolean) => {
      send({
        type: WebSocketMessageType.MESSAGE_TYPING,
        data: { conversationId, isTyping },
      });
    },
    [send]
  );

  /**
   * تسجيل معالج للرسائل
   */
  const onMessage = useCallback(
    (messageType: string, handler: (data: any) => void) => {
      if (!messageHandlersRef.current.has(messageType)) {
        messageHandlersRef.current.set(messageType, new Set());
      }

      messageHandlersRef.current.get(messageType)!.add(handler);

      // إرجاع دالة لإزالة المعالج
      return () => {
        messageHandlersRef.current.get(messageType)!.delete(handler);
      };
    },
    []
  );

  /**
   * الاشتراك في حدث (للتوافقية مع الكود القديم)
   */
  const subscribe = useCallback(
    (eventType: string, handler: (data: any) => void) => {
      return onMessage(eventType, handler);
    },
    [onMessage]
  );

  /**
   * إلغاء الاشتراك عن حدث (للتوافقية مع الكود القديم)
   */
  const unsubscribe = useCallback((eventType: string) => {
    messageHandlersRef.current.delete(eventType);
  }, []);

  /**
   * الاتصال التلقائي عند التحميل
   */
  useEffect(() => {
    if (autoConnect && user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user?.id, connect, disconnect]);

  return {
    isConnected,
    isAuthenticated,
    lastMessage,
    connect,
    disconnect,
    send,
    sendMessage,
    sendTypingStatus,
    subscribeToConversation,
    unsubscribeFromConversation,
    onMessage,
    subscribe,
    unsubscribe,
  };
}

/**
 * خطاف للاستماع إلى الرسائل الجديدة
 */
export function useWebSocketMessages(
  conversationId: string | null,
  messageType: string = WebSocketMessageType.MESSAGE_RECEIVED
) {
  const ws = useWebSocket();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    // الاشتراك في المحادثة
    ws.subscribeToConversation(conversationId);

    // الاستماع إلى الرسائل الجديدة
    const unsubscribe = ws.onMessage(messageType, (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      unsubscribe();
      ws.unsubscribeFromConversation(conversationId);
    };
  }, [conversationId, messageType, ws]);

  return messages;
}

/**
 * خطاف للاستماع إلى حالة الكتابة
 */
export function useWebSocketTypingStatus(conversationId: string | null) {
  const ws = useWebSocket();
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = ws.onMessage(
      WebSocketMessageType.MESSAGE_TYPING,
      (data) => {
        if (data.conversationId === conversationId) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId, ws]);

  return typingUsers;
}
