import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { CheckCircle, Heart, Gift, User } from 'lucide-react';

export function MemberAreaPage() {
  const handleReorder = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Dashboard</h1>
          <p className="text-gray-600">Your personal club experience overview</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Past Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#116149] mr-2" />
                Past Orders
              </CardTitle>
              <CardDescription>Your recent club orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Zkittlez</span>
                    <p className="text-sm text-gray-600">Ordered: 12 June 2025</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Banana OG</span>
                    <p className="text-sm text-gray-600">Ordered: 6 June 2025</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">Wedding Cake</span>
                    <p className="text-sm text-gray-600">Ordered: 30 May 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 text-[#116149] mr-2" />
                Saved Products
              </CardTitle>
              <CardDescription>Your favorite selections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Lemon Haze</h4>
                      <p className="text-sm text-gray-600">Saved on 10 June</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-green-100 rounded-lg"></div>
                  </div>
                  <Button 
                    onClick={handleReorder}
                    size="sm" 
                    className="bg-[#116149] hover:bg-[#0d4d3a] text-white w-full"
                  >
                    Reorder Now
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Purple Kush</h4>
                      <p className="text-sm text-gray-600">Saved on 5 June</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-green-100 rounded-lg"></div>
                  </div>
                  <Button 
                    onClick={handleReorder}
                    size="sm" 
                    className="bg-[#116149] hover:bg-[#0d4d3a] text-white w-full"
                  >
                    Reorder Now
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Blue Dream</h4>
                      <p className="text-sm text-gray-600">Saved on 1 June</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg"></div>
                  </div>
                  <Button 
                    onClick={handleReorder}
                    size="sm" 
                    className="bg-[#116149] hover:bg-[#0d4d3a] text-white w-full"
                  >
                    Reorder Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Member Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 text-[#116149] mr-2" />
                Member Notes
              </CardTitle>
              <CardDescription>Your personalized preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-900">Prefers fruity strains</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-gray-900">Requested edibles during last visit</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-900">Referred by: Jake M.</span>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-900">Member since Feb 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Birthday Gift Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="w-5 h-5 text-[#116149] mr-2" />
                Birthday Gift Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-dashed border-yellow-300">
                <Gift className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-800 font-medium mb-2">🎁 Special Birthday Gift Available!</p>
                <p className="text-sm text-gray-600">
                  You're eligible for a special gift during your birthday month. 
                  Ask in person or via chat to claim it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}