
import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

type LanguageOption = {
  value: Language;
  flag: string;
};

const languages: LanguageOption[] = [
  { value: 'en', flag: '🇬🇧' },
  { value: 'de', flag: '🇩🇪' },
];

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  // Get the other language that is not currently active
  const otherLanguage = languages.find(lang => lang.value !== language);

  if (!otherLanguage) return null;

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="hover:bg-black/5"
      onClick={() => setLanguage(otherLanguage.value)}
      aria-label={`Switch to ${otherLanguage.value}`}
    >
      <span className="text-lg">{otherLanguage.flag}</span>
    </Button>
  );
};

export default LanguageSelector;
