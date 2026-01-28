import { describe, it, expect, beforeEach } from 'vitest';
import UserGuideService from './user-guide-service';

/**
 * اختبارات شاملة لنظام التدريب والمساعدة
 */

describe('نظام التدريب والمساعدة', () => {
  beforeEach(() => {
    // تنظيف البيانات قبل كل اختبار
  });

  describe('خدمة دليل المستخدم', () => {
    it('يجب الحصول على جميع الأدلة', () => {
      const guides = UserGuideService.getAllGuides();
      expect(guides).toBeDefined();
      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0]).toHaveProperty('id');
      expect(guides[0]).toHaveProperty('title');
      expect(guides[0]).toHaveProperty('description');
    });

    it('يجب الحصول على دليل محدد', () => {
      const guide = UserGuideService.getGuide('getting-started');
      expect(guide).toBeDefined();
      expect(guide?.id).toBe('getting-started');
      expect(guide?.title).toBe('البدء السريع');
    });

    it('يجب البحث عن الأدلة', () => {
      const results = UserGuideService.searchGuides('بدء');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(g => g.title.includes('البدء'))).toBe(true);
    });

    it('يجب الحصول على أدلة حسب المستوى', () => {
      const beginnerGuides = UserGuideService.getGuidesByDifficulty('beginner');
      expect(beginnerGuides.length).toBeGreaterThan(0);
      expect(beginnerGuides.every(g => g.difficulty === 'beginner')).toBe(true);
    });

    it('يجب الحصول على الأدلة ذات الصلة', () => {
      const relatedGuides = UserGuideService.getRelatedGuides('getting-started');
      expect(Array.isArray(relatedGuides)).toBe(true);
    });

    it('يجب تحديث تقدم المستخدم', () => {
      const progress = UserGuideService.updateUserProgress(
        'user123',
        'getting-started',
        true
      );
      expect(progress.userId).toBe('user123');
      expect(progress.completedGuides).toContain('getting-started');
      expect(progress.progress).toBeGreaterThan(0);
    });

    it('يجب الحصول على تقدم المستخدم', () => {
      UserGuideService.updateUserProgress('user123', 'getting-started', true);
      const progress = UserGuideService.getUserProgress('user123');
      expect(progress).toBeDefined();
      expect(progress?.userId).toBe('user123');
      expect(progress?.completedGuides).toContain('getting-started');
    });

    it('يجب الحصول على الأدلة المقترحة للمستخدم الجديد', () => {
      const suggested = UserGuideService.getSuggestedGuides('newUser');
      expect(suggested.length).toBeGreaterThan(0);
      expect(suggested.every(g => g.difficulty === 'beginner')).toBe(true);
    });

    it('يجب حساب الوقت المتبقي', () => {
      const remainingTime = UserGuideService.getRemainingTime('user123');
      expect(typeof remainingTime).toBe('number');
      expect(remainingTime).toBeGreaterThanOrEqual(0);
    });

    it('يجب الحصول على إحصائيات التعلم', () => {
      UserGuideService.updateUserProgress('user456', 'getting-started', true);
      UserGuideService.updateUserProgress('user456', 'customs-declaration', true);
      
      const stats = UserGuideService.getLearningStats('user456');
      expect(stats).toHaveProperty('totalGuides');
      expect(stats).toHaveProperty('completedGuides');
      expect(stats).toHaveProperty('progressPercentage');
      expect(stats).toHaveProperty('totalTime');
      expect(stats).toHaveProperty('level');
      expect(stats.completedGuides).toBe(2);
    });

    it('يجب تحديد مستوى المستخدم بناءً على التقدم', () => {
      const newUserStats = UserGuideService.getLearningStats('newUser123');
      expect(newUserStats.level).toBe('novice');

      // محاكاة إكمال عدة أدلة
      for (let i = 0; i < 3; i++) {
        UserGuideService.updateUserProgress(`user${i}`, `guide${i}`, true);
      }
    });

    it('يجب إضافة دليل جديد', () => {
      const newGuide = {
        id: 'test-guide',
        title: 'دليل الاختبار',
        description: 'دليل للاختبار',
        icon: '🧪',
        content: 'محتوى الاختبار',
        difficulty: 'beginner' as const,
        estimatedTime: 5,
      };

      UserGuideService.addGuide(newGuide);
      const guide = UserGuideService.getGuide('test-guide');
      expect(guide).toBeDefined();
      expect(guide?.title).toBe('دليل الاختبار');
    });

    it('يجب تحديث دليل موجود', () => {
      UserGuideService.updateGuide('getting-started', {
        title: 'البدء السريع المحدّث',
      });
      const guide = UserGuideService.getGuide('getting-started');
      expect(guide?.title).toBe('البدء السريع المحدّث');
    });

    it('يجب حذف دليل', () => {
      UserGuideService.addGuide({
        id: 'delete-test',
        title: 'دليل للحذف',
        description: 'اختبار الحذف',
        icon: '🗑️',
        content: 'محتوى',
        difficulty: 'beginner',
        estimatedTime: 5,
      });

      UserGuideService.deleteGuide('delete-test');
      const guide = UserGuideService.getGuide('delete-test');
      expect(guide).toBeUndefined();
    });
  });

  describe('الأدلة والخطوات', () => {
    it('يجب أن تحتوي الأدلة على خطوات', () => {
      const guide = UserGuideService.getGuide('getting-started');
      expect(guide?.steps).toBeDefined();
      expect(Array.isArray(guide?.steps)).toBe(true);
      if (guide?.steps) {
        expect(guide.steps[0]).toHaveProperty('number');
        expect(guide.steps[0]).toHaveProperty('title');
        expect(guide.steps[0]).toHaveProperty('description');
      }
    });

    it('يجب أن تحتوي الخطوات على نصائح وتحذيرات', () => {
      const guide = UserGuideService.getGuide('getting-started');
      if (guide?.steps && guide.steps.length > 0) {
        const step = guide.steps[0];
        expect(step).toHaveProperty('tips');
        expect(Array.isArray(step.tips)).toBe(true);
      }
    });

    it('يجب أن تحتوي الأدلة على وقت مقدّر', () => {
      const guide = UserGuideService.getGuide('getting-started');
      expect(guide?.estimatedTime).toBeDefined();
      expect(typeof guide?.estimatedTime).toBe('number');
      expect(guide?.estimatedTime).toBeGreaterThan(0);
    });
  });

  describe('البحث والتصفية', () => {
    it('يجب البحث عن الأدلة بكلمات مختلفة', () => {
      const results1 = UserGuideService.searchGuides('بيان');
      const results2 = UserGuideService.searchGuides('جمركي');
      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
    });

    it('يجب أن يعيد البحث نتائج فارغة للكلمات غير الموجودة', () => {
      const results = UserGuideService.searchGuides('كلمة غير موجودة');
      expect(results.length).toBe(0);
    });

    it('يجب تصفية الأدلة حسب مستويات مختلفة', () => {
      const intermediate = UserGuideService.getGuidesByDifficulty('intermediate');
      const advanced = UserGuideService.getGuidesByDifficulty('advanced');
      
      expect(intermediate.every(g => g.difficulty === 'intermediate')).toBe(true);
      expect(advanced.every(g => g.difficulty === 'advanced')).toBe(true);
    });
  });

  describe('تتبع التقدم', () => {
    it('يجب تتبع الأدلة المكتملة', () => {
      const userId = 'user-progress-test';
      UserGuideService.updateUserProgress(userId, 'getting-started', true);
      UserGuideService.updateUserProgress(userId, 'customs-declaration', true);
      
      const progress = UserGuideService.getUserProgress(userId);
      expect(progress?.completedGuides.length).toBe(2);
    });

    it('يجب حساب نسبة التقدم بشكل صحيح', () => {
      const userId = 'progress-percentage-test';
      const allGuides = UserGuideService.getAllGuides();
      
      // إكمال نصف الأدلة
      for (let i = 0; i < Math.floor(allGuides.length / 2); i++) {
        UserGuideService.updateUserProgress(userId, allGuides[i].id, true);
      }
      
      const progress = UserGuideService.getUserProgress(userId);
      expect(progress?.progress).toBeGreaterThan(0);
      expect(progress?.progress).toBeLessThanOrEqual(100);
    });

    it('يجب عدم إضافة نفس الدليل مرتين', () => {
      const userId = 'duplicate-test';
      UserGuideService.updateUserProgress(userId, 'getting-started', true);
      UserGuideService.updateUserProgress(userId, 'getting-started', true);
      
      const progress = UserGuideService.getUserProgress(userId);
      const count = progress?.completedGuides.filter(
        id => id === 'getting-started'
      ).length;
      expect(count).toBe(1);
    });
  });

  describe('الإحصائيات والتقارير', () => {
    it('يجب حساب الوقت الإجمالي للأدلة', () => {
      const allGuides = UserGuideService.getAllGuides();
      const totalTime = allGuides.reduce((sum, g) => sum + g.estimatedTime, 0);
      expect(totalTime).toBeGreaterThan(0);
    });

    it('يجب حساب الوقت المتبقي بشكل صحيح', () => {
      const userId = 'remaining-time-test';
      const allGuides = UserGuideService.getAllGuides();
      
      // إكمال دليل واحد
      UserGuideService.updateUserProgress(userId, allGuides[0].id, true);
      
      const remainingTime = UserGuideService.getRemainingTime(userId);
      const totalTime = allGuides.reduce((sum, g) => sum + g.estimatedTime, 0);
      const completedTime = allGuides[0].estimatedTime;
      
      expect(remainingTime).toBe(totalTime - completedTime);
    });

    it('يجب توفير إحصائيات شاملة', () => {
      const userId = 'stats-test';
      UserGuideService.updateUserProgress(userId, 'getting-started', true);
      
      const stats = UserGuideService.getLearningStats(userId);
      expect(stats.totalGuides).toBeGreaterThan(0);
      expect(stats.completedGuides).toBe(1);
      expect(stats.progressPercentage).toBeGreaterThan(0);
      expect(stats.totalTime).toBeGreaterThan(0);
      expect(stats.completedTime).toBeGreaterThan(0);
      expect(stats.remainingTime).toBeGreaterThan(0);
    });
  });

  describe('الموضوعات ذات الصلة', () => {
    it('يجب أن تحتوي الأدلة على موضوعات ذات صلة', () => {
      const guide = UserGuideService.getGuide('getting-started');
      expect(guide?.relatedTopics).toBeDefined();
      expect(Array.isArray(guide?.relatedTopics)).toBe(true);
    });

    it('يجب الحصول على الأدلة ذات الصلة', () => {
      const relatedGuides = UserGuideService.getRelatedGuides('getting-started');
      const guide = UserGuideService.getGuide('getting-started');
      
      if (guide?.relatedTopics && guide.relatedTopics.length > 0) {
        expect(relatedGuides.length).toBeGreaterThan(0);
        expect(relatedGuides.every(g => 
          guide.relatedTopics?.includes(g.id)
        )).toBe(true);
      }
    });
  });

  describe('الأدلة المقترحة', () => {
    it('يجب اقتراح أدلة للمستخدمين الجدد', () => {
      const suggested = UserGuideService.getSuggestedGuides('brand-new-user');
      expect(suggested.length).toBeGreaterThan(0);
      expect(suggested.every(g => g.difficulty === 'beginner')).toBe(true);
    });

    it('يجب اقتراح أدلة لم يكملها المستخدم', () => {
      const userId = 'partial-user';
      UserGuideService.updateUserProgress(userId, 'getting-started', true);
      
      const suggested = UserGuideService.getSuggestedGuides(userId);
      expect(suggested.every(g => g.id !== 'getting-started')).toBe(true);
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع الأدلة غير الموجودة', () => {
      const guide = UserGuideService.getGuide('non-existent-guide');
      expect(guide).toBeUndefined();
    });

    it('يجب التعامل مع المستخدمين بدون تقدم', () => {
      const progress = UserGuideService.getUserProgress('non-existent-user');
      expect(progress).toBeUndefined();
    });

    it('يجب التعامل مع البحث الفارغ', () => {
      const results = UserGuideService.searchGuides('');
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
