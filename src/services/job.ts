import { eq, desc, and, or, like } from "drizzle-orm";
import { BaseService } from "./base-service";
import * as schema from "../database/schema";
import type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobStatusHistory,
  JobStatus,
  JobFilters,
} from "../types";

/**
 * Service for managing job applications with status tracking
 * Extends BaseService to reduce code duplication
 */
export class JobService extends BaseService<Job, CreateJobInput, UpdateJobInput> {
  protected table = schema.jobs;
  protected idColumn = schema.jobs.id;

  async create(jobData: CreateJobInput): Promise<Job> {
    const id = this.generateId();
    const dateSaved = this.getCurrentTimestamp();
    const newJob: Job = {
      id,
      dateSaved,
      ...jobData,
    };

    try {
      await this.db.insert(schema.jobs).values(newJob);
      // Create initial status history entry
      await this.createStatusHistoryEntry(id, undefined, jobData.status);
      return newJob;
    } catch (error) {
      throw new Error(
        `Failed to create job: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findAll(): Promise<Job[]> {
    return super.findAll(desc(schema.jobs.dateSaved));
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
    if (!query.trim()) {
      return this.findAll();
    }

    const searchColumns = [
      schema.jobs.jobTitle,
      schema.jobs.location,
      schema.jobs.department,
      schema.jobs.notes,
    ];

    const results = await this.searchFields(query, searchColumns);

    // Sort by relevance (jobs with title matches first, then by date)
    return results.sort((a, b) => {
      const aTitle = a.jobTitle.toLowerCase().includes(query.toLowerCase());
      const bTitle = b.jobTitle.toLowerCase().includes(query.toLowerCase());

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;

      return new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime();
    });
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
            eq(schema.jobs.status, JobStatus.APPLIED),
            eq(schema.jobs.status, JobStatus.PHONE_SCREEN),
            eq(schema.jobs.status, JobStatus.TECHNICAL_INTERVIEW),
            eq(schema.jobs.status, JobStatus.ONSITE_INTERVIEW),
            eq(schema.jobs.status, JobStatus.FINAL_INTERVIEW)
          )
        )
      )
      .orderBy(schema.jobs.followUpDate)
      .all() as Job[];
  }

  /**
   * Find jobs with advanced filtering options
   */
  async findByFilters(filters: JobFilters): Promise<Job[]> {
    let query = this.db.select().from(schema.jobs);
    const conditions: any[] = [];

    if (filters.status?.length) {
      conditions.push(or(...filters.status.map((status) => eq(schema.jobs.status, status))));
    }

    if (filters.companyId) {
      conditions.push(eq(schema.jobs.companyId, filters.companyId));
    }

    if (filters.seniorityLevel?.length) {
      conditions.push(
        or(...filters.seniorityLevel.map((level) => eq(schema.jobs.seniorityLevel, level)))
      );
    }

    if (filters.jobType?.length) {
      conditions.push(or(...filters.jobType.map((type) => eq(schema.jobs.jobType, type))));
    }

    if (filters.salaryMin) {
      conditions.push(eq(schema.jobs.salaryMin, filters.salaryMin));
    }

    if (filters.salaryMax) {
      conditions.push(eq(schema.jobs.salaryMax, filters.salaryMax));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(schema.jobs.dateSaved)).all() as Job[];
  }

  /**
   * Get job statistics for analytics
   */
  async getJobStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    jobsByStatus: Record<string, number>;
    averageExcitement: number;
  }> {
    const allJobs = await this.findAll();

    const activeStatuses = [
      JobStatus.SAVED,
      JobStatus.APPLIED,
      JobStatus.PHONE_SCREEN,
      JobStatus.TECHNICAL_INTERVIEW,
      JobStatus.ONSITE_INTERVIEW,
      JobStatus.FINAL_INTERVIEW,
      JobStatus.OFFER,
    ];

    const activeJobs = allJobs.filter((job) => activeStatuses.includes(job.status));

    const jobsByStatus = allJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageExcitement =
      allJobs.length > 0
        ? allJobs.reduce((sum, job) => sum + job.excitementLevel, 0) / allJobs.length
        : 0;

    return {
      totalJobs: allJobs.length,
      activeJobs: activeJobs.length,
      jobsByStatus,
      averageExcitement: Math.round(averageExcitement * 100) / 100,
    };
  }
}
