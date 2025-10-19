<template>
    <div>
        <!-- Floating Chat Button - Always at bottom right -->
        <FloatingChatButton :is-open="isChatOpen" @toggle="toggleChat" />

        <!-- Centered Chat Components in iframe mode -->
        <div :class="chatContainerClasses">
            <!-- Home Content with Footer -->
            <div v-if="isChatOpen && activeView === 'home'" class="flex flex-col h-full">
                <div class="flex-1">
                    <HomeContent @close="toggleChat" @switch-to-chat="handleTabChangeToChat" />
                </div>
                <FooterNavigation
                    :active-tab="activeView"
                    @tab-change="handleTabChange"
                />
            </div>

            <!-- Chat Content without Footer -->
            <div v-if="activeView === 'chat'" class="flex flex-col h-full">
                <div class="flex-1">
                    <ConversationList
                        v-if="!selectedConversation"
                        @open-conversation="handleOpenConversation"
                        @start-new-conversation="handleStartNewConversation"
                        @close="toggleChat"
                    />

                    <MessageDrawer
                        v-if="selectedConversation"
                        :is-open="isChatOpen"
                        :conversation="selectedConversation"
                        @close="toggleChat"
                        @back="handleBack"
                    />
                </div>

                <!-- Footer Navigation - Always show in chat tab -->
                <FooterNavigation
                    :active-tab="activeView"
                    @tab-change="handleTabChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import FloatingChatButton from "./FloatingChatButton.vue";
import ConversationList from "./ConversationList.vue";
import MessageDrawer from "./MessageDrawer.vue";
import HomeContent from "./HomeContent.vue";
import FooterNavigation from "./FooterNavigation.vue";
import type { ConversationData } from "@/core/services/ConversationService";

const isChatOpen = ref(false);
const selectedConversation = ref<ConversationData | null>(null);
const activeView = ref<'home' | 'chat'>('home');

// Computed property for chat container classes (floating centered in iframe mode)
const chatContainerClasses = computed(() => {
    // For iframe mode, use floating centered positioning with calculated dimensions
    if (isContainedMode.value) {
        const baseClasses = 'w-full max-w-[420px] h-[600px] max-h-[75vh] flex flex-col pointer-events-auto fixed bottom-6 right-6 mx-auto z-[1000] rounded-2xl';
        const transitionClasses = 'transition-all duration-300 ease-out';

        let stateClasses = 'widget-closed';
        if (isChatOpen.value) {
            if (selectedConversation.value) {
                stateClasses = 'widget-message-drawer';
            } else {
                stateClasses = 'widget-conversation-list';
            }
        }

        return [baseClasses, transitionClasses, stateClasses];
    }

    // For floating mode, use original positioning
    const baseClasses = 'fixed z-[1000] bottom-4 right-4 flex flex-col items-end pointer-events-auto';
    const transitionClasses = 'transition-all duration-300 ease-out';

    let stateClasses = 'widget-closed';
    if (isChatOpen.value) {
        if (selectedConversation.value) {
            stateClasses = 'widget-message-drawer';
        } else {
            stateClasses = 'widget-conversation-list';
        }
    }

    return [baseClasses, transitionClasses, stateClasses];
});

// Detect if we're in contained mode (iframe isolated or development container)
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

const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value;
    if (!isChatOpen.value) {
        selectedConversation.value = null;
        activeView.value = 'home'; // Reset to home when closing
    }

    // Communicate state change to parent iframe
    communicateStateToParent();
};

const handleTabChange = (tab: 'home' | 'chat') => {
    activeView.value = tab;
    if (tab === 'chat') {
        selectedConversation.value = null; // Reset conversation when switching to chat tab
    }
};

const handleTabChangeToChat = () => {
    activeView.value = 'chat';
    selectedConversation.value = null; // Reset conversation when switching to chat tab
};

const handleOpenConversation = (conversation: ConversationData) => {
    selectedConversation.value = conversation;
    // Communicate state change when opening conversation
    communicateStateToParent();
};

const handleBack = () => {
    selectedConversation.value = null;
    // Communicate state change when going back to conversation list
    communicateStateToParent();
};

// Communicate state changes to parent iframe container
const communicateStateToParent = () => {
    try {
        // Check if we're in an iframe
        if (window.parent && window.parent !== window) {
            const state = {
                isOpen: isChatOpen.value,
                hasConversation: !!selectedConversation.value,
                timestamp: Date.now()
            };

            // Get current CSS custom properties from the widget container
            const cssVariables: Record<string, string> = {};

            // Send state to parent window
            window.parent.postMessage({
                type: 'CHAT_WIDGET_STATE_CHANGE',
                source: 'chat-widget-iframe',
                data: state
            }, '*'); // In production, use specific origin

            // Send CSS variables to parent window
            window.parent.postMessage({
                type: 'CHAT_WIDGET_CSS_VARIABLES',
                source: 'chat-widget-iframe',
                data: {
                    variables: cssVariables,
                    state: state
                }
            }, '*'); // In production, use specific origin
        }
    } catch (error) {
        console.warn('Failed to communicate state to parent:', error);
    }
};

// Handle "AskAI" for untracked visitors
const handleStartNewConversation = async () => {
    // Try to create a new conversation via the visitor store
    try {
        // Lazy import to avoid circular dependency
        const { useVisitorStore } = await import("@/stores/visitor");
        const visitorStore = useVisitorStore();
        const newConversation = await visitorStore.createConversation();
        if (newConversation) {
            selectedConversation.value = newConversation;
        }
    } catch (e) {
        // Optionally show error to user
        console.error("Failed to start new conversation:", e);
    }
};
</script>

<style scoped>
/* Base widget sizing variables for floating mode */
.widget-closed {
    --chat-widget-width: 80px;
    --chat-widget-height: 80px;
    --chat-widget-max-height: 80px;
}

.widget-conversation-list {
    --chat-widget-width: 380px;
    --chat-widget-height: 500px;
    --chat-widget-max-height: 70vh;
}

.widget-message-drawer {
    --chat-widget-width: 420px;
    --chat-widget-height: 500px;
    --chat-widget-max-height: 70vh;
}

/* Iframe contained mode - calculated dimensions with proper spacing */
.widget-closed.w-full.h-screen,
.widget-conversation-list.w-full.h-screen,
.widget-message-drawer.w-full.h-screen {
    --chat-widget-width: calc(100vw - 32px);
    --chat-widget-height: calc(100vh - 32px);
    --chat-widget-max-height: calc(100vh - 32px);
}

/* Responsive breakpoints for floating mode only */
@media (max-width: 768px) {
    .widget-conversation-list:not(.w-full) {
        width: 320px;
        height: 450px;
        max-height: 75vh;
    }

    .widget-message-drawer:not(.w-full) {
        width: 360px;
        height: 500px;
        max-height: 80vh;
    }
}

@media (max-width: 480px) {
    .widget-conversation-list:not(.w-full) {
        width: 280px;
        height: 400px;
        max-height: 70vh;
    }

    .widget-message-drawer:not(.w-full) {
        width: 300px;
        height: 450px;
        max-height: 75vh;
    }
}

/* Smooth transitions for state changes */
.widget-closed,
.widget-conversation-list,
.widget-message-drawer {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: bottom right;
}

/* Iframe mode - no transform origin shift */
.widget-closed.w-full.h-screen,
.widget-conversation-list.w-full.h-screen,
.widget-message-drawer.w-full.h-screen {
    transform-origin: center;
}

/* Ensure proper pointer events */
.widget-closed * {
    pointer-events: auto !important;
}

/* Prevent layout shift */
.widget-conversation-list,
.widget-message-drawer {
    margin-bottom: 0;
    margin-right: 0;
}

/* Iframe isolation mode adjustments */
:global(#chat-widget-container iframe) {
    border-radius: inherit;
    transition: inherit;
}

/* Dark theme support */
[data-bs-theme="dark"] .widget-conversation-list,
[data-bs-theme="dark"] .widget-message-drawer {
    --chat-widget-bg: rgba(30, 41, 59, 0.95);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .widget-conversation-list,
    .widget-message-drawer {
        border: 2px solid;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .widget-closed,
    .widget-conversation-list,
    .widget-message-drawer {
        transition: none;
    }
}
</style>
