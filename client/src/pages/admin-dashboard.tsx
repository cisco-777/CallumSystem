import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, Activity, ExternalLink, TrendingUp, DollarSign, BarChart3, AlertCircle, Search, PieChart, Hash, Leaf, QrCode, TriangleAlert, Plus, Edit, Trash2 } from 'lucide-react';
import { RightNavigation } from '@/components/right-navigation';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ObjectUploader } from '@/components/ObjectUploader';
import type { UploadResult } from '@uppy/core';


// Unified form schema that combines product catalog and stock management
const unifiedStockFormSchema = z.object({
  // Product Catalog Fields (public, customer-facing)
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.enum(['Sativa', 'Indica', 'Hybrid']),
  productType: z.enum(['Cannabis', 'Hash']),
  imageUrl: z.string().optional(),
  productCode: z.string().min(6).max(6).regex(/^[A-Z]{2}\d{4}$/, 'Product code must be 2 letters followed by 4 numbers (e.g., ZK4312)'),
  // Stock Management Fields (admin-only)
  supplier: z.string().min(1, 'Supplier is required'),
  onShelfGrams: z.number().min(0, 'On shelf amount must be positive'),
  internalGrams: z.number().min(0, 'Internal amount must be positive'),
  externalGrams: z.number().min(0, 'External amount must be positive'),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Cost price must be a valid number'),
  shelfPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Shelf price must be a valid number')
});

// Keep old schema for backward compatibility
const stockFormSchema = unifiedStockFormSchema;

type UnifiedStockFormData = z.infer<typeof unifiedStockFormSchema>;
type StockFormData = UnifiedStockFormData; // For backward compatibility


export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSystemWiped, setIsSystemWiped] = useState(false);
  const [showFailsafeDialog, setShowFailsafeDialog] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const stockForm = useForm<UnifiedStockFormData>({
    resolver: zodResolver(unifiedStockFormSchema),
    defaultValues: {
      // Product Catalog fields
      name: '',
      description: '',
      category: 'Sativa',
      productType: 'Cannabis',
      imageUrl: '',
      productCode: '',
      // Stock Management fields
      supplier: '',
      onShelfGrams: 0,
      internalGrams: 0,
      externalGrams: 0,
      costPrice: '0',
      shelfPrice: '0'
    }
  });

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

  // Separate query for analytics that includes all orders (including archived)
  const { data: analyticsOrders = [] } = useQuery({
    queryKey: ['/api/orders/analytics'],
    queryFn: async () => {
      return await apiRequest('/api/orders/analytics');
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

  const deleteAllOrdersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/orders/all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Orders Cleared",
        description: "All orders removed from Order Control Center. Customer analytics preserved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete all orders.",
        variant: "destructive",
      });
    }
  });


  const updateStockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: StockFormData }) => {
      return await apiRequest(`/api/products/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowStockForm(false);
      setEditingStock(null);
      stockForm.reset();
      toast({
        title: "Stock Updated",
        description: "Product stock information has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createStockMutation = useMutation({
    mutationFn: async (data: StockFormData) => {
      return await apiRequest('/api/products/stock', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowStockForm(false);
      stockForm.reset();
      toast({
        title: "Stock Entry Created",
        description: "New stock entry has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create stock entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteStockMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-admin': 'true' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/analytics'] });
      setShowDeleteDialog(false);
      setDeletingProduct(null);
      toast({
        title: "Product Deleted",
        description: "Product has been successfully removed from both stock management and customer catalog.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteProduct = (product: any) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = () => {
    if (deletingProduct) {
      deleteStockMutation.mutate(deletingProduct.id);
    }
  };

  const updateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const confirmOrder = (orderId: number) => {
    confirmOrderMutation.mutate(orderId);
  };

  const deleteAllOrders = () => {
    if (window.confirm("Are you sure you want to remove ALL orders from the Order Control Center? Orders will be archived but customer history and analytics will be preserved.")) {
      deleteAllOrdersMutation.mutate();
    }
  };


  const onSubmitStock = (data: UnifiedStockFormData) => {
    // Create final data with uploaded image URL if available
    const finalData = {
      ...data,
      imageUrl: uploadedImageUrl || data.imageUrl || ''
    };
    
    if (editingStock) {
      updateStockMutation.mutate({ id: editingStock.id, data: finalData });
    } else {
      createStockMutation.mutate(finalData);
    }
  };

  const handleEditStock = (product: any) => {
    setEditingStock(product);
    stockForm.reset({
      // Product Catalog fields
      name: product.name,
      description: product.description || '',
      category: product.category,
      productType: product.productType || 'Cannabis',
      imageUrl: product.imageUrl || '',
      productCode: product.productCode,
      // Stock Management fields
      supplier: product.supplier || '',
      onShelfGrams: product.onShelfGrams || 0,
      internalGrams: product.internalGrams || 0,
      externalGrams: product.externalGrams || 0,
      costPrice: product.costPrice || '0',
      shelfPrice: product.shelfPrice || product.adminPrice || '0'
    });
    // Set image preview if product has image
    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
      setUploadedImageUrl(product.imageUrl);
    }
    setShowStockForm(true);
  };

  const handleCreateStock = () => {
    setEditingStock(null);
    stockForm.reset({
      // Product Catalog fields
      name: '',
      description: '',
      category: 'Sativa',
      productType: 'Cannabis',
      imageUrl: '',
      productCode: '',
      // Stock Management fields
      supplier: '',
      onShelfGrams: 0,
      internalGrams: 0,
      externalGrams: 0,
      costPrice: '0',
      shelfPrice: '0'
    });
    // Clear image preview
    setImagePreview('');
    setUploadedImageUrl('');
    setShowStockForm(true);
  };

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return {
        method: 'PUT' as const,
        url: response.uploadURL
      };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log('Upload completed:', result);
    
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      
      try {
        // Set the ACL policy for the uploaded image to make it publicly accessible
        const response = await apiRequest('/api/product-images', {
          method: 'PUT',
          body: JSON.stringify({ imageURL: uploadURL }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Use the correct path for serving the uploaded image
        const imageServeUrl = response.imagePath;
        console.log('Setting image preview to:', imageServeUrl);
        
        // Update the image preview and form
        setUploadedImageUrl(imageServeUrl);
        setImagePreview(imageServeUrl);
        stockForm.setValue('imageUrl', imageServeUrl);
        
        // Stop the loading state AFTER setting the preview
        setIsImageUploading(false);
        
        toast({
          title: "Image Uploaded",
          description: "Product image uploaded successfully!"
        });
        
      } catch (error) {
        console.error('Failed to set image ACL:', error);
        
        // Fall back to using the upload URL directly for preview
        setUploadedImageUrl(uploadURL || '');
        setImagePreview(uploadURL || '');
        stockForm.setValue('imageUrl', uploadURL || '');
        
        // Stop the loading state even on error
        setIsImageUploading(false);
        
        toast({
          title: "Upload Warning",
          description: "Image uploaded but may not be publicly accessible.",
          variant: "destructive"
        });
      }
    } else {
      // Stop loading state when no files were uploaded
      setIsImageUploading(false);
      
      toast({
        title: "Upload Failed",
        description: "No files were successfully uploaded.",
        variant: "destructive"
      });
    }
  };

  const executeFailsafe = () => {
    setShowFailsafeDialog(false);
    setIsSystemWiped(true);
    
    // Show red notification
    toast({
      title: "⚠️ FAILSAFE ACTIVATED",
      description: "All admin interface data has been permanently deleted.",
      variant: "destructive",
      duration: 10000,
    });
    
    // Auto-restore after 60 seconds
    setTimeout(() => {
      setIsSystemWiped(false);
    }, 60000);
  };

  const mockOrders = [
    { id: 1, user: "John D.", item: "Blue Dream", quantity: 1, status: "completed", time: "2 hours ago" },
    { id: 2, user: "Sarah M.", item: "Wedding Cake", quantity: 2, status: "pending", time: "1 hour ago" },
    { id: 3, user: "Mike R.", item: "Lemon Haze", quantity: 1, status: "completed", time: "30 mins ago" },
    { id: 4, user: "Emma L.", item: "Zkittlez", quantity: 3, status: "processing", time: "15 mins ago" }
  ];

  // Calculate customer preferences
  const calculateCustomerPreferences = () => {
    if (!Array.isArray(analyticsOrders) || analyticsOrders.length === 0) return null;
    
    let sativaCount = 0, indicaCount = 0, hybridCount = 0;
    let cannabisCount = 0, hashCount = 0;
    const categoryCount: { [key: string]: number } = {};
    
    analyticsOrders.forEach((order: any) => {
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
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }))
    };
  };
  
  const customerPrefs = calculateCustomerPreferences();
  
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
    const lowStockItems: Array<{name: string, stock: number, critical: boolean, urgent: boolean}> = [];
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

      // Low stock alerts with proper thresholds
      if (stock <= 100) {
        const isCritical = stock >= 50 && stock <= 70; // Critical range: 50-70g
        const isUrgent = stock >= 95 && stock <= 100;   // Urgent range: 95-100g
        
        if (isCritical || isUrgent) {
          lowStockItems.push({
            name: product.name,
            stock: stock,
            critical: isCritical, // Critical for 50-70g, Urgent for 95-100g
            urgent: isUrgent
          });
        }
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
  
  // Enhanced customer search functionality
  const getCustomerProfile = (userId: number) => {
    const userOrders = analyticsOrders.filter((order: any) => order.userId === userId);
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) return null;
    
    // Calculate spending summary
    const totalSpent = userOrders.reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice || '0'), 0);
    const averageOrderValue = userOrders.length > 0 ? Math.round(totalSpent / userOrders.length) : 0;
    
    // Only calculate preferences if user has orders
    let preferences = {
      sativa: 0,
      indica: 0, 
      hybrid: 0,
      cannabis: 0,
      hash: 0
    };
    
    if (userOrders.length > 0) {
      let sativaCount = 0, indicaCount = 0, hybridCount = 0;
      let cannabisCount = 0, hashCount = 0;
      let totalItems = 0;
      
      userOrders.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const category = (item.category || '').toLowerCase();
            totalItems++;
            
            // Strain preferences
            if (category.includes('sativa')) sativaCount++;
            else if (category.includes('indica')) indicaCount++;
            else hybridCount++;
            
            // Product type preferences
            if (category.includes('hash')) hashCount++;
            else cannabisCount++;
          });
        }
      });
      
      if (totalItems > 0) {
        preferences = {
          sativa: Math.round((sativaCount / totalItems) * 100),
          indica: Math.round((indicaCount / totalItems) * 100),
          hybrid: Math.round((hybridCount / totalItems) * 100),
          cannabis: Math.round((cannabisCount / totalItems) * 100),
          hash: Math.round((hashCount / totalItems) * 100)
        };
      }
    }
    
    return {
      user,
      orderCount: userOrders.length,
      totalSpent,
      averageOrderValue,
      preferences,
      recentOrders: userOrders.slice(0, 5).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    };
  };
  
  // Enhanced filtering with better search logic
  const filteredUsers = users.filter((user: any) => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const firstName = (user.firstName || '').toLowerCase();
    const lastName = (user.lastName || '').toLowerCase();
    
    return fullName.includes(query) || 
           email.includes(query) || 
           firstName.includes(query) || 
           lastName.includes(query);
  }).filter(user => {
    // Only show users who have at least made one order or have complete profile info
    const hasOrders = orders.some((order: any) => order.userId === user.id);
    const hasCompleteProfile = user.firstName && user.lastName;
    return hasOrders || hasCompleteProfile;
  });

  // System Wiped Screen
  if (isSystemWiped) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <TriangleAlert className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-red-800 mb-4">SYSTEM WIPED</h1>
            <p className="text-red-600 text-lg">All admin data has been permanently deleted.</p>
          </div>
          
          <div className="bg-red-500 text-white p-4 rounded-lg max-w-md mx-auto">
            <div className="flex items-center mb-2">
              <TriangleAlert className="w-5 h-5 mr-2" />
              <span className="font-bold">FAILSAFE ACTIVATED</span>
            </div>
            <p className="text-sm">All admin interface data has been permanently deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mobile-p-3">
      {/* Right Navigation */}
      <RightNavigation 
        type="admin" 
        onLogout={() => {
          localStorage.removeItem('msc-admin-authenticated');
          window.location.href = '/admin-login';
        }} 
      />
      <div className="max-w-7xl mx-auto main-content-with-nav">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="mobile-h1 font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mobile-text-sm text-gray-600 mt-1">Demo Social Club Management</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <AlertDialog open={showFailsafeDialog} onOpenChange={setShowFailsafeDialog}>
              <AlertDialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold mobile-btn-md mobile-touch-target w-full sm:w-auto">
                  <TriangleAlert className="w-4 h-4 mr-2" />
                  <span className="mobile-text-sm">FAILSAFE!</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <TriangleAlert className="w-12 h-12 text-orange-500 mx-auto" />
                  </div>
                  <AlertDialogTitle className="text-red-800 text-xl font-bold">
                    WARNING: FAILSAFE ACTIVATION
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p className="text-red-600 font-medium">
                      This will permanently delete ALL admin interface data!
                    </p>
                    <p className="text-gray-600 text-sm">
                      This action cannot be undone. All member data, orders, and system configurations will be erased.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <AlertDialogCancel className="sm:w-auto">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={executeFailsafe}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold sm:w-auto"
                  >
                    EXECUTE FAILSAFE
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
              onClick={() => toast({ title: "QR Scanner", description: "QR code scanning functionality will be available soon." })}
              className="bg-green-600 hover:bg-green-700 text-white mobile-btn-md mobile-touch-target w-full sm:w-auto"
            >
              <QrCode className="w-4 h-4 mr-2" />
              <span className="mobile-text-sm">Scan QR Code</span>
            </Button>
          </div>
        </div>

        {/* Inventory Overview Cards */}
        <div id="overview" className="mobile-admin-grid mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Total Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-green-700">€{analytics.totalStockValue}</div>
              <p className="mobile-text-xs text-muted-foreground">Current inventory value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Stock Status</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-blue-700">{products.length}</div>
              <p className="mobile-text-xs text-muted-foreground">
                {analytics.lowStockItems.length > 0 ? `${analytics.lowStockItems.length} need restocking` : 'All well stocked'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Average Stock</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-purple-700">{analytics.averageStock}g</div>
              <p className="mobile-text-xs text-muted-foreground">Per product average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Potential Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-orange-700">€{analytics.potentialRevenue}</div>
              <p className="mobile-text-xs text-muted-foreground">If all stock sold</p>
            </CardContent>
          </Card>
        </div>


        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text-base">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.lowStockItems.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {analytics.lowStockItems.map((item: any, index) => (
                    <div key={index} className={`flex items-center justify-between mobile-p-2 rounded-lg ${
                      item.critical ? 'bg-red-50 border border-red-200' : 
                      item.urgent ? 'bg-yellow-50 border border-yellow-200' : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <span className="mobile-text-sm font-medium">{item.name}</span>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className={`mobile-text-xs font-bold ${
                          item.critical ? 'text-red-700' : 
                          item.urgent ? 'text-yellow-700' : 'text-orange-700'
                        }`}>
                          {item.stock}g
                        </span>
                        <Badge variant={item.critical ? "destructive" : item.urgent ? "outline" : "secondary"} className="mobile-text-xs">
                          {item.critical ? "Critical" : item.urgent ? "Urgent" : "Low"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-green-600">
                  <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="mobile-text-sm font-medium">All products well stocked!</p>
                  <p className="mobile-text-xs text-gray-500">No restocking needed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text-base">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {analytics.mostProfitable && (
                  <div className="bg-green-50 border border-green-200 rounded-lg mobile-p-3">
                    <h4 className="mobile-text-sm font-semibold text-green-800 mb-2">Most Profitable</h4>
                    <p className="mobile-text-base font-bold text-green-700">{analytics.mostProfitable.name}</p>
                    <p className="mobile-text-xs text-green-600">
                      €{analytics.mostProfitable.price}/g with {analytics.mostProfitable.stock}g in stock
                    </p>
                    <p className="mobile-text-xs text-green-500 mt-1">
                      Total value: €{analytics.mostProfitable.value}
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg mobile-p-3">
                  <h4 className="mobile-text-sm font-semibold text-blue-800 mb-3">Strain Type Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="mobile-text-xs">Indica:</span>
                      <span className="mobile-text-xs font-medium text-blue-700">
                        {Math.round((analytics.strainBreakdown.indica / products.length) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="mobile-text-xs">Sativa:</span>
                      <span className="mobile-text-xs font-medium text-blue-700">
                        {Math.round((analytics.strainBreakdown.sativa / products.length) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="mobile-text-xs">Hybrid:</span>
                      <span className="mobile-text-xs font-medium text-blue-700">
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
        <Card id="revenue-analytics" className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center mobile-text-base">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg mobile-p-3">
                <h4 className="mobile-text-sm font-semibold text-green-800 mb-2">Total Potential Revenue</h4>
                <p className="mobile-text-lg font-bold text-green-700">€{analytics.potentialRevenue}</p>
                <p className="mobile-text-xs text-green-600 mt-1">If all current stock sold</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg mobile-p-3">
                <h4 className="mobile-text-sm font-semibold text-blue-800 mb-2">Average Order Value</h4>
                <p className="mobile-text-lg font-bold text-blue-700">€{orders.length > 0 ? Math.round(analytics.potentialRevenue / orders.length) : '0'}</p>
                <p className="mobile-text-xs text-blue-600 mt-1">Based on completed orders</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg mobile-p-3">
                <h4 className="mobile-text-sm font-semibold text-purple-800 mb-2">Stock Turnover Rate</h4>
                <p className="mobile-text-lg font-bold text-purple-700">{analytics.averageStock > 0 ? Math.round((orders.length * 10 / analytics.averageStock) * 100) : 0}%</p>
                <p className="mobile-text-xs text-purple-600 mt-1">Monthly estimated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <div id="activity" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
          <Card id="customer-preferences" className="mb-8">
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
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="pl-10 pr-4"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            {searchQuery && (
              <div className="space-y-6">
                {filteredUsers.slice(0, 5).map((user: any) => {
                  const profile = getCustomerProfile(user.id);
                  if (!profile) return null;
                  
                  return (
                    <div key={user.id} className="border-2 border-blue-200 rounded-lg p-6 bg-white shadow-sm">
                      {/* Customer Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-bold text-xl text-blue-800">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Anonymous User'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Member since {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="bg-blue-100 px-3 py-1 rounded-full">
                            <span className="text-sm font-semibold text-blue-800">
                              {profile.orderCount} Orders
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Spending Summary */}
                      {profile.orderCount > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-green-800 mb-2">💰 Spending Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total Spent:</span>
                              <span className="font-bold text-green-700 ml-2">€{profile.totalSpent}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Average Order:</span>
                              <span className="font-bold text-green-700 ml-2">€{profile.averageOrderValue}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {profile.orderCount > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Strain Preferences */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                              <Leaf className="w-4 h-4 mr-2" />
                              Strain Preferences
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Sativa:</span>
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{width: `${profile.preferences.sativa}%`}}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-blue-700 text-sm">{profile.preferences.sativa}%</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Indica:</span>
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{width: `${profile.preferences.indica}%`}}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-blue-700 text-sm">{profile.preferences.indica}%</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Hybrid:</span>
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{width: `${profile.preferences.hybrid}%`}}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-blue-700 text-sm">{profile.preferences.hybrid}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Product Type Preferences */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                              <Hash className="w-4 h-4 mr-2" />
                              Product Type Preferences
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Cannabis:</span>
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full" 
                                      style={{width: `${profile.preferences.cannabis}%`}}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-purple-700 text-sm">{profile.preferences.cannabis}%</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Hash:</span>
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full" 
                                      style={{width: `${profile.preferences.hash}%`}}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-purple-700 text-sm">{profile.preferences.hash}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                          <p className="text-gray-600">This customer hasn't placed any orders yet.</p>
                        </div>
                      )}
                      
                      {/* Recent Orders */}
                      {profile.recentOrders && profile.recentOrders.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-800 mb-3">Recent Order History</h4>
                          <div className="space-y-3">
                            {profile.recentOrders.map((order: any) => (
                              <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className="font-semibold text-sm">Order #{order.id}</span>
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {order.status}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-700">€{order.totalPrice}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Items:</span>
                                  {order.items && order.items.map((item: any, idx: number) => (
                                    <span key={idx} className="ml-1">
                                      {item.name}
                                      {idx < order.items.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Pickup Code: <span className="font-mono font-bold text-blue-600">{order.pickupCode}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No customers found</h3>
                    <p className="text-gray-500">
                      No customers match "{searchQuery}". Try searching by name or email.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {!searchQuery && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Customer Search Tool</h3>
                <p className="text-gray-500 mb-4">
                  Search for customers by name or email to view their detailed profiles
                </p>
                <div className="text-sm text-gray-400">
                  <p>• View customer preferences and order history</p>
                  <p>• Analyze spending patterns and product preferences</p>
                  <p>• Track customer activity and engagement</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Control Center */}
        <Card id="order-control" className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Order Control Center</CardTitle>
              {orders.length > 0 && (
                <Button
                  onClick={deleteAllOrders}
                  disabled={deleteAllOrdersMutation.isPending}
                  size="sm"
                  variant="destructive"
                  className="ml-4"
                >
                  {deleteAllOrdersMutation.isPending ? 'Archiving...' : 'Clear All Orders'}
                </Button>
              )}
            </div>
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
                            <span>{item.name}</span>
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
        <Card id="dispensary-stock">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dispensary Stock</CardTitle>
            <Button 
              onClick={handleCreateStock}
              size="sm" 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Stock Entry
            </Button>
          </CardHeader>
          <CardContent>
            {/* Stock Management Form */}
            {showStockForm && (
              <div className="mb-6 border-2 border-blue-500 shadow-lg rounded-lg bg-white">
                <div className="bg-blue-50 border-b border-blue-200 p-4 rounded-t-lg relative">
                  <h3 className="text-lg font-semibold text-blue-800">{editingStock ? 'Edit Stock Entry' : 'Add New Stock Entry'}</h3>
                  <Button 
                    onClick={() => setShowStockForm(false)} 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 hover:bg-blue-100"
                  >
                    ✕
                  </Button>
                </div>
                <div className="p-4">
                  <Form {...stockForm}>
                    <form onSubmit={stockForm.handleSubmit(onSubmitStock)} className="space-y-6">
                      {/* Section 1: Product Catalog Information */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                          <Package className="w-5 h-5 mr-2" />
                          Customer Catalog Information
                        </h4>
                        <p className="text-sm text-green-700 mb-4">This information will be visible to customers in the product catalog</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={stockForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Blue Dream" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={stockForm.control}
                            name="productCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Code (6 digits) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., BD7010" 
                                    {...field} 
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                    maxLength={6}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={stockForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Sativa">Sativa</SelectItem>
                                    <SelectItem value="Indica">Indica</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={stockForm.control}
                            name="productType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Type *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Cannabis">Cannabis</SelectItem>
                                    <SelectItem value="Hash">Hash</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={stockForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Product Image</FormLabel>
                                <FormControl>
                                  <div className="space-y-4">
                                    <ObjectUploader
                                      maxNumberOfFiles={1}
                                      maxFileSize={10485760}
                                      onGetUploadParameters={handleGetUploadParameters}
                                      onComplete={handleUploadComplete}
                                      onUploadStart={() => setIsImageUploading(true)}
                                      buttonClassName="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                                      allowedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
                                      disabled={isImageUploading}
                                    >
                                      {isImageUploading ? '⏳ Uploading Image...' : '📷 Upload Product Image'}
                                    </ObjectUploader>
                                    
                                    {isImageUploading && (
                                      <div className="mt-4">
                                        <div className="border rounded-lg p-4 bg-blue-50 flex justify-center items-center">
                                          <div className="text-blue-600 flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span>Processing image...</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {imagePreview && !isImageUploading && (
                                      <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Image Preview:</p>
                                        <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
                                          <img 
                                            src={imagePreview} 
                                            alt="Product preview" 
                                            className="max-w-full max-h-64 w-auto h-auto object-contain rounded shadow-sm border border-gray-200"
                                            onLoad={() => {
                                              console.log('Image loaded successfully:', imagePreview);
                                            }}
                                            onError={(e) => {
                                              console.error('Image failed to load:', imagePreview, e);
                                              setTimeout(() => {
                                                if (imagePreview) {
                                                  toast({
                                                    title: "Image Display Error",
                                                    description: "Unable to display image preview. Please try uploading again.",
                                                    variant: "destructive"
                                                  });
                                                }
                                              }, 2000);
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    
                                    <input 
                                      type="hidden"
                                      {...field}
                                      value={field.value || uploadedImageUrl || ''}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={stockForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Product Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the product's characteristics, effects, and flavors..."
                                  className="min-h-[100px]"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Section 2: Internal Stock Management */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          Internal Stock Management
                        </h4>
                        <p className="text-sm text-blue-700 mb-4">This information is for admin use only and will not be visible to customers</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <FormField
                            control={stockForm.control}
                            name="supplier"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Supplier *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Green Harvest Co." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Stock Distribution */}
                        <div className="space-y-4 mb-6">
                          <h5 className="font-medium text-sm text-blue-700">Stock Distribution (grams)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={stockForm.control}
                              name="onShelfGrams"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>On Shelf</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={stockForm.control}
                              name="internalGrams"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Internal Storage</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={stockForm.control}
                              name="externalGrams"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>External Storage</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Total calculation display */}
                          <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800">
                              Total Stock Amount: {(stockForm.watch('onShelfGrams') || 0) + (stockForm.watch('internalGrams') || 0) + (stockForm.watch('externalGrams') || 0)}g
                            </p>
                          </div>
                        </div>
                        
                        {/* Pricing */}
                        <div className="space-y-4">
                          <h5 className="font-medium text-sm text-blue-700">Pricing (€ per gram)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={stockForm.control}
                              name="costPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cost Price</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={stockForm.control}
                              name="shelfPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Shelf Price</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowStockForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createStockMutation.isPending || updateStockMutation.isPending}
                          className="bg-[#116149] hover:bg-[#0d4d3a] text-white"
                        >
                          {editingStock ? 
                            (updateStockMutation.isPending ? 'Updating...' : 'Update Stock') : 
                            (createStockMutation.isPending ? 'Creating...' : 'Create Stock Entry')
                          }
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(products) && products.map((product: any) => {
                const totalAmount = (product.onShelfGrams || 0) + (product.internalGrams || 0) + (product.externalGrams || 0);
                return (
                  <div key={product.id} className="border rounded-lg p-4 relative">
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStock(product);
                        }}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product);
                        }}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold pr-10">{product.name}</h3>
                    <Badge className="mt-2">{product.category}</Badge>
                    
                    {/* Stock Distribution */}
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-blue-700">
                        Total: {totalAmount}g
                      </p>
                      <div className="text-xs text-gray-600 ml-2">
                        <p>On shelf: {product.onShelfGrams || 0}g</p>
                        <p>Internal: {product.internalGrams || 0}g</p>
                        <p>External: {product.externalGrams || 0}g</p>
                      </div>
                    </div>
                    
                    {/* Pricing */}
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-green-700">
                        Shelf: €{product.shelfPrice || product.adminPrice || '0'}/g
                      </p>
                      <p className="text-sm text-gray-600">
                        Cost: €{product.costPrice || '0'}/g
                      </p>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
                      <p className="text-xs text-gray-500">
                        Code: {product.productCode}
                      </p>
                      {product.supplier && (
                        <p className="text-xs text-gray-500">
                          Supplier: {product.supplier}
                        </p>
                      )}
                      {product.lastUpdated && (
                        <p className="text-xs text-gray-400">
                          Updated: {new Date(product.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingProduct?.name}"? This will permanently remove the product from both:
                <br /><br />
                • <strong>Internal Stock Management</strong> - All stock data and pricing information
                <br />
                • <strong>Customer Catalog</strong> - Product will no longer appear to customers
                <br /><br />
                This action cannot be undone. Orders containing this product will be preserved for historical records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingProduct(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                disabled={deleteStockMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteStockMutation.isPending ? 'Deleting...' : 'Delete Product'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}