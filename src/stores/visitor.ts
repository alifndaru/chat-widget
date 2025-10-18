import { defineStore } from "pinia";
import { ref, computed } from "vue";
import VisitorService, { type VisitorData } from "@/core/services/VisitorService";
import ConversationService, { type ConversationData } from "@/core/services/ConversationService";

export const useVisitorStore = defineStore("visitor", () => {
  // State
  const visitorUUID = ref<string | null>(null);
  const visitorData = ref<VisitorData | null>(null);
  const conversations = ref<ConversationData[]>([]);
  const activeConversation = ref<ConversationData | null>(null);
  const isLoading = ref(false);
  const isLoadingConversations = ref(false);
  const error = ref<string | null>(null);

  // Pagination state for infinite scroll
  const pageLimit = ref(10);
  const pageOffset = ref(0);
  const hasMoreConversations = ref(true);
  const isLoadingMore = ref(false);

  // Getters
  const isTracked = computed(() => !!visitorUUID.value);
  const hasError = computed(() => !!error.value);
  const hasConversations = computed(() => conversations.value.length > 0);
  const hasActiveConversation = computed(() => !!activeConversation.value);

  // Actions
  const initializeVisitor = async (): Promise<string | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const uuid = await VisitorService.getOrCreateVisitorUUID();
      visitorUUID.value = uuid;
      return uuid;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Gagal menginisialisasi pengunjung";
      console.error("Error initializing visitor:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const loadVisitorData = async (
    uuid?: string,
  ): Promise<VisitorData | null> => {
    const targetUUID = uuid || visitorUUID.value;
    if (!targetUUID) {
      error.value = "UUID pengunjung tidak tersedia";
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await VisitorService.getVisitorByUUID(targetUUID);
      visitorData.value = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Gagal memuat data pengunjung";
      console.error("Error loading visitor data:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const refreshVisitorUUID = (): void => {
    const uuid = VisitorService.getVisitorUUID();
    // console.log("Refreshed visitor UUID:", uuid);
    visitorUUID.value = uuid;
  };

  const clearVisitor = async (deleteFromBackend = false): Promise<boolean> => {
    if (deleteFromBackend && visitorUUID.value) {
      try {
        const success = await VisitorService.deleteVisitor(visitorUUID.value);
        if (!success) {
          error.value = "Gagal menghapus pengunjung dari backend";
          return false;
        }
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Gagal menghapus pengunjung";
        console.error("Error deleting visitor:", err);
        return false;
      }
    } else {
      VisitorService.clearVisitorUUID();
    }

    // Clear local state
    visitorUUID.value = null;
    visitorData.value = null;
    conversations.value = [];
    activeConversation.value = null;
    error.value = null;

    return true;
  };

  const createNewVisitor = async (): Promise<string | null> => {
    // Clear existing visitor first
    VisitorService.clearVisitorUUID();
    visitorUUID.value = null;
    visitorData.value = null;

    // Create new visitor
    return await initializeVisitor();
  };

  const loadConversations = async (): Promise<ConversationData[]> => {
    // console.log("loadConversations (using getConversationsByCurrentVisitor)");
    isLoadingConversations.value = true;
    error.value = null;

    try {
      // Reset pagination state (not used with this method)
      pageOffset.value = 0;
      hasMoreConversations.value = false;

      const list = await ConversationService.getConversationsByCurrentVisitor();
      conversations.value = [...list];
      // No pagination, so hasMoreConversations is false
      return list;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Gagal memuat percakapan";
      console.error("Error loading conversations:", err);
      return [];
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const loadMoreConversations = async (): Promise<ConversationData[]> => {
    if (
      !visitorUUID.value ||
      !hasMoreConversations.value ||
      isLoadingMore.value
    ) {
      return [];
    }

    isLoadingMore.value = true;

    try {
      pageOffset.value += pageLimit.value;
      const list = await ConversationService.getConversationsByVisitorUuid(
        visitorUUID.value,
        pageLimit.value,
        pageOffset.value,
      );

      if (list.length < pageLimit.value) {
        hasMoreConversations.value = false;
      }

      conversations.value = [...conversations.value, ...list];
      return list;
    } catch (err) {
      console.error("Error loading more conversations:", err);
      hasMoreConversations.value = false;
      return [];
    } finally {
      isLoadingMore.value = false;
    }
  };

  const loadActiveConversation = async (): Promise<ConversationData | null> => {
    if (!visitorUUID.value) {
      error.value = "UUID pengunjung tidak tersedia";
      return null;
    }

    isLoadingConversations.value = true;
    error.value = null;

    try {
      const conversation =
        await ConversationService.getActiveConversationByCurrentVisitor();
      activeConversation.value = conversation;
      return conversation;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Gagal memuat percakapan aktif";
      console.error("Error loading active conversation:", err);
      return null;
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const createConversation = async (): Promise<ConversationData | null> => {
    if (!visitorUUID.value) {
      error.value = "UUID pengunjung tidak tersedia";
      return null;
    }

    isLoadingConversations.value = true;
    error.value = null;

    try {
      const conversation =
        await ConversationService.createConversationForCurrentVisitor();
      if (conversation) {
        // Add to conversations list
        conversations.value.unshift(conversation);
        // Set as active conversation
        activeConversation.value = conversation;
      }
      return conversation;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Gagal membuat percakapan";
      console.error("Error creating conversation:", err);
      return null;
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const clearConversations = (): void => {
    conversations.value = [];
    activeConversation.value = null;
  };

  // Initialize visitor UUID from session storage on store creation
  const init = async () => {
    // console.log("init");
    // Try to get existing UUID first
    refreshVisitorUUID();

    // If no UUID exists, create a new visitor
    if (!visitorUUID.value) {
      // console.log("No existing visitor UUID, creating new visitor.");
      const uuid = await initializeVisitor();
      if (uuid) {
        await loadVisitorData(uuid);
      }
    } else {
      console.warn("Existing visitor UUID loaded:", visitorUUID.value);
      await loadVisitorData(visitorUUID.value);
    }
  };

  return {
    // State
    visitorUUID,
    visitorData,
    conversations,
    activeConversation,
    isLoading,
    isLoadingConversations,
    error,

    // Getters
    isTracked,
    hasError,
    hasConversations,
    hasActiveConversation,

    // Actions
    initializeVisitor,
    loadVisitorData,
    refreshVisitorUUID,
    clearVisitor,
    createNewVisitor,
    loadConversations,
    loadActiveConversation,
    createConversation,
    clearConversations,
    init,

    // Pagination state (exposed for UI)
    pageLimit,
    pageOffset,
    hasMoreConversations,
    isLoadingMore,

    // Actions for infinite scroll
    loadMoreConversations,
  };
});
