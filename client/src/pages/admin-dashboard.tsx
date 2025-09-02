import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, Activity, ExternalLink, TrendingUp, DollarSign, BarChart3, AlertCircle, Search, PieChart, Hash, Leaf, TriangleAlert, Plus, Edit, Trash2, ClipboardCheck, Timer, Receipt, PoundSterling, Clock, PlayCircle, StopCircle, Eye, Copy, PauseCircle, History, LogOut, Settings, RefreshCw, Tag, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ObjectUploader } from '@/components/ObjectUploader';
import type { UploadResult } from '@uppy/core';
import { useAdminUser } from '@/hooks/useAdminUser';

// Log clearing authentication schema
const logClearingSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// Stock Logs Tab Component
function StockLogsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showClearModal, setShowClearModal] = useState(false);
  
  const { data: stockLogs = [] } = useQuery<any[]>({
    queryKey: ['/api/stock-logs']
  });

  const { data: shifts = [] } = useQuery<any[]>({
    queryKey: ['/api/shifts']
  });

  // Form for log clearing authentication
  const clearForm = useForm<z.infer<typeof logClearingSchema>>({
    resolver: zodResolver(logClearingSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Refresh data mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/stock-logs'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
    },
    onSuccess: () => {
      toast({
        title: "Logs Refreshed",
        description: "Stock logs have been refreshed successfully.",
      });
    }
  });

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof logClearingSchema>) => {
      return await apiRequest('/api/stock-logs/clear', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock-logs'] });
      setShowClearModal(false);
      clearForm.reset();
      toast({
        title: "Logs Cleared",
        description: "All stock logs have been cleared successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid credentials. Please check your username and password.",
        variant: "destructive",
      });
    }
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleClearLogs = (data: z.infer<typeof logClearingSchema>) => {
    clearLogsMutation.mutate(data);
  };

  // Group logs by shift ID
  const logsByShift = (stockLogs as any[]).reduce((acc: any, log: any) => {
    const shiftId = log.shiftId || 'no-shift';
    if (!acc[shiftId]) {
      acc[shiftId] = [];
    }
    acc[shiftId].push(log);
    return acc;
  }, {});

  // Sort shifts by most recent first
  const sortedShifts = [...(shifts as any[])].sort((a: any, b: any) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Helper function to get action type badge styling
  const getActionTypeBadge = (actionType: string) => {
    switch (actionType) {
      case 'product_created':
        return { color: 'bg-green-100 text-green-800', label: 'Created' };
      case 'product_edited':
        return { color: 'bg-blue-100 text-blue-800', label: 'Edited' };
      case 'stock_movement':
        return { color: 'bg-purple-100 text-purple-800', label: 'Movement' };
      case 'order_processed':
        return { color: 'bg-orange-100 text-orange-800', label: 'Order' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: actionType };
    }
  };

  // Helper function to format values for display
  const formatValues = (values: any) => {
    if (!values) return 'N/A';
    const parts = [];
    if (values.onShelfGrams !== undefined) parts.push(`Shelf: ${values.onShelfGrams}g`);
    if (values.internalGrams !== undefined) parts.push(`Internal: ${values.internalGrams}g`);
    if (values.externalGrams !== undefined) parts.push(`External: ${values.externalGrams}g`);
    if (values.shelfPrice !== undefined) parts.push(`Price: €${values.shelfPrice}`);
    return parts.join(', ');
  };

  return (
    <>
      {/* Log Actions Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh Logs
          </Button>
        </div>
        
        <Button
          onClick={() => setShowClearModal(true)}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Logs
        </Button>
      </div>

      <div className="space-y-6">
        {(stockLogs as any[]).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Stock Logs Yet</h3>
            <p className="text-gray-500 mb-4">Stock operations will be logged here automatically.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* No shift operations */}
          {logsByShift['no-shift'] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Clock className="h-5 w-5" />
                  Operations Outside Shifts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logsByShift['no-shift'].map((log: any) => {
                    const badge = getActionTypeBadge(log.actionType);
                    return (
                      <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={badge.color}>{badge.label}</Badge>
                            <span className="font-medium">{log.productName}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Worker: {log.workerName}</div>
                          {log.oldValues && (
                            <div>Before: {formatValues(log.oldValues)}</div>
                          )}
                          {log.newValues && (
                            <div>After: {formatValues(log.newValues)}</div>
                          )}
                          {log.notes && (
                            <div className="italic">Notes: {log.notes}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shift-organized operations */}
          {sortedShifts.map((shift: any) => {
            const shiftLogs = logsByShift[shift.id] || [];
            if (shiftLogs.length === 0) return null;

            const isActiveShift = !shift.endTime;
            
            return (
              <Card key={shift.id} className={isActiveShift ? 'ring-2 ring-blue-200 bg-blue-50' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isActiveShift ? 'text-blue-800' : 'text-gray-800'}`}>
                    <Timer className="h-5 w-5" />
                    {isActiveShift ? 'Current Shift' : 'Completed Shift'}: {shift.shiftId}
                  </CardTitle>
                  <p className={`text-sm ${isActiveShift ? 'text-blue-600' : 'text-gray-600'}`}>
                    Worker: {shift.workerName} • Started: {new Date(shift.startTime).toLocaleString()}
                    {shift.endTime && ` • Ended: ${new Date(shift.endTime).toLocaleString()}`}
                  </p>
                  <div className="text-sm text-gray-500">
                    {shiftLogs.length} operation{shiftLogs.length !== 1 ? 's' : ''} recorded
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {shiftLogs
                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((log: any) => {
                        const badge = getActionTypeBadge(log.actionType);
                        return (
                          <div key={log.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={badge.color}>{badge.label}</Badge>
                                <span className="font-medium">{log.productName}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Worker: {log.workerName}</div>
                              {log.oldValues && (
                                <div>Before: {formatValues(log.oldValues)}</div>
                              )}
                              {log.newValues && (
                                <div>After: {formatValues(log.newValues)}</div>
                              )}
                              {log.notes && (
                                <div className="italic">Notes: {log.notes}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
      </div>

      {/* Clear Logs Authentication Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Clear All Stock Logs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This action will permanently delete all stock logs from the system. Please enter management credentials to confirm.
            </p>
            
            <Form {...clearForm}>
              <form onSubmit={clearForm.handleSubmit(handleClearLogs)} className="space-y-4">
                <FormField
                  control={clearForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter management username" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clearForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Enter management password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowClearModal(false);
                      clearForm.reset();
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={clearLogsMutation.isPending}
                  >
                    {clearLogsMutation.isPending ? 'Clearing...' : 'Clear All Logs'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


// Base form schema for all product types
const baseStockFormSchema = z.object({
  // Common fields for all product types
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  productType: z.enum(['Cannabis', 'Hash', 'Cali Pax', 'Edibles', 'Pre-Rolls', 'Vapes', 'Wax']),
  imageUrl: z.string().optional(),
  productCode: z.string().min(1, 'Product code is required'),
  onShelfGrams: z.number().min(0, 'On shelf amount must be positive'),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Cost price must be a valid number'),
  shelfPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Shelf price must be a valid number'),
  // Deal pricing fields (optional)
  dealPrice: z.string().optional(),
  dealStartDate: z.string().optional(),
  dealEndDate: z.string().optional(),
  // Worker signature fields
  workerName: z.string().min(1, 'Worker name is required'),
  entryDate: z.string().min(1, 'Entry date is required')
});

// Full form schema for Cannabis, Hash, and Cali Pax
const fullStockFormSchema = baseStockFormSchema.extend({
  category: z.enum(['Sativa', 'Indica', 'Hybrid']),
  supplier: z.string().min(1, 'Supplier is required'),
  internalGrams: z.number().min(0, 'Internal amount must be positive'),
  externalGrams: z.number().min(0, 'External amount must be positive')
});

// Simplified form schema for Pre-Rolls and Edibles
const simplifiedStockFormSchema = baseStockFormSchema.extend({
  category: z.enum(['Sativa', 'Indica', 'Hybrid']).optional(),
  supplier: z.string().optional(),
  internalGrams: z.number().optional(),
  externalGrams: z.number().optional()
});

// Unified form schema that combines both (for backward compatibility)
const unifiedStockFormSchema = fullStockFormSchema;

// Expense form schema
const expenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number'),
  workerName: z.string().min(1, 'Worker name is required')
});

// Start shift form schema
const startShiftFormSchema = z.object({
  workerName: z.string().min(1, 'Worker name is required'),
  startingTillAmount: z.string().min(1, 'Starting till amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Please enter a valid amount (0 or greater)'
  )
});

// Keep old schema for backward compatibility
const stockFormSchema = unifiedStockFormSchema;

// Admin creation form schema
const adminCreationFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  workerName: z.string().min(1, 'Worker name is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Manual order form schema
const manualOrderFormSchema = z.object({
  items: z.array(z.object({
    productId: z.number().min(1, 'Please select a product'),
    quantity: z.number().min(1, 'Quantity must be at least 1')
  })).min(1, 'At least one item is required')
});

// Stock movement form schema
const stockMovementFormSchema = z.object({
  productId: z.number().min(1, 'Please select a product'),
  fromLocation: z.enum(['internal', 'external', 'shelf'], {
    required_error: 'Please select source location'
  }),
  toLocation: z.enum(['internal', 'external', 'shelf'], {
    required_error: 'Please select destination location'
  }),
  quantity: z.number().min(1, 'Quantity must be at least 1 gram'),
  workerName: z.string().min(1, 'Worker name is required'),
  notes: z.string().optional()
}).refine((data) => data.fromLocation !== data.toLocation, {
  message: "Source and destination locations cannot be the same",
  path: ["toLocation"]
});

type UnifiedStockFormData = z.infer<typeof unifiedStockFormSchema>;
type StockFormData = UnifiedStockFormData; // For backward compatibility

// Helper function to determine if a product type requires simplified form
const isSimplifiedProductType = (productType: string) => {
  return productType === 'Pre-Rolls' || productType === 'Edibles' || productType === 'Vapes';
};

// Helper function to get appropriate schema based on product type
const getFormSchema = (productType: string) => {
  return isSimplifiedProductType(productType) ? simplifiedStockFormSchema : fullStockFormSchema;
};


export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('shift-management');
  const { adminUser, isSuperAdmin, isLoading } = useAdminUser();
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
  const [showStockMovementForm, setShowStockMovementForm] = useState(false);
  const [showShiftReconciliation, setShowShiftReconciliation] = useState(false);
  const [physicalCounts, setPhysicalCounts] = useState<Record<number, number>>({});
  const [reconciliationResult, setReconciliationResult] = useState<any>(null);
  const [emailReport, setEmailReport] = useState<string>('');
  const [cashBreakdown, setCashBreakdown] = useState({
    cashInTill: '',
    coins: '',
    notes: ''
  });
  const [isCountingMode, setIsCountingMode] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showDeleteExpenseDialog, setShowDeleteExpenseDialog] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<any>(null);
  const [showStartShiftDialog, setShowStartShiftDialog] = useState(false);
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showAdminCreationForm, setShowAdminCreationForm] = useState(false);
  const [showManualOrderForm, setShowManualOrderForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('msc-admin-authenticated');
    localStorage.removeItem('msc-admin');
    window.location.href = '/';
  };


  const stockForm = useForm<UnifiedStockFormData>({
    resolver: zodResolver(fullStockFormSchema),
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
      costPrice: '',
      shelfPrice: '',
      // Worker signature fields
      workerName: '',
      entryDate: ''
    }
  });

  // Watch product type to dynamically change validation schema
  const watchedProductType = stockForm.watch('productType');
  
  useEffect(() => {
    const currentSchema = getFormSchema(watchedProductType);
    stockForm.clearErrors(); // Clear any existing validation errors
    
    // Note: React Hook Form doesn't allow changing resolver after initialization
    // The form will still work with the original fullStockFormSchema
  }, [watchedProductType]);

  const adminCreationForm = useForm<z.infer<typeof adminCreationFormSchema>>({
    resolver: zodResolver(adminCreationFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      workerName: ''
    }
  });

  const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
      amount: '',
      workerName: ''
    }
  });

  const startShiftForm = useForm<z.infer<typeof startShiftFormSchema>>({
    resolver: zodResolver(startShiftFormSchema),
    defaultValues: {
      workerName: '',
      startingTillAmount: ''
    }
  });

  const manualOrderForm = useForm<z.infer<typeof manualOrderFormSchema>>({
    resolver: zodResolver(manualOrderFormSchema),
    defaultValues: {
      items: [{ productId: 0, quantity: 1 }]
    }
  });

  const stockMovementForm = useForm<z.infer<typeof stockMovementFormSchema>>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: {
      productId: 0,
      fromLocation: 'internal' as const,
      toLocation: 'shelf' as const,
      quantity: 1,
      workerName: '',
      notes: ''
    }
  });

  const { data: products = [] } = useQuery<any[]>({
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

  const { data: expenses = [] } = useQuery({
    queryKey: ['/api/expenses']
  });

  const { data: activeShift = null, refetch: refetchActiveShift } = useQuery<any>({
    queryKey: ['/api/shifts/active']
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['/api/shifts']
  });

  // Membership management queries
  const { data: pendingMembers = [] } = useQuery({
    queryKey: ['/api/membership/pending'],
    queryFn: () => apiRequest('/api/membership/pending')
  });

  const { data: membershipStats } = useQuery({
    queryKey: ['/api/membership/statistics'],
    queryFn: () => apiRequest('/api/membership/statistics')
  });

  const { data: adminAccounts = [] } = useQuery({
    queryKey: ['/api/admin/list'],
    queryFn: () => apiRequest('/api/admin/list'),
    enabled: showManagementModal && isSuperAdmin
  });

  // Membership management mutations
  const approveMemberMutation = useMutation({
    mutationFn: async ({ userId, approvedBy }: { userId: number; approvedBy: string }) => {
      return await apiRequest(`/api/membership/approve/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ approvedBy }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/membership/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/membership/statistics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Member Approved",
        description: "The member has been approved successfully and can now access the catalog.",
      });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve member. Please try again.",
        variant: "destructive",
      });
    }
  });

  const renewMembershipMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/membership/renew/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/membership/expired'] });
      queryClient.invalidateQueries({ queryKey: ['/api/membership/statistics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Membership Renewed",
        description: "The membership has been renewed for 1 year.",
      });
    },
    onError: () => {
      toast({
        title: "Renewal Failed",
        description: "Failed to renew membership. Please try again.",
        variant: "destructive",
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
      const order = await apiRequest(`/api/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If there's an active shift, create a shift activity for this sale
      if (activeShift && order) {
        await apiRequest('/api/shift-activities', {
          method: 'POST',
          body: JSON.stringify({
            shiftId: activeShift.id,
            activityType: 'sale',
            activityId: order.id,
            description: `Order completed: ${order.pickupCode}`,
            amount: order.totalPrice,
            metadata: {
              pickupCode: order.pickupCode,
              items: order.items,
              quantities: order.quantities
            }
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Order Confirmed",
        description: activeShift ? "Order completed and linked to active shift." : "Order completed and stock quantities updated.",
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

  const createManualOrderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof manualOrderFormSchema>) => {
      const order = await apiRequest('/api/orders/manual', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If there's an active shift, create a shift activity for this sale
      if (activeShift && order) {
        await apiRequest('/api/shift-activities', {
          method: 'POST',
          body: JSON.stringify({
            shiftId: activeShift.id,
            activityType: 'sale',
            activityId: order.id,
            description: `Manual order created: ${order.pickupCode}`,
            amount: order.totalPrice,
            metadata: {
              pickupCode: order.pickupCode,
              items: order.items,
              quantities: order.quantities,
              manual: true
            }
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/analytics'] });
      setShowManualOrderForm(false);
      manualOrderForm.reset();
      toast({
        title: "Manual Order Created",
        description: `Order ${order.pickupCode} created successfully and stock updated.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create manual order. Please try again.",
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

  const stockMovementMutation = useMutation({
    mutationFn: async (data: z.infer<typeof stockMovementFormSchema>) => {
      // Add Madrid timezone timestamp
      const madridTime = new Date().toLocaleString("sv-SE", { 
        timeZone: "Europe/Madrid",
        hour12: false 
      });
      
      const movementData = {
        ...data,
        movementDate: madridTime
      };
      
      return await apiRequest('/api/stock-movements', {
        method: 'POST',
        body: JSON.stringify(movementData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowStockMovementForm(false);
      stockMovementForm.reset();
      toast({
        title: "Stock Moved Successfully",
        description: "Stock has been moved between storage locations.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Movement Failed",
        description: error.message || "Failed to move stock. Please try again.",
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

  const submitShiftReconciliationMutation = useMutation({
    mutationFn: async (productCounts: Record<number, number>) => {
      const reconciliation = await apiRequest('/api/shift-reconciliation', {
        method: 'POST',
        body: JSON.stringify({ 
          productCounts,
          cashInTill: cashBreakdown.cashInTill || '0',
          coins: cashBreakdown.coins || '0',
          notes: cashBreakdown.notes || '0'
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If there's an active shift, end it with the reconciliation data
      if (activeShift) {
        const shiftResult = await apiRequest(`/api/shifts/${activeShift.id}/reconcile`, {
          method: 'POST',
          body: JSON.stringify({ 
            productCounts, 
            adminNotes: '',
            cashInTill: cashBreakdown.cashInTill || '0',
            coins: cashBreakdown.coins || '0',
            notes: cashBreakdown.notes || '0'
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Return both reconciliation and email report data
        return { ...reconciliation, emailReport: shiftResult.emailReport };
      }
      
      return reconciliation;
    },
    onSuccess: (result) => {
      setReconciliationResult(result);
      setIsCountingMode(false);
      
      // Store email report if available
      if (result.emailReport) {
        setEmailReport(result.emailReport);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      refetchActiveShift();
      toast({
        title: activeShift ? "Shift Ended & Reconciliation Complete" : "Shift Reconciliation Complete",
        description: activeShift 
          ? `Shift ended with ${result.totalDiscrepancies || 0}g total discrepancies. Email report generated.`
          : "Inventory discrepancies have been calculated and recorded.",
      });
    },
    onError: (error: any) => {
      console.error('Reconciliation error:', error);
      let errorMessage = "Failed to submit reconciliation. Please try again.";
      
      if (error.message) {
        if (error.message.includes('constraint')) {
          errorMessage = "Database constraint error. Please contact support.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Check your connection and try again.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timed out. Please try again.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Reconciliation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const expense = await apiRequest('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If expense was linked to active shift, create shift activity
      if (data.shiftId && activeShift) {
        await apiRequest('/api/shift-activities', {
          method: 'POST',
          body: JSON.stringify({
            shiftId: data.shiftId,
            activityType: 'expense',
            activityId: expense.id,
            description: `Expense logged: ${data.description}`,
            amount: data.amount,
            metadata: {
              worker: data.workerName,
              description: data.description
            }
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setShowExpenseForm(false);
      expenseForm.reset();
      toast({
        title: "Expense Added",
        description: activeShift ? "Expense logged and linked to active shift." : "Expense has been logged successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof expenseFormSchema> }) => {
      return await apiRequest(`/api/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setShowExpenseForm(false);
      setEditingExpense(null);
      expenseForm.reset();
      toast({
        title: "Expense Updated",
        description: "Expense has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return await apiRequest(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setShowDeleteExpenseDialog(false);
      setDeletingExpense(null);
      toast({
        title: "Expense Deleted",
        description: "Expense has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startShiftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof startShiftFormSchema>) => {
      return await apiRequest('/api/shifts/start', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      setShowStartShiftDialog(false);
      startShiftForm.reset();
      toast({
        title: "Shift Started",
        description: "New shift has been started successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start shift. Please try again.",
        variant: "destructive",
      });
    }
  });

  const endShiftMutation = useMutation({
    mutationFn: async (shiftId: number) => {
      return await apiRequest(`/api/shifts/${shiftId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      setShowEndShiftDialog(false);
      toast({
        title: "Shift Ended",
        description: "Shift has been ended and totals calculated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to end shift. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Order management mutations
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiRequest(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      // Force refresh the orders data immediately
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.refetchQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order.",
        variant: "destructive",
      });
    }
  });

  const clearAllOrdersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/orders/clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Orders Cleared",
        description: "All orders have been archived from the control center.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear orders.",
        variant: "destructive",
      });
    }
  });

  // Admin management mutations
  const createAdminMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminCreationFormSchema>) => {
      const { confirmPassword, ...adminData } = data;
      return await apiRequest('/api/admin/create', {
        method: 'POST',
        body: JSON.stringify({ 
          ...adminData,
          role: 'admin'
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/list'] });
      setShowAdminCreationForm(false);
      adminCreationForm.reset();
      toast({
        title: "Admin Created",
        description: "New admin account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: number) => {
      return await apiRequest(`/api/admin/${adminId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/list'] });
      toast({
        title: "Admin Deleted",
        description: "Admin account has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete admin account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      return await apiRequest(`/api/users/${userId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ reason, bannedBy: 'Admin Panel' }),
        headers: { 
          'Content-Type': 'application/json',
          'x-admin': 'true'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User Banned",
        description: "User has been banned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to ban user. Please try again.",
        variant: "destructive",
      });
    }
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/users/${userId}/unban`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin': 'true'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User Unbanned",
        description: "User has been unbanned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unban user. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmitAdminCreation = (data: z.infer<typeof adminCreationFormSchema>) => {
    createAdminMutation.mutate(data);
  };

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

  // Shift reconciliation functions
  const handleStartShiftReconciliation = () => {
    console.log('END OF SHIFT BUTTON CLICKED!');
    setShowShiftReconciliation(true);
    setIsCountingMode(true);
    setPhysicalCounts({});
    setReconciliationResult(null);
    setCashBreakdown({
      cashInTill: '',
      coins: '',
      notes: ''
    });
  };

  const handlePhysicalCountChange = (productId: number, count: number) => {
    setPhysicalCounts(prev => ({
      ...prev,
      [productId]: count
    }));
  };

  const handleSubmitCounts = () => {
    submitShiftReconciliationMutation.mutate(physicalCounts);
  };

  const handleNewShiftReconciliation = () => {
    setIsCountingMode(true);
    setPhysicalCounts({});
    setReconciliationResult(null);
    setEmailReport('');
    setCashBreakdown({
      cashInTill: '',
      coins: '',
      notes: ''
    });
  };

  // Expense functions
  const handleCreateExpense = () => {
    console.log('EXPENSES LOG BUTTON CLICKED!');
    setEditingExpense(null);
    setShowExpenseForm(true);
    expenseForm.reset({
      description: '',
      amount: '',
      workerName: ''
    });
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
    expenseForm.reset({
      description: expense.description,
      amount: expense.amount,
      workerName: expense.workerName
    });
  };

  const handleDeleteExpense = (expense: any) => {
    setDeletingExpense(expense);
    setShowDeleteExpenseDialog(true);
  };

  const confirmDeleteExpense = () => {
    if (deletingExpense) {
      deleteExpenseMutation.mutate(deletingExpense.id);
    }
  };

  const onSubmitExpense = (data: z.infer<typeof expenseFormSchema>) => {
    // Add active shift ID to expense data if there's an active shift
    const expenseData = {
      ...data,
      shiftId: activeShift?.id || null
    };
    
    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data: expenseData });
    } else {
      createExpenseMutation.mutate(expenseData);
    }
  };

  // Manual order functions
  const handleCreateManualOrder = () => {
    setShowManualOrderForm(true);
    manualOrderForm.reset({
      items: [{ productId: 0, quantity: 1 }]
    });
  };

  const onSubmitManualOrder = (data: z.infer<typeof manualOrderFormSchema>) => {
    createManualOrderMutation.mutate(data);
  };

  const addOrderItem = () => {
    const currentItems = manualOrderForm.getValues('items');
    manualOrderForm.setValue('items', [...currentItems, { productId: 0, quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    const currentItems = manualOrderForm.getValues('items');
    if (currentItems.length > 1) {
      manualOrderForm.setValue('items', currentItems.filter((_, i) => i !== index));
    }
  };

  const calculateOrderTotal = () => {
    const items = manualOrderForm.watch('items') || [];
    return items.reduce((total, item) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (product && item.productId > 0 && item.quantity > 0) {
        // Use deal price first, then shelf price, then admin price as fallback
        let price = 0;
        if (product.dealPrice && parseFloat(product.dealPrice) > 0) {
          price = parseFloat(product.dealPrice);
        } else if (product.shelfPrice && parseFloat(product.shelfPrice) > 0) {
          price = parseFloat(product.shelfPrice);
        } else {
          price = parseFloat(product.adminPrice || '0');
        }
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  };

  const onSubmitStartShift = (data: z.infer<typeof startShiftFormSchema>) => {
    startShiftMutation.mutate(data);
  };

  const handleStartShift = () => {
    if (activeShift) {
      toast({
        title: "Active Shift Exists",
        description: `There is already an active shift started by ${activeShift.workerName}`,
        variant: "destructive",
      });
      return;
    }
    setShowStartShiftDialog(true);
  };

  const handleEndShift = () => {
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description: "There is no active shift to end.",
        variant: "destructive",
      });
      return;
    }
    setShowEndShiftDialog(true);
  };

  const confirmEndShift = async () => {
    if (activeShift) {
      try {
        // Calculate shift totals before ending shift
        const shiftSummary = await apiRequest(`/api/shifts/${activeShift.id}/summary`);
        
        // Navigate to shift reconciliation for stock counting
        window.scrollTo({ top: document.getElementById('reconciliation')?.offsetTop || 0, behavior: 'smooth' });
        setShowEndShiftDialog(false);
        
        // Show reconciliation section if not already visible
        // This will be handled by the reconciliation component when submitting
        toast({
          title: "Shift Ending Process",
          description: "Please complete stock reconciliation below to finalize shift totals.",
        });
        
      } catch (error) {
        console.error("Error getting shift summary:", error);
        // Fallback to basic end shift if summary fails
        endShiftMutation.mutate(activeShift.id);
      }
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

  const onSubmitStockMovement = (data: z.infer<typeof stockMovementFormSchema>) => {
    stockMovementMutation.mutate(data);
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


  // Calculate customer preferences
  const calculateCustomerPreferences = () => {
    if (!Array.isArray(analyticsOrders) || analyticsOrders.length === 0) return null;
    
    let sativaCount = 0, indicaCount = 0, hybridCount = 0;
    let cannabisCount = 0, hashCount = 0, ediblesCount = 0, preRollsCount = 0, caliPaxCount = 0, vapesCount = 0, waxCount = 0;
    const categoryCount: { [key: string]: number } = {};
    
    analyticsOrders.forEach((order: any) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const category = (item.category || '').toLowerCase();
          
          // Strain preference analysis
          if (category.includes('sativa')) sativaCount++;
          else if (category.includes('indica')) indicaCount++;
          else hybridCount++;
          
          // Enhanced product type analysis - cross-reference with products data for historical orders
          let actualProductType = '';
          
          // First, try exact productType match (for new orders)
          if (category === 'hash') {
            actualProductType = 'hash';
          } else if (category === 'edibles') {
            actualProductType = 'edibles';
          } else if (category === 'pre-rolls') {
            actualProductType = 'pre-rolls';
          } else if (category === 'cali pax') {
            actualProductType = 'cali pax';
          } else if (category === 'vapes') {
            actualProductType = 'vapes';
          } else if (category === 'wax') {
            actualProductType = 'wax';
          } else if (category === 'cannabis') {
            actualProductType = 'cannabis';
          } else {
            // For historical orders, find the product by name to get actual productType
            const product = Array.isArray(products) ? products.find((p: any) => p.name === item.name) : null;
            if (product && product.productType) {
              actualProductType = product.productType.toLowerCase();
            } else {
              // Fallback: identify hash products by name for historical data
              if (item.name && (item.name.toLowerCase().includes('hash') || item.name.toLowerCase().includes('moroccan') || item.name.toLowerCase().includes('dry-shift'))) {
                actualProductType = 'hash';
              } else {
                actualProductType = 'cannabis'; // Default fallback
              }
            }
          }
          
          // Count based on actual product type
          if (actualProductType === 'hash') {
            hashCount++;
          } else if (actualProductType === 'edibles') {
            ediblesCount++;
          } else if (actualProductType === 'pre-rolls') {
            preRollsCount++;
          } else if (actualProductType === 'cali pax') {
            caliPaxCount++;
          } else if (actualProductType === 'vapes') {
            vapesCount++;
          } else if (actualProductType === 'wax') {
            waxCount++;
          } else {
            cannabisCount++; // Cannabis and fallback
          }
          
          // Category counting
          categoryCount[item.category || 'Other'] = (categoryCount[item.category || 'Other'] || 0) + 1;
        });
      }
    });
    
    const total = sativaCount + indicaCount + hybridCount;
    const productTotal = cannabisCount + hashCount + ediblesCount + preRollsCount + caliPaxCount + vapesCount + waxCount;
    
    return {
      strainPreferences: {
        sativa: total > 0 ? Math.round((sativaCount / total) * 100) : 0,
        indica: total > 0 ? Math.round((indicaCount / total) * 100) : 0,
        hybrid: total > 0 ? Math.round((hybridCount / total) * 100) : 0
      },
      productPreferences: {
        cannabis: productTotal > 0 ? Math.round((cannabisCount / productTotal) * 100) : 0,
        hash: productTotal > 0 ? Math.round((hashCount / productTotal) * 100) : 0,
        edibles: productTotal > 0 ? Math.round((ediblesCount / productTotal) * 100) : 0,
        preRolls: productTotal > 0 ? Math.round((preRollsCount / productTotal) * 100) : 0,
        caliPax: productTotal > 0 ? Math.round((caliPaxCount / productTotal) * 100) : 0,
        vapes: productTotal > 0 ? Math.round((vapesCount / productTotal) * 100) : 0,
        wax: productTotal > 0 ? Math.round((waxCount / productTotal) * 100) : 0
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
        mostProfitable: null
      };
    }

    let totalStockValue = 0;
    let totalStock = 0;
    let potentialRevenue = 0;
    const lowStockItems: Array<{name: string, stock: number, critical: boolean, urgent: boolean}> = [];
    let mostProfitable: {name: string, price: number, stock: number, value: number} | null = null;
    let maxProfitability = 0;

    (products as any[]).forEach((product: any) => {
      const stock = product.stockQuantity || 0;
      const price = parseFloat(product.adminPrice) || 0;
      const value = stock * price;
      
      totalStock += stock;
      totalStockValue += value;
      potentialRevenue += value;

      // Low stock alerts with proper thresholds
      if (stock <= 50) {
        const isCritical = stock <= 25; // Critical for 25g and under
        const isUrgent = stock > 25 && stock <= 50;   // Urgent for 26-50g
        
        if (isCritical || isUrgent) {
          lowStockItems.push({
            name: product.name,
            stock: stock,
            critical: isCritical, // Critical for 25g and under, Urgent for 26-50g
            urgent: isUrgent
          });
        }
      }

      // Most profitable calculation based on actual sales revenue
      const productRevenue = Array.isArray(analyticsOrders) ? analyticsOrders
        .filter((order: any) => order.status === 'completed')
        .reduce((total: number, order: any) => {
          if (order.items && Array.isArray(order.items)) {
            const productItems = order.items.filter((item: any) => item.name === product.name);
            if (productItems.length > 0) {
              // Get quantities for this product in this order
              const quantities = order.quantities || [];
              const productQuantity = quantities.find((q: any) => q.productId === product.id)?.quantity || 1;
              return total + (price * productQuantity);
            }
          }
          return total;
        }, 0) : 0;
      
      if (productRevenue > maxProfitability) {
        maxProfitability = productRevenue;
        mostProfitable = {
          name: product.name,
          price: price,
          stock: stock,
          value: productRevenue
        };
      }

    });

    const averageStock = (products as any[]).length > 0 ? Math.round(totalStock / (products as any[]).length) : 0;

    return {
      totalStockValue: Math.round(totalStockValue),
      totalStock,
      averageStock,
      lowStockItems,
      potentialRevenue: Math.round(potentialRevenue),
      mostProfitable
    };
  };

  const analytics = calculateAnalytics();
  
  // Enhanced customer search functionality
  const getCustomerProfile = (userId: number) => {
    // Filter for only completed orders for this user
    const userOrders = analyticsOrders.filter((order: any) => 
      order.userId === userId && order.status === 'completed'
    );
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) return null;
    
    // Calculate spending summary (only from completed orders)
    const totalSpent = userOrders.reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice || '0'), 0);
    const averageOrderValue = userOrders.length > 0 ? Math.round(totalSpent / userOrders.length) : 0;
    
    // Only calculate preferences if user has orders
    let preferences = {
      sativa: 0,
      indica: 0, 
      hybrid: 0,
      cannabis: 0,
      hash: 0,
      edibles: 0,
      preRolls: 0,
      caliPax: 0,
      vapes: 0,
      wax: 0
    };
    
    if (userOrders.length > 0) {
      let sativaCount = 0, indicaCount = 0, hybridCount = 0;
      let cannabisCount = 0, hashCount = 0, ediblesCount = 0, preRollsCount = 0, caliPaxCount = 0, vapesCount = 0, waxCount = 0;
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
            
            // Enhanced product type preferences - cross-reference with products data for historical orders
            let actualProductType = '';
            
            // First, try exact productType match (for new orders)
            if (category === 'hash') {
              actualProductType = 'hash';
            } else if (category === 'edibles') {
              actualProductType = 'edibles';
            } else if (category === 'pre-rolls') {
              actualProductType = 'pre-rolls';
            } else if (category === 'cali pax') {
              actualProductType = 'cali pax';
            } else if (category === 'vapes') {
              actualProductType = 'vapes';
            } else if (category === 'wax') {
              actualProductType = 'wax';
            } else if (category === 'cannabis') {
              actualProductType = 'cannabis';
            } else {
              // For historical orders, find the product by name to get actual productType
              const product = Array.isArray(products) ? products.find((p: any) => p.name === item.name) : null;
              if (product && product.productType) {
                actualProductType = product.productType.toLowerCase();
              } else {
                // Fallback: identify hash products by name for historical data
                if (item.name && (item.name.toLowerCase().includes('hash') || item.name.toLowerCase().includes('moroccan') || item.name.toLowerCase().includes('dry-shift'))) {
                  actualProductType = 'hash';
                } else {
                  actualProductType = 'cannabis'; // Default fallback
                }
              }
            }
            
            // Count based on actual product type
            if (actualProductType === 'hash') {
              hashCount++;
            } else if (actualProductType === 'edibles') {
              ediblesCount++;
            } else if (actualProductType === 'pre-rolls') {
              preRollsCount++;
            } else if (actualProductType === 'cali pax') {
              caliPaxCount++;
            } else if (actualProductType === 'vapes') {
              vapesCount++;
            } else if (actualProductType === 'wax') {
              waxCount++;
            } else {
              cannabisCount++; // Cannabis and fallback
            }
          });
        }
      });
      
      if (totalItems > 0) {
        preferences = {
          sativa: Math.round((sativaCount / totalItems) * 100),
          indica: Math.round((indicaCount / totalItems) * 100),
          hybrid: Math.round((hybridCount / totalItems) * 100),
          cannabis: Math.round((cannabisCount / totalItems) * 100),
          hash: Math.round((hashCount / totalItems) * 100),
          edibles: Math.round((ediblesCount / totalItems) * 100),
          preRolls: Math.round((preRollsCount / totalItems) * 100),
          caliPax: Math.round((caliPaxCount / totalItems) * 100),
          vapes: Math.round((vapesCount / totalItems) * 100),
          wax: Math.round((waxCount / totalItems) * 100)
        };
      }
    }
    
    return {
      user,
      orderCount: userOrders.length,
      totalSpent,
      averageOrderValue,
      preferences,
      recentOrders: userOrders.slice(0, 5).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    };
  };
  
  // Enhanced filtering with better search logic
  const filteredUsers = users.filter((user: any) => {
    if (!searchQuery.trim()) return false;
    
    // Exclude admin accounts from customer search
    if (user.role === 'admin' || user.role === 'superadmin' || user.email === 'admin123@gmail.com') {
      return false;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const firstName = (user.firstName || '').toLowerCase();
    const lastName = (user.lastName || '').toLowerCase();
    
    return fullName.includes(query) || 
           email.includes(query) || 
           firstName.includes(query) || 
           lastName.includes(query);
  }).filter((user: any) => {
    // Only show users who have at least made one order or have complete profile info
    const hasOrders = analyticsOrders.some((order: any) => order.userId === user.id);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="mobile-h1 font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mobile-text-sm text-gray-600 mt-1">Social Club Management</p>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
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
              onClick={handleStartShiftReconciliation}
              className="bg-orange-600 hover:bg-orange-700 text-white mobile-btn-md mobile-touch-target w-full sm:w-auto"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              <span className="mobile-text-sm">End of Shift</span>
            </Button>
            
            <Button
              onClick={handleCreateExpense}
              className="bg-purple-600 hover:bg-purple-700 text-white mobile-btn-md mobile-touch-target w-full sm:w-auto"
            >
              <Receipt className="w-4 h-4 mr-2" />
              <span className="mobile-text-sm">Expenses Log</span>
            </Button>

            {isSuperAdmin && (
              <Button
                onClick={() => setShowManagementModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white mobile-btn-md mobile-touch-target w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="mobile-text-sm">Management</span>
              </Button>
            )}

            <Button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white mobile-btn-md mobile-touch-target w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="mobile-text-sm">Logout</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div id="overview" className="mobile-admin-grid mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-blue-700">
                {membershipStats ? membershipStats.approved + membershipStats.renewed : 0}
              </div>
              <p className="mobile-text-xs text-muted-foreground">Approved members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-orange-700">
                {membershipStats ? membershipStats.pending : 0}
              </div>
              <p className="mobile-text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Active Members</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-green-700">
                {membershipStats ? membershipStats.active : 0}
              </div>
              <p className="mobile-text-xs text-muted-foreground">Recently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-text-xs font-medium">Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-lg font-bold text-purple-700">€{analytics.totalStockValue}</div>
              <p className="mobile-text-xs text-muted-foreground">Total inventory</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 sm:mb-8">
            {/* Mobile: Horizontal Scrollable Tabs */}
            <div className="block sm:hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex w-max min-w-full">
                  <TabsTrigger value="shift-management" className="whitespace-nowrap px-3 py-2 text-sm">
                    Shift Mgmt
                  </TabsTrigger>
                  <TabsTrigger value="orders-members" className="whitespace-nowrap px-3 py-2 text-sm">
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="members" className="whitespace-nowrap px-3 py-2 text-sm">
                    Members
                  </TabsTrigger>
                  <TabsTrigger value="stock-inventory" className="whitespace-nowrap px-3 py-2 text-sm">
                    Stock
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="whitespace-nowrap px-3 py-2 text-sm">
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="expenses" className="whitespace-nowrap px-3 py-2 text-sm">
                    Expenses
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="whitespace-nowrap px-3 py-2 text-sm">
                    Logs
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            {/* Desktop: Grid Layout */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="shift-management">Shift Management</TabsTrigger>
                <TabsTrigger value="orders-members">Orders</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="stock-inventory">Stock & Inventory</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Shift Management Tab */}
          <TabsContent value="shift-management">
            {/* Active Shift Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Current Shift Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  {activeShift ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <PlayCircle className="w-3 h-3 mr-1" />
                            ACTIVE
                          </Badge>
                          <span className="font-medium text-blue-700">Worker: {activeShift.workerName}</span>
                        </div>
                        <Button
                          onClick={handleStartShiftReconciliation}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <StopCircle className="w-4 h-4 mr-2" />
                          End Shift
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-sm text-blue-600">
                          <div className="font-medium">Shift ID</div>
                          <div>{activeShift.shiftId}</div>
                        </div>
                        <div className="text-sm text-blue-600">
                          <div className="font-medium">Started</div>
                          <div>{new Date(activeShift.startTime).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                        </div>
                        <div className="text-sm text-blue-600">
                          <div className="font-medium">Duration</div>
                          <div>{Math.floor((new Date().getTime() - new Date(activeShift.startTime).getTime()) / (1000 * 60))} minutes</div>
                        </div>
                      </div>
                      
                      {/* Real-time shift totals */}
                      <div className="pt-3 border-t border-blue-200">
                        <h4 className="font-medium text-blue-700 mb-2">Current Shift Collections</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-green-600 font-medium">
                              Sales: €{(() => {
                                const shiftOrders = Array.isArray(orders) ? orders.filter((order: any) => 
                                  order.status === "completed" &&
                                  new Date(order.createdAt) >= new Date(activeShift.startTime)
                                ) : [];
                                return shiftOrders.reduce((sum: number, order: any) => 
                                  sum + parseFloat(order.totalPrice || "0"), 0
                                ).toFixed(2);
                              })()}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">
                              Orders: {Array.isArray(orders) ? orders.filter((order: any) => 
                                order.status === "completed" &&
                                new Date(order.createdAt) >= new Date(activeShift.startTime)
                              ).length : 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-purple-600 font-medium">
                              Avg: €{(() => {
                                const shiftOrders = Array.isArray(orders) ? orders.filter((order: any) => 
                                  order.status === "completed" &&
                                  new Date(order.createdAt) >= new Date(activeShift.startTime)
                                ) : [];
                                if (shiftOrders.length === 0) return '0.00';
                                const total = shiftOrders.reduce((sum: number, order: any) => 
                                  sum + parseFloat(order.totalPrice || "0"), 0
                                );
                                return (total / shiftOrders.length).toFixed(2);
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center mb-3">
                        <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                          <PauseCircle className="w-3 h-3 mr-1" />
                          NO ACTIVE SHIFT
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">Start a new shift to begin tracking sales and activities</p>
                      <Button onClick={handleStartShift} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Start New Shift
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shift History */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Shift History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(shifts) && shifts.length > 0 ? (
                  <div className="space-y-4">
                    {shifts.filter((shift: any) => shift.endTime).slice(0, 1).map((shift: any) => (
                      <div key={shift.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge 
                                className={shift.endTime ? 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-green-100 text-green-800 border-green-300'}
                              >
                                {shift.endTime ? 'COMPLETED' : 'ACTIVE'}
                              </Badge>
                              <span className="font-medium text-gray-800">{shift.shiftId}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Worker: {shift.workerName}</div>
                                <div className="text-gray-600">Started: {new Date(shift.startTime).toLocaleString()}</div>
                                {shift.endTime && (
                                  <div className="text-gray-600">Ended: {new Date(shift.endTime).toLocaleString()}</div>
                                )}
                              </div>
                              <div>
                                {shift.totalSales !== undefined && (
                                  <div className="text-green-700 font-medium">Sales: €{shift.totalSales}</div>
                                )}
                                {shift.orderCount !== undefined && (
                                  <div className="text-blue-700">Orders: {shift.orderCount}</div>
                                )}
                                {shift.averageOrderValue !== undefined && (
                                  <div className="text-purple-700">Avg: €{shift.averageOrderValue}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No shift history available.</p>
                    <p className="text-sm">Completed shifts will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>



        {/* Start Shift Dialog */}
        <Dialog open={showStartShiftDialog} onOpenChange={setShowStartShiftDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-green-800 flex items-center">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start New Shift
              </DialogTitle>
            </DialogHeader>
            
            <Form {...startShiftForm}>
              <form onSubmit={startShiftForm.handleSubmit(onSubmitStartShift)} className="space-y-4">
                <FormField
                  control={startShiftForm.control}
                  name="workerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worker Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={startShiftForm.control}
                  name="startingTillAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Till Amount *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Only one shift can be active at a time. 
                    All expenses and sales during your shift will be automatically tracked.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStartShiftDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={startShiftMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {startShiftMutation.isPending ? 'Starting...' : 'Start Shift'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* End Shift Confirmation Dialog */}
        <AlertDialog open={showEndShiftDialog} onOpenChange={setShowEndShiftDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-700">
                <StopCircle className="w-5 h-5 mr-2" />
                End Current Shift
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end the current shift?
                <br /><br />
                {activeShift && (
                  <>
                    <strong>Shift ID:</strong> {activeShift.shiftId}
                    <br />
                    <strong>Worker:</strong> {activeShift.workerName}
                    <br />
                    <strong>Duration:</strong> {Math.floor((new Date().getTime() - new Date(activeShift.startTime).getTime()) / (1000 * 60))} minutes
                    <br /><br />
                  </>
                )}
                This will calculate all shift totals (sales, expenses, net amount) and prepare data for reconciliation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => setShowEndShiftDialog(false)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmEndShift}
                disabled={endShiftMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {endShiftMutation.isPending ? 'Ending...' : 'End Shift'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


          </TabsContent>
          
          {/* Orders & Members Tab */}
          <TabsContent value="orders-members">
            {/* Order Control Center */}
            <Card id="order-control-center" className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Control Center</CardTitle>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
                      toast({
                        title: "Refreshed",
                        description: "Order Control Center has been refreshed.",
                      });
                    }}
                    className="flex items-center mobile-touch-target"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    <span className="mobile-text-sm">Refresh</span>
                  </Button>
                  <Button 
                    onClick={handleCreateManualOrder}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white mobile-touch-target"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="mobile-text-sm">Add Manual Order</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      clearAllOrdersMutation.mutate();
                    }}
                    variant="destructive"
                    size="sm"
                    disabled={clearAllOrdersMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 mobile-touch-target"
                  >
                    <span className="mobile-text-sm">
                      {clearAllOrdersMutation.isPending ? 'Clearing...' : 'Clear All Orders'}
                    </span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(orders) && orders.length > 0 ? (
                    orders.filter((order: any) => 
                      order.archivedFromAdmin !== true && 
                      activeShift && 
                      new Date(order.createdAt) >= new Date(activeShift.startTime)
                    ).map((order: any) => (
                      <div key={order.id} className="border rounded-lg mobile-p-2 bg-white">
                        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
                          <div className={`flex-1 ${order.status === 'cancelled' ? 'opacity-60' : ''}`}>
                            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-3">
                              <Badge 
                                variant={order.status === 'pending' ? 'default' : order.status === 'completed' ? 'secondary' : order.status === 'cancelled' ? 'destructive' : 'outline'}
                                className={
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 w-fit' : 
                                  order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300 w-fit' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300 w-fit' : 
                                  'w-fit'
                                }
                              >
                                {order.status.toUpperCase()}
                              </Badge>
                              <span className={`font-mono mobile-text-sm ${order.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-blue-700'}`}>#{order.pickupCode}</span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="mobile-text-sm">
                                <strong>Customer:</strong> {users.find((u: any) => u.id === order.userId)?.firstName || 'Unknown'} {users.find((u: any) => u.id === order.userId)?.lastName || ''}
                              </div>
                              <div className="mobile-text-sm">
                                <strong>Items:</strong> {order.items && order.items.map((item: any) => item.name).join(', ')}
                              </div>
                              <div className="mobile-text-sm font-medium text-green-700">
                                <strong>Total:</strong> €{order.totalPrice}
                              </div>
                              <div className="mobile-text-xs text-gray-500">
                                Ordered: {new Date(order.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:ml-4">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => cancelOrderMutation.mutate(order.id)}
                                  size="sm"
                                  variant="destructive"
                                  disabled={cancelOrderMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700 text-white mobile-touch-target w-full sm:w-auto"
                                >
                                  <span className="mobile-text-sm">
                                    {cancelOrderMutation.isPending ? 'Canceling...' : 'Cancel'}
                                  </span>
                                </Button>
                                <Button
                                  onClick={() => confirmOrderMutation.mutate(order.id)}
                                  size="sm"
                                  disabled={confirmOrderMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white mobile-touch-target w-full sm:w-auto"
                                >
                                  <span className="mobile-text-sm">
                                    {confirmOrderMutation.isPending ? 'Confirming...' : 'Confirm/Complete'}
                                  </span>
                                </Button>
                              </>
                            )}
                            {order.status === 'completed' && (
                              <Badge className="bg-green-100 text-green-800 border-green-300 w-fit">
                                Completed
                              </Badge>
                            )}
                            {order.status === 'cancelled' && (
                              <Badge className="bg-red-100 text-red-800 border-red-300 w-fit">
                                Cancelled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No active orders in queue.</p>
                      <p className="text-sm">New orders will appear here for processing.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Members Tab */}
          <TabsContent value="members">
            {/* Pending Member Approvals */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <CardTitle className="flex items-center mobile-text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                    Pending Member Approvals
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/membership/pending'] });
                      toast({
                        title: "Refreshed",
                        description: "Pending approvals list has been refreshed.",
                      });
                    }}
                    className="flex items-center mobile-touch-target w-full sm:w-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    <span className="mobile-text-sm">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pendingMembers.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {pendingMembers.map((member: any) => (
                      <div key={member.id} className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mobile-p-2 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="flex flex-col">
                          <span className="mobile-text-sm font-medium">
                            {member.firstName && member.lastName 
                              ? `${member.firstName} ${member.lastName}` 
                              : member.email}
                          </span>
                          <span className="mobile-text-xs text-gray-500">{member.email}</span>
                          <span className="mobile-text-xs text-gray-400">
                            Registered: {new Date(member.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          onClick={() => approveMemberMutation.mutate({ 
                            userId: member.id, 
                            approvedBy: 'Admin Panel' 
                          })}
                          disabled={approveMemberMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white mobile-btn-sm mobile-touch-target w-full sm:w-auto"
                        >
                          <span className="mobile-text-sm">
                            {approveMemberMutation.isPending ? 'Approving...' : 'Approve'}
                          </span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-blue-600">
                    <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                    <p className="mobile-text-sm font-medium">All members approved!</p>
                    <p className="mobile-text-xs text-gray-500">No pending approvals</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
                            <div className="text-right space-y-2">
                              <div className="bg-blue-100 px-3 py-1 rounded-full">
                                <span className="text-sm font-semibold text-blue-800">
                                  {profile.orderCount} Completed
                                </span>
                              </div>
                              
                              {/* Membership Status & Expiry */}
                              <div className="space-y-1">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  user.membershipStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  user.membershipStatus === 'expired' ? 'bg-red-100 text-red-800' :
                                  user.membershipStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.membershipStatus?.toUpperCase() || 'UNKNOWN'}
                                </div>
                                {user.expiryDate && (
                                  <div className="text-xs text-gray-600">
                                    Expires: {new Date(user.expiryDate).toLocaleDateString()}
                                    <br />
                                    <span className={`font-medium ${
                                      new Date(user.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                                        ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      ({Math.ceil((new Date(user.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Ban Status */}
                              {user.isBanned && (
                                <div className="bg-red-100 border border-red-300 px-2 py-1 rounded">
                                  <span className="text-xs font-medium text-red-800">BANNED</span>
                                  {user.banReason && (
                                    <div className="text-xs text-red-600 mt-1">{user.banReason}</div>
                                  )}
                                </div>
                              )}
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
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Edibles:</span>
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-purple-600 h-2 rounded-full" 
                                          style={{width: `${profile.preferences.edibles}%`}}
                                        ></div>
                                      </div>
                                      <span className="font-bold text-purple-700 text-sm">{profile.preferences.edibles}%</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Pre-Rolls:</span>
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-purple-600 h-2 rounded-full" 
                                          style={{width: `${profile.preferences.preRolls}%`}}
                                        ></div>
                                      </div>
                                      <span className="font-bold text-purple-700 text-sm">{profile.preferences.preRolls}%</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Cali Pax:</span>
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-purple-600 h-2 rounded-full" 
                                          style={{width: `${profile.preferences.caliPax}%`}}
                                        ></div>
                                      </div>
                                      <span className="font-bold text-purple-700 text-sm">{profile.preferences.caliPax}%</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Vapes:</span>
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-purple-600 h-2 rounded-full" 
                                          style={{width: `${profile.preferences.vapes || 0}%`}}
                                        ></div>
                                      </div>
                                      <span className="font-bold text-purple-700 text-sm">{profile.preferences.vapes || 0}%</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Wax:</span>
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-purple-600 h-2 rounded-full" 
                                          style={{width: `${profile.preferences.wax || 0}%`}}
                                        ></div>
                                      </div>
                                      <span className="font-bold text-purple-700 text-sm">{profile.preferences.wax || 0}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                              <p className="text-gray-600">This customer hasn't completed any orders yet.</p>
                            </div>
                          )}
                          
                          {/* Completed Orders Only */}
                          {profile.recentOrders && profile.recentOrders.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-semibold text-gray-800 mb-3">Recent Completed Orders</h4>
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
                          
                          {/* Ban/Unban Actions */}
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-gray-800">Account Management</h4>
                              <div className="flex space-x-2">
                                {user.isBanned ? (
                                  <Button
                                    onClick={() => unbanUserMutation.mutate(user.id)}
                                    disabled={unbanUserMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                                  >
                                    {unbanUserMutation.isPending ? 'Unbanning...' : 'Unban User'}
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      const reason = prompt('Enter ban reason (optional):') || 'No reason provided';
                                      banUserMutation.mutate({ userId: user.id, reason });
                                    }}
                                    disabled={banUserMutation.isPending}
                                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2"
                                  >
                                    {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            {user.isBanned && user.bannedAt && (
                              <div className="mt-3 text-xs text-gray-600">
                                <p>Banned by: {user.bannedBy || 'Unknown'}</p>
                                <p>Banned on: {new Date(user.bannedAt).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
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
          </TabsContent>
          
          {/* Stock & Inventory Tab */}
          <TabsContent value="stock-inventory">
            {/* Low Stock Alerts */}
            <Card className="mb-6 sm:mb-8">
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
                          <Badge className={`mobile-text-xs ${
                            item.critical ? 'bg-red-100 text-red-800 border-red-300' : 
                            item.urgent ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-orange-100 text-orange-800 border-orange-300'
                          }`}>
                            {item.critical ? 'Critical' : item.urgent ? 'Urgent' : 'Low'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-green-600">
                    <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                    <p className="mobile-text-sm font-medium">All stock levels healthy!</p>
                    <p className="mobile-text-xs text-gray-500">No low stock alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dispensary Stock */}
            <Card id="dispensary-stock">
              <CardHeader className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle className="mobile-text-lg">Dispensary Stock</CardTitle>
                <Button 
                  onClick={handleCreateStock}
                  size="sm" 
                  className="flex items-center gap-2 mobile-touch-target w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span className="mobile-text-sm">Add New Stock Entry</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mobile-card-grid">
                  {Array.isArray(products) && products.map((product: any) => {
                    const totalAmount = (product.onShelfGrams || 0) + (product.internalGrams || 0) + (product.externalGrams || 0);
                    return (
                      <div key={product.id} className="border rounded-lg mobile-p-2 relative">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-2">
                            <h3 className="font-semibold mobile-text-base">{product.name}</h3>
                            <Badge className="mt-2 mobile-text-xs">{product.category}</Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStock(product);
                              }}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-8 w-8 mobile-touch-target"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product);
                              }}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 mobile-touch-target"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Stock Distribution */}
                        <div className="space-y-2">
                          <p className="mobile-text-sm font-medium text-blue-700">
                            Total: {totalAmount}g
                          </p>
                          <div className="mobile-text-xs text-gray-600 ml-2 space-y-1">
                            <p>On shelf: {product.onShelfGrams || 0}g</p>
                            <p>Internal: {product.internalGrams || 0}g</p>
                            <p>External: {product.externalGrams || 0}g</p>
                          </div>
                        </div>
                        
                        {/* Pricing */}
                        <div className="mt-3 space-y-1">
                          {product.dealPrice ? (
                            <>
                              <p className="mobile-text-sm text-green-700 font-semibold">
                                Deal: €{product.dealPrice}/g <Badge className="ml-1 bg-green-100 text-green-800 mobile-text-xs">Active</Badge>
                              </p>
                              <p className="mobile-text-sm text-gray-500 line-through">
                                Shelf: €{product.shelfPrice || product.adminPrice || '0'}/g
                              </p>
                              {(product.dealStartDate || product.dealEndDate) && (
                                <p className="mobile-text-xs text-green-600">
                                  {product.dealStartDate && `From: ${product.dealStartDate}`}
                                  {product.dealStartDate && product.dealEndDate && ' | '}
                                  {product.dealEndDate && `Until: ${product.dealEndDate}`}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="mobile-text-sm text-green-700">
                              Shelf: €{product.shelfPrice || product.adminPrice || '0'}/g
                            </p>
                          )}
                          <p className="mobile-text-sm text-gray-600">
                            Cost: €{product.costPrice || '0'}/g
                          </p>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
                          <p className="mobile-text-xs text-gray-500">
                            Code: {product.productCode}
                          </p>
                          {product.supplier && (
                            <p className="mobile-text-xs text-gray-500">
                              Supplier: {product.supplier}
                            </p>
                          )}
                          {product.lastUpdated && (
                            <p className="mobile-text-xs text-gray-400">
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

            {/* Stock Movement/Reload Section */}
            <Card className="mb-6 sm:mb-8">
              <CardHeader>
                <CardTitle className="flex items-center mobile-text-lg">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Stock Reload & Movement
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Move stock between internal, external, and shelf locations
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Internal to Shelf Movement */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Internal → Shelf
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">Move stock from internal storage to customer shelf</p>
                    <Button
                      onClick={() => {
                        stockMovementForm.setValue('fromLocation', 'internal');
                        stockMovementForm.setValue('toLocation', 'shelf');
                        setShowStockMovementForm(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Move to Shelf
                    </Button>
                  </div>

                  {/* External to Internal Movement */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      External → Internal
                    </h4>
                    <p className="text-sm text-green-700 mb-3">Move stock from external storage to internal</p>
                    <Button
                      onClick={() => {
                        stockMovementForm.setValue('fromLocation', 'external');
                        stockMovementForm.setValue('toLocation', 'internal');
                        setShowStockMovementForm(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Move to Internal
                    </Button>
                  </div>

                  {/* Custom Movement */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Custom Movement
                    </h4>
                    <p className="text-sm text-purple-700 mb-3">Choose any source and destination locations</p>
                    <Button
                      onClick={() => {
                        stockMovementForm.reset();
                        setShowStockMovementForm(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      Custom Move
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
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
                    <p className="mobile-text-lg font-bold text-blue-700">€{(() => {
                      const completedOrders = Array.isArray(analyticsOrders) ? analyticsOrders.filter((order: any) => order.status === 'completed') : [];
                      if (completedOrders.length === 0) return '0';
                      const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice || '0'), 0);
                      return Math.round(totalRevenue / completedOrders.length);
                    })()}</p>
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
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Edibles:</span>
                          <span className="font-bold text-green-700">{customerPrefs.productPreferences.edibles}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pre-Rolls:</span>
                          <span className="font-bold text-green-700">{customerPrefs.productPreferences.preRolls}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cali Pax:</span>
                          <span className="font-bold text-green-700">{customerPrefs.productPreferences.caliPax}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Vapes:</span>
                          <span className="font-bold text-green-700">{customerPrefs.productPreferences.vapes || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Wax:</span>
                          <span className="font-bold text-green-700">{customerPrefs.productPreferences.wax || 0}%</span>
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

            {/* Product Performance */}
            <Card className="mb-6 sm:mb-8">
              <CardHeader>
                <CardTitle className="flex items-center mobile-text-base">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                  Product Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {analytics.mostProfitable && (analytics.mostProfitable as any).value > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg mobile-p-3">
                      <h4 className="mobile-text-sm font-semibold text-green-800 mb-2">Most Profitable Product</h4>
                      <p className="mobile-text-base font-bold text-green-700">{(analytics.mostProfitable as any).name}</p>
                      <p className="mobile-text-xs text-green-600 mt-1">
                        Total revenue from completed orders: €{(analytics.mostProfitable as any).value.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </TabsContent>
          
          {/* Expenses Tab */}
          <TabsContent value="expenses">
            {/* Expenses Management Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-purple-800">Expenses Management</h2>
                <p className="text-purple-600">Track and manage shift expenses</p>
              </div>
              <Button 
                onClick={handleCreateExpense}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Expense
              </Button>
            </div>

            {/* Expenses organized by shifts */}
            <div className="space-y-6">
              {/* Get only current shift and most recent previous shift with expenses */}
              {(() => {
                const shiftsWithExpenses = [];
                
                // Add current/active shift if it exists (even if no expenses yet)
                if (activeShift) {
                  shiftsWithExpenses.push(activeShift);
                }
                
                // Add the most recent completed shift that has expenses
                const completedShifts = Array.isArray(shifts) ? shifts
                  .filter((shift: any) => shift.endTime) // Only completed shifts
                  .sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()) // Sort by end time descending
                  : [];
                
                // Find the most recent completed shift that has expenses
                const mostRecentWithExpenses = completedShifts.find((shift: any) => {
                  const shiftExpenses = Array.isArray(expenses) ? expenses.filter((expense: any) => 
                    expense.shiftId === shift.id
                  ) : [];
                  return shiftExpenses.length > 0;
                });
                
                if (mostRecentWithExpenses) {
                  shiftsWithExpenses.push(mostRecentWithExpenses);
                }

                if (shiftsWithExpenses.length === 0) {
                  return (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Expenses Recorded</h3>
                        <p className="text-gray-500 mb-4">Start adding expenses to track your operational costs.</p>
                      </CardContent>
                    </Card>
                  );
                }

                return shiftsWithExpenses.map((shift: any, index: number) => {
                  const isActiveShift = !shift.endTime && activeShift?.id === shift.id;
                  const shiftExpenses = Array.isArray(expenses) ? expenses.filter((expense: any) => 
                    expense.shiftId === shift.id
                  ) : [];
                  const totalExpenses = shiftExpenses.reduce((sum: number, expense: any) => 
                    sum + parseFloat(expense.amount || "0"), 0
                  );

                  return (
                    <Card key={shift.id} className={`${isActiveShift ? 'ring-2 ring-purple-200 bg-purple-50' : 'bg-white'}`}>
                      {/* Shift Header */}
                      <div className="px-4 py-3 border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className={`font-semibold ${isActiveShift ? 'text-purple-800' : 'text-gray-800'}`}>
                              {isActiveShift ? 'Current Shift Expenses' : 'Previous Shift Expenses'}
                            </h3>
                            <p className={`text-sm ${isActiveShift ? 'text-purple-600' : 'text-gray-600'}`}>
                              {isActiveShift ? `${shift.shiftId} - ${shift.workerName}` : `Worker: ${shift.workerName} • ${new Date(shift.endTime).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${isActiveShift ? 'text-purple-700' : 'text-gray-700'}`}>
                              €{totalExpenses.toFixed(2)}
                            </div>
                            <div className={`text-sm ${isActiveShift ? 'text-purple-600' : 'text-gray-600'}`}>
                              {shiftExpenses.length} expenses
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expenses List for this shift */}
                      <div className="p-4">
                        {shiftExpenses.length > 0 ? (
                          <div className="space-y-3">
                            {shiftExpenses.map((expense: any) => (
                              <div key={expense.id} className="border rounded-lg p-3 bg-white">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-semibold">{expense.description}</h4>
                                      <div className="text-right">
                                        <div className="font-bold text-lg text-green-600">€{expense.amount}</div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {expense.workerName}
                                      </div>
                                      <div className="flex items-center">
                                        <Timer className="w-4 h-4 mr-1" />
                                        {new Date(expense.expenseDate || expense.createdAt).toLocaleString('en-GB', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Only show edit/delete buttons for current shift or allow editing of all */}
                                  <div className="flex space-x-2 ml-4">
                                    <Button
                                      onClick={() => {
                                        setEditingExpense(expense);
                                        expenseForm.reset({
                                          description: expense.description,
                                          amount: expense.amount.toString(),
                                          workerName: expense.workerName
                                        });
                                        setShowExpenseForm(true);
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setDeletingExpense(expense);
                                        setShowDeleteExpenseDialog(true);
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No expenses recorded for this shift.</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                });
              })()}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Stock & Inventory Logs</h2>
                <p className="text-gray-600">Complete audit trail of all stock operations organized by shifts</p>
              </div>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500">Chronological view by shifts</span>
              </div>
            </div>

            <StockLogsTab />
          </TabsContent>
        </Tabs>

        {/* Global Dialogs - Available from all tabs */}
        
        {/* Stock Management Modal - GLOBAL */}
        <Dialog open={showStockForm} onOpenChange={setShowStockForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-blue-800">
                {editingStock ? 'Edit Stock Entry' : 'Add New Stock Entry'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-2">
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
                                <FormLabel>Product Code *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter product code" 
                                    {...field} 
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {!isSimplifiedProductType(watchedProductType) && (
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
                          )}
                          
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
                                    <SelectItem value="Cali Pax">Cali Pax</SelectItem>
                                    <SelectItem value="Edibles">Edibles</SelectItem>
                                    <SelectItem value="Pre-Rolls">Pre-Rolls</SelectItem>
                                    <SelectItem value="Vapes">Vapes</SelectItem>
                                    <SelectItem value="Wax">Wax</SelectItem>
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
                        
                        {!isSimplifiedProductType(watchedProductType) && (
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
                        )}
                        
                        {/* Stock Distribution */}
                        <div className="space-y-4 mb-6">
                          <h5 className="font-medium text-sm text-blue-700">
                            Stock Distribution ({isSimplifiedProductType(watchedProductType) ? 'units' : 'grams'})
                          </h5>
                          <div className={`grid grid-cols-1 gap-4 ${isSimplifiedProductType(watchedProductType) ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
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
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '') {
                                          field.onChange(0);
                                        } else {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue)) {
                                            field.onChange(numValue);
                                          }
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {!isSimplifiedProductType(watchedProductType) && (
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
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '') {
                                            field.onChange(0);
                                          } else {
                                            const numValue = parseInt(value, 10);
                                            if (!isNaN(numValue)) {
                                              field.onChange(numValue);
                                            }
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                            
                            {!isSimplifiedProductType(watchedProductType) && (
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
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '') {
                                            field.onChange(0);
                                          } else {
                                            const numValue = parseInt(value, 10);
                                            if (!isNaN(numValue)) {
                                              field.onChange(numValue);
                                            }
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                          
                          {/* Total calculation display */}
                          <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800">
                              Total Stock Amount: {(stockForm.watch('onShelfGrams') || 0) + (stockForm.watch('internalGrams') || 0) + (stockForm.watch('externalGrams') || 0)}{isSimplifiedProductType(watchedProductType) ? ' units' : 'g'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Pricing */}
                        <div className="space-y-4">
                          <h5 className="font-medium text-sm text-blue-700">
                            Pricing (€ per {isSimplifiedProductType(watchedProductType) ? 'unit' : 'gram'})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={stockForm.control}
                              name="costPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cost Price</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00" 
                                      {...field} 
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        let value = e.target.value;
                                        // Remove leading zeros, but keep decimal values
                                        if (value && value !== '0' && value !== '0.') {
                                          value = value.replace(/^0+(?=\d)/, '');
                                        }
                                        field.onChange(value);
                                      }}
                                    />
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
                                    <Input 
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00" 
                                      {...field} 
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        let value = e.target.value;
                                        // Remove leading zeros, but keep decimal values
                                        if (value && value !== '0' && value !== '0.') {
                                          value = value.replace(/^0+(?=\d)/, '');
                                        }
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Deal Pricing Section */}
                          <div className="space-y-4 pt-4 border-t border-blue-200">
                            <h6 className="font-medium text-sm text-green-700 flex items-center">
                              <Tag className="w-4 h-4 mr-2" />
                              Deal Pricing (Optional)
                            </h6>
                            <p className="text-xs text-gray-600 mb-3">
                              Set special pricing that overrides shelf price in admin systems
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={stockForm.control}
                                name="dealPrice"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Deal Price</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00" 
                                        {...field} 
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          let value = e.target.value;
                                          if (value && value !== '0' && value !== '0.') {
                                            value = value.replace(/^0+(?=\d)/, '');
                                          }
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={stockForm.control}
                                name="dealStartDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="date"
                                        {...field} 
                                        value={field.value || ''}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={stockForm.control}
                                name="dealEndDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="date"
                                        {...field} 
                                        value={field.value || ''}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* Remove Deal Button */}
                            {(stockForm.watch('dealPrice') || stockForm.watch('dealStartDate') || stockForm.watch('dealEndDate')) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  stockForm.setValue('dealPrice', '');
                                  stockForm.setValue('dealStartDate', '');
                                  stockForm.setValue('dealEndDate', '');
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Remove Deal
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Section 4: Worker Signature */}
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                          <ClipboardCheck className="w-5 h-5 mr-2" />
                          Worker Signature
                        </h4>
                        <p className="text-sm text-orange-700 mb-4">Required for tracking who made changes to inventory</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={stockForm.control}
                            name="workerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Worker Name *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your full name" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={stockForm.control}
                            name="entryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Entry Date *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
          </DialogContent>
        </Dialog>
        
        {/* Expense Form Dialog */}
        <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-purple-800 flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(onSubmitExpense)} className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description/Reason *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (€) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">€</span>
                          <Input 
                            type="number"
                            step="0.01"
                            className="pl-8"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="workerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worker Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExpenseForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {editingExpense ? 
                      (updateExpenseMutation.isPending ? 'Updating...' : 'Update Expense') : 
                      (createExpenseMutation.isPending ? 'Adding...' : 'Add Expense')
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Expense Confirmation Dialog */}
        <AlertDialog open={showDeleteExpenseDialog} onOpenChange={setShowDeleteExpenseDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this expense entry?
                <br /><br />
                <strong>Description:</strong> {deletingExpense?.description}
                <br />
                <strong>Amount:</strong> €{deletingExpense?.amount}
                <br />
                <strong>Worker:</strong> {deletingExpense?.workerName}
                <br /><br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setShowDeleteExpenseDialog(false);
                  setDeletingExpense(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteExpense}
                disabled={deleteExpenseMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteExpenseMutation.isPending ? 'Deleting...' : 'Delete Expense'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Product Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product?
                <br /><br />
                <strong>Product:</strong> {deletingProduct?.name}
                <br />
                <strong>Category:</strong> {deletingProduct?.category}
                <br />
                <strong>Code:</strong> {deletingProduct?.productCode}
                <br /><br />
                This action cannot be undone and will remove the product from both stock management and customer catalog.
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

        {/* End of Shift Reconciliation Dialog */}
        <Dialog open={showShiftReconciliation} onOpenChange={setShowShiftReconciliation}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-orange-800 flex items-center">
                <Timer className="w-5 h-5 mr-2" />
                End of Shift - Inventory Reconciliation
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {isCountingMode ? (
                // Physical Counting Mode
                <div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-orange-800 mb-2">Physical Stock Count</h3>
                    <p className="text-sm text-orange-700">
                      Weigh and enter the actual amount of each product currently on the shelf. 
                      Do not include internal or external storage amounts.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(products) && products.map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{product.name}</h4>
                            <Badge className="mt-1">{product.category}</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Physical Count ({product.productType && ['Pre-Rolls', 'Edibles'].includes(product.productType) ? 'units' : 'grams'} on shelf)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={physicalCounts[product.id] || ''}
                            onChange={(e) => handlePhysicalCountChange(product.id, parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cash Breakdown Section */}
                  <div className="mt-8 pt-6 border-t">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-green-800 mb-2">Cash Breakdown</h3>
                      <p className="text-sm text-green-700">
                        Enter the cash amounts counted at the end of your shift.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Cash in Till (€)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={cashBreakdown.cashInTill}
                          onChange={(e) => setCashBreakdown(prev => ({ ...prev, cashInTill: e.target.value }))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Coins (count)
                        </label>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={cashBreakdown.coins}
                          onChange={(e) => setCashBreakdown(prev => ({ ...prev, coins: e.target.value }))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Notes (count)
                        </label>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={cashBreakdown.notes}
                          onChange={(e) => setCashBreakdown(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowShiftReconciliation(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitCounts}
                      disabled={submitShiftReconciliationMutation.isPending || Object.keys(physicalCounts).length === 0}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {submitShiftReconciliationMutation.isPending ? 'Processing...' : 'Submit Counts'}
                    </Button>
                  </div>
                </div>
              ) : (
                // Results Display Mode
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-green-800 mb-2">Reconciliation Complete</h3>
                    <p className="text-sm text-green-700">
                      Shift reconciliation completed at {new Date().toLocaleString()}
                    </p>
                  </div>
                  
                  {reconciliationResult && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {reconciliationResult.totalDiscrepancies || 0}g
                              </div>
                              <div className="text-sm text-gray-600">Total Discrepancies</div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {Object.values(reconciliationResult.discrepancies || {}).filter((d: any) => d.type === 'missing').length}
                              </div>
                              <div className="text-sm text-gray-600">Products with Missing Stock</div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {Object.values(reconciliationResult.discrepancies || {}).filter((d: any) => d.type === 'excess').length}
                              </div>
                              <div className="text-sm text-gray-600">Products with Excess Stock</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Money Reconciliation Display */}
                      {reconciliationResult && reconciliationResult.cashInTill !== undefined && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3">Money Reconciliation</h4>
                          <Card>
                            <CardContent className="p-4">
                              {(() => {
                                // Use same calculation logic as email report
                                const actualCashInTill = parseFloat(reconciliationResult.cashInTill || '0');
                                
                                // Get shift data from recent shifts to calculate expected till
                                let expectedTillAmount = 0;
                                let startingTill = 0;
                                let totalSales = 0;
                                let totalExpenses = 0;
                                
                                // Find the current or most recent shift that matches this reconciliation
                                const recentShift = Array.isArray(shifts) && shifts.length > 0 ? shifts[0] : null;
                                
                                if (recentShift && recentShift.startingTillAmount) {
                                  startingTill = parseFloat(recentShift.startingTillAmount) || 0;
                                  totalSales = parseFloat(recentShift.totalSales || '0');
                                  totalExpenses = parseFloat(recentShift.totalExpenses || '0');
                                  
                                  // Expected till amount = Starting till + Sales - Expenses (same as email report)
                                  expectedTillAmount = startingTill + totalSales - totalExpenses;
                                }
                                
                                const moneyDifference = actualCashInTill - expectedTillAmount;
                                
                                return (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <div className="text-gray-600">Expected in till:</div>
                                        <div className="font-medium">₳{expectedTillAmount.toFixed(2)}</div>
                                      </div>
                                      <div>
                                        <div className="text-gray-600">Actual in till:</div>
                                        <div className="font-medium">₳{actualCashInTill.toFixed(2)}</div>
                                      </div>
                                    </div>
                                    <div className="pt-3 border-t">
                                      {Math.abs(moneyDifference) < 0.01 ? (
                                        <div className="text-green-700 font-medium flex items-center">
                                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                          Money is all correct
                                        </div>
                                      ) : moneyDifference > 0 ? (
                                        <div className="text-blue-700 font-medium flex items-center">
                                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                          ₳{moneyDifference.toFixed(2)} excess
                                        </div>
                                      ) : (
                                        <div className="text-red-700 font-medium flex items-center">
                                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                          ₳{Math.abs(moneyDifference).toFixed(2)} missing
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      
                      {Object.keys(reconciliationResult.discrepancies || {}).length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Discrepancy Details</h4>
                          <div className="space-y-3">
                            {Object.entries(reconciliationResult.discrepancies || {}).map(([productId, discrepancy]: [string, any]) => (
                              <div key={productId} className={`border rounded-lg p-4 ${
                                discrepancy.type === 'missing' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                              }`}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{discrepancy.productName}</div>
                                    <div className="text-sm text-gray-600">
                                      Physical count: {discrepancy.actual}{discrepancy.productType && ['Pre-Rolls', 'Edibles'].includes(discrepancy.productType) ? ' units' : 'g'}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={discrepancy.type === 'missing' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                                      {Math.abs(discrepancy.difference)}{discrepancy.productType && ['Pre-Rolls', 'Edibles'].includes(discrepancy.productType) ? ' units' : 'g'} {discrepancy.type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {Object.keys(reconciliationResult.discrepancies || {}).length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-green-600 text-lg font-semibold mb-2">Perfect Match!</div>
                          <div className="text-gray-600">All physical counts match expected on-shelf amounts.</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Email Report Section */}
                  {emailReport && (
                    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">Email Report</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(emailReport);
                            toast({
                              title: "Copied!",
                              description: "Email report copied to clipboard",
                            });
                          }}
                          className="text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Report
                        </Button>
                      </div>
                      <textarea
                        readOnly
                        value={emailReport}
                        className="w-full h-48 p-3 bg-white border rounded text-sm font-mono text-gray-700 resize-none"
                        placeholder="Email report will appear here after reconciliation..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This formatted report can be copied and pasted into emails for operational documentation.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowShiftReconciliation(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleNewShiftReconciliation}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      New Reconciliation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Management Modal */}
        <Dialog open={showManagementModal} onOpenChange={setShowManagementModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-indigo-800">
                Admin Account Management
              </DialogTitle>
              <p className="text-sm text-gray-600">Create and manage admin accounts for the cannabis dispensary system</p>
            </DialogHeader>
            <div className="p-4">
              {!showAdminCreationForm ? (
                <div className="space-y-6">
                  {/* Admin Creation Section */}
                  <div className="text-center py-6 border-b">
                    <Settings className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Account Management</h3>
                    <p className="text-gray-600 mb-4">Create new admin accounts and manage existing ones</p>
                    <Button 
                      onClick={() => setShowAdminCreationForm(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Admin Account
                    </Button>
                  </div>

                  {/* Existing Admin Accounts */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Existing Admin Accounts</h4>
                    {adminAccounts.filter((admin: any) => admin.role === 'admin').length > 0 ? (
                      <div className="space-y-3">
                        {adminAccounts.filter((admin: any) => admin.role === 'admin').map((admin: any) => (
                          <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {admin.firstName} {admin.lastName}
                                </div>
                                <div className="text-sm text-gray-600">{admin.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">Admin</Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deleteAdminMutation.isPending}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete admin account for ${admin.firstName} ${admin.lastName}?`)) {
                                    deleteAdminMutation.mutate(admin.id);
                                  }
                                }}
                              >
                                {deleteAdminMutation.isPending ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No admin accounts created yet.</p>
                        <p className="text-sm">Create your first admin account above.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Admin Creation Form */
                <Form {...adminCreationForm}>
                  <form onSubmit={adminCreationForm.handleSubmit(onSubmitAdminCreation)} className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Admin Account</h3>
                      <p className="text-gray-600">Fill in the details to create a new admin account</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={adminCreationForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={adminCreationForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={adminCreationForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminCreationForm.control}
                      name="workerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Worker Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter worker display name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={adminCreationForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter password (min 8 chars)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={adminCreationForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAdminCreationForm(false);
                          adminCreationForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createAdminMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {createAdminMutation.isPending ? 'Creating...' : 'Create Admin Account'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Manual Order Form Dialog */}
        <Dialog open={showManualOrderForm} onOpenChange={setShowManualOrderForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-green-700">
                <Plus className="w-5 h-5 mr-2" />
                Create Manual Order
              </DialogTitle>
            </DialogHeader>
            
            <Form {...manualOrderForm}>
              <form onSubmit={manualOrderForm.handleSubmit(onSubmitManualOrder)} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Quick Order Entry:</strong> Select products and quantities for customers who know what they want. 
                    Stock will be automatically reduced and the order will be linked to the active shift.
                  </p>
                </div>

                {manualOrderForm.watch('items')?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800">Item #{index + 1}</h4>
                      {manualOrderForm.watch('items')?.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={manualOrderForm.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product: any) => {
                                    const hasDeal = product.dealPrice && parseFloat(product.dealPrice) > 0;
                                    const displayPrice = hasDeal ? product.dealPrice : (product.shelfPrice || product.adminPrice);
                                    const originalPrice = product.shelfPrice || product.adminPrice;
                                    
                                    return (
                                      <SelectItem key={product.id} value={product.id.toString()}>
                                        <div className="flex flex-col">
                                          <div className="flex items-center space-x-2">
                                            <span>{product.name}</span>
                                            {hasDeal && (
                                              <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">
                                                DEAL
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-600 mt-1">
                                            {hasDeal ? (
                                              <span>
                                                €{displayPrice}/g <span className="line-through text-gray-400">€{originalPrice}/g</span> • {product.onShelfGrams || 0}g available
                                              </span>
                                            ) : (
                                              <span>€{displayPrice}/g • {product.onShelfGrams || 0}g available</span>
                                            )}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={manualOrderForm.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity (grams) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="0"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  // Remove leading zeros, but keep single zero
                                  if (value && value !== '0') {
                                    value = value.replace(/^0+(?=\d)/, '');
                                  }
                                  const numValue = parseInt(value) || 0;
                                  field.onChange(numValue);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOrderItem}
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Another Item
                  </Button>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-700">
                      Total: €{calculateOrderTotal().toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {manualOrderForm.watch('items')?.length || 0} item(s)
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowManualOrderForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createManualOrderMutation.isPending || calculateOrderTotal() === 0}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {createManualOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Stock Movement Dialog */}
        <Dialog open={showStockMovementForm} onOpenChange={setShowStockMovementForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-blue-800">
                Move Stock Between Locations
              </DialogTitle>
            </DialogHeader>
            
            <Form {...stockMovementForm}>
              <form onSubmit={stockMovementForm.handleSubmit(onSubmitStockMovement)} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Stock Movement:</strong> Transfer stock between internal storage, external storage, and customer shelf locations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={stockMovementForm.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product *</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product: any) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} (Total: {(product.onShelfGrams || 0) + (product.internalGrams || 0) + (product.externalGrams || 0)}g)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stockMovementForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (grams) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="0"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={stockMovementForm.control}
                    name="fromLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Location *</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select source location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="internal">Internal Storage</SelectItem>
                              <SelectItem value="external">External Storage</SelectItem>
                              <SelectItem value="shelf">Customer Shelf</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stockMovementForm.control}
                    name="toLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Location *</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="internal">Internal Storage</SelectItem>
                              <SelectItem value="external">External Storage</SelectItem>
                              <SelectItem value="shelf">Customer Shelf</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={stockMovementForm.control}
                  name="workerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worker Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stockMovementForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes about this stock movement..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show current stock levels for selected product */}
                {stockMovementForm.watch('productId') > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-2">Current Stock Levels</h4>
                    {(() => {
                      const selectedProduct = products.find((p: any) => p.id === stockMovementForm.watch('productId'));
                      if (!selectedProduct) return null;
                      return (
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>Internal: {selectedProduct.internalGrams || 0}g</div>
                          <div>External: {selectedProduct.externalGrams || 0}g</div>
                          <div>Shelf: {selectedProduct.onShelfGrams || 0}g</div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStockMovementForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={stockMovementMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {stockMovementMutation.isPending ? 'Moving...' : 'Move Stock'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}