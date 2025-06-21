import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';

export function HomePage() {
  const handleOrderNow = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  const handleDonateNow = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1748031551607', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome To Marbella Social Club
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

        {/* Product Carousel */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-green-100 rounded-lg mb-4"></div>
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
                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-4"></div>
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
                <div className="w-full h-32 bg-gradient-to-br from-yellow-100 to-green-100 rounded-lg mb-4"></div>
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
                <div className="w-full h-32 bg-gradient-to-br from-pink-100 to-green-100 rounded-lg mb-4"></div>
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
      </main>
    </div>
  );
}