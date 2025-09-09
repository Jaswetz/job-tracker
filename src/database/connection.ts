import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: ReturnType<typeof drizzle>;

export function initializeDatabase(dbPath?: string) {
  let finalDbPath: string;

  if (dbPath) {
    finalDbPath = dbPath;
  } else {
    // Check if we're in Electron environment
    try {
      // Dynamic import for electron in ES modules
      const electron = eval('require("electron")');
      const userDataPath = electron.app.getPath("userData");
      finalDbPath = join(userDataPath, "job-search-tracker.db");
    } catch {
      // Fallback for non-Electron environments (like tests)
      finalDbPath = join(process.cwd(), "job-search-tracker.db");
    }
  }

  // Create SQLite connection
  const sqlite = new Database(finalDbPath);

  // Enable foreign keys
  sqlite.pragma("foreign_keys = ON");

  // Create Drizzle instance
  db = drizzle(sqlite, { schema });

  // Run migrations
  try {
    migrate(db, { migrationsFolder: join(__dirname, "../../drizzle") });
  } catch (error) {
    console.warn("Migration failed, this might be expected in test environment:", error);
  }

  return db;
}

export function getDatabase() {
  if (!db) {
    // Auto-initialize for non-Electron environments
    return initializeDatabase();
  }
  return db;
}
