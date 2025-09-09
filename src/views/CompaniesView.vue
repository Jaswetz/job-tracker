<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Companies</h1>
        <p class="text-gray-600">Manage company information and research</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Add Company
      </button>
    </div>

    <!-- Companies Grid Placeholder -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Company Directory</h2>
      </div>
      <div class="p-6">
        <div class="text-center py-12">
          <div
            class="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <CompanyIcon class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-gray-500">No companies added yet</p>
          <p class="text-sm text-gray-400 mt-1">
            Companies will be created automatically when you add jobs
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const CompanyIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  `,
};
</script>
