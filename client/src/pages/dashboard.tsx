import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Product, BasketItem } from '@shared/schema';
import { RightNavigation } from '@/components/right-navigation';

// Import cannabis product images
import zkittlezImg from '@assets/Zkittlez_1751388449553.png';
import blueDreamImg from '@assets/Blue dream_1751388449549.jpg';
import lemonHazeImg from '@assets/Lemon Haze_1751388449553.jpeg';
import weddingCakeImg from '@assets/Wedding Cake_1751388449551.jpg';
import moroccanHashImg from '@assets/morrocan-hash_1752966399715.jpg';
import dryShiftHashImg from '@assets/Hash dry-shift_1752966399715.jpg';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [showBasket, setShowBasket] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if current user is demo member and get user data
  const getCurrentUser = () => {
    const savedUser = localStorage.getItem('msc-user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const isDemoMember = currentUser?.email === 'demo@member.com';

  // Query to get updated user information including membership expiry
  const { data: userData } = useQuery({
    queryKey: ['/api/user', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      return await apiRequest(`/api/users/${currentUser.id}`);
    },
    enabled: !!currentUser?.id
  });

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!userData?.expiryDate) return null;
    const expiryDate = new Date(userData.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  // Map product names to their corresponding images
  const getProductImage = (productName: string) => {
    const nameMap: Record<string, string> = {
      'Zkittlez': zkittlezImg,
      'Blue Dream': blueDreamImg,
      'Lemon Haze': lemonHazeImg,
      'Wedding Cake': weddingCakeImg,
      'Moroccan Hash': moroccanHashImg,
      'Dry-Shift Hash': dryShiftHashImg,
    };
    return nameMap[productName] || null;
  };

  const getQuantity = (productId: number) => quantities[productId] || 1;
  
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    }
  };

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  const { data: basketItems = [] } = useQuery({
    queryKey: ['/api/basket']
  });

  const addToBasketMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      return await apiRequest('/api/basket', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/basket'] });
      toast({
        title: "Added to basket",
        description: "Item has been added to your selection.",
      });
    }
  });

  const removeFromBasketMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest(`/api/basket/${itemId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/basket'] });
    }
  });

  const completeDonationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/basket'] });
      setShowBasket(false);
      toast({
        title: "Order Completed!",
        description: data.message || `Please proceed to the counter with code ${data.pickupCode || 'your pickup code'} for collection.`,
        duration: 8000,
      });
    }
  });

  const basketCount = basketItems.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Width Header - Outside grid layout */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 w-full">
        <div className="max-w-none mx-0 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className="mobile-h2 font-light text-gray-900">Demo Social Club</h1>
            <p className="mobile-text-sm text-gray-500">Member Catalogue</p>
            
            {/* Membership Status Display */}
            {userData && daysUntilExpiry !== null && (
              <div className="mt-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  daysUntilExpiry <= 30 ? 'bg-red-100 text-red-800' :
                  daysUntilExpiry <= 90 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {daysUntilExpiry > 0 ? (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Membership expires in {daysUntilExpiry} days
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Membership expired {Math.abs(daysUntilExpiry)} days ago
                    </>
                  )}
                </div>
                {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Please contact admin for renewal
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              variant="ghost"
              onClick={() => setShowBasket(true)}
              className="relative mobile-btn-md mobile-touch-target"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="mobile-text-sm ml-2 sm:hidden">View Basket</span>
              {basketCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-[#116149] text-white min-w-[20px] h-5 mobile-text-xs">
                  {basketCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 mobile-btn-md mobile-touch-target"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="mobile-text-sm">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Grid Layout - Only for main content */}
      <div className="dashboard-grid-layout">
        {/* Left Spacer - Balances right navigation */}
        <div className="dashboard-left-spacer"></div>
        
        {/* Main Content Area */}
        <div className="dashboard-main-content">
          {/* Right Navigation */}
          <RightNavigation 
            type="member" 
            onLogout={onLogout} 
            onShowBasket={() => setShowBasket(true)} 
            basketCount={basketCount} 
          />

          {/* Products Grid */}
          <main className="max-w-6xl mx-auto mobile-p-3 py-6 sm:py-8 main-content-with-nav">
        {/* Overview Section - Always present but different content for demo/regular members */}
        <div id="overview" className={`mb-8 sm:mb-12 ${isDemoMember ? 'bg-gradient-to-r from-green-50 to-blue-50 rounded-xl mobile-p-4 border-2 border-green-200 shadow-lg' : ''}`}>
          {/* Member Dashboard Section - Only for demo member */}
          {isDemoMember && (
            <>
            {/* Welcome Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="mobile-h2 font-bold text-gray-900 mb-2">Welcome back, John Doe!</h2>
              <p className="mobile-text-base text-gray-600">Your personalized member dashboard</p>
            </div>

            {/* Donation History */}
            <Card className="mb-4 sm:mb-6">
              <CardHeader>
                <CardTitle className="mobile-text-base text-green-700">Your Donation History</CardTitle>
                <CardDescription className="mobile-text-sm">Complete donation timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 sm:left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400"></div>
                  
                  <div className="space-y-8">
                    {/* March 2025 */}
                    <div className="relative flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-lg">
                        MAR
                      </div>
                      <div className="ml-6 flex-1">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                          <h4 className="font-bold text-green-800 text-lg mb-3">March 2025</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <span className="text-gray-700 font-medium">Moroccan Hash</span>
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">2g</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <span className="text-gray-700 font-medium">Dry-Shift Hash</span>
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">1g</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <span className="text-gray-700 font-medium">Wedding Cake</span>
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">2g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* February 2025 */}
                    <div className="relative flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-lg">
                        FEB
                      </div>
                      <div className="ml-6 flex-1">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                          <h4 className="font-bold text-blue-800 text-lg mb-3">February 2025</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <span className="text-gray-700 font-medium">Dry-Shift Hash</span>
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">3g</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <span className="text-gray-700 font-medium">Wedding Cake</span>
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">1g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* January 2025 */}
                    <div className="relative flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-lg">
                        JAN
                      </div>
                      <div className="ml-6 flex-1">
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                          <h4 className="font-bold text-purple-800 text-lg mb-3">January 2025</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <span className="text-gray-700 font-medium">Wedding Cake</span>
                              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">2g</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <span className="text-gray-700 font-medium">Moroccan Hash</span>
                              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">1g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics and Recommendations Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-green-700">Your Analytics</CardTitle>
                  <CardDescription>Donation patterns and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-3">
                      <span className="text-sm text-gray-600">Monthly donation frequency:</span>
                      <p className="font-bold text-green-700 text-lg">3 donations per month</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <span className="text-sm text-gray-600">Preferred categories:</span>
                      <p className="font-bold text-blue-700">Indica 60%, Hash 40%</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <span className="text-sm text-gray-600">Favorite items:</span>
                      <p className="font-bold text-purple-700">Wedding Cake (most frequent)</p>
                      <p className="font-medium text-purple-600">Moroccan Hash (second)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-green-700">Recommended for You</CardTitle>
                  <CardDescription>Based on your donation history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Top Recommendations:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="font-medium text-green-700">Zkittlez</span>
                          <span className="text-sm text-gray-600">- Similar to Wedding Cake</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="font-medium text-blue-700">Blue Dream</span>
                          <span className="text-sm text-gray-600">- Balanced hybrid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-green-700">Upcoming Events</CardTitle>
                <CardDescription>Don't miss these club activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800">Cannabis Education Session</h4>
                    <p className="text-orange-700 text-sm">July 25th - Learn cultivation techniques and plant care</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800">Member Social Hour</h4>
                    <p className="text-green-700 text-sm">July 28th - Connect with fellow members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smooth Transition to Catalogue */}
            <div className="relative mt-12 mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-green-100 text-center">
                  <p className="text-gray-700 font-medium text-base">
                    Ready to make your next donation? Browse our selection below:
                  </p>
                </div>
              </div>
            </div>
            </>
          )}
        </div>


        {/* Category Selection and Products Display */}
        <div id="product-selection" className={`${isDemoMember ? 'mt-4' : 'mt-0'} mb-6 sm:mb-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="mobile-text-lg font-light text-gray-900 mb-2">Available Selection</h2>
              <p className="mobile-text-sm text-gray-600">Choose a category to filter products</p>
            </div>
            
            {/* Category Dropdown */}
            <div className="w-full sm:min-w-[200px] sm:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full mobile-btn-md mobile-touch-target">
                  <SelectValue placeholder="Select category" className="mobile-text-sm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="mobile-text-sm">All Products</SelectItem>
                  <SelectItem value="sativa" className="mobile-text-sm">Sativa</SelectItem>
                  <SelectItem value="indica" className="mobile-text-sm">Indica</SelectItem>
                  <SelectItem value="hybrid" className="mobile-text-sm">Hybrid</SelectItem>
                  <SelectItem value="hash" className="mobile-text-sm">Hash</SelectItem>
                  <SelectItem value="cannabis" className="mobile-text-sm">Cannabis</SelectItem>
                  <SelectItem value="cali-pax" className="mobile-text-sm">Cali Pax</SelectItem>
                  <SelectItem value="edibles" className="mobile-text-sm">Edibles</SelectItem>
                  <SelectItem value="pre-rolls" className="mobile-text-sm">Pre-Rolls</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtered Products Display */}
          {(() => {
            // Filter products based on selected category with corrected hash logic
            const getFilteredProducts = () => {
              switch (selectedCategory) {
                case 'sativa':
                  // Include Sativa cannabis + Hash Sativa products
                  return products.filter((p: Product) => 
                    p.category === 'Sativa' || 
                    (p.name?.toLowerCase().includes('hash') && p.category === 'Sativa')
                  );
                case 'indica':
                  // Include Indica cannabis + Hash Indica products  
                  return products.filter((p: Product) => 
                    p.category === 'Indica' || 
                    (p.name?.toLowerCase().includes('hash') && p.category === 'Indica')
                  );
                case 'hybrid':
                  // Include Hybrid cannabis products
                  return products.filter((p: Product) => p.category === 'Hybrid');
                case 'hash':
                  // Include all hash products
                  return products.filter((p: Product) => p.name?.toLowerCase().includes('hash'));
                case 'cannabis':
                  // Include all flower products (no hash)
                  return products.filter((p: Product) => !p.name?.toLowerCase().includes('hash'));
                case 'cali-pax':
                  // Include Cali Pax products
                  return products.filter((p: Product) => p.productType === 'Cali Pax');
                case 'edibles':
                  // Include Edibles products
                  return products.filter((p: Product) => p.productType === 'Edibles');
                case 'pre-rolls':
                  // Include Pre-Rolls products
                  return products.filter((p: Product) => p.productType === 'Pre-Rolls');
                case 'all':
                default:
                  // Show all products
                  return products;
              }
            };

            const filteredProducts = getFilteredProducts();

            return (
              <div className="mobile-card-grid">
                {filteredProducts.map((product: Product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="w-full h-32 sm:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4 flex items-center justify-center group-hover:bg-gray-300 transition-colors overflow-hidden">
                          {getProductImage(product.name) ? (
                            <img 
                              src={getProductImage(product.name)!} 
                              alt={product.name} 
                              className="w-full h-full object-cover rounded-lg" 
                            />
                          ) : product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="mobile-text-sm text-gray-500">Image Placeholder</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <CardTitle className="mobile-text-base font-medium">{product.name}</CardTitle>
                          <span className="mobile-text-xs text-gray-500 font-mono">#{(product as any).productCode}</span>
                        </div>
                        {product.category && (
                          <Badge variant="secondary" className="w-fit mobile-text-xs">
                            {product.category}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-3 sm:mb-4 mobile-text-sm leading-relaxed">
                          {product.description || 'Premium selection item'}
                        </CardDescription>
                        
                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center mb-3 sm:mb-4 space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                            disabled={getQuantity(product.id) <= 1}
                            className="mobile-touch-target w-8 h-8 sm:w-8 sm:h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <div className="flex flex-col items-center">
                            <span className="mobile-text-base font-medium">{getQuantity(product.id)}g</span>
                            <span className="mobile-text-xs text-gray-500">quantity</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                            disabled={getQuantity(product.id) >= 5}
                            className="mobile-touch-target w-8 h-8 sm:w-8 sm:h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <Button
                          onClick={() => addToBasketMutation.mutate({ 
                            productId: product.id, 
                            quantity: getQuantity(product.id) 
                          })}
                          disabled={addToBasketMutation.isPending}
                          className="w-full bg-[#116149] hover:bg-[#0d4d3a] text-white transition-colors mobile-btn-md mobile-touch-target"
                        >
                          <span className="mobile-text-sm">Add to Selection</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items available at the moment.</p>
          </div>
        )}

        {/* Basket Sidebar */}
        <AnimatePresence>
        {showBasket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowBasket(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="mobile-p-3 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="mobile-text-base font-medium">Your Selection</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBasket(false)}
                    className="mobile-touch-target"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mobile-p-3">
                {basketItems.length === 0 ? (
                  <p className="mobile-text-sm text-gray-500 text-center py-6 sm:py-8">No items selected</p>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      {basketItems.map((item: BasketItem & { product: Product }) => (
                        <div key={item.id} className="flex items-center justify-between mobile-p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="mobile-text-sm font-medium">{item.product?.name}</h4>
                            <p className="mobile-text-xs text-gray-500">Quantity: {item.quantity}g</p>
                            <p className="mobile-text-xs text-gray-400 font-mono">#{(item.product as any)?.productCode}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromBasketMutation.mutate(item.id)}
                            className="mobile-touch-target"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => completeDonationMutation.mutate()}
                      disabled={completeDonationMutation.isPending}
                      className="w-full bg-[#116149] hover:bg-[#0d4d3a] text-white mobile-btn-md mobile-touch-target"
                    >
                      <span className="mobile-text-sm">
                        {completeDonationMutation.isPending ? 'Processing...' : 'Complete Donation'}
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>
          </main>
        </div>
        
        {/* Right Navigation Space */}
        <div className="dashboard-nav-spacer"></div>
      </div>
    </div>
  );
}