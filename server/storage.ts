import {
  users,
  products,
  basketItems,
  donations,
  orders,
  shiftReconciliations,
  expenses,
  shifts,
  shiftActivities,
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
  type Shift,
  type InsertShift,
  type ShiftActivity,
  type InsertShiftActivity,
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
  
  // Shift operations
  createShift(shiftData: InsertShift): Promise<Shift>;
  getShifts(): Promise<Shift[]>;
  getShift(id: number): Promise<Shift | undefined>;
  getActiveShift(): Promise<Shift | undefined>;
  endShift(id: number, totals: { totalSales: string; totalExpenses: string; netAmount: string; stockDiscrepancies: number; reconciliationId?: number; }): Promise<Shift>;
  
  // Shift activity operations
  createShiftActivity(activityData: InsertShiftActivity): Promise<ShiftActivity>;
  getShiftActivities(shiftId: number): Promise<ShiftActivity[]>;
  
  // Enhanced methods with shift tracking
  getTodaysExpenses(): Promise<Expense[]>;
  getShiftSummary(shiftId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await getDb().select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await getDb()
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await getDb()
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
    return await getDb()
      .select()
      .from(users)
      .where(sql`${users.role} = 'admin' OR ${users.role} = 'superadmin'`)
      .orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<void> {
    // First remove all related data for this user
    await getDb().delete(basketItems).where(eq(basketItems.userId, id));
    await getDb().delete(donations).where(eq(donations.userId, id));
    await getDb().delete(orders).where(eq(orders.userId, id));
    
    // Then delete the user
    await getDb().delete(users).where(eq(users.id, id));
  }

  // Membership management operations
  async getPendingMembers(): Promise<User[]> {
    return await getDb()
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'pending'))
      .orderBy(desc(users.createdAt));
  }

  async getApprovedMembers(): Promise<User[]> {
    return await getDb()
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'approved'))
      .orderBy(desc(users.approvalDate));
  }

  async getExpiredMembers(): Promise<User[]> {
    const now = new Date();
    return await getDb()
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'expired'))
      .orderBy(desc(users.expiryDate));
  }

  async getRenewedMembers(): Promise<User[]> {
    return await getDb()
      .select()
      .from(users)
      .where(eq(users.membershipStatus, 'renewed'))
      .orderBy(desc(users.approvalDate));
  }

  async getActiveMembers(): Promise<User[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await getDb()
      .select()
      .from(users)
      .where(sql`${users.lastActive} > ${thirtyDaysAgo}`)
      .orderBy(desc(users.lastActive));
  }

  async approveMember(userId: number, approvedBy: string): Promise<User> {
    const approvalDate = new Date();
    const expiryDate = new Date(approvalDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from approval
    
    const [user] = await getDb()
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
    
    const [user] = await getDb()
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
    await getDb()
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

    // Count pending members (exclude admin accounts)
    const [{ count: pending }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'pending' AND ${users.email} != 'admin123@gmail.com'`);

    // Count approved members (not expired, exclude admin accounts)
    const [{ count: approved }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'approved' AND ${users.expiryDate} > ${now} AND ${users.email} != 'admin123@gmail.com'`);

    // Count expired members (exclude admin accounts)
    const [{ count: expired }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'approved' AND ${users.expiryDate} <= ${now} AND ${users.email} != 'admin123@gmail.com'`);

    // Count renewed members (exclude admin accounts)
    const [{ count: renewed }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.membershipStatus} = 'renewed' AND ${users.email} != 'admin123@gmail.com'`);

    // Count active members (non-expired members only, exclude admin accounts)
    const [{ count: active }] = await getDb()
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
    const [{ count: newMembers }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${startTime} AND ${users.createdAt} <= ${endTime} AND ${users.email} != 'admin123@gmail.com'`);
    
    return Number(newMembers) || 0;
  }

  async getProducts(): Promise<Product[]> {
    return await getDb().select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await getDb().select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(productData: any): Promise<Product> {
    const [product] = await getDb()
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProductStock(id: number, stockData: any): Promise<Product> {
    // Get current product to preserve existing values if not provided
    const [currentProduct] = await getDb().select().from(products).where(eq(products.id, id));
    if (!currentProduct) throw new Error("Product not found");

    // Calculate new stock values using provided data or current values
    const newOnShelfGrams = stockData.onShelfGrams !== undefined ? stockData.onShelfGrams : currentProduct.onShelfGrams || 0;
    const newInternalGrams = stockData.internalGrams !== undefined ? stockData.internalGrams : currentProduct.internalGrams || 0;
    const newExternalGrams = stockData.externalGrams !== undefined ? stockData.externalGrams : currentProduct.externalGrams || 0;
    const newTotalStock = newOnShelfGrams + newInternalGrams + newExternalGrams;

    const [product] = await getDb()
      .update(products)
      .set({
        ...stockData,
        stockQuantity: newTotalStock,
        adminPrice: stockData.shelfPrice || currentProduct.adminPrice, // For backward compatibility
        lastUpdated: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async createStockEntry(stockData: any): Promise<Product> {
    const [product] = await getDb()
      .insert(products)
      .values({
        ...stockData,
        stockQuantity: (stockData.onShelfGrams || 0) + (stockData.internalGrams || 0) + (stockData.externalGrams || 0),
        adminPrice: stockData.shelfPrice, // For backward compatibility
        lastUpdated: new Date()
      })
      .returning();
    return product;
  }

  async getBasketItems(userId: number): Promise<BasketItem[]> {
    const items = await getDb().select({
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
      }
    })
    .from(basketItems)
    .leftJoin(products, eq(basketItems.productId, products.id))
    .where(eq(basketItems.userId, userId));
    
    return items as any;
  }

  async addToBasket(userId: number, productId: number, quantity: number = 1): Promise<BasketItem> {
    const [item] = await getDb()
      .insert(basketItems)
      .values({ userId, productId, quantity })
      .returning();
    return item;
  }

  async removeFromBasket(id: number): Promise<void> {
    await getDb().delete(basketItems).where(eq(basketItems.id, id));
  }

  async clearBasket(userId: number): Promise<void> {
    await getDb().delete(basketItems).where(eq(basketItems.userId, userId));
  }

  async createDonation(userId: number, items: any[], totalAmount: string): Promise<Donation> {
    const [donation] = await getDb()
      .insert(donations)
      .values({ userId, items, totalAmount })
      .returning();
    return donation;
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    return await getDb().select().from(donations).where(eq(donations.userId, userId));
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await getDb()
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await getDb().select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByPickupCode(pickupCode: string): Promise<Order | undefined> {
    const [order] = await getDb().select().from(orders).where(eq(orders.pickupCode, pickupCode));
    return order || undefined;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await getDb().select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await getDb().select().from(orders).where(eq(orders.archivedFromAdmin, false)).orderBy(desc(orders.createdAt));
  }

  async getAllOrdersForAnalytics(): Promise<Order[]> {
    // Return all orders including archived ones for analytics calculations
    return await getDb().select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const [order] = await getDb()
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async confirmOrderAndReduceStock(orderId: number): Promise<Order> {
    // Get order details
    const [order] = await getDb().select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new Error("Order not found");

    // Validate and reduce stock for each item
    for (const quantity of order.quantities as any[]) {
      // Get current product stock
      const [product] = await getDb().select().from(products).where(eq(products.id, quantity.productId));
      if (!product) throw new Error(`Product not found: ${quantity.productId}`);

      // Check if sufficient shelf stock is available
      const availableShelfStock = product.onShelfGrams || 0;
      if (availableShelfStock < quantity.quantity) {
        throw new Error(`Insufficient shelf stock for ${product.name}. Available: ${availableShelfStock}g, Required: ${quantity.quantity}g`);
      }

      // Calculate new stock values
      const newOnShelfGrams = availableShelfStock - quantity.quantity;
      const newTotalStock = newOnShelfGrams + (product.internalGrams || 0) + (product.externalGrams || 0);

      // Update product stock quantities
      await getDb()
        .update(products)
        .set({ 
          onShelfGrams: newOnShelfGrams,
          stockQuantity: newTotalStock,
          lastUpdated: new Date()
        })
        .where(eq(products.id, quantity.productId));
    }

    // Update order status to completed
    const [updatedOrder] = await getDb()
      .update(orders)
      .set({ status: "completed" })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  }

  async deleteAllOrders(): Promise<void> {
    // Archive orders from admin view instead of deleting (preserves analytics data)
    await getDb().update(orders).set({ archivedFromAdmin: true });
  }

  async deleteProduct(id: number): Promise<void> {
    // First remove all basket items for this product
    await getDb().delete(basketItems).where(eq(basketItems.productId, id));
    
    // Then delete the product itself
    await getDb().delete(products).where(eq(products.id, id));
  }

  async createShiftReconciliation(reconciliationData: InsertShiftReconciliation): Promise<ShiftReconciliation> {
    const [reconciliation] = await getDb()
      .insert(shiftReconciliations)
      .values(reconciliationData)
      .returning();
    return reconciliation;
  }

  async getShiftReconciliations(): Promise<ShiftReconciliation[]> {
    return await getDb().select().from(shiftReconciliations).orderBy(desc(shiftReconciliations.createdAt));
  }

  async getShiftReconciliation(id: number): Promise<ShiftReconciliation | undefined> {
    const [reconciliation] = await getDb().select().from(shiftReconciliations).where(eq(shiftReconciliations.id, id));
    return reconciliation || undefined;
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [expense] = await getDb()
      .insert(expenses)
      .values(expenseData)
      .returning();
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return await getDb().select().from(expenses).orderBy(desc(expenses.createdAt));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await getDb().select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense> {
    const [expense] = await getDb()
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: number): Promise<void> {
    await getDb().delete(expenses).where(eq(expenses.id, id));
  }

  // Shift operations
  async createShift(shiftData: InsertShift): Promise<Shift> {
    const [shift] = await getDb()
      .insert(shifts)
      .values(shiftData)
      .returning();
    return shift;
  }

  async getShifts(): Promise<Shift[]> {
    return await getDb().select().from(shifts).orderBy(desc(shifts.createdAt));
  }

  async getShift(id: number): Promise<Shift | undefined> {
    const [shift] = await getDb().select().from(shifts).where(eq(shifts.id, id));
    return shift || undefined;
  }

  async getActiveShift(): Promise<Shift | undefined> {
    const [shift] = await getDb().select().from(shifts).where(eq(shifts.status, "active"));
    return shift || undefined;
  }

  async endShift(id: number, totals: { totalSales: string; totalExpenses: string; netAmount: string; stockDiscrepancies: number; reconciliationId?: number; }): Promise<Shift> {
    const [shift] = await getDb()
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
    const [activity] = await getDb()
      .insert(shiftActivities)
      .values(activityData)
      .returning();
    return activity;
  }

  async getShiftActivities(shiftId: number): Promise<ShiftActivity[]> {
    return await getDb().select().from(shiftActivities)
      .where(eq(shiftActivities.shiftId, shiftId))
      .orderBy(desc(shiftActivities.timestamp));
  }

  // Enhanced methods with shift tracking
  async getTodaysExpenses(): Promise<Expense[]> {
    const today = new Date().toISOString().split('T')[0];
    return await getDb().select().from(expenses)
      .where(sql`DATE(${expenses.expenseDate}) = ${today}`)
      .orderBy(desc(expenses.createdAt));
  }

  async getShiftSummary(shiftId: number): Promise<any> {
    // Get shift details
    const shift = await this.getShift(shiftId);
    if (!shift) return null;

    // Get all activities for this shift
    const activities = await this.getShiftActivities(shiftId);

    // Get detailed expenses and orders linked to this shift
    const shiftExpenses = await getDb().select().from(expenses)
      .where(eq(expenses.shiftId, shiftId))
      .orderBy(desc(expenses.createdAt));

    // Get orders created during this shift (by time range)
    const shiftOrders = await getDb().select().from(orders)
      .where(sql`${orders.createdAt} >= ${shift.startTime} AND ${orders.createdAt} <= ${shift.endTime || new Date()}`)
      .orderBy(desc(orders.createdAt));

    // Get reconciliation if exists
    let reconciliation = null;
    if (shift.reconciliationId) {
      reconciliation = await this.getShiftReconciliation(shift.reconciliationId);
    }

    return {
      shift,
      activities,
      expenses: shiftExpenses,
      orders: shiftOrders,
      reconciliation
    };
  }

  async cleanupOldShifts(): Promise<void> {
    try {
      // Get all completed shifts ordered by newest first
      const completedShifts = await getDb().select()
        .from(shifts)
        .where(eq(shifts.status, "completed"))
        .orderBy(desc(shifts.endTime));

      // If we have more than 1 completed shift, delete the old ones
      if (completedShifts.length > 1) {
        const shiftsToDelete = completedShifts.slice(1); // Keep first 1, delete the rest
        
        for (const shiftToDelete of shiftsToDelete) {
          // Delete all expenses associated with this shift
          await getDb().delete(expenses)
            .where(eq(expenses.shiftId, shiftToDelete.id));
          
          // Delete all shift activities
          await getDb().delete(shiftActivities)
            .where(eq(shiftActivities.shiftId, shiftToDelete.id));
          
          // Delete reconciliation record if exists
          if (shiftToDelete.reconciliationId) {
            await getDb().delete(shiftReconciliations)
              .where(eq(shiftReconciliations.id, shiftToDelete.reconciliationId));
          }
          
          // Finally delete the shift record
          await getDb().delete(shifts)
            .where(eq(shifts.id, shiftToDelete.id));
        }
        
        console.log(`Cleaned up ${shiftsToDelete.length} old shifts. Keeping 1 most recent.`);
      }
    } catch (error) {
      console.error("Error cleaning up old shifts:", error);
      // Don't throw error to avoid disrupting the reconciliation process
    }
  }
}

export const storage = new DatabaseStorage();
