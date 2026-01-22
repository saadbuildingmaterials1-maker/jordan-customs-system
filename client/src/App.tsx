import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import DeclarationForm from "@/pages/DeclarationForm";
import DeclarationFormAdvanced from "@/pages/DeclarationFormAdvanced";
import DeclarationDetail from "@/pages/DeclarationDetail";
import DeclarationsList from "@/pages/DeclarationsList";
import ItemsManagement from "@/pages/ItemsManagement";
import VarianceAnalysis from "@/pages/VarianceAnalysis";
import AdminPanel from "@/pages/AdminPanel";
import AccountingDashboard from "@/pages/AccountingDashboard";
import AdvancedReports from "@/pages/AdvancedReports";
import AlertsManagement from "@/pages/AlertsManagement";
import SupplierInvoice from "@/pages/SupplierInvoice";
import ShippingPage from "@/pages/ShippingPage";
import ExpensesPage from "@/pages/ExpensesPage";
import AdvancedCustomsDeclaration from "@/pages/AdvancedCustomsDeclaration";
import Dashboard from "@/pages/Dashboard";
import NotificationCenter from "@/pages/NotificationCenter";
import { PaymentsManagement } from "@/pages/PaymentsManagement";
import Checkout from "@/pages/Checkout";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";

function Router() {
  return (
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
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
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
