import * as schema from "@shared/schema";

let pool: any = null;
let db: any = null;

export async function getDb() {
// Only initialize once
if (!pool) {
  // Dynamically import packages at runtime
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");

  // Read DATABASE_URL at runtime
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set at runtime. Did you forget to provision a database?"
    );
  }

  // Production-ready pool configuration
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT;
  
  pool = new Pool({ 
    connectionString: databaseUrl,
    // Deployment-optimized connection pool settings
    max: isProduction ? 15 : 10, // Maximum pool size (reduced for deployment stability)
    min: isProduction ? 3 : 2, // Minimum pool size
    idleTimeoutMillis: isProduction ? 20000 : 30000, // Close idle connections faster in deployment
    connectionTimeoutMillis: isProduction ? 5000 : 2000, // Longer timeout for deployment
    ssl: isProduction ? { rejectUnauthorized: false } : false // SSL for production
  });
  
  // Handle pool errors gracefully with deployment-specific recovery
  pool.on('error', (err: any) => {
    console.error('Database pool error:', err);
    
    // In deployment, log specific error types for debugging
    if (isProduction) {
      console.error('Deployment database error details:', {
        code: err.code,
        message: err.message,
        severity: err.severity
      });
    }
  });

  db = drizzle(pool, { schema });
}

return db;
}