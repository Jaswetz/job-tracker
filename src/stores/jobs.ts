import { ref, computed, readonly } from "vue";
import { defineStore } from "pinia";
import { JobService } from "../services/job";
import {
  JobStatus,
  type Job,
  type CreateJobInput,
  type UpdateJobInput,
  type JobFilters,
} from "../types";

export const useJobsStore = defineStore("jobs", () => {
  const jobs = ref<Job[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const jobService = new JobService();

  // Computed properties
  const jobCount = computed(() => jobs.value.length);

  const activeJobs = computed(() =>
    jobs.value.filter(
      (job) =>
        ![
          JobStatus.REJECTED,
          JobStatus.WITHDRAWN,
          "offer_declined", // This should be JobStatus.OFFER_DECLINED if it exists
        ].includes(job.status as JobStatus)
    )
  );

  const jobsByStatus = computed(() => {
    return jobs.value.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  });

  const recentJobs = computed(() =>
    jobs.value
      .slice()
      .sort((a, b) => new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime())
      .slice(0, 10)
  );

  // Actions with service integration
  async function fetchJobs(filters?: JobFilters) {
    loading.value = true;
    error.value = null;

    try {
      const fetchedJobs = filters
        ? await jobService.findByFilters(filters)
        : await jobService.findAll();
      jobs.value = fetchedJobs;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch jobs";
    } finally {
      loading.value = false;
    }
  }

  async function createJob(jobData: CreateJobInput) {
    loading.value = true;
    error.value = null;

    try {
      const newJob = await jobService.create(jobData);
      jobs.value.unshift(newJob); // Add to beginning for recent-first order
      return newJob;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to create job";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateJob(id: string, updates: UpdateJobInput) {
    loading.value = true;
    error.value = null;

    try {
      const updatedJob = await jobService.update(id, updates);
      if (updatedJob) {
        const index = jobs.value.findIndex((job) => job.id === id);
        if (index !== -1) {
          jobs.value[index] = updatedJob;
        }
      }
      return updatedJob;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to update job";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteJob(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const success = await jobService.delete(id);
      if (success) {
        const index = jobs.value.findIndex((job) => job.id === id);
        if (index !== -1) {
          jobs.value.splice(index, 1);
        }
      }
      return success;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to delete job";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function searchJobs(query: string) {
    loading.value = true;
    error.value = null;

    try {
      const results = await jobService.search(query);
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to search jobs";
      return [];
    } finally {
      loading.value = false;
    }
  }

  // Utility functions
  function setJobs(newJobs: Job[]) {
    jobs.value = newJobs;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    jobs: readonly(jobs),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    jobCount,
    activeJobs,
    jobsByStatus,
    recentJobs,

    // Actions
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    searchJobs,
    setJobs,
    clearError,
  };
});
