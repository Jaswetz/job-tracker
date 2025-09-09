import { JobType, SeniorityLevel, JobStatus, JobSource, CompanySize, CompanyType } from "../types";
import type { CreateJobInput, CreateCompanyInput, CreateContactInput } from "../types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation service for input data
 * Provides centralized validation logic with detailed error messages
 */
export class ValidationService {
  static validateJob(data: CreateJobInput): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.jobTitle?.trim()) {
      errors.push({ field: "jobTitle", message: "Job title is required" });
    }

    if (!data.companyId?.trim()) {
      errors.push({ field: "companyId", message: "Company is required" });
    }

    if (!data.location?.trim()) {
      errors.push({ field: "location", message: "Location is required" });
    }

    // Enum validations
    if (!Object.values(JobType).includes(data.jobType)) {
      errors.push({ field: "jobType", message: "Invalid job type" });
    }

    if (!Object.values(SeniorityLevel).includes(data.seniorityLevel)) {
      errors.push({ field: "seniorityLevel", message: "Invalid seniority level" });
    }

    if (!Object.values(JobStatus).includes(data.status)) {
      errors.push({ field: "status", message: "Invalid job status" });
    }

    if (!Object.values(JobSource).includes(data.source)) {
      errors.push({ field: "source", message: "Invalid job source" });
    }

    // Numeric validations
    if (data.excitementLevel < 1 || data.excitementLevel > 5) {
      errors.push({
        field: "excitementLevel",
        message: "Excitement level must be between 1 and 5",
      });
    }

    if (data.salaryMin !== null && data.salaryMin < 0) {
      errors.push({ field: "salaryMin", message: "Minimum salary cannot be negative" });
    }

    if (data.salaryMax !== null && data.salaryMax < 0) {
      errors.push({ field: "salaryMax", message: "Maximum salary cannot be negative" });
    }

    if (data.salaryMin !== null && data.salaryMax !== null && data.salaryMin > data.salaryMax) {
      errors.push({
        field: "salaryMax",
        message: "Maximum salary must be greater than minimum salary",
      });
    }

    // URL validations
    if (data.jobUrl && !this.isValidUrl(data.jobUrl)) {
      errors.push({ field: "jobUrl", message: "Invalid job URL format" });
    }

    if (data.applicationUrl && !this.isValidUrl(data.applicationUrl)) {
      errors.push({ field: "applicationUrl", message: "Invalid application URL format" });
    }

    // Date validations
    if (data.datePosted && !this.isValidDate(data.datePosted)) {
      errors.push({ field: "datePosted", message: "Invalid date format" });
    }

    if (data.dateApplied && !this.isValidDate(data.dateApplied)) {
      errors.push({ field: "dateApplied", message: "Invalid date format" });
    }

    if (data.deadline && !this.isValidDate(data.deadline)) {
      errors.push({ field: "deadline", message: "Invalid date format" });
    }

    if (data.followUpDate && !this.isValidDate(data.followUpDate)) {
      errors.push({ field: "followUpDate", message: "Invalid date format" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateCompany(data: CreateCompanyInput): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.name?.trim()) {
      errors.push({ field: "name", message: "Company name is required" });
    }

    // Enum validations
    if (data.size && !Object.values(CompanySize).includes(data.size)) {
      errors.push({ field: "size", message: "Invalid company size" });
    }

    if (data.type && !Object.values(CompanyType).includes(data.type)) {
      errors.push({ field: "type", message: "Invalid company type" });
    }

    // Numeric validations
    if (data.excitementLevel < 1 || data.excitementLevel > 5) {
      errors.push({
        field: "excitementLevel",
        message: "Excitement level must be between 1 and 5",
      });
    }

    if (data.yearFounded !== null && data.yearFounded < 1800) {
      errors.push({ field: "yearFounded", message: "Year founded seems too early" });
    }

    if (data.yearFounded !== null && data.yearFounded > new Date().getFullYear()) {
      errors.push({ field: "yearFounded", message: "Year founded cannot be in the future" });
    }

    if (data.glassdoorRating !== null && (data.glassdoorRating < 1 || data.glassdoorRating > 5)) {
      errors.push({
        field: "glassdoorRating",
        message: "Glassdoor rating must be between 1 and 5",
      });
    }

    // URL validations
    if (data.website && !this.isValidUrl(data.website)) {
      errors.push({ field: "website", message: "Invalid website URL format" });
    }

    if (data.linkedinUrl && !this.isValidUrl(data.linkedinUrl)) {
      errors.push({ field: "linkedinUrl", message: "Invalid LinkedIn URL format" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateContact(data: CreateContactInput): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.fullName?.trim()) {
      errors.push({ field: "fullName", message: "Full name is required" });
    }

    // Email validation
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    // URL validation
    if (data.linkedinUrl && !this.isValidUrl(data.linkedinUrl)) {
      errors.push({ field: "linkedinUrl", message: "Invalid LinkedIn URL format" });
    }

    // Date validation
    if (data.followUpDate && !this.isValidDate(data.followUpDate)) {
      errors.push({ field: "followUpDate", message: "Invalid date format" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  }
}
