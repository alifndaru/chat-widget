<template>
  <div
    class="relative px-4 pb-4"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!--begin::Wrapper-->
    <div class="flex flex-col items-start relative">
      <!--begin::User-->
      <div class="flex items-center mb-2">
        <!--begin::Details-->
        <div class="text-[var(--bs-gray-500)] text-xs">{{ formattedTime }}</div>
        <!--end::Details-->
      </div>
      <!--end::User-->

      <!--begin::Message Container-->
      <div class="relative flex items-center gap-2">
        <!--begin::Text-->
        <div
          class="message-bubble-in relative z-[5] text-[var(--bs-gray-900)] px-4 py-3 rounded-2xl rounded-tl-sm w-fit max-w-full border border-gray-200"
          data-kt-element="message-text"
        >
          <!-- Loading animation for AI thinking -->
          <div v-if="isThinking" class="flex items-center justify-center p-2">
            <div class="bg-gray-50 rounded-full px-4 py-2 border border-gray-200 flex items-center gap-2">
              <div class="flex gap-1">
                <div
                  class="w-2 h-2 rounded-full bg-[var(--bs-gray-600)] animate-[thinking_1.4s_ease-in-out_-0.32s_infinite_both]"
                ></div>
                <div
                  class="w-2 h-2 rounded-full bg-[var(--bs-gray-600)] animate-[thinking_1.4s_ease-in-out_-0.16s_infinite_both]"
                ></div>
                <div
                  class="w-2 h-2 rounded-full bg-[var(--bs-gray-600)] animate-[thinking_1.4s_ease-in-out_0s_infinite_both]"
                ></div>
              </div>
              <div class="text-[var(--bs-gray-600)] italic text-sm"
                >{{ translate('ai_thinking') || 'AI sedang berpikir...' }}</div
              >
            </div>
          </div>
          <!-- Render markdown (basic) -->
          <!--
            v-html is safe here because convertMarkdownToHtml escapes HTML entities.
            See escapeHtml() in the script section.
          -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            v-else
            v-html="renderedHtml"
            style="
              color: var(--bs-gray-900) !important;
              font-size: var(--bs-font-size-base) !important;
              font-family: inherit !important;
              text-transform: none !important;
              text-decoration: none !important;
              line-height: 1.4 !important;
              background: transparent !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
            "
          ></div>
        </div>
        <!--end::Text-->
        
        <!--begin::Action Buttons-->
        <div
          class="opacity-0 invisible transition-all duration-200 ease-in-out z-10 flex flex-col gap-1"
          :class="{ 'opacity-100 visible': isHovered }"
        >
          <button
            class="w-7 h-7 rounded flex items-center justify-center bg-[var(--bs-gray-200)] border-0 text-[var(--bs-gray-700)] transition-all duration-150 ease-in-out p-0 cursor-pointer hover:bg-[var(--bs-gray-300)] active:bg-[var(--bs-gray-400)] disabled:cursor-not-allowed disabled:opacity-60"
            title="Copy message"
            @click="handleCopy"
          >
            <i class="ki-outline ki-copy text-sm"></i>
          </button>
        </div>
        <!--end::Action Buttons-->
      </div>
      <!--end::Message Container-->
    </div>
  </div>
  <!--end::Wrapper-->
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
// import { formatMessageTime } from "@/core/helpers/formatDate";

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
        html += '<ul class="mb-2 ps-4">';
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
  name: "MessageIn",
  props: {
    name: { type: String, default: "BNPB Assistant" },
    // image: { type: String, default: "" },
    time: { type: String, default: "" },
    text: { type: String, default: "" },
    isThinking: { type: Boolean, default: false },
  },
  setup(props) {
    const { t, te } = useI18n();

    const translate = (text: string) => {
      if (te(text)) {
        return t(text);
      } else {
        return text;
      }
    };

    const renderedHtml = computed(() => convertMarkdownToHtml(props.text));

    // Format time using dayjs with browser timezone
    const formattedTime = computed(() => {
      return props.time;
    });

    // Hover state for floating button
    const isHovered = ref(false);

    // Copy to clipboard logic
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(props.text);
        // Optionally, add a toast notification here
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = props.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    };

    return { renderedHtml, formattedTime, isHovered, handleCopy, translate };
  },
});
</script>

<style scoped>
/* Message bubble background */
.message-bubble-in {
  background-color: var(--bs-gray-100);
}

/* Custom keyframes for thinking animation */
@keyframes thinking {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
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
  color: var(--bs-orange);
  text-decoration: underline;
}

:deep(a):hover {
  opacity: 0.8;
}
</style>
