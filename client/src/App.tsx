import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import AuthPage from "@/pages/Auth";
import NotFound from "@/pages/not-found";

import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { session, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !session) {
      setLocation("/auth");
    }
  }, [isLoading, session, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex md:hidden items-center p-4 border-b bg-card sticky top-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-mobile-menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar isMobile />
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-display font-bold text-lg">SpendWise</span>
        </header>
        <main className="flex-1 overflow-auto">
          <Component />
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/expenses">
        <ProtectedRoute component={Expenses} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
