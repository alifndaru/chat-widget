<template>
  <div
    class="w-full h-[calc(100vh-45px)] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
    :class="{ 'rounded-none': isContainedMode }"
  >
    <!-- Chat View -->
    <div
      v-if="currentView === 'chat'"
      class="flex flex-col h-full"
      style="position: relative"
    >
      <ChatHeader
        title="poweredByBNPB"
        :show-back-button="true"
        @close="emitClose"
        @back="goBackToList"
      />

      <div
        ref="chatContainer"
        class="relative overflow-y-auto overflow-x-hidden flex-1 bg-[var(--bs-gray-100,#f8f9fa)]"
      >
        <!-- Loading Spinner for Conversation -->
        <div
          v-if="isLoadingConversation"
          class="flex justify-center items-center h-full"
        >
          <div class="text-center">
            <div
              class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"
              role="status"
            >
              <div class="sr-only">Loading conversation...</div>
            </div>
            <div class="text-gray-500">
              {{ translate("loadingMessages") || "Loading messages..." }}
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div v-else class="relative min-h-[100px] flex flex-col">
          <!-- Auto-load trigger - Only show when there are messages and has more to load -->
          <div
            v-if="allMessages.length > 0 && hasMoreMessages"
            ref="loadMoreTrigger"
            class="h-px w-full opacity-0 pointer-events-none absolute top-0 left-0"
          ></div>

          <!-- Loading spinner for older messages -->
          <div
            v-if="isLoadingOlderMessages"
            class="sticky top-0 z-10 px-5 pt-4 pb-3 mb-3 bg-gradient-to-r from-white/98 to-gray-50/98 backdrop-blur-xl border-b border-black/[0.04] animate-[slideInFromTop_0.3s_ease-out] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          >
            <div class="flex items-center justify-center gap-3">
              <div class="flex items-center justify-center">
                <div class="relative w-6 h-6">
                  <div
                    class="absolute inset-0 w-5 h-5 m-0.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
                  ></div>
                </div>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <div class="text-sm font-medium text-gray-800 leading-tight">{{
                  translate("loadingOlderMessages") || "Loading older messages"
                }}</div>
                <div class="text-xs font-normal text-gray-400 leading-tight">{{
                  translate("pleaseWait") || "Please wait..."
                }}</div>
              </div>
            </div>
            <div
              class="relative w-full h-0.5 bg-blue-600/10 rounded-full mt-3 overflow-hidden"
            >
              <div
                class="h-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 rounded-full animate-[progressBarAnimation_2s_ease-in-out_infinite] origin-left"
              ></div>
            </div>
          </div>

          <!-- Skeleton placeholders for loading older messages -->
          <div v-if="isLoadingOlderMessages" class="px-4 py-3 opacity-60">
            <div
              v-for="n in 3"
              :key="`skeleton-${n}`"
              class="flex items-start gap-3 py-2 mb-3"
            >
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[skeleton-loading_1.5s_infinite] flex-shrink-0"
              ></div>
              <div class="flex-1 flex flex-col gap-1.5">
                <div
                  class="h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[skeleton-loading_1.5s_infinite] w-2/5"
                ></div>
                <div
                  class="h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[skeleton-loading_1.5s_infinite] w-3/4"
                ></div>
                <div
                  class="h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[skeleton-loading_1.5s_infinite] w-[90%]"
                ></div>
              </div>
            </div>
          </div>

          <MessageList :all-messages="chatMessages" @retry="handleRetry" />
        </div>

        <!-- Scroll to Bottom Button -->
        <div
          v-show="showScrollToBottom"
          class="absolute bottom-6 right-4 w-10 h-10 bg-[var(--bs-body-bg)] flex items-center justify-center cursor-pointer z-[100] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-[var(--bs-border-color-translucent)] hover:bg-[var(--bs-gray-100)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-95 transition-all duration-200"
          @click="() => scrollToBottom(true)"
        >
          <i
            class="ki-outline ki-arrow-down text-base text-[var(--bs-gray-700)]"
          ></i>
        </div>
      </div>
      <div class="bg-[var(--bs-body-bg)] border-t border-[var(--bs-border-color-translucent)]">
        <div class="px-4 py-3 flex items-center gap-2">
          <textarea
            v-model="newMessage"
            class="flex-1 px-3 py-2 rounded-lg resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--bs-gray-100)] text-[var(--bs-gray-900)] placeholder:text-[var(--bs-gray-500)]"
            :placeholder="messagePlaceholder"
            :disabled="isSending"
            rows="1"
            @keydown="
              (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }
            "
            @focus="resetPlaceholder"
          ></textarea>
          <button
            class="px-4 py-2 bg-[var(--bs-orange)] text-white rounded-xl hover:bg-[var(--bs-orange)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-w-[48px]"
            type="button"
            :disabled="!newMessage.trim() || isSending"
            @click="handleSendMessage"
          >
            <div
              v-if="isSending"
              class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              role="status"
            >
              <div class="sr-only">Sending...</div>
            </div>
            <i v-else class="ki-outline ki-send text-base text-white"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  computed,
} from "vue";
import { useI18n } from "vue-i18n";
import MessageList from "@/components/chat/MessageList.vue";
import ChatHeader from "@/components/chat/ChatHeader.vue";
import { useConversation } from "@/composables/useConversation";
import { useMessages } from "@/composables/useMessages";
import { useConversationStore } from "@/stores/conversation";
import { toRef } from "vue";

export default defineComponent({
  name: "MessageDrawer",
  components: { MessageList, ChatHeader },
  props: {
    isOpen: { type: Boolean, default: false },
    conversation: {
      type: Object as () =>
        | import("@/core/services/ConversationService").ConversationData
        | null,
      default: null,
    },
  },
  emits: ["close", "toggle-expanded", "back"],
  setup(props, { emit }) {
    // --- State ---
    const chatContainer = ref<HTMLElement | null>(null);
    const loadMoreTrigger = ref<HTMLElement | null>(null);
    const messageListRef = ref<InstanceType<typeof MessageList> | null>(null);
    const newMessage = ref("");
    const currentView = ref<"list" | "chat">("list");
    const isExpanded = ref(false);
    const selectedConversationUuid = ref<string | null>(null);
    const isLoadingConversation = ref(false);
    const showScrollToBottom = ref(false);
    const userJustSentMessage = ref(false);
    const justOpenedConversation = ref(false);
    const messagePlaceholder = ref("");

    let placeholderTimeout: ReturnType<typeof setTimeout> | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let lastTriggerTime = 0;
    const TRIGGER_COOLDOWN = 500;

    // --- i18n ---
    const { t, te } = useI18n();
    const translate = (text: string) => (te(text) ? t(text) : text);

    // --- Contained mode detection ---
    const isContainedMode = computed(() => {
      // Check if we're in iframe isolated mode
      if ((window as any).__WIDGET_IFRAME_MODE__ === true) {
        return true;
      }

      // Check if parent container has explicit dimensions (not default floating)
      const container = document.getElementById('chat-widget');
      if (!container) return false;

      const styles = window.getComputedStyle(container);
      // If container has relative/static position or explicit width/height, use contained mode
      return (
        (styles.position === 'relative' || styles.position === 'static') ||
        (container.parentElement && container.parentElement.id !== 'app')
      );
    });

    // --- Placeholder logic ---
    const defaultPlaceholder = () =>
      translate("typeMessagePlaceholder") || "Type a message...";
    const sentPlaceholder = () =>
      translate("messageSentPlaceholder") || "Message sent! Type another...";
    messagePlaceholder.value = defaultPlaceholder();

    const resetPlaceholder = () => {
      if (placeholderTimeout) {
        clearTimeout(placeholderTimeout);
        placeholderTimeout = null;
      }
      messagePlaceholder.value = defaultPlaceholder();
    };

    // --- Conversation & Messages ---
    const conversationStore = useConversationStore();
    const { activeConversation, loadActiveConversation } =
      useConversation();
    // Use a ref tied directly to the prop for reactivity
    const conversationRef = toRef(props, "conversation");
    const {
      messages: allMessages,
      isSending,
      isLoadingOlderMessages,
      hasMoreMessages,
      sendMessage,
      loadMessages,
      loadOlderMessages,
    } = useMessages(conversationRef, () => scrollToBottom());

    // --- Ensure messages have required 'type' property for ChatMessage ---
    const chatMessages = computed(() =>
      allMessages.value.map((msg) => ({
        ...msg,
        id: String(msg.id),
        type: (msg.sender === "visitor" ? "sent" : "received") as
          | "sent"
          | "received",
        timestamp:
          msg.timestamp instanceof Date
            ? msg.timestamp
            : new Date(msg.timestamp),
      })),
    );

    // --- Methods ---
    const emitClose = () => emit("close");
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
      emit("toggle-expanded", isExpanded.value);
    };

    // Handle retry event from MessageList
    const handleRetry = (payload: { id: string; text: string }) => {
      newMessage.value = payload.text || "";
    };

    // Send message and clear input
    const handleSendMessage = async () => {
      const text = newMessage.value;
      if (!text.trim() || isSending.value) return;
      await sendMessage(text);
      newMessage.value = "";
      messagePlaceholder.value = sentPlaceholder();
      userJustSentMessage.value = true;
      scrollToBottom();
      if (placeholderTimeout) clearTimeout(placeholderTimeout);
      placeholderTimeout = setTimeout(() => {
        messagePlaceholder.value = defaultPlaceholder();
        placeholderTimeout = null;
      }, 1500);
    };

    const goBackToList = () => {
      cleanupScrollListener();
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      selectedConversationUuid.value = null;
      showScrollToBottom.value = false;
      userJustSentMessage.value = false;
      justOpenedConversation.value = false;
      lastTriggerTime = 0;
      emit("back");
    };

    const openConversation = async (conversation: any) => {
      if (!conversation?.uuid) return;
      cleanupScrollListener();
      currentView.value = "chat";
      selectedConversationUuid.value = conversation.uuid;
      isLoadingConversation.value = false;
      showScrollToBottom.value = false;
      userJustSentMessage.value = false;
      justOpenedConversation.value = true;
      lastTriggerTime = 0;
      
      // Scroll to bottom instantly (without animation) when opening conversation
      await nextTick();
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
      
      setTimeout(() => {
        setupScrollListener();
        setTimeout(() => {
          setupIntersectionObserver();
          setTimeout(() => {
            justOpenedConversation.value = false;
          }, 1000);
        }, 500);
      }, 300);
    };

    const startNewConversation = async () => {
      cleanupScrollListener();
      currentView.value = "chat";
      isLoadingConversation.value = false;
      showScrollToBottom.value = false;
      userJustSentMessage.value = false;
      justOpenedConversation.value = true;
      
      // Scroll to bottom instantly (without animation) when starting new conversation
      await nextTick();
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
      
      setTimeout(() => {
        setupScrollListener();
        setTimeout(() => {
          setupIntersectionObserver();
          setTimeout(() => {
            justOpenedConversation.value = false;
          }, 1000);
        }, 500);
      }, 300);
    };

    const loadMoreMessages = async () => {
      if (!hasMoreMessages.value || isLoadingOlderMessages.value) return;
      const currentScrollHeight = chatContainer.value?.scrollHeight || 0;
      const currentScrollTop = chatContainer.value?.scrollTop || 0;
      try {
        await loadOlderMessages();
        await nextTick();
        if (chatContainer.value) {
          const newScrollHeight = chatContainer.value.scrollHeight;
          chatContainer.value.scrollTop =
            currentScrollTop + (newScrollHeight - currentScrollHeight);
        }
      } catch (error) {
        console.error("Error loading older messages:", error);
      }
    };

    const scrollToBottom = async (force = false) => {
      if (!chatContainer.value) return;
      if (force || isNearBottom() || userJustSentMessage.value) {
        await nextTick();
        const maxAttempts = 3;
        let attempts = 0;
        const doScroll = () => {
          if (chatContainer.value && attempts < maxAttempts) {
            chatContainer.value.scrollTo({
              top: chatContainer.value.scrollHeight,
              behavior: "smooth",
            });
            attempts++;
            setTimeout(() => {
              if (chatContainer.value) {
                const { scrollTop, scrollHeight, clientHeight } =
                  chatContainer.value;
                const distanceFromBottom =
                  scrollHeight - scrollTop - clientHeight;
                if (distanceFromBottom > 10 && attempts < maxAttempts) {
                  doScroll();
                } else {
                  showScrollToBottom.value = false;
                  userJustSentMessage.value = false;
                }
              }
            }, 50);
          }
        };
        doScroll();
      }
    };

    const isNearBottom = () => {
      if (!chatContainer.value) return false;
      const { scrollTop, scrollHeight, clientHeight } = chatContainer.value;
      return scrollHeight - scrollTop - clientHeight <= 50;
    };

    const checkScrollPosition = () => {
      if (!chatContainer.value) return;
      const { scrollTop, scrollHeight, clientHeight } = chatContainer.value;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Show button if user scrolled up more than 150px from bottom
      // This makes it appear sooner for better UX
      showScrollToBottom.value = distanceFromBottom > 150;
      
      const now = Date.now();
      if (
        !justOpenedConversation.value &&
        !isLoadingOlderMessages.value &&
        hasMoreMessages.value &&
        scrollTop <= 150 &&
        scrollHeight > clientHeight &&
        now - lastTriggerTime > TRIGGER_COOLDOWN
      ) {
        lastTriggerTime = now;
        loadMoreMessages();
      }
    };

    const setupScrollListener = () => {
      if (chatContainer.value) {
        chatContainer.value.addEventListener("scroll", checkScrollPosition);
        checkScrollPosition();
      }
    };

    const cleanupScrollListener = () => {
      if (chatContainer.value) {
        chatContainer.value.removeEventListener("scroll", checkScrollPosition);
      }
    };

    const setupIntersectionObserver = () => {
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      if (!loadMoreTrigger.value || !chatContainer.value) return;
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const now = Date.now();
          if (
            entry.isIntersecting &&
            hasMoreMessages.value &&
            !isLoadingOlderMessages.value &&
            !isLoadingConversation.value &&
            chatContainer.value &&
            chatContainer.value.scrollTop <
              chatContainer.value.scrollHeight -
                chatContainer.value.clientHeight -
                100 &&
            now - lastTriggerTime > TRIGGER_COOLDOWN
          ) {
            lastTriggerTime = now;
            loadMoreMessages();
          }
        },
        {
          root: chatContainer.value,
          rootMargin: "50px 0px 0px 0px",
          threshold: 0.1,
        },
      );
      intersectionObserver.observe(loadMoreTrigger.value);
    };

    // --- Watchers & Lifecycle ---
    watch(
      () => props.isOpen,
      (open) => {
        if (open) {
          document.body.classList.add("drawer-open");
        } else {
          document.body.classList.remove("drawer-open");
        }
      },
      { immediate: true },
    );

    watch(
      () => props.conversation,
      async (newVal) => {
        conversationStore.setActiveConversation(newVal);
        if (newVal) {
          await openConversation(newVal);
          currentView.value = "chat";
          // Scroll to bottom instantly after opening conversation
          await nextTick();
          if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
          }
        } else {
          currentView.value = "list";
        }
      },
      { immediate: true },
    );

    watch(
      () => isLoadingConversation.value,
      (isLoading) => {
        if (!isLoading && currentView.value === "chat") {
          nextTick(() => {
            setupIntersectionObserver();
            setupScrollListener();
            // Scroll to bottom instantly after loading conversation
            if (chatContainer.value) {
              chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
            }
          });
        }
      },
    );



    onMounted(async () => {
      await loadActiveConversation();
      if (currentView.value === "chat" && activeConversation.value) {
        await loadMessages();
      }
      nextTick(() => {
        setupIntersectionObserver();
        setupScrollListener();
        // Scroll to bottom instantly when chat opens
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    });

    onUnmounted(() => {
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      cleanupScrollListener();
      document.body.classList.remove("drawer-open");
    });

    // --- Expose to template ---
    return {
      chatContainer,
      loadMoreTrigger,
      allMessages,
      chatMessages,
      newMessage,
      currentView,
      isExpanded,
      isLoadingConversation,
      isSending,
      hasMoreMessages,
      isLoadingOlderMessages,
      showScrollToBottom,
      sendMessage,
      handleSendMessage,
      handleRetry,
      goBackToList,
      openConversation,
      startNewConversation,
      toggleExpanded,
      emitClose,
      loadMoreMessages,
      scrollToBottom,
      translate,
      messagePlaceholder,
      resetPlaceholder,
      isContainedMode,
    };
  },
});
</script>

<style scoped>
/* Message container spacing */
.chat-view :deep(.chat-message-out) {
  margin-right: 26px;
}

/* Dark theme support for skeleton */
[data-kt-theme="dark"] .skeleton-avatar,
[data-kt-theme="dark"] .skeleton-line {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
}

/* Dark theme for loading container */
[data-bs-theme="dark"] .sticky {
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.98) 0%,
    rgba(15, 23, 42, 0.98) 100%
  );
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

/* Expanded drawer layout */
.message-drawer.expanded .chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
