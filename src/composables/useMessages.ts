import { ref, computed, watch } from 'vue';
import type { ConversationData } from '@/core/services/ConversationService';
import ChatService from '@/core/services/ChatService';
import type { ChatConversation } from '@/types/chat';
import type { Ref } from 'vue';

export interface ChatMessage {
  id: string | number;
  conversationId?: string | number;
  sender: string;
  text: string;
  timestamp: string | Date;
  isSending?: boolean;
  isSuccessful?: boolean;
  isRetrying?: boolean;
  isThinking?: boolean;
  // Additional fields for compatibility
  type?: 'sent' | 'received';
  conversation_uuid?: string;
  message_type?: string;
  canRetry?: boolean;
}

export function useMessages(conversation?: Ref<ConversationData | null>, onMessagesAdded?: () => void) {
  // State
  const messages = ref<ChatMessage[]>([]);
  const isSending = ref(false);
  const isLoadingOlderMessages = ref(false);
  const hasMoreMessages = ref(true);
  const nextBeforeId = ref<number | undefined>(undefined);
  const isLoaded = ref(false);

  // Helper to normalize ChatMessage to local interface
  const normalizeMessage = (msg: any): ChatMessage => {
    // Detect date message: message_content matches YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isDateMessage =
      typeof msg.message_content === 'string' && dateRegex.test(msg.message_content);

    if (isDateMessage) {
      return {
        ...msg,
        conversationId: msg.conversation_uuid || msg.conversationId,
        timestamp: msg.timestamp instanceof Date
          ? msg.timestamp
          : new Date(msg.timestamp || msg.message_content),
        message_type: 'date',
        sender: 'date',
        text: msg.message_content,
        date: msg.message_content, // for <message-date>
      };
    }

    return {
      ...msg,
      conversationId: msg.conversation_uuid || msg.conversationId,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
      text: msg.text || msg.message_content,
    };
  };

  // Actions
  const sendMessage = async (text: string) => {
    if (!conversation?.value?.uuid || !text.trim()) return;
    isSending.value = true;

    // 1. Optimistically push a pending visitor message
    const tempId = `temp-${Date.now()}`;
    const pendingMessage: ChatMessage = {
      id: tempId,
      conversationId: conversation.value.uuid,
      sender: 'visitor',
      text,
      timestamp: new Date(),
      isSending: true,
      isSuccessful: false,
    };
    messages.value.push(pendingMessage);
    onMessagesAdded?.();

    // 2. Add temporary AI thinking message
    const thinkingId = `thinking-${Date.now()}`;
    const thinkingMessage: ChatMessage = {
      id: thinkingId,
      conversationId: conversation.value.uuid,
      sender: 'assistant',
      text: 'AI sedang berpikir...',
      timestamp: new Date(),
      isThinking: true,
    };
    messages.value.push(thinkingMessage);
    onMessagesAdded?.();

    try {
      // Build a ChatConversation object from ConversationData
      const conv = conversation.value;
      const chatConv: ChatConversation = {
        id: conv.uuid,
        title: conv.title || 'Chat',
        uuid: conv.uuid,
        conversationData: conv,
        messages: [],
        createdAt: conv.started_at ? new Date(conv.started_at) : new Date(),
        updatedAt: conv.updated_at ? new Date(conv.updated_at) : new Date(),
      };
      const { visitorMessage, aiMessage } = await ChatService.sendMessage(
        chatConv,
        text,
      );

      // 3. Update the pending message with backend info
      const visitorIdx = messages.value.findIndex(m => m.id === tempId);
      if (visitorIdx !== -1) {
        messages.value[visitorIdx] = {
          ...normalizeMessage(visitorMessage),
          isSending: false,
          isSuccessful: true,
        };
        onMessagesAdded?.();
      }

      // 4. Replace thinking message with real AI message
      const thinkingIdx = messages.value.findIndex(m => m.id === thinkingId);
      if (thinkingIdx !== -1) {
        messages.value[thinkingIdx] = {
          ...normalizeMessage(aiMessage),
          isThinking: false,
        };
        onMessagesAdded?.();
      }

      // Insert static date message at the start if not already present for today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;

      const hasTodayDate = messages.value.some(
        (msg) => msg.message_type === 'date' && msg.text === todayString
      );
      if (!hasTodayDate) {
        messages.value.unshift({
          id: `date-${todayString}`,
          conversationId: conversation?.value?.uuid,
          sender: 'date',
          text: todayString,
          timestamp: today,
          message_type: 'date',
        });
        onMessagesAdded?.();
      }
    } catch (error) {
      // On error, mark the pending message as failed
      const idx = messages.value.findIndex(m => m.id === tempId);
      if (idx !== -1) {
        messages.value[idx] = {
          ...messages.value[idx],
          isSending: false,
          isSuccessful: false,
        };
      }
      console.error('Failed to send message:', error);
    } finally {
      isSending.value = false;
    }
  };

  // Load initial messages (history)
  const loadMessages = async () => {
    if (!conversation?.value?.uuid) {
      messages.value = [];
      hasMoreMessages.value = false;
      nextBeforeId.value = undefined;
      isLoaded.value = true;
      return;
    }
    isLoaded.value = false;
    try {
      const conv = conversation.value;
      const chatConv: ChatConversation = {
        id: conv.uuid,
        title: conv.title || 'Chat',
        uuid: conv.uuid,
        conversationData: conv,
        messages: [],
        createdAt: conv.started_at ? new Date(conv.started_at) : new Date(),
        updatedAt: conv.updated_at ? new Date(conv.updated_at) : new Date(),
      };
      const { messages: history, hasMore, nextBeforeId: nextId } = await ChatService.loadHistoryMessages(chatConv);
      messages.value = (history || []).map(normalizeMessage);
      hasMoreMessages.value = hasMore;
      nextBeforeId.value = nextId;
    } catch (error) {
      messages.value = [];
      hasMoreMessages.value = false;
      nextBeforeId.value = undefined;
      console.error('Failed to load messages:', error);
    } finally {
      isLoaded.value = true;
    }
  };

  // Load older messages for lazy loading
  const loadOlderMessages = async () => {
    if (!conversation?.value?.uuid || !hasMoreMessages.value || isLoadingOlderMessages.value) return;
    isLoadingOlderMessages.value = true;
    try {
      const conv = conversation.value;
      const beforeId = nextBeforeId.value;
      if (!beforeId) {
        hasMoreMessages.value = false;
        isLoadingOlderMessages.value = false;
        return;
      }
      const { messages: older, hasMore, nextBeforeId: nextId } = await ChatService.loadOlderMessages(
        conv.uuid,
        beforeId,
        20
      );
      // Prepend older messages to the beginning of the array
      messages.value = [...(older || []).map(normalizeMessage), ...messages.value];
      hasMoreMessages.value = hasMore;
      nextBeforeId.value = nextId;
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      isLoadingOlderMessages.value = false;
    }
  };

  // Watch for conversation change and reload messages
  if (conversation) {
    watch(
      () => conversation.value?.uuid,
      async (newUuid, oldUuid) => {
        if (newUuid !== oldUuid) {
          await loadMessages();
        }
      },
      { immediate: true }
    );
  }

  return {
    messages: computed(() => messages.value),
    isSending,
    isLoadingOlderMessages,
    hasMoreMessages,
    sendMessage,
    loadMessages,
    loadOlderMessages,
    isLoaded,
  };
}
