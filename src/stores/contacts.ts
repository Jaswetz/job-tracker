import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Contact } from "../types";

export const useContactsStore = defineStore("contacts", () => {
  const contacts = ref<Contact[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const contactCount = computed(() => contacts.value.length);
  const contactsByCompany = computed(() =>
    contacts.value.reduce((acc, contact) => {
      if (contact.companyId) {
        if (!acc[contact.companyId]) {
          acc[contact.companyId] = [];
        }
        acc[contact.companyId].push(contact);
      }
      return acc;
    }, {} as Record<string, Contact[]>)
  );

  function setContacts(newContacts: Contact[]) {
    contacts.value = newContacts;
  }

  function addContact(contact: Contact) {
    contacts.value.push(contact);
  }

  function updateContact(id: string, updates: Partial<Contact>) {
    const index = contacts.value.findIndex((contact) => contact.id === id);
    if (index !== -1) {
      contacts.value[index] = { ...contacts.value[index], ...updates };
    }
  }

  function removeContact(id: string) {
    const index = contacts.value.findIndex((contact) => contact.id === id);
    if (index !== -1) {
      contacts.value.splice(index, 1);
    }
  }

  function getContactsByCompany(companyId: string): Contact[] {
    return contacts.value.filter((contact) => contact.companyId === companyId);
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading;
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage;
  }

  return {
    contacts,
    loading,
    error,
    contactCount,
    contactsByCompany,
    setContacts,
    addContact,
    updateContact,
    removeContact,
    getContactsByCompany,
    setLoading,
    setError,
  };
});
