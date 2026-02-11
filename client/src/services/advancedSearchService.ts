/**
 * خدمة البحث المتقدم مع الفلاتر وحفظ التفضيلات
 * Advanced Search Service with Filters and Saved Preferences
 */

export interface SearchFilter {
  id: string;
  name: string;
  value: string | number | boolean;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  relevance: number;
  data: any;
}

class AdvancedSearchService {
  private savedSearches: SavedSearch[] = [];
  private searchHistory: string[] = [];
  private maxHistorySize = 20;

  /**
   * تنفيذ بحث متقدم
   * Execute advanced search
   */
  async executeSearch(
    query: string,
    filters: SearchFilter[] = [],
    data: any[] = []
  ): Promise<SearchResult[]> {
    try {
      // تسجيل في السجل
      this.addToHistory(query);

      // تطبيق الفلاتر
      let results = this.applyFilters(data, filters);

      // البحث عن النص
      if (query.trim()) {
        results = this.searchByText(results, query);
      }

      // ترتيب حسب الصلة
      results = this.rankResults(results, query);

      return results;
    } catch (error) {
      console.error('خطأ في البحث:', error);
      throw new Error('فشل تنفيذ البحث');
    }
  }

  /**
   * تطبيق الفلاتر على البيانات
   * Apply filters to data
   */
  private applyFilters(data: any[], filters: SearchFilter[]): any[] {
    if (filters.length === 0) return data;

    return data.filter(item => {
      return filters.every(filter => this.matchesFilter(item, filter));
    });
  }

  /**
   * التحقق من توافق العنصر مع الفلتر
   * Check if item matches filter
   */
  private matchesFilter(item: any, filter: SearchFilter): boolean {
    const itemValue = this.getNestedValue(item, filter.id);
    const filterValue = filter.value;
    const operator = filter.operator || 'equals';

    switch (operator) {
      case 'equals':
        return itemValue === filterValue;
      case 'contains':
        return String(itemValue).includes(String(filterValue));
      case 'startsWith':
        return String(itemValue).startsWith(String(filterValue));
      case 'endsWith':
        return String(itemValue).endsWith(String(filterValue));
      case 'greaterThan':
        return Number(itemValue) > Number(filterValue);
      case 'lessThan':
        return Number(itemValue) < Number(filterValue);
      case 'between':
        // يتطلب معالجة خاصة للقيم بين
        return true;
      default:
        return true;
    }
  }

  /**
   * الحصول على قيمة متداخلة من الكائن
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * البحث عن النص في البيانات
   * Search by text in data
   */
  private searchByText(data: any[], query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();

    return data
      .filter(item => {
        const searchableText = JSON.stringify(item).toLowerCase();
        return searchableText.includes(lowerQuery);
      })
      .map(item => ({
        id: item.id || Math.random().toString(),
        title: item.title || item.name || 'نتيجة البحث',
        description: item.description || '',
        relevance: this.calculateRelevance(item, query),
        data: item
      }));
  }

  /**
   * حساب درجة الصلة
   * Calculate relevance score
   */
  private calculateRelevance(item: any, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // البحث في العنوان (أعلى أولوية)
    if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
      score += 100;
    }

    // البحث في الوصف
    if (item.description && item.description.toLowerCase().includes(lowerQuery)) {
      score += 50;
    }

    // البحث في البيانات الأخرى
    const dataText = JSON.stringify(item).toLowerCase();
    const matches = (dataText.match(new RegExp(lowerQuery, 'g')) || []).length;
    score += matches * 10;

    return score;
  }

  /**
   * ترتيب النتائج حسب الصلة
   * Rank results by relevance
   */
  private rankResults(results: SearchResult[], query: string): SearchResult[] {
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * حفظ بحث جديد
   * Save new search
   */
  async saveSearch(name: string, filters: SearchFilter[], description?: string): Promise<SavedSearch> {
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      description,
      filters,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.savedSearches.push(newSearch);
    this.persistSavedSearches();

    return newSearch;
  }

  /**
   * استرجاع البحوث المحفوظة
   * Get saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    return this.loadSavedSearches();
  }

  /**
   * حذف بحث محفوظ
   * Delete saved search
   */
  async deleteSearch(searchId: string): Promise<void> {
    this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
    this.persistSavedSearches();
  }

  /**
   * تحديث بحث محفوظ
   * Update saved search
   */
  async updateSearch(searchId: string, updates: Partial<SavedSearch>): Promise<SavedSearch> {
    const search = this.savedSearches.find(s => s.id === searchId);
    if (!search) throw new Error('البحث غير موجود');

    const updated = {
      ...search,
      ...updates,
      updatedAt: new Date()
    };

    const index = this.savedSearches.indexOf(search);
    this.savedSearches[index] = updated;
    this.persistSavedSearches();

    return updated;
  }

  /**
   * تعيين بحث كافتراضي
   * Set default search
   */
  async setDefaultSearch(searchId: string): Promise<void> {
    this.savedSearches.forEach(s => {
      s.isDefault = s.id === searchId;
    });
    this.persistSavedSearches();
  }

  /**
   * الحصول على البحث الافتراضي
   * Get default search
   */
  async getDefaultSearch(): Promise<SavedSearch | null> {
    return this.savedSearches.find(s => s.isDefault) || null;
  }

  /**
   * إضافة إلى سجل البحث
   * Add to search history
   */
  private addToHistory(query: string): void {
    // إزالة إذا كانت موجودة بالفعل
    this.searchHistory = this.searchHistory.filter(h => h !== query);

    // إضافة في البداية
    this.searchHistory.unshift(query);

    // الحفاظ على الحد الأقصى
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory.pop();
    }

    this.persistSearchHistory();
  }

  /**
   * الحصول على سجل البحث
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    return this.loadSearchHistory();
  }

  /**
   * مسح سجل البحث
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }

  /**
   * الاقتراحات التلقائية
   * Auto suggestions
   */
  async getAutoSuggestions(query: string, data: any[] = []): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions = new Set<string>();

    // من السجل
    this.searchHistory
      .filter(h => h.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
      .forEach(h => suggestions.add(h));

    // من البيانات
    data.forEach(item => {
      const text = JSON.stringify(item).toLowerCase();
      if (text.includes(lowerQuery)) {
        // استخراج كلمات ذات صلة
        const words = text.split(/\s+/);
        words
          .filter(w => w.includes(lowerQuery))
          .slice(0, 3)
          .forEach(w => suggestions.add(w));
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * حفظ البحوث المحفوظة في التخزين المحلي
   * Persist saved searches to local storage
   */
  private persistSavedSearches(): void {
    try {
      localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
    } catch (error) {
      console.error('فشل حفظ البحوث:', error);
    }
  }

  /**
   * تحميل البحوث المحفوظة من التخزين المحلي
   * Load saved searches from local storage
   */
  private loadSavedSearches(): SavedSearch[] {
    try {
      const stored = localStorage.getItem('savedSearches');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('فشل تحميل البحوث:', error);
      return [];
    }
  }

  /**
   * حفظ سجل البحث في التخزين المحلي
   * Persist search history to local storage
   */
  private persistSearchHistory(): void {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('فشل حفظ السجل:', error);
    }
  }

  /**
   * تحميل سجل البحث من التخزين المحلي
   * Load search history from local storage
   */
  private loadSearchHistory(): string[] {
    try {
      const stored = localStorage.getItem('searchHistory');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('فشل تحميل السجل:', error);
      return [];
    }
  }
}

// تصدير instance واحد
export const advancedSearchService = new AdvancedSearchService();

export default advancedSearchService;
