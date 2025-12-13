import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams } from '../utils/storage';
import { validateAnswer } from '../utils/questionGenerator';
import { updateStatsAfterExam } from '../utils/storage';
import '../styles/TakeExam.css';

function TakeExam() {
    const navigate = useNavigate();
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

    if (exams.length === 0) {
        return (
            <div className="take-exam-page">
                <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h2>No Exams Available</h2>
                    <p>Create an exam first to start practicing</p>
                    <button className="btn btn-primary" onClick={() => navigate('/create')}>
                        Create Your First Exam
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedExam) {
        return (
            <div className="take-exam-page">
                <div className="background-decoration">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                </div>

                <div className="exam-selection-container">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </button>

                    <h1 className="page-title">Select an Exam</h1>
                    <p className="page-subtitle">Choose an exam to start practicing</p>

                    <div className="exams-grid">
                        {exams.map(exam => (
                            <div key={exam.id} className="exam-card" onClick={() => startExam(exam)}>
                                <div className="exam-card-header">
                                    <h3>{exam.name}</h3>
                                    <div className="exam-date">
                                        {new Date(exam.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="exam-card-body">
                                    <div className="exam-stat">
                                        <span className="stat-icon">📝</span>
                                        <span>{exam.totalQuestions} Questions</span>
                                    </div>
                                    <div className="exam-stat">
                                        <span className="stat-icon">⭐</span>
                                        <span>{exam.totalPoints} Points</span>
                                    </div>
                                </div>
                                <button className="start-exam-btn">
                                    Start Exam
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
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
                <div className="results-container animate-in">
                    <div className={`results-icon ${passed ? 'success' : 'fail'}`}>
                        {passed ? '🎉' : '📚'}
                    </div>

                    <h1 className="results-title">
                        {passed ? 'Congratulations!' : 'Keep Practicing!'}
                    </h1>

                    <p className="results-subtitle">
                        {passed ? 'You passed the exam!' : 'You can do better next time!'}
                    </p>

                    <div className="results-stats">
                        <div className="stat-card">
                            <div className="stat-value">{score}/{selectedExam.questions.length}</div>
                            <div className="stat-label">Correct Answers</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{percentage}%</div>
                            <div className="stat-label">Score</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{totalPoints}</div>
                            <div className="stat-label">Points Earned</div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button className="btn btn-secondary" onClick={handleBackToSelection}>
                            Choose Another Exam
                        </button>
                        <button className="btn btn-primary" onClick={handleRetake}>
                            Retake Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="take-exam-page">
            <div className="exam-container">
                {/* Header */}
                <div className="exam-header">
                    <div className="exam-info">
                        <h2 className="exam-name">{selectedExam.name}</h2>
                        <div className="progress-info">
                            Question {currentQuestionIndex + 1} of {selectedExam.questions.length}
                        </div>
                    </div>
                    <div className="exam-stats">
                        <div className="stat-item">
                            <span className="stat-icon">⭐</span>
                            <span className="stat-text">{totalPoints} pts</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">🔥</span>
                            <span className="stat-text">{streak} streak</span>
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
                        {currentQuestion.type.replace('-', ' ')}
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
                                        ✓ True
                                    </button>
                                    <button
                                        className="option-btn false-btn"
                                        onClick={() => handleAnswer('false')}
                                    >
                                        ✗ False
                                    </button>
                                </div>
                            )}

                            {(currentQuestion.type === 'fill-in-blank' || currentQuestion.type === 'short-answer') && (
                                <div className="text-answer-section">
                                    <input
                                        type="text"
                                        className="answer-input"
                                        placeholder="Type your answer..."
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
                                        Submit Answer
                                    </button>
                                </div>
                            )}

                            <button className="skip-btn" onClick={handleSkip}>
                                Skip Question
                            </button>
                        </div>
                    )}

                    {showResult && feedback && (
                        <div className={`feedback-section ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="feedback-icon">
                                {feedback.isCorrect ? '✓' : '✗'}
                            </div>
                            <div className="feedback-text">
                                <h4>{feedback.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                                {!feedback.isCorrect && (
                                    <p>The correct answer was: <strong>{feedback.correctAnswer}</strong></p>
                                )}
                                <p className="points-earned">
                                    {feedback.isCorrect ? `+${feedback.pointsEarned} points!` : 'No points earned'}
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
