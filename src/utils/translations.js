// Translation system for Study Game App
// Supports English and German

export const translations = {
    en: {
        // Common
        common: {
            backToHome: 'Back to Home',
            back: 'Back',
            continue: 'Continue',
            create: 'Create',
            start: 'Start',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
        },

        // Home Page
        home: {
            title: 'Study Game',
            subtitle: 'Transform your study materials into interactive exams',
            description: 'Upload your PDFs and practice with AI-generated questions. Gamified learning made easy!',
            createExam: 'Create New Exam',
            takeExam: 'Take an Exam',
            features: {
                pdfUpload: {
                    title: 'PDF Upload',
                    description: 'Upload digital or handwritten notes - we handle both!',
                },
                smartQuestions: {
                    title: 'Smart Questions',
                    description: 'AI generates relevant questions from your content',
                },
                gamification: {
                    title: 'Gamification',
                    description: 'Earn points, streaks, and track your progress',
                },
                forgiving: {
                    title: 'Forgiving',
                    description: 'Smart grading ignores minor spelling mistakes',
                },
            },
        },

        // Create Exam Page
        createExam: {
            title: 'Create New Exam',
            subtitle: 'Upload your study materials as a PDF',
            configureTitle: 'Configure Your Exam',
            configureSubtitle: 'Customize your exam settings',

            upload: {
                clickToUpload: 'Click to upload or drag and drop',
                hint: 'PDF files only (max 10MB)',
                fileName: 'Selected file',
            },

            form: {
                examName: 'Exam Name',
                examNamePlaceholder: 'e.g., Biology Chapter 5',
                numQuestions: 'Number of Questions',
                documentLanguage: '📚 Document Language (for OCR)',
                languageHint: 'Select the language of your PDF content. This helps with handwritten/scanned documents.',
                infoText: 'The app will automatically generate various question types including fill-in-the-blank, multiple choice, and true/false questions.',
                ocrSupport: '✨ New: Now supports handwritten and scanned PDFs using OCR technology!',
            },

            processing: {
                title: 'Creating Your Exam...',
                analyzingPDF: 'Analyzing PDF...',
                detectedScanned: '📷 Scanned PDF detected! Using OCR',
                readingPage: '🔍 Reading page',
                extractingText: '📄 Extracting text from page',
                processingPage: '📖 Processing page',
                generatingQuestions: '🤖 Generating questions...',
                savingExam: '💾 Saving exam...',
                ocrNotice: '⏱️ OCR processing may take 1-2 minutes per page',
                ocrTip: 'Tip: For faster results, use text-based PDFs instead of scans',
            },

            success: {
                title: 'Exam Created Successfully!',
                subtitle: 'Your exam is ready to go',
                examName: 'Exam Name:',
                questions: 'Questions:',
                createAnother: 'Create Another',
                startExam: 'Start Exam',
            },

            errors: {
                invalidFile: 'Please upload a PDF file',
                fileSize: 'File size must be less than 10MB',
                extractionFailed: 'Could not extract enough text from PDF. Please ensure the PDF contains readable text or try a clearer scan.',
                noQuestions: 'Could not generate questions from the content. Please try a different PDF.',
            },

            buttons: {
                continue: 'Continue',
                back: 'Back',
                createExam: 'Create Exam',
                creating: 'Creating...',
            },
        },

        // Take Exam Page
        takeExam: {
            selectTitle: 'Select an Exam',
            selectSubtitle: 'Choose an exam to start practicing',

            empty: {
                title: 'No Exams Available',
                description: 'Create an exam first to start practicing',
                createButton: 'Create Your First Exam',
            },

            examCard: {
                questions: 'Questions',
                points: 'Points',
                created: 'Created',
                startButton: 'Start Exam',
            },

            deleteExam: 'Delete exam',
            confirmDelete: 'Are you sure you want to delete this exam?',

            exam: {
                question: 'Question',
                of: 'of',
                points: 'pts',
                streak: 'streak',
                submitAnswer: 'Submit Answer',
                skipQuestion: 'Skip Question',
                typePlaceholder: 'Type your answer...',
                trueFalse: {
                    true: '✓ True',
                    false: '✗ False',
                },
            },

            feedback: {
                correct: 'Correct!',
                incorrect: 'Incorrect',
                correctAnswer: 'The correct answer was:',
                pointsEarned: 'points!',
                noPoints: 'No points earned',
            },

            results: {
                congratulations: 'Congratulations!',
                keepPracticing: 'Keep Practicing!',
                passed: 'You passed the exam!',
                tryAgain: 'You can do better next time!',
                correctAnswers: 'Correct Answers',
                score: 'Score',
                pointsEarned: 'Points Earned',
                chooseAnother: 'Choose Another Exam',
                retake: 'Retake Exam',
            },

            questionTypes: {
                'fill-in-blank': 'Fill in the blank',
                'multiple-choice': 'Multiple choice',
                'true-false': 'True/False',
                'short-answer': 'Short answer',
            },
        },

        // Languages
        languages: {
            eng: 'English',
            deu: 'Deutsch (German)',
            fra: 'Français (French)',
            spa: 'Español (Spanish)',
            ita: 'Italiano (Italian)',
            por: 'Português (Portuguese)',
            nld: 'Nederlands (Dutch)',
            pol: 'Polski (Polish)',
            rus: 'Русский (Russian)',
            chi_sim: '简体中文 (Chinese Simplified)',
            jpn: '日本語 (Japanese)',
            kor: '한국어 (Korean)',
        },
    },

    de: {
        // Common
        common: {
            backToHome: 'Zurück zur Startseite',
            back: 'Zurück',
            continue: 'Weiter',
            create: 'Erstellen',
            start: 'Start',
            loading: 'Lädt...',
            error: 'Fehler',
            success: 'Erfolg',
            cancel: 'Abbrechen',
            save: 'Speichern',
            delete: 'Löschen',
        },

        // Home Page
        home: {
            title: 'Lern-Spiel',
            subtitle: 'Verwandle deine Lernmaterialien in interaktive Prüfungen',
            description: 'Lade deine PDFs hoch und übe mit KI-generierten Fragen. Spielerisches Lernen leicht gemacht!',
            createExam: 'Neue Prüfung erstellen',
            takeExam: 'Prüfung ablegen',
            features: {
                pdfUpload: {
                    title: 'PDF-Upload',
                    description: 'Lade digitale oder handgeschriebene Notizen hoch - wir verarbeiten beides!',
                },
                smartQuestions: {
                    title: 'Intelligente Fragen',
                    description: 'KI generiert relevante Fragen aus deinem Inhalt',
                },
                gamification: {
                    title: 'Spielifizierung',
                    description: 'Verdiene Punkte, Streaks und verfolge deinen Fortschritt',
                },
                forgiving: {
                    title: 'Nachsichtig',
                    description: 'Intelligente Bewertung ignoriert kleine Rechtschreibfehler',
                },
            },
        },

        // Create Exam Page
        createExam: {
            title: 'Neue Prüfung erstellen',
            subtitle: 'Lade deine Lernmaterialien als PDF hoch',
            configureTitle: 'Konfiguriere deine Prüfung',
            configureSubtitle: 'Passe deine Prüfungseinstellungen an',

            upload: {
                clickToUpload: 'Klicken zum Hochladen oder Datei hierher ziehen',
                hint: 'Nur PDF-Dateien (max 10MB)',
                fileName: 'Ausgewählte Datei',
            },

            form: {
                examName: 'Prüfungsname',
                examNamePlaceholder: 'z.B. Biologie Kapitel 5',
                numQuestions: 'Anzahl der Fragen',
                documentLanguage: '📚 Dokumentsprache (für OCR)',
                languageHint: 'Wähle die Sprache deines PDF-Inhalts. Dies hilft bei handgeschriebenen/gescannten Dokumenten.',
                infoText: 'Die App generiert automatisch verschiedene Fragetypen einschließlich Lückentexten, Multiple Choice und Richtig/Falsch-Fragen.',
                ocrSupport: '✨ Neu: Unterstützt jetzt handgeschriebene und gescannte PDFs mit OCR-Technologie!',
            },

            processing: {
                title: 'Erstelle deine Prüfung...',
                analyzingPDF: 'Analysiere PDF...',
                detectedScanned: '📷 Gescanntes PDF erkannt! Verwende OCR',
                readingPage: '🔍 Lese Seite',
                extractingText: '📄 Extrahiere Text von Seite',
                processingPage: '📖 Verarbeite Seite',
                generatingQuestions: '🤖 Generiere Fragen...',
                savingExam: '💾 Speichere Prüfung...',
                ocrNotice: '⏱️ OCR-Verarbeitung kann 1-2 Minuten pro Seite dauern',
                ocrTip: 'Tipp: Für schnellere Ergebnisse verwende text-basierte PDFs statt Scans',
            },

            success: {
                title: 'Prüfung erfolgreich erstellt!',
                subtitle: 'Deine Prüfung ist bereit',
                examName: 'Prüfungsname:',
                questions: 'Fragen:',
                createAnother: 'Weitere erstellen',
                startExam: 'Prüfung starten',
            },

            errors: {
                invalidFile: 'Bitte lade eine PDF-Datei hoch',
                fileSize: 'Dateigröße muss kleiner als 10MB sein',
                extractionFailed: 'Konnte nicht genug Text aus dem PDF extrahieren. Bitte stelle sicher, dass das PDF lesbaren Text enthält oder versuche einen klareren Scan.',
                noQuestions: 'Konnte keine Fragen aus dem Inhalt generieren. Bitte versuche ein anderes PDF.',
            },

            buttons: {
                continue: 'Weiter',
                back: 'Zurück',
                createExam: 'Prüfung erstellen',
                creating: 'Erstelle...',
            },
        },

        // Take Exam Page
        takeExam: {
            selectTitle: 'Wähle eine Prüfung',
            selectSubtitle: 'Wähle eine Prüfung zum Üben aus',

            empty: {
                title: 'Keine Prüfungen verfügbar',
                description: 'Erstelle zuerst eine Prüfung um zu üben',
                createButton: 'Erstelle deine erste Prüfung',
            },

            examCard: {
                questions: 'Fragen',
                points: 'Punkte',
                created: 'Erstellt',
                startButton: 'Prüfung starten',
            },

            deleteExam: 'Prüfung löschen',
            confirmDelete: 'Bist du sicher, dass du diese Prüfung löschen möchtest?',

            exam: {
                question: 'Frage',
                of: 'von',
                points: 'Pkt',
                streak: 'Serie',
                submitAnswer: 'Antwort absenden',
                skipQuestion: 'Frage überspringen',
                typePlaceholder: 'Gib deine Antwort ein...',
                trueFalse: {
                    true: '✓ Richtig',
                    false: '✗ Falsch',
                },
            },

            feedback: {
                correct: 'Richtig!',
                incorrect: 'Falsch',
                correctAnswer: 'Die richtige Antwort war:',
                pointsEarned: 'Punkte!',
                noPoints: 'Keine Punkte verdient',
            },

            results: {
                congratulations: 'Glückwunsch!',
                keepPracticing: 'Weiter üben!',
                passed: 'Du hast die Prüfung bestanden!',
                tryAgain: 'Du kannst es beim nächsten Mal besser machen!',
                correctAnswers: 'Richtige Antworten',
                score: 'Punktzahl',
                pointsEarned: 'Verdiente Punkte',
                chooseAnother: 'Andere Prüfung wählen',
                retake: 'Prüfung wiederholen',
            },

            questionTypes: {
                'fill-in-blank': 'Lückentext',
                'multiple-choice': 'Multiple Choice',
                'true-false': 'Richtig/Falsch',
                'short-answer': 'Kurzantwort',
            },
        },

        // Languages
        languages: {
            eng: 'English',
            deu: 'Deutsch (German)',
            fra: 'Français (French)',
            spa: 'Español (Spanish)',
            ita: 'Italiano (Italian)',
            por: 'Português (Portuguese)',
            nld: 'Nederlands (Dutch)',
            pol: 'Polski (Polish)',
            rus: 'Русский (Russian)',
            chi_sim: '简体中文 (Chinese Simplified)',
            jpn: '日本語 (Japanese)',
            kor: '한국어 (Korean)',
        },
    },
};

// Helper function to get translated text
export const t = (key, lang = 'en') => {
    const keys = key.split('.');
    let value = translations[lang];

    for (const k of keys) {
        value = value?.[k];
    }

    return value || key;
};

// Get all available UI languages
export const getUILanguages = () => [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];
