import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="homepage">
            <div className="hero-section">
                <div className="animated-background">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                </div>

                <div className="content">
                    <h1 className="title">
                        <span className="gradient-text">Study Game</span>
                    </h1>
                    <p className="subtitle">
                        Transform your study materials into interactive exams
                    </p>
                    <p className="description">
                        Upload your PDFs and practice with AI-generated questions.
                        Gamified learning made easy!
                    </p>

                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/create')}
                        >
                            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Exam
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/take')}
                        >
                            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Take an Exam
                        </button>
                    </div>

                    <div className="features">
                        <div className="feature-card">
                            <div className="feature-icon">📚</div>
                            <h3>PDF Upload</h3>
                            <p>Upload digital or handwritten notes - we handle both!</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>Smart Questions</h3>
                            <p>AI generates relevant questions from your content</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎮</div>
                            <h3>Gamification</h3>
                            <p>Earn points, streaks, and track your progress</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">✨</div>
                            <h3>Forgiving</h3>
                            <p>Smart grading ignores minor spelling mistakes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
