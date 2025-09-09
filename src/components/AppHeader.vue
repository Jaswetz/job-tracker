<template>
  <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left side: Menu toggle and breadcrumb -->
      <div class="flex items-center space-x-4">
        <button
          @click="$emit('toggleSidebar')"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 'lg:hidden': !isSidebarCollapsed }"
        >
          <MenuIcon class="w-5 h-5 text-gray-600" />
        </button>

        <nav class="flex items-center space-x-2 text-sm">
          <span class="text-gray-500">Job Search Tracker</span>
          <ChevronRightIcon class="w-4 h-4 text-gray-400" />
          <span class="font-medium text-gray-900 capitalize">
            {{ currentPageTitle }}
          </span>
        </nav>
      </div>

      <!-- Right side: Search and actions -->
      <div class="flex items-center space-x-4">
        <!-- Global Search -->
        <div class="relative hidden md:block">
          <SearchIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search jobs, companies, contacts..."
            class="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="handleSearch"
          />
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center space-x-2">
          <button
            @click="showQuickAdd = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <PlusIcon class="w-4 h-4 inline mr-2" />
            Add Job
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

// Icons
const MenuIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  `,
};

const ChevronRightIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
  `,
};

const SearchIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  `,
};

const PlusIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
    </svg>
  `,
};

interface Props {
  isSidebarCollapsed: boolean;
}

defineProps<Props>();

defineEmits<{
  toggleSidebar: [];
}>();

const route = useRoute();
const searchQuery = ref("");
const showQuickAdd = ref(false);

const currentPageTitle = computed(() => {
  const routeNameMap: Record<string, string> = {
    dashboard: "Dashboard",
    jobs: "Jobs",
    companies: "Companies",
    contacts: "Contacts",
  };
  return routeNameMap[route.name as string] || "Dashboard";
});

function handleSearch() {
  // TODO: Implement global search functionality
  console.log("Searching for:", searchQuery.value);
}
</script>
