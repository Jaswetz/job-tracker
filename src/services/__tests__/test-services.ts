import { eq, desc, and, or, like } from "drizzle-orm";
import { getTestDatabase } from "../../database/test-connection";
import * as schema from "../../database/schema";
import type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobStatusHistory,
  JobStatus,
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  Contact,
  CreateContactInput,
  UpdateContactInput,
  JobContact,
} from "../../types";

export class TestJobService {
  private db = getTestDatabase();

  async create(jobData: CreateJobInput): Promise<Job> {
    const id = crypto.randomUUID();
    const dateSaved = new Date().toISOString();
    const newJob: Job = {
      id,
      dateSaved,
      ...jobData,
    };

    await this.db.insert(schema.jobs).values(newJob);

    // Create initial status history entry
    await this.createStatusHistoryEntry(id, undefined, jobData.status);

    return newJob;
  }

  async findById(id: string): Promise<Job | null> {
    const result = await this.db.select().from(schema.jobs).where(eq(schema.jobs.id, id)).limit(1);

    return (result[0] as Job) || null;
  }

  async findAll(): Promise<Job[]> {
    return this.db.select().from(schema.jobs).orderBy(desc(schema.jobs.dateSaved)).all() as Job[];
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    return this.db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.companyId, companyId))
      .orderBy(desc(schema.jobs.dateSaved))
      .all() as Job[];
  }

  async findByStatus(status: JobStatus): Promise<Job[]> {
    return this.db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.status, status))
      .orderBy(desc(schema.jobs.dateSaved))
      .all() as Job[];
  }

  async search(query: string): Promise<Job[]> {
    return this.db
      .select()
      .from(schema.jobs)
      .where(
        or(
          like(schema.jobs.jobTitle, `%${query}%`),
          like(schema.jobs.location, `%${query}%`),
          like(schema.jobs.department, `%${query}%`),
          like(schema.jobs.notes, `%${query}%`)
        )
      )
      .orderBy(desc(schema.jobs.dateSaved))
      .all() as Job[];
  }

  async update(id: string, updates: Partial<UpdateJobInput>): Promise<Job | null> {
    const existingJob = await this.findById(id);
    if (!existingJob) {
      return null;
    }

    // If status is being updated, create history entry
    if (updates.status && updates.status !== existingJob.status) {
      await this.createStatusHistoryEntry(id, existingJob.status, updates.status);
    }

    await this.db.update(schema.jobs).set(updates).where(eq(schema.jobs.id, id));

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(schema.jobs).where(eq(schema.jobs.id, id));

    return result.changes > 0;
  }

  async getStatusHistory(jobId: string): Promise<JobStatusHistory[]> {
    return this.db
      .select()
      .from(schema.jobStatusHistory)
      .where(eq(schema.jobStatusHistory.jobId, jobId))
      .orderBy(desc(schema.jobStatusHistory.changedAt))
      .all() as JobStatusHistory[];
  }

  private async createStatusHistoryEntry(
    jobId: string,
    oldStatus: JobStatus | undefined,
    newStatus: JobStatus,
    notes?: string
  ): Promise<void> {
    const historyEntry = {
      id: crypto.randomUUID(),
      jobId,
      oldStatus: oldStatus || null,
      newStatus,
      changedAt: new Date().toISOString(),
      notes: notes || null,
    };

    await this.db.insert(schema.jobStatusHistory).values(historyEntry);
  }
}

export class TestCompanyService {
  private db = getTestDatabase();

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

export class TestContactService {
  private db = getTestDatabase();

  async create(contactData: CreateContactInput): Promise<Contact> {
    const id = crypto.randomUUID();
    const newContact: Contact = {
      id,
      ...contactData,
    };

    await this.db.insert(schema.contacts).values(newContact);
    return newContact;
  }

  async findById(id: string): Promise<Contact | null> {
    const result = await this.db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.id, id))
      .limit(1);

    return (result[0] as Contact) || null;
  }

  async findAll(): Promise<Contact[]> {
    return this.db
      .select()
      .from(schema.contacts)
      .orderBy(schema.contacts.fullName)
      .all() as Contact[];
  }

  async findByCompanyId(companyId: string): Promise<Contact[]> {
    return this.db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.companyId, companyId))
      .orderBy(schema.contacts.fullName)
      .all() as Contact[];
  }

  async search(query: string): Promise<Contact[]> {
    return this.db
      .select()
      .from(schema.contacts)
      .where(
        or(
          like(schema.contacts.fullName, `%${query}%`),
          like(schema.contacts.jobTitle, `%${query}%`),
          like(schema.contacts.location, `%${query}%`),
          like(schema.contacts.email, `%${query}%`),
          like(schema.contacts.notes, `%${query}%`)
        )
      )
      .orderBy(schema.contacts.fullName)
      .all() as Contact[];
  }

  async update(id: string, updates: Partial<UpdateContactInput>): Promise<Contact | null> {
    const existingContact = await this.findById(id);
    if (!existingContact) {
      return null;
    }

    await this.db.update(schema.contacts).set(updates).where(eq(schema.contacts.id, id));

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    // Delete associated job-contact relationships first
    await this.db.delete(schema.jobContacts).where(eq(schema.jobContacts.contactId, id));

    const result = await this.db.delete(schema.contacts).where(eq(schema.contacts.id, id));

    return result.changes > 0;
  }

  // Job-Contact relationship management
  async linkToJob(contactId: string, jobId: string, relationshipType: string): Promise<void> {
    // Check if relationship already exists
    const existing = await this.db
      .select()
      .from(schema.jobContacts)
      .where(and(eq(schema.jobContacts.contactId, contactId), eq(schema.jobContacts.jobId, jobId)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing relationship
      await this.db
        .update(schema.jobContacts)
        .set({ relationshipType })
        .where(
          and(eq(schema.jobContacts.contactId, contactId), eq(schema.jobContacts.jobId, jobId))
        );
    } else {
      // Create new relationship
      await this.db.insert(schema.jobContacts).values({
        contactId,
        jobId,
        relationshipType,
      });
    }
  }

  async unlinkFromJob(contactId: string, jobId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.jobContacts)
      .where(and(eq(schema.jobContacts.contactId, contactId), eq(schema.jobContacts.jobId, jobId)));

    return result.changes > 0;
  }

  async getJobRelationships(contactId: string): Promise<JobContact[]> {
    return this.db
      .select()
      .from(schema.jobContacts)
      .where(eq(schema.jobContacts.contactId, contactId))
      .all() as JobContact[];
  }

  async getContactsForJob(jobId: string): Promise<Contact[]> {
    const result = await this.db
      .select({
        id: schema.contacts.id,
        fullName: schema.contacts.fullName,
        companyId: schema.contacts.companyId,
        jobTitle: schema.contacts.jobTitle,
        location: schema.contacts.location,
        linkedinUrl: schema.contacts.linkedinUrl,
        email: schema.contacts.email,
        phone: schema.contacts.phone,
        relationship: schema.contacts.relationship,
        goal: schema.contacts.goal,
        status: schema.contacts.status,
        followUpDate: schema.contacts.followUpDate,
        notes: schema.contacts.notes,
      })
      .from(schema.contacts)
      .innerJoin(schema.jobContacts, eq(schema.contacts.id, schema.jobContacts.contactId))
      .where(eq(schema.jobContacts.jobId, jobId))
      .orderBy(schema.contacts.fullName);

    return result as Contact[];
  }

  async getContactStats(contactId: string): Promise<{
    linkedJobs: number;
    companiesWorkedWith: number;
  }> {
    const jobRelationships = await this.getJobRelationships(contactId);

    // Get unique companies from linked jobs
    const jobIds = jobRelationships.map((rel) => rel.jobId);
    const uniqueCompanies = new Set<string>();

    for (const jobId of jobIds) {
      const job = await this.db
        .select({ companyId: schema.jobs.companyId })
        .from(schema.jobs)
        .where(eq(schema.jobs.id, jobId))
        .limit(1);

      if (job[0]) {
        uniqueCompanies.add(job[0].companyId);
      }
    }

    return {
      linkedJobs: jobRelationships.length,
      companiesWorkedWith: uniqueCompanies.size,
    };
  }

  async getContactsWithFollowUps(beforeDate?: string): Promise<Contact[]> {
    const targetDate = beforeDate || new Date().toISOString().split("T")[0];

    return this.db
      .select()
      .from(schema.contacts)
      .where(
        and(
          eq(schema.contacts.followUpDate, targetDate),
          or(
            eq(schema.contacts.status, "reached-out"),
            eq(schema.contacts.status, "responded"),
            eq(schema.contacts.status, "meeting-scheduled"),
            eq(schema.contacts.status, "ongoing")
          )
        )
      )
      .orderBy(schema.contacts.followUpDate)
      .all() as Contact[];
  }
}
