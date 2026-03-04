import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
];

interface LanguageSwitcherProps {
    position?: 'up' | 'down';
    className?: string;
    variant?: 'light' | 'dark' | 'transparent';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    position = 'up',
    className = '',
    variant = 'transparent'
}) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const changeLanguage = (lngCode: string) => {
        i18n.changeLanguage(lngCode);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.addEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    const getVariantStyles = () => {
        switch (variant) {
            case 'light': return 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50';
            case 'dark': return 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700';
            case 'transparent': return 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-indigo-600';
            default: return '';
        }
    };

    const getDropdownVariantStyles = () => {
        switch (variant) {
            case 'dark': return 'bg-slate-800 border border-slate-700 text-white shadow-xl shadow-slate-900/50';
            default: return 'bg-white border border-gray-100 text-gray-800 shadow-xl';
        }
    };

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className={`inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${getVariantStyles()}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <FiGlobe className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline-block">{currentLang.label}</span>
                <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div
                    className={`absolute z-50 w-48 rounded-md ${getDropdownVariantStyles()} ring-1 ring-black ring-opacity-5 focus:outline-none ${position === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 sm:left-0 sm:right-auto`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="language-menu-button"
                >
                    <div className="py-1 max-h-60 overflow-y-auto" role="none">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${i18n.language === lang.code
                                        ? (variant === 'dark' ? 'bg-slate-700 text-indigo-300 font-semibold' : 'bg-indigo-50 text-indigo-700 font-semibold')
                                        : (variant === 'dark' ? 'text-gray-300 hover:bg-slate-700 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600')
                                    }`}
                                role="menuitem"
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
