import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Email report generator function
async function generateShiftEmailReport(shiftId: number, storage: any, liveReconciliation?: any): Promise<string> {
  try {
    // Get shift details
    const shift = await storage.getShift(shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }

    // Get shift summary with all data
    const summary = await storage.getShiftSummary(shiftId);
    
    // Use live reconciliation data if provided, otherwise get from database
    let reconciliation = liveReconciliation;
    if (!reconciliation && shift.reconciliationId) {
      reconciliation = await storage.getShiftReconciliation(shift.reconciliationId);
    }

    // Get member statistics
    const memberStats = await storage.getMembershipStatistics();
    
    // Calculate new members registered during this shift (exclude admin accounts)
    const newMembersCount = await storage.getNewMembersDuringShift(shift.startTime, shift.endTime);

    // Get all products for stock information
    const products = await storage.getProducts();

    // Format dates and times
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Madrid'
      });
    };

    const shiftStartTime = formatTime(new Date(shift.startTime));
    const shiftEndTime = shift.endTime ? formatTime(new Date(shift.endTime)) : 'Ongoing';
    const shiftDate = formatDate(new Date(shift.startTime));

    // Helper function to get unit type for product category
    const getUnitType = (productType: string) => {
      return ['Pre-Rolls', 'Edibles'].includes(productType) ? 'units' : 'grams';
    };

    // Build the report
    let report = `Worker: ${shift.workerName}\n`;
    report += `Shift - ${shiftDate} ${shiftStartTime} - ${shiftEndTime}\n\n`;

    // Dispensary section - Show actual sales data from shift
    report += `DISPENSARY\n`;
    
    // Calculate sales by product category from completed orders during this shift
    const salesByCategory: { [key: string]: { totalAmount: number, totalQuantity: number, unitType: string } } = {};
    
    if (summary.orders && summary.orders.length > 0) {
      // Process completed orders from this shift
      summary.orders.filter((order: any) => order.status === 'completed').forEach((order: any) => {
        if (order.items && Array.isArray(order.items) && order.quantities && Array.isArray(order.quantities)) {
          order.items.forEach((item: any, index: number) => {
            const product = products.find((p: any) => p.id === item.productId);
            const quantityData = order.quantities.find((q: any) => q.productId === item.productId);
            
            if (product && quantityData) {
              const productType = product.productType || 'Cannabis';
              const unitType = getUnitType(productType);
              
              if (!salesByCategory[productType]) {
                salesByCategory[productType] = {
                  totalAmount: 0,
                  totalQuantity: 0,
                  unitType: unitType
                };
              }
              
              // Calculate price from product code (last 2 digits) like in donation process
              const productCode = item.productCode || product.productCode || '';
              const itemPrice = parseInt(productCode.slice(-2)) || 10;
              const quantity = quantityData.quantity || 1;
              
              // Add to category totals
              salesByCategory[productType].totalAmount += itemPrice * quantity;
              salesByCategory[productType].totalQuantity += quantity;
            }
          });
        }
      });
      
      // Display sales by category
      if (Object.keys(salesByCategory).length > 0) {
        Object.keys(salesByCategory).forEach(categoryType => {
          const categoryData = salesByCategory[categoryType];
          report += `${categoryType}: ₳${categoryData.totalAmount.toFixed(0)} ${categoryData.totalQuantity}${categoryData.unitType === 'grams' ? 'g' : ' units'} sold\n`;
        });
      } else {
        report += `No sales recorded during this shift\n`;
      }
    } else {
      report += `No sales recorded during this shift\n`;
    }
    report += `\n`;

    // Stock discrepancies section - Copy exact same logic as Discrepancy Details interface
    report += `STOCK DISCREPANCIES\n`;
    if (reconciliation && reconciliation.discrepancies && Object.keys(reconciliation.discrepancies).length > 0) {
      // Use exact same Object.entries logic as interface
      Object.entries(reconciliation.discrepancies).forEach(([productId, discrepancy]: [string, any]) => {
        // Copy exact same format logic from interface badge
        const difference = Math.abs(discrepancy.difference);
        const unitType = discrepancy.productType && ['Pre-Rolls', 'Edibles'].includes(discrepancy.productType) ? ' units' : 'g';
        const discrepancyType = discrepancy.type;
        
        // Format exactly like interface: "Product Name: Xg missing/excess"
        report += `${discrepancy.productName}: ${difference}${unitType} ${discrepancyType}\n`;
      });
    } else {
      report += `No stock discrepancies found\n`;
    }
    report += `\n`;

    // Member details section
    report += `MEMBER DETAILS\n`;
    report += `New members: ${newMembersCount}\n`;
    report += `All members: ${memberStats.approved + memberStats.renewed + memberStats.expired}\n`;
    report += `Active members: ${memberStats.active}\n`;
    report += `Renewed members: ${memberStats.renewed}\n`;
    report += `Expired members: ${memberStats.expired}\n\n`;

    // Financial summary
    report += `FINANCIAL SUMMARY\n`;
    
    // Expenses first with individual items
    if (summary.expenses && summary.expenses.length > 0) {
      report += `EXPENSES\n`;
      summary.expenses.forEach((expense: any) => {
        report += `${expense.description}: ₳${expense.amount}\n`;
      });
      report += `Total expenses: ₳${shift.totalExpenses || '0'}\n`;
    } else {
      report += `EXPENSES\n`;
      report += `No expenses recorded\n`;
      report += `Total expenses: ₳0\n`;
    }
    report += `\n`;
    
    // Financial details in requested order
    report += `Starting till: ₳${shift.startingTillAmount || '0'}\n`;
    
    // Cash breakdown if available
    if (reconciliation) {
      report += `Cash in till: ₳${reconciliation.cashInTill || '0'}\n`;
      report += `Notes: ${reconciliation.notes || '0'}\n`;
      report += `Coins: ${reconciliation.coins || '0'}\n`;
    }
    
    report += `Total collections: ₳${shift.totalSales || '0'}\n`;
    report += `Net total: ₳${shift.netAmount || '0'}\n\n`;

    return report;

  } catch (error) {
    console.error('Error generating email report:', error);
    return `Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

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
      
      // Automatically seed all production data on any login
      try {
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/seed-all-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log("Auto-seeding completed for production deployment");
      } catch (seedError) {
        console.log("Seeding already completed or error:", seedError);
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.password || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({ 
          message: "Your account has been banned. Please contact admin for assistance.",
          userBanned: true
        });
      }

      // Check membership status for non-admin users
      if (email !== "admin123@gmail.com") {
        // Update member activity
        await storage.updateMemberActivity(user.id);

        // Check if membership is expired
        if (user.expiryDate && new Date() > new Date(user.expiryDate)) {
          // Update status to expired if not already
          if (user.membershipStatus !== 'expired') {
            await storage.updateUser(user.id, { membershipStatus: 'expired' });
          }
          return res.status(403).json({ 
            message: "Your membership has expired. Please contact admin for renewal.",
            membershipExpired: true
          });
        }

        // Check if membership is still pending approval
        if (user.membershipStatus === 'pending') {
          return res.status(403).json({ 
            message: "Your membership is awaiting admin approval. You cannot access the catalog yet.",
            membershipPending: true
          });
        }
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log('🔵 Registration attempt:', req.body?.email);
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: "Email and password are required" });
      }

      console.log('🔍 Checking for existing user:', email);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('❌ Email already exists:', email);
        return res.status(400).json({ message: "Email already exists" });
      }

      console.log('✅ Creating new user:', email);
      const user = await storage.createUser({
        email,
        password,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: ''
      });

      console.log('✅ User created successfully:', user.id, email);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('💥 Registration error:', error);
      console.error('💥 Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        message: "Failed to create user",
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      });
    }
  });

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Get user from database
      const user = await storage.getUserByEmail(email);
      
      // Check if user exists and has admin role
      if (!user || !user.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      // For admin123@gmail.com, check hardcoded password for backward compatibility
      // For other admin users, check database password
      let isValidPassword = false;
      if (email === "admin123@gmail.com" && password === "admin123") {
        isValidPassword = true;
      } else if (user.password && user.password === password) {
        isValidPassword = true;
      }
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      const adminResponse = { 
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.role === 'superadmin'
      };
      
      console.log('Admin login response:', adminResponse);
      
      res.json({ 
        success: true, 
        admin: adminResponse
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Initialize existing members with approved status and 1-year expiry
  app.post("/api/membership/initialize-existing", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const approvalDate = new Date();
      const expiryDate = new Date(approvalDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      let updatedCount = 0;
      for (const user of users) {
        // Skip if membership fields are already set
        if (!user.membershipStatus || user.membershipStatus === 'pending') {
          await storage.updateUser(user.id, {
            membershipStatus: 'approved',
            approvalDate,
            expiryDate,
            approvedBy: 'System Migration',
            renewalCount: 0
          });
          updatedCount++;
        }
      }
      
      res.json({ 
        message: `Updated ${updatedCount} existing members with approved status`,
        updatedCount
      });
    } catch (error) {
      console.error("Error initializing existing members:", error);
      res.status(500).json({ message: "Failed to initialize existing members" });
    }
  });

  // Membership Management Routes
  app.get("/api/membership/pending", async (req, res) => {
    try {
      const pendingMembers = await storage.getPendingMembers();
      res.json(pendingMembers);
    } catch (error) {
      console.error("Error fetching pending members:", error);
      res.status(500).json({ message: "Failed to fetch pending members" });
    }
  });

  app.get("/api/membership/approved", async (req, res) => {
    try {
      const approvedMembers = await storage.getApprovedMembers();
      res.json(approvedMembers);
    } catch (error) {
      console.error("Error fetching approved members:", error);
      res.status(500).json({ message: "Failed to fetch approved members" });
    }
  });

  app.get("/api/membership/expired", async (req, res) => {
    try {
      const expiredMembers = await storage.getExpiredMembers();
      res.json(expiredMembers);
    } catch (error) {
      console.error("Error fetching expired members:", error);
      res.status(500).json({ message: "Failed to fetch expired members" });
    }
  });

  app.get("/api/membership/statistics", async (req, res) => {
    try {
      const stats = await storage.getMembershipStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching membership statistics:", error);
      res.status(500).json({ message: "Failed to fetch membership statistics" });
    }
  });

  app.post("/api/membership/approve/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { approvedBy } = req.body;
      
      if (!approvedBy) {
        return res.status(400).json({ message: "Approver information is required" });
      }
      
      const user = await storage.approveMember(userId, approvedBy);
      res.json(user);
    } catch (error) {
      console.error("Error approving member:", error);
      res.status(500).json({ message: "Failed to approve member" });
    }
  });

  app.post("/api/membership/renew/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.renewMembership(userId);
      res.json(user);
    } catch (error) {
      console.error("Error renewing membership:", error);
      res.status(500).json({ message: "Failed to renew membership" });
    }
  });

  app.post("/api/membership/update-activity/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      await storage.updateMemberActivity(userId);
      res.json({ message: "Activity updated successfully" });
    } catch (error) {
      console.error("Error updating member activity:", error);
      res.status(500).json({ message: "Failed to update member activity" });
    }
  });

  // Get single user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  // Ban user endpoint
  app.put("/api/users/:userId/ban", async (req, res) => {
    const isAdmin = req.headers['x-admin'] === 'true';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      const { reason, bannedBy } = req.body;
      
      await storage.updateUser(userId, {
        isBanned: true,
        bannedBy: bannedBy || 'admin',
        bannedAt: new Date(),
        banReason: reason || 'No reason provided'
      });
      
      res.json({ message: 'User banned successfully' });
    } catch (error) {
      console.error('Error banning user:', error);
      res.status(500).json({ error: 'Failed to ban user' });
    }
  });

  // Unban user endpoint
  app.put("/api/users/:userId/unban", async (req, res) => {
    const isAdmin = req.headers['x-admin'] === 'true';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      
      await storage.updateUser(userId, {
        isBanned: false,
        bannedBy: null,
        bannedAt: null,
        banReason: null
      });
      
      res.json({ message: 'User unbanned successfully' });
    } catch (error) {
      console.error('Error unbanning user:', error);
      res.status(500).json({ error: 'Failed to unban user' });
    }
  });

  // Admin Management Routes (superadmin only)
  app.get("/api/admin/list", async (req, res) => {
    const isAdmin = req.headers['x-admin'] === 'true';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      const adminUsers = await storage.getAdminUsers();
      // Remove passwords from response
      const safeAdminUsers = adminUsers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeAdminUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ error: 'Failed to fetch admin users' });
    }
  });

  app.post("/api/admin/create", async (req, res) => {
    const isAdmin = req.headers['x-admin'] === 'true';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      const { email, password, firstName, lastName, workerName, role = 'admin' } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !workerName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create admin user
      const newAdmin = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        // Store worker name in a custom field or use firstName/lastName combination
        phoneNumber: workerName, // Temporary field usage for worker name
        isOnboarded: true,
        membershipStatus: 'approved'
      });

      const { password: _, ...safeUser } = newAdmin;
      res.json({ user: safeUser });
    } catch (error) {
      console.error('Error creating admin user:', error);
      res.status(500).json({ error: 'Failed to create admin user' });
    }
  });

  app.delete("/api/admin/:adminId", async (req, res) => {
    const isAdmin = req.headers['x-admin'] === 'true';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      const adminId = parseInt(req.params.adminId);
      
      // Get the admin user to check if it exists and isn't superadmin
      const adminUser = await storage.getUser(adminId);
      if (!adminUser) {
        return res.status(404).json({ error: 'Admin user not found' });
      }

      if (adminUser.role === 'superadmin') {
        return res.status(403).json({ error: 'Cannot delete superadmin account' });
      }

      await storage.deleteUser(adminId);
      res.json({ message: 'Admin user deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin user:', error);
      res.status(500).json({ error: 'Failed to delete admin user' });
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
  app.get("/api/basket/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const basketItems = await storage.getBasketItems(userId);
      res.json(basketItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch basket" });
    }
  });

  app.post("/api/basket/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
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
  app.get("/api/member/donations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const donations = await storage.getUserDonations(userId);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation history" });
    }
  });

  // Donation route
  app.post("/api/donate/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
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
      
      // Get active shift to link order
      const activeShift = await storage.getActiveShift();
      
      // Prepare order data
      const orderData = {
        userId,
        pickupCode,
        items: basketItems.map(item => ({
          name: (item as any).product?.name,
          category: (item as any).product?.productType || (item as any).product?.category,
          productId: item.productId,
          productCode: (item as any).product?.productCode
        })),
        quantities: basketItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity || 1
        })),
        totalPrice,
        shiftId: activeShift?.id || null // Link order to active shift
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
        // This route should not be used for user orders - use /api/orders/:userId instead
        return res.status(400).json({ message: "Use /api/orders/:userId for user-specific orders" });
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user orders" });
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

  app.post("/api/orders/clear-all", async (req, res) => {
    try {
      await storage.deleteAllOrders();
      res.json({ message: "All orders cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear all orders" });
    }
  });

  // Manual order creation endpoint
  app.post("/api/orders/manual", async (req, res) => {
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items array is required" });
      }

      // Validate all items have valid productId and quantity
      for (const item of items) {
        if (!item.productId || item.productId <= 0 || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: "All items must have valid productId and quantity" });
        }
      }

      // Generate random 4-digit pickup code
      const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Get product details and calculate total price
      const products = await storage.getProducts();
      let totalPrice = 0;
      const orderItems = [];
      const orderQuantities = [];

      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
        }

        // Check if sufficient stock is available
        const availableStock = product.onShelfGrams || 0;
        if (availableStock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${availableStock}g, Requested: ${item.quantity}g` 
          });
        }

        // Calculate price (use shelfPrice if available, otherwise adminPrice, or productCode last 2 digits)
        let price = 0;
        if (product.shelfPrice && parseFloat(product.shelfPrice) > 0) {
          price = parseFloat(product.shelfPrice);
        } else if (product.adminPrice && parseFloat(product.adminPrice) > 0) {
          price = parseFloat(product.adminPrice);
        } else {
          const productCode = product.productCode || '';
          price = parseInt(productCode.slice(-2)) || 10;
        }

        totalPrice += price * item.quantity;

        orderItems.push({
          name: product.name,
          category: product.productType || product.category,
          productId: product.id,
          productCode: product.productCode
        });

        orderQuantities.push({
          productId: product.id,
          quantity: item.quantity
        });
      }
      
      // Get active shift to link order
      const activeShift = await storage.getActiveShift();
      
      // Prepare order data (no userId for manual orders - they are admin-created)
      const orderData = {
        userId: null, // Manual orders don't have associated users
        pickupCode,
        items: orderItems,
        quantities: orderQuantities,
        totalPrice: totalPrice.toString(),
        shiftId: activeShift?.id || null,
        status: 'completed' // Manual orders are immediately completed and reduce stock
      };

      // Create order record
      const order = await storage.createOrder(orderData);

      // Immediately reduce stock for manual orders
      await storage.confirmOrderAndReduceStock(order.id);
      
      res.json({ 
        success: true, 
        pickupCode,
        order: {
          ...order,
          status: 'completed'
        },
        totalPrice: totalPrice.toString(),
        items: orderItems,
        quantities: orderQuantities,
        message: `Manual order created successfully with pickup code ${pickupCode}. Stock has been updated.`
      });
    } catch (error) {
      console.error("Manual order creation error:", error);
      res.status(500).json({ message: "Failed to create manual order", error: String(error) });
    }
  });

  // Seed some initial products
  // Seed admin user if it doesn't exist
  app.post("/api/seed-admin", async (req, res) => {
    try {
      console.log("Checking for admin user...");
      const adminUser = await storage.getUserByEmail("admin123@gmail.com");
      
      if (!adminUser) {
        console.log("Creating admin123@gmail.com user...");
        await storage.createUser({
          email: "admin123@gmail.com",
          password: "admin123",
          firstName: "Admin",
          lastName: "User",
          role: "superadmin",
          isOnboarded: true,
          membershipStatus: "approved"
        });
        console.log("Admin user created successfully");
        res.json({ message: "Admin user created" });
      } else {
        console.log("Admin user already exists");
        res.json({ message: "Admin user already exists" });
      }
    } catch (error) {
      console.error("Error seeding admin:", error);
      res.status(500).json({ message: "Failed to seed admin", error: String(error) });
    }
  });

  app.post("/api/seed-all-data", async (req, res) => {
    try {
      console.log("Seeding ALL production data...");
      
      // Seed admin first
      const adminUser = await storage.getUserByEmail("admin123@gmail.com");
      if (!adminUser) {
        const adminData = {
          email: "admin123@gmail.com",
          password: "admin123",
          firstName: "tom",
          lastName: "tom",
          phoneNumber: "+341241224",
          dateOfBirth: "2025-08-06",
          address: "tom",
          isOnboarded: true,
          membershipStatus: "approved" as const,
          approvalDate: new Date("2025-08-26T21:57:21.551Z"),
          expiryDate: new Date("2026-08-26T21:57:21.551Z"),
          approvedBy: "System Migration",
          renewalCount: 0,
          role: "superadmin" as const,
          isBanned: false
        };
        await storage.createUser(adminData);
        console.log("Admin account created");
      }

      // Seed demo member
      const demoUser = await storage.getUserByEmail("demo@member.com");
      if (!demoUser) {
        const demoData = {
          email: "demo@member.com",
          password: "demo123",
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "+44 7700 900123",
          dateOfBirth: "1990-01-15",
          address: "123 Demo Street, London, UK",
          isOnboarded: true,
          membershipStatus: "approved" as const,
          approvalDate: new Date("2025-08-26T21:57:21.551Z"),
          expiryDate: new Date("2026-08-26T21:57:21.551Z"),
          approvedBy: "System Migration",
          renewalCount: 0,
          isBanned: false,
          lastActive: new Date("2025-08-28T12:12:12.216Z")
        };
        await storage.createUser(demoData);
        console.log("Demo member created");
      }

      // Seed pending member
      const pendingUser = await storage.getUserByEmail("Tim123@gmail.com");
      if (!pendingUser) {
        const pendingData = {
          email: "Tim123@gmail.com",
          password: "tim123",
          isOnboarded: false,
          membershipStatus: "pending" as const,
          renewalCount: 0,
          isBanned: false
        };
        await storage.createUser(pendingData);
        console.log("Pending member created");
      }

      // Seed products with complete data
      const products = await storage.getProducts();
      if (products.length === 0) {
        const seedProducts = [
          { 
            name: "Zkittlez",
            description: "Premium indoor Indica strain with sweet fruity flavors",
            imageUrl: "/api/placeholder/300/200",
            category: "Indica",
            productType: "Cannabis",
            productCode: "ZK4312",
            stockQuantity: 171,
            adminPrice: "12",
            supplier: "Premium Growers Ltd",
            onShelfGrams: 36,
            internalGrams: 50,
            externalGrams: 85,
            costPrice: "8.00",
            shelfPrice: "12.00"
          },
          { 
            name: "Blue Dream",
            description: "Popular Sativa-dominant hybrid with blueberry notes",
            imageUrl: "/api/placeholder/300/200",
            category: "Hybrid",
            productType: "Cannabis",
            productCode: "BD7010",
            stockQuantity: 174,
            adminPrice: "10",
            supplier: "California Seeds Co",
            onShelfGrams: 46,
            internalGrams: 45,
            externalGrams: 83,
            costPrice: "7.00",
            shelfPrice: "10.00"
          },
          { 
            name: "Lemon Haze",
            description: "Energizing Sativa with citrusy lemon aroma",
            imageUrl: "/api/placeholder/300/200",
            category: "Sativa",
            productType: "Cannabis",
            productCode: "LH2213",
            stockQuantity: 216,
            adminPrice: "13",
            supplier: "Dutch Masters",
            onShelfGrams: 93,
            internalGrams: 60,
            externalGrams: 63,
            costPrice: "9.00",
            shelfPrice: "13.00"
          },
          { 
            name: "Wedding Cake",
            description: "Relaxing Indica-dominant hybrid with vanilla undertones",
            imageUrl: "/api/placeholder/300/200",
            category: "Hybrid",
            productType: "Cannabis",
            productCode: "WC9615",
            stockQuantity: 262,
            adminPrice: "15",
            supplier: "Wedding Growers",
            onShelfGrams: 142,
            internalGrams: 70,
            externalGrams: 50,
            costPrice: "11.00",
            shelfPrice: "15.00"
          },
          { 
            name: "Moroccan Hash",
            description: "Traditional hash with earthy flavors",
            imageUrl: "/api/placeholder/300/200",
            category: "Indica",
            productType: "Hash",
            productCode: "MH5812",
            stockQuantity: 276,
            adminPrice: "12",
            supplier: "Moroccan Imports",
            onShelfGrams: 166,
            internalGrams: 40,
            externalGrams: 70,
            costPrice: "8.50",
            shelfPrice: "12.00"
          },
          { 
            name: "Dry-Shift Hash",
            description: "Premium sativa hash with clean taste",
            imageUrl: "/api/placeholder/300/200",
            category: "Sativa",
            productType: "Hash",
            productCode: "DS1410",
            stockQuantity: 235,
            adminPrice: "10",
            supplier: "Alpine Hash Co",
            onShelfGrams: 155,
            internalGrams: 30,
            externalGrams: 50,
            costPrice: "7.50",
            shelfPrice: "10.00"
          }
        ];

        for (const product of seedProducts) {
          await storage.createProduct(product);
        }
        console.log("All products seeded");
      }

      res.json({ message: "ALL data seeded for production!" });
    } catch (error) {
      console.error("Error seeding all data:", error);
      res.status(500).json({ message: "Failed to seed all data", error: String(error) });
    }
  });

  app.post("/api/seed-products", async (req, res) => {
    try {
      console.log("Seeding products...");
      const products = await storage.getProducts();
      console.log("Current products count:", products.length);
      if (products.length === 0) {
        const seedProducts = [
          { 
            name: "Zkittlez",
            description: "Premium indoor Indica strain with sweet fruity flavors",
            imageUrl: "/api/placeholder/300/200",
            category: "Indica",
            productType: "Cannabis",
            productCode: "ZK4312",
            stockQuantity: 171,
            adminPrice: "12",
            supplier: "Premium Growers Ltd",
            onShelfGrams: 36,
            internalGrams: 50,
            externalGrams: 85,
            costPrice: "8.00",
            shelfPrice: "12.00"
          },
          { 
            name: "Blue Dream",
            description: "Popular Sativa-dominant hybrid with blueberry notes",
            imageUrl: "/api/placeholder/300/200",
            category: "Hybrid",
            productType: "Cannabis",
            productCode: "BD7010",
            stockQuantity: 174,
            adminPrice: "10",
            supplier: "California Seeds Co",
            onShelfGrams: 46,
            internalGrams: 45,
            externalGrams: 83,
            costPrice: "7.00",
            shelfPrice: "10.00"
          },
          { 
            name: "Lemon Haze",
            description: "Energizing Sativa with citrusy lemon aroma",
            imageUrl: "/api/placeholder/300/200",
            category: "Sativa",
            productType: "Cannabis",
            productCode: "LH2213",
            stockQuantity: 216,
            adminPrice: "13",
            supplier: "Dutch Masters",
            onShelfGrams: 93,
            internalGrams: 60,
            externalGrams: 63,
            costPrice: "9.00",
            shelfPrice: "13.00"
          },
          { 
            name: "Wedding Cake",
            description: "Relaxing Indica-dominant hybrid with vanilla undertones",
            imageUrl: "/api/placeholder/300/200",
            category: "Hybrid",
            productType: "Cannabis",
            productCode: "WC9615",
            stockQuantity: 262,
            adminPrice: "15",
            supplier: "Wedding Growers",
            onShelfGrams: 142,
            internalGrams: 70,
            externalGrams: 50,
            costPrice: "11.00",
            shelfPrice: "15.00"
          },
          { 
            name: "Moroccan Hash",
            description: "Traditional hash with earthy flavors",
            imageUrl: "/api/placeholder/300/200",
            category: "Indica",
            productType: "Hash",
            productCode: "MH5812",
            stockQuantity: 276,
            adminPrice: "12",
            supplier: "Moroccan Imports",
            onShelfGrams: 166,
            internalGrams: 40,
            externalGrams: 70,
            costPrice: "8.50",
            shelfPrice: "12.00"
          },
          { 
            name: "Dry-Shift Hash",
            description: "Premium sativa hash with clean taste",
            imageUrl: "/api/placeholder/300/200",
            category: "Sativa",
            productType: "Hash",
            productCode: "DS1410",
            stockQuantity: 235,
            adminPrice: "10",
            supplier: "Alpine Hash Co",
            onShelfGrams: 155,
            internalGrams: 30,
            externalGrams: 50,
            costPrice: "7.50",
            shelfPrice: "10.00"
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
      const { productCounts, cashInTill, coins, notes } = req.body;
      
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
            productType: product.productType,
            expected: expectedOnShelf,
            actual: physicalCount,
            difference: difference, // Store actual difference (positive = missing, negative = excess)
            type: difference > 0 ? 'missing' : 'excess'
          };
          totalDiscrepancies += Math.abs(difference);
        }
      }
      
      // Save the reconciliation with cash breakdown
      const reconciliation = await storage.createShiftReconciliation({
        productCounts,
        discrepancies,
        totalDiscrepancies,
        cashInTill: cashInTill || '0',
        coins: coins || '0',
        notes: notes || '0'
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
      const { description, amount, workerName, shiftId } = req.body;
      
      if (!description || !amount || !workerName) {
        return res.status(400).json({ message: "Description, amount, and worker name are required" });
      }
      
      const expense = await storage.createExpense({
        description,
        amount,
        workerName,
        shiftId: shiftId || null
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
      const { description, amount, workerName, shiftId } = req.body;
      
      const expense = await storage.updateExpense(parseInt(id), {
        description,
        amount,
        workerName,
        shiftId: shiftId || null
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
      const { workerName, startingTillAmount } = req.body;
      
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
      
      // Generate unique shift ID in DD/MM/YYYY format
      const today = new Date();
      const dayStr = today.getDate().toString().padStart(2, '0');
      const monthStr = (today.getMonth() + 1).toString().padStart(2, '0');
      const yearStr = today.getFullYear().toString();
      const dateStr = `${dayStr}/${monthStr}/${yearStr}`;
      
      // Check for existing shifts today and create unique ID
      const allShifts = await storage.getShifts();
      const baseShiftId = `SHIFT ${dateStr}`;
      
      // Find all shifts that start with today's base shift ID
      const shiftsToday = allShifts.filter(shift => {
        return shift.shiftId === baseShiftId || shift.shiftId.startsWith(`${baseShiftId} - `);
      });
      
      // Generate the next sequential shift ID
      let shiftId = baseShiftId;
      if (shiftsToday.length > 0) {
        // Extract sequence numbers from existing shift IDs
        const sequenceNumbers = shiftsToday.map(shift => {
          if (shift.shiftId === baseShiftId) return 1;
          const match = shift.shiftId.match(/ - (\d+)$/);
          return match ? parseInt(match[1]) : 1;
        });
        
        // Find the next available sequence number
        const nextSequence = Math.max(...sequenceNumbers) + 1;
        shiftId = `${baseShiftId} - ${nextSequence}`;
      }
      
      const shift = await storage.createShift({
        shiftId,
        workerName,
        shiftDate: new Date().toISOString().split('T')[0],
        startingTillAmount: startingTillAmount || '0'
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
      
      // Calculate real-time totals
      const totalExpenses = summary.expenses
        .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || "0"), 0);
      
      const totalSales = summary.orders
        .filter((order: any) => order.status === "completed")
        .reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice || "0"), 0);
      
      const netAmount = totalSales - totalExpenses;
      
      // Add calculated totals to response
      const enhancedSummary = {
        ...summary,
        calculatedTotals: {
          totalSales: totalSales.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          netAmount: netAmount.toFixed(2)
        }
      };
      
      res.json(enhancedSummary);
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
      
      // Perform reconciliation directly without HTTP call to preserve data structure
      const { productCounts: reqProductCounts, cashInTill, coins, notes } = req.body;
      
      // Get all current products to calculate discrepancies
      const products = await storage.getProducts();
      const discrepancies: any = {};
      let totalDiscrepancies = 0;
      
      // Calculate discrepancies for each product
      for (const product of products) {
        const physicalCount = reqProductCounts[product.id] || 0;
        const expectedOnShelf = product.onShelfGrams || 0;
        const difference = expectedOnShelf - physicalCount;
        
        if (difference !== 0) {
          discrepancies[product.id] = {
            productName: product.name,
            productType: product.productType,
            expected: expectedOnShelf,
            actual: physicalCount,
            difference: difference, // Store actual difference (positive = missing, negative = excess)
            type: difference > 0 ? 'missing' : 'excess'
          };
          totalDiscrepancies += Math.abs(difference);
        }
      }
      
      // Save the reconciliation with cash breakdown
      const reconciliation = await storage.createShiftReconciliation({
        productCounts: reqProductCounts,
        discrepancies,
        totalDiscrepancies,
        cashInTill: cashInTill || '0',
        coins: coins || '0',
        notes: notes || '0'
      });
      
      // Get current shift summary to calculate actual totals
      const shiftSummary = await storage.getShiftSummary(shiftId);
      
      // Calculate actual totals from expenses and orders
      const totalExpenses = shiftSummary.expenses
        .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || "0"), 0);
      
      const totalSales = shiftSummary.orders
        .filter((order: any) => order.status === "completed")
        .reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice || "0"), 0);
      
      const netAmount = totalSales - totalExpenses;
      
      // Update shift with reconciliation data and calculated totals
      await storage.endShift(shiftId, {
        totalSales: totalSales.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2), 
        netAmount: netAmount.toFixed(2),
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
      
      // Perform automatic cleanup: keep only 3 most recent completed shifts
      await storage.cleanupOldShifts();
      
      // Generate email report for completed shift using live reconciliation data
      const emailReport = await generateShiftEmailReport(shiftId, storage, reconciliation);
      
      res.json({ ...reconciliation, emailReport });
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
