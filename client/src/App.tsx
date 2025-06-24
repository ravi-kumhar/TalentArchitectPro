import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Recruitment from "@/pages/recruitment";
import Candidates from "@/pages/candidates";
import Interviews from "@/pages/interviews";
import Onboarding from "@/pages/onboarding";
import Employees from "@/pages/employees";
import Performance from "@/pages/performance";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <MainLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/recruitment" component={Recruitment} />
          <Route path="/candidates" component={Candidates} />
          <Route path="/interviews" component={Interviews} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/employees" component={Employees} />
          <Route path="/performance" component={Performance} />
          <Route path="/analytics" component={Analytics} />
        </MainLayout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
