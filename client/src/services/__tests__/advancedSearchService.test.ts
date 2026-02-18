import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import advancedSearchService, { SearchFilter } from '../advancedSearchService';

describe('AdvancedSearchService', () => {
  const mockData = [
    {
      id: '1',
      title: 'شحنة أولى',
      description: 'وصف الشحنة الأولى',
      price: 1000,
      status: 'pending'
    },
    {
      id: '2',
      title: 'شحنة ثانية',
      description: 'وصف الشحنة الثانية',
      price: 2000,
      status: 'completed'
    },
    {
      id: '3',
      title: 'شحنة ثالثة',
      description: 'وصف الشحنة الثالثة',
      price: 1500,
      status: 'pending'
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('executeSearch', () => {
    it('يجب أن يبحث عن النص بشكل صحيح', async () => {
      const results = await advancedSearchService.executeSearch('شحنة', [], mockData);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('شحنة');
    });

    it('يجب أن يطبق الفلاتر بشكل صحيح', async () => {
      const filters: SearchFilter[] = [
        {
          id: 'status',
          name: 'الحالة',
          value: 'pending',
          operator: 'equals'
        }
      ];
      const results = await advancedSearchService.executeSearch('', filters, mockData);
      expect(results.length).toBe(2);
    });

    it('يجب أن يرتب النتائج حسب الصلة', async () => {
      const results = await advancedSearchService.executeSearch('شحنة أولى', [], mockData);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].relevance).toBeGreaterThanOrEqual(results[1]?.relevance || 0);
    });

    it('يجب أن يرجع مصفوفة فارغة عند عدم وجود نتائج', async () => {
      const results = await advancedSearchService.executeSearch('غير موجود', [], mockData);
      expect(results.length).toBe(0);
    });
  });

  describe('saveSearch', () => {
    it('يجب أن يحفظ البحث بنجاح', async () => {
      const filters: SearchFilter[] = [
        {
          id: 'status',
          name: 'الحالة',
          value: 'completed'
        }
      ];
      const saved = await advancedSearchService.saveSearch('بحثي المفضل', filters);
      expect(saved.id).toBeDefined();
      expect(saved.name).toBe('بحثي المفضل');
    });

    it('يجب أن يحفظ البحث في التخزين المحلي', async () => {
      const filters: SearchFilter[] = [];
      await advancedSearchService.saveSearch('اختبار', filters);
      const saved = await advancedSearchService.getSavedSearches();
      expect(saved.length).toBeGreaterThan(0);
    });
  });

  describe('getSavedSearches', () => {
    it('يجب أن يرجع البحوث المحفوظة', async () => {
      const filters: SearchFilter[] = [];
      await advancedSearchService.saveSearch('بحث 1', filters);
      await advancedSearchService.saveSearch('بحث 2', filters);
      const searches = await advancedSearchService.getSavedSearches();
      expect(searches.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('deleteSearch', () => {
    it('يجب أن يحذف البحث بنجاح', async () => {
      const filters: SearchFilter[] = [];
      const saved = await advancedSearchService.saveSearch('حذف اختبار', filters);
      await advancedSearchService.deleteSearch(saved.id);
      const searches = await advancedSearchService.getSavedSearches();
      expect(searches.find(s => s.id === saved.id)).toBeUndefined();
    });
  });

  describe('getAutoSuggestions', () => {
    it('يجب أن يرجع اقتراحات ذات صلة', async () => {
      const suggestions = await advancedSearchService.getAutoSuggestions('شح', mockData);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('يجب أن يرجع مصفوفة فارغة للاستعلام القصير', async () => {
      const suggestions = await advancedSearchService.getAutoSuggestions('ش', mockData);
      expect(suggestions.length).toBe(0);
    });
  });

  describe('getSearchHistory', () => {
    it('يجب أن يحفظ سجل البحث', async () => {
      await advancedSearchService.executeSearch('بحث 1', [], mockData);
      await advancedSearchService.executeSearch('بحث 2', [], mockData);
      const history = await advancedSearchService.getSearchHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('clearSearchHistory', () => {
    it('يجب أن يمسح سجل البحث', async () => {
      await advancedSearchService.executeSearch('بحث اختبار', [], mockData);
      await advancedSearchService.clearSearchHistory();
      const history = await advancedSearchService.getSearchHistory();
      expect(history.length).toBe(0);
    });
  });
});
