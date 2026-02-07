/**
 * Coupon Service
 * 
 * خدمة إدارة الكوبونات والخصومات
 * تدعم خصومات نسبية وثابتة
 * 
 * @module server/services/coupon-service
 */

/**
 * نوع الخصم
 */
export type DiscountType = 'percentage' | 'fixed';

/**
 * حالة الكوبون
 */
export type CouponStatus = 'active' | 'expired' | 'disabled';

/**
 * معلومات الكوبون
 */
export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // نسبة مئوية أو مبلغ ثابت
  minPurchaseAmount?: number; // الحد الأدنى للشراء
  maxUsageCount?: number; // عدد الاستخدامات المسموح بها
  currentUsageCount: number; // عدد الاستخدامات الحالي
  expiryDate?: Date; // تاريخ انتهاء الصلاحية
  applicablePlans?: string[]; // الخطط المطبقة عليها (فارغ = جميع الخطط)
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * نتيجة تطبيق الكوبون
 */
export interface CouponApplicationResult {
  success: boolean;
  message: string;
  discountAmount?: number;
  finalPrice?: number;
  coupon?: Coupon;
}

/**
 * خدمة الكوبونات
 */
export class CouponService {
  private coupons: Map<string, Coupon> = new Map();

  constructor() {
    // إضافة كوبونات تجريبية
    this.initializeSampleCoupons();
  }

  /**
   * تهيئة كوبونات تجريبية
   */
  private initializeSampleCoupons(): void {
    const sampleCoupons: Coupon[] = [
      {
        id: 'coupon_1',
        code: 'WELCOME20',
        discountType: 'percentage',
        discountValue: 20,
        minPurchaseAmount: 0,
        maxUsageCount: 100,
        currentUsageCount: 45,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        applicablePlans: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'coupon_2',
        code: 'SUMMER50',
        discountType: 'fixed',
        discountValue: 50,
        minPurchaseAmount: 200,
        maxUsageCount: 50,
        currentUsageCount: 30,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        applicablePlans: ['professional', 'enterprise'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'coupon_3',
        code: 'NEWUSER15',
        discountType: 'percentage',
        discountValue: 15,
        minPurchaseAmount: 0,
        maxUsageCount: 200,
        currentUsageCount: 120,
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        applicablePlans: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleCoupons.forEach((coupon) => {
      this.coupons.set(coupon.code, coupon);
    });

    console.log('✅ تم تهيئة الكوبونات التجريبية');
  }

  /**
   * إنشاء كوبون جديد
   */
  createCoupon(
    code: string,
    discountType: DiscountType,
    discountValue: number,
    options?: {
      minPurchaseAmount?: number;
      maxUsageCount?: number;
      expiryDate?: Date;
      applicablePlans?: string[];
    }
  ): Coupon {
    console.log(`🎟️ جاري إنشاء كوبون جديد: ${code}`);

    const coupon: Coupon = {
      id: `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchaseAmount: options?.minPurchaseAmount,
      maxUsageCount: options?.maxUsageCount,
      currentUsageCount: 0,
      expiryDate: options?.expiryDate,
      applicablePlans: options?.applicablePlans || [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.coupons.set(coupon.code, coupon);
    console.log(`✅ تم إنشاء الكوبون: ${code}`);
    return coupon;
  }

  /**
   * تطبيق الكوبون على المشتريات
   */
  applyCoupon(
    couponCode: string,
    purchaseAmount: number,
    planName?: string
  ): CouponApplicationResult {
    console.log(`🎟️ جاري تطبيق الكوبون: ${couponCode}`);

    const coupon = this.coupons.get(couponCode.toUpperCase());

    if (!coupon) {
      return {
        success: false,
        message: 'الكوبون غير موجود',
      };
    }

    // التحقق من حالة الكوبون
    if (coupon.status === 'disabled') {
      return {
        success: false,
        message: 'الكوبون معطل',
      };
    }

    // التحقق من تاريخ الانتهاء
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      coupon.status = 'expired';
      return {
        success: false,
        message: 'انتهت صلاحية الكوبون',
      };
    }

    // التحقق من الحد الأدنى للشراء
    if (coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      return {
        success: false,
        message: `الحد الأدنى للشراء هو ${coupon.minPurchaseAmount} دينار`,
      };
    }

    // التحقق من عدد الاستخدامات
    if (coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount) {
      return {
        success: false,
        message: 'انتهت الاستخدامات المسموح بها للكوبون',
      };
    }

    // التحقق من الخطط المطبقة
    if (coupon.applicablePlans && coupon.applicablePlans.length > 0 && planName) {
      if (!coupon.applicablePlans.includes(planName)) {
        return {
          success: false,
          message: 'هذا الكوبون لا ينطبق على هذه الخطة',
        };
      }
    }

    // حساب الخصم
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (purchaseAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // التأكد من أن الخصم لا يتجاوز المبلغ الأصلي
    discountAmount = Math.min(discountAmount, purchaseAmount);

    const finalPrice = purchaseAmount - discountAmount;

    // زيادة عدد الاستخدامات
    coupon.currentUsageCount++;
    coupon.updatedAt = new Date();

    console.log(`✅ تم تطبيق الكوبون بنجاح: خصم ${discountAmount} دينار`);

    return {
      success: true,
      message: 'تم تطبيق الكوبون بنجاح',
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      coupon,
    };
  }

  /**
   * الحصول على الكوبون
   */
  getCoupon(code: string): Coupon | null {
    return this.coupons.get(code.toUpperCase()) || null;
  }

  /**
   * الحصول على جميع الكوبونات
   */
  getAllCoupons(): Coupon[] {
    return Array.from(this.coupons.values());
  }

  /**
   * الحصول على الكوبونات النشطة فقط
   */
  getActiveCoupons(): Coupon[] {
    return Array.from(this.coupons.values()).filter((coupon) => {
      if (coupon.status !== 'active') return false;
      if (coupon.expiryDate && new Date() > coupon.expiryDate) return false;
      return true;
    });
  }

  /**
   * تحديث الكوبون
   */
  updateCoupon(code: string, updates: Partial<Coupon>): Coupon | null {
    const coupon = this.coupons.get(code.toUpperCase());
    if (!coupon) return null;

    Object.assign(coupon, updates, { updatedAt: new Date() });
    console.log(`✅ تم تحديث الكوبون: ${code}`);
    return coupon;
  }

  /**
   * حذف الكوبون
   */
  deleteCoupon(code: string): boolean {
    const deleted = this.coupons.delete(code.toUpperCase());
    if (deleted) {
      console.log(`✅ تم حذف الكوبون: ${code}`);
    }
    return deleted;
  }

  /**
   * تعطيل الكوبون
   */
  disableCoupon(code: string): Coupon | null {
    return this.updateCoupon(code, { status: 'disabled' });
  }

  /**
   * الحصول على إحصائيات الكوبون
   */
  getCouponStats(code: string): {
    code: string;
    totalUsages: number;
    remainingUsages: number;
    discountAmount: number;
    status: CouponStatus;
  } | null {
    const coupon = this.coupons.get(code.toUpperCase());
    if (!coupon) return null;

    const remainingUsages = coupon.maxUsageCount
      ? coupon.maxUsageCount - coupon.currentUsageCount
      : -1; // -1 يعني غير محدود

    return {
      code: coupon.code,
      totalUsages: coupon.currentUsageCount,
      remainingUsages,
      discountAmount: coupon.discountValue,
      status: coupon.status,
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const couponService = new CouponService();
