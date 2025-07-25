import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Settings, 
  LogOut, 
  ShoppingBag, 
  BarChart3, 
  Users, 
  Package,
  QrCode,
  Calendar,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RightNavigationProps {
  type: 'member' | 'admin';
  onLogout?: () => void;
  onShowBasket?: () => void;
  basketCount?: number;
}

export function RightNavigation({ type, onLogout, onShowBasket, basketCount = 0 }: RightNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const memberNavItems = [
    { icon: Home, label: 'Dashboard', href: '/member-dashboard' },
    { icon: ShoppingBag, label: 'Catalogue', href: '/dashboard' },
    { icon: QrCode, label: 'QR Code', action: 'qr' },
    { icon: Calendar, label: 'Events', action: 'events' },
    { icon: User, label: 'Profile', action: 'profile' },
    { icon: LogOut, label: 'Logout', action: 'logout' }
  ];

  const adminNavItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/admin-dashboard' },
    { icon: Users, label: 'Members', action: 'members' },
    { icon: Package, label: 'Inventory', action: 'inventory' },
    { icon: QrCode, label: 'QR Scanner', action: 'qr-scanner' },
    { icon: Bell, label: 'Alerts', action: 'alerts' },
    { icon: Settings, label: 'Settings', action: 'settings' },
    { icon: LogOut, label: 'Logout', action: 'logout' }
  ];

  const navItems = type === 'member' ? memberNavItems : adminNavItems;

  const handleItemClick = (item: any) => {
    if (item.action === 'logout' && onLogout) {
      onLogout();
    } else if (item.action === 'qr' && onShowBasket) {
      onShowBasket();
    } else if (item.href) {
      window.location.href = item.href;
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation - Fixed Right Side */}
      <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-2">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleItemClick(item)}
                className="w-12 h-12 p-0 hover:bg-gray-100 relative group"
                title={item.label}
              >
                <item.icon className="w-4 h-4" />
                {item.label === 'Catalogue' && basketCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-[#116149] text-white min-w-[16px] h-4 text-xs p-0 flex items-center justify-center">
                    {basketCount}
                  </Badge>
                )}
                {/* Tooltip */}
                <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </div>
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="lg:hidden fixed top-16 right-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[180px]"
            >
              <nav className="p-2">
                {navItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleItemClick(item)}
                    className="w-full justify-start mobile-touch-target mobile-text-sm"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {item.label === 'Catalogue' && basketCount > 0 && (
                      <Badge className="ml-auto bg-[#116149] text-white min-w-[20px] h-5 text-xs">
                        {basketCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}