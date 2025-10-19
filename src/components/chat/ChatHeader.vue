<template>
  <div
    class="py-4 px-4 bg-[var(--bs-orange)] text-white border-b border-[var(--bs-border-color-translucent)] rounded-t-[16px]"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
      <button
        v-if="showBackButton"
        class="p-0 mr-3 bg-transparent border-0 rounded transition-opacity duration-200 inline-flex items-center justify-center hover:opacity-80 focus:outline-2 focus:outline-white focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed [&_i]:text-white"
        :title="translate('back') || 'Back'"
        @click="emitBack"
      >
          <i class="ki-outline ki-arrow-left text-2xl p-0"></i>
        </button>
        <div class="ml-2 flex-1 text-center">
          <div class="mb-0 text-white chat-header-title">{{ translate(title) }}</div>
        </div>
      </div>
      <MinimizeButton
        :title="translate('closeWindow') || 'Close Chat'"
        @click="emitClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import MinimizeButton from "@/components/chat/MinimizeButton.vue";

withDefaults(defineProps<{
  title: string;
  showBackButton?: boolean;
}>(), {
  showBackButton: false,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "back"): void;
}>();

const { t, te } = useI18n();
function translate(text: string) {
  return te(text) ? t(text) : text;
}

function emitClose() {
  emit("close");
}

function emitBack() {
  emit("back");
}
</script>

<style scoped>
/* Using Tailwind utility classes */
[data-bs-theme="dark"] button:hover:not(:disabled) {
  background-color: var(--bs-gray-800, #343a40);
}
</style>
