import { describe, it, expect, beforeAll } from "vitest";
import { TestDatabaseService } from "../test-database";
import {
  JobType,
  SeniorityLevel,
  JobStatus,
  JobSource,
  CompanySize,
  ContactRelationship,
  ContactGoal,
  ContactStatus,
} from "../../types";

describe("DatabaseService", () => {
  let dbService: TestDatabaseService;

  beforeAll(() => {
    dbService = new TestDatabaseService();
  });

  it("should test database connection", async () => {
    const isConnected = await dbService.testConnection();
    expect(isConnected).toBe(true);
  });

  it("should create and retrieve a company", async () => {
    const companyData = {
      name: "Test Company",
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

    const createdCompany = await dbService.createCompany(companyData);
    expect(createdCompany.id).toBeDefined();
    expect(createdCompany.name).toBe(companyData.name);

    const companies = await dbService.getCompanies();
    expect(companies.length).toBeGreaterThan(0);
    expect(companies.some((c) => c.id === createdCompany.id)).toBe(true);
  });

  it("should create and retrieve a job", async () => {
    // First create a company
    const company = await dbService.createCompany({
      name: "Job Test Company",
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

    const jobData = {
      jobTitle: "Software Engineer",
      companyId: company.id,
      jobUrl: null,
      applicationUrl: null,
      department: null,
      jobType: JobType.FULL_TIME,
      seniorityLevel: SeniorityLevel.MID,
      salaryMin: null,
      salaryMax: null,
      location: "San Francisco, CA",
      datePosted: null,
      dateApplied: null,
      deadline: null,
      status: JobStatus.SAVED,
      rejectionDate: null,
      rejectionStage: null,
      excitementLevel: 4,
      notes: null,
      followUpDate: null,
      source: JobSource.LINKEDIN,
    };

    const createdJob = await dbService.createJob(jobData);
    expect(createdJob.id).toBeDefined();
    expect(createdJob.jobTitle).toBe(jobData.jobTitle);
    expect(createdJob.dateSaved).toBeDefined();

    const jobs = await dbService.getJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.some((j) => j.id === createdJob.id)).toBe(true);
  });

  it("should create and retrieve a contact", async () => {
    const contactData = {
      fullName: "John Doe",
      companyId: null,
      jobTitle: null,
      location: null,
      linkedinUrl: null,
      email: null,
      phone: null,
      relationship: ContactRelationship.RECRUITER,
      goal: ContactGoal.REFERRAL,
      status: ContactStatus.NOT_CONTACTED,
      followUpDate: null,
      notes: null,
    };

    const createdContact = await dbService.createContact(contactData);
    expect(createdContact.id).toBeDefined();
    expect(createdContact.fullName).toBe(contactData.fullName);

    const contacts = await dbService.getContacts();
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts.some((c) => c.id === createdContact.id)).toBe(true);
  });
});
