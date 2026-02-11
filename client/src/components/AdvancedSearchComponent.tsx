import React, { useState, useEffect } from 'react';
import { Search, Filter, Save, Trash2, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { advancedSearchService, SearchFilter, SavedSearch, SearchResult } from '@/services/advancedSearchService';

interface AdvancedSearchComponentProps {
  data?: any[];
  onSearch?: (results: SearchResult[]) => void;
  placeholder?: string;
}

export default function AdvancedSearchComponent({
  data = [],
  onSearch,
  placeholder = 'ابحث عن البيانات...'
}: AdvancedSearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterValue, setNewFilterValue] = useState('');

  // تحميل البحوث المحفوظة والسجل عند التحميل
  useEffect(() => {
    loadSavedSearches();
    loadSearchHistory();
  }, []);

  // تحديث الاقتراحات عند تغيير البحث
  useEffect(() => {
    if (searchQuery.length >= 2) {
      updateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const loadSavedSearches = async () => {
    try {
      const searches = await advancedSearchService.getSavedSearches();
      setSavedSearches(searches);
    } catch (error) {
      console.error('فشل تحميل البحوث المحفوظة:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await advancedSearchService.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('فشل تحميل السجل:', error);
    }
  };

  const updateSuggestions = async () => {
    try {
      const sugg = await advancedSearchService.getAutoSuggestions(searchQuery, data);
      setSuggestions(sugg);
    } catch (error) {
      console.error('فشل تحديث الاقتراحات:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && filters.length === 0) {
      alert('أدخل نص بحث أو أضف فلتر');
      return;
    }

    try {
      setIsLoading(true);
      const searchResults = await advancedSearchService.executeSearch(
        searchQuery,
        filters,
        data
      );
      setResults(searchResults);
      onSearch?.(searchResults);
    } catch (error) {
      alert('فشل البحث: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFilter = () => {
    if (!newFilterName.trim() || !newFilterValue.trim()) {
      alert('أدخل اسم الفلتر والقيمة');
      return;
    }

    const newFilter: SearchFilter = {
      id: newFilterName,
      name: newFilterName,
      value: newFilterValue,
      operator: 'contains'
    };

    setFilters([...filters, newFilter]);
    setNewFilterName('');
    setNewFilterValue('');
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSaveSearch = async () => {
    const searchName = prompt('أدخل اسم البحث:');
    if (!searchName) return;

    try {
      await advancedSearchService.saveSearch(searchName, filters);
      await loadSavedSearches();
      alert('تم حفظ البحث بنجاح');
    } catch (error) {
      alert('فشل حفظ البحث');
    }
  };

  const handleLoadSearch = async (search: SavedSearch) => {
    setFilters(search.filters);
    setSearchQuery('');
    await handleSearch();
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('هل تريد حذف هذا البحث؟')) return;

    try {
      await advancedSearchService.deleteSearch(searchId);
      await loadSavedSearches();
      alert('تم حذف البحث بنجاح');
    } catch (error) {
      alert('فشل حذف البحث');
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('هل تريد مسح سجل البحث؟')) return;

    try {
      await advancedSearchService.clearSearchHistory();
      setSearchHistory([]);
      alert('تم مسح السجل بنجاح');
    } catch (error) {
      alert('فشل مسح السجل');
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  const handleSelectHistory = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">البحث المتقدم</CardTitle>
          <CardDescription className="text-right">ابحث عن البيانات باستخدام الفلاتر والكلمات المفتاحية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="w-4 h-4 ml-2" />
                {isLoading ? 'جاري البحث...' : 'بحث'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 ml-2" />
                فلاتر
              </Button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <h4 className="font-semibold text-right">إضافة فلتر جديد</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="اسم الفلتر"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                  />
                  <Input
                    placeholder="قيمة الفلتر"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                  />
                  <Button onClick={handleAddFilter} variant="outline">
                    إضافة
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {filters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-right">الفلاتر النشطة</h4>
                  <div className="space-y-2">
                    {filters.map((filter, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                        <button
                          onClick={() => handleRemoveFilter(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                        <span className="text-right">
                          {filter.name}: {filter.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Search Button */}
              {filters.length > 0 && (
                <Button onClick={handleSaveSearch} className="w-full">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ هذا البحث
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-red-500"
              >
                مسح السجل
              </Button>
              <CardTitle className="text-right">سجل البحث</CardTitle>
              <Clock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-end">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectHistory(query)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm"
                >
                  {query}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">البحوث المحفوظة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedSearches.map(search => (
                <div key={search.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLoadSearch(search)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      تحميل
                    </button>
                  </div>
                  <div className="text-right">
                    <h4 className="font-semibold">{search.name}</h4>
                    {search.description && (
                      <p className="text-sm text-gray-600">{search.description}</p>
                    )}
                  </div>
                  {search.isDefault && <Star className="w-4 h-4 text-yellow-500" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">نتائج البحث ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map(result => (
                <div key={result.id} className="p-3 bg-gray-50 rounded hover:bg-gray-100">
                  <h4 className="font-semibold text-right">{result.title}</h4>
                  {result.description && (
                    <p className="text-sm text-gray-600 text-right">{result.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    درجة الصلة: {result.relevance}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {results.length === 0 && searchQuery && !isLoading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center text-right">
            <p className="text-blue-900">لم يتم العثور على نتائج. حاول تغيير معايير البحث.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
