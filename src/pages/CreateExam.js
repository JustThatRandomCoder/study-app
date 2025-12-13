import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { extractTextFromPDF as extractTextTesseract } from '../utils/pdfProcessor';
import { extractTextFromPDF as extractTextOCRSpace } from '../utils/pdfProcessorOCRSpace';
import { generateQuestions } from '../utils/questionGenerator';
import { saveExam } from '../utils/storage';
import '../styles/CreateExam.css';

function CreateExam() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [step, setStep] = useState(1); // 1: upload, 2: configure, 3: processing, 4: success
    const [file, setFile] = useState(null);
    const [examName, setExamName] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [ocrLanguage, setOcrLanguage] = useState('eng'); // OCR language (separate from UI language)
    const [ocrEngine, setOcrEngine] = useState('ocrspace'); // 'tesseract' or 'ocrspace'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [processingMessage, setProcessingMessage] = useState('');

    // Supported languages for OCR
    const ocrLanguages = [
        { code: 'eng', name: 'English', flag: '🇬🇧' },
        { code: 'deu', name: 'Deutsch (German)', flag: '🇩🇪' },
        { code: 'fra', name: 'Français (French)', flag: '🇫🇷' },
        { code: 'spa', name: 'Español (Spanish)', flag: '🇪🇸' },
        { code: 'ita', name: 'Italiano (Italian)', flag: '🇮🇹' },
        { code: 'por', name: 'Português (Portuguese)', flag: '🇵🇹' },
        { code: 'nld', name: 'Nederlands (Dutch)', flag: '🇳🇱' },
        { code: 'pol', name: 'Polski (Polish)', flag: '🇵🇱' },
        { code: 'rus', name: 'Русский (Russian)', flag: '🇷🇺' },
        { code: 'chi_sim', name: '简体中文 (Chinese Simplified)', flag: '🇨🇳' },
        { code: 'jpn', name: '日本語 (Japanese)', flag: '🇯🇵' },
        { code: 'kor', name: '한국어 (Korean)', flag: '🇰🇷' },
    ];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError(t('createExam.errors.invalidFile'));
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError(t('createExam.errors.fileSize'));
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
        setProcessingMessage(t('createExam.processing.analyzingPDF'));

        try {
            // Select OCR engine based on user choice
            const extractTextFromPDF = ocrEngine === 'ocrspace' ? extractTextOCRSpace : extractTextTesseract;

            // Extract text from PDF with progress callback and selected language
            const text = await extractTextFromPDF(file, (progressInfo) => {
                if (progressInfo.status === 'detected-scanned') {
                    setProcessingMessage(t('createExam.processing.detectedScanned'));
                    setProgress(20);
                } else if (progressInfo.status === 'ocr') {
                    setProcessingMessage(`${t('createExam.processing.readingPage')} ${progressInfo.page}/${progressInfo.totalPages} (OCR: ${progressInfo.ocrProgress}%)`);
                    setProgress(20 + Math.round(progressInfo.percentage * 0.4));
                } else if (progressInfo.status === 'extracting') {
                    setProcessingMessage(`${t('createExam.processing.extractingText')} ${progressInfo.page}/${progressInfo.totalPages}`);
                    setProgress(20 + Math.round(progressInfo.percentage * 0.4));
                } else if (progressInfo.status === 'processing') {
                    setProcessingMessage(`${t('createExam.processing.processingPage')} ${progressInfo.page}/${progressInfo.totalPages}`);
                    setProgress(20 + Math.round(progressInfo.percentage * 0.4));
                }
            }, ocrLanguage);

            if (!text || text.length < 100) {
                throw new Error(t('createExam.errors.extractionFailed'));
            }

            // Generate questions
            setProgress(70);
            setProcessingMessage(t('createExam.processing.generatingQuestions'));
            const questions = generateQuestions(text, numQuestions);

            if (questions.length === 0) {
                throw new Error(t('createExam.errors.noQuestions'));
            }

            // Create exam object
            setProgress(90);
            setProcessingMessage(t('createExam.processing.savingExam'));
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
                <div className="header-row">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('common.backToHome')}
                    </button>
                    <LanguageSwitcher />
                </div>

                {/* Step 1: Upload PDF */}
                {step === 1 && (
                    <div className="step-content animate-in">
                        <h1 className="page-title">{t('createExam.title')}</h1>
                        <p className="page-subtitle">{t('createExam.subtitle')}</p>

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
                                        <p className="upload-text">{t('createExam.upload.clickToUpload')}</p>
                                        <p className="upload-hint">{t('createExam.upload.hint')}</p>
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
                            {t('createExam.buttons.continue')}
                            <svg className="btn-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Step 2: Configure */}
                {step === 2 && (
                    <div className="step-content animate-in">
                        <h1 className="page-title">{t('createExam.configureTitle')}</h1>
                        <p className="page-subtitle">{t('createExam.configureSubtitle')}</p>

                        <div className="config-form">
                            <div className="form-group">
                                <label htmlFor="exam-name">{t('createExam.form.examName')}</label>
                                <input
                                    id="exam-name"
                                    type="text"
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    placeholder={t('createExam.form.examNamePlaceholder')}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="num-questions">
                                    {t('createExam.form.numQuestions')}: <span className="value-badge">{numQuestions}</span>
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

                            <div className="form-group">
                                <label htmlFor="ocr-engine">
                                    🔧 OCR Engine
                                </label>
                                <select
                                    id="ocr-engine"
                                    value={ocrEngine}
                                    onChange={(e) => setOcrEngine(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="ocrspace">OCR.space (Empfohlen für Handschrift 🌟)</option>
                                    <option value="tesseract">Tesseract (Lokal, schneller)</option>
                                </select>
                                <p className="form-hint">
                                    <strong>OCR.space:</strong> Bessere Handschrifterkennung, nutzt Cloud-API<br />
                                    <strong>Tesseract:</strong> Lokale Verarbeitung, gut für gedruckten Text
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="ocr-language">
                                    {t('createExam.form.documentLanguage')}
                                </label>
                                <select
                                    id="ocr-language"
                                    value={ocrLanguage}
                                    onChange={(e) => setOcrLanguage(e.target.value)}
                                    className="form-select"
                                >
                                    {ocrLanguages.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.flag} {lang.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="form-hint">
                                    {t('createExam.form.languageHint')}
                                </p>
                            </div>

                            <div className="info-box">
                                <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p style={{ marginBottom: '0.5rem' }}>{t('createExam.form.infoText')}</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t('createExam.form.ocrSupport')}</p>
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="button-group">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                {t('createExam.buttons.back')}
                            </button>
                            <button
                                className={`btn btn-primary ${!examName ? 'disabled' : ''}`}
                                onClick={handleCreateExam}
                                disabled={!examName || loading}
                            >
                                {loading ? t('createExam.buttons.creating') : t('createExam.buttons.createExam')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Processing */}
                {step === 3 && (
                    <div className="step-content animate-in">
                        <div className="processing-section">
                            <div className="spinner"></div>
                            <h2 className="processing-title">{t('createExam.processing.title')}</h2>
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
                                    <p>{t('createExam.processing.ocrNotice')}</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                                        {t('createExam.processing.ocrTip')}
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
                            <h2 className="success-title">{t('createExam.success.title')}</h2>
                            <p className="success-subtitle">{t('createExam.success.subtitle')}</p>

                            <div className="exam-summary">
                                <div className="summary-item">
                                    <span className="summary-label">{t('createExam.success.examName')}</span>
                                    <span className="summary-value">{examName}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">{t('createExam.success.questions')}</span>
                                    <span className="summary-value">{numQuestions}</span>
                                </div>
                            </div>

                            <div className="button-group">
                                <button className="btn btn-secondary" onClick={handleCreateAnother}>
                                    {t('createExam.success.createAnother')}
                                </button>
                                <button className="btn btn-primary" onClick={handleStartExam}>
                                    {t('createExam.success.startExam')}
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
