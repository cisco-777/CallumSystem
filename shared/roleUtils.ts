// Role checking utility functions
export type UserRole = 'superadmin' | 'admin' | null;

export interface AdminUser {
  id: number;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isSuperAdmin?: boolean;
}

// Check if user is superadmin (admin123@gmail.com)
export function isSuperAdmin(user: AdminUser | null): boolean {
  return user?.role === 'superadmin' || user?.isSuperAdmin === true;
}

// Check if user has admin privileges (regular admin or superadmin)
export function isAdmin(user: AdminUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'superadmin';
}

// Check if user is regular admin (not superadmin)
export function isRegularAdmin(user: AdminUser | null): boolean {
  return user?.role === 'admin';
}

// Get role display name
export function getRoleDisplayName(user: AdminUser | null): string {
  if (!user || !user.role) return 'No Access';
  
  switch (user.role) {
    case 'superadmin':
      return 'Super Administrator';
    case 'admin':
      return 'Administrator';
    default:
      return 'No Access';
  }
}

// Check if user can access superadmin-only features
export function canAccessSuperAdminFeatures(user: AdminUser | null): boolean {
  return isSuperAdmin(user);
}

// Check if user can access admin features
export function canAccessAdminFeatures(user: AdminUser | null): boolean {
  return isAdmin(user);
}

// Helper to identify admin type by email for backward compatibility
export function getAdminTypeByEmail(email: string): 'superadmin' | 'admin' | null {
  if (email === 'admin123@gmail.com') {
    return 'superadmin';
  }
  // For other admin users, we would need to check the database
  // This is just a fallback for email-based checking
  return null;
}