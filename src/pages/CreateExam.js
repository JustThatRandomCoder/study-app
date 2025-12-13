import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPDF } from '../utils/pdfProcessor';
import { generateQuestions } from '../utils/questionGenerator';
import { saveExam } from '../utils/storage';
import '../styles/CreateExam.css';

function CreateExam() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: upload, 2: configure, 3: processing, 4: success
    const [file, setFile] = useState(null);
    const [examName, setExamName] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [processingMessage, setProcessingMessage] = useState('Analyzing content...');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a PDF file');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must be less than 10MB');
                return;
            }
            setFile(selectedFile);
            setError('');
            setExamName(selectedFile.name.replace('.pdf', ''));
        }
    };

    const handleNext = () => {
        if (step === 1 && file) {
            setStep(2);
        }
    };

    const handleCreateExam = async () => {
        if (!file || !examName) return;

        setLoading(true);
        setError('');
        setStep(3);
        setProgress(10);
        setProcessingMessage('Analyzing PDF...');

        try {
            // Extract text from PDF with progress callback
            const text = await extractTextFromPDF(file, (progressInfo) => {
                if (progressInfo.status === 'detected-scanned') {
                    setProcessingMessage('📷 Scanned PDF detected! Using OCR...');
                    setProgress(20);
                } else if (progressInfo.status === 'ocr') {
                    setProcessingMessage(`🔍 Reading page ${progressInfo.page}/${progressInfo.totalPages} (OCR: ${progressInfo.ocrProgress}%)`);
                    setProgress(20 + Math.round(progressInfo.percentage * 0.4));
                } else if (progressInfo.status === 'extracting') {
                    setProcessingMessage(`📄 Extracting text from page ${progressInfo.page}/${progressInfo.totalPages}`);
                    setProgress(20 + Math.round(progressInfo.percentage * 0.4));
                } else if (progressInfo.status === 'processing') {
                    setProcessingMessage(`📖 Processing page ${progressInfo.page}/${progressInfo.totalPages}`);
                    setProgress(20 + Math.round(progressInfo.percentage * 0.4));
                }
            });

            if (!text || text.length < 100) {
                throw new Error('Could not extract enough text from PDF. Please ensure the PDF contains readable text or try a clearer scan.');
            }

            // Generate questions
            setProgress(70);
            setProcessingMessage('🤖 Generating questions...');
            const questions = generateQuestions(text, numQuestions);

            if (questions.length === 0) {
                throw new Error('Could not generate questions from the content. Please try a different PDF.');
            }

            // Create exam object
            setProgress(90);
            setProcessingMessage('💾 Saving exam...');
            const exam = {
                id: Date.now().toString(),
                name: examName,
                questions: questions,
                createdAt: new Date().toISOString(),
                totalQuestions: questions.length,
                totalPoints: questions.reduce((sum, q) => sum + q.points, 0)
            };

            // Save to local storage
            saveExam(exam);
            setProgress(100);

            setTimeout(() => {
                setStep(4);
                setLoading(false);
            }, 500);

        } catch (err) {
            console.error('Error creating exam:', err);
            setError(err.message || 'Failed to create exam. Please try again.');
            setLoading(false);
            setStep(2);
            setProgress(0);
        }
    };

    const handleStartExam = () => {
        navigate('/take');
    };

    const handleCreateAnother = () => {
        setStep(1);
        setFile(null);
        setExamName('');
        setNumQuestions(10);
        setProgress(0);
    };

    return (
        <div className="create-exam-page">
            <div className="background-decoration">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
            </div>

            <div className="create-exam-container">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </button>

                {/* Step 1: Upload PDF */}
                {step === 1 && (
                    <div className="step-content animate-in">
                        <h1 className="page-title">Create New Exam</h1>
                        <p className="page-subtitle">Upload your study materials as a PDF</p>

                        <div className="upload-section">
                            <div
                                className={`upload-box ${file ? 'has-file' : ''}`}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                {!file ? (
                                    <>
                                        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="upload-text">Click to upload or drag and drop</p>
                                        <p className="upload-hint">PDF files only (max 10MB)</p>
                                    </>
                                ) : (
                                    <>
                                        <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="file-name">{file.name}</p>
                                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                id="file-input"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            className={`btn btn-primary btn-large ${!file ? 'disabled' : ''}`}
                            onClick={handleNext}
                            disabled={!file}
                        >
                            Continue
                            <svg className="btn-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Step 2: Configure */}
                {step === 2 && (
                    <div className="step-content animate-in">
                        <h1 className="page-title">Configure Your Exam</h1>
                        <p className="page-subtitle">Customize your exam settings</p>

                        <div className="config-form">
                            <div className="form-group">
                                <label htmlFor="exam-name">Exam Name</label>
                                <input
                                    id="exam-name"
                                    type="text"
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    placeholder="e.g., Biology Chapter 5"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="num-questions">
                                    Number of Questions: <span className="value-badge">{numQuestions}</span>
                                </label>
                                <input
                                    id="num-questions"
                                    type="range"
                                    min="5"
                                    max="20"
                                    value={numQuestions}
                                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                    className="form-range"
                                />
                                <div className="range-labels">
                                    <span>5</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <div className="info-box">
                                <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p style={{ marginBottom: '0.5rem' }}>The app will automatically generate various question types including fill-in-the-blank, multiple choice, and true/false questions.</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>✨ <strong>New:</strong> Now supports handwritten and scanned PDFs using OCR technology!</p>
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="button-group">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                Back
                            </button>
                            <button
                                className={`btn btn-primary ${!examName ? 'disabled' : ''}`}
                                onClick={handleCreateExam}
                                disabled={!examName || loading}
                            >
                                {loading ? 'Creating...' : 'Create Exam'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Processing */}
                {step === 3 && (
                    <div className="step-content animate-in">
                        <div className="processing-section">
                            <div className="spinner"></div>
                            <h2 className="processing-title">Creating Your Exam...</h2>
                            <p className="processing-subtitle">{processingMessage}</p>

                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="progress-text">{progress}%</p>

                            {processingMessage.includes('OCR') && (
                                <div className="ocr-notice">
                                    <p>⏱️ OCR processing may take 1-2 minutes per page</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                                        Tip: For faster results, use text-based PDFs instead of scans
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="step-content animate-in">
                        <div className="success-section">
                            <div className="success-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="success-title">Exam Created Successfully!</h2>
                            <p className="success-subtitle">Your exam is ready to go</p>

                            <div className="exam-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Exam Name:</span>
                                    <span className="summary-value">{examName}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Questions:</span>
                                    <span className="summary-value">{numQuestions}</span>
                                </div>
                            </div>

                            <div className="button-group">
                                <button className="btn btn-secondary" onClick={handleCreateAnother}>
                                    Create Another
                                </button>
                                <button className="btn btn-primary" onClick={handleStartExam}>
                                    Start Exam
                                    <svg className="btn-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateExam;
