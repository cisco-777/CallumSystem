import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, Activity, ExternalLink, TrendingUp, DollarSign, BarChart3, AlertCircle, Search, PieChart, Hash, Leaf, QrCode, TriangleAlert, Plus, Edit, Trash2, ClipboardCheck, Timer, Receipt, PoundSterling, Clock, PlayCircle, StopCircle, Eye, Copy } from 'lucide-react';
import { RightNavigation } from '@/components/right-navigation';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ObjectUploader } from '@/components/ObjectUploader';
import type { UploadResult } from '@uppy/core';


// Base form schema for all product types
const baseStockFormSchema = z.object({
  // Common fields for all product types
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  productType: z.enum(['Cannabis', 'Hash', 'Cali Pax', 'Edibles', 'Pre-Rolls']),
  imageUrl: z.string().optional(),
  productCode: z.string().min(1, 'Product code is required'),
  onShelfGrams: z.number().min(0, 'On shelf amount must be positive'),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Cost price must be a valid number'),
  shelfPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Shelf price must be a valid number')
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

type UnifiedStockFormData = z.infer<typeof unifiedStockFormSchema>;
type StockFormData = UnifiedStockFormData; // For backward compatibility

// Helper function to determine if a product type requires simplified form
const isSimplifiedProductType = (productType: string) => {
  return productType === 'Pre-Rolls' || productType === 'Edibles';
};

// Helper function to get appropriate schema based on product type
const getFormSchema = (productType: string) => {
  return isSimplifiedProductType(productType) ? simplifiedStockFormSchema : fullStockFormSchema;
};


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
  const { toast } = useToast();
  const queryClient = useQueryClient();


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
      costPrice: '0',
      shelfPrice: '0'
    }
  });

  // Watch product type to dynamically change validation schema
  const watchedProductType = stockForm.watch('productType');
  
  useEffect(() => {
    const currentSchema = getFormSchema(watchedProductType);
    stockForm.clearErrors(); // Clear any existing validation errors
    
    // Update resolver with new schema
    const newResolver = zodResolver(currentSchema);
    stockForm.resolver = newResolver;
  }, [watchedProductType]);

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


        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Membership Approval Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Pending Member Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingMembers.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {pendingMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between mobile-p-2 rounded-lg bg-orange-50 border border-orange-200">
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
                        className="bg-green-600 hover:bg-green-700 text-white mobile-btn-sm"
                      >
                        {approveMemberMutation.isPending ? 'Approving...' : 'Approve'}
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

        {/* Stock Management Modal */}
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
                                        const value = e.target.value;
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
                                        const value = e.target.value;
                                        field.onChange(value);
                                      }}
                                    />
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
          </DialogContent>
        </Dialog>

        {/* Shift Management Section */}
        <Card id="shift-management" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Shift Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Active Shift Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-blue-800 text-lg mb-2">Current Shift Status</h3>
                    {activeShift ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <PlayCircle className="w-3 h-3 mr-1" />
                            ACTIVE
                          </Badge>
                          <span className="font-medium text-blue-700">Worker: {activeShift.workerName}</span>
                        </div>
                        <div className="text-sm text-blue-600">
                          <div>Shift ID: {activeShift.shiftId}</div>
                          <div>Started: {new Date(activeShift.startTime).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                          <div>Duration: {Math.floor((new Date().getTime() - new Date(activeShift.startTime).getTime()) / (1000 * 60))} minutes</div>
                        </div>
                        
                        {/* Real-time shift totals */}
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <h4 className="font-medium text-blue-700 mb-2">Current Shift Totals</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-green-600 font-medium">
                                Sales: £{(() => {
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
                              <span className="text-red-600 font-medium">
                                Expenses: £{(() => {
                                  const shiftExpenses = Array.isArray(expenses) ? expenses.filter((expense: any) => 
                                    expense.shiftId === activeShift.id
                                  ) : [];
                                  return shiftExpenses.reduce((sum: number, expense: any) => 
                                    sum + parseFloat(expense.amount || "0"), 0
                                  ).toFixed(2);
                                })()}
                              </span>
                            </div>
                            <div>
                              <span className="text-blue-700 font-medium">
                                Net: £{(() => {
                                  const shiftOrders = Array.isArray(orders) ? orders.filter((order: any) => 
                                    order.status === "completed" &&
                                    new Date(order.createdAt) >= new Date(activeShift.startTime)
                                  ) : [];
                                  const sales = shiftOrders.reduce((sum: number, order: any) => 
                                    sum + parseFloat(order.totalPrice || "0"), 0
                                  );
                                  const shiftExpenses = Array.isArray(expenses) ? expenses.filter((expense: any) => 
                                    expense.shiftId === activeShift.id
                                  ) : [];
                                  const expenseTotal = shiftExpenses.reduce((sum: number, expense: any) => 
                                    sum + parseFloat(expense.amount || "0"), 0
                                  );
                                  return (sales - expenseTotal).toFixed(2);
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-gray-600 border-gray-300">
                          <StopCircle className="w-3 h-3 mr-1" />
                          NO ACTIVE SHIFT
                        </Badge>
                        <p className="text-sm text-gray-600">No worker is currently logged in for a shift</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    {!activeShift ? (
                      <Button 
                        onClick={handleStartShift}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Shift
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleEndShift}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <StopCircle className="w-4 h-4 mr-2" />
                        End Shift
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Shifts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">Recent Shifts</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/shifts'] })}
                  >
                    Refresh
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {Array.isArray(shifts) && shifts.length > 0 ? (
                    shifts.slice(0, 5).map((shift: any) => (
                      <div key={shift.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge 
                                variant={shift.status === 'active' ? 'default' : 'secondary'}
                                className={shift.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                              >
                                {shift.status === 'active' ? <PlayCircle className="w-3 h-3 mr-1" /> : <StopCircle className="w-3 h-3 mr-1" />}
                                {shift.status.toUpperCase()}
                              </Badge>
                              <span className="font-medium text-blue-700">{shift.shiftId}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center mb-1">
                                  <Users className="w-4 h-4 mr-1 text-gray-500" />
                                  <span className="font-medium">{shift.workerName}</span>
                                </div>
                                <div className="text-gray-600">
                                  Started: {new Date(shift.startTime).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {shift.endTime && (
                                  <div className="text-gray-600">
                                    Ended: {new Date(shift.endTime).toLocaleString('en-GB', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                              </div>
                              
                              {shift.status === 'completed' && (
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-green-600">Sales:</span>
                                    <span className="font-medium text-green-700">€{shift.totalSales || '0.00'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-red-600">Expenses:</span>
                                    <span className="font-medium text-red-700">€{shift.totalExpenses || '0.00'}</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-1">
                                    <span className="font-medium">Net:</span>
                                    <span className={`font-bold ${parseFloat(shift.netAmount || '0') >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                      €{shift.netAmount || '0.00'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {shift.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-4"
                              onClick={() => {
                                // TODO: Navigate to shift summary page
                                toast({
                                  title: "Shift Summary",
                                  description: "Shift summary page will be available soon.",
                                });
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No shifts recorded yet.</p>
                      <p className="text-sm">Start your first shift to begin tracking.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

        {/* Expenses Log Section */}
        <Card id="expenses-log" className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Expenses Log
            </CardTitle>
            <Button 
              onClick={handleCreateExpense}
              size="sm" 
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent>
            {(() => {
              if (!Array.isArray(expenses) || !Array.isArray(shifts)) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Loading expenses...</p>
                  </div>
                );
              }

              // Get relevant shifts: current active shift + 1 most recent completed shift
              const completedShifts = shifts
                .filter((shift: any) => shift.status === 'completed')
                .sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
                .slice(0, 1);
              
              const relevantShifts = activeShift ? [activeShift, ...completedShifts] : completedShifts;
              
              if (relevantShifts.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No shifts available</p>
                    <p className="text-sm">Start a shift above to begin tracking expenses.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {relevantShifts.map((shift: any, index: number) => {
                    const isActiveShift = shift.status === 'active';
                    const shiftExpenses = expenses.filter((expense: any) => expense.shiftId === shift.id);
                    const totalExpenses = shiftExpenses.reduce((sum: number, expense: any) => 
                      sum + parseFloat(expense.amount || 0), 0
                    );

                    return (
                      <div key={shift.id} className={`border rounded-lg ${isActiveShift ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
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
                                £{totalExpenses.toFixed(2)}
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
                                          <div className="font-bold text-lg text-green-600">£{expense.amount}</div>
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
                                    
                                    {/* Only show edit/delete buttons for current shift */}
                                    {isActiveShift && (
                                      <div className="flex space-x-2 ml-4">
                                        <Button
                                          onClick={() => handleEditExpense(expense)}
                                          size="sm"
                                          variant="ghost"
                                          className="p-1 h-8 w-8"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          onClick={() => handleDeleteExpense(expense)}
                                          size="sm"
                                          variant="ghost"
                                          className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">
                                {isActiveShift ? 'No expenses logged for current shift yet.' : 'No expenses recorded for this shift.'}
                              </p>
                              {isActiveShift && (
                                <p className="text-xs text-gray-400 mt-1">Click "Add Expense" above to record an expense.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>

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
                      <FormLabel>Amount (£) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            type="number"
                            step="0.01"
                            className="pl-10"
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
                <strong>Amount:</strong> £{deletingExpense?.amount}
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
                          Cash in Till (£)
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
                          Coins (£)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={cashBreakdown.coins}
                          onChange={(e) => setCashBreakdown(prev => ({ ...prev, coins: e.target.value }))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Notes (£)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
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


      </div>
    </div>
  );
}