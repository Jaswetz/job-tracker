// Enums for job-related data
export enum JobType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  CONTRACT = "contract",
  FREELANCE = "freelance",
  INTERNSHIP = "internship",
}

export enum SeniorityLevel {
  ENTRY = "entry",
  JUNIOR = "junior",
  MID = "mid",
  SENIOR = "senior",
  LEAD = "lead",
  PRINCIPAL = "principal",
  DIRECTOR = "director",
  VP = "vp",
  C_LEVEL = "c-level",
}

export enum JobStatus {
  SAVED = "saved",
  APPLIED = "applied",
  PHONE_SCREEN = "phone-screen",
  TECHNICAL_INTERVIEW = "technical-interview",
  ONSITE_INTERVIEW = "onsite-interview",
  FINAL_INTERVIEW = "final-interview",
  OFFER = "offer",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

export enum JobSource {
  COMPANY_WEBSITE = "company-website",
  LINKEDIN = "linkedin",
  INDEED = "indeed",
  GLASSDOOR = "glassdoor",
  ANGEL_LIST = "angel-list",
  REFERRAL = "referral",
  RECRUITER = "recruiter",
  OTHER = "other",
}

export enum CompanySize {
  STARTUP = "startup",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  ENTERPRISE = "enterprise",
}

export enum CompanyType {
  STARTUP = "startup",
  PUBLIC = "public",
  PRIVATE = "private",
  NON_PROFIT = "non-profit",
  GOVERNMENT = "government",
}

export enum ContactRelationship {
  RECRUITER = "recruiter",
  HIRING_MANAGER = "hiring-manager",
  TEAM_MEMBER = "team-member",
  REFERRAL = "referral",
  NETWORKING = "networking",
  OTHER = "other",
}

export enum ContactGoal {
  REFERRAL = "referral",
  INFORMATION = "information",
  NETWORKING = "networking",
  FOLLOW_UP = "follow-up",
  OTHER = "other",
}

export enum ContactStatus {
  NOT_CONTACTED = "not-contacted",
  REACHED_OUT = "reached-out",
  RESPONDED = "responded",
  MEETING_SCHEDULED = "meeting-scheduled",
  MET = "met",
  ONGOING = "ongoing",
  CLOSED = "closed",
}

// Type definitions based on database schema
export interface Job {
  id: string;
  jobTitle: string;
  companyId: string;
  jobUrl: string | null;
  applicationUrl: string | null;
  department: string | null;
  jobType: JobType;
  seniorityLevel: SeniorityLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string;
  datePosted: string | null;
  dateSaved: string;
  dateApplied: string | null;
  deadline: string | null;
  status: JobStatus;
  rejectionDate: string | null;
  rejectionStage: string | null;
  excitementLevel: number;
  notes: string | null;
  followUpDate: string | null;
  source: JobSource;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: CompanySize | null;
  type: CompanyType | null;
  location: string | null;
  website: string | null;
  linkedinUrl: string | null;
  yearFounded: number | null;
  excitementLevel: number;
  glassdoorRating: number | null;
  notes: string | null;
}

export interface Contact {
  id: string;
  fullName: string;
  companyId: string | null;
  jobTitle: string | null;
  location: string | null;
  linkedinUrl: string | null;
  email: string | null;
  phone: string | null;
  relationship: ContactRelationship;
  goal: ContactGoal;
  status: ContactStatus;
  followUpDate: string | null;
  notes: string | null;
}

export interface JobContact {
  jobId: string;
  contactId: string;
  relationshipType: string;
}

export interface JobStatusHistory {
  id: string;
  jobId: string;
  oldStatus?: string;
  newStatus: string;
  changedAt: string;
  notes?: string;
}

// Form types for creating/updating entities
export type CreateJobInput = Omit<Job, "id" | "dateSaved">;
export type UpdateJobInput = Partial<CreateJobInput> & { id: string };

export type CreateCompanyInput = Omit<Company, "id">;
export type UpdateCompanyInput = Partial<CreateCompanyInput> & { id: string };

export type CreateContactInput = Omit<Contact, "id">;
export type UpdateContactInput = Partial<CreateContactInput> & { id: string };
