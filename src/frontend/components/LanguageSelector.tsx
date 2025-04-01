
import React from 'react';
import { useLanguage } from '@/frontend/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/components/ui/select';

export interface Language {
  code: string;
  name: string;
  flag?: string;
}

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  
  const handleLanguageChange = (value: string) => {
    // Find the language object that matches the selected code
    const selectedLanguage = availableLanguages.find(lang => lang.code === value);
    if (selectedLanguage) {
      changeLanguage(selectedLanguage);
    }
  };

  return (
    <Select value={language?.code || 'en'} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language">
          {language?.flag && <span className="mr-2">{language.flag}</span>}
          {language?.name || 'English'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.flag && <span className="mr-2">{lang.flag}</span>}
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
