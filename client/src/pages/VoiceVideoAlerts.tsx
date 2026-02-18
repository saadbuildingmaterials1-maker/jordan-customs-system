import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Settings,
  Volume2,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Plus,
  Download,
  Share2,
  Trash2,
  Play,
  Pause,
} from 'lucide-react';

interface Call {
  id: string;
  type: 'voice' | 'video';
  participant: string;
  duration: string;
  timestamp: string;
  status: 'completed' | 'missed' | 'declined';
  recording?: boolean;
}

interface Alert {
  id: string;
  type: 'voice' | 'video';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive';
  recipients: string[];
}

export default function VoiceVideoAlerts() {
  const [calls, setCalls] = useState<Call[]>([
    {
      id: '1',
      type: 'voice',
      participant: 'أحمد محمد',
      duration: '5:32',
      timestamp: '2026-02-18 08:30',
      status: 'completed',
      recording: true,
    },
    {
      id: '2',
      type: 'video',
      participant: 'فاطمة علي',
      duration: '12:15',
      timestamp: '2026-02-18 08:15',
      status: 'completed',
      recording: true,
    },
    {
      id: '3',
      type: 'voice',
      participant: 'محمود حسن',
      duration: '-',
      timestamp: '2026-02-18 07:45',
      status: 'missed',
      recording: false,
    },
    {
      id: '4',
      type: 'video',
      participant: 'سارة أحمد',
      duration: '3:20',
      timestamp: '2026-02-18 07:30',
      status: 'declined',
      recording: false,
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'voice',
      title: 'تنبيه مكالمة عاجلة',
      description: 'إخطار فوري بالمكالمات الهامة من العملاء VIP',
      priority: 'high',
      status: 'active',
      recipients: ['أحمد محمد', 'فاطمة علي'],
    },
    {
      id: '2',
      type: 'video',
      title: 'جلسة فيديو مجدولة',
      description: 'تنبيه بالاجتماعات والجلسات المرئية المهمة',
      priority: 'high',
      status: 'active',
      recipients: ['فريق الإدارة'],
    },
    {
      id: '3',
      type: 'voice',
      title: 'رسالة صوتية مهمة',
      description: 'إخطار بالرسائل الصوتية من الإدارة العليا',
      priority: 'medium',
      status: 'active',
      recipients: ['جميع الموظفين'],
    },
  ]);

  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const getCallTypeIcon = (type: string) => {
    return type === 'voice' ? <Phone className="w-5 h-5" /> : <Video className="w-5 h-5" />;
  };

  const getCallTypeLabel = (type: string) => {
    return type === 'voice' ? 'مكالمة صوتية' : 'مكالمة فيديو';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'missed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'declined':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'missed':
        return 'فائتة';
      case 'declined':
        return 'مرفوضة';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return '';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return '';
    }
  };

  const completedCalls = calls.filter(c => c.status === 'completed').length;
  const missedCalls = calls.filter(c => c.status === 'missed').length;
  const totalDuration = calls
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + parseInt(c.duration.split(':')[0]), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام التنبيهات الصوتية والفيديو
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة المكالمات والتنبيهات الصوتية والمرئية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            مكالمة جديدة
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">مكالمات مكتملة</p>
                <p className="text-3xl font-bold text-green-600">{completedCalls}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">مكالمات فائتة</p>
                <p className="text-3xl font-bold text-red-600">{missedCalls}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المدة</p>
                <p className="text-3xl font-bold text-blue-600">{totalDuration} دقيقة</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المكالمات</p>
                <p className="text-3xl font-bold text-purple-600">{calls.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* محاكاة المكالمة النشطة */}
        {isInCall && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">مكالمة جارية</h2>
                <p className="text-lg opacity-90">أحمد محمد</p>
                <p className="text-3xl font-mono">05:32</p>
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </Button>
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => setIsInCall(false)}
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* سجل المكالمات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                سجل المكالمات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {calls.map(call => (
                <div
                  key={call.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getCallTypeIcon(call.type)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {call.participant}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {call.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {call.duration}
                    </p>
                    <Badge className={getStatusColor(call.status)}>
                      {getStatusLabel(call.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* التنبيهات الصوتية والمرئية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                التنبيهات المنشطة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {alert.type === 'voice' ? (
                        <Mic className="w-5 h-5 text-blue-500 mt-1" />
                      ) : (
                        <Video className="w-5 h-5 text-purple-500 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {alert.description}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge className={getPriorityColor(alert.priority)}>
                            {getPriorityLabel(alert.priority)}
                          </Badge>
                          {alert.recipients.map((r, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* إعدادات الصوت والفيديو */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إعدادات الصوت والفيديو
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  مستوى الصوت
                </label>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-600" />
                  <input type="range" min="0" max="100" defaultValue="70" className="flex-1" />
                  <span className="text-sm text-gray-600">70%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  جودة الفيديو
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>HD (720p)</option>
                  <option>Full HD (1080p)</option>
                  <option>SD (480p)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  الميكروفون
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>الميكروفون الافتراضي</option>
                  <option>ميكروفون USB</option>
                  <option>ميكروفون السماعة</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  الكاميرا
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>الكاميرا الافتراضية</option>
                  <option>كاميرا USB</option>
                  <option>كاميرا الويب</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم التنبيهات الصوتية والفيديو للتواصل الفوري والاجتماعات المهمة. تأكد من اختبار الميكروفون والكاميرا قبل المكالمات الهامة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
