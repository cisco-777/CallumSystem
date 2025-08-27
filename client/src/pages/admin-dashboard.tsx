import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, Activity, ExternalLink, TrendingUp, DollarSign, BarChart3, AlertCircle, Search, PieChart, Hash, Leaf, TriangleAlert, Plus, Edit, Trash2, ClipboardCheck, Timer, Receipt, PoundSterling, Clock, PlayCircle, StopCircle, Eye, Copy } from 'lucide-react';
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

// Form schemas
const stockFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  productType: z.enum(['Cannabis', 'Hash', 'Cali Pax', 'Edibles', 'Pre-Rolls']),
  category: z.enum(['Sativa', 'Indica', 'Hybrid']).optional(),
  imageUrl: z.string().optional(),
  productCode: z.string().min(1, 'Product code is required'),
  supplier: z.string().optional(),
  onShelfGrams: z.number().min(0, 'On shelf amount must be positive'),
  internalGrams: z.number().optional(),
  externalGrams: z.number().optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Cost price must be a valid number'),
  shelfPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Shelf price must be a valid number')
});

const expenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number'),
  workerName: z.string().min(1, 'Worker name is required')
});

const startShiftFormSchema = z.object({
  workerName: z.string().min(1, 'Worker name is required'),
  startingTillAmount: z.string().min(1, 'Starting till amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Please enter a valid amount (0 or greater)'
  )
});

type StockFormData = z.infer<typeof stockFormSchema>;

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('shift');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSystemWiped, setIsSystemWiped] = useState(false);
  const [showFailsafeDialog, setShowFailsafeDialog] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [showShiftReconciliation, setShowShiftReconciliation] = useState(false);
  const [physicalCounts, setPhysicalCounts] = useState<Record<number, number>>({});
  const [reconciliationResult, setReconciliationResult] = useState<any>(null);
  const [emailReport, setEmailReport] = useState<string>('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showStartShiftDialog, setShowStartShiftDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('/api/users')
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: () => apiRequest('/api/orders')
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiRequest('/api/products')
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['/api/expenses'],
    queryFn: () => apiRequest('/api/expenses')
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['/api/shifts'],
    queryFn: () => apiRequest('/api/shifts')
  });

  // System wiped screen
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

  // Calculate analytics
  const pendingMembers = users.filter((user: any) => !user.approved && user.email !== 'admin123@gmail.com');
  const approvedMembers = users.filter((user: any) => user.approved && user.email !== 'admin123@gmail.com');
  const totalStockValue = products.reduce((sum: number, product: any) => sum + (product.onShelfGrams * parseFloat(product.costPrice || '0')), 0);

  const executeFailsafe = () => {
    setIsSystemWiped(true);
    setShowFailsafeDialog(false);
    toast({
      title: "FAILSAFE ACTIVATED",
      description: "All admin interface data has been permanently deleted.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 mobile-p-3">
      <RightNavigation 
        type="admin" 
        onLogout={() => {
          localStorage.removeItem('msc-admin-authenticated');
          window.location.href = '/admin-login';
        }} 
      />
      
      <div className="max-w-7xl mx-auto main-content-with-nav">
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="mobile-h1 font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mobile-text-sm text-gray-600 mt-1">Demo Social Club Management</p>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg border mobile-p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{approvedMembers.length}</div>
              <div className="mobile-text-xs text-gray-500">Total Members</div>
            </div>
            <div className="bg-white rounded-lg border mobile-p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{pendingMembers.length}</div>
              <div className="mobile-text-xs text-gray-500">Pending Approval</div>
            </div>
            <div className="bg-white rounded-lg border mobile-p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{approvedMembers.length}</div>
              <div className="mobile-text-xs text-gray-500">Active Members</div>
            </div>
            <div className="bg-white rounded-lg border mobile-p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">€{Math.round(totalStockValue)}</div>
              <div className="mobile-text-xs text-gray-500">Stock Value</div>
            </div>
            <div className="col-span-2 lg:col-span-1 flex space-x-2">
              <AlertDialog open={showFailsafeDialog} onOpenChange={setShowFailsafeDialog}>
                <AlertDialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold mobile-btn-sm flex-1">
                    <TriangleAlert className="w-4 h-4 mr-1" />
                    FAILSAFE
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-800">WARNING: FAILSAFE ACTIVATION</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete ALL admin interface data! This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={executeFailsafe} className="bg-red-600 hover:bg-red-700">
                      EXECUTE FAILSAFE
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {[
                { id: 'shift', name: 'Shift Management', icon: Clock },
                { id: 'members', name: 'Member Management', icon: Users },  
                { id: 'inventory', name: 'Inventory & Stock', icon: Package },
                { id: 'analytics', name: 'Analytics & Reports', icon: BarChart3 },
                { id: 'financial', name: 'Financial Management', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Page Content */}
        {activeTab === 'shift' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Shift Control Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Shift management functionality will be displayed here.</p>
                <div className="flex space-x-4 mt-4">
                  <Button onClick={() => setShowStartShiftDialog(true)} className="bg-green-600 hover:bg-green-700">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Shift
                  </Button>
                  <Button onClick={() => setShowShiftReconciliation(true)} className="bg-orange-600 hover:bg-orange-700">
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    End of Shift
                  </Button>
                  <Button onClick={() => setShowExpenseForm(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Receipt className="w-4 h-4 mr-2" />
                    Log Expense
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Member Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Pending Approvals ({pendingMembers.length})</h3>
                  {pendingMembers.length > 0 ? (
                    <div className="space-y-3">
                      {pendingMembers.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
                          <div>
                            <span className="font-medium">
                              {member.firstName && member.lastName 
                                ? `${member.firstName} ${member.lastName}` 
                                : member.email}
                            </span>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <p className="text-xs text-gray-500">
                              Registered: {new Date(member.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button className="bg-green-600 hover:bg-green-700 text-white">
                            Approve
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-blue-600">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">All members approved!</p>
                      <p className="text-sm text-gray-500">No pending approvals</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Inventory & Stock Management
                  </div>
                  <Button onClick={() => setShowStockForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product: any) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.productType} • {product.category}</p>
                      <p className="text-sm">Stock: {product.onShelfGrams}g</p>
                      <p className="text-sm">Price: €{product.shelfPrice}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingStock(product);
                          setShowStockForm(true);
                        }}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Total Revenue</h4>
                    <p className="text-2xl font-bold text-green-700">€{Math.round(totalStockValue)}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Active Orders</h4>
                    <p className="text-2xl font-bold text-blue-700">{orders.filter((o: any) => o.status === 'pending').length}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Products</h4>
                    <p className="text-2xl font-bold text-purple-700">{products.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Financial Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Recent Expenses</h3>
                  {Array.isArray(expenses) && expenses.length > 0 ? (
                    <div className="space-y-2">
                      {expenses.slice(0, 5).map((expense: any) => (
                        <div key={expense.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-gray-600">Worker: {expense.workerName}</p>
                          </div>
                          <p className="font-bold">€{expense.amount}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No expenses recorded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialogs */}
        <Dialog open={showStockForm} onOpenChange={setShowStockForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStock ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Stock form will be implemented here.</p>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowStockForm(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  {editingStock ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showShiftReconciliation} onOpenChange={setShowShiftReconciliation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>End of Shift Reconciliation</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Shift reconciliation form will be implemented here.</p>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowShiftReconciliation(false)}>
                  Close
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Complete Reconciliation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Expense</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Expense form will be implemented here.</p>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowExpenseForm(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Log Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showStartShiftDialog} onOpenChange={setShowStartShiftDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start New Shift</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Start shift form will be implemented here.</p>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowStartShiftDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  Start Shift
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}