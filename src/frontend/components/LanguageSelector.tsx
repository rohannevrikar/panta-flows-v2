
import React from "react";
import { useLanguage } from "@/frontend/contexts/LanguageContext";
import { Check } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { Language } from "@/services/types";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  // Available languages
  const availableLanguages: Language[] = ["en", "de", "fr", "es"];

  // Map language codes to display names and flags
  const languageInfo = {
    en: { name: "English", flag: "🇺🇸" },
    de: { name: "Deutsch", flag: "🇩🇪" },
    fr: { name: "Français", flag: "🇫🇷" },
    es: { name: "Español", flag: "🇪🇸" }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 px-0">
          {languageInfo[language as keyof typeof languageInfo]?.flag || "🌐"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            className="cursor-pointer flex items-center justify-between"
            onClick={() => handleLanguageChange(lang)}
          >
            <span>
              {languageInfo[lang as keyof typeof languageInfo]?.flag || "🌐"} {" "}
              {languageInfo[lang as keyof typeof languageInfo]?.name || lang}
            </span>
            {language === lang && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
