<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Jobs</h1>
        <p class="text-gray-600">Manage your job applications</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Add New Job
      </button>
    </div>

    <!-- Jobs Table Placeholder -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Job Applications</h2>
      </div>
      <div class="p-6">
        <div class="text-center py-12">
          <div
            class="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <JobIcon class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-gray-500">No jobs added yet</p>
          <p class="text-sm text-gray-400 mt-1">Add your first job application to get started</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const JobIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6"/>
    </svg>
  `,
};
</script>
