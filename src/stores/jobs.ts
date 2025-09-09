import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Job } from "../types";

export const useJobsStore = defineStore("jobs", () => {
  const jobs = ref<Job[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const jobCount = computed(() => jobs.value.length);
  const activeJobs = computed(() =>
    jobs.value.filter((job) => !["rejected", "withdrawn", "offer_declined"].includes(job.status))
  );

  function setJobs(newJobs: Job[]) {
    jobs.value = newJobs;
  }

  function addJob(job: Job) {
    jobs.value.push(job);
  }

  function updateJob(id: string, updates: Partial<Job>) {
    const index = jobs.value.findIndex((job) => job.id === id);
    if (index !== -1) {
      jobs.value[index] = { ...jobs.value[index], ...updates };
    }
  }

  function removeJob(id: string) {
    const index = jobs.value.findIndex((job) => job.id === id);
    if (index !== -1) {
      jobs.value.splice(index, 1);
    }
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading;
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage;
  }

  return {
    jobs,
    loading,
    error,
    jobCount,
    activeJobs,
    setJobs,
    addJob,
    updateJob,
    removeJob,
    setLoading,
    setError,
  };
});
