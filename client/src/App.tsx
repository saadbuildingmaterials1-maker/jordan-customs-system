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
const Notifications = lazy(() => import('@/pages/Notifications'));
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
const AdvancedPaymentGatewayPage = lazy(() => import('@/pages/AdvancedPaymentPage'));
const SubscriptionPlans = lazy(() => import('@/pages/SubscriptionPlans'));
const SubscriptionDashboard = lazy(() => import('@/pages/SubscriptionDashboard'));
const ConfirmPlan = lazy(() => import('@/pages/ConfirmPlan'));
const AdvancedPaymentPage = lazy(() => import('@/pages/AdvancedPaymentPage'));
const LocalPaymentPage = lazy(() => import('@/pages/LocalPaymentPage'));
const AdvancedPaymentDashboard = lazy(() => import('@/pages/AdvancedPaymentDashboard'));
const InvoicesAndReceipts = lazy(() => import('@/pages/InvoicesAndReceipts'));
const ExportAndReports = lazy(() => import('@/pages/ExportAndReports'));
const NotificationsAndAlerts = lazy(() => import('@/pages/NotificationsAndAlerts'));
const SecurityAndPerformance = lazy(() => import('@/pages/SecurityAndPerformance'));
const TeamAndRoles = lazy(() => import('@/pages/TeamAndRoles'));
const AdvancedSettings = lazy(() => import('@/pages/AdvancedSettings'));
const EmailNotifications = lazy(() => import('@/pages/EmailNotifications'));
const ArchiveAndBackup = lazy(() => import('@/pages/ArchiveAndBackup'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const ActivityLog = lazy(() => import('@/pages/ActivityLog'));
const BranchManagement = lazy(() => import('@/pages/BranchManagement'));
const SmartAlerts = lazy(() => import('@/pages/SmartAlerts'));
const PerformanceDashboard = lazy(() => import('@/pages/PerformanceDashboard'));
const ScheduledReports = lazy(() => import('@/pages/ScheduledReports'));
const DocumentManagement = lazy(() => import('@/pages/DocumentManagement'));
const ProjectManagement = lazy(() => import('@/pages/ProjectManagement'));
const ComplianceAudit = lazy(() => import('@/pages/ComplianceAudit'));
const ExternalIntegration = lazy(() => import('@/pages/ExternalIntegration'));
const InventoryManagement = lazy(() => import('@/pages/InventoryManagement'));
const AIPredictions = lazy(() => import('@/pages/AIPredictions'));
const AdvancedInvoicing = lazy(() => import('@/pages/AdvancedInvoicing'));
const CustomerRelationship = lazy(() => import('@/pages/CustomerRelationship'));
const AdvancedNotifications = lazy(() => import('@/pages/AdvancedNotifications'));
const AdvancedAnalyticsPage = lazy(() => import('@/pages/AdvancedAnalyticsPage'));
const AdvancedReporting = lazy(() => import('@/pages/AdvancedReporting'));
const PaymentGatewayIntegration = lazy(() => import('@/pages/PaymentGatewayIntegration'));
const InstantMessaging = lazy(() => import('@/pages/InstantMessaging'));
const VoiceVideoAlerts = lazy(() => import('@/pages/VoiceVideoAlerts'));
const SalesDashboard = lazy(() => import('@/pages/SalesDashboard'));
const SurveysAndRatings = lazy(() => import('@/pages/SurveysAndRatings'));
const EmailNotificationSystem = lazy(() => import('@/pages/EmailNotificationSystem'));
const HRManagementDashboard = lazy(() => import('@/pages/HRManagementDashboard'));
const SmartRecommendations = lazy(() => import('@/pages/SmartRecommendations'));
const AutomatedInvoicing = lazy(() => import('@/pages/AutomatedInvoicing'));
const RealTimeAnalyticsDashboard = lazy(() => import('@/pages/RealTimeAnalyticsDashboard'));
const AdvancedNotificationSystem = lazy(() => import('@/pages/AdvancedNotificationSystem'));
const TechnicalSupport = lazy(() => import('@/pages/TechnicalSupport'));
const AdvancedSalesDashboard = lazy(() => import('@/pages/AdvancedSalesDashboard'));
const ExternalSystemsIntegration = lazy(() => import('@/pages/ExternalSystemsIntegration'));
const PaymentsDashboard = lazy(() => import('@/pages/PaymentsDashboard'));
const OwnerDashboard = lazy(() => import('@/pages/OwnerDashboard'));
const Help = lazy(() => import('@/pages/Help'));

import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import LiveChat from "./components/LiveChat";

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
        <Route path={"/payment/local"} component={LocalPaymentPage} />
        
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
        <Route path="/payments" component={PaymentsManagement} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/payment-system" component={PaymentSystem} />
        <Route path="/click-payment" component={ClickPayment} />
        <Route path="/advanced-payment" component={AdvancedPaymentPage} />
        <Route path="/local-payment" component={LocalPaymentPage} />
        <Route path="/payment-dashboard" component={AdvancedPaymentDashboard} />
        <Route path="/invoices-receipts" component={InvoicesAndReceipts} />
        <Route path="/export-reports" component={ExportAndReports} />
        <Route path="/notifications-alerts" component={NotificationsAndAlerts} />
        <Route path="/security-performance" component={SecurityAndPerformance} />
        <Route path="/team-roles" component={TeamAndRoles} />
        <Route path="/advanced-settings" component={AdvancedSettings} />
        <Route path="/email-notifications" component={EmailNotifications} />
        <Route path="/archive-backup" component={ArchiveAndBackup} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/activity-log" component={ActivityLog} />
        <Route path="/branch-management" component={BranchManagement} />
        <Route path="/smart-alerts" component={SmartAlerts} />
        <Route path="/performance-dashboard" component={PerformanceDashboard} />
        <Route path="/scheduled-reports" component={ScheduledReports} />
        <Route path="/document-management" component={DocumentManagement} />
        <Route path="/project-management" component={ProjectManagement} />
        <Route path="/compliance-audit" component={ComplianceAudit} />
        <Route path="/external-integration" component={ExternalIntegration} />
        <Route path="/inventory-management" component={InventoryManagement} />
        <Route path="/ai-predictions" component={AIPredictions} />
        <Route path="/advanced-invoicing" component={AdvancedInvoicing} />
        <Route path="/customer-relationship" component={CustomerRelationship} />
        <Route path="/advanced-notifications" component={AdvancedNotifications} />
        <Route path="/advanced-analytics" component={AdvancedAnalyticsPage} />
        <Route path="/advanced-reporting" component={AdvancedReporting} />
        <Route path="/payment-gateway-integration" component={PaymentGatewayIntegration} />
        <Route path="/instant-messaging" component={InstantMessaging} />
        <Route path="/voice-video-alerts" component={VoiceVideoAlerts} />
        <Route path="/sales-dashboard" component={SalesDashboard} />
        <Route path="/surveys-ratings" component={SurveysAndRatings} />
        <Route path="/email-notification-system" component={EmailNotificationSystem} />
        <Route path="/hr-management" component={HRManagementDashboard} />
        <Route path="/smart-recommendations" component={SmartRecommendations} />
        <Route path="/automated-invoicing" component={AutomatedInvoicing} />
        <Route path="/real-time-analytics" component={RealTimeAnalyticsDashboard} />
        <Route path="/advanced-notification-system" component={AdvancedNotificationSystem} />
        <Route path="/technical-support" component={TechnicalSupport} />
        <Route path="/advanced-sales-dashboard" component={AdvancedSalesDashboard} />
        <Route path="/external-systems-integration" component={ExternalSystemsIntegration} />
        <Route path="/payments-dashboard" component={PaymentsDashboard} />
        <Route path="/owner-dashboard" component={OwnerDashboard} />
        <Route path="/bank-accounts" component={BankAccountManagement} />
        <Route path="/subscription-plans" component={SubscriptionPlans} />
        <Route path="/subscription-dashboard" component={SubscriptionDashboard} />
        <Route path="/confirm-plan" component={ConfirmPlan} />
        
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
        <Route path="/notifications" component={Notifications} />
        
        {/* المساعدة والمعلومات */}
        <Route path="/login" component={Login} />
        <Route path="/help" component={Help} />
        <Route path="/help-center" component={HelpCenter} />
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
      <ThemeProvider defaultTheme="system" switchable={true}>
        <ToastProvider>
          <TooltipProvider>
            <Toaster />
            <ToastContainer />
            <LiveChat />
            <Router />
          </TooltipProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
