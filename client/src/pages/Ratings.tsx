import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, ThumbsUp, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

/**
 * صفحة التقييمات
 * Ratings Page
 */

export function RatingsPage() {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('aramex');
  const [ratingData, setRatingData] = useState({
    trackingNumber: '',
    overallRating: 5,
    deliverySpeedRating: 5,
    packageConditionRating: 5,
    customerServiceRating: 5,
    priceValueRating: 5,
    comment: '',
    wouldRecommend: true,
  });

  // جلب التقييمات
  const ratingsQuery = trpc.ratings.list.useQuery({
    companyCode: selectedCompany,
    limit: 10,
  });

  // جلب الإحصائيات
  const statsQuery = trpc.ratings.getStatistics.useQuery({
    companyCode: selectedCompany,
  });

  // إنشاء تقييم جديد
  const createRatingMutation = trpc.ratings.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'نجح',
        description: 'تم إنشاء التقييم بنجاح',
      });
      setRatingData({
        trackingNumber: '',
        overallRating: 5,
        deliverySpeedRating: 5,
        packageConditionRating: 5,
        customerServiceRating: 5,
        priceValueRating: 5,
        comment: '',
        wouldRecommend: true,
      });
      ratingsQuery.refetch();
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء التقييم',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitRating = () => {
    if (!ratingData.trackingNumber) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال رقم التتبع',
        variant: 'destructive',
      });
      return;
    }

    createRatingMutation.mutate({
      shipmentId: 1, // سيتم استخراجه من رقم التتبع
      trackingNumber: ratingData.trackingNumber,
      companyCode: selectedCompany,
      overallRating: ratingData.overallRating,
      deliverySpeedRating: ratingData.deliverySpeedRating,
      packageConditionRating: ratingData.packageConditionRating,
      customerServiceRating: ratingData.customerServiceRating,
      priceValueRating: ratingData.priceValueRating,
      comment: ratingData.comment,
      wouldRecommend: ratingData.wouldRecommend,
    });
  };

  const renderStars = (rating: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange?.(star)}
            className={`transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold">التقييمات والآراء</h1>
        <p className="text-muted-foreground mt-2">قيّم جودة خدمة الشحن وشركات النقل</p>
      </div>

      {/* التبويبات */}
      <Tabs defaultValue="ratings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ratings">التقييمات</TabsTrigger>
          <TabsTrigger value="create">إنشاء تقييم</TabsTrigger>
          <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
        </TabsList>

        {/* تبويب التقييمات */}
        <TabsContent value="ratings" className="space-y-4">
          {/* اختيار الشركة */}
          <Card>
            <CardHeader>
              <CardTitle>اختر شركة الشحن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['aramex', 'dhl', 'fedex', 'ups', 'smsa', 'jordan-post'].map((company) => (
                  <Button
                    key={company}
                    variant={selectedCompany === company ? 'default' : 'outline'}
                    onClick={() => setSelectedCompany(company)}
                    className="capitalize"
                  >
                    {company}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* قائمة التقييمات */}
          <div className="space-y-4">
            {ratingsQuery.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : ratingsQuery.data && ratingsQuery.data.length > 0 ? (
              ratingsQuery.data.map((rating: any) => (
                <Card key={rating.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {renderStars(rating.overallRating)}
                          <Badge variant="outline">{rating.overallRating}/5</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(rating.createdAt).toLocaleDateString('ar-JO')}
                        </p>
                      </div>
                      {rating.wouldRecommend && (
                        <Badge className="bg-green-100 text-green-800">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          يوصي به
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rating.comment && <p className="text-sm">{rating.comment}</p>}

                    {/* تفاصيل التقييمات */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">سرعة التسليم</p>
                        <p className="font-semibold">{rating.deliverySpeedRating}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">حالة الطرد</p>
                        <p className="font-semibold">{rating.packageConditionRating}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">خدمة العملاء</p>
                        <p className="font-semibold">{rating.customerServiceRating}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">القيمة مقابل السعر</p>
                        <p className="font-semibold">{rating.priceValueRating}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">التقييم العام</p>
                        <p className="font-semibold">{rating.overallRating}/5</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">لا توجد تقييمات حتى الآن</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* تبويب إنشاء تقييم */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أضف تقييماً جديداً</CardTitle>
              <CardDescription>قيّم تجربتك مع خدمة الشحن</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* رقم التتبع */}
              <div>
                <Label>رقم التتبع</Label>
                <Input
                  placeholder="أدخل رقم التتبع"
                  value={ratingData.trackingNumber}
                  onChange={(e) =>
                    setRatingData({ ...ratingData, trackingNumber: e.target.value })
                  }
                />
              </div>

              {/* التقييمات */}
              <div className="space-y-4">
                <div>
                  <Label>التقييم العام</Label>
                  <div className="mt-2">
                    {renderStars(ratingData.overallRating, (value) =>
                      setRatingData({ ...ratingData, overallRating: value })
                    )}
                  </div>
                </div>

                <div>
                  <Label>سرعة التسليم</Label>
                  <div className="mt-2">
                    {renderStars(ratingData.deliverySpeedRating, (value) =>
                      setRatingData({ ...ratingData, deliverySpeedRating: value })
                    )}
                  </div>
                </div>

                <div>
                  <Label>حالة الطرد</Label>
                  <div className="mt-2">
                    {renderStars(ratingData.packageConditionRating, (value) =>
                      setRatingData({ ...ratingData, packageConditionRating: value })
                    )}
                  </div>
                </div>

                <div>
                  <Label>خدمة العملاء</Label>
                  <div className="mt-2">
                    {renderStars(ratingData.customerServiceRating, (value) =>
                      setRatingData({ ...ratingData, customerServiceRating: value })
                    )}
                  </div>
                </div>

                <div>
                  <Label>القيمة مقابل السعر</Label>
                  <div className="mt-2">
                    {renderStars(ratingData.priceValueRating, (value) =>
                      setRatingData({ ...ratingData, priceValueRating: value })
                    )}
                  </div>
                </div>
              </div>

              {/* التعليق */}
              <div>
                <Label>التعليق (اختياري)</Label>
                <Textarea
                  placeholder="شارك تجربتك مع الخدمة..."
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                  rows={4}
                />
              </div>

              {/* التوصية */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recommend"
                  checked={ratingData.wouldRecommend}
                  onChange={(e) =>
                    setRatingData({ ...ratingData, wouldRecommend: e.target.checked })
                  }
                />
                <Label htmlFor="recommend" className="cursor-pointer">
                  أوصي بهذه الخدمة للآخرين
                </Label>
              </div>

              {/* زر الإرسال */}
              <Button
                onClick={handleSubmitRating}
                disabled={createRatingMutation.isPending}
                className="w-full"
              >
                {createRatingMutation.isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الإحصائيات */}
        <TabsContent value="statistics" className="space-y-4">
          {statsQuery.isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">جاري التحميل...</p>
              </CardContent>
            </Card>
          ) : statsQuery.data ? (
            <>
              {/* بطاقات الإحصائيات */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">عدد التقييمات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsQuery.data.totalRatings}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Number(statsQuery.data.averageOverallRating).toFixed(1)}/5
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">نسبة التوصية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Number(statsQuery.data.recommendationPercentage).toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* توزيع التقييمات */}
              <Card>
                <CardHeader>
                  <CardTitle>توزيع التقييمات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-12 text-sm font-medium">{stars} نجوم</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-full rounded-full"
                          style={{
                            width: `${
                              statsQuery.data.totalRatings > 0
                                ? ((statsQuery.data[`${stars}StarCount`] || 0) /
                                    statsQuery.data.totalRatings) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12">
                        {statsQuery.data[`${stars}StarCount`] || 0}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RatingsPage;
