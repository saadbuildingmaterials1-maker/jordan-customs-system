/**
 * مكون صندوق الدعم الحي مع WebSocket
 * 
 * @component LiveChatBoxRealtime
 * @description واجهة المستخدم الرئيسية للدعم الحي مع التحديثات الفورية
 */

import React, { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, WebSocketMessageType, useWebSocketMessages, useWebSocketTypingStatus } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, X, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveChatBoxRealtimeProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function LiveChatBoxRealtime({
  isOpen = false,
  onClose,
}: LiveChatBoxRealtimeProps) {
  const [open, setOpen] = useState(isOpen);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConvSubject, setNewConvSubject] = useState("");
  const [newConvCategory, setNewConvCategory] = useState("general");
  const [newConvPriority, setNewConvPriority] = useState("medium");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // WebSocket
  const ws = useWebSocket({ autoConnect: true });

  // استماع إلى الرسائل الجديدة من WebSocket
  const wsMessages = useWebSocketMessages(selectedConversation);
  const typingUsers = useWebSocketTypingStatus(selectedConversation);

  // tRPC queries
  const getConversationsQuery = trpc.liveChat.getConversations.useQuery(
    { limit: 20 },
    { enabled: open }
  );

  const getMessagesQuery = trpc.liveChat.getMessages.useQuery(
    { conversationId: selectedConversation || "", limit: 50 },
    { enabled: !!selectedConversation }
  );

  const createConversationMutation =
    trpc.liveChat.createConversation.useMutation({
      onSuccess: (data) => {
        toast({
          title: "نجح",
          description: data.message,
        });
        setNewConvSubject("");
        setNewConvCategory("general");
        setNewConvPriority("medium");
        setShowNewConversation(false);
        getConversationsQuery.refetch();
      },
      onError: (error) => {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const sendMessageMutation = trpc.liveChat.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      // سيتم تحديث الرسائل من WebSocket
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تحديث البيانات من tRPC
  useEffect(() => {
    if (getConversationsQuery.data?.conversations) {
      setConversations(getConversationsQuery.data.conversations);
    }
  }, [getConversationsQuery.data]);

  useEffect(() => {
    if (getMessagesQuery.data?.messages) {
      setMessages(getMessagesQuery.data.messages);
    }
  }, [getMessagesQuery.data]);

  // إضافة الرسائل الجديدة من WebSocket
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages((prev) => [...prev, wsMessages[wsMessages.length - 1]]);
      // التمرير إلى الأسفل
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [wsMessages]);

  // الاشتراك في المحادثة عند الاختيار
  useEffect(() => {
    if (selectedConversation && ws.isAuthenticated) {
      ws.subscribeToConversation(selectedConversation);
    }
  }, [selectedConversation, ws.isAuthenticated]);

  const handleCreateConversation = () => {
    if (!newConvSubject.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال موضوع المحادثة",
        variant: "destructive",
      });
      return;
    }

    createConversationMutation.mutate({
      subject: newConvSubject,
      category: newConvCategory as any,
      priority: newConvPriority as any,
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رسالة",
        variant: "destructive",
      });
      return;
    }

    // إرسال عبر tRPC
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      message: newMessage,
    });

    // إرسال عبر WebSocket للتحديث الفوري
    ws.sendMessage(selectedConversation, newMessage);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    // إرسال حالة الكتابة
    if (selectedConversation) {
      ws.sendTypingStatus(selectedConversation, value.length > 0);

      // إيقاف الكتابة بعد 3 ثوان
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        ws.sendTypingStatus(selectedConversation, false);
      }, 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      open: { label: "مفتوح", variant: "default" },
      in_progress: { label: "قيد المعالجة", variant: "secondary" },
      waiting_customer: { label: "في انتظار العميل", variant: "outline" },
      waiting_agent: { label: "في انتظار الدعم", variant: "outline" },
      closed: { label: "مغلق", variant: "destructive" },
      resolved: { label: "تم الحل", variant: "outline" },
    };

    const badge = statusMap[status] || statusMap.open;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-blue-500",
      medium: "text-yellow-500",
      high: "text-orange-500",
      urgent: "text-red-500",
    };
    return colors[priority] || colors.medium;
  };

  const getConnectionStatus = () => {
    if (!ws.isConnected) return "غير متصل";
    if (!ws.isAuthenticated) return "جاري المصادقة...";
    return "متصل";
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
        title="فتح الدعم الحي"
      >
        <MessageCircle size={24} />
        {ws.isConnected && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        )}
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex flex-col">
          <CardTitle className="text-lg">الدعم الحي</CardTitle>
          <p className="text-xs text-gray-500 mt-1">{getConnectionStatus()}</p>
        </div>
        <button
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {!selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* قائمة المحادثات */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <Button
                  onClick={() => setShowNewConversation(true)}
                  className="w-full"
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  محادثة جديدة
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      لا توجد محادثات
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className="w-full text-right p-3 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{conv.subject}</p>
                            <p className="text-xs text-gray-500">
                              {conv.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${getPriorityColor(
                                conv.priority
                              )}`}
                            >
                              {conv.priority}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(conv.status)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* نموذج محادثة جديدة */}
            {showNewConversation && (
              <div className="p-4 border-t bg-gray-50 space-y-3">
                <Input
                  placeholder="موضوع المحادثة"
                  value={newConvSubject}
                  onChange={(e) => setNewConvSubject(e.target.value)}
                />
                <Select value={newConvCategory} onValueChange={setNewConvCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="billing">الفواتير</SelectItem>
                    <SelectItem value="technical">تقني</SelectItem>
                    <SelectItem value="complaint">شكوى</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newConvPriority} onValueChange={setNewConvPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateConversation}
                    disabled={createConversationMutation.isPending}
                    className="flex-1"
                    size="sm"
                  >
                    {createConversationMutation.isPending && (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    )}
                    إنشاء
                  </Button>
                  <Button
                    onClick={() => setShowNewConversation(false)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* رسائل المحادثة */}
            <div className="p-4 border-b">
              <Button
                onClick={() => {
                  setSelectedConversation(null);
                  setMessages([]);
                }}
                variant="outline"
                size="sm"
              >
                ← العودة
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    لا توجد رسائل
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === "customer"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.senderType === "customer"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString("ar-SA")}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {/* مؤشر الكتابة */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-black p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* حقل الرسالة */}
            <div className="p-4 border-t space-y-2">
              <Textarea
                placeholder="اكتب رسالتك..."
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                className="resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !ws.isAuthenticated}
                className="w-full"
                size="sm"
              >
                {sendMessageMutation.isPending && (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                )}
                <Send size={16} className="mr-2" />
                إرسال
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
