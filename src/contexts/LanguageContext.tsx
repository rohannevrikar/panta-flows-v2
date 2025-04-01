
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'de';

// Define translation structure
export type Translations = {
  [key: string]: string;
};

// Define context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translate: (key) => key,
});

// Translation data for English and German
const translations: Record<Language, Translations> = {
  en: {
    // General
    'app.title': 'AI Assistant Dashboard',
    'app.settings': 'Settings',
    'app.history': 'History',
    'app.profile': 'Profile',
    'app.logout': 'Logout',
    'app.viewAll': 'View All',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.edit': 'Edit',
    'app.delete': 'Delete',
    
    // Dashboard
    'dashboard.workflows': 'Workflows',
    'dashboard.newWorkflow': 'New Workflow',
    'dashboard.all': 'All',
    'dashboard.recent': 'Recent',
    'dashboard.favorites': 'Favorites',
    'dashboard.workflowSettings': 'Workflow Settings',
    'dashboard.creativityLevel': 'Adjust the creativity level for your workflows',
    'dashboard.conservative': 'Conservative',
    'dashboard.creative': 'Creative',
    'dashboard.recentHistory': 'Recent History',
    
    // Workflow types
    'workflow.chatAssistant': 'Chat Assistant',
    'workflow.codeHelper': 'Code Helper',
    'workflow.imageCreator': 'Image Creator',
    'workflow.documentHelper': 'Document Helper',
    'workflow.videoGenerator': 'Video Generator',
    'workflow.musicComposer': 'Music Composer',
    'workflow.chatAssistantDesc': 'General purpose AI chat assistant',
    'workflow.codeHelperDesc': 'Generate and explain code',
    'workflow.imageCreatorDesc': 'Create images from text descriptions',
    'workflow.documentHelperDesc': 'Summarize and extract from documents',
    'workflow.videoGeneratorDesc': 'Create videos from text prompts',
    'workflow.musicComposerDesc': 'Generate music and audio',
    
    // Menu actions
    'menu.editWorkflow': 'Editing workflow',
    'menu.workflowSettings': 'Opening settings for',
    'menu.deleteWorkflow': 'Delete workflow',
    'menu.deleteConfirm': 'This action can\'t be undone.',
    'menu.undoDelete': 'Undo',
    'menu.deleteCancelled': 'Deletion cancelled',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account settings and preferences',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Receive notifications about your account activity',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Toggle between light and dark mode',
    'settings.twoFactor': 'Two-Factor Authentication',
    'settings.twoFactorDesc': 'Add an extra layer of security to your account',
    'settings.aiSettings': 'AI Settings',
    'settings.apiKey': 'API Key',
    'settings.apiKeyDesc': 'Your API key is used to authenticate requests to the AI service',
    'settings.modelTemp': 'Model Temperature',
    'settings.modelTempDesc': 'Adjust how creative the AI responses should be',
    'settings.language': 'Language',
    'settings.languageDesc': 'Select your preferred language',
    'settings.show': 'Show',
  },
  de: {
    // General
    'app.title': 'KI-Assistent Dashboard',
    'app.settings': 'Einstellungen',
    'app.history': 'Verlauf',
    'app.profile': 'Profil',
    'app.logout': 'Abmelden',
    'app.viewAll': 'Alle anzeigen',
    'app.save': 'Speichern',
    'app.cancel': 'Abbrechen',
    'app.edit': 'Bearbeiten',
    'app.delete': 'Löschen',
    
    // Dashboard
    'dashboard.workflows': 'Arbeitsabläufe',
    'dashboard.newWorkflow': 'Neuer Arbeitsablauf',
    'dashboard.all': 'Alle',
    'dashboard.recent': 'Kürzlich',
    'dashboard.favorites': 'Favoriten',
    'dashboard.workflowSettings': 'Arbeitsablauf-Einstellungen',
    'dashboard.creativityLevel': 'Passen Sie die Kreativität für Ihre Arbeitsabläufe an',
    'dashboard.conservative': 'Konservativ',
    'dashboard.creative': 'Kreativ',
    'dashboard.recentHistory': 'Aktueller Verlauf',
    
    // Workflow types
    'workflow.chatAssistant': 'Chat-Assistent',
    'workflow.codeHelper': 'Code-Helfer',
    'workflow.imageCreator': 'Bild-Ersteller',
    'workflow.documentHelper': 'Dokument-Helfer',
    'workflow.videoGenerator': 'Video-Generator',
    'workflow.musicComposer': 'Musik-Komponist',
    'workflow.chatAssistantDesc': 'Allgemeiner KI-Chat-Assistent',
    'workflow.codeHelperDesc': 'Code generieren und erklären',
    'workflow.imageCreatorDesc': 'Bilder aus Textbeschreibungen erstellen',
    'workflow.documentHelperDesc': 'Dokumente zusammenfassen und extrahieren',
    'workflow.videoGeneratorDesc': 'Videos aus Textaufforderungen erstellen',
    'workflow.musicComposerDesc': 'Musik und Audio generieren',
    
    // Menu actions
    'menu.editWorkflow': 'Arbeitsablauf bearbeiten',
    'menu.workflowSettings': 'Einstellungen öffnen für',
    'menu.deleteWorkflow': 'Arbeitsablauf löschen',
    'menu.deleteConfirm': 'Diese Aktion kann nicht rückgängig gemacht werden.',
    'menu.undoDelete': 'Rückgängig',
    'menu.deleteCancelled': 'Löschen abgebrochen',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Verwalten Sie Ihre Kontoeinstellungen und Präferenzen',
    'settings.notifications': 'Benachrichtigungen',
    'settings.notificationsDesc': 'Erhalten Sie Benachrichtigungen über Ihre Kontoaktivitäten',
    'settings.darkMode': 'Dunkelmodus',
    'settings.darkModeDesc': 'Zwischen hellem und dunklem Modus wechseln',
    'settings.twoFactor': 'Zwei-Faktor-Authentifizierung',
    'settings.twoFactorDesc': 'Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu',
    'settings.aiSettings': 'KI-Einstellungen',
    'settings.apiKey': 'API-Schlüssel',
    'settings.apiKeyDesc': 'Ihr API-Schlüssel wird verwendet, um Anfragen an den KI-Dienst zu authentifizieren',
    'settings.modelTemp': 'Modell-Temperatur',
    'settings.modelTempDesc': 'Passen Sie an, wie kreativ die KI-Antworten sein sollen',
    'settings.language': 'Sprache',
    'settings.languageDesc': 'Wählen Sie Ihre bevorzugte Sprache',
    'settings.show': 'Anzeigen',
  }
};

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get saved language preference or default to browser language
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'de' ? 'de' : 'en') as Language;
  };

  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || getBrowserLanguage();
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const translate = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
