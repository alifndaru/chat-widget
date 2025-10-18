<template>
  <button
    class="bg-transparent border-0 cursor-pointer rounded-[var(--bs-btn-border-radius)] transition-opacity duration-200 inline-flex items-center justify-center hover:opacity-80 focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    type="button"
    :disabled="disabled"
    :title="title"
    @click="handleClick"
  >
    <i :class="iconClass"></i>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  icon?: string;
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  title?: string;
}

interface Emits {
  (e: "click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  icon: "ki-minus-square",
  size: "md",
  disabled: false,
  title: "Minimize",
});

const emit = defineEmits<Emits>();

const iconClass = computed(() => {
  const baseClass = `ki-outline ${props.icon}`;
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  }[props.size];

  return `${baseClass} ${sizeClass}`;
});

const handleClick = () => {
  if (!props.disabled) {
    emit("click");
  }
};
</script>

<style scoped>
/* Using Tailwind utility classes */
button i {
  color: var(--bs-white);
}

[data-bs-theme="dark"] button:hover:not(:disabled) {
  background-color: var(--bs-gray-800, #343a40);
}
</style>
