import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../styles/HomePage.css';

function HomePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="homepage">
            <div className="hero-section">
                <div className="animated-background">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                </div>

                <div className="language-switcher-container">
                    <LanguageSwitcher />
                </div>

                <div className="content">
                    <h1 className="title">
                        <span className="gradient-text">{t('home.title')}</span>
                    </h1>
                    <p className="subtitle">
                        {t('home.subtitle')}
                    </p>
                    <p className="description">
                        {t('home.description')}
                    </p>

                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/create')}
                        >
                            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('home.createExam')}
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/take')}
                        >
                            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {t('home.takeExam')}
                        </button>
                    </div>

                    <div className="features">
                        <div className="feature-card">
                            <div className="feature-icon">📚</div>
                            <h3>{t('home.features.pdfUpload.title')}</h3>
                            <p>{t('home.features.pdfUpload.description')}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>{t('home.features.smartQuestions.title')}</h3>
                            <p>{t('home.features.smartQuestions.description')}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎮</div>
                            <h3>{t('home.features.gamification.title')}</h3>
                            <p>{t('home.features.gamification.description')}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">✨</div>
                            <h3>{t('home.features.forgiving.title')}</h3>
                            <p>{t('home.features.forgiving.description')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
