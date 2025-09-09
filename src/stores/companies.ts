import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Company } from "../types";

export const useCompaniesStore = defineStore("companies", () => {
  const companies = ref<Company[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const companyCount = computed(() => companies.value.length);
  const companiesByName = computed(() =>
    companies.value.reduce((acc, company) => {
      acc[company.name] = company;
      return acc;
    }, {} as Record<string, Company>)
  );

  function setCompanies(newCompanies: Company[]) {
    companies.value = newCompanies;
  }

  function addCompany(company: Company) {
    companies.value.push(company);
  }

  function updateCompany(id: string, updates: Partial<Company>) {
    const index = companies.value.findIndex((company) => company.id === id);
    if (index !== -1) {
      companies.value[index] = { ...companies.value[index], ...updates };
    }
  }

  function removeCompany(id: string) {
    const index = companies.value.findIndex((company) => company.id === id);
    if (index !== -1) {
      companies.value.splice(index, 1);
    }
  }

  function findCompanyByName(name: string): Company | undefined {
    return companies.value.find((company) => company.name.toLowerCase() === name.toLowerCase());
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading;
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage;
  }

  return {
    companies,
    loading,
    error,
    companyCount,
    companiesByName,
    setCompanies,
    addCompany,
    updateCompany,
    removeCompany,
    findCompanyByName,
    setLoading,
    setError,
  };
});
