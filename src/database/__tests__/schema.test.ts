import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { initializeTestDatabase } from "../test-connection";
import * as schema from "../schema";
import {
  JobType,
  SeniorityLevel,
  JobStatus,
  JobSource,
  CompanySize,
  CompanyType,
  ContactRelationship,
  ContactGoal,
  ContactStatus,
} from "../../types";

describe("Database Schema", () => {
  let db: ReturnType<typeof initializeTestDatabase>;

  beforeEach(() => {
    db = initializeTestDatabase();
  });

  describe("Companies", () => {
    it("should create and retrieve a company with all fields", async () => {
      const companyData = {
        id: crypto.randomUUID(),
        name: "Test Company Inc.",
        industry: "Technology",
        size: CompanySize.MEDIUM,
        type: CompanyType.PRIVATE,
        location: "San Francisco, CA",
        website: "https://testcompany.com",
        linkedinUrl: "https://linkedin.com/company/testcompany",
        yearFounded: 2020,
        excitementLevel: 4,
        glassdoorRating: 4.2,
        notes: "Great company culture",
      };

      await db.insert(schema.companies).values(companyData);

      const companies = await db
        .select()
        .from(schema.companies)
        .where(eq(schema.companies.id, companyData.id));

      expect(companies).toHaveLength(1);
      expect(companies[0]).toEqual(companyData);
    });

    it("should enforce unique company names", async () => {
      const companyData = {
        id: crypto.randomUUID(),
        name: "Unique Company",
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

      await db.insert(schema.companies).values(companyData);

      // Try to insert another company with the same name
      const duplicateCompany = {
        ...companyData,
        id: crypto.randomUUID(),
      };

      expect(() => {
        db.insert(schema.companies).values(duplicateCompany).run();
      }).toThrow();
    });
  });

  describe("Jobs", () => {
    it("should create and retrieve a job with all fields", async () => {
      // First create a company
      const companyId = crypto.randomUUID();
      await db.insert(schema.companies).values({
        id: companyId,
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
        id: crypto.randomUUID(),
        jobTitle: "Senior Software Engineer",
        companyId,
        jobUrl: "https://company.com/jobs/123",
        applicationUrl: "https://company.com/apply/123",
        department: "Engineering",
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.SENIOR,
        salaryMin: 120000,
        salaryMax: 180000,
        location: "Remote",
        datePosted: "2024-01-15",
        dateSaved: "2024-01-16T10:00:00Z",
        dateApplied: "2024-01-17",
        deadline: "2024-02-15",
        status: JobStatus.APPLIED,
        rejectionDate: null,
        rejectionStage: null,
        excitementLevel: 5,
        notes: "Great opportunity",
        followUpDate: "2024-01-24",
        source: JobSource.LINKEDIN,
      };

      await db.insert(schema.jobs).values(jobData);

      const jobs = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobData.id));

      expect(jobs).toHaveLength(1);
      expect(jobs[0]).toEqual(jobData);
    });

    it("should enforce foreign key constraint with companies", async () => {
      const jobData = {
        id: crypto.randomUUID(),
        jobTitle: "Test Job",
        companyId: "non-existent-company-id",
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Test Location",
        datePosted: null,
        dateSaved: "2024-01-16T10:00:00Z",
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

      expect(() => {
        db.insert(schema.jobs).values(jobData).run();
      }).toThrow();
    });
  });

  describe("Contacts", () => {
    it("should create and retrieve a contact with all fields", async () => {
      // First create a company
      const companyId = crypto.randomUUID();
      await db.insert(schema.companies).values({
        id: companyId,
        name: "Contact Test Company",
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

      const contactData = {
        id: crypto.randomUUID(),
        fullName: "Jane Smith",
        companyId,
        jobTitle: "Engineering Manager",
        location: "New York, NY",
        linkedinUrl: "https://linkedin.com/in/janesmith",
        email: "jane.smith@company.com",
        phone: "+1-555-0123",
        relationship: ContactRelationship.HIRING_MANAGER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.RESPONDED,
        followUpDate: "2024-01-25",
        notes: "Very helpful contact",
      };

      await db.insert(schema.contacts).values(contactData);

      const contacts = await db
        .select()
        .from(schema.contacts)
        .where(eq(schema.contacts.id, contactData.id));

      expect(contacts).toHaveLength(1);
      expect(contacts[0]).toEqual(contactData);
    });

    it("should allow contacts without company association", async () => {
      const contactData = {
        id: crypto.randomUUID(),
        fullName: "Independent Contact",
        companyId: null,
        jobTitle: null,
        location: null,
        linkedinUrl: null,
        email: null,
        phone: null,
        relationship: ContactRelationship.NETWORKING,
        goal: ContactGoal.INFORMATION,
        status: ContactStatus.NOT_CONTACTED,
        followUpDate: null,
        notes: null,
      };

      await db.insert(schema.contacts).values(contactData);

      const contacts = await db
        .select()
        .from(schema.contacts)
        .where(eq(schema.contacts.id, contactData.id));

      expect(contacts).toHaveLength(1);
      expect(contacts[0]).toEqual(contactData);
    });
  });

  describe("Job-Contact Relationships", () => {
    it("should create job-contact relationships", async () => {
      // Create company
      const companyId = crypto.randomUUID();
      await db.insert(schema.companies).values({
        id: companyId,
        name: "Relationship Test Company",
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

      // Create job
      const jobId = crypto.randomUUID();
      await db.insert(schema.jobs).values({
        id: jobId,
        jobTitle: "Test Job",
        companyId,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Test Location",
        datePosted: null,
        dateSaved: "2024-01-16T10:00:00Z",
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

      // Create contact
      const contactId = crypto.randomUUID();
      await db.insert(schema.contacts).values({
        id: contactId,
        fullName: "Test Contact",
        companyId,
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
      });

      // Create job-contact relationship
      const relationshipData = {
        jobId,
        contactId,
        relationshipType: "primary-contact",
      };

      await db.insert(schema.jobContacts).values(relationshipData);

      const relationships = await db
        .select()
        .from(schema.jobContacts)
        .where(eq(schema.jobContacts.jobId, jobId));

      expect(relationships).toHaveLength(1);
      expect(relationships[0]).toEqual(relationshipData);
    });
  });

  describe("Job Status History", () => {
    it("should track job status changes", async () => {
      // Create company and job first
      const companyId = crypto.randomUUID();
      await db.insert(schema.companies).values({
        id: companyId,
        name: "Status Test Company",
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

      const jobId = crypto.randomUUID();
      await db.insert(schema.jobs).values({
        id: jobId,
        jobTitle: "Status Test Job",
        companyId,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Test Location",
        datePosted: null,
        dateSaved: "2024-01-16T10:00:00Z",
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

      // Create status history entry
      const historyData = {
        id: crypto.randomUUID(),
        jobId,
        oldStatus: JobStatus.SAVED,
        newStatus: JobStatus.APPLIED,
        changedAt: "2024-01-17T09:00:00Z",
        notes: "Applied through company website",
      };

      await db.insert(schema.jobStatusHistory).values(historyData);

      const history = await db
        .select()
        .from(schema.jobStatusHistory)
        .where(eq(schema.jobStatusHistory.jobId, jobId));

      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(historyData);
    });
  });

  describe("Database Relationships", () => {
    it("should support cascading deletes for job-contact relationships", async () => {
      // Create company, job, and contact
      const companyId = crypto.randomUUID();
      await db.insert(schema.companies).values({
        id: companyId,
        name: "Cascade Test Company",
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

      const jobId = crypto.randomUUID();
      await db.insert(schema.jobs).values({
        id: jobId,
        jobTitle: "Cascade Test Job",
        companyId,
        jobUrl: null,
        applicationUrl: null,
        department: null,
        jobType: JobType.FULL_TIME,
        seniorityLevel: SeniorityLevel.MID,
        salaryMin: null,
        salaryMax: null,
        location: "Test Location",
        datePosted: null,
        dateSaved: "2024-01-16T10:00:00Z",
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

      const contactId = crypto.randomUUID();
      await db.insert(schema.contacts).values({
        id: contactId,
        fullName: "Cascade Test Contact",
        companyId,
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
      });

      // Create job-contact relationship
      await db.insert(schema.jobContacts).values({
        jobId,
        contactId,
        relationshipType: "test-relationship",
      });

      // Verify relationship exists
      let relationships = await db
        .select()
        .from(schema.jobContacts)
        .where(eq(schema.jobContacts.jobId, jobId));
      expect(relationships).toHaveLength(1);

      // Delete the job
      await db.delete(schema.jobs).where(eq(schema.jobs.id, jobId));

      // Verify relationship was cascaded deleted
      relationships = await db
        .select()
        .from(schema.jobContacts)
        .where(eq(schema.jobContacts.jobId, jobId));
      expect(relationships).toHaveLength(0);
    });
  });
});
