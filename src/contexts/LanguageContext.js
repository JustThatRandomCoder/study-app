import React, { createContext, useState, useContext, useEffect } from 'react';
import { t } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    // Get language from localStorage or default to 'en'
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('ui-language');
        return saved || 'en';
    });

    // Save language preference to localStorage
    useEffect(() => {
        localStorage.setItem('ui-language', language);
    }, [language]);

    // Translation function
    const translate = (key) => t(key, language);

    const value = {
        language,
        setLanguage,
        t: translate,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
