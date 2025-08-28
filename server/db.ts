import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced production database configuration
const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Production-specific connection settings
  max: isProduction ? 20 : 10, // Higher connection limit for production
  idleTimeoutMillis: isProduction ? 30000 : 10000, // 30s idle timeout in production
  connectionTimeoutMillis: isProduction ? 10000 : 5000, // 10s connection timeout
  allowExitOnIdle: !isProduction, // Don't exit on idle in production
  // Additional production reliability settings
  query_timeout: isProduction ? 30000 : 10000, // 30s query timeout in production
  statement_timeout: isProduction ? 30000 : 10000, // 30s statement timeout
  keepAlive: isProduction // Enable TCP keepalive in production
});

// Connection error handling for production
pool.on('error', (err: any) => {
  console.error('❌ Database connection error:', {
    message: err.message,
    code: err.code,
    stack: err.stack?.substring(0, 500)
  });
});

// Connection successful logging
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

// Test database connection on startup
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    client.release();
    console.log('✅ Database connection test successful:', result.rows[0]);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection test failed:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail
    });
    return false;
  }
}
export const db = drizzle({ client: pool, schema });

// Initialize database connection test
if (isProduction) {
  testDatabaseConnection().then(success => {
    if (!success) {
      console.error('❌ CRITICAL: Database connection failed in production');
      process.exit(1); // Exit if database is not accessible in production
    }
  });
}