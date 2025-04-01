
import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

type LanguageOption = {
  value: Language;
  flag: string;
  name: string;
};

const languages: LanguageOption[] = [
  { value: 'en', flag: '🇬🇧', name: 'English' },
  { value: 'de', flag: '🇩🇪', name: 'Deutsch' },
];

interface LanguageSelectorProps {
  variant?: 'ghost' | 'default';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'ghost' }) => {
  const { language, setLanguage } = useLanguage();
  
  // Get the other language that is not currently active
  const otherLanguage = languages.find(lang => lang.value !== language);

  if (!otherLanguage) return null;

  return (
    <Button 
      variant={variant}
      size="icon" 
      className="hover:bg-black/5"
      onClick={() => setLanguage(otherLanguage.value)}
      aria-label={`Switch to ${otherLanguage.name}`}
    >
      <span className="text-lg">{otherLanguage.flag}</span>
    </Button>
  );
};

export default LanguageSelector;
