import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUILanguages } from '../utils/translations';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const languages = getUILanguages();

    return (
        <div className="language-switcher">
            <div className="language-toggle">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        className={`lang-btn ${language === lang.code ? 'active' : ''}`}
                        onClick={() => setLanguage(lang.code)}
                        title={lang.name}
                    >
                        <span className="flag">{lang.flag}</span>
                        <span className="lang-code">{lang.code.toUpperCase()}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
