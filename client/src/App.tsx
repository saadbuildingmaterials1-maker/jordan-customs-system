/**
 * Main Application Component - Complete Version
 * 
 * المكون الرئيسي للتطبيق - النسخة الكاملة
 * 
 * @module client/src/App
 */
import { Toaster } from "@/components/ui/sonner";
import { lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import LiveChat from "./components/LiveChat";

// Lazy load all pages
const AIPredictions = lazy(() => import('@/pages/AIPredictions'));
const About = lazy(() => import('@/pages/About'));
const AccountingDashboard = lazy(() => import('@/pages/AccountingDashboard'));
const ActivityLog = lazy(() => import('@/pages/ActivityLog'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const AdvancedAnalytics = lazy(() => import('@/pages/AdvancedAnalytics'));
const AdvancedAnalyticsDashboard = lazy(() => import('@/pages/AdvancedAnalyticsDashboard'));
const AdvancedAnalyticsPage = lazy(() => import('@/pages/AdvancedAnalyticsPage'));
const AdvancedCustomsDeclaration = lazy(() => import('@/pages/AdvancedCustomsDeclaration'));
const AdvancedCustomsDeclarationPage = lazy(() => import('@/pages/AdvancedCustomsDeclarationPage'));
const AdvancedHRSystem = lazy(() => import('@/pages/AdvancedHRSystem'));
const AdvancedInvoicing = lazy(() => import('@/pages/AdvancedInvoicing'));
const AdvancedLogin = lazy(() => import('@/pages/AdvancedLogin'));
const AdvancedNotificationSystem = lazy(() => import('@/pages/AdvancedNotificationSystem'));
const AdvancedNotifications = lazy(() => import('@/pages/AdvancedNotifications'));
const AdvancedPaymentDashboard = lazy(() => import('@/pages/AdvancedPaymentDashboard'));
const AdvancedPaymentGateway = lazy(() => import('@/pages/AdvancedPaymentGateway'));
const AdvancedPaymentPage = lazy(() => import('@/pages/AdvancedPaymentPage'));
const AdvancedPaymentSystem = lazy(() => import('@/pages/AdvancedPaymentSystem'));
const AdvancedRegister = lazy(() => import('@/pages/AdvancedRegister'));
const AdvancedReporting = lazy(() => import('@/pages/AdvancedReporting'));
const AdvancedReportingSystem = lazy(() => import('@/pages/AdvancedReportingSystem'));
const AdvancedReports = lazy(() => import('@/pages/AdvancedReports'));
const AdvancedSalesDashboard = lazy(() => import('@/pages/AdvancedSalesDashboard'));
const AdvancedSearch = lazy(() => import('@/pages/AdvancedSearch'));
const AdvancedSettings = lazy(() => import('@/pages/AdvancedSettings'));
const AlertsAndNotifications = lazy(() => import('@/pages/AlertsAndNotifications'));
const AlertsManagement = lazy(() => import('@/pages/AlertsManagement'));
const ArchiveAndBackup = lazy(() => import('@/pages/ArchiveAndBackup'));
const AutomatedInvoicing = lazy(() => import('@/pages/AutomatedInvoicing'));
const BackupAndNotifications = lazy(() => import('@/pages/BackupAndNotifications'));
const BackupManagement = lazy(() => import('@/pages/BackupManagement'));
const BankAccountManagement = lazy(() => import('@/pages/BankAccountManagement'));
const BankIntegration = lazy(() => import('@/pages/BankIntegration'));
const BranchManagement = lazy(() => import('@/pages/BranchManagement'));
const CEODashboard = lazy(() => import('@/pages/CEODashboard'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const ClickPayment = lazy(() => import('@/pages/ClickPayment'));
const ComplianceAudit = lazy(() => import('@/pages/ComplianceAudit'));
const ComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
const ComprehensiveReports = lazy(() => import('@/pages/ComprehensiveReports'));
const ConfirmPlan = lazy(() => import('@/pages/ConfirmPlan'));
const Contact = lazy(() => import('@/pages/Contact'));
const ContainerTracking = lazy(() => import('@/pages/ContainerTracking'));
const CustomerRelationship = lazy(() => import('@/pages/CustomerRelationship'));
const CustomsDashboard = lazy(() => import('@/pages/CustomsDashboard'));
const CustomsDeclarationAdvancedUI = lazy(() => import('@/pages/CustomsDeclarationAdvancedUI'));
const CustomsDeclarationComplete = lazy(() => import('@/pages/CustomsDeclarationComplete'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeclarationDetail = lazy(() => import('@/pages/DeclarationDetail'));
const DeclarationForm = lazy(() => import('@/pages/DeclarationForm'));
const DeclarationFormAdvanced = lazy(() => import('@/pages/DeclarationFormAdvanced'));
const Declarations = lazy(() => import('@/pages/Declarations'));
const DeclarationsList = lazy(() => import('@/pages/DeclarationsList'));
const DocumentManagement = lazy(() => import('@/pages/DocumentManagement'));
const Documentation = lazy(() => import('@/pages/Documentation'));
const Download = lazy(() => import('@/pages/Download'));
const DownloadPage = lazy(() => import('@/pages/DownloadPage'));
const EmailNotificationSystem = lazy(() => import('@/pages/EmailNotificationSystem'));
const EmailNotifications = lazy(() => import('@/pages/EmailNotifications'));
const ExpensesManagement = lazy(() => import('@/pages/ExpensesManagement'));
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'));
const ExportAndReports = lazy(() => import('@/pages/ExportAndReports'));
const ExternalIntegration = lazy(() => import('@/pages/ExternalIntegration'));
const ExternalSystemsIntegration = lazy(() => import('@/pages/ExternalSystemsIntegration'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const FactoriesAndInvoices = lazy(() => import('@/pages/FactoriesAndInvoices'));
const FinalAdvancedAlerts = lazy(() => import('@/pages/FinalAdvancedAlerts'));
const FinancialReports = lazy(() => import('@/pages/FinancialReports'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const GovernmentIntegration = lazy(() => import('@/pages/GovernmentIntegration'));
const HRManagementDashboard = lazy(() => import('@/pages/HRManagementDashboard'));
const Help = lazy(() => import('@/pages/Help'));
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const Home = lazy(() => import('@/pages/Home'));
const InstantMessaging = lazy(() => import('@/pages/InstantMessaging'));
const InstantNotificationSystem = lazy(() => import('@/pages/InstantNotificationSystem'));
const InternationalShippingIntegration = lazy(() => import('@/pages/InternationalShippingIntegration'));
const InventoryManagement = lazy(() => import('@/pages/InventoryManagement'));
const InvoicesAndReceipts = lazy(() => import('@/pages/InvoicesAndReceipts'));
const ItemsManagement = lazy(() => import('@/pages/ItemsManagement'));
const ItemsManagementWithAI = lazy(() => import('@/pages/ItemsManagementWithAI'));
const JordanCustomsIntegration = lazy(() => import('@/pages/JordanCustomsIntegration'));
const LiveTechnicalSupport = lazy(() => import('@/pages/LiveTechnicalSupport'));
const LocalPaymentPage = lazy(() => import('@/pages/LocalPaymentPage'));
const Login = lazy(() => import('@/pages/Login'));
const MobileAppDevelopment = lazy(() => import('@/pages/MobileAppDevelopment'));
const MobileAppDevelopmentAdvanced = lazy(() => import('@/pages/MobileAppDevelopmentAdvanced'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const NotificationsAndAlerts = lazy(() => import('@/pages/NotificationsAndAlerts'));
const NotificationsCenter = lazy(() => import('@/pages/NotificationsCenter'));
const NotificationsManagement = lazy(() => import('@/pages/NotificationsManagement'));
const OwnerDashboard = lazy(() => import('@/pages/OwnerDashboard'));
const PWADevelopment = lazy(() => import('@/pages/PWADevelopment'));
const PaymentGatewayIntegration = lazy(() => import('@/pages/PaymentGatewayIntegration'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const PaymentSystem = lazy(() => import('@/pages/PaymentSystem'));
const Payments = lazy(() => import('@/pages/Payments'));
const PaymentsDashboard = lazy(() => import('@/pages/PaymentsDashboard'));
const PaymentsManagement = lazy(() => import('@/pages/PaymentsManagement'));
const PdfImport = lazy(() => import('@/pages/PdfImport'));
const PerformanceAndSEO = lazy(() => import('@/pages/PerformanceAndSEO'));
const PerformanceDashboard = lazy(() => import('@/pages/PerformanceDashboard'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const ProjectManagement = lazy(() => import('@/pages/ProjectManagement'));
const RealPaymentIntegration = lazy(() => import('@/pages/RealPaymentIntegration'));
const RealTimeAnalyticsDashboard = lazy(() => import('@/pages/RealTimeAnalyticsDashboard'));
const Reports = lazy(() => import('@/pages/Reports'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const RevenueAnalytics = lazy(() => import('@/pages/RevenueAnalytics'));
const SMSWhatsAppNotifications = lazy(() => import('@/pages/SMSWhatsAppNotifications'));
const SalesDashboard = lazy(() => import('@/pages/SalesDashboard'));
const ScheduledReportingSystem = lazy(() => import('@/pages/ScheduledReportingSystem'));
const ScheduledReports = lazy(() => import('@/pages/ScheduledReports'));
const SecurityAndPerformance = lazy(() => import('@/pages/SecurityAndPerformance'));
const SettingsAndSecurity = lazy(() => import('@/pages/SettingsAndSecurity'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ShippingManagement = lazy(() => import('@/pages/ShippingManagement'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const ShippingServicesIntegration = lazy(() => import('@/pages/ShippingServicesIntegration'));
const SmartAlerts = lazy(() => import('@/pages/SmartAlerts'));
const SmartAlertsAdvanced = lazy(() => import('@/pages/SmartAlertsAdvanced'));
const SmartAnalyticsAdvanced = lazy(() => import('@/pages/SmartAnalyticsAdvanced'));
const SmartAnalyticsDashboard = lazy(() => import('@/pages/SmartAnalyticsDashboard'));
const SmartDashboard = lazy(() => import('@/pages/SmartDashboard'));
const SmartRecommendations = lazy(() => import('@/pages/SmartRecommendations'));
const SubscriptionDashboard = lazy(() => import('@/pages/SubscriptionDashboard'));
const SubscriptionManagement = lazy(() => import('@/pages/SubscriptionManagement'));
const SubscriptionPlans = lazy(() => import('@/pages/SubscriptionPlans'));
const SupplierInvoice = lazy(() => import('@/pages/SupplierInvoice'));
const Support = lazy(() => import('@/pages/Support'));
const SurveysAndRatings = lazy(() => import('@/pages/SurveysAndRatings'));
const TeamAndRoles = lazy(() => import('@/pages/TeamAndRoles'));
const TechnicalSupport = lazy(() => import('@/pages/TechnicalSupport'));
const Terms = lazy(() => import('@/pages/Terms'));
const TermsOfUse = lazy(() => import('@/pages/TermsOfUse'));
const Tracking = lazy(() => import('@/pages/Tracking'));
const UserDashboard = lazy(() => import('@/pages/UserDashboard'));
const UserGuide = lazy(() => import('@/pages/UserGuide'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const UsersAndRoles = lazy(() => import('@/pages/UsersAndRoles'));
const UsersManagement = lazy(() => import('@/pages/UsersManagement'));
const VarianceAnalysis = lazy(() => import('@/pages/VarianceAnalysis'));
const VideoTutorials = lazy(() => import('@/pages/VideoTutorials'));
const VoiceVideoAlerts = lazy(() => import('@/pages/VoiceVideoAlerts'));

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
      <Route path="/a-i-predictions" component={AIPredictions} />
      <Route path="/about" component={About} />
      <Route path="/accounting-dashboard" component={AccountingDashboard} />
      <Route path="/activity-log" component={ActivityLog} />
      <Route path="/admin-panel" component={AdminPanel} />
      <Route path="/advanced-analytics" component={AdvancedAnalytics} />
      <Route path="/advanced-analytics-dashboard" component={AdvancedAnalyticsDashboard} />
      <Route path="/advanced-analytics-page" component={AdvancedAnalyticsPage} />
      <Route path="/advanced-customs-declaration" component={AdvancedCustomsDeclaration} />
      <Route path="/advanced-customs-declaration-page" component={AdvancedCustomsDeclarationPage} />
      <Route path="/advanced-h-r-system" component={AdvancedHRSystem} />
      <Route path="/advanced-invoicing" component={AdvancedInvoicing} />
      <Route path="/advanced-login" component={AdvancedLogin} />
      <Route path="/advanced-notification-system" component={AdvancedNotificationSystem} />
      <Route path="/advanced-notifications" component={AdvancedNotifications} />
      <Route path="/advanced-payment-dashboard" component={AdvancedPaymentDashboard} />
      <Route path="/advanced-payment-gateway" component={AdvancedPaymentGateway} />
      <Route path="/advanced-payment-page" component={AdvancedPaymentPage} />
      <Route path="/advanced-payment-system" component={AdvancedPaymentSystem} />
      <Route path="/advanced-register" component={AdvancedRegister} />
      <Route path="/advanced-reporting" component={AdvancedReporting} />
      <Route path="/advanced-reporting-system" component={AdvancedReportingSystem} />
      <Route path="/advanced-reports" component={AdvancedReports} />
      <Route path="/advanced-sales-dashboard" component={AdvancedSalesDashboard} />
      <Route path="/advanced-search" component={AdvancedSearch} />
      <Route path="/advanced-settings" component={AdvancedSettings} />
      <Route path="/alerts-and-notifications" component={AlertsAndNotifications} />
      <Route path="/alerts-management" component={AlertsManagement} />
      <Route path="/archive-and-backup" component={ArchiveAndBackup} />
      <Route path="/automated-invoicing" component={AutomatedInvoicing} />
      <Route path="/backup-and-notifications" component={BackupAndNotifications} />
      <Route path="/backup-management" component={BackupManagement} />
      <Route path="/bank-account-management" component={BankAccountManagement} />
      <Route path="/bank-integration" component={BankIntegration} />
      <Route path="/branch-management" component={BranchManagement} />
      <Route path="/c-e-o-dashboard" component={CEODashboard} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/click-payment" component={ClickPayment} />
      <Route path="/compliance-audit" component={ComplianceAudit} />
      <Route path="/component-showcase" component={ComponentShowcase} />
      <Route path="/comprehensive-reports" component={ComprehensiveReports} />
      <Route path="/confirm-plan" component={ConfirmPlan} />
      <Route path="/contact" component={Contact} />
      <Route path="/container-tracking" component={ContainerTracking} />
      <Route path="/customer-relationship" component={CustomerRelationship} />
      <Route path="/customs-dashboard" component={CustomsDashboard} />
      <Route path="/customs-declaration-advanced-u-i" component={CustomsDeclarationAdvancedUI} />
      <Route path="/customs-declaration-complete" component={CustomsDeclarationComplete} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/declaration-detail" component={DeclarationDetail} />
      <Route path="/declaration-form" component={DeclarationForm} />
      <Route path="/declaration-form-advanced" component={DeclarationFormAdvanced} />
      <Route path="/declarations" component={Declarations} />
      <Route path="/declarations-list" component={DeclarationsList} />
      <Route path="/document-management" component={DocumentManagement} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/download" component={Download} />
      <Route path="/download-page" component={DownloadPage} />
      <Route path="/email-notification-system" component={EmailNotificationSystem} />
      <Route path="/email-notifications" component={EmailNotifications} />
      <Route path="/expenses-management" component={ExpensesManagement} />
      <Route path="/expenses-page" component={ExpensesPage} />
      <Route path="/export-and-reports" component={ExportAndReports} />
      <Route path="/external-integration" component={ExternalIntegration} />
      <Route path="/external-systems-integration" component={ExternalSystemsIntegration} />
      <Route path="/f-a-q" component={FAQ} />
      <Route path="/factories-and-invoices" component={FactoriesAndInvoices} />
      <Route path="/final-advanced-alerts" component={FinalAdvancedAlerts} />
      <Route path="/financial-reports" component={FinancialReports} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/government-integration" component={GovernmentIntegration} />
      <Route path="/h-r-management-dashboard" component={HRManagementDashboard} />
      <Route path="/help" component={Help} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/home" component={Home} />
      <Route path="/instant-messaging" component={InstantMessaging} />
      <Route path="/instant-notification-system" component={InstantNotificationSystem} />
      <Route path="/international-shipping-integration" component={InternationalShippingIntegration} />
      <Route path="/inventory-management" component={InventoryManagement} />
      <Route path="/invoices-and-receipts" component={InvoicesAndReceipts} />
      <Route path="/items-management" component={ItemsManagement} />
      <Route path="/items-management-with-a-i" component={ItemsManagementWithAI} />
      <Route path="/jordan-customs-integration" component={JordanCustomsIntegration} />
      <Route path="/live-technical-support" component={LiveTechnicalSupport} />
      <Route path="/local-payment-page" component={LocalPaymentPage} />
      <Route path="/login" component={Login} />
      <Route path="/mobile-app-development" component={MobileAppDevelopment} />
      <Route path="/mobile-app-development-advanced" component={MobileAppDevelopmentAdvanced} />
      <Route path="/not-found" component={NotFound} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/notifications-and-alerts" component={NotificationsAndAlerts} />
      <Route path="/notifications-center" component={NotificationsCenter} />
      <Route path="/notifications-management" component={NotificationsManagement} />
      <Route path="/owner-dashboard" component={OwnerDashboard} />
      <Route path="/p-w-a-development" component={PWADevelopment} />
      <Route path="/payment-gateway-integration" component={PaymentGatewayIntegration} />
      <Route path="/payment-page" component={PaymentPage} />
      <Route path="/payment-system" component={PaymentSystem} />
      <Route path="/payments" component={Payments} />
      <Route path="/payments-dashboard" component={PaymentsDashboard} />
      <Route path="/payments-management" component={PaymentsManagement} />
      <Route path="/pdf-import" component={PdfImport} />
      <Route path="/performance-and-s-e-o" component={PerformanceAndSEO} />
      <Route path="/performance-dashboard" component={PerformanceDashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/project-management" component={ProjectManagement} />
      <Route path="/real-payment-integration" component={RealPaymentIntegration} />
      <Route path="/real-time-analytics-dashboard" component={RealTimeAnalyticsDashboard} />
      <Route path="/reports" component={Reports} />
      <Route path="/reports-page" component={ReportsPage} />
      <Route path="/revenue-analytics" component={RevenueAnalytics} />
      <Route path="/s-m-s-whats-app-notifications" component={SMSWhatsAppNotifications} />
      <Route path="/sales-dashboard" component={SalesDashboard} />
      <Route path="/scheduled-reporting-system" component={ScheduledReportingSystem} />
      <Route path="/scheduled-reports" component={ScheduledReports} />
      <Route path="/security-and-performance" component={SecurityAndPerformance} />
      <Route path="/settings-and-security" component={SettingsAndSecurity} />
      <Route path="/settings-page" component={SettingsPage} />
      <Route path="/shipping-management" component={ShippingManagement} />
      <Route path="/shipping-page" component={ShippingPage} />
      <Route path="/shipping-services-integration" component={ShippingServicesIntegration} />
      <Route path="/smart-alerts" component={SmartAlerts} />
      <Route path="/smart-alerts-advanced" component={SmartAlertsAdvanced} />
      <Route path="/smart-analytics-advanced" component={SmartAnalyticsAdvanced} />
      <Route path="/smart-analytics-dashboard" component={SmartAnalyticsDashboard} />
      <Route path="/smart-dashboard" component={SmartDashboard} />
      <Route path="/smart-recommendations" component={SmartRecommendations} />
      <Route path="/subscription-dashboard" component={SubscriptionDashboard} />
      <Route path="/subscription-management" component={SubscriptionManagement} />
      <Route path="/subscription-plans" component={SubscriptionPlans} />
      <Route path="/supplier-invoice" component={SupplierInvoice} />
      <Route path="/support" component={Support} />
      <Route path="/surveys-and-ratings" component={SurveysAndRatings} />
      <Route path="/team-and-roles" component={TeamAndRoles} />
      <Route path="/technical-support" component={TechnicalSupport} />
      <Route path="/terms" component={Terms} />
      <Route path="/terms-of-use" component={TermsOfUse} />
      <Route path="/tracking" component={Tracking} />
      <Route path="/user-dashboard" component={UserDashboard} />
      <Route path="/user-guide" component={UserGuide} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/users-and-roles" component={UsersAndRoles} />
      <Route path="/users-management" component={UsersManagement} />
      <Route path="/variance-analysis" component={VarianceAnalysis} />
      <Route path="/video-tutorials" component={VideoTutorials} />
      <Route path="/voice-video-alerts" component={VoiceVideoAlerts} />
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
