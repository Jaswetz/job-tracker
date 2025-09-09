import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle>;

export function initializeTestDatabase() {
  // Use in-memory database for tests
  const sqlite = new Database(":memory:");

  // Enable foreign keys
  sqlite.pragma("foreign_keys = ON");

  // Create Drizzle instance
  db = drizzle(sqlite, { schema });

  // Create tables manually for tests (since migrations might not work in memory)
  sqlite.exec(`
    CREATE TABLE companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      industry TEXT,
      size TEXT,
      type TEXT,
      location TEXT,
      website TEXT,
      linkedin_url TEXT,
      year_founded INTEGER,
      excitement_level INTEGER NOT NULL DEFAULT 3 CHECK (excitement_level BETWEEN 1 AND 5),
      glassdoor_rating REAL,
      notes TEXT
    );

    CREATE TABLE jobs (
      id TEXT PRIMARY KEY,
      job_title TEXT NOT NULL,
      company_id TEXT NOT NULL,
      job_url TEXT,
      application_url TEXT,
      department TEXT,
      job_type TEXT NOT NULL,
      seniority_level TEXT NOT NULL,
      salary_min INTEGER,
      salary_max INTEGER,
      location TEXT NOT NULL,
      date_posted TEXT,
      date_saved TEXT NOT NULL,
      date_applied TEXT,
      deadline TEXT,
      status TEXT NOT NULL,
      rejection_date TEXT,
      rejection_stage TEXT,
      excitement_level INTEGER NOT NULL CHECK (excitement_level BETWEEN 1 AND 5),
      notes TEXT,
      follow_up_date TEXT,
      source TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE contacts (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      company_id TEXT,
      job_title TEXT,
      location TEXT,
      linkedin_url TEXT,
      email TEXT,
      phone TEXT,
      relationship TEXT NOT NULL,
      goal TEXT NOT NULL,
      status TEXT NOT NULL,
      follow_up_date TEXT,
      notes TEXT,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE job_contacts (
      job_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      PRIMARY KEY (job_id, contact_id),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE job_status_history (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export function getTestDatabase() {
  if (!db) {
    return initializeTestDatabase();
  }
  return db;
}
