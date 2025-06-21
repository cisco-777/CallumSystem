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

  app.post("/api/auth/complete-onboarding", async (req, res) => {
    try {
      console.log("Onboarding request received:", req.body);
      
      // For now, get the most recent user (in a real app, use session/token)
      const users = await storage.getUsers();
      if (users.length === 0) {
        return res.status(400).json({ message: "No user found" });
      }
      
      const userId = users[users.length - 1].id; // Get the latest user
      console.log("Updating user:", userId);
      
      const updates = {
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        phoneNumber: req.body.phoneNumber || '',
        dateOfBirth: req.body.dateOfBirth || '',
        address: req.body.address || '',
        isOnboarded: true
      };

      console.log("Updates to apply:", updates);
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

  // Donation route
  app.post("/api/donate", async (req, res) => {
    try {
      const userId = 1; // Would get from session/token in real app
      const basketItems = await storage.getBasketItems(userId);
      
      if (basketItems.length === 0) {
        return res.status(400).json({ message: "No items in basket" });
      }

      const donation = await storage.createDonation(userId, basketItems, "0");
      await storage.clearBasket(userId);
      
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to process donation" });
    }
  });

  // Seed some initial products
  app.post("/api/seed-products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      if (products.length === 0) {
        const seedProducts = [
          { name: "Zkittlez", description: "Premium hybrid strain with fruity flavors and balanced effects", category: "Hybrid" },
          { name: "Blue Dream", description: "Sativa-dominant hybrid known for its gentle cerebral effects", category: "Sativa" },
          { name: "Lemon Haze", description: "Energizing sativa with bright citrus aroma and uplifting effects", category: "Sativa" },
          { name: "Wedding Cake", description: "Indica-dominant hybrid with sweet vanilla flavors and relaxing effects", category: "Indica" }
        ];

        for (const product of seedProducts) {
          await storage.createProduct(product);
        }
      }
      res.json({ message: "Products seeded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
