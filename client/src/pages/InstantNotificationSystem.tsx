/**
 * Instant Notification System
 * 
 * نظام الإشعارات الفوري (SMS, WhatsApp, Email)
 * 
 * @module ./client/src/pages/InstantNotificationSystem
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageCircle, Phone, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface Notification {
  id: string;
  type: "email" | "sms" | "whatsapp";
  recipient: string;
  subject: string;
  message: string;
  status: "sent" | "pending" | "failed";
  timestamp: string;
}

export default function InstantNotificationSystem() {
  const [activeTab, setActiveTab] = useState("email");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "email",
      recipient: "customer@example.com",
      subject: "تأكيد الشحنة",
      message: "تم تأكيد شحنتك بنجاح",
      status: "sent",
      timestamp: "2026-02-18 10:30",
    },
    {
      id: "2",
      type: "sms",
      recipient: "+962791234567",
      subject: "تنبيه جمركي",
      message: "تم استلام الشحنة من الجمارك",
      status: "sent",
      timestamp: "2026-02-18 09:15",
    },
    {
      id: "3",
      type: "whatsapp",
      recipient: "+962791234567",
      subject: "تحديث الشحنة",
      message: "الشحنة في الطريق إليك",
      status: "pending",
      timestamp: "2026-02-18 08:00",
    },
  ]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!recipient || !subject || !message) {
        alert("يرجى ملء جميع الحقول");
        setLoading(false);
        return;
      }

      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newNotification: Notification = {
        id: Date.now().toString(),
        type: activeTab as "email" | "sms" | "whatsapp",
        recipient,
        subject,
        message,
        status: "sent",
        timestamp: new Date().toLocaleString("ar-JO"),
      };

      setNotifications([newNotification, ...notifications]);
      setRecipient("");
      setSubject("");
      setMessage("");
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("حدث خطأ في إرسال الإشعار");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">نظام الإشعارات الفوري</h1>
          <p className="text-slate-300">إرسال إشعارات فورية عبر البريد الإلكتروني و SMS و WhatsApp</p>
        </div>

        {/* Notification Sender */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">إرسال إشعار جديد</CardTitle>
            <CardDescription className="text-slate-400">
              اختر قناة الإشعار وأرسل رسالتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-700/50 border-slate-600 mb-6">
                <TabsTrigger value="email" className="text-slate-200">
                  <Mail className="w-4 h-4 ml-2" />
                  البريد الإلكتروني
                </TabsTrigger>
                <TabsTrigger value="sms" className="text-slate-200">
                  <Phone className="w-4 h-4 ml-2" />
                  رسائل نصية
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="text-slate-200">
                  <MessageCircle className="w-4 h-4 ml-2" />
                  WhatsApp
                </TabsTrigger>
              </TabsList>

              {/* Email Tab */}
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">الموضوع</label>
                    <Input
                      type="text"
                      placeholder="موضوع الرسالة"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">محتوى الرسالة</label>
                    <textarea
                      placeholder="اكتب محتوى الرسالة هنا..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-md p-3"
                    />
                  </div>

                  {success && (
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        تم إرسال الإشعار بنجاح
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    {loading ? "جاري الإرسال..." : "إرسال البريد"}
                  </Button>
                </form>
              </TabsContent>

              {/* SMS Tab */}
              <TabsContent value="sms" className="space-y-4">
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">رقم الهاتف</label>
                    <Input
                      type="tel"
                      placeholder="+962791234567"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">محتوى الرسالة</label>
                    <textarea
                      placeholder="اكتب محتوى الرسالة النصية (160 حرف كحد أقصى)..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 160))}
                      rows={3}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-md p-3"
                    />
                    <p className="text-xs text-slate-400">{message.length}/160</p>
                  </div>

                  {success && (
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        تم إرسال الرسالة النصية بنجاح
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
                  </Button>
                </form>
              </TabsContent>

              {/* WhatsApp Tab */}
              <TabsContent value="whatsapp" className="space-y-4">
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">رقم WhatsApp</label>
                    <Input
                      type="tel"
                      placeholder="+962791234567"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">محتوى الرسالة</label>
                    <textarea
                      placeholder="اكتب محتوى الرسالة هنا..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-md p-3"
                    />
                  </div>

                  {success && (
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        تم إرسال الرسالة عبر WhatsApp بنجاح
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    {loading ? "جاري الإرسال..." : "إرسال عبر WhatsApp"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">سجل الإشعارات</CardTitle>
            <CardDescription className="text-slate-400">
              جميع الإشعارات المرسلة والمعلقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {notif.type === "email" && <Mail className="w-4 h-4 text-blue-400" />}
                      {notif.type === "sms" && <Phone className="w-4 h-4 text-purple-400" />}
                      {notif.type === "whatsapp" && <MessageCircle className="w-4 h-4 text-green-400" />}
                      <span className="text-sm font-medium text-slate-200">{notif.subject}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">{notif.message}</p>
                    <p className="text-xs text-slate-500">إلى: {notif.recipient}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1 ${getStatusColor(notif.status)}`}>
                      {getStatusIcon(notif.status)}
                      <span className="text-xs font-medium">
                        {notif.status === "sent" ? "مُرسل" : notif.status === "pending" ? "معلق" : "فشل"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{notif.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
