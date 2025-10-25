<template>
  <div
    class="relative px-4"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!--begin::Wrapper-->
    <div class="flex flex-col items-end relative mt-3 mb-3">
      <!--begin::User-->
      <div class="flex items-center mb-2">
        <!--begin::Details-->
        <div class="text-[var(--bs-gray-500)] text-xs">{{ formattedTime }}</div>
        <div v-if="isFailed" class="text-xs font-medium text-red-600 ml-2">
          <i class="bi bi-exclamation-triangle"></i> Failed
        </div>
        <!--end::Details-->
      </div>
      <!--end::User-->

      <!--begin::Message Container-->
      <div class="relative flex items-start gap-2 max-w-full">
        <!--begin::Action Buttons-->
        <div
          class="opacity-0 invisible transition-all duration-200 ease-in-out z-10 flex flex-col gap-1"
          :class="{ 'opacity-100 visible': isHovered }"
        >
          <button
            class="w-7 h-7 rounded flex items-center justify-center bg-[var(--bs-gray-200)] border-0 text-[var(--bs-gray-700)] transition-all duration-150 ease-in-out p-0 cursor-pointer hover:bg-[var(--bs-gray-300)] active:bg-[var(--bs-gray-400)] disabled:cursor-not-allowed disabled:opacity-60"
            title="Retry message"
            :disabled="isRetrying"
            @click="handleRetry"
          >
            <i
              v-if="isRetrying"
              class="ki-outline ki-arrows-circle text-sm animate-spin"
            ></i>
            <i v-else class="ki-outline ki-arrows-circle text-sm"></i>
          </button>
          <button
            class="w-7 h-7 rounded flex items-center justify-center bg-[var(--bs-gray-200)] border-0 text-[var(--bs-gray-700)] transition-all duration-150 ease-in-out p-0 cursor-pointer hover:bg-[var(--bs-gray-300)] active:bg-[var(--bs-gray-400)] disabled:cursor-not-allowed disabled:opacity-60"
            title="Copy message"
            @click="handleCopy"
          >
            <i class="ki-outline ki-copy text-sm"></i>
          </button>
        </div>
        <!--end::Action Buttons-->

        <!--begin::Text-->
        <div
          class="message-bubble-out relative z-[5] text-white px-4 py-3 rounded-2xl rounded-tr-sm w-fit max-w-full"
          style="word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap; max-width: 100% !important; width: fit-content !important; display: inline-block !important;"
          :class="{
            '!text-red-200 border border-red-500': isFailed,
          }"
          data-kt-element="message-text"
        >
          <!-- Normal message content -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            v-html="renderedHtml"
            style="
              color: white !important;
              font-size: var(--bs-font-size-base) !important;
              font-family: inherit !important;
              text-transform: none !important;
              text-decoration: none !important;
              line-height: 1.4 !important;
              background: transparent !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              white-space: pre-wrap !important;
              max-width: 100% !important;
              width: fit-content !important;
              display: inline-block !important;
            "
          ></div>
        </div>
        <!--end::Text-->
      </div>
      <!--end::Message Container-->
    </div>
    <!--end::Wrapper-->
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { formatMessageTime } from "@/core/helpers/formatDate";

// Basic HTML escape to prevent XSS
const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// Apply minimal inline markdown formatting
const inlineFormat = (str: string) => {
  let s = str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(
    /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return s;
};

// Convert a markdown-like string to basic HTML
const convertMarkdownToHtml = (md?: string): string => {
  if (!md) return "";
  const safe = escapeHtml(md);
  const lines = safe.split(/\r?\n/);
  let html = "";
  let inList = false;

  const flushList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const match = line.match(/^[*-]\s+(.+)/);
    if (match) {
      if (!inList) {
        html += '<ul class="list-disc mb-2 ps-4">';
        inList = true;
      }
      html += `<li>${inlineFormat(match[1])}</li>`;
      continue;
    }

    flushList();
    if (line === "") {
      html += "<br/>";
    } else {
      html += `<p class="mb-2">${inlineFormat(line)}</p>`;
    }
  }

  flushList();
  return html;
};

export default defineComponent({
  name: "MessageOut",
  props: {
    // image: { type: String, default: "" },
    time: { type: String, default: "" },
    text: { type: String, default: "" },
    messageId: { type: String, default: "" },
    isSuccessful: {
      type: Boolean,
      default: true,
    },
    isRetrying: {
      type: Boolean,
      default: false,
    },
    isSending: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["retry"],
  setup(props, { emit }) {
    // Reactive state for hover
    const isHovered = ref(false);

    const renderedHtml = computed(() => convertMarkdownToHtml(props.text || ''));

    // Format time using dayjs with browser timezone
    const formattedTime = computed(() => {
      return props.time;
    });

    const isFailed = computed(() => {
      return props.isSuccessful === false;
    });

    // Handle retry button click
    const handleRetry = () => {
      emit("retry", { id: props.messageId, text: props.text });
    };

    // Handle copy button click
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(props.text);
        // You could add a toast notification here if needed
      } catch (error) {
        console.error("Failed to copy text:", error);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = props.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    };

    return {
      renderedHtml,
      formattedTime,
      isFailed,
      isHovered,
      handleRetry,
      handleCopy,
    };
  },
});
</script>

<style scoped>
/* Message bubble background */
.message-bubble-out {
  background-color: var(--bs-orange);
}

/* Spin animation for retry button */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Dark theme support */
[data-bs-theme="dark"] button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ccc !important;
}

[data-bs-theme="dark"] button:active:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* List and link styles */
:deep(ul) {
  margin: 0.25rem 0;
}

:deep(li) {
  margin-bottom: 0.25rem;
}

:deep(strong) {
  font-weight: 700;
}

:deep(a) {
  color: white;
  text-decoration: underline;
  font-weight: 600;
}

:deep(a):hover {
  opacity: 0.9;
}
</style>
