import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye,
  Edit2,
  Share2,
  Users,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

/**
 * صفحة القوالب المتقدمة
 * Advanced Templates Page
 */

export default function AdvancedTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [previewFormat, setPreviewFormat] = useState<'table' | 'json' | 'csv'>('table');
  const [teamComment, setTeamComment] = useState('');

  // Queries
  const recommendationsQuery = trpc.smartTemplate.getRecommendations.useQuery();
  const previewQuery = trpc.preview.previewData.useQuery(
    selectedTemplate ? { templateId: selectedTemplate, format: previewFormat } : null,
    { enabled: !!selectedTemplate }
  );

  // Mutations
  const addCommentMutation = trpc.teamCollaboration.addComment.useMutation();

  const handleAddComment = async () => {
    if (!selectedTemplate || !teamComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        templateId: selectedTemplate,
        comment: teamComment,
      });
      toast({
        title: 'تم الإضافة',
        description: 'تم إضافة التعليق بنجاح',
      });
      setTeamComment('');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة التعليق',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold">القوالب المتقدمة</h1>
        <p className="text-muted-foreground">معاينة مباشرة وقوالب ذكية وتعاون فريقي</p>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">معاينة</span>
          </TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">ذكية</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">فريق</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">إحصائيات</span>
          </TabsTrigger>
        </TabsList>

        {/* تبويب المعاينة */}
        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* قائمة القوالب */}
            <div className="space-y-2">
              <h3 className="font-semibold">اختر قالب</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recommendationsQuery.data?.map((rec) => (
                  <Card
                    key={rec.templateId}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === rec.templateId ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTemplate(rec.templateId)}
                  >
                    <CardContent className="pt-4">
                      <p className="font-medium text-sm">{rec.name}</p>
                      <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.usageFrequency}x
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {rec.score}pts
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* معاينة البيانات */}
            <div className="lg:col-span-2 space-y-4">
              {selectedTemplate ? (
                <>
                  {/* خيارات الصيغة */}
                  <div className="flex gap-2">
                    {(['table', 'json', 'csv'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={previewFormat === format ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewFormat(format)}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>

                  {/* عرض البيانات */}
                  {previewQuery.isLoading ? (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">جاري التحميل...</p>
                      </CardContent>
                    </Card>
                  ) : previewQuery.data ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">معاينة البيانات</CardTitle>
                        <CardDescription>
                          {previewQuery.data.recordCount} سجل | {previewQuery.data.pagination.total} إجمالي
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {previewFormat === 'table' && previewQuery.data.data.headers ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  {previewQuery.data.data.headers.map((header: string) => (
                                    <th key={header} className="text-right p-2 font-semibold">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {previewQuery.data.data.rows.map((row: any[], idx: number) => (
                                  <tr key={idx} className="border-b hover:bg-muted/50">
                                    {row.map((cell, cellIdx) => (
                                      <td key={cellIdx} className="p-2">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                            {JSON.stringify(previewQuery.data.data, null, 2)}
                          </pre>
                        )}
                      </CardContent>
                    </Card>
                  ) : null}
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">اختر قالب لعرض المعاينة</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* تبويب القوالب الذكية */}
        <TabsContent value="smart" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* التوصيات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  التوصيات الذكية
                </CardTitle>
                <CardDescription>قوالب موصى بها بناءً على استخدامك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendationsQuery.data?.slice(0, 5).map((rec) => (
                  <div key={rec.templateId} className="p-3 border rounded-lg">
                    <p className="font-medium">{rec.name}</p>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{rec.usageFrequency} استخدام</Badge>
                      <Badge className="bg-blue-100 text-blue-900">{rec.score} نقاط</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* الإحصائيات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  أنماط الاستخدام
                </CardTitle>
                <CardDescription>تحليل سلوك الاستخدام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">معدل النجاح</p>
                  <p className="text-2xl font-bold">95%</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">متوسط الوقت</p>
                  <p className="text-2xl font-bold">2.3 ثانية</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">الاستخدامات الكلية</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب التعاون الفريقي */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* أعضاء الفريق */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  أعضاء الفريق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'أحمد محمد', role: 'مالك', status: 'نشط' },
                  { name: 'فاطمة علي', role: 'محرر', status: 'نشط' },
                  { name: 'محمد سالم', role: 'عارض', status: 'غير نشط' },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge variant={member.status === 'نشط' ? 'default' : 'outline'}>
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* التعليقات والتعاون */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    التعليقات والملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* التعليقات السابقة */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {[
                      { user: 'أحمد محمد', text: 'هذا القالب يعمل بشكل ممتاز', time: '2 ساعة' },
                      { user: 'فاطمة علي', text: 'هل يمكن إضافة حقل التاريخ؟', time: '1 ساعة' },
                    ].map((comment, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">{comment.user}</p>
                          <span className="text-xs text-muted-foreground">{comment.time}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* إضافة تعليق جديد */}
                  <div className="space-y-2 border-t pt-4">
                    <Label>إضافة تعليق</Label>
                    <Textarea
                      placeholder="أضف تعليقك هنا..."
                      value={teamComment}
                      onChange={(e) => setTeamComment(e.target.value)}
                      className="min-h-20"
                    />
                    <Button onClick={handleAddComment} className="w-full">
                      إضافة التعليق
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* تبويب الإحصائيات */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'إجمالي القوالب', value: '24', icon: '📋' },
              { label: 'القوالب المستخدمة', value: '18', icon: '✅' },
              { label: 'القوالب المشتركة', value: '7', icon: '👥' },
              { label: 'معدل الاستخدام', value: '87%', icon: '📈' },
            ].map((stat, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl mb-2">{stat.icon}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* الرسم البياني */}
          <Card>
            <CardHeader>
              <CardTitle>نشاط الاستخدام</CardTitle>
              <CardDescription>آخر 7 أيام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-around gap-2">
                {[12, 19, 3, 5, 2, 3, 8].map((value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${(value / 20) * 100}%` }}
                    title={`يوم ${idx + 1}: ${value} استخدام`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
