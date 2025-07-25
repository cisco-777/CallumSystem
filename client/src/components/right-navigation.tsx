import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  X, 
  User, 
  History, 
  LogOut, 
  Settings, 
  BarChart3, 
  Users, 
  ShieldCheck,
  Home,
  Package
} from 'lucide-react';

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface RightNavigationProps {
  type: 'member' | 'admin';
  onLogout: () => void;
  currentUser?: string;
  onNavigate?: (section: string) => void;
}

export function RightNavigation({ type, onLogout, currentUser, onNavigate }: RightNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const memberNavItems: NavigationItem[] = [
    {
      icon: Home,
      label: 'Dashboard',
      onClick: () => {
        onNavigate?.('dashboard');
        setIsOpen(false);
      }
    },
    {
      icon: User,
      label: 'Profile',
      onClick: () => {
        onNavigate?.('profile');
        setIsOpen(false);
      }
    },
    {
      icon: History,
      label: 'Order History',
      onClick: () => {
        onNavigate?.('history');
        setIsOpen(false);
      }
    },
    {
      icon: Package,
      label: 'My Orders',
      onClick: () => {
        onNavigate?.('orders');
        setIsOpen(false);
      }
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: () => {
        onLogout();
        setIsOpen(false);
      },
      variant: 'destructive'
    }
  ];

  const adminNavItems: NavigationItem[] = [
    {
      icon: BarChart3,
      label: 'Dashboard',
      onClick: () => {
        onNavigate?.('dashboard');
        setIsOpen(false);
      }
    },
    {
      icon: Users,
      label: 'User Management',
      onClick: () => {
        onNavigate?.('users');
        setIsOpen(false);
      }
    },
    {
      icon: Package,
      label: 'Inventory',
      onClick: () => {
        onNavigate?.('inventory');
        setIsOpen(false);
      }
    },
    {
      icon: ShieldCheck,
      label: 'Order Control',
      onClick: () => {
        onNavigate?.('orders');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => {
        onNavigate?.('settings');
        setIsOpen(false);
      }
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: () => {
        onLogout();
        setIsOpen(false);
      },
      variant: 'destructive'
    }
  ];

  const navItems = type === 'member' ? memberNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 sm:hidden mobile-touch-target bg-white shadow-lg border-2"
      >
        <Menu className="w-4 h-4" />
        <span className="mobile-text-xs ml-1">Menu</span>
      </Button>

      {/* Desktop Navigation Sidebar */}
      <div className="hidden sm:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <Card className="w-64 shadow-lg border-2 border-green-200 bg-white/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                {type === 'member' ? (
                  <User className="w-6 h-6 text-green-600" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {type === 'member' ? 'Member Portal' : 'Admin Panel'}
              </h3>
              {currentUser && (
                <p className="text-xs text-gray-600 mt-1">{currentUser}</p>
              )}
            </div>
            
            <Separator className="mb-4" />
            
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <Button
                  key={index}
                  variant={item.variant === 'destructive' ? 'destructive' : 'ghost'}
                  size="sm"
                  onClick={item.onClick}
                  className={`w-full justify-start text-left ${
                    item.variant === 'destructive' 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-green-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto sm:hidden"
            >
              <div className="p-4 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      {type === 'member' ? (
                        <User className="w-5 h-5 text-green-600" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="mobile-text-base font-semibold text-gray-900">
                        {type === 'member' ? 'Member Portal' : 'Admin Panel'}
                      </h3>
                      {currentUser && (
                        <p className="mobile-text-xs text-gray-600">{currentUser}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="mobile-touch-target"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <Button
                      key={index}
                      variant={item.variant === 'destructive' ? 'destructive' : 'ghost'}
                      size="lg"
                      onClick={item.onClick}
                      className={`w-full justify-start text-left mobile-touch-target ${
                        item.variant === 'destructive' 
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-green-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="mobile-text-sm">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}