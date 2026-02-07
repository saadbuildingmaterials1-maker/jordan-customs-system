/**
 * Main Application Component
 * 
 * المكون الرئيسي للتطبيق
 * 
 * @module client/src/App
 */
import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load all pages
const Home = lazy(() => import("@/pages/Home"));
const DeclarationForm = lazy(() => import("@/pages/DeclarationForm"));
const DeclarationFormAdvanced = lazy(() => import("@/pages/DeclarationFormAdvanced"));
const DeclarationDetail = lazy(() => import("@/pages/DeclarationDetail"));
const DeclarationsList = lazy(() => import("@/pages/DeclarationsList"));
const ItemsManagement = lazy(() => import("@/pages/ItemsManagement"));
const VarianceAnalysis = lazy(() => import("@/pages/VarianceAnalysis"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const AccountingDashboard = lazy(() => import("@/pages/AccountingDashboard"));
const AdvancedReports = lazy(() => import("@/pages/AdvancedReports"));
const AlertsManagement = lazy(() => import("@/pages/AlertsManagement"));
const SupplierInvoice = lazy(() => import("@/pages/SupplierInvoice"));
const ShippingPage = lazy(() => import("@/pages/ShippingPage"));
const ExpensesPage = lazy(() => import("@/pages/ExpensesPage"));
const AdvancedCustomsDeclaration = lazy(() => import("@/pages/AdvancedCustomsDeclaration"));
const PaymentsManagement = lazy(() => import("@/pages/PaymentsManagement").then((m: any) => ({ default: m.PaymentsManagement || m.default })));
const Checkout = lazy(() => import("@/pages/Checkout"));
const SmartDashboard = lazy(() => import("@/pages/SmartDashboard"));
const FactoriesAndInvoices = lazy(() => import("@/pages/FactoriesAndInvoices"));
const AlertsAndNotifications = lazy(() => import("@/pages/AlertsAndNotifications"));
const UsersAndRoles = lazy(() => import("@/pages/UsersAndRoles"));
const SettingsAndSecurity = lazy(() => import('@/pages/SettingsAndSecurity'));
const ShippingManagement = lazy(() => import('@/pages/ShippingManagement'));
const ExpensesManagement = lazy(() => import('@/pages/ExpensesManagement'));
const AdvancedCustomsDeclarationPage = lazy(() => import('@/pages/AdvancedCustomsDeclarationPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const UsersManagement = lazy(() => import('@/pages/UsersManagement'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdvancedSearch = lazy(() => import('@/pages/AdvancedSearch'));
const DownloadPage = lazy(() => import('@/pages/Download'));
const About = lazy(() => import('@/pages/About'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('@/pages/TermsOfUse'));
const NotificationsCenter = lazy(() => import('@/pages/NotificationsCenter'));
const ContainerTracking = lazy(() => import('@/pages/ContainerTracking'));
const PdfImport = lazy(() => import('@/pages/PdfImport'));
const BackupAndNotifications = lazy(() => import('./pages/BackupAndNotifications'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const BankAccountManagement = lazy(() => import('@/pages/BankAccountManagement'));
const NotificationsManagement = lazy(() => import('@/pages/NotificationsManagement'));
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const VideoTutorials = lazy(() => import('@/pages/VideoTutorials'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Contact = lazy(() => import('@/pages/Contact'));
const Support = lazy(() => import('@/pages/Support'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Documentation = lazy(() => import('@/pages/Documentation'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const PaymentSystem = lazy(() => import('@/pages/PaymentSystem'));
const ClickPayment = lazy(() => import('@/pages/ClickPayment'));
const AdvancedPaymentGateway = lazy(() => import('@/pages/AdvancedPaymentGateway'));

import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <LoadingSpinner />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* الصفحة الرئيسية */}
        <Route path={"/"} component={Home} />
        
        {/* البيانات الجمركية */}
        <Route path={"/declarations"} component={DeclarationsList} />
        <Route path={"/declarations/new"} component={DeclarationForm} />
        <Route path={"/declarations/new/advanced"} component={DeclarationFormAdvanced} />
        <Route path={"/declarations/:id"} component={DeclarationDetail} />
        <Route path={"/declarations/:id/items"} component={ItemsManagement} />
        <Route path={"/declarations/:id/variance"} component={VarianceAnalysis} />
        <Route path={"/:id/customs-declaration"} component={AdvancedCustomsDeclaration} />
        <Route path={"/advanced-customs"} component={AdvancedCustomsDeclarationPage} />
        
        {/* الإدارة والتحكم */}
        <Route path={"/admin"} component={AdminPanel} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/smart-dashboard"} component={SmartDashboard} />
        
        {/* المحاسبة والتقارير */}
        <Route path={"/accounting"} component={AccountingDashboard} />
        <Route path={"/reports"} component={AdvancedReports} />
        <Route path={"/reports-page"} component={ReportsPage} />
        
        {/* التنبيهات والإشعارات */}
        <Route path={"/alerts"} component={AlertsManagement} />
        <Route path={"/alerts-notifications"} component={AlertsAndNotifications} />
        <Route path={"/notifications-center"} component={NotificationsCenter} />
        <Route path={"/notifications-management"} component={NotificationsManagement} />
        
        {/* الشحن والتتبع */}
        <Route path={"/shipping"} component={ShippingPage} />
        <Route path={"/shipping-management"} component={ShippingManagement} />
        <Route path={"/tracking"} component={ContainerTracking} />
        
        {/* المصروفات والفواتير */}
        <Route path={"/expenses"} component={ExpensesPage} />
        <Route path={"/expenses-management"} component={ExpensesManagement} />
        <Route path={"/supplier-invoice"} component={SupplierInvoice} />
        <Route path={"/factories-invoices"} component={FactoriesAndInvoices} />
        
        {/* الدفع والحسابات البنكية */}
        <Route path={"/payments"} component={PaymentsManagement} />
        <Route path={"/checkout"} component={Checkout} />
        <Route path={"/payment"} component={PaymentPage} />
        <Route path={"/payment-system"} component={PaymentSystem} />
        <Route path={"/click-payment"} component={ClickPayment} />
        <Route path={"/advanced-payment"} component={AdvancedPaymentGateway} />
        <Route path={"/bank-accounts"} component={BankAccountManagement} />
        
        {/* إدارة المستخدمين والأدوار */}
        <Route path={"/users-management"} component={UsersManagement} />
        <Route path={"/users-roles"} component={UsersAndRoles} />
        
        {/* الإعدادات والأمان */}
        <Route path="/settings" component={SettingsAndSecurity} />
        <Route path="/settings-page" component={SettingsPage} />
        
        {/* البحث والتحميل */}
        <Route path="/advanced-search" component={AdvancedSearch} />
        <Route path="/download" component={DownloadPage} />
        <Route path="/downloads" component={DownloadPage} />
        <Route path="/pdf-import" component={PdfImport} />
        
        {/* النسخ الاحتياطي */}
        <Route path="/backup-notifications" component={BackupAndNotifications} />
        
        {/* المساعدة والمعلومات */}
        <Route path="/login" component={Login} />
        <Route path="/help" component={HelpCenter} />
        <Route path="/tutorials" component={VideoTutorials} />
        <Route path="/about" component={About} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/contact" component={Contact} />
        <Route path="/support" component={Support} />
        <Route path="/faq" component={FAQ} />
        <Route path="/documentation" component={Documentation} />
        <Route path="/pricing" component={Pricing} />
        
        {/* صفحة 404 */}
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ToastProvider>
          <TooltipProvider>
            <Toaster />
            <ToastContainer />
            <Router />
          </TooltipProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
