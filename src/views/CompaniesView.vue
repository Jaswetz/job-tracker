<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <header class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Companies</h1>
        <p class="text-gray-600">Manage company information and research</p>
      </div>
      <button
        @click="handleAddCompany"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        :disabled="loading"
      >
        <span v-if="loading">Adding...</span>
        <span v-else>Add Company</span>
      </button>
    </header>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search companies..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>
        <select
          v-model="selectedIndustry"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="filterCompanies"
        >
          <option value="">All Industries</option>
          <option v-for="industry in industries" :key="industry" :value="industry">
            {{ industry }}
          </option>
        </select>
      </div>
    </div>

    <!-- Companies Grid -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          Company Directory
          <span v-if="filteredCompanies.length > 0" class="text-sm font-normal text-gray-500">
            ({{ filteredCompanies.length }} companies)
          </span>
        </h2>
      </div>

      <div class="p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-500 mt-2">Loading companies...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div
            class="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"
          >
            <ExclamationIcon class="w-6 h-6 text-red-600" />
          </div>
          <p class="text-red-600">{{ error }}</p>
          <button
            @click="fetchCompanies"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCompanies.length === 0" class="text-center py-12">
          <div
            class="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <CompanyIcon class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-gray-500">
            {{ searchQuery ? "No companies found matching your search" : "No companies added yet" }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            Companies will be created automatically when you add jobs
          </p>
        </div>

        <!-- Companies List -->
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="company in filteredCompanies"
            :key="company.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="viewCompany(company.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ company.name }}</h3>
                <p v-if="company.industry" class="text-sm text-gray-600">{{ company.industry }}</p>
                <p v-if="company.location" class="text-sm text-gray-500">{{ company.location }}</p>
              </div>
              <div class="flex items-center space-x-1">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="w-3 h-3 rounded-full"
                  :class="i <= company.excitementLevel ? 'bg-yellow-400' : 'bg-gray-200'"
                ></span>
              </div>
            </div>

            <div v-if="company.stats" class="mt-3 flex justify-between text-xs text-gray-500">
              <span>{{ company.stats.totalJobs }} jobs</span>
              <span>{{ company.stats.totalContacts }} contacts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCompaniesStore } from "../stores/companies";
import { debounce } from "../utils/debounce";
import type { Company } from "../types";

// Icons
const CompanyIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  `,
};

const ExclamationIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
    </svg>
  `,
};

// Composables
const router = useRouter();
const companiesStore = useCompaniesStore();

// Reactive state
const searchQuery = ref("");
const selectedIndustry = ref("");
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const filteredCompanies = computed(() => {
  let companies = companiesStore.companies;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    companies = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query) ||
        company.location?.toLowerCase().includes(query)
    );
  }

  if (selectedIndustry.value) {
    companies = companies.filter((company) => company.industry === selectedIndustry.value);
  }

  return companies;
});

const industries = computed(() => {
  const uniqueIndustries = new Set(
    companiesStore.companies.map((company) => company.industry).filter(Boolean)
  );
  return Array.from(uniqueIndustries).sort();
});

// Methods
const fetchCompanies = async () => {
  loading.value = true;
  error.value = null;

  try {
    await companiesStore.fetchCompanies();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to fetch companies";
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = debounce(() => {
  // Search is handled by computed property
}, 300);

const filterCompanies = () => {
  // Filtering is handled by computed property
};

const handleAddCompany = () => {
  router.push("/companies/new");
};

const viewCompany = (companyId: string) => {
  router.push(`/companies/${companyId}`);
};

// Lifecycle
onMounted(() => {
  fetchCompanies();
});
</script>
