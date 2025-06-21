import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('msc-authenticated');
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [setLocation]);

  const isAuthenticated = localStorage.getItem('msc-authenticated');
  
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}