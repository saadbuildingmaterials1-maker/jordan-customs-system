import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // Navigation
      dashboard: 'لوحة التحكم',
      calculator: 'حاسبة التكاليف',
      shipments: 'الشحنات',
      containers: 'الحاويات',
      customsDeclaration: 'البيان الجمركي',
      containerTracking: 'تتبع الحاويات',
      suppliers: 'الموردين',
      reports: 'التقارير',
      
      // Common
      welcome: 'مرحباً',
      logout: 'تسجيل الخروج',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      import: 'استيراد',
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات',
      error: 'خطأ',
      success: 'نجاح',
      warning: 'تحذير',
      info: 'معلومات',
      
      // Calculator
      calculatorTitle: 'حاسبة التكاليف الجمركية',
      goodsValue: 'قيمة البضاعة',
      weight: 'الوزن (كجم)',
      countryOfOrigin: 'بلد المنشأ',
      productType: 'نوع المنتج',
      calculate: 'احسب التكاليف',
      customsDuty: 'الرسوم الجمركية',
      salesTax: 'ضريبة المبيعات',
      shippingCost: 'تكلفة الشحن',
      totalCost: 'الإجمالي المتوقع',
      
      // Shipments
      shipmentsTitle: 'إدارة الشحنات',
      trackingNumber: 'رقم التتبع',
      status: 'الحالة',
      sender: 'المرسل',
      recipient: 'المستلم',
      value: 'القيمة',
      
      // Containers
      containersTitle: 'إدارة الحاويات',
      containerNumber: 'رقم الحاوية',
      containerType: 'نوع الحاوية',
      currentLocation: 'الموقع الحالي',
      
      // Customs Declaration
      customsDeclarationTitle: 'البيان الجمركي',
      declarationNumber: 'رقم البيان',
      importerName: 'اسم المستورد',
      uploadPDF: 'رفع ملف PDF',
      
      // Suppliers
      suppliersTitle: 'إدارة الموردين',
      companyName: 'اسم الشركة',
      contactPerson: 'الشخص المسؤول',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      country: 'الدولة',
      
      // Reports
      reportsTitle: 'التقارير والإحصائيات',
      exportPDF: 'تصدير PDF',
      exportExcel: 'تصدير Excel',
      dateFrom: 'من تاريخ',
      dateTo: 'إلى تاريخ',
      
      // Trial Banner
      trialDaysRemaining: 'يوم متبقي في الفترة التجريبية',
      trialExpired: 'انتهت الفترة التجريبية',
      upgrade: 'ترقية الاشتراك',
    },
  },
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      calculator: 'Cost Calculator',
      shipments: 'Shipments',
      containers: 'Containers',
      customsDeclaration: 'Customs Declaration',
      containerTracking: 'Container Tracking',
      suppliers: 'Suppliers',
      reports: 'Reports',
      
      // Common
      welcome: 'Welcome',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Loading...',
      noData: 'No data available',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      
      // Calculator
      calculatorTitle: 'Customs Cost Calculator',
      goodsValue: 'Goods Value',
      weight: 'Weight (kg)',
      countryOfOrigin: 'Country of Origin',
      productType: 'Product Type',
      calculate: 'Calculate Costs',
      customsDuty: 'Customs Duty',
      salesTax: 'Sales Tax',
      shippingCost: 'Shipping Cost',
      totalCost: 'Total Expected Cost',
      
      // Shipments
      shipmentsTitle: 'Shipments Management',
      trackingNumber: 'Tracking Number',
      status: 'Status',
      sender: 'Sender',
      recipient: 'Recipient',
      value: 'Value',
      
      // Containers
      containersTitle: 'Containers Management',
      containerNumber: 'Container Number',
      containerType: 'Container Type',
      currentLocation: 'Current Location',
      
      // Customs Declaration
      customsDeclarationTitle: 'Customs Declaration',
      declarationNumber: 'Declaration Number',
      importerName: 'Importer Name',
      uploadPDF: 'Upload PDF',
      
      // Suppliers
      suppliersTitle: 'Suppliers Management',
      companyName: 'Company Name',
      contactPerson: 'Contact Person',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      country: 'Country',
      
      // Reports
      reportsTitle: 'Reports & Statistics',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      dateFrom: 'From Date',
      dateTo: 'To Date',
      
      // Trial Banner
      trialDaysRemaining: 'days remaining in trial period',
      trialExpired: 'Trial period has expired',
      upgrade: 'Upgrade Subscription',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
