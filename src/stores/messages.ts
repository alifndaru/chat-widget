import { defineStore } from "pinia";
import { ref } from "vue";
import MessageService from "@/core/services/MessageService";
import type { MessageDTO } from "@/types/message";

export const useMessagesStore = defineStore("messages", () => {
  const items = ref<MessageDTO[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loadMessageHistory = async (uuid: string) => {
    if (!uuid) return [] as MessageDTO[];
    isLoading.value = true;
    error.value = null;
    try {
      const { messages } = await MessageService.getMessageHistory(uuid, 50); // limit 50
      items.value = messages;
      return messages;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Gagal memuat pesan";
      return [] as MessageDTO[];
    } finally {
      isLoading.value = false;
    }
  };

  const clear = () => {
    items.value = [];
    error.value = null;
  };

  return {
    items,
    isLoading,
    error,
    loadMessageHistory,
    clear,
  };
});