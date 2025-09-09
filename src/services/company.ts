import { eq, like, or } from "drizzle-orm";
import { getDatabase } from "../database/connection";
import * as schema from "../database/schema";
import type { Company, CreateCompanyInput, UpdateCompanyInput } from "../types";

export class CompanyService {
  private db = getDatabase();

  async create(companyData: CreateCompanyInput): Promise<Company> {
    const id = crypto.randomUUID();
    const newCompany: Company = {
      id,
      ...companyData,
    };

    await this.db.insert(schema.companies).values(newCompany);
    return newCompany;
  }

  async findById(id: string): Promise<Company | null> {
    const result = await this.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id))
      .limit(1);

    return (result[0] as Company) || null;
  }

  async findByName(name: string): Promise<Company | null> {
    const result = await this.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.name, name))
      .limit(1);

    return (result[0] as Company) || null;
  }

  async findAll(): Promise<Company[]> {
    return this.db
      .select()
      .from(schema.companies)
      .orderBy(schema.companies.name)
      .all() as Company[];
  }

  async search(query: string): Promise<Company[]> {
    return this.db
      .select()
      .from(schema.companies)
      .where(
        or(
          like(schema.companies.name, `%${query}%`),
          like(schema.companies.industry, `%${query}%`),
          like(schema.companies.location, `%${query}%`),
          like(schema.companies.notes, `%${query}%`)
        )
      )
      .orderBy(schema.companies.name)
      .all() as Company[];
  }

  async update(id: string, updates: Partial<UpdateCompanyInput>): Promise<Company | null> {
    const existingCompany = await this.findById(id);
    if (!existingCompany) {
      return null;
    }

    await this.db.update(schema.companies).set(updates).where(eq(schema.companies.id, id));

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    // Check if company has associated jobs or contacts
    const jobs = await this.db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.companyId, id))
      .limit(1);

    const contacts = await this.db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.companyId, id))
      .limit(1);

    if (jobs.length > 0 || contacts.length > 0) {
      throw new Error("Cannot delete company with associated jobs or contacts");
    }

    const result = await this.db.delete(schema.companies).where(eq(schema.companies.id, id));

    return result.changes > 0;
  }

  /**
   * Auto-create company if it doesn't exist by name
   * This is used when adding jobs with new company names
   */
  async findOrCreate(
    companyName: string,
    additionalData?: Partial<CreateCompanyInput>
  ): Promise<Company> {
    // First try to find existing company
    const existing = await this.findByName(companyName);
    if (existing) {
      return existing;
    }

    // Create new company with provided name and optional additional data
    const companyData: CreateCompanyInput = {
      name: companyName,
      industry: null,
      size: null,
      type: null,
      location: null,
      website: null,
      linkedinUrl: null,
      yearFounded: null,
      excitementLevel: 3, // Default excitement level
      glassdoorRating: null,
      notes: null,
      ...additionalData,
    };

    return this.create(companyData);
  }

  async getCompanyStats(companyId: string): Promise<{
    totalJobs: number;
    totalContacts: number;
    jobsByStatus: Record<string, number>;
  }> {
    const jobs = await this.db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.companyId, companyId));

    const contacts = await this.db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.companyId, companyId));

    const jobsByStatus = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalJobs: jobs.length,
      totalContacts: contacts.length,
      jobsByStatus,
    };
  }
}
