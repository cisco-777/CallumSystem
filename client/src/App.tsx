import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WelcomeLanding } from "@/pages/welcome-landing";
import { AuthFlow } from "@/pages/auth-flow";
import { Dashboard } from "@/pages/dashboard";

type AppState = 'landing' | 'auth' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('msc-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAppState('dashboard');
    }
  }, []);

  const handleEnter = () => {
    setAppState('auth');
  };

  const handleAuthSuccess = () => {
    // Seed products when user first logs in
    fetch('/api/seed-products', { method: 'POST' })
      .then(() => {
        setAppState('dashboard');
      })
      .catch(console.error);
  };

  const handleLogout = () => {
    localStorage.removeItem('msc-user');
    setUser(null);
    setAppState('landing');
  };

  const handleBackToLanding = () => {
    setAppState('landing');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          {appState === 'landing' && (
            <WelcomeLanding onEnter={handleEnter} />
          )}
          
          {appState === 'auth' && (
            <AuthFlow 
              onBack={handleBackToLanding} 
              onSuccess={handleAuthSuccess} 
            />
          )}
          
          {appState === 'dashboard' && (
            <Dashboard onLogout={handleLogout} />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
