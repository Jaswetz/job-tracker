import { eq, like, or, and } from "drizzle-orm";
import { getDatabase } from "../database/connection";
import * as schema from "../database/schema";
import type { Contact, CreateContactInput, UpdateContactInput, JobContact } from "../types";

export class ContactService {
  private db = getDatabase();

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
}
