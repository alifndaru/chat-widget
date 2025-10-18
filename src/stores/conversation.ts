import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ConversationService, { type ConversationData } from '@/core/services/ConversationService';
import { useVisitorStore } from './visitor';

export const useConversationStore = defineStore('conversation', () => {
  // State
  const conversations = ref<ConversationData[]>([]);
  const activeConversation = ref<ConversationData | null>(null);
  const isLoadingConversations = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);

  // Pagination state for infinite scroll
  const pageLimit = ref(10);
  const pageOffset = ref(0);
  const hasMoreConversations = ref(true);

  // Getters
  const hasError = computed(() => !!error.value);
  const hasConversations = computed(() => conversations.value.length > 0);
  const hasActiveConversation = computed(() => !!activeConversation.value);

  // Actions
  const loadConversations = async (): Promise<ConversationData[]> => {
    isLoadingConversations.value = true;
    error.value = null;
    pageOffset.value = 0;
    hasMoreConversations.value = false;

    try {
      const list = await ConversationService.getConversationsByCurrentVisitor();
      conversations.value = [...list];
      return list;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat percakapan';
      console.error('Error loading conversations:', err);
      return [];
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const loadMoreConversations = async (): Promise<ConversationData[]> => {
    const visitorStore = useVisitorStore();
    if (
      !visitorStore.visitorUUID ||
      !hasMoreConversations.value ||
      isLoadingMore.value
    ) {
      return [];
    }

    isLoadingMore.value = true;

    try {
      pageOffset.value += pageLimit.value;
      const list = await ConversationService.getConversationsByVisitorUuid(
        visitorStore.visitorUUID,
        pageLimit.value,
        pageOffset.value,
      );

      if (list.length < pageLimit.value) {
        hasMoreConversations.value = false;
      }

      conversations.value = [...conversations.value, ...list];
      return list;
    } catch (err) {
      console.error('Error loading more conversations:', err);
      hasMoreConversations.value = false;
      return [];
    } finally {
      isLoadingMore.value = false;
    }
  };

  const loadActiveConversation = async (): Promise<ConversationData | null> => {
    isLoadingConversations.value = true;
    error.value = null;

    try {
      const conversation =
        await ConversationService.getActiveConversationByCurrentVisitor();
      activeConversation.value = conversation;
      return conversation;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat percakapan aktif';
      console.error('Error loading active conversation:', err);
      return null;
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const createConversation = async (): Promise<ConversationData | null> => {
    isLoadingConversations.value = true;
    error.value = null;

    try {
      const conversation =
        await ConversationService.createConversationForCurrentVisitor();
      if (conversation) {
        conversations.value.unshift(conversation);
        activeConversation.value = conversation;
      }
      return conversation;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal membuat percakapan';
      console.error('Error creating conversation:', err);
      return null;
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const setActiveConversation = (conversation: ConversationData | null): void => {
    activeConversation.value = conversation;
  };

  const clearConversations = (): void => {
    conversations.value = [];
    activeConversation.value = null;
  };

  return {
    // State
    conversations,
    activeConversation,
    isLoadingConversations,
    isLoadingMore,
    error,

    // Getters
    hasError,
    hasConversations,
    hasActiveConversation,

    // Actions
    loadConversations,
    loadMoreConversations,
    loadActiveConversation,
    createConversation,
    clearConversations,
    setActiveConversation,

    // Pagination state (exposed for UI)
    pageLimit,
    pageOffset,
    hasMoreConversations,
  };
});
