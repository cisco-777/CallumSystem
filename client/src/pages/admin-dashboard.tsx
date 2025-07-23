import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, Activity, ExternalLink, TrendingUp, DollarSign, BarChart3, AlertCircle, Search, PieChart, Hash, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      return await apiRequest('/api/orders', {
        headers: { 'x-admin': 'true' }
      });
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      return await apiRequest('/api/users', {
        headers: { 'x-admin': 'true' }
      });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  });

  const confirmOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiRequest(`/api/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Order Confirmed",
        description: "Order completed and stock quantities updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm order.",
        variant: "destructive",
      });
    }
  });

  const updateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const confirmOrder = (orderId: number) => {
    confirmOrderMutation.mutate(orderId);
  };

  const mockOrders = [
    { id: 1, user: "John D.", item: "Blue Dream", quantity: 1, status: "completed", time: "2 hours ago" },
    { id: 2, user: "Sarah M.", item: "Wedding Cake", quantity: 2, status: "pending", time: "1 hour ago" },
    { id: 3, user: "Mike R.", item: "Lemon Haze", quantity: 1, status: "completed", time: "30 mins ago" },
    { id: 4, user: "Emma L.", item: "Zkittlez", quantity: 3, status: "processing", time: "15 mins ago" }
  ];

  // Calculate customer preferences
  const calculateCustomerPreferences = () => {
    if (!Array.isArray(orders) || orders.length === 0) return null;
    
    let sativaCount = 0, indicaCount = 0, hybridCount = 0;
    let cannabisCount = 0, hashCount = 0;
    const categoryCount: { [key: string]: number } = {};
    
    orders.forEach((order: any) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const category = (item.category || '').toLowerCase();
          
          // Strain preference analysis
          if (category.includes('sativa')) sativaCount++;
          else if (category.includes('indica')) indicaCount++;
          else hybridCount++;
          
          // Cannabis vs Hash analysis
          if (category.includes('hash')) hashCount++;
          else cannabisCount++;
          
          // Category counting
          categoryCount[item.category || 'Other'] = (categoryCount[item.category || 'Other'] || 0) + 1;
        });
      }
    });
    
    const total = sativaCount + indicaCount + hybridCount;
    const productTotal = cannabisCount + hashCount;
    
    return {
      strainPreferences: {
        sativa: total > 0 ? Math.round((sativaCount / total) * 100) : 0,
        indica: total > 0 ? Math.round((indicaCount / total) * 100) : 0,
        hybrid: total > 0 ? Math.round((hybridCount / total) * 100) : 0
      },
      productPreferences: {
        cannabis: productTotal > 0 ? Math.round((cannabisCount / productTotal) * 100) : 0,
        hash: productTotal > 0 ? Math.round((hashCount / productTotal) * 100) : 0
      },
      popularCategories: Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }))
    };
  };
  
  const customerPrefs = calculateCustomerPreferences();
  
  // Customer search functionality
  const getCustomerProfile = (userId: number) => {
    const userOrders = orders.filter((order: any) => order.userId === userId);
    const user = users.find((u: any) => u.id === userId);
    
    if (!user || userOrders.length === 0) return null;
    
    let sativaCount = 0, indicaCount = 0, hybridCount = 0;
    let cannabisCount = 0, hashCount = 0;
    
    userOrders.forEach((order: any) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const category = (item.category || '').toLowerCase();
          if (category.includes('sativa')) sativaCount++;
          else if (category.includes('indica')) indicaCount++;
          else hybridCount++;
          
          if (category.includes('hash')) hashCount++;
          else cannabisCount++;
        });
      }
    });
    
    const total = sativaCount + indicaCount + hybridCount;
    const productTotal = cannabisCount + hashCount;
    
    return {
      user,
      orderCount: userOrders.length,
      preferences: {
        sativa: total > 0 ? Math.round((sativaCount / total) * 100) : 0,
        indica: total > 0 ? Math.round((indicaCount / total) * 100) : 0,
        hybrid: total > 0 ? Math.round((hybridCount / total) * 100) : 0,
        cannabis: productTotal > 0 ? Math.round((cannabisCount / productTotal) * 100) : 0,
        hash: productTotal > 0 ? Math.round((hashCount / productTotal) * 100) : 0
      },
      recentOrders: userOrders.slice(0, 3)
    };
  };
  
  const filteredUsers = users.filter((user: any) => 
    searchQuery === '' || 
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToOrderControl = () => {
    const orderControlSection = document.getElementById('order-control-section');
    if (orderControlSection) {
      orderControlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Analytics calculations from real data
  const calculateAnalytics = () => {
    if (!Array.isArray(products) || products.length === 0) {
      return {
        totalStockValue: 0,
        totalStock: 0,
        averageStock: 0,
        lowStockItems: [],
        potentialRevenue: 0,
        mostProfitable: null,
        strainBreakdown: { indica: 0, sativa: 0, hybrid: 0 }
      };
    }

    let totalStockValue = 0;
    let totalStock = 0;
    let potentialRevenue = 0;
    const lowStockItems: Array<{name: string, stock: number, critical: boolean}> = [];
    let mostProfitable: {name: string, price: number, stock: number, value: number} | null = null;
    let maxProfitability = 0;
    const strainCounts = { indica: 0, sativa: 0, hybrid: 0 };

    (products as any[]).forEach((product: any) => {
      const stock = product.stockQuantity || 0;
      const price = parseFloat(product.adminPrice) || 0;
      const value = stock * price;
      
      totalStock += stock;
      totalStockValue += value;
      potentialRevenue += value;

      // Low stock alerts
      if (stock < 120) {
        lowStockItems.push({
          name: product.name,
          stock: stock,
          critical: stock < 100
        });
      }

      // Most profitable calculation
      const profitability = price * stock;
      if (profitability > maxProfitability) {
        maxProfitability = profitability;
        mostProfitable = {
          name: product.name,
          price: price,
          stock: stock,
          value: profitability
        };
      }

      // Strain breakdown
      const category = (product.category || '').toLowerCase();
      if (category.includes('indica')) strainCounts.indica++;
      else if (category.includes('sativa')) strainCounts.sativa++;
      else strainCounts.hybrid++;
    });

    const averageStock = (products as any[]).length > 0 ? Math.round(totalStock / (products as any[]).length) : 0;

    return {
      totalStockValue: Math.round(totalStockValue),
      totalStock,
      averageStock,
      lowStockItems,
      potentialRevenue: Math.round(potentialRevenue),
      mostProfitable,
      strainBreakdown: strainCounts
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">The Bud House Social Club Management</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={scrollToOrderControl}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Order Control
            </Button>
          </div>
        </div>

        {/* Inventory Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">€{analytics.totalStockValue}</div>
              <p className="text-xs text-muted-foreground">Current inventory value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.lowStockItems.length > 0 ? `${analytics.lowStockItems.length} need restocking` : 'All well stocked'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Stock</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{analytics.averageStock}g</div>
              <p className="text-xs text-muted-foreground">Per product average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">€{analytics.potentialRevenue}</div>
              <p className="text-xs text-muted-foreground">If all stock sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {analytics.lowStockItems.map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      item.critical ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          item.critical ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          {item.stock}g
                        </span>
                        <Badge variant={item.critical ? "destructive" : "secondary"}>
                          {item.critical ? "Critical" : "Low"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-green-600">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">All products well stocked!</p>
                  <p className="text-sm text-gray-500">No restocking needed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.mostProfitable && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Most Profitable</h4>
                    <p className="text-lg font-bold text-green-700">{analytics.mostProfitable.name}</p>
                    <p className="text-sm text-green-600">
                      €{analytics.mostProfitable.price}/g with {analytics.mostProfitable.stock}g in stock
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      Total value: €{analytics.mostProfitable.value}
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Strain Type Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Indica:</span>
                      <span className="font-medium text-blue-700">
                        {Math.round((analytics.strainBreakdown.indica / products.length) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sativa:</span>
                      <span className="font-medium text-blue-700">
                        {Math.round((analytics.strainBreakdown.sativa / products.length) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Hybrid:</span>
                      <span className="font-medium text-blue-700">
                        {Math.round((analytics.strainBreakdown.hybrid / products.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analytics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Total Potential Revenue</h4>
                <p className="text-2xl font-bold text-green-700">€{analytics.potentialRevenue}</p>
                <p className="text-sm text-green-600 mt-1">If all current stock sold</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Average Order Value</h4>
                <p className="text-2xl font-bold text-blue-700">€{orders.length > 0 ? Math.round(analytics.potentialRevenue / orders.length) : '0'}</p>
                <p className="text-sm text-blue-600 mt-1">Based on completed orders</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Stock Turnover Rate</h4>
                <p className="text-2xl font-bold text-purple-700">{analytics.averageStock > 0 ? Math.round((orders.length * 10 / analytics.averageStock) * 100) : 0}%</p>
                <p className="text-sm text-purple-600 mt-1">Monthly estimated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.user}</p>
                      <p className="text-sm text-gray-600">{order.item} x{order.quantity}</p>
                      <p className="text-xs text-gray-500">{order.time}</p>
                    </div>
                    <Badge 
                      variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Member Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 4).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.firstName || ''} {user.lastName || ''}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge 
                      variant={user.isOnboarded ? 'default' : 'secondary'}
                    >
                      {user.isOnboarded ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Preferences Analytics Section */}
        {customerPrefs && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                Customer Preferences Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Strain Preferences */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Leaf className="w-4 h-4 mr-2" />
                    Strain Preferences
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sativa:</span>
                      <span className="font-bold text-blue-700">{customerPrefs.strainPreferences.sativa}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Indica:</span>
                      <span className="font-bold text-blue-700">{customerPrefs.strainPreferences.indica}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hybrid:</span>
                      <span className="font-bold text-blue-700">{customerPrefs.strainPreferences.hybrid}%</span>
                    </div>
                  </div>
                </div>

                {/* Product Type Preferences */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    Product Type Preferences
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cannabis:</span>
                      <span className="font-bold text-green-700">{customerPrefs.productPreferences.cannabis}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hash:</span>
                      <span className="font-bold text-green-700">{customerPrefs.productPreferences.hash}%</span>
                    </div>
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Most Popular Categories</h4>
                  <div className="space-y-2">
                    {customerPrefs.popularCategories.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.category}:</span>
                        <span className="font-bold text-purple-700">{item.count} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Search Tool */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-gray-600" />
              Customer Search & Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Input
                placeholder="Search customers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {searchQuery && (
              <div className="space-y-4">
                {filteredUsers.slice(0, 5).map((user: any) => {
                  const profile = getCustomerProfile(user.id);
                  if (!profile) return null;
                  
                  return (
                    <div key={user.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.firstName || ''} {user.lastName || ''}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">{profile.orderCount} total orders</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personal Preferences */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-2">Strain Preferences</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Sativa:</span>
                              <span className="font-medium">{profile.preferences.sativa}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Indica:</span>
                              <span className="font-medium">{profile.preferences.indica}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Hybrid:</span>
                              <span className="font-medium">{profile.preferences.hybrid}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Product Preferences */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-2">Product Preferences</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Cannabis:</span>
                              <span className="font-medium">{profile.preferences.cannabis}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Hash:</span>
                              <span className="font-medium">{profile.preferences.hash}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recent Orders */}
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Recent Orders</h4>
                        <div className="space-y-2">
                          {profile.recentOrders.map((order: any) => (
                            <div key={order.id} className="text-xs bg-blue-50 rounded p-2">
                              <div className="flex justify-between">
                                <span>Order #{order.id}</span>
                                <span className="text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-gray-600 mt-1">
                                {order.items.length} items - €{order.totalPrice}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No customers found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
            
            {!searchQuery && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Start typing to search for customers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Control Center */}
        <Card id="order-control-section" className="mb-8">
          <CardHeader>
            <CardTitle>Order Control Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders to display
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">Pickup Code: <span className="font-mono font-bold text-blue-600">{order.pickupCode}</span></p>
                        <p className="text-sm text-gray-500">Total: ${order.totalPrice}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                          {order.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-2">Items:</h4>
                      {order.items.map((item: any, index: number) => {
                        const quantity = order.quantities.find((q: any) => q.productId === item.productId)?.quantity || 1;
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName} ({item.category})</span>
                            <span>{quantity}g</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => confirmOrder(order.id)}
                        disabled={order.status === 'completed' || order.status === 'cancelled'}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Confirm & Complete
                      </Button>
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={order.status === 'completed' || order.status === 'cancelled'}
                        size="sm"
                        variant="destructive"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dispensary Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Dispensary Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(products) && products.map((product: any) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  <Badge className="mt-2">{product.category}</Badge>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-medium text-green-700">
                      Stock: {product.stockQuantity || 0}g available
                    </p>
                    <p className="text-sm text-gray-600">
                      Admin Price: ${product.adminPrice || '0'}/g
                    </p>
                    <p className="text-xs text-gray-500">
                      Code: {product.productCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}