import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
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
        const productCode = (item.product as any)?.productCode || '';
        const price = parseInt(productCode.slice(-2)) || 10;
        return sum + (item.quantity * price);
      }, 0).toString();
      
      // Prepare order data
      const orderData = {
        userId,
        pickupCode,
        items: basketItems.map(item => ({
          name: item.product?.name,
          category: item.product?.category,
          productId: item.productId,
          productCode: (item.product as any)?.productCode
        })),
        quantities: basketItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
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

  const httpServer = createServer(app);
  return httpServer;
}
