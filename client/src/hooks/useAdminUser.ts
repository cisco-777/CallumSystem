import { useState, useEffect } from 'react';
import type { AdminUser } from '@shared/roleUtils';

// Hook to get current admin user data from localStorage
export function useAdminUser() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const adminData = localStorage.getItem('msc-admin-data');
      if (adminData) {
        const parsedData = JSON.parse(adminData);
        setAdminUser(parsedData);
      }
    } catch (error) {
      console.error('Error parsing admin data:', error);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('msc-admin-authenticated');
    localStorage.removeItem('msc-admin-data');
    setAdminUser(null);
  };

  const isSuperAdmin = adminUser?.role === 'superadmin' || adminUser?.isSuperAdmin === true;
  const isAdmin = adminUser?.role === 'admin' || adminUser?.role === 'superadmin';

  return {
    adminUser,
    isLoading,
    isSuperAdmin,
    isAdmin,
    logout,
    // Role checking functions
    canAccessSuperAdminFeatures: () => isSuperAdmin,
    canAccessAdminFeatures: () => isAdmin,
    getRoleDisplayName: () => {
      if (!adminUser || !adminUser.role) return 'No Access';
      return adminUser.role === 'superadmin' ? 'Super Administrator' : 'Administrator';
    }
  };
}