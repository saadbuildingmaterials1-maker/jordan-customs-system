/**
 * لوحة تحكم الدعم (Support Dashboard)
 * 
 * @component
 * @description واجهة موظفي الدعم لإدارة المحادثات والرد على العملاء
 */

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Phone,
  Mail,
  User,
  TrendingUp,
} from "lucide-react";

interface Conversation {
  id: string;
  subject: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_customer" | "resolved";
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  supportAgentId?: number;
  rating?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  senderType: "customer" | "agent";
  message: string;
  messageType: "text" | "file";
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

interface AgentStats {
  totalConversations: number;
  activeConversations: number;
  closedConversations: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
}

export function SupportDashboard() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "waiting_customer">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // استدعاء البيانات
  const { data: conversationsData, isLoading: conversationsLoading } =
    trpc.supportAgent.getPendingConversations.useQuery({
      limit: 50,
      offset: 0,
      status:
        filter === "all"
          ? undefined
          : (filter as "open" | "in_progress" | "waiting_customer"),
    });

  const { data: conversationDetails } =
    trpc.supportAgent.getConversationDetails.useQuery(
      { conversationId: selectedConversation?.id || "" },
      { enabled: !!selectedConversation?.id }
    );

  const { data: agentStats } = trpc.supportAgent.getAgentStats.useQuery();
  const { data: quickReplies } = trpc.supportAgent.getQuickReplies.useQuery();

  // الطفرات
  const assignMutation = trpc.supportAgent.assignConversation.useMutation();
  const sendMessageMutation = trpc.supportAgent.sendAgentMessage.useMutation();
  const closeMutation = trpc.supportAgent.closeConversation.useMutation();
  const escalateMutation = trpc.supportAgent.escalateConversation.useMutation();

  // تحديث الرسائل عند تغيير المحادثة المختارة
  useEffect(() => {
    if (conversationDetails?.messages) {
      setMessages(conversationDetails.messages);
    }
  }, [conversationDetails?.messages]);

  // معالجة تعيين المحادثة
  const handleAssignConversation = async (conversation: Conversation) => {
    try {
      await assignMutation.mutateAsync({ conversationId: conversation.id });
      setSelectedConversation({ ...conversation, supportAgentId: 1 });
    } catch (error) {
      console.error("خطأ في تعيين المحادثة:", error);
    }
  };

  // معالجة إرسال الرسالة
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        message: newMessage,
      });

      setNewMessage("");
      // تحديث الرسائل
      if (conversationDetails?.messages) {
        setMessages([
          ...conversationDetails.messages,
          {
            id: Math.random().toString(36).substring(7),
            conversationId: selectedConversation.id,
            senderId: 1,
            senderType: "agent",
            message: newMessage,
            messageType: "text",
            isRead: false,
            createdAt: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
    }
  };

  // معالجة إغلاق المحادثة
  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      await closeMutation.mutateAsync({
        conversationId: selectedConversation.id,
      });
      setSelectedConversation(null);
    } catch (error) {
      console.error("خطأ في إغلاق المحادثة:", error);
    }
  };

  // معالجة تصعيد المحادثة
  const handleEscalate = async () => {
    if (!selectedConversation) return;

    try {
      await escalateMutation.mutateAsync({
        conversationId: selectedConversation.id,
        reason: "تصعيد من قبل موظف الدعم",
      });
    } catch (error) {
      console.error("خطأ في تصعيد المحادثة:", error);
    }
  };

  // تصفية المحادثات
  const filteredConversations = (conversationsData?.conversations || []).filter(
    (conv) =>
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // الحصول على لون الأولوية
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "waiting_customer":
        return "bg-amber-100 text-amber-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* الشريط الجانبي - قائمة المحادثات */}
      <div className="w-1/4 border-l border-gray-200 bg-white flex flex-col">
        {/* رأس الشريط الجانبي */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">المحادثات</h2>

          {/* شريط البحث */}
          <Input
            placeholder="ابحث عن محادثة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {/* فلاتر الحالة */}
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="open">مفتوحة</SelectItem>
              <SelectItem value="in_progress">قيد المعالجة</SelectItem>
              <SelectItem value="waiting_customer">في انتظار العميل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* قائمة المحادثات */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {conversationsLoading ? (
              <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد محادثات
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedConversation?.id === conversation.id
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {conversation.subject}
                    </h3>
                    <Badge className={getPriorityColor(conversation.priority)}>
                      {conversation.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.createdAt).toLocaleTimeString("ar-JO")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* المنطقة الرئيسية */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* رأس المحادثة */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {selectedConversation.subject}
                  </h1>
                  <p className="text-sm text-gray-500">
                    معرّف المحادثة: {selectedConversation.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedConversation.status === "open" && (
                  <Button
                    onClick={() => handleAssignConversation(selectedConversation)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="w-4 h-4 ml-2" />
                    قبول المحادثة
                  </Button>
                )}

                {selectedConversation.status === "in_progress" && (
                  <>
                    <Button
                      onClick={handleEscalate}
                      variant="outline"
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <AlertCircle className="w-4 h-4 ml-2" />
                      تصعيد
                    </Button>
                    <Button
                      onClick={handleCloseConversation}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                      إغلاق
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* منطقة الرسائل */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === "agent"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderType === "agent"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString("ar-JO")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* منطقة الإدخال */}
            {selectedConversation.status === "in_progress" && (
              <div className="bg-white border-t border-gray-200 p-4">
                {/* الردود السريعة */}
                {quickReplies && quickReplies.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      الردود السريعة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply) => (
                        <Button
                          key={reply.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setNewMessage(reply.content)}
                          className="text-xs"
                        >
                          {reply.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* حقل الإدخال */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="اكتب رسالتك هنا..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* حالة عدم اختيار محادثة */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                اختر محادثة لبدء الدعم
              </p>
            </div>
          </div>
        )}
      </div>

      {/* الشريط الجانبي الأيمن - الإحصائيات */}
      <div className="w-1/5 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">الإحصائيات</h2>

        {agentStats ? (
          <div className="space-y-4">
            {/* إجمالي المحادثات */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي المحادثات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {agentStats.totalConversations}
                </div>
              </CardContent>
            </Card>

            {/* المحادثات النشطة */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  المحادثات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {agentStats.activeConversations}
                </div>
              </CardContent>
            </Card>

            {/* المحادثات المغلقة */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  المحادثات المغلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {agentStats.closedConversations}
                </div>
              </CardContent>
            </Card>

            {/* متوسط وقت الاستجابة */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  متوسط وقت الاستجابة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {agentStats.averageResponseTime}
                  <span className="text-sm text-gray-500"> ثانية</span>
                </div>
              </CardContent>
            </Card>

            {/* رضا العملاء */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  رضا العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {agentStats.customerSatisfaction}
                  <span className="text-sm text-gray-500">/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-500">جاري التحميل...</div>
        )}
      </div>
    </div>
  );
}
