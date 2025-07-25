import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Calendar, TrendingUp, Heart, Bell, LogOut, BarChart3 } from 'lucide-react';

interface DonationRecord {
  id: number;
  items: Array<{
    productId: number;
    productName: string;
    category: string;
    productCode: string;
  }>;
  quantities: Array<{
    productId: number;
    quantity: number;
  }>;
  status: string;
  createdAt: string;
}

export function MemberDashboard() {
  const [, setLocation] = useLocation();

  const { data: donationHistory = [] } = useQuery<DonationRecord[]>({
    queryKey: ['/api/member/donations']
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  // Analytics calculations
  const analytics = useMemo(() => {
    const last3Months = donationHistory.filter(donation => {
      const donationDate = new Date(donation.createdAt);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return donationDate >= threeMonthsAgo;
    });

    const categoryCount = { Indica: 0, Sativa: 0, Hybrid: 0 };
    const itemFrequency: Record<string, number> = {};
    let totalDonations = 0;

    last3Months.forEach(donation => {
      totalDonations++;
      donation.items.forEach(item => {
        categoryCount[item.category as keyof typeof categoryCount]++;
        itemFrequency[item.productName] = (itemFrequency[item.productName] || 0) + 1;
      });
    });

    const favoriteItems = Object.entries(itemFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const preferredCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Indica';

    return {
      totalDonations,
      monthlyFrequency: (totalDonations / 3).toFixed(1),
      preferredCategory,
      favoriteItems,
      categoryBreakdown: categoryCount
    };
  }, [donationHistory]);

  // Recommendations based on donation history
  const recommendations = useMemo(() => {
    const donatedProductIds = new Set(
      donationHistory.flatMap(d => d.items.map(item => item.productId))
    );

    return products
      .filter((product: any) => !donatedProductIds.has(product.id))
      .filter((product: any) => 
        product.category === analytics.preferredCategory || 
        analytics.favoriteItems.some(([name]) => 
          product.name.toLowerCase().includes(name.toLowerCase().split(' ')[0])
        )
      )
      .slice(0, 3);
  }, [products, donationHistory, analytics.preferredCategory, analytics.favoriteItems]);

  const handleLogout = () => {
    localStorage.removeItem('msc-member-authenticated');
    setLocation('/');
  };

  const upcomingEvents = [
    { date: 'July 25, 2025', title: 'Cannabis Education Workshop', type: 'Educational' },
    { date: 'August 3, 2025', title: 'Member Appreciation Night', type: 'Social' },
    { date: 'August 15, 2025', title: 'Terpene Tasting Session', type: 'Educational' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, John Doe</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalDonations}</div>
              <p className="text-xs text-gray-500">Last 3 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Frequency</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.monthlyFrequency}</div>
              <p className="text-xs text-gray-500">Donations per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Preferred Category</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.preferredCategory}</div>
              <p className="text-xs text-gray-500">Most donated for</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Favorite Item</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.favoriteItems[0]?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-gray-500">
                {analytics.favoriteItems[0]?.[1] || 0} donations
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Donation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donationHistory.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {new Date(donation.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </h4>
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        Completed
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {donation.items.map((item, index) => {
                        const quantity = donation.quantities.find(q => q.productId === item.productId)?.quantity || 1;
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.productName}</span>
                            <span className="text-gray-500">{quantity}g donated for</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recommended for You
              </CardTitle>
              <p className="text-sm text-gray-600">Based on your donation patterns</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((product: any) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <Badge className="mt-2" variant="outline">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Suggested because you prefer {analytics.preferredCategory} strains
                    </p>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No new recommendations at this time
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Upcoming Club Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Notice:</strong> All contributions are donations to support our non-profit social club. 
            Your support helps us maintain our community space and educational programs.
          </p>
        </div>
      </div>
    </div>
  );
}