import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getTestDatabase } from "../../database/test-connection";
import * as schema from "../../database/schema";
import { TestCompanyService, TestJobService } from "./test-services";
import {
  CompanySize,
  CompanyType,
  JobType,
  SeniorityLevel,
  JobStatus,
  JobSource,
  type CreateCompanyInput,
  type Company,
} from "../../types";

describe("CompanyService", () => {
  let companyService: TestCompanyService;
  let jobService: TestJobService;
  let db: ReturnType<typeof getTestDatabase>;

  beforeEach(async () => {
    db = getTestDatabase();
    companyService = new TestCompanyService();
    jobService = new TestJobService();
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
    it("should create a new company with all fields", async () => {
      const companyData: CreateCompanyInput = {
        name: "Tech Innovations Inc",
        industry: "Technology",
        size: CompanySize.LARGE,
        type: CompanyType.PUBLIC,
        location: "San Francisco, CA",
        website: "https://techinnovations.com",
        linkedinUrl: "https://linkedin.com/company/tech-innovations",
        yearFounded: 2010,
        excitementLevel: 5,
        glassdoorRating: 4.2,
        notes: "Great company culture",
      };

      const createdCompany = await companyService.create(companyData);

      expect(createdCompany.id).toBeDefined();
      expect(createdCompany.name).toBe(companyData.name);
      expect(createdCompany.industry).toBe(companyData.industry);
      expect(createdCompany.size).toBe(CompanySize.LARGE);
      expect(createdCompany.excitementLevel).toBe(5);
    });

    it("should create a company with minimal required fields", async () => {
      const companyData: CreateCompanyInput = {
        name: "Minimal Company",
        industry: null,
        size: null,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 3,
        glassdoorRating: null,
        notes: null,
      };

      const createdCompany = await companyService.create(companyData);

      expect(createdCompany.id).toBeDefined();
      expect(createdCompany.name).toBe("Minimal Company");
      expect(createdCompany.excitementLevel).toBe(3);
    });
  });

  describe("findById", () => {
    it("should find an existing company by id", async () => {
      const companyData: CreateCompanyInput = {
        name: "Find Test Company",
        industry: "Technology",
        size: CompanySize.MEDIUM,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 4,
        glassdoorRating: null,
        notes: null,
      };

      const createdCompany = await companyService.create(companyData);
      const foundCompany = await companyService.findById(createdCompany.id);

      expect(foundCompany).not.toBeNull();
      expect(foundCompany!.id).toBe(createdCompany.id);
      expect(foundCompany!.name).toBe("Find Test Company");
    });

    it("should return null for non-existent company", async () => {
      const foundCompany = await companyService.findById("non-existent-id");
      expect(foundCompany).toBeNull();
    });
  });

  describe("findByName", () => {
    it("should find an existing company by name", async () => {
      const companyData: CreateCompanyInput = {
        name: "Unique Company Name",
        industry: null,
        size: null,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 3,
        glassdoorRating: null,
        notes: null,
      };

      await companyService.create(companyData);
      const foundCompany = await companyService.findByName("Unique Company Name");

      expect(foundCompany).not.toBeNull();
      expect(foundCompany!.name).toBe("Unique Company Name");
    });

    it("should return null for non-existent company name", async () => {
      const foundCompany = await companyService.findByName("Non-existent Company");
      expect(foundCompany).toBeNull();
    });
  });

  describe("update", () => {
    it("should update company fields", async () => {
      const companyData: CreateCompanyInput = {
        name: "Original Company",
        industry: "Original Industry",
        size: CompanySize.SMALL,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 3,
        glassdoorRating: null,
        notes: null,
      };

      const createdCompany = await companyService.create(companyData);
      const updatedCompany = await companyService.update(createdCompany.id, {
        industry: "Updated Industry",
        size: CompanySize.LARGE,
        excitementLevel: 5,
        notes: "Updated notes",
      });

      expect(updatedCompany).not.toBeNull();
      expect(updatedCompany!.industry).toBe("Updated Industry");
      expect(updatedCompany!.size).toBe(CompanySize.LARGE);
      expect(updatedCompany!.excitementLevel).toBe(5);
      expect(updatedCompany!.notes).toBe("Updated notes");
    });

    it("should return null when updating non-existent company", async () => {
      const result = await companyService.update("non-existent-id", {
        industry: "Updated Industry",
      });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a company with no associated jobs or contacts", async () => {
      const companyData: CreateCompanyInput = {
        name: "Company to Delete",
        industry: null,
        size: null,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 3,
        glassdoorRating: null,
        notes: null,
      };

      const createdCompany = await companyService.create(companyData);
      const deleted = await companyService.delete(createdCompany.id);

      expect(deleted).toBe(true);

      const foundCompany = await companyService.findById(createdCompany.id);
      expect(foundCompany).toBeNull();
    });

    it("should throw error when deleting company with associated jobs", async () => {
      const companyData: CreateCompanyInput = {
        name: "Company with Jobs",
        industry: null,
        size: null,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 3,
        glassdoorRating: null,
        notes: null,
      };

      const createdCompany = await companyService.create(companyData);

      // Create a job associated with this company
      await jobService.create({
        jobTitle: "Test Job",
        companyId: createdCompany.id,
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
      });

      await expect(companyService.delete(createdCompany.id)).rejects.toThrow(
        "Cannot delete company with associated jobs or contacts"
      );
    });

    it("should return false when deleting non-existent company", async () => {
      const deleted = await companyService.delete("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      // Create test companies for search
      await companyService.create({
        name: "Google Inc",
        industry: "Technology",
        size: CompanySize.ENTERPRISE,
        type: CompanyType.PUBLIC,
        location: "Mountain View, CA",
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 5,
        glassdoorRating: null,
        notes: "Search engine company",
      });

      await companyService.create({
        name: "Microsoft Corporation",
        industry: "Technology",
        size: CompanySize.ENTERPRISE,
        type: CompanyType.PUBLIC,
        location: "Redmond, WA",
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 4,
        glassdoorRating: null,
        notes: "Software company",
      });

      await companyService.create({
        name: "Local Startup",
        industry: "FinTech",
        size: CompanySize.STARTUP,
        type: CompanyType.PRIVATE,
        location: "San Francisco, CA",
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 3,
        glassdoorRating: null,
        notes: "Financial technology startup",
      });
    });

    it("should search companies by name", async () => {
      const results = await companyService.search("Google");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Google Inc");
    });

    it("should search companies by industry", async () => {
      const results = await companyService.search("Technology");
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should search companies by location", async () => {
      const results = await companyService.search("San Francisco");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("should search companies by notes", async () => {
      const results = await companyService.search("startup");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("findOrCreate", () => {
    it("should return existing company if found", async () => {
      const existingCompany = await companyService.create({
        name: "Existing Company",
        industry: "Technology",
        size: CompanySize.MEDIUM,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 4,
        glassdoorRating: null,
        notes: null,
      });

      const foundCompany = await companyService.findOrCreate("Existing Company");

      expect(foundCompany.id).toBe(existingCompany.id);
      expect(foundCompany.name).toBe("Existing Company");
      expect(foundCompany.industry).toBe("Technology");
    });

    it("should create new company if not found", async () => {
      const newCompany = await companyService.findOrCreate("New Company", {
        industry: "Healthcare",
        excitementLevel: 5,
      });

      expect(newCompany.id).toBeDefined();
      expect(newCompany.name).toBe("New Company");
      expect(newCompany.industry).toBe("Healthcare");
      expect(newCompany.excitementLevel).toBe(5);
    });

    it("should create company with default values when no additional data provided", async () => {
      const newCompany = await companyService.findOrCreate("Default Company");

      expect(newCompany.id).toBeDefined();
      expect(newCompany.name).toBe("Default Company");
      expect(newCompany.excitementLevel).toBe(3);
      expect(newCompany.industry).toBeNull();
    });
  });

  describe("getCompanyStats", () => {
    it("should return correct stats for company", async () => {
      const company = await companyService.create({
        name: "Stats Test Company",
        industry: null,
        size: null,
        type: null,
        location: null,
        website: null,
        linkedinUrl: null,
        yearFounded: null,
        excitementLevel: 3,
        glassdoorRating: null,
        notes: null,
      });

      // Create jobs with different statuses
      await jobService.create({
        jobTitle: "Job 1",
        companyId: company.id,
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
      });

      await jobService.create({
        jobTitle: "Job 2",
        companyId: company.id,
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
        status: JobStatus.APPLIED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 3,
        notes: null,
        followUpDate: null,
        source: JobSource.OTHER,
      });

      const stats = await companyService.getCompanyStats(company.id);

      expect(stats.totalJobs).toBe(2);
      expect(stats.totalContacts).toBe(0);
      expect(stats.jobsByStatus[JobStatus.SAVED]).toBe(1);
      expect(stats.jobsByStatus[JobStatus.APPLIED]).toBe(1);
    });
  });
});
