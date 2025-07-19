import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  profileImageUrl: text("profile_image_url"),
  idImageUrl: text("id_image_url"),
  isOnboarded: boolean("is_onboarded").default(false),
  onboardingData: jsonb("onboarding_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category"),
  productCode: text("product_code").notNull().unique(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  adminPrice: text("admin_price").notNull().default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const basketItems = pgTable("basket_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  items: jsonb("items"),
  totalAmount: text("total_amount"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pickupCode: text("pickup_code").notNull().unique(),
  items: jsonb("items").notNull(),
  quantities: jsonb("quantities").notNull(),
  totalPrice: text("total_price").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  dateOfBirth: true,
  address: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  category: true,
  productCode: true,
});

export const insertBasketItemSchema = createInsertSchema(basketItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  pickupCode: true,
  items: true,
  quantities: true,
  totalPrice: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type BasketItem = typeof basketItems.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Order = typeof orders.$inferSelect;
