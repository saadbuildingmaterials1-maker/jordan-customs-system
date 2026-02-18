/**
 * Main Application Component - Clean Version
 * 
 * المكون الرئيسي للتطبيق - النسخة النظيفة
 * 
 * @module client/src/App
 */
import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

// Lazy load pages
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
const ComplianceAudit = lazy(() => import('@/pages/ComplianceAudit'));
const DocumentManagement = lazy(() => import('@/pages/DocumentManagement'));
const BankIntegration = lazy(() => import('@/pages/BankIntegration'));
const InternationalShippingIntegration = lazy(() => import('@/pages/InternationalShippingIntegration'));
const SurveysAndRatings = lazy(() => import('@/pages/SurveysAndRatings'));
const SmartAlerts = lazy(() => import('@/pages/SmartAlerts'));
const ExternalSystemsIntegration = lazy(() => import('@/pages/ExternalSystemsIntegration'));
const HRManagementDashboard = lazy(() => import('@/pages/HRManagementDashboard'));
const SmartAlertsAdvanced = lazy(() => import('@/pages/SmartAlertsAdvanced'));
const CustomerRelationship = lazy(() => import('@/pages/CustomerRelationship'));
const SalesDashboard = lazy(() => import('@/pages/SalesDashboard'));
const SMSWhatsAppNotifications = lazy(() => import('@/pages/SMSWhatsAppNotifications'));
const ProjectManagement = lazy(() => import('@/pages/ProjectManagement'));
const ArchiveAndBackup = lazy(() => import('@/pages/ArchiveAndBackup'));
const AdvancedSettings = lazy(() => import('@/pages/AdvancedSettings'));
const ShippingServicesIntegration = lazy(() => import('@/pages/ShippingServicesIntegration'));
const VoiceVideoAlerts = lazy(() => import('@/pages/VoiceVideoAlerts'));
const SmartRecommendations = lazy(() => import('@/pages/SmartRecommendations'));
const CustomsDashboard = lazy(() => import('@/pages/CustomsDashboard'));
const ScheduledReportingSystem = lazy(() => import('@/pages/ScheduledReportingSystem'));
const AdvancedHRSystem = lazy(() => import('@/pages/AdvancedHRSystem'));
const RealPaymentIntegration = lazy(() => import('@/pages/RealPaymentIntegration'));
const PaymentGatewayIntegration = lazy(() => import('@/pages/PaymentGatewayIntegration'));
const InstantMessaging = lazy(() => import('@/pages/InstantMessaging'));
const EmailNotificationSystem = lazy(() => import('@/pages/EmailNotificationSystem'));
const TechnicalSupport = lazy(() => import('@/pages/TechnicalSupport'));
const AdvancedSalesDashboard = lazy(() => import('@/pages/AdvancedSalesDashboard'));
const SmartAnalyticsDashboard = lazy(() => import('@/pages/SmartAnalyticsDashboard'));
const FinalAdvancedAlerts = lazy(() => import('@/pages/FinalAdvancedAlerts'));
const MobileAppDevelopment = lazy(() => import('@/pages/MobileAppDevelopment'));
const CEODashboard = lazy(() => import('@/pages/CEODashboard'));
const JordanCustomsIntegration = lazy(() => import('@/pages/JordanCustomsIntegration'));
const MobileAppDevelopmentAdvanced = lazy(() => import('@/pages/MobileAppDevelopmentAdvanced'));
const SmartAnalyticsAdvanced = lazy(() => import('@/pages/SmartAnalyticsAdvanced'));
const PWADevelopment = lazy(() => import('@/pages/PWADevelopment'));
const PaymentsDashboard = lazy(() => import('@/pages/PaymentsDashboard'));
const OwnerDashboard = lazy(() => import('@/pages/OwnerDashboard'));
const Help = lazy(() => import('@/pages/Help'));
const AdvancedLogin = lazy(() => import('@/pages/AdvancedLogin'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const InstantNotificationSystem = lazy(() => import('@/pages/InstantNotificationSystem'));
const AdvancedPaymentSystem = lazy(() => import('@/pages/AdvancedPaymentSystem'));
const PerformanceAndSEO = lazy(() => import('@/pages/PerformanceAndSEO'));
const LiveTechnicalSupport = lazy(() => import('@/pages/LiveTechnicalSupport'));
const AdvancedAnalyticsDashboard = lazy(() => import('@/pages/AdvancedAnalyticsDashboard'));

import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import LiveChat from "./components/LiveChat";

// Simple fallback
function SimpleFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>جاري التحميل...</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/payment/local"} component={LocalPaymentPage} />
      <Route path={"/declarations"} component={DeclarationsList} />
      <Route path={"/declarations/new"} component={DeclarationForm} />
      <Route path={"/declarations/new/advanced"} component={DeclarationFormAdvanced} />
      <Route path={"/declarations/:id"} component={DeclarationDetail} />
      <Route path={"/declarations/:id/items"} component={ItemsManagement} />
      <Route path={"/declarations/:id/variance"} component={VarianceAnalysis} />
      <Route path={"/:id/customs-declaration"} component={AdvancedCustomsDeclaration} />
      <Route path={"/advanced-customs"} component={AdvancedCustomsDeclarationPage} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/smart-dashboard"} component={SmartDashboard} />
      <Route path={"/accounting"} component={AccountingDashboard} />
      <Route path={"/reports"} component={AdvancedReports} />
      <Route path={"/reports-page"} component={ReportsPage} />
      <Route path={"/alerts"} component={AlertsManagement} />
      <Route path={"/alerts-notifications"} component={AlertsAndNotifications} />
      <Route path={"/notifications-center"} component={NotificationsCenter} />
      <Route path={"/notifications-management"} component={NotificationsManagement} />
      <Route path={"/shipping"} component={ShippingPage} />
      <Route path={"/shipping-management"} component={ShippingManagement} />
      <Route path={"/tracking"} component={ContainerTracking} />
      <Route path={"/expenses"} component={ExpensesPage} />
      <Route path={"/expenses-management"} component={ExpensesManagement} />
      <Route path={"/supplier-invoice"} component={SupplierInvoice} />
      <Route path={"/payment"} component={PaymentPage} />
      <Route path={"/payment-system"} component={PaymentSystem} />
      <Route path={"/click-payment"} component={ClickPayment} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/factories"} component={FactoriesAndInvoices} />
      <Route path={"/invoices"} component={InvoicesAndReceipts} />
      <Route path={"/export-reports"} component={ExportAndReports} />
      <Route path={"/users-management"} component={UsersManagement} />
      <Route path={"/users-roles"} component={UsersAndRoles} />
      <Route path="/settings" component={SettingsAndSecurity} />
      <Route path="/settings-page" component={SettingsPage} />
      <Route path="/advanced-search" component={AdvancedSearch} />
      <Route path="/download" component={DownloadPage} />
      <Route path="/downloads" component={DownloadPage} />
      <Route path="/pdf-import" component={PdfImport} />
      <Route path="/backup-notifications" component={BackupAndNotifications} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/login" component={Login} />
      <Route path="/advanced-login" component={AdvancedLogin} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/instant-notifications" component={InstantNotificationSystem} />
      <Route path="/advanced-payment-system" component={AdvancedPaymentSystem} />
      <Route path="/performance-seo" component={PerformanceAndSEO} />
      <Route path="/live-support" component={LiveTechnicalSupport} />
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
      <Route path="/compliance-audit" component={ComplianceAudit} />
      <Route path="/document-management" component={DocumentManagement} />
      <Route path="/bank-integration" component={BankIntegration} />
      <Route path="/international-shipping" component={InternationalShippingIntegration} />
      <Route path="/surveys-ratings" component={SurveysAndRatings} />
      <Route path="/smart-alerts" component={SmartAlerts} />
      <Route path="/external-systems" component={ExternalSystemsIntegration} />
      <Route path="/hr-management" component={HRManagementDashboard} />
      <Route path="/smart-alerts-advanced" component={SmartAlertsAdvanced} />
      <Route path="/customer-relationship" component={CustomerRelationship} />
      <Route path="/sales-dashboard" component={SalesDashboard} />
      <Route path="/sms-whatsapp" component={SMSWhatsAppNotifications} />
      <Route path="/project-management" component={ProjectManagement} />
      <Route path="/archive-backup" component={ArchiveAndBackup} />
      <Route path="/advanced-settings" component={AdvancedSettings} />
      <Route path="/shipping-services" component={ShippingServicesIntegration} />
      <Route path="/voice-video-alerts" component={VoiceVideoAlerts} />
      <Route path="/smart-recommendations" component={SmartRecommendations} />
      <Route path="/customs-dashboard" component={CustomsDashboard} />
      <Route path="/scheduled-reporting" component={ScheduledReportingSystem} />
      <Route path="/advanced-hr" component={AdvancedHRSystem} />
      <Route path="/real-payment" component={RealPaymentIntegration} />
      <Route path="/payment-gateway" component={PaymentGatewayIntegration} />
      <Route path="/instant-messaging" component={InstantMessaging} />
      <Route path="/email-notifications" component={EmailNotificationSystem} />
      <Route path="/technical-support" component={TechnicalSupport} />
      <Route path="/advanced-sales" component={AdvancedSalesDashboard} />
      <Route path="/smart-analytics" component={SmartAnalyticsDashboard} />
      <Route path="/final-alerts" component={FinalAdvancedAlerts} />
      <Route path="/mobile-app" component={MobileAppDevelopment} />
      <Route path="/ceo-dashboard" component={CEODashboard} />
      <Route path="/jordan-customs" component={JordanCustomsIntegration} />
      <Route path="/mobile-app-advanced" component={MobileAppDevelopmentAdvanced} />
      <Route path="/smart-analytics-advanced" component={SmartAnalyticsAdvanced} />
      <Route path="/pwa" component={PWADevelopment} />
      <Route path="/payments-dashboard" component={PaymentsDashboard} />
      <Route path="/owner-dashboard" component={OwnerDashboard} />
      <Route path="/subscription-plans" component={SubscriptionPlans} />
      <Route path="/subscription-dashboard" component={SubscriptionDashboard} />
      <Route path="/confirm-plan" component={ConfirmPlan} />
      <Route path="/advanced-payments" component={AdvancedPaymentPage} />
      <Route path="/advanced-payments-dashboard" component={AdvancedPaymentDashboard} />
      <Route path="/bank-accounts" component={BankAccountManagement} />
      <Route path="/advanced-analytics" component={AdvancedAnalyticsDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
