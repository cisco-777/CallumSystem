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

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [showBasket, setShowBasket] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Map product names to their corresponding images
  const getProductImage = (productName: string) => {
    const nameMap: Record<string, string> = {
      'Zkittlez': zkittlezImg,
      'Blue Dream': blueDreamImg,
      'Lemon Haze': lemonHazeImg,
      'Wedding Cake': weddingCakeImg,
    };
    return nameMap[productName] || null;
  };

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  const { data: basketItems = [] } = useQuery({
    queryKey: ['/api/basket']
  });

  const addToBasketMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest('/api/basket', {
        method: 'POST',
        body: JSON.stringify({ productId }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/basket'] });
      setShowBasket(false);
      toast({
        title: "Donation Complete",
        description: "Thank you for your contribution to the club.",
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
            <h1 className="text-2xl font-light text-gray-900">Marbella Social Club</h1>
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
        <div className="mb-8">
          <h2 className="text-xl font-light text-gray-900 mb-2">Available Selection</h2>
          <p className="text-gray-600">Curated items for our members</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: Product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                    <span className="text-gray-500 text-sm">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        'Image Placeholder'
                      )}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
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
                  <Button
                    onClick={() => addToBasketMutation.mutate(product.id)}
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
                            <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
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