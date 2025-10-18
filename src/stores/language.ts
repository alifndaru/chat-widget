import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { messages } from "@/core/locales";

export type Language = "id" | "en";

export const LANGUAGE_LS_KEY = "kt_language";

export const useLanguageStore = defineStore("language", () => {
  const currentLanguage = ref<Language>(
    (localStorage.getItem(LANGUAGE_LS_KEY) as Language) || "id"
  );

  const currentMessages = computed(() => messages[currentLanguage.value]);

  function setLanguage(language: Language) {
    currentLanguage.value = language;
    localStorage.setItem(LANGUAGE_LS_KEY, language);
  }

  function toggleLanguage() {
    const newLanguage = currentLanguage.value === "id" ? "en" : "id";
    setLanguage(newLanguage);
  }

  return {
    currentLanguage,
    currentMessages,
    setLanguage,
    toggleLanguage,
  };
});
