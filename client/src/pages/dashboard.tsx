import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, X, User, LogOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Product, BasketItem } from '@shared/schema';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if current user is demo member
  const isDemoMember = (() => {
    const savedUser = localStorage.getItem('msc-user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.email === 'demo@member.com';
    }
    return false;
  })();

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
        title: "Donation Complete",
        description: data.message || `Your donation has been processed successfully! Please visit our counter with code ${data.pickupCode} to collect your items.`,
        duration: 8000,
      });
    }
  });

  const basketCount = basketItems.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-900">La Cultura Social Club</h1>
            <p className="text-sm text-gray-500">Member Catalogue</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setShowBasket(true)}
              className="relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {basketCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-[#116149] text-white min-w-[20px] h-5 text-xs">
                  {basketCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Member Dashboard Section - Only for demo member */}
        {isDemoMember && (
          <div className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-200 shadow-lg">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Demo Member!</h2>
              <p className="text-gray-600 text-lg">Your personalized member dashboard</p>
            </div>

            {/* Donation History */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-green-700">Your Donation History</CardTitle>
                <CardDescription>Complete donation timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400"></div>
                  
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
          </div>
        )}

        {/* Seamless transition with better spacing */}
        <div className={`${isDemoMember ? 'mt-4' : 'mt-0'} mb-8`}>
          <h2 className="text-xl font-light text-gray-900 mb-2">Available Selection</h2>
          <p className="text-gray-600">Curated items organized by category</p>
        </div>

        {/* Categorized Product Display */}
        {(() => {
          // Organize products by category
          const sativaProducts = products.filter((p: Product) => p.category === 'Sativa');
          const hybridProducts = products.filter((p: Product) => p.category === 'Hybrid');
          const hashProducts = products.filter((p: Product) => 
            p.name?.toLowerCase().includes('hash') || p.category?.toLowerCase().includes('hash')
          );
          const cannabisProducts = products.filter((p: Product) => p.category === 'Indica');

          const categories = [
            {
              title: 'Sativa',
              description: 'Energizing and uplifting effects',
              products: sativaProducts,
              color: 'green'
            },
            {
              title: 'Hybrid',
              description: 'Balanced effects combining the best of both',
              products: hybridProducts,
              color: 'purple'
            },
            {
              title: 'Hash',
              description: 'Traditional concentrates with potent effects',
              products: hashProducts,
              color: 'amber'
            },
            {
              title: 'Cannabis',
              description: 'Relaxing and calming indica strains',
              products: cannabisProducts,
              color: 'blue'
            }
          ];

          return categories.map((category, categoryIndex) => {
            if (category.products.length === 0) return null;

            const colorClasses = {
              green: {
                header: 'bg-green-50 border-green-200',
                title: 'text-green-800',
                description: 'text-green-600'
              },
              purple: {
                header: 'bg-purple-50 border-purple-200',
                title: 'text-purple-800',
                description: 'text-purple-600'
              },
              amber: {
                header: 'bg-amber-50 border-amber-200',
                title: 'text-amber-800',
                description: 'text-amber-600'
              },
              blue: {
                header: 'bg-blue-50 border-blue-200',
                title: 'text-blue-800',
                description: 'text-blue-600'
              }
            };

            const colors = colorClasses[category.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                className="mb-12"
              >
                {/* Category Header */}
                <div className={`${colors.header} border rounded-xl p-6 mb-6`}>
                  <h3 className={`text-2xl font-bold ${colors.title} mb-2`}>
                    {category.title}
                  </h3>
                  <p className={`${colors.description} text-sm`}>
                    {category.description}
                  </p>
                </div>

                {/* Products Grid for this category */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.products.map((product: Product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                        <CardHeader className="pb-4">
                          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center group-hover:bg-gray-300 transition-colors overflow-hidden">
                            {getProductImage(product.name) ? (
                              <img 
                                src={getProductImage(product.name)!} 
                                alt={product.name} 
                                className="w-full h-full object-cover rounded-lg" 
                              />
                            ) : product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-gray-500 text-sm">Image Placeholder</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
                            <span className="text-xs text-gray-500 font-mono">#{(product as any).productCode}</span>
                          </div>
                          {product.category && (
                            <Badge variant="secondary" className="w-fit">
                              {product.category}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4 text-sm leading-relaxed">
                            {product.description || 'Premium selection item'}
                          </CardDescription>
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center justify-center mb-4 space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                              disabled={getQuantity(product.id) <= 1}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-lg">{getQuantity(product.id)}g</span>
                              <span className="text-xs text-gray-500">quantity</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                              disabled={getQuantity(product.id) >= 5}
                              className="w-8 h-8 p-0"
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
                            className="w-full bg-[#116149] hover:bg-[#0d4d3a] text-white transition-colors"
                          >
                            Add to Selection
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          });
        })()}

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items available at the moment.</p>
          </div>
        )}
      </main>

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
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Your Selection</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBasket(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {basketItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items selected</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {basketItems.map((item: BasketItem & { product: Product }) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.product?.name}</h4>
                            <p className="text-xs text-gray-500">Quantity: {item.quantity}g</p>
                            <p className="text-xs text-gray-400 font-mono">#{(item.product as any)?.productCode}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromBasketMutation.mutate(item.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => completeDonationMutation.mutate()}
                      disabled={completeDonationMutation.isPending}
                      className="w-full bg-[#116149] hover:bg-[#0d4d3a] text-white"
                    >
                      {completeDonationMutation.isPending ? 'Processing...' : 'Complete Donation'}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}