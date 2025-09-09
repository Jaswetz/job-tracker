import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getTestDatabase } from "../../database/test-connection";
import * as schema from "../../database/schema";
import { TestContactService, TestCompanyService, TestJobService } from "./test-services";
import {
  ContactRelationship,
  ContactGoal,
  ContactStatus,
  CompanySize,
  JobType,
  SeniorityLevel,
  JobStatus,
  JobSource,
  type CreateContactInput,
  type Contact,
  type Company,
  type Job,
} from "../../types";

describe("ContactService", () => {
  let contactService: TestContactService;
  let companyService: TestCompanyService;
  let jobService: TestJobService;
  let testCompany: Company;
  let testJob: Job;
  let db: ReturnType<typeof getTestDatabase>;

  beforeEach(async () => {
    db = getTestDatabase();
    contactService = new TestContactService();
    companyService = new TestCompanyService();
    jobService = new TestJobService();

    // Create test company and job for relationship tests
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

    testJob = await jobService.create({
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
    it("should create a new contact with all fields", async () => {
      const contactData: CreateContactInput = {
        fullName: "John Doe",
        companyId: testCompany.id,
        jobTitle: "Senior Engineer",
        location: "San Francisco, CA",
        linkedinUrl: "https://linkedin.com/in/johndoe",
        email: "john.doe@example.com",
        phone: "+1-555-0123",
        relationship: ContactRelationship.HIRING_MANAGER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.NOT_CONTACTED,
        followUpDate: "2024-02-01",
        notes: "Met at tech conference",
      };

      const createdContact = await contactService.create(contactData);

      expect(createdContact.id).toBeDefined();
      expect(createdContact.fullName).toBe(contactData.fullName);
      expect(createdContact.companyId).toBe(testCompany.id);
      expect(createdContact.email).toBe(contactData.email);
      expect(createdContact.relationship).toBe(ContactRelationship.HIRING_MANAGER);
    });

    it("should create a contact with minimal required fields", async () => {
      const contactData: CreateContactInput = {
        fullName: "Jane Smith",
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

      const createdContact = await contactService.create(contactData);

      expect(createdContact.id).toBeDefined();
      expect(createdContact.fullName).toBe("Jane Smith");
      expect(createdContact.companyId).toBeNull();
      expect(createdContact.relationship).toBe(ContactRelationship.NETWORKING);
    });
  });

  describe("findById", () => {
    it("should find an existing contact by id", async () => {
      const contactData: CreateContactInput = {
        fullName: "Find Test Contact",
        companyId: testCompany.id,
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

      const createdContact = await contactService.create(contactData);
      const foundContact = await contactService.findById(createdContact.id);

      expect(foundContact).not.toBeNull();
      expect(foundContact!.id).toBe(createdContact.id);
      expect(foundContact!.fullName).toBe("Find Test Contact");
    });

    it("should return null for non-existent contact", async () => {
      const foundContact = await contactService.findById("non-existent-id");
      expect(foundContact).toBeNull();
    });
  });

  describe("update", () => {
    it("should update contact fields", async () => {
      const contactData: CreateContactInput = {
        fullName: "Original Name",
        companyId: testCompany.id,
        jobTitle: "Original Title",
        location: null,
        linkedinUrl: null,
        email: "original@example.com",
        phone: null,
        relationship: ContactRelationship.RECRUITER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.NOT_CONTACTED,
        followUpDate: null,
        notes: null,
      };

      const createdContact = await contactService.create(contactData);
      const updatedContact = await contactService.update(createdContact.id, {
        fullName: "Updated Name",
        jobTitle: "Updated Title",
        email: "updated@example.com",
        status: ContactStatus.REACHED_OUT,
        notes: "Updated notes",
      });

      expect(updatedContact).not.toBeNull();
      expect(updatedContact!.fullName).toBe("Updated Name");
      expect(updatedContact!.jobTitle).toBe("Updated Title");
      expect(updatedContact!.email).toBe("updated@example.com");
      expect(updatedContact!.status).toBe(ContactStatus.REACHED_OUT);
      expect(updatedContact!.notes).toBe("Updated notes");
    });

    it("should return null when updating non-existent contact", async () => {
      const result = await contactService.update("non-existent-id", {
        fullName: "Updated Name",
      });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a contact and its job relationships", async () => {
      const contactData: CreateContactInput = {
        fullName: "Contact to Delete",
        companyId: testCompany.id,
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

      const createdContact = await contactService.create(contactData);

      // Link contact to job
      await contactService.linkToJob(createdContact.id, testJob.id, "hiring-manager");

      const deleted = await contactService.delete(createdContact.id);

      expect(deleted).toBe(true);

      const foundContact = await contactService.findById(createdContact.id);
      expect(foundContact).toBeNull();

      // Verify job relationship was also deleted
      const jobContacts = await contactService.getContactsForJob(testJob.id);
      expect(jobContacts).toHaveLength(0);
    });

    it("should return false when deleting non-existent contact", async () => {
      const deleted = await contactService.delete("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      // Create test contacts for search
      await contactService.create({
        fullName: "Alice Johnson",
        companyId: testCompany.id,
        jobTitle: "Software Engineer",
        location: "New York, NY",
        linkedinUrl: null,
        email: "alice@example.com",
        phone: null,
        relationship: ContactRelationship.TEAM_MEMBER,
        goal: ContactGoal.NETWORKING,
        status: ContactStatus.MET,
        followUpDate: null,
        notes: "Great developer",
      });

      await contactService.create({
        fullName: "Bob Smith",
        companyId: testCompany.id,
        jobTitle: "Product Manager",
        location: "San Francisco, CA",
        linkedinUrl: null,
        email: "bob@example.com",
        phone: null,
        relationship: ContactRelationship.HIRING_MANAGER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.REACHED_OUT,
        followUpDate: null,
        notes: "Interested in React developers",
      });
    });

    it("should search contacts by name", async () => {
      const results = await contactService.search("Alice");
      expect(results).toHaveLength(1);
      expect(results[0].fullName).toBe("Alice Johnson");
    });

    it("should search contacts by job title", async () => {
      const results = await contactService.search("Engineer");
      expect(results).toHaveLength(1);
      expect(results[0].jobTitle).toBe("Software Engineer");
    });

    it("should search contacts by location", async () => {
      const results = await contactService.search("New York");
      expect(results).toHaveLength(1);
      expect(results[0].location).toBe("New York, NY");
    });

    it("should search contacts by email", async () => {
      const results = await contactService.search("alice@example.com");
      expect(results).toHaveLength(1);
      expect(results[0].email).toBe("alice@example.com");
    });

    it("should search contacts by notes", async () => {
      const results = await contactService.search("React");
      expect(results).toHaveLength(1);
      expect(results[0].notes).toBe("Interested in React developers");
    });
  });

  describe("job relationship management", () => {
    let testContact: Contact;

    beforeEach(async () => {
      testContact = await contactService.create({
        fullName: "Relationship Test Contact",
        companyId: testCompany.id,
        jobTitle: "Hiring Manager",
        location: null,
        linkedinUrl: null,
        email: null,
        phone: null,
        relationship: ContactRelationship.HIRING_MANAGER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.NOT_CONTACTED,
        followUpDate: null,
        notes: null,
      });
    });

    describe("linkToJob", () => {
      it("should create new job-contact relationship", async () => {
        await contactService.linkToJob(testContact.id, testJob.id, "interviewer");

        const relationships = await contactService.getJobRelationships(testContact.id);
        expect(relationships).toHaveLength(1);
        expect(relationships[0].jobId).toBe(testJob.id);
        expect(relationships[0].contactId).toBe(testContact.id);
        expect(relationships[0].relationshipType).toBe("interviewer");
      });

      it("should update existing job-contact relationship", async () => {
        // Create initial relationship
        await contactService.linkToJob(testContact.id, testJob.id, "recruiter");

        // Update relationship type
        await contactService.linkToJob(testContact.id, testJob.id, "hiring-manager");

        const relationships = await contactService.getJobRelationships(testContact.id);
        expect(relationships).toHaveLength(1);
        expect(relationships[0].relationshipType).toBe("hiring-manager");
      });
    });

    describe("unlinkFromJob", () => {
      it("should remove job-contact relationship", async () => {
        await contactService.linkToJob(testContact.id, testJob.id, "recruiter");

        const unlinked = await contactService.unlinkFromJob(testContact.id, testJob.id);
        expect(unlinked).toBe(true);

        const relationships = await contactService.getJobRelationships(testContact.id);
        expect(relationships).toHaveLength(0);
      });

      it("should return false when unlinking non-existent relationship", async () => {
        const unlinked = await contactService.unlinkFromJob(testContact.id, testJob.id);
        expect(unlinked).toBe(false);
      });
    });

    describe("getContactsForJob", () => {
      it("should return contacts linked to a job", async () => {
        const contact2 = await contactService.create({
          fullName: "Second Contact",
          companyId: testCompany.id,
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

        await contactService.linkToJob(testContact.id, testJob.id, "hiring-manager");
        await contactService.linkToJob(contact2.id, testJob.id, "recruiter");

        const jobContacts = await contactService.getContactsForJob(testJob.id);
        expect(jobContacts).toHaveLength(2);

        const contactNames = jobContacts.map((c) => c.fullName).sort();
        expect(contactNames).toEqual(["Relationship Test Contact", "Second Contact"]);
      });

      it("should return empty array for job with no contacts", async () => {
        const jobContacts = await contactService.getContactsForJob(testJob.id);
        expect(jobContacts).toHaveLength(0);
      });
    });
  });

  describe("getContactsWithFollowUps", () => {
    it("should return contacts with follow-ups on specified date", async () => {
      const followUpDate = "2024-02-01";

      await contactService.create({
        fullName: "Follow Up Contact 1",
        companyId: testCompany.id,
        jobTitle: null,
        location: null,
        linkedinUrl: null,
        email: null,
        phone: null,
        relationship: ContactRelationship.RECRUITER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.REACHED_OUT,
        followUpDate,
        notes: null,
      });

      await contactService.create({
        fullName: "Follow Up Contact 2",
        companyId: testCompany.id,
        jobTitle: null,
        location: null,
        linkedinUrl: null,
        email: null,
        phone: null,
        relationship: ContactRelationship.HIRING_MANAGER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.RESPONDED,
        followUpDate,
        notes: null,
      });

      // Contact with different date should not be included
      await contactService.create({
        fullName: "Different Date Contact",
        companyId: testCompany.id,
        jobTitle: null,
        location: null,
        linkedinUrl: null,
        email: null,
        phone: null,
        relationship: ContactRelationship.RECRUITER,
        goal: ContactGoal.REFERRAL,
        status: ContactStatus.REACHED_OUT,
        followUpDate: "2024-02-02",
        notes: null,
      });

      const followUpContacts = await contactService.getContactsWithFollowUps(followUpDate);
      expect(followUpContacts).toHaveLength(2);
    });
  });

  describe("getContactStats", () => {
    it("should return correct stats for contact", async () => {
      const contact = await contactService.create({
        fullName: "Stats Test Contact",
        companyId: testCompany.id,
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

      // Create another company and job
      const company2 = await companyService.create({
        name: "Second Company",
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

      const job2 = await jobService.create({
        jobTitle: "Second Job",
        companyId: company2.id,
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

      // Link contact to both jobs
      await contactService.linkToJob(contact.id, testJob.id, "recruiter");
      await contactService.linkToJob(contact.id, job2.id, "hiring-manager");

      const stats = await contactService.getContactStats(contact.id);

      expect(stats.linkedJobs).toBe(2);
      expect(stats.companiesWorkedWith).toBe(2);
    });
  });
});
