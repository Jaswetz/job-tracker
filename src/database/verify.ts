import { initializeDatabase } from "./connection";
import * as schema from "./schema";

/**
 * Verify database setup and schema
 */
export async function verifyDatabase() {
  try {
    console.log("Verifying database setup...");

    const db = initializeDatabase();

    // Test basic operations on each table
    console.log("Testing companies table...");
    const companies = await db.select().from(schema.companies).limit(1);
    console.log(`✓ Companies table accessible (${companies.length} records)`);

    console.log("Testing jobs table...");
    const jobs = await db.select().from(schema.jobs).limit(1);
    console.log(`✓ Jobs table accessible (${jobs.length} records)`);

    console.log("Testing contacts table...");
    const contacts = await db.select().from(schema.contacts).limit(1);
    console.log(`✓ Contacts table accessible (${contacts.length} records)`);

    console.log("Testing job_contacts table...");
    const jobContacts = await db.select().from(schema.jobContacts).limit(1);
    console.log(`✓ Job-contacts table accessible (${jobContacts.length} records)`);

    console.log("Testing job_status_history table...");
    const statusHistory = await db.select().from(schema.jobStatusHistory).limit(1);
    console.log(`✓ Job status history table accessible (${statusHistory.length} records)`);

    console.log("✅ Database verification completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Database verification failed:", error);
    throw error;
  }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyDatabase()
    .then(() => {
      console.log("Database verification completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database verification failed:", error);
      process.exit(1);
    });
}
