import { initializeDatabase } from "./connection";

/**
 * Run database migrations
 * This script can be used to manually apply migrations
 */
export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    const db = initializeDatabase();
    console.log("Migrations completed successfully");
    return db;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log("Database migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database migration failed:", error);
      process.exit(1);
    });
}
