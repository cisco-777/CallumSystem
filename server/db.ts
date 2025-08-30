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

   // Initialize Pool and Drizzle client
   pool = new Pool({ connectionString: databaseUrl });
   db = drizzle(pool, { schema });

   // Debug: Check what tables exist
   const result = await pool.query(`
     SELECT table_name FROM information_schema.tables 
     WHERE table_schema = 'public'
   `);
   console.log("Tables in database:", result.rows);
 }

 return db;
}