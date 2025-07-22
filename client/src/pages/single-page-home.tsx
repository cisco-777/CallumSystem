import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { CheckCircle, Heart, Gift, User, Calendar, Users } from 'lucide-react';
import marbellaImage from '@assets/Marbella_1750505556334.jpg';
import loungeImage from '@assets/lounge_1750505580573.jpg';

export function SinglePageHome() {
  const handleOrderNow = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  const handleDonateNow = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  const handleReorder = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Home Section */}
      <section 
        id="home" 
        className="pt-16 pb-20 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${marbellaImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome To La Cultura Social Club
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Order your favorite products, check updates, and manage your account — all in one place.
            </p>
            <Button
              onClick={handleOrderNow}
              size="lg"
              className="bg-[#116149] hover:bg-[#0d4d3a] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Donate Now →
            </Button>
          </div>
        </div>
      </section>

      {/* Take a Look Inside Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🎥 Take a Look Inside</h2>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl mb-6">
            <iframe
              src="https://www.youtube.com/embed/B6NFTno59zw"
              title="Club Interior Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <p className="text-gray-600 text-lg">
            Here's a peek into the vibe and style of our club — stay tuned for more.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Top Featured Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
                <CardTitle className="text-lg">Zkittlez</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Premium hybrid strain with fruity flavors and balanced effects
                </CardDescription>
                <Button 
                  onClick={handleDonateNow}
                  className="bg-[#116149] hover:bg-[#0d4d3a] text-white w-full"
                >
                  Donate Now →
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
                <CardTitle className="text-lg">Blue Dream</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Sativa-dominant hybrid known for its gentle cerebral effects
                </CardDescription>
                <Button 
                  onClick={handleDonateNow}
                  className="bg-[#116149] hover:bg-[#0d4d3a] text-white w-full"
                >
                  Donate Now →
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
                <CardTitle className="text-lg">Lemon Haze</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Energizing sativa with bright citrus aroma and uplifting effects
                </CardDescription>
                <Button 
                  onClick={handleDonateNow}
                  className="bg-[#116149] hover:bg-[#0d4d3a] text-white w-full"
                >
                  Donate Now →
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
                <CardTitle className="text-lg">Wedding Cake</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Indica-dominant hybrid with sweet vanilla flavors and relaxing effects
                </CardDescription>
                <Button 
                  onClick={handleDonateNow}
                  className="bg-[#116149] hover:bg-[#0d4d3a] text-white w-full"
                >
                  Donate Now →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Member Area Section */}
      <section id="member-area" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Member Dashboard</h2>
            <img
              src={loungeImage}
              alt="Club lounge interior"
              className="w-full h-64 object-cover rounded-2xl shadow-xl mb-8"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Past Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#116149] mr-2" />
                  Past Donations
                </CardTitle>
                <CardDescription>Your recent club donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                    <div>
                      <span className="font-medium text-gray-900">Zkittlez</span>
                      <p className="text-sm text-gray-600">Donated: 12 June 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                    <div>
                      <span className="font-medium text-gray-900">Banana OG</span>
                      <p className="text-sm text-gray-600">Donated: 6 June 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                    <div>
                      <span className="font-medium text-gray-900">Wedding Cake</span>
                      <p className="text-sm text-gray-600">Donated: 30 May 2025</p>
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
                  🎂 Birthday Gift Tracker
                </CardTitle>
                <CardDescription>Your birthday and club gift status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <span className="font-medium text-gray-900 text-lg">Alex Johnson</span>
                      <p className="text-sm text-gray-600">August 15, 2025</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">Gift Ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Upcoming Events</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
                <CardTitle className="text-xl">Welcome Night - July 10th</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Meet other members and enjoy exclusive samples.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
                <CardTitle className="text-xl">420 Celebration - April 20th</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Live music, free gifts, and club updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
                <CardTitle className="text-xl">Autumn Tasting - September 15th</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Explore our latest strains with guided tastings.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}