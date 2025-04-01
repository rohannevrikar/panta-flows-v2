
import { apiRequest } from "./api";
import { Language } from "@/contexts/LanguageContext";

export interface TranslationEntry {
  key: string;
  en: string;
  de: string;
}

export const languageService = {
  getTranslations: () => {
    return apiRequest("/translations");
  },
  
  updateTranslation: (key: string, values: { [key in Language]: string }) => {
    return apiRequest(`/translations/${key}`, "PUT", values);
  },
  
  addTranslation: (entry: TranslationEntry) => {
    return apiRequest("/translations", "POST", entry);
  },
  
  getUserLanguage: async (): Promise<Language> => {
    try {
      const response = await apiRequest("/user/settings/language");
      return response.language;
    } catch (error) {
      console.error("Failed to get user language preference:", error);
      // Fallback to browser language or default
      const browserLang = navigator.language.split('-')[0];
      return (browserLang === 'de' ? 'de' : 'en') as Language;
    }
  },
  
  setUserLanguage: (language: Language) => {
    return apiRequest("/user/settings/language", "PUT", { language });
  }
};
