import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Plus, Edit2, Trash2, Star, Share2, Clock, MoreVertical } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

/**
 * صفحة إدارة قوالب التصدير
 * Export Templates Management Page
 */

export default function Templates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    templateType: 'invoices' as const,
    exportFormat: 'excel' as const,
    includeMetadata: true,
    compress: false,
  });

  const templatesQuery = trpc.template.getTemplates.useQuery();
  const favoritesQuery = trpc.template.getFavoriteTemplates.useQuery();
  const sharedQuery = trpc.template.getSharedTemplates.useQuery();
  const scheduledQuery = trpc.template.getScheduledExports.useQuery();

  const createMutation = trpc.template.createTemplate.useMutation();
  const deleteMutation = trpc.template.deleteTemplate.useMutation();
  const favoriteMutation = trpc.template.addToFavorites.useMutation();
  const unfavoriteMutation = trpc.template.removeFromFavorites.useMutation();

  const handleCreateTemplate = async () => {
    try {
      await createMutation.mutateAsync(newTemplate);
      toast({
        title: 'نجح الإنشاء',
        description: 'تم إنشاء القالب بنجاح',
      });
      setIsCreating(false);
      setNewTemplate({
        name: '',
        description: '',
        templateType: 'invoices',
        exportFormat: 'excel',
        includeMetadata: true,
        compress: false,
      });
      templatesQuery.refetch();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء القالب',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await deleteMutation.mutateAsync({ templateId });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف القالب بنجاح',
      });
      templatesQuery.refetch();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف القالب',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async (templateId: number, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await unfavoriteMutation.mutateAsync({ templateId });
      } else {
        await favoriteMutation.mutateAsync({ templateId });
      }
      favoritesQuery.refetch();
      templatesQuery.refetch();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث المفضلة',
        variant: 'destructive',
      });
    }
  };

  const renderTemplateCard = (template: any) => (
    <Card key={template.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* معلومات القالب */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">نوع البيانات</p>
            <p className="font-semibold capitalize">{template.templateType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">الصيغة</p>
            <p className="font-semibold uppercase">{template.exportFormat}</p>
          </div>
          <div>
            <p className="text-muted-foreground">الاستخدامات</p>
            <p className="font-semibold">{template.usageCount || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">آخر استخدام</p>
            <p className="font-semibold text-xs">
              {template.lastUsedAt ? new Date(template.lastUsedAt).toLocaleDateString('ar-JO') : 'لم يُستخدم'}
            </p>
          </div>
        </div>

        {/* الخيارات */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleFavorite(template.id, template.isFavorite)}
          >
            <Star className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-400' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteTemplate(template.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">قوالب التصدير</h1>
          <p className="text-muted-foreground">أنشئ وأدر قوالب التصدير المخصصة</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          قالب جديد
        </Button>
      </div>

      {/* نموذج إنشاء قالب جديد */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء قالب جديد</CardTitle>
            <CardDescription>أنشئ قالب تصدير مخصص للبيانات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اسم القالب */}
              <div className="space-y-2">
                <Label htmlFor="templateName">اسم القالب</Label>
                <Input
                  id="templateName"
                  placeholder="مثال: فواتير شهرية"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>

              {/* نوع البيانات */}
              <div className="space-y-2">
                <Label htmlFor="templateType">نوع البيانات</Label>
                <Select
                  value={newTemplate.templateType}
                  onValueChange={(value: any) => setNewTemplate({ ...newTemplate, templateType: value })}
                >
                  <SelectTrigger id="templateType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoices">الفواتير</SelectItem>
                    <SelectItem value="payments">المدفوعات</SelectItem>
                    <SelectItem value="shipments">الشحنات</SelectItem>
                    <SelectItem value="customs">التصريحات الجمركية</SelectItem>
                    <SelectItem value="all">جميع البيانات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* صيغة التصدير */}
              <div className="space-y-2">
                <Label htmlFor="exportFormat">صيغة التصدير</Label>
                <Select
                  value={newTemplate.exportFormat}
                  onValueChange={(value: any) => setNewTemplate({ ...newTemplate, exportFormat: value })}
                >
                  <SelectTrigger id="exportFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* الوصف */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="templateDescription">الوصف</Label>
                <Input
                  id="templateDescription"
                  placeholder="وصف اختياري للقالب"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>
            </div>

            {/* خيارات متقدمة */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold">الخيارات المتقدمة</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={newTemplate.includeMetadata}
                  onCheckedChange={(checked) =>
                    setNewTemplate({ ...newTemplate, includeMetadata: checked as boolean })
                  }
                />
                <Label htmlFor="metadata" className="font-normal cursor-pointer">
                  تضمين البيانات الوصفية
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compress"
                  checked={newTemplate.compress}
                  onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, compress: checked as boolean })}
                />
                <Label htmlFor="compress" className="font-normal cursor-pointer">
                  ضغط الملف (GZ)
                </Label>
              </div>
            </div>

            {/* أزرار الإجراء */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name}>
                إنشاء القالب
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* التبويبات */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">جميع القوالب</TabsTrigger>
          <TabsTrigger value="favorites">المفضلة</TabsTrigger>
          <TabsTrigger value="shared">المشتركة</TabsTrigger>
          <TabsTrigger value="scheduled">المجدولة</TabsTrigger>
        </TabsList>

        {/* جميع القوالب */}
        <TabsContent value="all" className="space-y-4">
          {templatesQuery.isLoading ? (
            <p className="text-center text-muted-foreground">جاري التحميل...</p>
          ) : templatesQuery.data && templatesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesQuery.data.map((template) => renderTemplateCard(template))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لا توجد قوالب حتى الآن</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* المفضلة */}
        <TabsContent value="favorites" className="space-y-4">
          {favoritesQuery.data && favoritesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoritesQuery.data.map((template) => renderTemplateCard(template))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لا توجد قوالب مفضلة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* المشتركة */}
        <TabsContent value="shared" className="space-y-4">
          {sharedQuery.data && sharedQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedQuery.data.map((template) => renderTemplateCard(template))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لم يتم مشاركة أي قوالب معك</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* المجدولة */}
        <TabsContent value="scheduled" className="space-y-4">
          {scheduledQuery.data && scheduledQuery.data.length > 0 ? (
            <div className="space-y-3">
              {scheduledQuery.data.map((scheduled) => (
                <Card key={scheduled.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-semibold">{scheduled.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {scheduled.frequency} - {scheduled.time}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        تعديل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لا توجد تصديرات مجدولة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
