import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import VersionBadge from '../components/VersionBadge';
import { getExams, deleteExam } from '../utils/storage';
import { validateAnswer } from '../utils/questionGenerator';
import { updateStatsAfterExam } from '../utils/storage';
import '../styles/TakeExam.css';

function TakeExam() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [totalPoints, setTotalPoints] = useState(0);

    useEffect(() => {
        const savedExams = getExams();
        setExams(savedExams);
    }, []);

    const startExam = (exam) => {
        setSelectedExam(exam);
        setCurrentQuestionIndex(0);
        setScore(0);
        setStreak(0);
        setShowResult(false);
        setIsComplete(false);
        setFeedback(null);
        setTotalPoints(0);
    };

    const currentQuestion = selectedExam?.questions[currentQuestionIndex];

    const handleAnswer = (answer) => {
        if (!currentQuestion) return;

        // Validate answer
        let isCorrect = false;

        if (currentQuestion.type === 'true-false') {
            isCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        } else if (currentQuestion.type === 'multiple-choice') {
            isCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        } else {
            // Use fuzzy matching for fill-in-blank and short-answer
            const validation = validateAnswer(answer, currentQuestion.correctAnswer);
            isCorrect = validation.isCorrect;
        }

        // Update score and streak
        const pointsEarned = isCorrect ? currentQuestion.points : 0;
        setScore(prev => prev + (isCorrect ? 1 : 0));
        setTotalPoints(prev => prev + pointsEarned);
        setStreak(prev => isCorrect ? prev + 1 : 0);

        // Show feedback
        setFeedback({
            isCorrect,
            pointsEarned,
            correctAnswer: currentQuestion.correctAnswer
        });

        setShowResult(true);

        // Auto advance after delay
        setTimeout(() => {
            if (currentQuestionIndex < selectedExam.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setShowResult(false);
                setFeedback(null);
            } else {
                // Exam complete
                setIsComplete(true);
                updateStatsAfterExam(
                    selectedExam.questions.length,
                    score + (isCorrect ? 1 : 0),
                    totalPoints + pointsEarned
                );
            }
        }, 2000);
    };

    const handleSkip = () => {
        setStreak(0);
        if (currentQuestionIndex < selectedExam.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowResult(false);
            setFeedback(null);
        }
    };

    const handleRetake = () => {
        startExam(selectedExam);
    };

    const handleBackToSelection = () => {
        setSelectedExam(null);
        setIsComplete(false);
    };

    const handleDeleteExam = (examId, event) => {
        event.stopPropagation(); // Prevent starting the exam when clicking delete
        if (window.confirm(t('takeExam.confirmDelete') || 'Are you sure you want to delete this exam?')) {
            deleteExam(examId);
            const updatedExams = getExams();
            setExams(updatedExams);
        }
    };

    if (exams.length === 0) {
        return (
            <div className="take-exam-page">
                <VersionBadge />
                <div className="empty-state">
                    <div className="language-switcher-top-right">
                        <LanguageSwitcher />
                    </div>
                    <div className="empty-icon">📚</div>
                    <h2>{t('takeExam.empty.title')}</h2>
                    <p>{t('takeExam.empty.description')}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/create')}>
                        {t('takeExam.empty.createButton')}
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedExam) {
        return (
            <div className="take-exam-page">
                <VersionBadge />
                <div className="background-decoration">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                </div>

                <div className="exam-selection-container">
                    <div className="header-row">
                        <button className="back-btn" onClick={() => navigate('/')}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {t('common.backToHome')}
                        </button>
                        <LanguageSwitcher />
                    </div>

                    <h1 className="page-title">{t('takeExam.selectTitle')}</h1>
                    <p className="page-subtitle">{t('takeExam.selectSubtitle')}</p>

                    <div className="exams-grid">
                        {exams.map(exam => (
                            <div key={exam.id} className="exam-card">
                                <button
                                    className="delete-exam-btn"
                                    onClick={(e) => handleDeleteExam(exam.id, e)}
                                    title={t('takeExam.deleteExam') || 'Delete exam'}
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <div className="exam-card-content" onClick={() => startExam(exam)}>
                                    <div className="exam-card-header">
                                        <h3>{exam.name}</h3>
                                        <div className="exam-date">
                                            {new Date(exam.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="exam-card-body">
                                        <div className="exam-stat">
                                            <span className="stat-icon">📝</span>
                                            <span>{exam.totalQuestions} {t('takeExam.examCard.questions')}</span>
                                        </div>
                                        <div className="exam-stat">
                                            <span className="stat-icon">⭐</span>
                                            <span>{exam.totalPoints} {t('takeExam.examCard.points')}</span>
                                        </div>
                                    </div>
                                    <button className="start-exam-btn">
                                        {t('takeExam.examCard.startButton')}
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isComplete) {
        const percentage = Math.round((score / selectedExam.questions.length) * 100);
        const passed = percentage >= 60;

        return (
            <div className="take-exam-page">
                <VersionBadge />
                <div className="results-container animate-in">
                    <div className={`results-icon ${passed ? 'success' : 'fail'}`}>
                        {passed ? '🎉' : '📚'}
                    </div>

                    <h1 className="results-title">
                        {passed ? t('takeExam.results.congratulations') : t('takeExam.results.keepPracticing')}
                    </h1>

                    <p className="results-subtitle">
                        {passed ? t('takeExam.results.passed') : t('takeExam.results.tryAgain')}
                    </p>

                    <div className="results-stats">
                        <div className="stat-card">
                            <div className="stat-value">{score}/{selectedExam.questions.length}</div>
                            <div className="stat-label">{t('takeExam.results.correctAnswers')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{percentage}%</div>
                            <div className="stat-label">{t('takeExam.results.score')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{totalPoints}</div>
                            <div className="stat-label">{t('takeExam.results.pointsEarned')}</div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button className="btn btn-secondary" onClick={handleBackToSelection}>
                            {t('takeExam.results.chooseAnother')}
                        </button>
                        <button className="btn btn-primary" onClick={handleRetake}>
                            {t('takeExam.results.retake')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="take-exam-page">
            <VersionBadge />
            <div className="exam-container">
                {/* Header */}
                <div className="exam-header">
                    <div className="exam-info">
                        <h2 className="exam-name">{selectedExam.name}</h2>
                        <div className="progress-info">
                            {t('takeExam.exam.question')} {currentQuestionIndex + 1} {t('takeExam.exam.of')} {selectedExam.questions.length}
                        </div>
                    </div>
                    <div className="exam-stats">
                        <div className="stat-item">
                            <span className="stat-icon">⭐</span>
                            <span className="stat-text">{totalPoints} {t('takeExam.exam.points')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">🔥</span>
                            <span className="stat-text">{streak} {t('takeExam.exam.streak')}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${((currentQuestionIndex + 1) / selectedExam.questions.length) * 100}%`
                        }}
                    ></div>
                </div>

                {/* Question Card */}
                <div className="question-card animate-in">
                    <div className="question-type-badge">
                        {t(`takeExam.questionTypes.${currentQuestion.type}`)}
                    </div>

                    <h3 className="question-text">{currentQuestion.question}</h3>

                    {!showResult && (
                        <div className="answer-section">
                            {currentQuestion.type === 'multiple-choice' && (
                                <div className="options-grid">
                                    {currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            className="option-btn"
                                            onClick={() => handleAnswer(option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'true-false' && (
                                <div className="options-grid">
                                    <button
                                        className="option-btn true-btn"
                                        onClick={() => handleAnswer('true')}
                                    >
                                        {t('takeExam.exam.trueFalse.true')}
                                    </button>
                                    <button
                                        className="option-btn false-btn"
                                        onClick={() => handleAnswer('false')}
                                    >
                                        {t('takeExam.exam.trueFalse.false')}
                                    </button>
                                </div>
                            )}

                            {(currentQuestion.type === 'fill-in-blank' || currentQuestion.type === 'short-answer') && (
                                <div className="text-answer-section">
                                    <input
                                        type="text"
                                        className="answer-input"
                                        placeholder={t('takeExam.exam.typePlaceholder')}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                handleAnswer(e.target.value);
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        className="submit-btn"
                                        onClick={(e) => {
                                            const input = e.target.previousElementSibling;
                                            if (input.value.trim()) {
                                                handleAnswer(input.value);
                                            }
                                        }}
                                    >
                                        {t('takeExam.exam.submitAnswer')}
                                    </button>
                                </div>
                            )}

                            <button className="skip-btn" onClick={handleSkip}>
                                {t('takeExam.exam.skipQuestion')}
                            </button>
                        </div>
                    )}

                    {showResult && feedback && (
                        <div className={`feedback-section ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="feedback-icon">
                                {feedback.isCorrect ? '✓' : '✗'}
                            </div>
                            <div className="feedback-text">
                                <h4>{feedback.isCorrect ? t('takeExam.feedback.correct') : t('takeExam.feedback.incorrect')}</h4>
                                {!feedback.isCorrect && (
                                    <p>{t('takeExam.feedback.correctAnswer')} <strong>{feedback.correctAnswer}</strong></p>
                                )}
                                <p className="points-earned">
                                    {feedback.isCorrect ? `+${feedback.pointsEarned} ${t('takeExam.feedback.pointsEarned')}` : t('takeExam.feedback.noPoints')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TakeExam;
