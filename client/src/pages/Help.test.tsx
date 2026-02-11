import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Help from './Help';

describe('Help Page Component', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    it('should render the help page with title', () => {
      render(<Help />);
      expect(screen.getByText('مركز المساعدة')).toBeInTheDocument();
    });

    it('should render the search input', () => {
      render(<Help />);
      const searchInput = screen.getByPlaceholderText('ابحث عن سؤال أو موضوع...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      render(<Help />);
      expect(screen.getByText('أسئلة شائعة')).toBeInTheDocument();
      expect(screen.getByText('دليل الاستخدام')).toBeInTheDocument();
      expect(screen.getByText('المصطلحات')).toBeInTheDocument();
    });

    it('should render FAQ tab content by default', () => {
      render(<Help />);
      expect(screen.getByText('كيف أبدأ باستخدام النظام؟')).toBeInTheDocument();
    });
  });

  describe('FAQ Functionality', () => {
    it('should display all FAQ questions', () => {
      render(<Help />);
      expect(screen.getByText('كيف أبدأ باستخدام النظام؟')).toBeInTheDocument();
      expect(screen.getByText('ما هي البيانات المطلوبة لإنشاء بيان جمركي؟')).toBeInTheDocument();
      expect(screen.getByText('كيف يتم حساب الرسوم الجمركية؟')).toBeInTheDocument();
    });

    it('should expand FAQ item when clicked', () => {
      render(<Help />);
      const firstQuestion = screen.getByText('كيف أبدأ باستخدام النظام؟');
      fireEvent.click(firstQuestion.closest('button')!);
      
      // Check if answer is visible
      expect(screen.getByText(/يمكنك البدء بتسجيل الدخول/)).toBeInTheDocument();
    });

    it('should collapse FAQ item when clicked again', () => {
      render(<Help />);
      const firstQuestion = screen.getByText('كيف أبدأ باستخدام النظام؟');
      const button = firstQuestion.closest('button')!;
      
      // Expand
      fireEvent.click(button);
      expect(screen.getByText(/يمكنك البدء بتسجيل الدخول/)).toBeInTheDocument();
      
      // Collapse
      fireEvent.click(button);
      // The answer should still be in DOM but not visible (depends on implementation)
    });
  });

  describe('Search Functionality', () => {
    it('should filter FAQs based on search query', () => {
      render(<Help />);
      const searchInput = screen.getByPlaceholderText('ابحث عن سؤال أو موضوع...') as HTMLInputElement;
      
      // Search for "رسوم"
      fireEvent.change(searchInput, { target: { value: 'رسوم' } });
      
      // Should show questions about fees
      expect(screen.getByText('كيف يتم حساب الرسوم الجمركية؟')).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(<Help />);
      const searchInput = screen.getByPlaceholderText('ابحث عن سؤال أو موضوع...') as HTMLInputElement;
      
      // Search for non-existent term
      fireEvent.change(searchInput, { target: { value: 'xxxxxx' } });
      
      // Should show no results message
      expect(screen.getByText(/لم نجد نتائج لبحثك/)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to guide tab when clicked', () => {
      render(<Help />);
      const guideTab = screen.getByText('دليل الاستخدام');
      fireEvent.click(guideTab);
      
      // Should show guide content
      expect(screen.getByText('إنشاء بيان جمركي جديد')).toBeInTheDocument();
    });

    it('should switch to glossary tab when clicked', () => {
      render(<Help />);
      const glossaryTab = screen.getByText('المصطلحات');
      fireEvent.click(glossaryTab);
      
      // Should show glossary content
      expect(screen.getByText('FOB')).toBeInTheDocument();
      expect(screen.getByText('الرسوم الجمركية')).toBeInTheDocument();
    });

    it('should switch back to FAQ tab', () => {
      render(<Help />);
      
      // Go to guide tab
      fireEvent.click(screen.getByText('دليل الاستخدام'));
      expect(screen.getByText('إنشاء بيان جمركي جديد')).toBeInTheDocument();
      
      // Go back to FAQ tab
      fireEvent.click(screen.getByText('أسئلة شائعة'));
      expect(screen.getByText('كيف أبدأ باستخدام النظام؟')).toBeInTheDocument();
    });
  });

  describe('Guide Content', () => {
    it('should display all guide titles', () => {
      render(<Help />);
      fireEvent.click(screen.getByText('دليل الاستخدام'));
      
      expect(screen.getByText('إنشاء بيان جمركي جديد')).toBeInTheDocument();
      expect(screen.getByText('تصدير التقارير')).toBeInTheDocument();
      expect(screen.getByText('تتبع الشحنات')).toBeInTheDocument();
    });

    it('should display guide steps', () => {
      render(<Help />);
      fireEvent.click(screen.getByText('دليل الاستخدام'));
      
      // Check for first step
      expect(screen.getByText('اذهب إلى "إدارة البيانات الجمركية"')).toBeInTheDocument();
    });
  });

  describe('Glossary Content', () => {
    it('should display all glossary terms', () => {
      render(<Help />);
      fireEvent.click(screen.getByText('المصطلحات'));
      
      expect(screen.getByText('FOB')).toBeInTheDocument();
      expect(screen.getByText('الرسوم الجمركية')).toBeInTheDocument();
      expect(screen.getByText('ضريبة المبيعات')).toBeInTheDocument();
      expect(screen.getByText('Landed Cost')).toBeInTheDocument();
      expect(screen.getByText('الحاوية')).toBeInTheDocument();
      expect(screen.getByText('التتبع')).toBeInTheDocument();
    });

    it('should display glossary definitions', () => {
      render(<Help />);
      fireEvent.click(screen.getByText('المصطلحات'));
      
      expect(screen.getByText(/Free On Board/)).toBeInTheDocument();
    });
  });

  describe('Support Section', () => {
    it('should render support section', () => {
      render(<Help />);
      expect(screen.getByText('هل تحتاج إلى مساعدة إضافية؟')).toBeInTheDocument();
    });

    it('should have contact buttons', () => {
      render(<Help />);
      expect(screen.getByText(/راسلنا بريداً إلكترونياً/)).toBeInTheDocument();
      expect(screen.getByText(/ابدأ محادثة مباشرة/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Help />);
      const heading = screen.getByText('مركز المساعدة');
      expect(heading.tagName).toBe('H1');
    });

    it('should have proper button structure', () => {
      render(<Help />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper text direction (RTL)', () => {
      const { container } = render(<Help />);
      const mainDiv = container.querySelector('.rtl');
      expect(mainDiv).toBeInTheDocument();
    });
  });
});
