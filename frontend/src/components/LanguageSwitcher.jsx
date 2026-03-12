import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => changeLanguage('fr')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === 'fr'
              ? 'bg-white text-[#004aad] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          FR
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === 'en'
              ? 'bg-white text-[#004aad] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
