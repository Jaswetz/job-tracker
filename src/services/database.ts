import { getDatabase } from "../database/connection";
import * as schema from "../database/schema";
import type { Job, Company, Contact } from "../types";

export class DatabaseService {
  private db = getDatabase();

  // Test method to verify database connection
  async testConnection(): Promise<boolean> {
    try {
      // Simple query to test connection
      const result = this.db.select().from(schema.companies).limit(1).all();
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }

  // Company methods
  async createCompany(company: Omit<Company, "id">): Promise<Company> {
    const id = crypto.randomUUID();
    const newCompany = { id, ...company };

    await this.db.insert(schema.companies).values(newCompany);
    return newCompany;
  }

  async getCompanies(): Promise<Company[]> {
    return this.db.select().from(schema.companies).all() as Company[];
  }

  // Job methods
  async createJob(job: Omit<Job, "id" | "dateSaved">): Promise<Job> {
    const id = crypto.randomUUID();
    const dateSaved = new Date().toISOString();
    const newJob = { id, dateSaved, ...job };

    await this.db.insert(schema.jobs).values(newJob);
    return newJob;
  }

  async getJobs(): Promise<Job[]> {
    return this.db.select().from(schema.jobs).all() as Job[];
  }

  // Contact methods
  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    const id = crypto.randomUUID();
    const newContact = { id, ...contact };

    await this.db.insert(schema.contacts).values(newContact);
    return newContact;
  }

  async getContacts(): Promise<Contact[]> {
    return this.db.select().from(schema.contacts).all() as Contact[];
  }
}
