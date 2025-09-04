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
    max: isProduction ? 8 : 10, // Reduced max connections for deployment stability
    min: isProduction ? 1 : 2, // Reduced minimum pool size
    idleTimeoutMillis: isProduction ? 30000 : 30000, // Keep connections alive longer
    connectionTimeoutMillis: isProduction ? 3000 : 2000, // Shorter timeout for faster failure detection
    ssl: isProduction ? { rejectUnauthorized: false } : false, // SSL for production
    // Additional deployment stability settings
    allowExitOnIdle: false, // Keep pool alive
    keepAlive: true, // TCP keep alive
    keepAliveInitialDelayMillis: 0
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