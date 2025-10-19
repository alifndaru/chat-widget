<template>
  <div
    class="w-full h-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
    :class="{ 'rounded-none': isContainedMode }"
  >
    <div class="flex flex-col h-full">
      <ChatHeader title="poweredByBNPB" @close="emitClose" />

      <div ref="scrollContainer" class="flex-1 overflow-y-auto bg-white max-h-[400px]">
        <!-- Loading State -->
        <div
          v-if="conversationStore.isLoadingConversations"
          class="text-center p-4"
        >
          <div
            class="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"
            role="status"
          >
            <div class="sr-only">{{ translate("loadingConversations") }}</div>
          </div>
          <p class="mt-2 text-gray-500">
            {{ translate("loadingConversations") }}
          </p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="conversationStore.hasError"
          class="bg-red-50 border border-red-200 text-red-800 rounded p-3 m-3"
        >
          <strong>{{ translate("error") }}:</strong>
          {{ conversationStore.error }}
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!conversationStore.hasConversations"
          class="text-center p-4 flex flex-col justify-center items-center h-full"
        >
          <div class="mb-3">
            <i class="ki-outline ki-message-text-2 text-5xl text-gray-500"></i>
          </div>
          <div class="text-gray-500 text-base font-semibold empty-state-title" style="text-transform: none;">
            {{ translate("noConversation") }}
          </div>
          <p class="text-gray-500 text-sm" style="text-transform: none;">
            {{ translate("startConversationHelp") }}
          </p>
        </div>

        <!-- Conversations List -->
        <div v-else>
          <div
            v-for="(conversation, index) in conversationStore.conversations"
            :key="conversation.uuid || index"
            class="px-4 py-3 cursor-pointer hover:bg-[var(--bs-gray-200)] transition-colors duration-200 border-b border-[var(--bs-border-color-translucent)] last:border-b-0"
            @click="openConversation(conversation)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="mb-1">
                  <div
                    class="text-sm text-[var(--bs-gray-900)] text-ellipsis line-clamp-2"
                    data-conversation-text
                    >{{
                      conversation.first_message?.message_content ||
                      translate("newConversation")
                    }}</div
                  >
                </div>
                <div class="flex items-center justify-between text-xs">
                  <div class="text-[var(--bs-gray-600)] capitalize">
                    {{
                      formatTime(
                        conversation.started_at ||
                          conversation.updated_at ||
                          "",
                      )
                    }}
                  </div>
                </div>
              </div>
              <div class="ml-3 flex-shrink-0">
                <i class="ki-outline ki-right text-2xl text-[var(--bs-gray-500)]"></i>
              </div>
            </div>
          </div>

          <!-- Infinite scroll sentinel -->
          <div ref="sentinel" class="flex justify-center p-3">
            <div
              v-if="conversationStore.isLoadingMore"
              class="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
              role="status"
            ></div>
            <div
              v-else-if="!conversationStore.hasMoreConversations"
              class="capitalize text-gray-500 text-sm"
              >{{ translate("noMoreData") }}</div
            >
          </div>
        </div>
      </div>

      <!-- Ask a Question Button - Centered above footer -->
      <div class="p-4 bg-transparent border-t border-[var(--bs-border-color-translucent)]">
        <button
          class="w-full py-3 px-4 bg-[var(--bs-orange)] text-white border-0 outline-none rounded-lg hover:bg-[var(--bs-orange)]/90 active:bg-[var(--bs-orange)]/80 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm cursor-pointer"
          :disabled="conversationStore.isLoadingConversations"
          @click="startNewConversation"
        >
          <div
            v-if="conversationStore.isLoadingConversations"
            class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            role="status"
          >
            <div class="sr-only">{{ translate("loading") }}</div>
          </div>
          <i v-else class="ki-outline ki-plus text-lg"></i>
          {{
            conversationStore.isLoadingConversations
              ? translate("creating")
              : "Ask a question"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from "vue";
import { useConversationStore } from "@/stores/conversation";
import type { ConversationData } from "@/core/services/ConversationService";
import { useI18n } from "vue-i18n";
import ChatHeader from "@/components/chat/ChatHeader.vue";

const emit = defineEmits<{
  (e: "open-conversation", conversation: ConversationData): void;
  (e: "start-new-conversation"): void;
  (e: "toggle-expanded", expanded: boolean): void;
  (e: "close"): void;
}>();



function emitClose() {
  emit("close");
}

const { t, te } = useI18n();
function translate(text: string) {
  return te(text) ? t(text) : text;
}

const conversationStore = useConversationStore();

// Detect if we're in contained mode (iframe)
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

// Infinite scroll setup using scroll events
const scrollContainer = ref<HTMLElement | null>(null);

function setupScrollListener() {
  if (!scrollContainer.value) return null;

  const container = scrollContainer.value;
  let isLoading = false;

  const handleScroll = async () => {
    if (isLoading || !conversationStore.hasMoreConversations || conversationStore.isLoadingMore) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Load more when user is within 100px of the bottom
    if (distanceFromBottom < 100) {
      isLoading = true;
      await conversationStore.loadMoreConversations();
      isLoading = false;
    }
  };

  container.addEventListener('scroll', handleScroll, { passive: true });

  // Return cleanup function
  return () => {
    container.removeEventListener('scroll', handleScroll);
  };
}

let cleanupScrollListener: (() => void) | null = null;

onMounted(async () => {
  // Load initial conversations
  await conversationStore.loadConversations();

  // Wait for DOM to be fully rendered, then setup scroll listener
  await nextTick();
  cleanupScrollListener = setupScrollListener();
});

onBeforeUnmount(() => {
  if (cleanupScrollListener) {
    cleanupScrollListener();
  }
});

const openConversation = (conversation: any) => {
  // Ensure the emitted object is typed as ConversationData
  emit("open-conversation", conversation as ConversationData);
};

async function startNewConversation() {
  const newConversation = await conversationStore.createConversation();
  if (newConversation) {
    emit("open-conversation", newConversation);
  } else {
    emit("start-new-conversation");
  }
}

function formatTime(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${translate("minutesAgo")}`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} ${translate("hoursAgo")}`;
  } else if (diffInMinutes < 10080) {
    return `${Math.floor(diffInMinutes / 1440)} ${translate("daysAgo")}`;
  } else {
    return `${Math.floor(diffInMinutes / 10080)} ${translate("weeksAgo")}`;
  }
}
</script>
