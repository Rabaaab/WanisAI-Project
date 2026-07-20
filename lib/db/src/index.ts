import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePgLite } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import * as schema from "./schema";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Pool } = pg;

export let pool: any = null;
export let db: any;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNodePg(pool, { schema });
} else {
  console.warn("⚠️ DATABASE_URL is not set. Falling back to in-memory PGlite database.");
  const client = new PGlite();
  db = drizzlePgLite(client, { schema });

  // Run migrations dynamically on PGlite startup
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Find the drizzle migrations directory
    let migrationsFolder = "";
    const possiblePaths = [
      path.resolve(process.cwd(), "../../lib/db/drizzle"),
      path.resolve(process.cwd(), "./lib/db/drizzle"),
      path.resolve(process.cwd(), "../lib/db/drizzle"),
      path.resolve(process.cwd(), "./drizzle"),
      path.resolve(__dirname, "../drizzle"),
      path.resolve(__dirname, "../../lib/db/drizzle"),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(path.join(p, "meta/_journal.json"))) {
        migrationsFolder = p;
        break;
      }
    }
    
    if (!migrationsFolder) {
      throw new Error("Could not locate drizzle migrations folder.");
    }
    
    console.log(`🚀 Running in-memory migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log("✅ In-memory database migrated successfully.");
  } catch (err) {
    console.error("❌ Failed to migrate in-memory database:", err);
  }
}

export * from "./schema";
