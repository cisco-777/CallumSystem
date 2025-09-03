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
    // Production connection pool settings
    max: isProduction ? 20 : 10, // Maximum pool size
    min: isProduction ? 5 : 2, // Minimum pool size
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Connection timeout
    ssl: isProduction ? { rejectUnauthorized: false } : false // SSL for production
  });
  
  // Handle pool errors gracefully
  pool.on('error', (err: any) => {
    console.error('Database pool error:', err);
  });

  db = drizzle(pool, { schema });
}

return db;
}