import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useJobsStore } from "../jobs";
import { JobType, SeniorityLevel, JobStatus, JobSource } from "../../types";
import type { Job } from "../../types";

describe("Jobs Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with empty state", () => {
    const store = useJobsStore();

    expect(store.jobs).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
    expect(store.jobCount).toBe(0);
    expect(store.activeJobs).toEqual([]);
  });

  it("should add a job", () => {
    const store = useJobsStore();
    const job: Job = {
      id: "1",
      jobTitle: "Software Engineer",
      companyId: "company-1",
      jobUrl: null,
      applicationUrl: null,
      department: "Engineering",
      jobType: JobType.FULL_TIME,
      seniorityLevel: SeniorityLevel.MID,
      salaryMin: 80000,
      salaryMax: 120000,
      location: "San Francisco, CA",
      datePosted: null,
      dateSaved: "2024-01-01",
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

    store.addJob(job);

    expect(store.jobs).toHaveLength(1);
    expect(store.jobs[0]).toEqual(job);
    expect(store.jobCount).toBe(1);
    expect(store.activeJobs).toHaveLength(1);
  });

  it("should filter active jobs correctly", () => {
    const store = useJobsStore();
    const activeJob: Job = {
      id: "1",
      jobTitle: "Software Engineer",
      companyId: "company-1",
      jobUrl: null,
      applicationUrl: null,
      department: null,
      jobType: JobType.FULL_TIME,
      seniorityLevel: SeniorityLevel.MID,
      salaryMin: null,
      salaryMax: null,
      location: "Remote",
      datePosted: null,
      dateSaved: "2024-01-01",
      dateApplied: null,
      deadline: null,
      status: JobStatus.APPLIED,
      rejectionDate: null,
      rejectionStage: null,
      excitementLevel: 3,
      notes: null,
      followUpDate: null,
      source: JobSource.COMPANY_WEBSITE,
    };

    const rejectedJob: Job = {
      ...activeJob,
      id: "2",
      status: JobStatus.REJECTED,
      rejectionDate: "2024-01-15",
    };

    store.addJob(activeJob);
    store.addJob(rejectedJob);

    expect(store.jobCount).toBe(2);
    expect(store.activeJobs).toHaveLength(1);
    expect(store.activeJobs[0].id).toBe("1");
  });

  it("should update a job", () => {
    const store = useJobsStore();
    const job: Job = {
      id: "1",
      jobTitle: "Software Engineer",
      companyId: "company-1",
      jobUrl: null,
      applicationUrl: null,
      department: null,
      jobType: JobType.FULL_TIME,
      seniorityLevel: SeniorityLevel.MID,
      salaryMin: null,
      salaryMax: null,
      location: "Remote",
      datePosted: null,
      dateSaved: "2024-01-01",
      dateApplied: null,
      deadline: null,
      status: JobStatus.SAVED,
      rejectionDate: null,
      rejectionStage: null,
      excitementLevel: 3,
      notes: null,
      followUpDate: null,
      source: JobSource.COMPANY_WEBSITE,
    };

    store.addJob(job);
    store.updateJob("1", { status: JobStatus.APPLIED, dateApplied: "2024-01-02" });

    expect(store.jobs[0].status).toBe(JobStatus.APPLIED);
    expect(store.jobs[0].dateApplied).toBe("2024-01-02");
  });

  it("should remove a job", () => {
    const store = useJobsStore();
    const job: Job = {
      id: "1",
      jobTitle: "Software Engineer",
      companyId: "company-1",
      jobUrl: null,
      applicationUrl: null,
      department: null,
      jobType: JobType.FULL_TIME,
      seniorityLevel: SeniorityLevel.MID,
      salaryMin: null,
      salaryMax: null,
      location: "Remote",
      datePosted: null,
      dateSaved: "2024-01-01",
      dateApplied: null,
      deadline: null,
      status: JobStatus.SAVED,
      rejectionDate: null,
      rejectionStage: null,
      excitementLevel: 3,
      notes: null,
      followUpDate: null,
      source: JobSource.COMPANY_WEBSITE,
    };

    store.addJob(job);
    expect(store.jobCount).toBe(1);

    store.removeJob("1");
    expect(store.jobCount).toBe(0);
    expect(store.jobs).toEqual([]);
  });
});
