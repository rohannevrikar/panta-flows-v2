
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/services/types';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  languages: Language[];
  translate: (key: string) => string;
};

// Simple translations (can be expanded later)
const translations: Record<Language, Record<string, string>> = {
  en: {
    'common.logout': 'Logout',
    'common.search': 'Search',
    'search.dialogTitle': 'Search',
    'search.placeholder': 'Type to search...',
    'search.noResults': 'No results found',
    'search.results': 'Results',
    'profile.title': 'Profile',
    'settings.title': 'Settings',
    'settings.logout': 'Logout',
    'settings.logoutSuccess': 'Logged out successfully',
    'settings.logoutError': 'Failed to logout',
    'settings.appearance': 'Appearance',
    'settings.clientTheme': 'Client Theme',
    'settings.language': 'Language',
    'settings.selectLanguage': 'Select Language',
    'settings.notifications': 'Notifications',
    'settings.emailNotifications': 'Email Notifications',
    'settings.emailNotificationsDesc': 'Receive notifications via email',
    'settings.pushNotifications': 'Push Notifications',
    'settings.pushNotificationsDesc': 'Receive push notifications',
    'settings.account': 'Account',
    'settings.aiSettings': 'AI Settings',
    'settings.apiKey': 'API Key',
    'settings.apiKeyDesc': 'Your API key for AI services',
    'settings.modelTemp': 'Model Temperature',
    'settings.modelTempDesc': 'Adjust the creativity of AI responses',
    'settings.languageDesc': 'Choose your preferred language',
    'settings.show': 'Show',
    'dashboard.conservative': 'Conservative',
    'dashboard.creative': 'Creative',
    'settings.subtitle': 'Manage your account settings'
  },
  de: {
    'common.logout': 'Abmelden',
    'common.search': 'Suche',
    'search.dialogTitle': 'Suche',
    'search.placeholder': 'Tippen zum Suchen...',
    'search.noResults': 'Keine Ergebnisse gefunden',
    'search.results': 'Ergebnisse',
    'profile.title': 'Profil',
    'settings.title': 'Einstellungen',
    'settings.logout': 'Abmelden',
    'settings.logoutSuccess': 'Erfolgreich abgemeldet',
    'settings.logoutError': 'Abmelden fehlgeschlagen',
    'settings.appearance': 'Erscheinungsbild',
    'settings.clientTheme': 'Client-Theme',
    'settings.language': 'Sprache',
    'settings.selectLanguage': 'Sprache auswählen',
    'settings.notifications': 'Benachrichtigungen',
    'settings.emailNotifications': 'E-Mail-Benachrichtigungen',
    'settings.emailNotificationsDesc': 'Benachrichtigungen per E-Mail erhalten',
    'settings.pushNotifications': 'Push-Benachrichtigungen',
    'settings.pushNotificationsDesc': 'Push-Benachrichtigungen erhalten',
    'settings.account': 'Konto',
    'settings.aiSettings': 'KI-Einstellungen',
    'settings.apiKey': 'API-Schlüssel',
    'settings.apiKeyDesc': 'Ihr API-Schlüssel für KI-Dienste',
    'settings.modelTemp': 'Modell-Temperatur',
    'settings.modelTempDesc': 'Kreativität der KI-Antworten anpassen',
    'settings.languageDesc': 'Wählen Sie Ihre bevorzugte Sprache',
    'settings.show': 'Anzeigen',
    'dashboard.conservative': 'Konservativ',
    'dashboard.creative': 'Kreativ',
    'settings.subtitle': 'Verwalten Sie Ihre Kontoeinstellungen'
  },
  fr: {
    'common.logout': 'Déconnexion',
    'common.search': 'Recherche',
    'search.dialogTitle': 'Recherche',
    'search.placeholder': 'Tapez pour rechercher...',
    'search.noResults': 'Aucun résultat trouvé',
    'search.results': 'Résultats',
    'profile.title': 'Profil',
    'settings.title': 'Paramètres',
    'settings.logout': 'Déconnexion',
    'settings.logoutSuccess': 'Déconnexion réussie',
    'settings.logoutError': 'Échec de la déconnexion',
    'settings.appearance': 'Apparence',
    'settings.clientTheme': 'Thème du client',
    'settings.language': 'Langue',
    'settings.selectLanguage': 'Sélectionner la langue',
    'settings.notifications': 'Notifications',
    'settings.emailNotifications': 'Notifications par e-mail',
    'settings.emailNotificationsDesc': 'Recevoir des notifications par e-mail',
    'settings.pushNotifications': 'Notifications push',
    'settings.pushNotificationsDesc': 'Recevoir des notifications push',
    'settings.account': 'Compte',
    'settings.aiSettings': 'Paramètres IA',
    'settings.apiKey': 'Clé API',
    'settings.apiKeyDesc': 'Votre clé API pour les services IA',
    'settings.modelTemp': 'Température du modèle',
    'settings.modelTempDesc': 'Ajuster la créativité des réponses IA',
    'settings.languageDesc': 'Choisissez votre langue préférée',
    'settings.show': 'Afficher',
    'dashboard.conservative': 'Conservateur',
    'dashboard.creative': 'Créatif',
    'settings.subtitle': 'Gérez les paramètres de votre compte'
  },
  es: {
    'common.logout': 'Cerrar sesión',
    'common.search': 'Buscar',
    'search.dialogTitle': 'Búsqueda',
    'search.placeholder': 'Escribe para buscar...',
    'search.noResults': 'No se encontraron resultados',
    'search.results': 'Resultados',
    'profile.title': 'Perfil',
    'settings.title': 'Configuración',
    'settings.logout': 'Cerrar sesión',
    'settings.logoutSuccess': 'Sesión cerrada correctamente',
    'settings.logoutError': 'Error al cerrar sesión',
    'settings.appearance': 'Apariencia',
    'settings.clientTheme': 'Tema del cliente',
    'settings.language': 'Idioma',
    'settings.selectLanguage': 'Seleccionar idioma',
    'settings.notifications': 'Notificaciones',
    'settings.emailNotifications': 'Notificaciones por correo',
    'settings.emailNotificationsDesc': 'Recibir notificaciones por correo',
    'settings.pushNotifications': 'Notificaciones push',
    'settings.pushNotificationsDesc': 'Recibir notificaciones push',
    'settings.account': 'Cuenta',
    'settings.aiSettings': 'Configuración de IA',
    'settings.apiKey': 'Clave API',
    'settings.apiKeyDesc': 'Tu clave API para servicios de IA',
    'settings.modelTemp': 'Temperatura del modelo',
    'settings.modelTempDesc': 'Ajustar la creatividad de las respuestas de IA',
    'settings.languageDesc': 'Elige tu idioma preferido',
    'settings.show': 'Mostrar',
    'dashboard.conservative': 'Conservador',
    'dashboard.creative': 'Creativo',
    'settings.subtitle': 'Administra la configuración de tu cuenta'
  }
};

const availableLanguages: Language[] = ['en', 'de', 'fr', 'es'];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('language') as Language) || 'en'
  );

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Translation function
  const translate = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language,
        setLanguage: handleSetLanguage,
        languages: availableLanguages,
        translate
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
