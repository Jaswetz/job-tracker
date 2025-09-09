import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getTestDatabase } from "../../database/test-connection";
import * as schema from "../../database/schema";
import { TestJobService, TestCompanyService } from "./test-services";
import {
  JobType,
  SeniorityLevel,
  JobStatus,
  JobSource,
  CompanySize,
  type CreateJobInput,
  type Company,
} from "../../types";

describe("JobService", () => {
  let jobService: TestJobService;
  let companyService: TestCompanyService;
  let testCompany: Company;
  let db: ReturnType<typeof getTestDatabase>;

  beforeEach(async () => {
    db = getTestDatabase();
    jobService = new TestJobService();
    companyService = new TestCompanyService();

    // Create a test company for job tests
    testCompany = await companyService.create({
      name: "Test Company",
      industry: "Technology",
      size: CompanySize.MEDIUM,
      type: null,
      location: "San Francisco, CA",
      website: null,
      linkedinUrl: null,
      yearFounded: null,
      excitementLevel: 4,
      glassdoorRating: null,
      notes: null,
    });
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(schema.jobStatusHistory);
    await db.delete(schema.jobContacts);
    await db.delete(schema.jobs);
    await db.delete(schema.contacts);
    await db.delete(schema.companies);
  });

  describe("create", () => {
    it("should create a new job with all required fields", async () => {
      const jobData: CreateJobInput = {
        jobTitle: "Senior Software Engineer",
        companyId: testCompany.id,
        jobUrl: "https://example.com/job",
        applicationUrl: null,
        department: "Engineering",
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.SENIOR,
        salaryMin: 120000,
        salaryMax: 150000,
        location: "San Francisco, CA",
        datePosted: "2024-01-15",
        dateApplied: null,
        deadline: "2024-02-15",
        status: JobStatus.SAVED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 5,
        notes: "Great opportunity",
        followUpDate: null,
        source: JobSource.LINKEDIN,
      };

      const createdJob = await jobService.create(jobData);

      expect(createdJob.id).toBeDefined();
      expect(createdJob.dateSaved).toBeDefined();
      expect(createdJob.jobTitle).toBe(jobData.jobTitle);
      expect(createdJob.companyId).toBe(testCompany.id);
      expect(createdJob.status).toBe(JobStatus.SAVED);

      // Verify status history was created
      const statusHistory = await jobService.getStatusHistory(createdJob.id);
      expect(statusHistory).toHaveLength(1);
      expect(statusHistory[0].newStatus).toBe(JobStatus.SAVED);
      expect(statusHistory[0].oldStatus).toBeNull();
    });

    it("should create a job with minimal required fields", async () => {
      const jobData: CreateJobInput = {
        jobTitle: "Developer",
        companyId: testCompany.id,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Remote",
        datePosted: null,
        dateApplied: null,
        deadline: null,
        status: JobStatus.SAVED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 3,
        notes: null,
        followUpDate: null,
        source: JobSource.OTHER,
      };

      const createdJob = await jobService.create(jobData);

      expect(createdJob.id).toBeDefined();
      expect(createdJob.jobTitle).toBe("Developer");
      expect(createdJob.location).toBe("Remote");
    });
  });

  describe("findById", () => {
    it("should find an existing job by id", async () => {
      const jobData: CreateJobInput = {
        jobTitle: "Test Job",
        companyId: testCompany.id,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Test Location",
        datePosted: null,
        dateApplied: null,
        deadline: null,
        status: JobStatus.SAVED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 3,
        notes: null,
        followUpDate: null,
        source: JobSource.OTHER,
      };

      const createdJob = await jobService.create(jobData);
      const foundJob = await jobService.findById(createdJob.id);

      expect(foundJob).not.toBeNull();
      expect(foundJob!.id).toBe(createdJob.id);
      expect(foundJob!.jobTitle).toBe("Test Job");
    });

    it("should return null for non-existent job", async () => {
      const foundJob = await jobService.findById("non-existent-id");
      expect(foundJob).toBeNull();
    });
  });

  describe("update", () => {
    it("should update job fields", async () => {
      const jobData: CreateJobInput = {
        jobTitle: "Original Title",
        companyId: testCompany.id,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Original Location",
        datePosted: null,
        dateApplied: null,
        deadline: null,
        status: JobStatus.SAVED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 3,
        notes: null,
        followUpDate: null,
        source: JobSource.OTHER,
      };

      const createdJob = await jobService.create(jobData);
      const updatedJob = await jobService.update(createdJob.id, {
        jobTitle: "Updated Title",
        location: "Updated Location",
        excitementLevel: 5,
      });

      expect(updatedJob).not.toBeNull();
      expect(updatedJob!.jobTitle).toBe("Updated Title");
      expect(updatedJob!.location).toBe("Updated Location");
      expect(updatedJob!.excitementLevel).toBe(5);
    });

    it("should create status history when status is updated", async () => {
      const jobData: CreateJobInput = {
        jobTitle: "Status Test Job",
        companyId: testCompany.id,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Test Location",
        datePosted: null,
        dateApplied: null,
        deadline: null,
        status: JobStatus.SAVED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 3,
        notes: null,
        followUpDate: null,
        source: JobSource.OTHER,
      };

      const createdJob = await jobService.create(jobData);
      await jobService.update(createdJob.id, {
        status: JobStatus.APPLIED,
        dateApplied: "2024-01-20",
      });

      const statusHistory = await jobService.getStatusHistory(createdJob.id);
      expect(statusHistory).toHaveLength(2);

      // Check that we have both status entries
      const statuses = statusHistory.map((h) => h.newStatus);
      expect(statuses).toContain(JobStatus.SAVED);
      expect(statuses).toContain(JobStatus.APPLIED);

      // Find the applied status entry and verify it has the correct old status
      const appliedEntry = statusHistory.find((h) => h.newStatus === JobStatus.APPLIED);
      expect(appliedEntry).toBeDefined();
      expect(appliedEntry!.oldStatus).toBe(JobStatus.SAVED);

      // Find the saved status entry and verify it has no old status
      const savedEntry = statusHistory.find((h) => h.newStatus === JobStatus.SAVED);
      expect(savedEntry).toBeDefined();
      expect(savedEntry!.oldStatus).toBeNull();
    });

    it("should return null when updating non-existent job", async () => {
      const result = await jobService.update("non-existent-id", {
        jobTitle: "Updated Title",
      });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete an existing job", async () => {
      const jobData: CreateJobInput = {
        jobTitle: "Job to Delete",
        companyId: testCompany.id,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Test Location",
        datePosted: null,
        dateApplied: null,
        deadline: null,
        status: JobStatus.SAVED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 3,
        notes: null,
        followUpDate: null,
        source: JobSource.OTHER,
      };

      const createdJob = await jobService.create(jobData);
      const deleted = await jobService.delete(createdJob.id);

      expect(deleted).toBe(true);

      const foundJob = await jobService.findById(createdJob.id);
      expect(foundJob).toBeNull();
    });

    it("should return false when deleting non-existent job", async () => {
      const deleted = await jobService.delete("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("search and filtering", () => {
    beforeEach(async () => {
      // Create test jobs for search
      await jobService.create({
        jobTitle: "Frontend Developer",
        companyId: testCompany.id,
        jobUrl: null,
        applicationUrl: null,
        department: "Engineering",
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "New York, NY",
        datePosted: null,
        dateApplied: null,
        deadline: null,
        status: JobStatus.SAVED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 4,
        notes: "React position",
        followUpDate: null,
        source: JobSource.LINKEDIN,
      });

      await jobService.create({
        jobTitle: "Backend Engineer",
        companyId: testCompany.id,
        jobUrl: null,
        applicationUrl: null,
        department: "Engineering",
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.SENIOR,
        salaryMin: null,
        salaryMax: null,
        location: "San Francisco, CA",
        datePosted: null,
        dateApplied: null,
        deadline: null,
        status: JobStatus.APPLIED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 5,
        notes: "Node.js position",
        followUpDate: null,
        source: JobSource.COMPANY_WEBSITE,
      });
    });

    it("should search jobs by title", async () => {
      const results = await jobService.search("Frontend");
      expect(results).toHaveLength(1);
      expect(results[0].jobTitle).toBe("Frontend Developer");
    });

    it("should search jobs by location", async () => {
      const results = await jobService.search("New York");
      expect(results).toHaveLength(1);
      expect(results[0].location).toBe("New York, NY");
    });

    it("should search jobs by notes", async () => {
      const results = await jobService.search("React");
      expect(results).toHaveLength(1);
      expect(results[0].notes).toBe("React position");
    });

    it("should find jobs by status", async () => {
      const savedJobs = await jobService.findByStatus(JobStatus.SAVED);
      const appliedJobs = await jobService.findByStatus(JobStatus.APPLIED);

      expect(savedJobs.length).toBeGreaterThanOrEqual(1);
      expect(appliedJobs.length).toBeGreaterThanOrEqual(1);
    });

    it("should find jobs by company", async () => {
      const companyJobs = await jobService.findByCompanyId(testCompany.id);
      expect(companyJobs.length).toBeGreaterThanOrEqual(2);
    });
  });
});
