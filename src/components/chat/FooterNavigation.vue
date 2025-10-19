<template>
  <div class="bg-white border-t border-gray-200 rounded-b-[22px]">
    <div class="flex items-center justify-around px-2 py-2">
      <!-- Home Tab -->
      <button
        class="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 cursor-pointer"
        :class="[
          activeTab === 'home'
            ? 'text-[var(--bs-orange)] bg-orange-50'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        ]"
        @click="setActiveTab('home')"
      >
        <i class="ki-outline ki-home-2 text-xl mb-1"></i>
        <span class="text-xs font-medium">Home</span>
      </button>

      <!-- Chat Tab -->
      <button
        class="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 cursor-pointer"
        :class="[
          activeTab === 'chat'
            ? 'text-[var(--bs-orange)] bg-orange-50'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        ]"
        @click="setActiveTab('chat')"
      >
        <i class="ki-outline ki-message-text-2 text-xl mb-1"></i>
        <span class="text-xs font-medium">Chat</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  activeTab: 'home' | 'chat';
}

interface Emits {
  (e: 'tab-change', tab: 'home' | 'chat'): void;
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'home'
});

const emit = defineEmits<Emits>();

const setActiveTab = (tab: 'home' | 'chat') => {
  emit('tab-change', tab);
};
</script>

<style scoped>
/* Additional styling if needed */
</style>
