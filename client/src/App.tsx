import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WelcomeLanding } from "@/pages/welcome-landing";
import { AuthFlow } from "@/pages/auth-flow";
import { Dashboard } from "@/pages/dashboard";
import { AdminDashboard } from "@/pages/admin-dashboard";
import { FakeAdminDemo } from "@/pages/fake-admin-demo";
import { MemberDashboard } from "@/pages/member-dashboard";
import { PendingApproval } from "@/pages/pending-approval";

type AppState = 'landing' | 'auth' | 'dashboard' | 'admin' | 'fake-demo' | 'member-dashboard' | 'pending-approval';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check URL for fake admin demo
    if (window.location.pathname === '/demo/fake-admin') {
      setAppState('fake-demo');
      return;
    }

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for pending approval status
    if (urlParams.get('status') === 'pending') {
      setAppState('pending-approval');
      return;
    }

    // Check URL for admin access
    if (urlParams.get('admin') === 'true') {
      const adminData = localStorage.getItem('msc-admin');
      if (adminData) {
        setAppState('admin');
      } else {
        const email = prompt('Admin Email:');
        const password = prompt('Admin Password:');
        
        if (email === 'admin123@gmail.com' && password === 'admin123') {
          localStorage.setItem('msc-admin', JSON.stringify({ email, role: 'admin' }));
          setAppState('admin');
        } else {
          alert('Invalid admin credentials');
          setAppState('landing');
        }
      }
      return;
    }

    // Check if member is logged in
    const memberAuth = localStorage.getItem('msc-member-authenticated');
    if (memberAuth) {
      setAppState('member-dashboard');
      return;
    }

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
    localStorage.removeItem('msc-pending-user');
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
          
          {appState === 'admin' && (
            <AdminDashboard />
          )}
          
          {appState === 'fake-demo' && (
            <FakeAdminDemo />
          )}
          
          {appState === 'member-dashboard' && (
            <MemberDashboard />
          )}
          
          {appState === 'pending-approval' && (
            <PendingApproval 
              onLogout={handleLogout}
              userEmail={(() => {
                const pendingUser = localStorage.getItem('msc-pending-user');
                return pendingUser ? JSON.parse(pendingUser).email : undefined;
              })()}
            />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
