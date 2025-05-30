import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  onToggleChat: () => void;
}

export function Navigation({ onToggleChat }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" onClick={closeMobileMenu}>
            <div className="flex items-center cursor-pointer">
              <i className="fas fa-leaf text-cannabis text-2xl mr-3"></i>
              <span className="font-inter font-bold text-xl text-white">ElevateChat</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <button className={`nav-link transition-colors duration-200 ${
                isActive('/') ? 'text-warm-gold' : 'text-white hover:text-warm-gold'
              }`}>
                Home
              </button>
            </Link>
            <Link href="/main-chat">
              <button className={`nav-link transition-colors duration-200 ${
                isActive('/main-chat') ? 'text-warm-gold' : 'text-white hover:text-warm-gold'
              }`}>
                Main Chat
              </button>
            </Link>
            <Link href="/bouncer-chat">
              <button className={`nav-link transition-colors duration-200 ${
                isActive('/bouncer-chat') ? 'text-warm-gold' : 'text-white hover:text-warm-gold'
              }`}>
                Bouncer Chat
              </button>
            </Link>
            <Button 
              onClick={onToggleChat}
              className="bg-cannabis hover:bg-forest text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <i className="fas fa-comments mr-2"></i>Demo Chat
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-white">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link href="/">
                <button 
                  onClick={closeMobileMenu}
                  className={`transition-colors duration-200 text-left py-2 ${
                    isActive('/') ? 'text-warm-gold' : 'text-white hover:text-warm-gold'
                  }`}
                >
                  Home
                </button>
              </Link>
              <Link href="/main-chat">
                <button 
                  onClick={closeMobileMenu}
                  className={`transition-colors duration-200 text-left py-2 ${
                    isActive('/main-chat') ? 'text-warm-gold' : 'text-white hover:text-warm-gold'
                  }`}
                >
                  Main Chat
                </button>
              </Link>
              <Link href="/bouncer-chat">
                <button 
                  onClick={closeMobileMenu}
                  className={`transition-colors duration-200 text-left py-2 ${
                    isActive('/bouncer-chat') ? 'text-warm-gold' : 'text-white hover:text-warm-gold'
                  }`}
                >
                  Bouncer Chat
                </button>
              </Link>
              <Button 
                onClick={() => {
                  onToggleChat();
                  closeMobileMenu();
                }}
                className="bg-cannabis hover:bg-forest text-white px-4 py-2 rounded-lg transition-all duration-200 text-left mt-2"
              >
                <i className="fas fa-comments mr-2"></i>Demo Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
