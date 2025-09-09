import { initializeDatabase } from "./connection";

/**
 * Initialize the database with proper setup
 * This function ensures the database is created and migrations are applied
 */
export async function initializeApp() {
  try {
    console.log("Initializing database...");
    const db = initializeDatabase();
    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Verify database integrity by checking if all tables exist
 */
export async function verifyDatabaseIntegrity() {
  try {
    const db = initializeDatabase();

    // Check if all required tables exist
    const tables = db
      .prepare(
        `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `
      )
      .all() as { name: string }[];

    const requiredTables = ["companies", "jobs", "contacts", "job_contacts", "job_status_history"];
    const existingTables = tables.map((t) => t.name);

    const missingTables = requiredTables.filter((table) => !existingTables.includes(table));

    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(", ")}`);
    }

    console.log("Database integrity verified - all tables present");
    return true;
  } catch (error) {
    console.error("Database integrity check failed:", error);
    throw error;
  }
}
