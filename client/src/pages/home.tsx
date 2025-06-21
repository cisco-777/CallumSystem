import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, Star, Users, Package } from 'lucide-react';

export function HomePage() {
  const [, setLocation] = useLocation();

  const handleOrderNow = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('msc-authenticated');
    localStorage.removeItem('msc-first-time');
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-[#116149]">Marbella Social Club</h1>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation('/admin')}
                variant="outline"
                size="sm"
                className="text-[#116149] border-[#116149] hover:bg-[#116149] hover:text-white"
              >
                Admin
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome Back to Your Private Club Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Order your favorite products, check updates, and manage your account — all in one place.
          </p>
          <Button
            onClick={handleOrderNow}
            size="lg"
            className="bg-[#116149] hover:bg-[#0d4d3a] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Order Now →
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-[#116149]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#116149]" />
              </div>
              <CardTitle className="text-lg">Premium Products</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Hand-picked selection of our finest options
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-[#116149]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#116149]" />
              </div>
              <CardTitle className="text-lg">Private & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discreet experience for members only
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-[#116149]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#116149]" />
              </div>
              <CardTitle className="text-lg">Fast Pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                No queues. No delays.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-[#116149]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#116149]" />
              </div>
              <CardTitle className="text-lg">Member Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Direct contact with our staff when needed
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need help or have a question? Reach out privately.
            </p>
            <Button
              onClick={() => window.open('https://wa.me/+34607813795', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Contact Support via WhatsApp
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}