import {
  users,
  products,
  basketItems,
  donations,
  orders,
  shiftReconciliations,
  expenses,
  expensePayments,
  shifts,
  shiftActivities,
  stockMovements,
  stockLogs,
  emailReports,
  type User,
  type InsertUser,
  type Product,
  type BasketItem,
  type Donation,
  type Order,
  type InsertOrder,
  type ShiftReconciliation,
  type InsertShiftReconciliation,
  type Expense,
  type InsertExpense,
  type ExpensePayment,
  type InsertExpensePayment,
  type Shift,
  type InsertShift,
  type ShiftActivity,
  type InsertShiftActivity,
  type StockLog,
  type InsertStockLog,
  type EmailReport,
  type InsertEmailReport,
} from "@shared/schema";
import { getDb } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Role-based operations
  getUserRole(email: string): Promise<string | null>;
  isUserSuperAdmin(email: string): Promise<boolean>;
  isUserAdmin(email: string): Promise<boolean>;
  getAdminUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Membership management operations
  getPendingMembers(): Promise<User[]>;
  getApprovedMembers(): Promise<User[]>;
  getExpiredMembers(): Promise<User[]>;
  getRenewedMembers(): Promise<User[]>;
  getActiveMembers(): Promise<User[]>; // Recently active members
  approveMember(userId: number, approvedBy: string): Promise<User>;
  renewMembership(userId: number): Promise<User>;
  updateMemberActivity(userId: number): Promise<void>;
  getMembershipStatistics(): Promise<{
    pending: number;
    approved: number;
    expired: number;
    renewed: number;
    active: number;
  }>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: any): Promise<Product>;
  updateProductStock(id: number, stockData: any): Promise<Product>;
  createStockEntry(stockData: any): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Stock movement operations
  createStockMovement(movementData: any): Promise<any>;
  getStockMovements(): Promise<any[]>;
  
  // Stock log operations
  createStockLog(logData: InsertStockLog): Promise<StockLog>;
  getStockLogs(): Promise<StockLog[]>;
  getStockLogsByShift(shiftId: number): Promise<StockLog[]>;
  clearAllStockLogs(): Promise<void>;
  
  // Basket operations
  getBasketItems(userId: number): Promise<BasketItem[]>;
  addToBasket(userId: number, productId: number, quantity?: number): Promise<BasketItem>;
  removeFromBasket(id: number): Promise<void>;
  clearBasket(userId: number): Promise<void>;
  
  // Donation operations
  createDonation(userId: number, items: any[], totalAmount: string): Promise<Donation>;
  getUserDonations(userId: number): Promise<Donation[]>;
  
  // Order operations
  createOrder(orderData: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByPickupCode(pickupCode: string): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getAllOrdersForAnalytics(): Promise<Order[]>;
  updateOrderStatus(orderId: number, status: string): Promise<Order>;
  confirmOrderAndReduceStock(orderId: number): Promise<Order>;
  deleteAllOrders(): Promise<void>;
  
  // Shift reconciliation operations
  createShiftReconciliation(reconciliationData: InsertShiftReconciliation): Promise<ShiftReconciliation>;
  getShiftReconciliations(): Promise<ShiftReconciliation[]>;
  getShiftReconciliation(id: number): Promise<ShiftReconciliation | undefined>;
  
  // Expense operations
  createExpense(expenseData: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  updateExpense(id: number, updates: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  
  // Expense payment operations
  createExpensePayment(paymentData: InsertExpensePayment): Promise<ExpensePayment>;
  getExpensePayments(expenseId: number): Promise<ExpensePayment[]>;
  makePaymentOnExpense(expenseId: number, paymentAmount: number, workerName: string, shiftId?: number, notes?: string): Promise<{ expense: Expense; payment: ExpensePayment }>;
  getOutstandingExpenses(): Promise<Expense[]>;
  getShiftExpensePayments(shiftId: number): Promise<number>;
  
  // Shift operations
  createShift(shiftData: InsertShift): Promise<Shift>;
  getShifts(): Promise<Shift[]>;
  getShift(id: number): Promise<Shift | undefined>;
  getActiveShift(): Promise<Shift | undefined>;
  endShift(id: number, totals: { totalSales: string; totalExpenses: string; netAmount: string; stockDiscrepancies: string; reconciliationId?: number; }): Promise<Shift>;
  
  // Shift activity operations
  createShiftActivity(activityData: InsertShiftActivity): Promise<ShiftActivity>;
  getShiftActivities(shiftId: number): Promise<ShiftActivity[]>;
  
  // Enhanced methods with shift tracking
  getTodaysExpenses(): Promise<Expense[]>;
  getShiftSummary(shiftId: number): Promise<any>;

  // Email reports operations
  getAllEmailReports(): Promise<EmailReport[]>;
  storeEmailReport(reportData: InsertEmailReport): Promise<EmailReport>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    const db = await getDb();
    return await db.select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await getDb();
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Role-based operations
  async getUserRole(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    return user?.role || null;
  }

  async isUserSuperAdmin(email: string): Promise<boolean> {
    const role = await this.getUserRole(email);
    return role === 'superadmin';
  }

  async isUserAdmin(email: string): Promise<boolean> {
    const role = await this.getUserRole(email);
    return role === 'admin' || role === 'superadmin';
  }

  async getAdminUsers(): Promise<User[]> {
    const db = await getDb();
    return await db
      .select()
      .from(users)
      .where(sql`${users.role} = 'admin' OR ${users.role} = 'superadmin'`)
      .orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<void> {
    const db = await getDb();
    // First remove all related data for this user
    await db.delete(basketItems).where(eq(basketItems.userId, id));
    await db.delete(donations).where(eq(donations.userId, id));
    await db.delete(orders).where(eq(orders.userId, id));
    
    // Then delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  // Membership management operations
  async getPendingMembers(): Promise<User[]> {
    const db = await getDb();
    return await db
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'pending'))
      .orderBy(desc(users.createdAt));
  }

  async getApprovedMembers(): Promise<User[]> {
    const db = await getDb();
    return await db
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'approved'))
      .orderBy(desc(users.approvalDate));
  }

  async getExpiredMembers(): Promise<User[]> {
    const now = new Date();
    const db = await getDb();
    return await db
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'expired'))
      .orderBy(desc(users.expiryDate));
  }

  async getRenewedMembers(): Promise<User[]> {
    const db = await getDb();
    return await db
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'renewed'))
      .orderBy(desc(users.approvalDate));
  }

  async getActiveMembers(): Promise<User[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const db = await getDb();
    return await db
      .select()
      .from(users)
      .where(sql`${users.lastActive} > ${thirtyDaysAgo}`)
      .orderBy(desc(users.lastActive));
  }

  async approveMember(userId: number, approvedBy: string): Promise<User> {
    const approvalDate = new Date();
    const expiryDate = new Date(approvalDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from approval
    
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({
        membershipStatus: 'approved',
        approvalDate,
        expiryDate,
        approvedBy
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async renewMembership(userId: number): Promise<User> {
    const renewalDate = new Date();
    const expiryDate = new Date(renewalDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from renewal
    
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({
        membershipStatus: 'renewed',
        approvalDate: renewalDate, // Update approval date for renewal
        expiryDate,
        renewalCount: sql`${users.renewalCount} + 1`
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateMemberActivity(userId: number): Promise<void> {
    const db = await getDb();
    await db
      .update(users)
      .set({
        lastActive: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getMembershipStatistics(): Promise<{
    pending: number;
    approved: number;
    expired: number;
    renewed: number;
    active: number;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const db = await getDb();

    // Count pending members (exclude admin accounts)
    const [{ count: pending }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'pending' AND ${users.email} != 'admin123@gmail.com'`);

    // Count approved members (not expired, exclude admin accounts)
    const [{ count: approved }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'approved' AND ${users.expiryDate} > ${now} AND ${users.email} != 'admin123@gmail.com'`);

    // Count expired members (exclude admin accounts)
    const [{ count: expired }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'approved' AND ${users.expiryDate} <= ${now} AND ${users.email} != 'admin123@gmail.com'`);

    // Count renewed members (exclude admin accounts)
    const [{ count: renewed }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'renewed' AND ${users.email} != 'admin123@gmail.com'`);

    // Count active members (non-expired members only, exclude admin accounts)
    const [{ count: active }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.email} != 'admin123@gmail.com' AND ((${users.membershipStatus} = 'approved' AND ${users.expiryDate} > ${now}) OR ${users.membershipStatus} = 'renewed')`);

    return {
      pending: Number(pending) || 0,
      approved: Number(approved) || 0,
      expired: Number(expired) || 0,
      renewed: Number(renewed) || 0,
      active: Number(active) || 0
    };
  }

  async getNewMembersDuringShift(shiftStartTime: string | Date, shiftEndTime?: string | Date | null): Promise<number> {
    const startTime = new Date(shiftStartTime);
    const endTime = shiftEndTime ? new Date(shiftEndTime) : new Date(); // Use current time if shift is ongoing
    
    // Count new registrations during shift timeframe, exclude admin accounts
    const db = await getDb();
    const [{ count: newMembers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${startTime} AND ${users.createdAt} <= ${endTime} AND ${users.email} != 'admin123@gmail.com'`);
    
    return Number(newMembers) || 0;
  }

  async getProducts(): Promise<Product[]> {
    const db = await getDb();
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const db = await getDb();
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(productData: any): Promise<Product> {
    const db = await getDb();
    
    // Prepare product data with decimal values for NUMERIC database storage
    const processedData = { ...productData };
    if (productData.onShelfGrams !== undefined) processedData.onShelfGrams = productData.onShelfGrams.toString();
    if (productData.internalGrams !== undefined) processedData.internalGrams = productData.internalGrams.toString();
    if (productData.externalGrams !== undefined) processedData.externalGrams = productData.externalGrams.toString();
    if (productData.jarWeight !== undefined) processedData.jarWeight = productData.jarWeight.toString();
    if (productData.stockQuantity !== undefined) processedData.stockQuantity = Math.round(parseFloat(productData.stockQuantity.toString()));
    
    const [product] = await db
      .insert(products)
      .values(processedData)
      .returning();
    return product;
  }

  async updateProductStock(id: number, stockData: any): Promise<Product> {
    const db = await getDb();
    // Get current product to preserve existing values if not provided
    const [currentProduct] = await db.select().from(products).where(eq(products.id, id));
    if (!currentProduct) throw new Error("Product not found");

    // Calculate new stock values using provided data or current values
    // Handle decimal values directly since database now supports NUMERIC type
    const newOnShelfGrams = stockData.onShelfGrams !== undefined ? parseFloat(stockData.onShelfGrams.toString()) : parseFloat(currentProduct.onShelfGrams?.toString() || "0");
    const newInternalGrams = stockData.internalGrams !== undefined ? parseFloat(stockData.internalGrams.toString()) : parseFloat(currentProduct.internalGrams?.toString() || "0");
    const newExternalGrams = stockData.externalGrams !== undefined ? parseFloat(stockData.externalGrams.toString()) : parseFloat(currentProduct.externalGrams?.toString() || "0");
    const newTotalStock = Math.round(newOnShelfGrams + newInternalGrams + newExternalGrams);

    // Prepare stock data with decimal values for NUMERIC database fields
    const updateStockData = { ...stockData };
    if (stockData.onShelfGrams !== undefined) updateStockData.onShelfGrams = stockData.onShelfGrams.toString();
    if (stockData.internalGrams !== undefined) updateStockData.internalGrams = stockData.internalGrams.toString();
    if (stockData.externalGrams !== undefined) updateStockData.externalGrams = stockData.externalGrams.toString();
    if (stockData.jarWeight !== undefined) updateStockData.jarWeight = stockData.jarWeight.toString();

    const [product] = await db
      .update(products)
      .set({
        ...updateStockData,
        stockQuantity: newTotalStock,
        adminPrice: stockData.shelfPrice || currentProduct.adminPrice, // For backward compatibility
        lastUpdated: new Date()
      })
      .where(eq(products.id, id))
      .returning();
      
    // Create stock log entry for the edit
    try {
      const activeShift = await this.getActiveShift();
      const oldValues = {
        onShelfGrams: currentProduct.onShelfGrams,
        internalGrams: currentProduct.internalGrams,
        externalGrams: currentProduct.externalGrams,
        shelfPrice: currentProduct.shelfPrice,
        costPrice: currentProduct.costPrice,
        dealPrice: currentProduct.dealPrice
      };
      const newValues = {
        onShelfGrams: newOnShelfGrams,
        internalGrams: newInternalGrams,
        externalGrams: newExternalGrams,
        shelfPrice: stockData.shelfPrice || currentProduct.shelfPrice,
        costPrice: stockData.costPrice || currentProduct.costPrice,
        dealPrice: stockData.dealPrice !== undefined ? stockData.dealPrice : currentProduct.dealPrice
      };
      
      await this.createStockLog({
        shiftId: activeShift?.id || null,
        productId: product.id,
        actionType: 'product_edited',
        workerName: stockData.workerName || 'Unknown Worker',
        productName: product.name,
        oldValues,
        newValues,
        notes: `Product stock and pricing updated`
      });
    } catch (logError) {
      console.error('Failed to create stock log for product update:', logError);
    }
    
    return product;
  }

  async createStockEntry(stockData: any): Promise<Product> {
    const db = await getDb();
    const [product] = await db
      .insert(products)
      .values({
        ...stockData,
        stockQuantity: (stockData.onShelfGrams || 0) + (stockData.internalGrams || 0) + (stockData.externalGrams || 0),
        adminPrice: stockData.shelfPrice, // For backward compatibility
        lastUpdated: new Date()
      })
      .returning();
      
    // Create stock log entry for the new product
    try {
      const activeShift = await this.getActiveShift();
      await this.createStockLog({
        shiftId: activeShift?.id || null,
        productId: product.id,
        actionType: 'product_created',
        workerName: stockData.workerName || 'Unknown Worker',
        productName: product.name,
        newValues: {
          onShelfGrams: stockData.onShelfGrams || 0,
          internalGrams: stockData.internalGrams || 0,
          externalGrams: stockData.externalGrams || 0,
          shelfPrice: stockData.shelfPrice,
          costPrice: stockData.costPrice,
          dealPrice: stockData.dealPrice
        },
        notes: `New product created with initial stock`
      });
    } catch (logError) {
      console.error('Failed to create stock log for new product:', logError);
    }
    
    return product;
  }

  async getBasketItems(userId: number): Promise<BasketItem[]> {
    const db = await getDb();
    const items = await db.select({
      id: basketItems.id,
      userId: basketItems.userId,
      productId: basketItems.productId,
      quantity: basketItems.quantity,
      createdAt: basketItems.createdAt,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        imageUrl: products.imageUrl,
        category: products.category,
        productCode: products.productCode,
        isActive: products.isActive,
        createdAt: products.createdAt,
        shelfPrice: products.shelfPrice,
        dealPrice: products.dealPrice,
        adminPrice: products.adminPrice,
      }
    })
    .from(basketItems)
    .leftJoin(products, eq(basketItems.productId, products.id))
    .where(eq(basketItems.userId, userId));
    
    return items as any;
  }

  async addToBasket(userId: number, productId: number, quantity: number = 1): Promise<BasketItem> {
    const db = await getDb();
    const [item] = await db
      .insert(basketItems)
      .values({ userId, productId, quantity })
      .returning();
    return item;
  }

  async removeFromBasket(id: number): Promise<void> {
    const db = await getDb();
    await db.delete(basketItems).where(eq(basketItems.id, id));
  }

  async clearBasket(userId: number): Promise<void> {
    const db = await getDb();
    await db.delete(basketItems).where(eq(basketItems.userId, userId));
  }

  async createDonation(userId: number, items: any[], totalAmount: string): Promise<Donation> {
    const db = await getDb();
    const [donation] = await db
      .insert(donations)
      .values({ userId, items, totalAmount })
      .returning();
    return donation;
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    const db = await getDb();
    return await db.select().from(donations).where(eq(donations.userId, userId));
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const db = await getDb();
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByPickupCode(pickupCode: string): Promise<Order | undefined> {
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.pickupCode, pickupCode));
    return order || undefined;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const db = await getDb();
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    const db = await getDb();
    return await db.select().from(orders).where(eq(orders.archivedFromAdmin, false)).orderBy(desc(orders.createdAt));
  }

  async getAllOrdersForAnalytics(): Promise<Order[]> {
    // Return all orders including archived ones for analytics calculations
    const db = await getDb();
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const db = await getDb();
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async confirmOrderAndReduceStock(orderId: number): Promise<Order> {
    const db = await getDb();
    // Get order details
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new Error("Order not found");

    // Validate and reduce stock for each item
    for (const quantity of order.quantities as any[]) {
      // Get current product stock
      const [product] = await db.select().from(products).where(eq(products.id, quantity.productId));
      if (!product) throw new Error(`Product not found: ${quantity.productId}`);

      // Check if sufficient shelf stock is available
      const availableShelfStock = parseFloat(product.onShelfGrams?.toString() || "0");
      if (availableShelfStock < quantity.quantity) {
        if (availableShelfStock === 0) {
          throw new Error(`Item needs restocking - 0 on shelf`);
        } else {
          const unitType = ['Pre-Rolls', 'Edibles', 'Vapes'].includes(product.productType || '') ? ' units' : 'g';
          throw new Error(`Insufficient shelf stock for ${product.name}. Available: ${availableShelfStock}${unitType}, Required: ${quantity.quantity}${unitType}`);
        }
      }

      // Calculate new stock values - handle decimal quantities with precision
      const quantityAmount = parseFloat(quantity.quantity.toString());
      const newOnShelfGrams = availableShelfStock - quantityAmount;
      const internalGrams = parseFloat(product.internalGrams?.toString() || "0");
      const externalGrams = parseFloat(product.externalGrams?.toString() || "0");
      const newTotalStock = Math.round(newOnShelfGrams + internalGrams + externalGrams);

      // Prepare update data with decimal precision
      const updateData: any = {
        onShelfGrams: newOnShelfGrams.toString(),
        stockQuantity: newTotalStock,
        lastUpdated: new Date()
      };

      // For Cannabis products, also deduct from jar weight when processing orders
      if (product.productType === 'Cannabis' && product.jarWeight && parseFloat(product.jarWeight.toString()) > 0) {
        const currentJarWeight = parseFloat(product.jarWeight.toString());
        const newJarWeight = Math.max(0, currentJarWeight - quantityAmount);
        updateData.jarWeight = newJarWeight.toString();
      }

      // Update product stock quantities
      await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, quantity.productId));
    }

    // Update order status to completed
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: "completed" })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  }

  async deleteAllOrders(): Promise<void> {
    // Archive orders from admin view instead of deleting (preserves analytics data)
    const db = await getDb();
    await db.update(orders).set({ archivedFromAdmin: true });
  }

  async deleteProduct(id: number): Promise<void> {
    const db = await getDb();
    
    // Get product info before deletion to preserve in logs
    const productToDelete = await db.select().from(products).where(eq(products.id, id)).limit(1);
    const product = productToDelete[0];
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Get current active shift
    const activeShifts = await db.select().from(shifts).orderBy(desc(shifts.createdAt)).limit(1);
    const currentShift = activeShifts[0];
    
    // Create deletion log entry BEFORE deleting product
    await db.insert(stockLogs).values({
      shiftId: currentShift?.id || null,
      productId: id,
      actionType: 'product_deleted',
      workerName: 'Admin',
      actionDate: new Date(),
      productName: product.name,
      oldValues: {
        name: product.name,
        productType: product.productType,
        onShelfGrams: product.onShelfGrams,
        internalGrams: product.internalGrams,
        externalGrams: product.externalGrams,
        costPrice: product.costPrice,
        shelfPrice: product.shelfPrice
      },
      newValues: { status: 'deleted' },
      notes: `Product "${product.name}" has been deleted from inventory`
    });
    
    // DON'T delete stock logs - preserve them for audit trail
    // Instead, just remove basket items and the product itself
    await db.delete(basketItems).where(eq(basketItems.productId, id));
    
    // Finally delete the product itself
    await db.delete(products).where(eq(products.id, id));
  }

  async createStockMovement(movementData: any): Promise<any> {
    const db = await getDb();
    
    // Validate that the source location has enough stock
    const [product] = await db.select().from(products).where(eq(products.id, movementData.productId));
    if (!product) {
      throw new Error('Product not found');
    }
    
    const currentStock = {
      internal: parseFloat(product.internalGrams?.toString() || "0"),
      external: parseFloat(product.externalGrams?.toString() || "0"),
      shelf: parseFloat(product.onShelfGrams?.toString() || "0")
    };
    
    if (currentStock[movementData.fromLocation as keyof typeof currentStock] < movementData.quantity) {
      throw new Error(`Insufficient stock in ${movementData.fromLocation} location. Available: ${currentStock[movementData.fromLocation as keyof typeof currentStock]}g, Requested: ${movementData.quantity}g`);
    }
    
    // Create the movement record first
    const [movement] = await db
      .insert(stockMovements)
      .values(movementData)
      .returning();
    
    // Update the product stock quantities with decimal precision
    const updateData: any = {};
    if (movementData.fromLocation === 'internal') {
      updateData.internalGrams = (parseFloat(product.internalGrams?.toString() || "0") - movementData.quantity).toString();
    } else if (movementData.fromLocation === 'external') {
      updateData.externalGrams = (parseFloat(product.externalGrams?.toString() || "0") - movementData.quantity).toString();
    } else if (movementData.fromLocation === 'shelf') {
      updateData.onShelfGrams = (parseFloat(product.onShelfGrams?.toString() || "0") - movementData.quantity).toString();
      // For Cannabis products, also deduct from jar weight when moving from shelf
      if (product.productType === 'Cannabis' && product.jarWeight && parseFloat(product.jarWeight.toString()) > 0) {
        const currentJarWeight = parseFloat(product.jarWeight.toString());
        updateData.jarWeight = Math.max(0, currentJarWeight - movementData.quantity).toString();
      }
    }
    
    if (movementData.toLocation === 'internal') {
      const currentInternal = updateData.internalGrams !== undefined ? parseFloat(updateData.internalGrams) : parseFloat(product.internalGrams?.toString() || "0");
      updateData.internalGrams = (currentInternal + movementData.quantity).toString();
    } else if (movementData.toLocation === 'external') {
      const currentExternal = updateData.externalGrams !== undefined ? parseFloat(updateData.externalGrams) : parseFloat(product.externalGrams?.toString() || "0");
      updateData.externalGrams = (currentExternal + movementData.quantity).toString();
    } else if (movementData.toLocation === 'shelf') {
      const currentShelf = updateData.onShelfGrams !== undefined ? parseFloat(updateData.onShelfGrams) : parseFloat(product.onShelfGrams?.toString() || "0");
      updateData.onShelfGrams = (currentShelf + movementData.quantity).toString();
    }
    
    // Calculate new total stock (round for stockQuantity integer field)
    const finalOnShelf = parseFloat(updateData.onShelfGrams || product.onShelfGrams?.toString() || "0");
    const finalInternal = parseFloat(updateData.internalGrams || product.internalGrams?.toString() || "0");
    const finalExternal = parseFloat(updateData.externalGrams || product.externalGrams?.toString() || "0");
    const newTotalStock = Math.round(finalOnShelf + finalInternal + finalExternal);
    
    // Update product with new stock levels
    await db
      .update(products)
      .set({
        ...updateData,
        stockQuantity: newTotalStock,
        lastUpdated: new Date()
      })
      .where(eq(products.id, movementData.productId));
    
    // Create stock log entry for the movement
    try {
      const activeShift = await this.getActiveShift();
      await this.createStockLog({
        shiftId: activeShift?.id || null,
        productId: product.id,
        actionType: 'stock_movement',
        workerName: movementData.workerName || 'Unknown Worker',
        productName: product.name,
        oldValues: {
          onShelfGrams: product.onShelfGrams,
          internalGrams: product.internalGrams,
          externalGrams: product.externalGrams
        },
        newValues: {
          onShelfGrams: updateData.onShelfGrams || product.onShelfGrams,
          internalGrams: updateData.internalGrams || product.internalGrams,
          externalGrams: updateData.externalGrams || product.externalGrams
        },
        notes: `${movementData.quantity}g moved from ${movementData.fromLocation} to ${movementData.toLocation}${movementData.notes ? ` - ${movementData.notes}` : ''}`
      });
    } catch (logError) {
      console.error('Failed to create stock log for movement:', logError);
    }
    
    return movement;
  }

  async getStockMovements(): Promise<any[]> {
    const db = await getDb();
    const movements = await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        fromLocation: stockMovements.fromLocation,
        toLocation: stockMovements.toLocation,
        quantity: stockMovements.quantity,
        workerName: stockMovements.workerName,
        movementDate: stockMovements.movementDate,
        notes: stockMovements.notes,
        createdAt: stockMovements.createdAt,
        productName: products.name,
        productCode: products.productCode
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .orderBy(desc(stockMovements.createdAt));
    
    return movements;
  }

  async createStockLog(logData: InsertStockLog): Promise<StockLog> {
    const db = await getDb();
    const [log] = await db
      .insert(stockLogs)
      .values(logData)
      .returning();
    return log;
  }

  async getStockLogs(): Promise<StockLog[]> {
    const db = await getDb();
    return await db.select().from(stockLogs).orderBy(desc(stockLogs.actionDate));
  }

  async getStockLogsByShift(shiftId: number): Promise<StockLog[]> {
    const db = await getDb();
    return await db
      .select()
      .from(stockLogs)
      .where(eq(stockLogs.shiftId, shiftId))
      .orderBy(desc(stockLogs.actionDate));
  }

  async clearAllStockLogs(): Promise<void> {
    const db = await getDb();
    await db.delete(stockLogs);
  }

  async createShiftReconciliation(reconciliationData: InsertShiftReconciliation): Promise<ShiftReconciliation> {
    const db = await getDb();
    const [reconciliation] = await db
      .insert(shiftReconciliations)
      .values(reconciliationData)
      .returning();
    return reconciliation;
  }

  async getShiftReconciliations(): Promise<ShiftReconciliation[]> {
    const db = await getDb();
    return await db.select().from(shiftReconciliations).orderBy(desc(shiftReconciliations.createdAt));
  }

  async getShiftReconciliation(id: number): Promise<ShiftReconciliation | undefined> {
    const db = await getDb();
    const [reconciliation] = await db.select().from(shiftReconciliations).where(eq(shiftReconciliations.id, id));
    return reconciliation || undefined;
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const db = await getDb();
    const [expense] = await db
      .insert(expenses)
      .values(expenseData)
      .returning();
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    const db = await getDb();
    return await db.select().from(expenses).orderBy(desc(expenses.createdAt));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const db = await getDb();
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense> {
    const db = await getDb();
    const [expense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: number): Promise<void> {
    const db = await getDb();
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Expense payment tracking methods
  async createExpensePayment(paymentData: InsertExpensePayment): Promise<ExpensePayment> {
    const db = await getDb();
    const [payment] = await db
      .insert(expensePayments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getExpensePayments(expenseId: number): Promise<ExpensePayment[]> {
    const db = await getDb();
    return await db
      .select()
      .from(expensePayments)
      .where(eq(expensePayments.expenseId, expenseId))
      .orderBy(desc(expensePayments.paymentDate));
  }

  async makePaymentOnExpense(
    expenseId: number, 
    paymentAmount: number, 
    workerName: string, 
    shiftId?: number, 
    notes?: string
  ): Promise<{ expense: Expense; payment: ExpensePayment }> {
    const db = await getDb();
    
    // Get current expense details
    const expense = await this.getExpense(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }

    const currentPaidAmount = parseFloat(expense.paidAmount?.toString() || "0");
    const totalAmount = parseFloat(expense.amount);
    const currentOutstanding = parseFloat(expense.outstandingAmount?.toString() || expense.amount);

    // Validate payment amount
    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be positive');
    }
    
    if (paymentAmount > currentOutstanding) {
      throw new Error(`Payment amount (₳${paymentAmount}) cannot exceed outstanding amount (₳${currentOutstanding})`);
    }

    // Calculate new amounts
    const newPaidAmount = currentPaidAmount + paymentAmount;
    const newOutstandingAmount = currentOutstanding - paymentAmount;
    
    // Determine payment status
    let paymentStatus = 'partial';
    if (newOutstandingAmount === 0) {
      paymentStatus = 'paid';
    } else if (newPaidAmount === 0) {
      paymentStatus = 'unpaid';
    }

    // Create payment record
    const payment = await this.createExpensePayment({
      expenseId,
      shiftId: shiftId || null,
      paymentAmount: paymentAmount.toString(),
      workerName,
      notes: notes || null
    });

    // Update expense with new payment totals
    const updatedExpense = await this.updateExpense(expenseId, {
      paidAmount: newPaidAmount.toString(),
      outstandingAmount: newOutstandingAmount.toString(),
      paymentStatus,
      lastPaymentDate: new Date()
    });

    return { expense: updatedExpense, payment };
  }


  // Calculate total expenses based on payments made during a specific shift
  async getShiftExpensePayments(shiftId: number): Promise<number> {
    const db = await getDb();
    const payments = await db
      .select()
      .from(expensePayments)
      .where(eq(expensePayments.shiftId, shiftId));
    
    return payments.reduce((total: number, payment: any) => {
      return total + parseFloat(payment.paymentAmount?.toString() || "0");
    }, 0);
  }

  // Shift operations
  async createShift(shiftData: InsertShift): Promise<Shift> {
    const db = await getDb();
    const [shift] = await db
      .insert(shifts)
      .values(shiftData)
      .returning();
    return shift;
  }

  async getShifts(): Promise<Shift[]> {
    const db = await getDb();
    return await db.select().from(shifts).orderBy(desc(shifts.createdAt));
  }

  async getShift(id: number): Promise<Shift | undefined> {
    const db = await getDb();
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift || undefined;
  }

  async getActiveShift(): Promise<Shift | undefined> {
    const db = await getDb();
    const [shift] = await db.select().from(shifts).where(eq(shifts.status, "active"));
    return shift || undefined;
  }

  async endShift(id: number, totals: { totalSales: string; totalExpenses: string; netAmount: string; stockDiscrepancies: string; reconciliationId?: number; }): Promise<Shift> {
    const db = await getDb();
    const [shift] = await db
      .update(shifts)
      .set({
        status: "completed",
        endTime: new Date(),
        totalSales: totals.totalSales,
        totalExpenses: totals.totalExpenses,
        netAmount: totals.netAmount,
        stockDiscrepancies: totals.stockDiscrepancies,
        reconciliationId: totals.reconciliationId
      })
      .where(eq(shifts.id, id))
      .returning();
    return shift;
  }

  // Shift activity operations
  async createShiftActivity(activityData: InsertShiftActivity): Promise<ShiftActivity> {
    const db = await getDb();
    const [activity] = await db
      .insert(shiftActivities)
      .values(activityData)
      .returning();
    return activity;
  }

  async getShiftActivities(shiftId: number): Promise<ShiftActivity[]> {
    const db = await getDb();
    return await db.select().from(shiftActivities)
      .where(eq(shiftActivities.shiftId, shiftId))
      .orderBy(desc(shiftActivities.timestamp));
  }

  // Enhanced methods with shift tracking
  async getTodaysExpenses(): Promise<Expense[]> {
    const today = new Date().toISOString().split('T')[0];
    const db = await getDb();
    return await db.select().from(expenses)
      .where(sql`DATE(${expenses.expenseDate}) = ${today}`)
      .orderBy(desc(expenses.createdAt));
  }

  // Get expenses created during current shift only
  async getCurrentShiftExpenses(shiftId: number): Promise<Expense[]> {
    const db = await getDb();
    return await db.select().from(expenses)
      .where(eq(expenses.shiftId, shiftId))
      .orderBy(desc(expenses.createdAt));
  }

  // Get unpaid/partially paid expenses from previous shifts (orphaned)
  async getOutstandingExpenses(): Promise<Expense[]> {
    const db = await getDb();
    return await db.select().from(expenses)
      .where(
        sql`${expenses.shiftId} IS NULL AND ${expenses.paymentStatus} != 'paid'`
      )
      .orderBy(desc(expenses.createdAt));
  }

  async getShiftSummary(shiftId: number): Promise<any> {
    const db = await getDb();
    // Get shift details
    const shift = await this.getShift(shiftId);
    if (!shift) return null;

    // Get all activities for this shift
    const activities = await this.getShiftActivities(shiftId);

    // Get current shift expenses and outstanding expenses separately
    const currentShiftExpenses = await this.getCurrentShiftExpenses(shiftId);
    const outstandingExpenses = await this.getOutstandingExpenses();
    
    // Combined for backward compatibility
    const shiftExpenses = [...currentShiftExpenses, ...outstandingExpenses];

    // Get expense payments made during this shift
    const shiftExpensePayments = await db.select().from(expensePayments)
      .where(eq(expensePayments.shiftId, shiftId))
      .orderBy(desc(expensePayments.paymentDate));

    // Get orders created during this shift (by time range)
    const shiftOrders = await db.select().from(orders)
      .where(sql`${orders.createdAt} >= ${shift.startTime} AND ${orders.createdAt} <= ${shift.endTime || new Date()}`)
      .orderBy(desc(orders.createdAt));

    // Get reconciliation if exists
    let reconciliation = null;
    if (shift.reconciliationId) {
      reconciliation = await this.getShiftReconciliation(shift.reconciliationId);
    }

    // Calculate total expenses based on payments made during this shift
    const totalExpensePayments = await this.getShiftExpensePayments(shiftId);

    return {
      shift,
      activities,
      expenses: shiftExpenses, // All expenses for backward compatibility
      currentShiftExpenses,    // Expenses created during this shift only
      outstandingExpenses,     // Unpaid expenses from previous shifts
      expensePayments: shiftExpensePayments,
      totalExpensePayments,
      orders: shiftOrders,
      reconciliation
    };
  }

  async cleanupOldShifts(): Promise<void> {
    try {
      const db = await getDb();
      // Get all completed shifts ordered by newest first
      const completedShifts = await db.select()
        .from(shifts)
        .where(eq(shifts.status, "completed"))
        .orderBy(desc(shifts.endTime));

      // If we have more than 1 completed shift, delete the old ones
      if (completedShifts.length > 1) {
        const shiftsToDelete = completedShifts.slice(1); // Keep first 1, delete the rest
        
        for (const shiftToDelete of shiftsToDelete) {
          // Only delete fully paid expenses associated with this shift
          // Keep unpaid/partially paid expenses by setting their shiftId to null
          await db.update(expenses)
            .set({ shiftId: null })
            .where(
              sql`${expenses.shiftId} = ${shiftToDelete.id} AND ${expenses.paymentStatus} != 'paid'`
            );
          
          // Delete only fully paid expenses
          await db.delete(expenses)
            .where(
              sql`${expenses.shiftId} = ${shiftToDelete.id} AND ${expenses.paymentStatus} = 'paid'`
            );
          
          // Delete all shift activities
          await db.delete(shiftActivities)
            .where(eq(shiftActivities.shiftId, shiftToDelete.id));
          
          // Remove reconciliation reference from shift first
          if (shiftToDelete.reconciliationId) {
            await db.update(shifts)
              .set({ reconciliationId: null })
              .where(eq(shifts.id, shiftToDelete.id));
            
            // Then delete the reconciliation record
            await db.delete(shiftReconciliations)
              .where(eq(shiftReconciliations.id, shiftToDelete.reconciliationId));
          }
          
          // Finally delete the shift record
          await db.delete(shifts)
            .where(eq(shifts.id, shiftToDelete.id));
        }
        
        console.log(`Cleaned up ${shiftsToDelete.length} old shifts. Keeping 1 most recent.`);
      }
    } catch (error) {
      console.error("Error cleaning up old shifts:", error);
      // Don't throw error to avoid disrupting the reconciliation process
    }
  }

  // Email reports operations
  async getAllEmailReports(): Promise<EmailReport[]> {
    const db = await getDb();
    return await db.select().from(emailReports).orderBy(desc(emailReports.sentAt));
  }

  async storeEmailReport(reportData: InsertEmailReport): Promise<EmailReport> {
    const db = await getDb();
    const [report] = await db
      .insert(emailReports)
      .values(reportData)
      .returning();
    return report;
  }
}

export const storage = new DatabaseStorage();
