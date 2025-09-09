<template>
  <svg
    :class="classes"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: number | string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  class: "",
});

const classes = computed(() => {
  const baseClasses = "inline-block";
  return props.class ? `${baseClasses} ${props.class}` : baseClasses;
});
</script>
