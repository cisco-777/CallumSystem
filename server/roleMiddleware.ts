import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Extend Request type to include admin user information
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: number;
        email: string;
        role: string;
        isSuperAdmin: boolean;
      };
    }
  }
}

// Middleware to check if request is from an admin user
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // Check for admin header (existing method)
    const isAdmin = req.headers['x-admin'] === 'true';
    if (isAdmin) {
      return next(); // Allow existing admin access pattern
    }

    // Check for admin authentication in headers or session
    const adminEmail = req.headers['x-admin-email'] as string;
    if (!adminEmail) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get user from database and verify admin role
    const user = await storage.getUserByEmail(adminEmail);
    if (!user || !user.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach admin user info to request for use in route handlers
    req.adminUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.role === 'superadmin'
    };

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Middleware to check if request is from a superadmin user
export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // First check if user has admin privileges
    await requireAdmin(req, res, () => {
      // Then check if user is superadmin
      if (!req.adminUser || !req.adminUser.isSuperAdmin) {
        return res.status(403).json({ error: 'Super admin access required' });
      }
      next();
    });
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Helper function to check admin role from email
export async function checkAdminRole(email: string): Promise<{
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: string | null;
}> {
  try {
    const user = await storage.getUserByEmail(email);
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isSuperAdmin = user?.role === 'superadmin';
    
    return {
      isAdmin,
      isSuperAdmin,
      role: user?.role || null
    };
  } catch (error) {
    console.error('Role check error:', error);
    return {
      isAdmin: false,
      isSuperAdmin: false,
      role: null
    };
  }
}

// Helper function specifically for admin123@gmail.com identification
export async function identifyAdminType(email: string): Promise<'superadmin' | 'admin' | null> {
  if (email === 'admin123@gmail.com') {
    return 'superadmin';
  }
  
  try {
    const user = await storage.getUserByEmail(email);
    if (user?.role === 'admin') {
      return 'admin';
    }
    if (user?.role === 'superadmin') {
      return 'superadmin';
    }
    return null;
  } catch (error) {
    console.error('Admin type identification error:', error);
    return null;
  }
}