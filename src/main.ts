import "@/assets/keenicons/duotone/style.css";
import "@/assets/keenicons/outline/style.css";
import "@/assets/keenicons/solid/style.css";

// Import styles
import "@/style.css";

import { createApp, type App } from "vue";

// Extend Window interface
declare global {
  interface Window {
    initChatWidget?: (config?: any) => Promise<App>;
    destroyChatWidget?: () => void;
    getWidgetInfo?: () => {
      name: string;
      version: string;
      isInitialized: boolean;
      containerId: string | null;
    };
  }
}
import { createPinia } from "pinia";
// Router dihapus karena tidak diperlukan untuk widget
// import router from "@/router";
import FloatingChat from "@/components/chat/FloatingChat.vue";
import ElementPlus from "element-plus";
import id from "element-plus/es/locale/lang/id";
import * as Sentry from "@sentry/vue";
import i18n, { syncI18nWithLanguageStore } from "@/core/plugins/i18n";
import ApiService from "@/core/services/ApiService";
import { initInlineSvg } from "@/core/plugins/inline-svg";
import { initVeeValidate } from "@/core/plugins/vee-validate";
import { initKtIcon } from "@/core/plugins/keenthemes";
import ChatInitializationHelper from "@/core/helpers/chat-init";


// --- Helper: Ensure container exists ---
function ensureContainer(id = "chat-widget"): HTMLElement {
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);
  }
  return container;
}

// --- Create App Function ---
function createChatApp(): App {
  const app = createApp(FloatingChat);
  const pinia = createPinia();

  app.use(pinia);
  // Router dihapus - widget tidak memerlukan routing
  // app.use(router);
  app.use(ElementPlus, { locale: id });
  app.use(i18n);

  syncI18nWithLanguageStore();
  initInlineSvg(app);
  initVeeValidate();
  initKtIcon(app);

  ApiService.init(app);

  if (import.meta.env.VITE_APP_SENTRY_DSN) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_APP_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
    });
  }

  return app;
}

// --- Mount Function ---
async function mountChatWidget(app: App, selector = "#chat-widget") {
  await ChatInitializationHelper.ensureSession();
  app.mount(selector);
}

// --- Widget Instance Management ---
let widgetInstance: { app: App; containerId: string } | null = null;

// --- Initialize Widget Globally ---
window.initChatWidget = async (config = {}) => {
  try {
    // Prevent multiple instances
    if (widgetInstance) {
      console.warn(
        "⚠️ Chat widget already initialized. Destroying previous instance..."
      );
      window.destroyChatWidget?.();
    }

    const containerId = config.containerId || "chat-widget";
    const container = ensureContainer(containerId);
    const app = createChatApp();

    // Set API URL
    const apiUrl = config.apiUrl || import.meta.env.VITE_APP_API_URL;
    if (apiUrl) {
      ApiService.setBaseURL(apiUrl);
    }

    // Set language if provided
    if (config.language) {
      i18n.global.locale.value = config.language as any;
    }

    // Set theme if provided
    if (config.theme) {
      document.documentElement.setAttribute("data-bs-theme", config.theme);
    }

    // Mount widget
    await mountChatWidget(app, `#${container.id}`);

    // Store instance
    widgetInstance = { app, containerId };

    return app;
  } catch (error) {
    console.error("❌ Failed to initialize BNPB Chat Widget:", error);
    throw error;
  }
};

// --- Destroy Widget Function ---
window.destroyChatWidget = () => {
  if (widgetInstance) {
    try {
      widgetInstance.app.unmount();
      const container = document.getElementById(widgetInstance.containerId);
      if (container) {
        container.remove();
      }
      widgetInstance = null;
    } catch (error) {
      console.error("❌ Failed to destroy chat widget:", error);
    }
  } else {
    console.warn("⚠️ No widget instance to destroy");
  }
};

// --- Get Widget Info Function ---
window.getWidgetInfo = () => {
  return {
    name: "BNPB Chat Widget",
    version: "1.0.0",
    isInitialized: widgetInstance !== null,
    containerId: widgetInstance?.containerId || null,
  };
};

// --- Auto-start if in dev mode ---
if (import.meta.env.DEV) {
  window.initChatWidget();
}
