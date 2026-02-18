/**
 * Live Technical Support System
 * 
 * نظام الدعم الفني المباشر (Live Chat و AI)
 * 
 * @module ./client/src/pages/LiveTechnicalSupport
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Bot, Users, CheckCircle2, Clock, AlertCircle, Send } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent" | "ai";
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

interface Ticket {
  id: string;
  title: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBase {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
}

export default function LiveTechnicalSupport() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      content: "مرحباً، أحتاج إلى مساعدة في تتبع الشحنة",
      timestamp: "10:30",
      status: "read",
    },
    {
      id: "2",
      sender: "ai",
      content: "مرحباً! أنا مساعد ذكي. يمكنني مساعدتك في تتبع الشحنة. يرجى إدخال رقم الشحنة.",
      timestamp: "10:31",
      status: "read",
    },
    {
      id: "3",
      sender: "user",
      content: "رقم الشحنة: SHP-2026-001234",
      timestamp: "10:32",
      status: "read",
    },
    {
      id: "4",
      sender: "ai",
      content: "شكراً! وجدت شحنتك. الحالة الحالية: في الطريق إلى الجمارك. المتوقع الوصول في 2026-02-20.",
      timestamp: "10:33",
      status: "read",
    },
  ]);

  const [messageInput, setMessageInput] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TKT-001",
      title: "مشكلة في تتبع الشحنة",
      status: "resolved",
      priority: "high",
      createdAt: "2026-02-17",
      updatedAt: "2026-02-18",
    },
    {
      id: "TKT-002",
      title: "استفسار عن الرسوم الجمركية",
      status: "in-progress",
      priority: "medium",
      createdAt: "2026-02-18",
      updatedAt: "2026-02-18",
    },
    {
      id: "TKT-003",
      title: "طلب تغيير عنوان الشحنة",
      status: "open",
      priority: "high",
      createdAt: "2026-02-18",
      updatedAt: "2026-02-18",
    },
  ]);

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([
    {
      id: "KB-001",
      title: "كيفية تتبع الشحنة",
      category: "الشحن",
      views: 1250,
      helpful: 1180,
    },
    {
      id: "KB-002",
      title: "فهم الرسوم الجمركية",
      category: "الجمارك",
      views: 890,
      helpful: 820,
    },
    {
      id: "KB-003",
      title: "كيفية إنشاء إعلان جمركي",
      category: "الجمارك",
      views: 650,
      helpful: 600,
    },
    {
      id: "KB-004",
      title: "طرق الدفع المتاحة",
      category: "الدفع",
      views: 1100,
      helpful: 1050,
    },
  ]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: "شكراً على سؤالك. يمكنني مساعدتك بشأن هذا الموضوع. هل تريد معرفة المزيد؟",
        timestamp: new Date().toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit" }),
        status: "delivered",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return "text-green-500";
      case "in-progress":
        return "text-yellow-500";
      case "open":
        return "text-blue-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">نظام الدعم الفني المباشر</h1>
          <p className="text-slate-300">دردشة فورية مع الوكلاء والمساعد الذكي</p>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">الوكلاء النشطون</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">متوسط وقت الرد</p>
                  <p className="text-2xl font-bold text-white">2 دقيقة</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">معدل الرضا</p>
                  <p className="text-2xl font-bold text-white">98%</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">التذاكر المعلقة</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-700/50 border-slate-600 mb-6">
            <TabsTrigger value="chat" className="text-slate-200">
              <MessageCircle className="w-4 h-4 ml-2" />
              الدردشة الفورية
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-slate-200">
              <AlertCircle className="w-4 h-4 ml-2" />
              التذاكر
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-slate-200">
              <Bot className="w-4 h-4 ml-2" />
              قاعدة المعرفة
            </TabsTrigger>
          </TabsList>

          {/* Live Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 flex flex-col h-[600px]">
              <CardHeader>
                <CardTitle className="text-white">دردشة فورية</CardTitle>
                <CardDescription className="text-slate-400">
                  تحدث مع المساعد الذكي أو الوكلاء المتاحين
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 pr-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === "user"
                              ? "bg-blue-600 text-white"
                              : msg.sender === "ai"
                              ? "bg-slate-700 text-slate-100"
                              : "bg-green-600 text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="اكتب رسالتك..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">تذاكر الدعم</CardTitle>
                <CardDescription className="text-slate-400">
                  إدارة وتتبع تذاكر الدعم الفني
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-200">{ticket.title}</span>
                            <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority === "high" ? "عالية" : ticket.priority === "medium" ? "متوسطة" : "منخفضة"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{ticket.id}</p>
                        </div>
                        <div className={`flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="text-xs font-medium">
                            {ticket.status === "open" ? "مفتوح" : ticket.status === "in-progress" ? "قيد الإنجاز" : ticket.status === "resolved" ? "محل" : "مغلق"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>تم الإنشاء: {ticket.createdAt}</span>
                        <span>آخر تحديث: {ticket.updatedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">قاعدة المعرفة</CardTitle>
                <CardDescription className="text-slate-400">
                  مقالات وإجابات شاملة للأسئلة الشائعة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {knowledgeBase.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200 mb-1">{article.title}</p>
                          <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                            {article.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">{article.views} مشاهدة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{article.helpful} شخص وجد هذا مفيداً</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alert */}
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <AlertDescription className="text-green-400">
            نظام الدعم الفني متاح 24/7. متوسط وقت الرد أقل من دقيقتين.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
