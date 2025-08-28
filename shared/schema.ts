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
  idBackImageUrl: text("id_back_image_url"), // Optional back of ID document
  isOnboarded: boolean("is_onboarded").default(false),
  onboardingData: jsonb("onboarding_data"),
  createdAt: timestamp("created_at").defaultNow(),
  // Membership management fields
  membershipStatus: text("membership_status").default("pending"), // pending, approved, expired, renewed
  approvalDate: timestamp("approval_date"), // Date when admin approved membership
  expiryDate: timestamp("expiry_date"), // 1 year from approval date
  approvedBy: text("approved_by"), // Admin who approved the membership
  renewalCount: integer("renewal_count").default(0), // Track number of renewals
  lastActive: timestamp("last_active"), // Track member activity for statistics
  // User ban/block functionality
  isBanned: boolean("is_banned").default(false), // Track if user is banned
  bannedBy: text("banned_by"), // Admin who banned the user
  bannedAt: timestamp("banned_at"), // When user was banned
  banReason: text("ban_reason"), // Reason for ban
  // Role field for admin users (null for regular members, "admin" for regular admin, "superadmin" for superadmin)
  role: text("role"), // null, "admin", "superadmin"
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category"),
  productType: text("product_type"),
  productCode: text("product_code").notNull().unique(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  adminPrice: text("admin_price").notNull().default("0"),
  // Enhanced stock management fields
  supplier: text("supplier"),
  onShelfGrams: integer("on_shelf_grams").notNull().default(0),
  internalGrams: integer("internal_grams").notNull().default(0),
  externalGrams: integer("external_grams").notNull().default(0),
  costPrice: text("cost_price").notNull().default("0"),
  shelfPrice: text("shelf_price").notNull().default("0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
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
  quantities: jsonb("quantities"),
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
  archivedFromAdmin: boolean("archived_from_admin").default(false),
  shiftId: integer("shift_id").references(() => shifts.id), // Link orders to shifts
  createdAt: timestamp("created_at").defaultNow(),
});

export const shiftReconciliations = pgTable("shift_reconciliations", {
  id: serial("id").primaryKey(),
  shiftDate: timestamp("shift_date").defaultNow(),
  productCounts: jsonb("product_counts").notNull(), // {productId: physicalCount}
  discrepancies: jsonb("discrepancies").notNull(), // {productId: {expected, actual, difference, type}}
  totalDiscrepancies: integer("total_discrepancies").default(0),
  adminNotes: text("admin_notes"),
  // Cash breakdown fields
  cashInTill: text("cash_in_till").default("0"), // Total cash amount
  coins: text("coins").default("0"), // Coin amount
  notes: text("notes_amount").default("0"), // Note/bill amount
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: text("amount").notNull(), // Store as string to preserve decimal formatting
  workerName: text("worker_name").notNull(),
  expenseDate: timestamp("expense_date").defaultNow(),
  shiftId: integer("shift_id").references(() => shifts.id), // Link to shift
  createdAt: timestamp("created_at").defaultNow(),
});

// Shift management tables
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  shiftId: text("shift_id").notNull().unique(), // Unique shift identifier (e.g., SHIFT 26/08/2025)
  workerName: text("worker_name").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("active"), // active, completed
  shiftDate: text("shift_date").notNull(), // YYYY-MM-DD format
  startingTillAmount: text("starting_till_amount").default("0"), // Amount in till when shift starts
  // Calculated totals (filled when shift ends)
  totalSales: text("total_sales").default("0"),
  totalExpenses: text("total_expenses").default("0"),
  netAmount: text("net_amount").default("0"),
  stockDiscrepancies: integer("stock_discrepancies").default(0),
  reconciliationId: integer("reconciliation_id").references(() => shiftReconciliations.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shiftActivities = pgTable("shift_activities", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").references(() => shifts.id).notNull(),
  activityType: text("activity_type").notNull(), // expense, sale, stock_change, reconciliation
  activityId: integer("activity_id"), // ID of the related record (expense_id, order_id, etc.) - nullable for reconciliation activities
  description: text("description").notNull(),
  amount: text("amount"), // For sales and expenses
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // Additional data specific to activity type
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  dateOfBirth: true,
  address: true,
  membershipStatus: true,
  approvalDate: true,
  expiryDate: true,
  approvedBy: true,
  renewalCount: true,
  lastActive: true,
  isBanned: true,
  bannedBy: true,
  bannedAt: true,
  banReason: true,
  role: true,
  isOnboarded: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  category: true,
  productCode: true,
  imageUrl: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;

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
  shiftId: true,
});

export const insertShiftReconciliationSchema = createInsertSchema(shiftReconciliations).pick({
  productCounts: true,
  discrepancies: true,
  totalDiscrepancies: true,
  adminNotes: true,
  cashInTill: true,
  coins: true,
  notes: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  workerName: true,
  shiftId: true,
});

export const insertShiftSchema = createInsertSchema(shifts).pick({
  shiftId: true,
  workerName: true,
  shiftDate: true,
  startingTillAmount: true,
  notes: true,
});

export const insertShiftActivitySchema = createInsertSchema(shiftActivities).pick({
  shiftId: true,
  activityType: true,
  activityId: true,
  description: true,
  amount: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertShiftReconciliation = z.infer<typeof insertShiftReconciliationSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type InsertShiftActivity = z.infer<typeof insertShiftActivitySchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type BasketItem = typeof basketItems.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type ShiftReconciliation = typeof shiftReconciliations.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type ShiftActivity = typeof shiftActivities.$inferSelect;
