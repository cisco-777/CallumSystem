import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/check-email", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      res.json({ exists: !!user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.password || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        email,
        password,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: ''
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check for admin credentials
      if (email === "admin123@gmail.com" && password === "admin123") {
        res.json({ 
          success: true, 
          admin: { 
            email: "admin123@gmail.com", 
            role: "admin" 
          } 
        });
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/complete-onboarding", async (req, res) => {
    try {
      console.log("Onboarding request received - body:", req.body);
      console.log("Onboarding request received - files:", req.files);
      
      // For now, get the most recent user (in a real app, use session/token)
      const users = await storage.getUsers();
      if (users.length === 0) {
        console.log("No users found in database");
        return res.status(400).json({ message: "No user found" });
      }
      
      const userId = users[users.length - 1].id; // Get the latest user
      console.log("Updating user ID:", userId);
      
      // Extract data from form data
      const updates = {
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        phoneNumber: req.body.phoneNumber || '',
        dateOfBirth: req.body.dateOfBirth || '',
        address: req.body.address || '',
        isOnboarded: true
      };

      console.log("Updates to apply:", updates);
      
      // Validate required fields
      if (!updates.firstName || !updates.lastName || !updates.phoneNumber || !updates.dateOfBirth || !updates.address) {
        console.log("Missing required fields:", updates);
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const user = await storage.updateUser(userId, updates);
      const { password: _, ...userWithoutPassword } = user;
      console.log("User updated successfully:", userWithoutPassword);
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding", error: String(error) });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // User routes (admin only)
  app.get("/api/users", async (req, res) => {
    const isAdmin = req.headers['x-admin'] === 'true';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Object Storage Routes for Image Uploads
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Route to serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put("/api/product-images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const imagePath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: "admin", // Use admin as owner for product images
          visibility: "public", // Make product images public
        }
      );

      res.status(200).json({
        imagePath: imagePath,
      });
    } catch (error) {
      console.error("Error setting product image ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { productCode, ...productData } = req.body;
      
      // Check if product code already exists
      const existingProducts = await storage.getProducts();
      const existingProduct = existingProducts.find((p: any) => p.productCode === productCode);
      
      if (existingProduct) {
        return res.status(400).json({ message: "Product code already exists. Please use a unique 6-digit code." });
      }
      
      const product = await storage.createProduct({ productCode, ...productData });
      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Stock management routes
  app.put('/api/products/:id/stock', async (req, res) => {
    const { id } = req.params;
    const stockData = req.body;
    
    try {
      // Check if product code already exists for other products (if being changed)
      if (stockData.productCode) {
        const existingProducts = await storage.getProducts();
        const existingProduct = existingProducts.find((p: any) => 
          p.productCode === stockData.productCode && p.id !== parseInt(id)
        );
        
        if (existingProduct) {
          return res.status(400).json({ message: "Product code already exists. Please use a unique 6-digit code." });
        }
      }
      
      const updatedProduct = await storage.updateProductStock(parseInt(id), stockData);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ message: 'Failed to update stock' });
    }
  });

  app.post('/api/products/stock', async (req, res) => {
    const stockData = req.body;
    
    try {
      // Check if product code already exists
      const existingProducts = await storage.getProducts();
      const existingProduct = existingProducts.find((p: any) => p.productCode === stockData.productCode);
      
      if (existingProduct) {
        return res.status(400).json({ message: "Product code already exists. Please use a unique 6-digit code." });
      }
      
      const newProduct = await storage.createStockEntry(stockData);
      res.json(newProduct);
    } catch (error) {
      console.error('Create stock entry error:', error);
      res.status(500).json({ message: 'Failed to create stock entry' });
    }
  });

  // Delete product route
  app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const isAdmin = req.headers['x-admin'] === 'true';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    try {
      await storage.deleteProduct(parseInt(id));
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Basket routes
  app.get("/api/basket", async (req, res) => {
    try {
      const userId = 1; // Would get from session/token in real app
      const basketItems = await storage.getBasketItems(userId);
      res.json(basketItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch basket" });
    }
  });

  app.post("/api/basket", async (req, res) => {
    try {
      const userId = 1; // Would get from session/token in real app
      const { productId, quantity = 1 } = req.body;
      const item = await storage.addToBasket(userId, productId, quantity);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to basket" });
    }
  });

  app.delete("/api/basket/:id", async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      await storage.removeFromBasket(itemId);
      res.json({ message: "Item removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item" });
    }
  });

  // Member dashboard routes
  app.get("/api/member/donations", async (req, res) => {
    try {
      const userId = 2; // Demo member ID - would get from session in real app
      const donations = await storage.getUserDonations(userId);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation history" });
    }
  });

  // Donation route
  app.post("/api/donate", async (req, res) => {
    try {
      const userId = 1; // Would get from session/token in real app
      const basketItems = await storage.getBasketItems(userId);
      
      if (basketItems.length === 0) {
        return res.status(400).json({ message: "No items in basket" });
      }

      // Generate random 4-digit pickup code
      const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Calculate total price using product reference codes (last 2 digits)
      const totalPrice = basketItems.reduce((sum, item) => {
        const productCode = (item as any).product?.productCode || '';
        const price = parseInt(productCode.slice(-2)) || 10;
        return sum + ((item.quantity || 1) * price);
      }, 0).toString();
      
      // Prepare order data
      const orderData = {
        userId,
        pickupCode,
        items: basketItems.map(item => ({
          name: (item as any).product?.name,
          category: (item as any).product?.category,
          productId: item.productId,
          productCode: (item as any).product?.productCode
        })),
        quantities: basketItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity || 1
        })),
        totalPrice
      };

      // Create order record
      const order = await storage.createOrder(orderData);
      
      // Create donation record (for backward compatibility)
      const donation = await storage.createDonation(userId, basketItems, totalPrice);
      
      // Clear the basket
      await storage.clearBasket(userId);
      
      res.json({ 
        success: true, 
        pickupCode, 
        order,
        message: `Your donation has been processed successfully! Please visit our counter with code ${pickupCode} to collect your items.`
      });
    } catch (error) {
      console.error("Donation processing error:", error);
      res.status(500).json({ message: "Failed to process donation", error: String(error) });
    }
  });

  // Order routes
  app.get("/api/orders/analytics", async (req, res) => {
    try {
      // Get all orders including archived for analytics calculations
      const orders = await storage.getAllOrdersForAnalytics();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      // For admin interface, get all orders, for users get user orders
      const isAdmin = req.headers['x-admin'] === 'true';
      let orders;
      
      if (isAdmin) {
        // Get all orders for admin
        orders = await storage.getAllOrders();
      } else {
        const userId = 1; // Would get from session/token in real app
        orders = await storage.getUserOrders(userId);
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:pickupCode", async (req, res) => {
    try {
      const { pickupCode } = req.params;
      const order = await storage.getOrderByPickupCode(pickupCode);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.updateOrderStatus(orderId, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.patch("/api/orders/:id/confirm", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.confirmOrderAndReduceStock(orderId);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm order" });
    }
  });

  app.delete("/api/orders/all", async (req, res) => {
    try {
      await storage.deleteAllOrders();
      res.json({ message: "All orders deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete all orders" });
    }
  });

  // Seed some initial products
  app.post("/api/seed-products", async (req, res) => {
    try {
      console.log("Seeding products...");
      const products = await storage.getProducts();
      console.log("Current products count:", products.length);
      if (products.length === 0) {
        const seedProducts = [
          { 
            name: "Zkittlez", 
            description: "Premium hybrid strain with fruity flavors and balanced effects", 
            category: "Hybrid",
            productCode: "ZK4312"
          },
          { 
            name: "Blue Dream", 
            description: "Sativa-dominant hybrid known for its gentle cerebral effects", 
            category: "Sativa",
            productCode: "BD7010"
          },
          { 
            name: "Lemon Haze", 
            description: "Energizing sativa with bright citrus aroma and uplifting effects", 
            category: "Sativa",
            productCode: "LH2213"
          },
          { 
            name: "Wedding Cake", 
            description: "Indica-dominant hybrid with sweet vanilla flavors and relaxing effects", 
            category: "Indica",
            productCode: "WC9615"
          },
          { 
            name: "Moroccan Hash", 
            description: "Traditional hand-pressed hash with earthy, spicy flavors and potent relaxing effects", 
            category: "Indica",
            productCode: "MH5812"
          },
          { 
            name: "Dry-Shift Hash", 
            description: "High-quality sieved hash with clean, pure effects and energizing properties", 
            category: "Sativa",
            productCode: "DS1410"
          }
        ];

        for (const product of seedProducts) {
          console.log("Creating product:", product);
          await storage.createProduct(product);
        }
        console.log("Products seeded successfully");
      } else {
        console.log("Products already exist, skipping seeding");
      }
      res.json({ message: "Products seeded" });
    } catch (error) {
      console.error("Error seeding products:", error);
      res.status(500).json({ message: "Failed to seed products", error: String(error) });
    }
  });

  // Shift reconciliation routes
  app.post("/api/shift-reconciliation", async (req, res) => {
    try {
      const { productCounts } = req.body;
      
      // Get all current products to calculate discrepancies
      const products = await storage.getProducts();
      const discrepancies: any = {};
      let totalDiscrepancies = 0;
      
      // Calculate discrepancies for each product
      for (const product of products) {
        const physicalCount = productCounts[product.id] || 0;
        const expectedOnShelf = product.onShelfGrams || 0;
        const difference = expectedOnShelf - physicalCount;
        
        if (difference !== 0) {
          discrepancies[product.id] = {
            productName: product.name,
            expected: expectedOnShelf,
            actual: physicalCount,
            difference: Math.abs(difference),
            type: difference > 0 ? 'missing' : 'excess'
          };
          totalDiscrepancies += Math.abs(difference);
        }
      }
      
      // Save the reconciliation
      const reconciliation = await storage.createShiftReconciliation({
        productCounts,
        discrepancies,
        totalDiscrepancies
      });
      
      res.json(reconciliation);
    } catch (error) {
      console.error("Error creating shift reconciliation:", error);
      res.status(500).json({ message: "Failed to create shift reconciliation" });
    }
  });

  app.get("/api/shift-reconciliation", async (req, res) => {
    try {
      const reconciliations = await storage.getShiftReconciliations();
      res.json(reconciliations);
    } catch (error) {
      console.error("Error fetching shift reconciliations:", error);
      res.status(500).json({ message: "Failed to fetch shift reconciliations" });
    }
  });

  app.get("/api/shift-reconciliation/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const reconciliation = await storage.getShiftReconciliation(parseInt(id));
      
      if (!reconciliation) {
        return res.status(404).json({ message: "Shift reconciliation not found" });
      }
      
      res.json(reconciliation);
    } catch (error) {
      console.error("Error fetching shift reconciliation:", error);
      res.status(500).json({ message: "Failed to fetch shift reconciliation" });
    }
  });

  // Expense routes
  app.post("/api/expenses", async (req, res) => {
    try {
      const { description, amount, workerName } = req.body;
      
      if (!description || !amount || !workerName) {
        return res.status(400).json({ message: "Description, amount, and worker name are required" });
      }
      
      const expense = await storage.createExpense({
        description,
        amount,
        workerName
      });
      
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const expense = await storage.getExpense(parseInt(id));
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { description, amount, workerName } = req.body;
      
      const expense = await storage.updateExpense(parseInt(id), {
        description,
        amount,
        workerName
      });
      
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(parseInt(id));
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Shift Management Routes
  app.post("/api/shifts/start", async (req, res) => {
    try {
      const { workerName } = req.body;
      
      if (!workerName) {
        return res.status(400).json({ message: "Worker name is required" });
      }
      
      // Check if there's already an active shift
      const activeShift = await storage.getActiveShift();
      if (activeShift) {
        return res.status(400).json({ 
          message: "Cannot start new shift. There is already an active shift.",
          activeShift: {
            id: activeShift.id,
            workerName: activeShift.workerName,
            startTime: activeShift.startTime,
            shiftId: activeShift.shiftId
          }
        });
      }
      
      // Generate unique shift ID
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const existingShifts = await storage.getShifts();
      const todayShifts = existingShifts.filter(s => s.shiftDate === new Date().toISOString().split('T')[0]);
      const shiftNumber = (todayShifts.length + 1).toString().padStart(3, '0');
      const shiftId = `SHIFT-${today}-${shiftNumber}`;
      
      const shift = await storage.createShift({
        shiftId,
        workerName,
        shiftDate: new Date().toISOString().split('T')[0]
      });
      
      // Create initial shift activity
      await storage.createShiftActivity({
        shiftId: shift.id,
        activityType: "shift_start",
        activityId: shift.id,
        description: `Shift started by ${workerName}`,
        metadata: { action: "start", worker: workerName }
      });
      
      res.json(shift);
    } catch (error) {
      console.error("Error starting shift:", error);
      res.status(500).json({ message: "Failed to start shift" });
    }
  });

  app.get("/api/shifts/active", async (req, res) => {
    try {
      const activeShift = await storage.getActiveShift();
      res.json(activeShift || null);
    } catch (error) {
      console.error("Error getting active shift:", error);
      res.status(500).json({ message: "Failed to get active shift" });
    }
  });

  app.post("/api/shifts/:id/end", async (req, res) => {
    try {
      const { id } = req.params;
      const shiftId = parseInt(id);
      
      // Get current shift
      const shift = await storage.getShift(shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      if (shift.status !== "active") {
        return res.status(400).json({ message: "Shift is not active" });
      }
      
      // Calculate shift totals
      const shiftSummary = await storage.getShiftSummary(shiftId);
      
      // Calculate sales from orders during shift
      const totalSales = shiftSummary.orders
        .filter((order: any) => order.status === "completed")
        .reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice || "0"), 0);
      
      // Calculate expenses
      const totalExpenses = shiftSummary.expenses
        .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || "0"), 0);
      
      // Net amount
      const netAmount = totalSales - totalExpenses;
      
      // End the shift with totals
      const endedShift = await storage.endShift(shiftId, {
        totalSales: totalSales.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netAmount: netAmount.toFixed(2),
        stockDiscrepancies: 0 // Will be updated after reconciliation
      });
      
      // Create end shift activity
      await storage.createShiftActivity({
        shiftId: shiftId,
        activityType: "shift_end",
        activityId: shiftId,
        description: `Shift ended. Sales: €${totalSales.toFixed(2)}, Expenses: €${totalExpenses.toFixed(2)}, Net: €${netAmount.toFixed(2)}`,
        metadata: { 
          action: "end", 
          totalSales: totalSales.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          netAmount: netAmount.toFixed(2)
        }
      });
      
      res.json(endedShift);
    } catch (error) {
      console.error("Error ending shift:", error);
      res.status(500).json({ message: "Failed to end shift" });
    }
  });

  app.get("/api/shifts", async (req, res) => {
    try {
      const shifts = await storage.getShifts();
      res.json(shifts);
    } catch (error) {
      console.error("Error getting shifts:", error);
      res.status(500).json({ message: "Failed to get shifts" });
    }
  });

  app.get("/api/shifts/:id/summary", async (req, res) => {
    try {
      const { id } = req.params;
      const summary = await storage.getShiftSummary(parseInt(id));
      
      if (!summary) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      res.json(summary);
    } catch (error) {
      console.error("Error getting shift summary:", error);
      res.status(500).json({ message: "Failed to get shift summary" });
    }
  });

  app.post("/api/shifts/:id/reconcile", async (req, res) => {
    try {
      const { id } = req.params;
      const { productCounts, adminNotes } = req.body;
      
      const shiftId = parseInt(id);
      const shift = await storage.getShift(shiftId);
      
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      // Perform reconciliation
      const reconciliationResponse = await fetch(`${req.protocol}://${req.get('host')}/api/shift-reconciliation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCounts, adminNotes })
      });
      
      const reconciliation = await reconciliationResponse.json();
      
      // Update shift with reconciliation data
      await storage.endShift(shiftId, {
        totalSales: shift.totalSales || "0",
        totalExpenses: shift.totalExpenses || "0", 
        netAmount: shift.netAmount || "0",
        stockDiscrepancies: reconciliation.totalDiscrepancies || 0,
        reconciliationId: reconciliation.id
      });
      
      // Create reconciliation activity
      await storage.createShiftActivity({
        shiftId: shiftId,
        activityType: "reconciliation",
        activityId: reconciliation.id,
        description: `Stock reconciliation completed. ${reconciliation.totalDiscrepancies || 0} discrepancies found.`,
        metadata: { 
          reconciliationId: reconciliation.id,
          discrepancies: reconciliation.totalDiscrepancies,
          products: Object.keys(productCounts).length
        }
      });
      
      res.json(reconciliation);
    } catch (error) {
      console.error("Error performing shift reconciliation:", error);
      res.status(500).json({ message: "Failed to perform reconciliation" });
    }
  });

  // Shift Activities Routes
  app.post("/api/shift-activities", async (req, res) => {
    try {
      const activityData = req.body;
      const activity = await storage.createShiftActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error creating shift activity:", error);
      res.status(500).json({ message: "Failed to create shift activity" });
    }
  });

  app.get("/api/shifts/:id/activities", async (req, res) => {
    try {
      const { id } = req.params;
      const activities = await storage.getShiftActivities(parseInt(id));
      res.json(activities);
    } catch (error) {
      console.error("Error getting shift activities:", error);
      res.status(500).json({ message: "Failed to get shift activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
