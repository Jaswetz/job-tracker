import { eq, desc, and, or, like } from "drizzle-orm";
import { getDatabase } from "../database/connection";
import * as schema from "../database/schema";
import type { Job, CreateJobInput, UpdateJobInput, JobStatusHistory, JobStatus } from "../types";

export class JobService {
  private db = getDatabase();

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

  async getJobsWithFollowUps(beforeDate?: string): Promise<Job[]> {
    const targetDate = beforeDate || new Date().toISOString().split("T")[0];

    return this.db
      .select()
      .from(schema.jobs)
      .where(
        and(
          eq(schema.jobs.followUpDate, targetDate),
          or(
            eq(schema.jobs.status, "applied"),
            eq(schema.jobs.status, "phone-screen"),
            eq(schema.jobs.status, "technical-interview"),
            eq(schema.jobs.status, "onsite-interview"),
            eq(schema.jobs.status, "final-interview")
          )
        )
      )
      .orderBy(schema.jobs.followUpDate)
      .all() as Job[];
  }
}
