import ws from "ws";
import * as schema from "@shared/schema";

let pool: any = null;
let db: any = null;

export async function getDb() {
  // Only initialize once
  if (!pool) {
    // Dynamically import packages at runtime
    const { Pool, neonConfig } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-serverless");

    // Set WebSocket constructor
    neonConfig.webSocketConstructor = ws;

    // Read DATABASE_URL at runtime
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL must be set at runtime. Did you forget to provision a database?"
      );
    }

    // Initialize Pool and Drizzle client
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle({ client: pool, schema });
  }

  return db;
}
