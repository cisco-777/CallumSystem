import {
  users,
  products,
  basketItems,
  donations,
  orders,
  type User,
  type InsertUser,
  type Product,
  type BasketItem,
  type Donation,
  type Order,
  type InsertOrder,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(productData: any): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProductStock(id: number, stockData: any): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        ...stockData,
        stockQuantity: (stockData.onShelfGrams || 0) + (stockData.internalGrams || 0) + (stockData.externalGrams || 0),
        adminPrice: stockData.shelfPrice, // For backward compatibility
        lastUpdated: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async createStockEntry(stockData: any): Promise<Product> {
    const [product] = await db
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
      }
    })
    .from(basketItems)
    .leftJoin(products, eq(basketItems.productId, products.id))
    .where(eq(basketItems.userId, userId));
    
    return items as any;
  }

  async addToBasket(userId: number, productId: number, quantity: number = 1): Promise<BasketItem> {
    const [item] = await db
      .insert(basketItems)
      .values({ userId, productId, quantity })
      .returning();
    return item;
  }

  async removeFromBasket(id: number): Promise<void> {
    await db.delete(basketItems).where(eq(basketItems.id, id));
  }

  async clearBasket(userId: number): Promise<void> {
    await db.delete(basketItems).where(eq(basketItems.userId, userId));
  }

  async createDonation(userId: number, items: any[], totalAmount: string): Promise<Donation> {
    const [donation] = await db
      .insert(donations)
      .values({ userId, items, totalAmount })
      .returning();
    return donation;
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.userId, userId));
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByPickupCode(pickupCode: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.pickupCode, pickupCode));
    return order || undefined;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.archivedFromAdmin, false)).orderBy(desc(orders.createdAt));
  }

  async getAllOrdersForAnalytics(): Promise<Order[]> {
    // Return all orders including archived ones for analytics calculations
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async confirmOrderAndReduceStock(orderId: number): Promise<Order> {
    // Get order details
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new Error("Order not found");

    // Reduce stock for each item
    for (const quantity of order.quantities as any[]) {
      await db
        .update(products)
        .set({ 
          stockQuantity: sql`${products.stockQuantity} - ${quantity.quantity}`
        })
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
    await db.update(orders).set({ archivedFromAdmin: true });
  }
}

export const storage = new DatabaseStorage();
