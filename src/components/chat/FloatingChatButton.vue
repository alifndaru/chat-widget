<template>
  <button
    v-show="!isOpen"
    type="button"
    class="fixed bottom-4 right-4 w-[60px] h-[60px] rounded-full bg-[var(--bs-orange)] text-[var(--bs-white)] flex justify-center items-center cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[1001] transition-all duration-300 ease-in-out border-none hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] md:w-[50px] md:h-[50px] p-0"
    @click="toggleChat">
    <i
      :class="[
        'ki-outline',
        isOpen ? 'ki-cross' : 'ki-message-text',
        'fs-2x md:text-xl'
      ]"
    ></i>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FloatingChatButton",
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ["toggle"],
  setup(props, { emit }) {
    const toggleChat = () => {
      emit("toggle");
    };

    return {
      toggleChat
    };
  }
});
</script>

<style scoped>
i {
  color: var(--bs-white);
  font-size: 1.5rem;
}

@media (max-width: 767.98px) {
  i {
    font-size: 1.25rem;
  }
}
</style>
