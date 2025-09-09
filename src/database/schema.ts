import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Companies table
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  industry: text("industry"),
  size: text("size"),
  type: text("type"),
  location: text("location"),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  yearFounded: integer("year_founded"),
  excitementLevel: integer("excitement_level").notNull().default(3),
  glassdoorRating: real("glassdoor_rating"),
  notes: text("notes"),
});

// Jobs table
export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  jobUrl: text("job_url"),
  applicationUrl: text("application_url"),
  department: text("department"),
  jobType: text("job_type").notNull(),
  seniorityLevel: text("seniority_level").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  location: text("location").notNull(),
  datePosted: text("date_posted"), // SQLite doesn't have native date type
  dateSaved: text("date_saved").notNull(),
  dateApplied: text("date_applied"),
  deadline: text("deadline"),
  status: text("status").notNull(),
  rejectionDate: text("rejection_date"),
  rejectionStage: text("rejection_stage"),
  excitementLevel: integer("excitement_level").notNull(),
  notes: text("notes"),
  followUpDate: text("follow_up_date"),
  source: text("source").notNull(),
});

// Contacts table
export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  companyId: text("company_id").references(() => companies.id),
  jobTitle: text("job_title"),
  location: text("location"),
  linkedinUrl: text("linkedin_url"),
  email: text("email"),
  phone: text("phone"),
  relationship: text("relationship").notNull(),
  goal: text("goal").notNull(),
  status: text("status").notNull(),
  followUpDate: text("follow_up_date"),
  notes: text("notes"),
});

// Job-Contact relationships (many-to-many)
export const jobContacts = sqliteTable("job_contacts", {
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(),
});

// Job status history for analytics
export const jobStatusHistory = sqliteTable("job_status_history", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  oldStatus: text("old_status"),
  newStatus: text("new_status").notNull(),
  changedAt: text("changed_at").notNull(),
  notes: text("notes"),
});

// Define relationships
export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
  contacts: many(contacts),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  statusHistory: many(jobStatusHistory),
  jobContacts: many(jobContacts),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  jobContacts: many(jobContacts),
}));

export const jobContactsRelations = relations(jobContacts, ({ one }) => ({
  job: one(jobs, {
    fields: [jobContacts.jobId],
    references: [jobs.id],
  }),
  contact: one(contacts, {
    fields: [jobContacts.contactId],
    references: [contacts.id],
  }),
}));

export const jobStatusHistoryRelations = relations(jobStatusHistory, ({ one }) => ({
  job: one(jobs, {
    fields: [jobStatusHistory.jobId],
    references: [jobs.id],
  }),
}));
