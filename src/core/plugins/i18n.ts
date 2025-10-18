import { createI18n } from "vue-i18n";
import { messages } from "../locales";

const i18n = createI18n({
  legacy: false,
  locale: "id",
  globalInjection: true,
  messages,
});

// Function to sync with language store (called after store is initialized)
export async function syncI18nWithLanguageStore() {
  try {
    const { useLanguageStore } = await import("@/stores/language");
    const languageStore = useLanguageStore();

    // Set initial locale from language store
    i18n.global.locale.value = languageStore.currentLanguage;

    // Watch for language store changes and update i18n
    languageStore.$subscribe((mutation, state) => {
      i18n.global.locale.value = state.currentLanguage;
    });
  } catch (error) {
    console.warn("Language store not available for i18n sync:", error);
  }
}

export default i18n;
