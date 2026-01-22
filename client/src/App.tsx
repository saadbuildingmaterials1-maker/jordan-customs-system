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
import AlertsManagement from "@/pages/AlertsManagement"
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
