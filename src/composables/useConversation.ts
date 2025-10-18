import { computed } from 'vue';
import { useConversationStore } from '@/stores/conversation';
import type { ConversationData } from '@/core/services/ConversationService';

/**
 * Composable pembungkus store percakapan agar mudah digunakan di komponen.
 * Tidak mengubah logic, hanya meng-expose state, getters, dan actions dengan type yang rapi.
 *
 * ## Usage Example: Load Conversation History for Current Visitor
 * 
 * ```ts
 * import { useConversation } from '@/composables/useConversation';
 * import { onMounted } from 'vue';
 * 
 * export default {
 *   setup() {
 *     const {
 *       conversations,
 *       isLoadingConversations,
 *       error,
 *       loadConversations,
 *     } = useConversation();
 * 
 *     onMounted(() => {
 *       loadConversations();
 *     });
 * 
 *     return {
 *       conversations,
 *       isLoadingConversations,
 *       error,
 *     };
 *   }
 * }
 * ```
 * 
 * This will load the conversation history for the current visitor and expose it reactively.
 */
export function useConversation() {
  const store = useConversationStore();

  // State & Getters
  const conversations = computed(() => store.conversations);
  const activeConversation = computed(() => store.activeConversation);
  const isLoadingConversations = computed(() => store.isLoadingConversations);
  const isLoadingMore = computed(() => store.isLoadingMore);
  const error = computed(() => store.error);
  const hasActiveConversation = computed(() => store.hasActiveConversation);
  const hasConversations = computed(() => store.hasConversations);
  const hasError = computed(() => store.hasError);

  // Actions
  const loadConversations = () => store.loadConversations();
  const loadMoreConversations = () => store.loadMoreConversations();
  const loadActiveConversation = () => store.loadActiveConversation();
  const createConversation = () => store.createConversation();
  const clearConversations = () => store.clearConversations();

  return {
    // state
    conversations,
    activeConversation,
    isLoadingConversations,
    isLoadingMore,
    error,

    // derived
    hasActiveConversation,
    hasConversations,
    hasError,

    // actions
    loadConversations,
    loadMoreConversations,
    loadActiveConversation,
    createConversation,
    clearConversations,
  };
}
