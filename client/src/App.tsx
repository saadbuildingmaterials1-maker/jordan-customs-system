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
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotificationCenter = lazy(() => import("@/pages/NotificationCenter"));
const PaymentsManagement = lazy(() => import("@/pages/PaymentsManagement").then((m: any) => ({ default: m.PaymentsManagement || m.default })));
const Checkout = lazy(() => import("@/pages/Checkout"));
const SmartDashboard = lazy(() => import("@/pages/SmartDashboard"));
const FactoriesAndInvoices = lazy(() => import("@/pages/FactoriesAndInvoices"));
const ReportsAndExports = lazy(() => import("@/pages/ReportsAndExports"));
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
const DownloadPage = lazy(() => import('@/pages/DownloadPage'));
const About = lazy(() => import('@/pages/About'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('@/pages/TermsOfUse'));
const NotificationsCenter = lazy(() => import('@/pages/NotificationsCenter'));
const ContainerTracking = lazy(() => import('@/pages/ContainerTracking'));
const PDFImport = lazy(() => import('@/pages/PDFImport'));
const BackupAndNotifications = lazy(() => import('./pages/BackupAndNotifications'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const BankAccountManagement = lazy(() => import('@/pages/BankAccountManagement'));
const NotificationsManagement = lazy(() => import('@/pages/NotificationsManagement'));
const Reports = lazy(() => import('@/pages/Reports'));
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const VideoTutorials = lazy(() => import('@/pages/VideoTutorials'));
const NotFound = lazy(() => import('@/pages/NotFound'));
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
      <Route path={"/"} component={Home} />
      <Route path={"/declarations"} component={DeclarationsList} />
      <Route path={"/declarations/new"} component={DeclarationForm} />
      <Route path={"/declarations/new/advanced"} component={DeclarationFormAdvanced} />
      <Route path={"/declarations/:id"} component={DeclarationDetail} />
      <Route path={"/declarations/:id/items"} component={ItemsManagement} />
      <Route path={"/declarations/:id/variance"} component={VarianceAnalysis} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/accounting"} component={AccountingDashboard} />
      <Route path={"/reports"} component={AdvancedReports} />
      <Route path={"/alerts"} component={AlertsManagement} />
      <Route path={"/supplier-invoice"} component={SupplierInvoice} />
      <Route path={"/shipping"} component={ShippingPage} />
      <Route path={"/expenses"} component={ExpensesPage} />
      <Route path={"/:id/customs-declaration"} component={AdvancedCustomsDeclaration} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/notifications"} component={NotificationCenter} />
      <Route path={"/payments"} component={PaymentsManagement} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/smart-dashboard"} component={SmartDashboard} />
      <Route path={"/factories-invoices"} component={FactoriesAndInvoices} />
      <Route path={"/reports-exports"} component={ReportsAndExports} />
      <Route path={"/alerts-notifications"} component={AlertsAndNotifications} />
      <Route path={"/users-roles"} component={UsersAndRoles} />
      <Route path="/settings" component={SettingsAndSecurity} />
      <Route path="/shipping-management" component={ShippingManagement} />
      <Route path="/expenses-management" component={ExpensesManagement} />
      <Route path="/advanced-customs" component={AdvancedCustomsDeclarationPage} />
      <Route path="/reports-page" component={ReportsPage} />
      <Route path="/users-management" component={UsersManagement} />
      <Route path="/settings-page" component={SettingsPage} />
      <Route path="/advanced-search" component={AdvancedSearch} />
      <Route path="/download" component={DownloadPage} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/notifications-center" component={NotificationsCenter} />
      <Route path="/tracking" component={ContainerTracking} />
      <Route path="/pdf-import" component={PDFImport} />
        <Route path="/backup-notifications" component={BackupAndNotifications} />
        <Route path="/payment" component={PaymentPage} />
      <Route path="/bank-accounts" component={BankAccountManagement} />
      <Route path="/notifications-management" component={NotificationsManagement} />
      <Route path="/reports-analytics" component={Reports} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/tutorials" component={VideoTutorials} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
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
