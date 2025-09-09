<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Contacts</h1>
        <p class="text-gray-600">Manage your professional network</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Add Contact
      </button>
    </div>

    <!-- Contacts List Placeholder -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Professional Contacts</h2>
      </div>
      <div class="p-6">
        <div class="text-center py-12">
          <div
            class="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <ContactIcon class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-gray-500">No contacts added yet</p>
          <p class="text-sm text-gray-400 mt-1">Start building your professional network</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const ContactIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
    </svg>
  `,
};
</script>
