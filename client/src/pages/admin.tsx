import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Star, Settings } from 'lucide-react';

export function AdminPage() {
  const [, setLocation] = useLocation();

  const handleBouncerPanel = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748302315388', '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('msc-admin-authenticated');
    setLocation('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-[#116149]">Marbella Social Club - Admin Panel</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor club statistics and manage operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              <Users className="h-4 w-4 text-[#116149]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">134</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Orders This Week</CardTitle>
              <ShoppingCart className="h-4 w-4 text-[#116149]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">92</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Most Requested</CardTitle>
              <Star className="h-4 w-4 text-[#116149]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">Zkittlez 5g</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleBouncerPanel}
              size="lg"
              className="bg-[#116149] hover:bg-[#0d4d3a] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Access Bouncer Panel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}