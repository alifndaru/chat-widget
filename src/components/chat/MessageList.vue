<template>
  <div class="relative min-h-[100px] flex flex-col">
    <template v-for="message in allMessages" :key="message.id">
      <!-- Date Separator -->
      <message-date
        v-if="isDateMessage(message)"
        :date="getDateString(message)"
      />
      <!-- Incoming Messages -->
      <message-in
        v-else-if="message.sender !== 'visitor'"
        :name="translate('support')"
        :image="'/media/avatars/blank.png'"
        :time="
          new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        "
        :text="message.text"
      />
      <!-- Outgoing Messages -->
      <message-out
        v-else
        :image="'/media/avatars/blank.png'"
        :time="
          new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        "
        :text="message.text"
        :is-successful="message.is_successful"
        :is-retrying="message.canRetry || false"
        :message-id="message.id"
        @retry="onRetry"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import MessageIn from "@/components/messenger-parts/MessageIn.vue";
import MessageOut from "@/components/messenger-parts/MessageOut.vue";
import MessageDate from "@/components/messenger-parts/MessageDate.vue";
import { useI18n } from "vue-i18n";
import type { ChatMessage } from "@/types/chat";

const emit = defineEmits(["retry"]);

const props = defineProps<{
  allMessages: ChatMessage[];
  isAiThinking?: boolean;
}>();

const onRetry = (payload: { id: string; text: string }) => {
  emit("retry", payload);
};

const { t, te } = useI18n();
const translate = (text: string) => {
  if (te(text)) {
    return t(text);
  } else {
    return text;
  }
};

// Helper: robustly detect date message
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
function isDateMessage(message: any) {
  return (
    message?.message_type === "date" ||
    (typeof message?.text === "string" && dateRegex.test(message.text)) ||
    (typeof message?.message_content === "string" &&
      dateRegex.test(message.message_content)) ||
    (typeof message?.date === "string" && dateRegex.test(message.date))
  );
}
function getDateString(message: any) {
  return (
    message?.date ||
    (typeof message?.text === "string" && dateRegex.test(message.text)
      ? message.text
      : undefined) ||
    (typeof message?.message_content === "string" &&
    dateRegex.test(message.message_content)
      ? message.message_content
      : undefined) ||
    ""
  );
}
</script>

<style scoped>
/* Using Tailwind utility classes */
.chat-view .message-drawer-body :deep(.chat-message-out) {
  margin-right: 26px;
}
</style>
