import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/i18n/LanguageContext';
import { LocaleKey } from '@/i18n';

const LanguageSwitcher = () => {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 px-3 gap-2 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">
            {languages.find(l => l.code === language)?.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white border border-primary/20 shadow-xl rounded-xl p-2 z-50"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as LocaleKey)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              language === lang.code 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-primary/5'
            }`}
          >
            <span 
              className="font-medium"
              dir={lang.dir}
            >
              {lang.nativeName}
            </span>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
