import { DatabaseStorage } from "./storage";

const storage = new DatabaseStorage();

export async function seedDatabase(): Promise<void> {
  console.log("🌱 Starting database seeding...");
  
  try {
    // Seed admin user
    await seedAdminUser();
    
    // Seed demo member
    await seedDemoMember();
    
    // Seed products
    await seedProducts();
    
    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    // Don't throw error to avoid crashing the application
    // Just log it and continue - the app should still start
  }
}

async function seedAdminUser(): Promise<void> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📝 Attempting to check admin user (attempt ${attempt}/${MAX_RETRIES})...`);
      const adminUser = await storage.getUserByEmail("admin123@gmail.com");
      
      if (!adminUser) {
        console.log("📝 Creating admin123@gmail.com user...");
        await storage.createUser({
          email: "admin123@gmail.com",
          password: "admin123",
          firstName: "tom",
          lastName: "tom",
          role: "superadmin",
          isOnboarded: true,
          membershipStatus: "approved"
        });
        console.log("✅ Admin user created successfully");
      } else {
        console.log("ℹ️ Admin user already exists");
      }
      return; // Success, exit the retry loop
    } catch (error) {
      console.error(`❌ Error seeding admin user (attempt ${attempt}/${MAX_RETRIES}):`, error);
      
      if (attempt === MAX_RETRIES) {
        console.error("❌ Failed to seed admin user after all retries, continuing anyway...");
        return; // Don't throw error, continue with app startup
      }
      
      // Wait before retrying
      console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

async function seedDemoMember(): Promise<void> {
  try {
    const demoUser = await storage.getUserByEmail("demo@member.com");
    
    if (!demoUser) {
      console.log("📝 Creating demo@member.com user...");
      await storage.createUser({
        email: "demo@member.com",
        password: "demo123",
        firstName: "John",
        lastName: "Doe",
        isOnboarded: true,
        membershipStatus: "approved"
      });
      console.log("✅ Demo member created successfully");
    } else {
      console.log("ℹ️ Demo member already exists");
    }
  } catch (error) {
    console.error("❌ Error seeding demo member:", error);
    throw error;
  }
}

async function seedProducts(): Promise<void> {
  try {
    const products = await storage.getProducts();
    console.log(`📊 Current products count: ${products.length}`);
    
    if (products.length === 0) {
      console.log("📝 Seeding initial products...");
      
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

      for (const productData of seedProducts) {
        await storage.createProduct(productData);
        console.log(`✅ Created product: ${productData.name}`);
      }
      
      console.log(`✅ Successfully seeded ${seedProducts.length} products`);
    } else {
      console.log("ℹ️ Products already exist, skipping product seeding");
    }
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  }
}