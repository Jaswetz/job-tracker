<template>
  <aside
    :class="[
      'bg-white shadow-lg transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Logo/Brand -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">JS</span>
        </div>
        <h1 v-if="!isCollapsed" class="ml-3 text-lg font-semibold text-gray-900">Job Tracker</h1>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <li v-for="item in navigationItems" :key="item.name">
          <RouterLink
            :to="item.path"
            :class="[
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'hover:bg-gray-100 hover:text-gray-900',
              $route.name === item.name ? 'bg-blue-100 text-blue-700' : 'text-gray-600',
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-if="!isCollapsed" class="ml-3">
              {{ item.label }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Stats Summary (when expanded) -->
    <div v-if="!isCollapsed" class="p-4 border-t border-gray-200">
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex justify-between">
          <span>Active Jobs</span>
          <span class="font-medium">{{ activeJobsCount }}</span>
        </div>
        <div class="flex justify-between">
          <span>Companies</span>
          <span class="font-medium">{{ companiesCount }}</span>
        </div>
        <div class="flex justify-between">
          <span>Contacts</span>
          <span class="font-medium">{{ contactsCount }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useJobsStore } from "../stores/jobs";
import { useCompaniesStore } from "../stores/companies";
import { useContactsStore } from "../stores/contacts";

// Icons (using simple SVG components for now)
const DashboardIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
    </svg>
  `,
};

const JobsIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6"/>
    </svg>
  `,
};

const CompaniesIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  `,
};

const ContactsIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
    </svg>
  `,
};

interface Props {
  isCollapsed: boolean;
}

defineProps<Props>();

const jobsStore = useJobsStore();
const companiesStore = useCompaniesStore();
const contactsStore = useContactsStore();

const navigationItems = [
  { name: "dashboard", path: "/", label: "Dashboard", icon: DashboardIcon },
  { name: "jobs", path: "/jobs", label: "Jobs", icon: JobsIcon },
  { name: "companies", path: "/companies", label: "Companies", icon: CompaniesIcon },
  { name: "contacts", path: "/contacts", label: "Contacts", icon: ContactsIcon },
];

const activeJobsCount = computed(() => jobsStore.activeJobs.length);
const companiesCount = computed(() => companiesStore.companyCount);
const contactsCount = computed(() => contactsStore.contactCount);
</script>
