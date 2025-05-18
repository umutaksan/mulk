import React from 'react';
import { BarChart4 } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';

const Header: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-6 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart4 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">L&D GUEST MANAGEMENT</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;