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
    hasMoreConversations.value = true; // Assume there might be more

    try {
      const list = await ConversationService.getConversationsByCurrentVisitor();
      conversations.value = [...list];

      // If we got fewer than expected, assume no more data
      if (list.length < 10) {
        hasMoreConversations.value = false;
      }

      return list;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat percakapan';
      console.error('Error loading conversations:', err);
      hasMoreConversations.value = false;
      return [];
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const loadMoreConversations = async (): Promise<ConversationData[]> => {
    const visitorStore = useVisitorStore();

    // Initialize visitor if not already done
    if (!visitorStore.visitorUUID) {
      await visitorStore.init();
    }

    if (
      !visitorStore.visitorUUID ||
      !hasMoreConversations.value ||
      isLoadingMore.value
    ) {
      return [];
    }

    isLoadingMore.value = true;

    try {
      const nextOffset = pageOffset.value + pageLimit.value;
      const list = await ConversationService.getConversationsByVisitorUuid(
        visitorStore.visitorUUID,
        pageLimit.value,
        nextOffset,
      );

      pageOffset.value = nextOffset;

      if (list.length < pageLimit.value) {
        hasMoreConversations.value = false;
      }

      if (list.length > 0) {
        conversations.value = [...conversations.value, ...list];
      }

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
