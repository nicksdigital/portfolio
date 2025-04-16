'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 text-luxury-silver hover:text-luxury-accent transition-colors"
        aria-label={t('language')}
      >
        <Globe size={18} />
        <span>{locale === 'en' ? 'English' : 'Français'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-luxury-dark border border-gray-800 rounded-md shadow-lg z-50">
          <ul className="py-1">
            <li>
              <button
                onClick={() => changeLocale('en')}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-800 ${
                  locale === 'en' ? 'text-luxury-accent' : 'text-white'
                }`}
              >
                English
              </button>
            </li>
            <li>
              <button
                onClick={() => changeLocale('fr')}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-800 ${
                  locale === 'fr' ? 'text-luxury-accent' : 'text-white'
                }`}
              >
                Français
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
