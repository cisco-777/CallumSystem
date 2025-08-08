import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('msc-authenticated');
    localStorage.removeItem('msc-admin-authenticated');
    setLocation('/');
  };

  const handleOrder = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => scrollToSection('home')}
            className="flex items-center cursor-pointer"
          >
            <span className="font-bold text-xl text-[#116149]">Demo Social Club</span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('home')}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
            >
              Products
            </button>
            <button 
              onClick={() => scrollToSection('member-area')}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
            >
              Member Area
            </button>
            <button 
              onClick={() => scrollToSection('events')}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
            >
              Events
            </button>
            <Button 
              onClick={handleOrder}
              className="bg-[#116149] hover:bg-[#0d4d3a] text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Donate
            </Button>
            <button 
              onClick={() => setLocation('/admin-login')}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
            >
              Admin
            </button>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-gray-700 hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#116149] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <div className="flex flex-col space-y-2 pt-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('products')}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection('member-area')}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
              >
                Member Area
              </button>
              <button 
                onClick={() => scrollToSection('events')}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
              >
                Events
              </button>
              <Button 
                onClick={() => {
                  handleOrder();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-[#116149] hover:bg-[#0d4d3a] text-white mx-3 mt-2"
              >
                Donate
              </Button>
              <button 
                onClick={() => {
                  setLocation('/admin-login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#116149] transition-colors"
              >
                Admin
              </button>
              <Button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className="mx-3 text-gray-700 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}