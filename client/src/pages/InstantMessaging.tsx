import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Settings,
  Archive,
  Trash2,
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  type: 'direct' | 'group';
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'file' | 'image';
  file?: { name: string; size: string };
}

export default function InstantMessaging() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      avatar: '👨‍💼',
      status: 'online',
      lastMessage: 'تم استقبال الطلب بنجاح',
      lastMessageTime: '2 دقيقة',
      unread: 3,
      type: 'direct',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      avatar: '👩‍💼',
      status: 'online',
      lastMessage: 'ما هو موعد التسليم؟',
      lastMessageTime: '5 دقائق',
      unread: 1,
      type: 'direct',
    },
    {
      id: '3',
      name: 'فريق الجمارك',
      avatar: '👥',
      status: 'online',
      lastMessage: 'تم تحديث الوثائق',
      lastMessageTime: '10 دقائق',
      unread: 0,
      type: 'group',
    },
    {
      id: '4',
      name: 'محمود حسن',
      avatar: '👨‍💻',
      status: 'away',
      lastMessage: 'سأتواصل معك لاحقاً',
      lastMessageTime: '1 ساعة',
      unread: 0,
      type: 'direct',
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'أحمد محمد',
      content: 'مرحباً، كيف حالك؟',
      timestamp: '08:15 صباحاً',
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      sender: 'أنت',
      content: 'مرحباً، بخير الحمد لله',
      timestamp: '08:16 صباحاً',
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      sender: 'أحمد محمد',
      content: 'هل يمكنك مراجعة الفاتورة المرفقة؟',
      timestamp: '08:17 صباحاً',
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      sender: 'أحمد محمد',
      content: 'الفاتورة.pdf',
      timestamp: '08:17 صباحاً',
      status: 'delivered',
      type: 'file',
      file: { name: 'الفاتورة.pdf', size: '2.5 MB' },
    },
    {
      id: '5',
      sender: 'أنت',
      content: 'تم استقبال الطلب بنجاح',
      timestamp: '08:18 صباحاً',
      status: 'sent',
      type: 'text',
    },
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'متصل';
      case 'away':
        return 'بعيد';
      case 'offline':
        return 'غير متصل';
      default:
        return '';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'read':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        sender: 'أنت',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString('ar-JO'),
        status: 'sent',
        type: 'text',
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };

  const totalUnread = contacts.reduce((sum, c) => sum + c.unread, 0);
  const onlineCount = contacts.filter(c => c.status === 'online').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* قائمة المحادثات */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  المحادثات
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
                {/* البحث */}
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="ابحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* قائمة المحادثات */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <span className="text-2xl">{contact.avatar}</span>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(contact.status)} rounded-full border-2 border-white dark:border-gray-900`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {contact.name}
                            </h3>
                            {contact.unread > 0 && (
                              <Badge className="bg-red-500">{contact.unread}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {contact.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {contact.lastMessageTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* زر إنشاء محادثة جديدة */}
                <Button className="w-full gap-2 mt-auto">
                  <Plus className="w-4 h-4" />
                  محادثة جديدة
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* نافذة المحادثة */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <Card className="h-full flex flex-col">
                {/* رأس المحادثة */}
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedContact.avatar}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedContact.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor(selectedContact.status)}`}></span>
                          {getStatusLabel(selectedContact.status)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* الرسائل */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'أنت' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'أنت'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {msg.type === 'text' ? (
                          <p className="text-sm">{msg.content}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-semibold">{msg.file?.name}</p>
                              <p className="text-xs opacity-75">{msg.file?.size}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-xs opacity-75">{msg.timestamp}</p>
                          {msg.sender === 'أنت' && getMessageStatusIcon(msg.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* حقل الإدخال */}
                <CardContent className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="اكتب رسالة..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="sm" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">اختر محادثة لبدء التواصل</p>
              </Card>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="mt-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم نظام الرسائل الفورية للتواصل السريع مع فريقك والعملاء. يمكنك مشاركة الملفات والصور والفيديو مباشرة في المحادثة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
