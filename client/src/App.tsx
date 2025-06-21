import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginPage } from "@/pages/login";
import { OnboardingPage } from "@/pages/onboarding";
import { SinglePageHome } from "@/pages/single-page-home";
import { MemberAreaPage } from "@/pages/member-area";
import { AdminLoginPage } from "@/pages/admin-login";
import { AdminPage } from "@/pages/admin";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminProtectedRoute } from "@/components/admin-protected-route";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/onboarding">
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        </Route>
        <Route path="/home">
          <ProtectedRoute>
            <SinglePageHome />
          </ProtectedRoute>
        </Route>
        <Route path="/member-area">
          <ProtectedRoute>
            <MemberAreaPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin-login" component={AdminLoginPage} />
        <Route path="/admin">
          <AdminProtectedRoute>
            <AdminPage />
          </AdminProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
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
