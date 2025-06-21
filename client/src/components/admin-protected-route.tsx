import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('msc-admin-authenticated');
    if (!isAdminAuthenticated) {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  const isAdminAuthenticated = localStorage.getItem('msc-admin-authenticated');
  
  if (!isAdminAuthenticated) {
    return null;
  }

  return <>{children}</>;
}