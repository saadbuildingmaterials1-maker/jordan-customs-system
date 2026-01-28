import { z } from 'zod';

/**
 * خدمة دليل المستخدم التفاعلي
 * توفر محتوى تعليمي شامل ومنظم
 */

export interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: string;
  steps?: GuideStep[];
  relatedTopics?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // بالدقائق
}

export interface GuideStep {
  number: number;
  title: string;
  description: string;
  image?: string;
  tips?: string[];
  warnings?: string[];
}

export interface UserProgress {
  userId: string;
  completedGuides: string[];
  currentGuide?: string;
  progress: number; // 0-100
  lastUpdated: Date;
}

class UserGuideService {
  private static guides: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'البدء السريع',
      description: 'تعرف على أساسيات النظام في 5 دقائق',
      icon: '🚀',
      content: `
        مرحباً بك في نظام إدارة تكاليف الشحن والجمارك الأردنية!
        
        هذا الدليل سيساعدك على البدء بسرعة والتعرف على المميزات الأساسية.
        
        **ما الذي ستتعلمه:**
        - كيفية تسجيل الدخول والتنقل
        - إنشاء أول بيان جمركي
        - تتبع الحاويات
        - عرض التقارير
      `,
      steps: [
        {
          number: 1,
          title: 'تسجيل الدخول',
          description: 'استخدم بيانات اعتمادك للدخول إلى النظام',
          tips: ['تأكد من كتابة البريد الإلكتروني بشكل صحيح', 'استخدم كلمة مرور قوية'],
        },
        {
          number: 2,
          title: 'استكشاف لوحة التحكم',
          description: 'تعرف على واجهة النظام الرئيسية',
          tips: ['انقر على الأيقونات للتنقل بين الأقسام'],
        },
        {
          number: 3,
          title: 'إنشاء أول بيان',
          description: 'أنشئ بيان جمركي جديد',
          tips: ['اتبع الخطوات خطوة بخطوة', 'احفظ عملك بانتظام'],
        },
      ],
      difficulty: 'beginner',
      estimatedTime: 5,
      relatedTopics: ['customs-declaration', 'container-tracking'],
    },
    {
      id: 'customs-declaration',
      title: 'إدارة البيانات الجمركية',
      description: 'تعلم كيفية إنشاء وإدارة البيانات الجمركية',
      icon: '📋',
      content: `
        البيانات الجمركية هي أساس النظام. في هذا الدليل ستتعلم:
        
        **المحتويات:**
        - أنواع البيانات الجمركية
        - ملء النماذج بشكل صحيح
        - التحقق من البيانات
        - إرسال البيانات للجمارك
        - تتبع حالة البيان
      `,
      steps: [
        {
          number: 1,
          title: 'اختيار نوع البيان',
          description: 'حدد نوع البيان المناسب لشحنتك',
          tips: ['استشر الجمارك إذا لم تكن متأكداً'],
        },
        {
          number: 2,
          title: 'إدخال تفاصيل الشحنة',
          description: 'أدخل معلومات المنتجات والقيم',
          tips: ['تأكد من دقة الأسعار', 'استخدم الأوزان الفعلية'],
        },
        {
          number: 3,
          title: 'التحقق والإرسال',
          description: 'راجع البيانات وأرسلها',
          tips: ['تحقق من جميع الحقول قبل الإرسال'],
        },
      ],
      difficulty: 'intermediate',
      estimatedTime: 15,
      relatedTopics: ['getting-started', 'reports'],
    },
    {
      id: 'container-tracking',
      title: 'تتبع الحاويات',
      description: 'تعرف على نظام تتبع الحاويات الحي',
      icon: '🚢',
      content: `
        نظام التتبع يسمح لك برؤية موقع حاويتك في الوقت الفعلي.
        
        **الميزات:**
        - خريطة تفاعلية للمواقع
        - تنبيهات فورية عند تغيير الحالة
        - سجل كامل للحركات
        - معلومات التسليم المتوقعة
      `,
      steps: [
        {
          number: 1,
          title: 'البحث عن الحاوية',
          description: 'ابحث عن حاويتك برقمها',
          tips: ['استخدم رقم الحاوية الكامل'],
        },
        {
          number: 2,
          title: 'عرض الموقع على الخريطة',
          description: 'شاهد موقع الحاوية على الخريطة التفاعلية',
          tips: ['يمكنك التكبير والتصغير على الخريطة'],
        },
        {
          number: 3,
          title: 'تفعيل التنبيهات',
          description: 'فعّل التنبيهات لتلقي تحديثات فورية',
          tips: ['ستتلقى إشعارات عند كل تحديث'],
        },
      ],
      difficulty: 'beginner',
      estimatedTime: 5,
      relatedTopics: ['getting-started', 'notifications'],
    },
    {
      id: 'reports',
      title: 'إنشاء التقارير',
      description: 'تعلم كيفية إنشاء وتصدير التقارير',
      icon: '📊',
      content: `
        التقارير تساعدك في تحليل أداء عملك.
        
        **أنواع التقارير:**
        - تقارير الإيرادات
        - تقارير الشحنات
        - تقارير التكاليف
        - تقارير الأداء
      `,
      steps: [
        {
          number: 1,
          title: 'اختيار نوع التقرير',
          description: 'حدد نوع التقرير الذي تريده',
          tips: ['اختر الفترة الزمنية المناسبة'],
        },
        {
          number: 2,
          title: 'تطبيق الفلاتر',
          description: 'طبق فلاتر لتحسين النتائج',
          tips: ['استخدم الفلاتر لتضييق النتائج'],
        },
        {
          number: 3,
          title: 'تصدير التقرير',
          description: 'صدّر التقرير بصيغة PDF أو Excel',
          tips: ['اختر الصيغة المناسبة لاحتياجاتك'],
        },
      ],
      difficulty: 'intermediate',
      estimatedTime: 10,
      relatedTopics: ['customs-declaration', 'container-tracking'],
    },
    {
      id: 'payments',
      title: 'إدارة الدفعات',
      description: 'تعلم كيفية إجراء الدفعات والفواتير',
      icon: '💳',
      content: `
        نظام الدفع يدعم طرق دفع متعددة وآمنة.
        
        **طرق الدفع المدعومة:**
        - بطاقات الائتمان
        - التحويلات البنكية
        - المحافظ الرقمية
        - الدفع عند الاستلام
      `,
      steps: [
        {
          number: 1,
          title: 'اختيار طريقة الدفع',
          description: 'اختر طريقة الدفع المناسبة',
          tips: ['تأكد من توفر الطريقة في منطقتك'],
        },
        {
          number: 2,
          title: 'إدخال البيانات',
          description: 'أدخل بيانات الدفع بشكل آمن',
          tips: ['لا تشارك بيانات دفعك مع أحد'],
        },
        {
          number: 3,
          title: 'تأكيد الدفع',
          description: 'أكمل عملية الدفع',
          tips: ['احفظ إيصال الدفع للمراجعة'],
        },
      ],
      difficulty: 'beginner',
      estimatedTime: 5,
      relatedTopics: ['getting-started'],
    },
    {
      id: 'advanced-features',
      title: 'الميزات المتقدمة',
      description: 'استكشف الميزات المتقدمة للمستخدمين المتقدمين',
      icon: '⚙️',
      content: `
        هذا الدليل موجه للمستخدمين المتقدمين الذين يريدون الاستفادة القصوى من النظام.
        
        **الموضوعات:**
        - البحث المتقدم والفلاتر
        - الإشعارات المخصصة
        - تصدير البيانات
        - التكامل مع الأنظمة الخارجية
      `,
      steps: [
        {
          number: 1,
          title: 'استخدام البحث المتقدم',
          description: 'استخدم فلاتر متعددة للبحث الدقيق',
          tips: ['اجمع بين عدة فلاتر للحصول على نتائج أفضل'],
        },
        {
          number: 2,
          title: 'تخصيص الإشعارات',
          description: 'اضبط الإشعارات حسب احتياجاتك',
          tips: ['اختر الأولويات التي تهمك'],
        },
        {
          number: 3,
          title: 'التكامل مع الأنظمة الخارجية',
          description: 'ربط النظام مع أنظمتك الأخرى',
          tips: ['استخدم API للتكامل الآلي'],
        },
      ],
      difficulty: 'advanced',
      estimatedTime: 30,
      relatedTopics: ['customs-declaration', 'reports', 'payments'],
    },
  ];

  private static userProgress: Map<string, UserProgress> = new Map();

  /**
   * الحصول على جميع الأدلة
   */
  static getAllGuides(): GuideSection[] {
    return this.guides;
  }

  /**
   * الحصول على دليل معين
   */
  static getGuide(guideId: string): GuideSection | undefined {
    return this.guides.find(g => g.id === guideId);
  }

  /**
   * البحث عن أدلة
   */
  static searchGuides(query: string): GuideSection[] {
    const lowerQuery = query.toLowerCase();
    return this.guides.filter(
      guide =>
        guide.title.toLowerCase().includes(lowerQuery) ||
        guide.description.toLowerCase().includes(lowerQuery) ||
        guide.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * الحصول على أدلة حسب المستوى
   */
  static getGuidesByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): GuideSection[] {
    return this.guides.filter(g => g.difficulty === difficulty);
  }

  /**
   * الحصول على الأدلة ذات الصلة
   */
  static getRelatedGuides(guideId: string): GuideSection[] {
    const guide = this.getGuide(guideId);
    if (!guide || !guide.relatedTopics) return [];

    return this.guides.filter(g =>
      guide.relatedTopics?.includes(g.id)
    );
  }

  /**
   * تحديث تقدم المستخدم
   */
  static updateUserProgress(
    userId: string,
    guideId: string,
    completed: boolean
  ): UserProgress {
    let progress = this.userProgress.get(userId);

    if (!progress) {
      progress = {
        userId,
        completedGuides: [],
        progress: 0,
        lastUpdated: new Date(),
      };
    }

    if (completed && !progress.completedGuides.includes(guideId)) {
      progress.completedGuides.push(guideId);
    }

    progress.progress = Math.round(
      (progress.completedGuides.length / this.guides.length) * 100
    );
    progress.lastUpdated = new Date();

    this.userProgress.set(userId, progress);
    return progress;
  }

  /**
   * الحصول على تقدم المستخدم
   */
  static getUserProgress(userId: string): UserProgress | undefined {
    return this.userProgress.get(userId);
  }

  /**
   * الحصول على الأدلة المقترحة
   */
  static getSuggestedGuides(userId: string): GuideSection[] {
    const progress = this.userProgress.get(userId);

    if (!progress) {
      // للمستخدمين الجدد، اقترح أدلة المبتدئين
      return this.getGuidesByDifficulty('beginner');
    }

    // اقترح الأدلة التي لم يكملها المستخدم
    return this.guides.filter(
      g => !progress.completedGuides.includes(g.id)
    );
  }

  /**
   * حساب الوقت الإجمالي المتبقي
   */
  static getRemainingTime(userId: string): number {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      return this.guides.reduce((sum, g) => sum + g.estimatedTime, 0);
    }

    const remainingGuides = this.guides.filter(
      g => !progress.completedGuides.includes(g.id)
    );

    return remainingGuides.reduce((sum, g) => sum + g.estimatedTime, 0);
  }

  /**
   * الحصول على إحصائيات التعلم
   */
  static getLearningStats(userId: string) {
    const progress = this.userProgress.get(userId);
    const totalGuides = this.guides.length;
    const completedGuides = progress?.completedGuides.length || 0;
    const totalTime = this.guides.reduce((sum, g) => sum + g.estimatedTime, 0);
    const completedTime = this.guides
      .filter(g => progress?.completedGuides.includes(g.id))
      .reduce((sum, g) => sum + g.estimatedTime, 0);

    return {
      totalGuides,
      completedGuides,
      progressPercentage: Math.round((completedGuides / totalGuides) * 100),
      totalTime,
      completedTime,
      remainingTime: totalTime - completedTime,
      level: this.getUserLevel(completedGuides, totalGuides),
    };
  }

  /**
   * تحديد مستوى المستخدم
   */
  private static getUserLevel(
    completed: number,
    total: number
  ): 'novice' | 'intermediate' | 'expert' {
    const percentage = (completed / total) * 100;
    if (percentage < 33) return 'novice';
    if (percentage < 66) return 'intermediate';
    return 'expert';
  }

  /**
   * إضافة دليل جديد
   */
  static addGuide(guide: GuideSection): void {
    if (!this.guides.find(g => g.id === guide.id)) {
      this.guides.push(guide);
    }
  }

  /**
   * تحديث دليل
   */
  static updateGuide(guideId: string, updates: Partial<GuideSection>): void {
    const index = this.guides.findIndex(g => g.id === guideId);
    if (index !== -1) {
      this.guides[index] = { ...this.guides[index], ...updates };
    }
  }

  /**
   * حذف دليل
   */
  static deleteGuide(guideId: string): void {
    this.guides = this.guides.filter(g => g.id !== guideId);
  }
}

export default UserGuideService;
