/**
 * Customization Service
 * 
 * خدمة التخصيص والتحكم بالواجهة
 * Service for UI customization and personalization
 * 
 * @module ./client/src/services/customizationService
 */

export interface UICustomization {
  id: string;
  userId: number;
  visibleSections: string[];
  sectionOrder: string[];
  sectionSizes: Record<string, number>;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'ui-customization';
const DEFAULT_CUSTOMIZATION: Partial<UICustomization> = {
  visibleSections: [
    'declaration-info',
    'items-table',
    'summary',
    'actions'
  ],
  sectionOrder: [
    'declaration-info',
    'items-table',
    'summary',
    'actions'
  ],
  sectionSizes: {
    'declaration-info': 100,
    'items-table': 100,
    'summary': 100,
    'actions': 100
  },
  theme: 'dark',
  fontSize: 'medium',
  compactMode: false
};

/**
 * Get customization from local storage
 * الحصول على التخصيصات من التخزين المحلي
 */
export function getCustomization(): Partial<UICustomization> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading customization:', error);
  }
  return DEFAULT_CUSTOMIZATION;
}

/**
 * Save customization to local storage
 * حفظ التخصيصات في التخزين المحلي
 */
export function saveCustomization(customization: Partial<UICustomization>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
  } catch (error) {
    console.error('Error saving customization:', error);
  }
}

/**
 * Toggle section visibility
 * تبديل رؤية القسم
 */
export function toggleSectionVisibility(sectionId: string): void {
  const customization = getCustomization();
  const visibleSections = customization.visibleSections || [];
  
  if (visibleSections.includes(sectionId)) {
    customization.visibleSections = visibleSections.filter(s => s !== sectionId);
  } else {
    customization.visibleSections = [...visibleSections, sectionId];
  }
  
  saveCustomization(customization);
}

/**
 * Reorder sections
 * إعادة ترتيب الأقسام
 */
export function reorderSections(newOrder: string[]): void {
  const customization = getCustomization();
  customization.sectionOrder = newOrder;
  saveCustomization(customization);
}

/**
 * Update section size
 * تحديث حجم القسم
 */
export function updateSectionSize(sectionId: string, size: number): void {
  const customization = getCustomization();
  if (!customization.sectionSizes) {
    customization.sectionSizes = {};
  }
  customization.sectionSizes[sectionId] = Math.max(50, Math.min(200, size));
  saveCustomization(customization);
}

/**
 * Set theme
 * تعيين المظهر
 */
export function setTheme(theme: 'light' | 'dark'): void {
  const customization = getCustomization();
  customization.theme = theme;
  saveCustomization(customization);
  
  // Apply theme to document
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Set font size
 * تعيين حجم الخط
 */
export function setFontSize(size: 'small' | 'medium' | 'large'): void {
  const customization = getCustomization();
  customization.fontSize = size;
  saveCustomization(customization);
  
  // Apply font size to document
  const root = document.documentElement;
  root.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
}

/**
 * Toggle compact mode
 * تبديل الوضع المضغوط
 */
export function toggleCompactMode(): void {
  const customization = getCustomization();
  customization.compactMode = !customization.compactMode;
  saveCustomization(customization);
}

/**
 * Reset to default customization
 * إعادة تعيين إلى التخصيصات الافتراضية
 */
export function resetToDefault(): void {
  localStorage.removeItem(STORAGE_KEY);
  applyCustomization(DEFAULT_CUSTOMIZATION);
}

/**
 * Apply customization to UI
 * تطبيق التخصيصات على الواجهة
 */
export function applyCustomization(customization: Partial<UICustomization>): void {
  // Apply theme
  if (customization.theme) {
    setTheme(customization.theme);
  }
  
  // Apply font size
  if (customization.fontSize) {
    setFontSize(customization.fontSize);
  }
  
  // Apply compact mode
  if (customization.compactMode) {
    document.documentElement.classList.add('compact-mode');
  } else {
    document.documentElement.classList.remove('compact-mode');
  }
}

/**
 * Check if section is visible
 * التحقق من رؤية القسم
 */
export function isSectionVisible(sectionId: string): boolean {
  const customization = getCustomization();
  const visibleSections = customization.visibleSections || DEFAULT_CUSTOMIZATION.visibleSections || [];
  return visibleSections.includes(sectionId);
}

/**
 * Get section size percentage
 * الحصول على نسبة حجم القسم
 */
export function getSectionSize(sectionId: string): number {
  const customization = getCustomization();
  const sizes = customization.sectionSizes || DEFAULT_CUSTOMIZATION.sectionSizes || {};
  return (sizes[sectionId] || 100) / 100;
}

/**
 * Get section order
 * الحصول على ترتيب الأقسام
 */
export function getSectionOrder(): string[] {
  const customization = getCustomization();
  return customization.sectionOrder || DEFAULT_CUSTOMIZATION.sectionOrder || [];
}

/**
 * Export customization as JSON
 * تصدير التخصيصات كـ JSON
 */
export function exportCustomization(): string {
  const customization = getCustomization();
  return JSON.stringify(customization, null, 2);
}

/**
 * Import customization from JSON
 * استيراد التخصيصات من JSON
 */
export function importCustomization(jsonString: string): boolean {
  try {
    const customization = JSON.parse(jsonString);
    saveCustomization(customization);
    applyCustomization(customization);
    return true;
  } catch (error) {
    console.error('Error importing customization:', error);
    return false;
  }
}

export default {
  getCustomization,
  saveCustomization,
  toggleSectionVisibility,
  reorderSections,
  updateSectionSize,
  setTheme,
  setFontSize,
  toggleCompactMode,
  resetToDefault,
  applyCustomization,
  isSectionVisible,
  getSectionSize,
  getSectionOrder,
  exportCustomization,
  importCustomization
};
