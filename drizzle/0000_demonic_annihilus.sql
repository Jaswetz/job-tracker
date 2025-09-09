CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`industry` text,
	`size` text,
	`type` text,
	`location` text,
	`website` text,
	`linkedin_url` text,
	`year_founded` integer,
	`excitement_level` integer DEFAULT 3 NOT NULL,
	`glassdoor_rating` real,
	`notes` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_name_unique` ON `companies` (`name`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`company_id` text,
	`job_title` text,
	`location` text,
	`linkedin_url` text,
	`email` text,
	`phone` text,
	`relationship` text NOT NULL,
	`goal` text NOT NULL,
	`status` text NOT NULL,
	`follow_up_date` text,
	`notes` text,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `job_contacts` (
	`job_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`relationship_type` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `job_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`old_status` text,
	`new_status` text NOT NULL,
	`changed_at` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_title` text NOT NULL,
	`company_id` text NOT NULL,
	`job_url` text,
	`application_url` text,
	`department` text,
	`job_type` text NOT NULL,
	`seniority_level` text NOT NULL,
	`salary_min` integer,
	`salary_max` integer,
	`location` text NOT NULL,
	`date_posted` text,
	`date_saved` text NOT NULL,
	`date_applied` text,
	`deadline` text,
	`status` text NOT NULL,
	`rejection_date` text,
	`rejection_stage` text,
	`excitement_level` integer NOT NULL,
	`notes` text,
	`follow_up_date` text,
	`source` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
