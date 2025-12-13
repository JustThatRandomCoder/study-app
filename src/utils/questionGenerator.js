/**
 * Generate questions from extracted text
 * This uses pattern matching and NLP techniques to create various question types
 */

/**
 * Split text into sentences
 * @param {string} text - Text to split
 * @returns {Array<string>} - Array of sentences
 */
function splitIntoSentences(text) {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 20 && s.split(' ').length >= 4);
}

/**
 * Extract key terms from text (simple approach)
 * @param {string} text - Text to analyze
 * @returns {Array<string>} - Array of key terms
 */
function extractKeyTerms(text) {
    const commonWords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
        'is', 'are', 'was', 'were', 'been', 'has', 'had', 'can', 'could',
        'should', 'would', 'may', 'might', 'must', 'shall', 'will'
    ]);

    const words = text.toLowerCase()
        .split(/\s+/)
        .filter(word =>
            word.length > 3 &&
            !commonWords.has(word) &&
            /^[a-z]+$/.test(word)
        );

    // Count frequency
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top terms
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word]) => word);
}

/**
 * Generate fill-in-the-blank questions
 * @param {string} sentence - Sentence to create question from
 * @param {Array<string>} keyTerms - Key terms to focus on
 * @returns {Object|null} - Question object or null
 */
function generateFillInBlank(sentence, keyTerms) {
    const words = sentence.split(' ');

    // Find a key term in the sentence
    let targetWord = null;
    let targetIndex = -1;

    for (const term of keyTerms) {
        const index = words.findIndex(w =>
            w.toLowerCase().replace(/[^a-z]/g, '') === term
        );
        if (index !== -1) {
            targetWord = words[index];
            targetIndex = index;
            break;
        }
    }

    if (!targetWord || targetIndex === -1) {
        // Fallback: pick a longer word
        const longWords = words
            .map((word, index) => ({ word, index }))
            .filter(({ word }) => word.length > 4 && /^[a-zA-Z]+$/.test(word));

        if (longWords.length === 0) return null;

        const random = longWords[Math.floor(Math.random() * longWords.length)];
        targetWord = random.word;
        targetIndex = random.index;
    }

    // Create the question
    const questionWords = [...words];
    questionWords[targetIndex] = '_____';

    return {
        type: 'fill-in-blank',
        question: questionWords.join(' '),
        correctAnswer: targetWord.replace(/[^a-zA-Z]/g, ''),
        originalSentence: sentence
    };
}

/**
 * Generate true/false questions
 * @param {string} sentence - Sentence to base question on
 * @returns {Object} - Question object
 */
function generateTrueFalse(sentence) {
    // Randomly decide if we make it true or false
    const makeItFalse = Math.random() > 0.5;

    if (makeItFalse) {
        // Try to modify the sentence to make it false
        const words = sentence.split(' ');
        const modifiableWords = ['is', 'are', 'was', 'were', 'can', 'could', 'will', 'would'];

        let modified = false;
        for (let i = 0; i < words.length; i++) {
            if (modifiableWords.includes(words[i].toLowerCase())) {
                words[i] = words[i].toLowerCase() === 'is' ? 'is not' :
                    words[i].toLowerCase() === 'are' ? 'are not' :
                        words[i].toLowerCase() === 'was' ? 'was not' :
                            words[i].toLowerCase() === 'can' ? 'cannot' : words[i];
                modified = true;
                break;
            }
        }

        if (modified) {
            return {
                type: 'true-false',
                question: words.join(' '),
                correctAnswer: 'false',
                originalSentence: sentence
            };
        }
    }

    return {
        type: 'true-false',
        question: sentence,
        correctAnswer: 'true',
        originalSentence: sentence
    };
}

/**
 * Generate multiple choice questions
 * @param {string} sentence - Sentence to create question from
 * @param {Array<string>} keyTerms - Available terms for distractors
 * @returns {Object|null} - Question object or null
 */
function generateMultipleChoice(sentence, keyTerms) {
    const words = sentence.split(' ');

    // Find a key term
    let targetWord = null;
    let targetIndex = -1;

    for (const term of keyTerms) {
        const index = words.findIndex(w =>
            w.toLowerCase().replace(/[^a-z]/g, '') === term
        );
        if (index !== -1) {
            targetWord = words[index].replace(/[^a-zA-Z]/g, '');
            targetIndex = index;
            break;
        }
    }

    if (!targetWord) return null;

    // Create question
    const questionWords = [...words];
    questionWords[targetIndex] = '_____';

    // Generate distractors (other key terms)
    const distractors = keyTerms
        .filter(term => term !== targetWord.toLowerCase())
        .slice(0, 3)
        .map(term => term.charAt(0).toUpperCase() + term.slice(1));

    if (distractors.length < 2) return null;

    // Add correct answer and shuffle
    const options = [...distractors, targetWord]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    return {
        type: 'multiple-choice',
        question: questionWords.join(' '),
        options: options,
        correctAnswer: targetWord,
        originalSentence: sentence
    };
}

/**
 * Generate "What is" questions
 * @param {string} sentence - Sentence to create question from
 * @param {Array<string>} keyTerms - Key terms
 * @returns {Object|null} - Question object or null
 */
function generateWhatIsQuestion(sentence, keyTerms) {
    // Look for definition patterns: "X is Y", "X are Y", "X means Y"
    const patterns = [
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|means?)\s+(.+)/,
        /([A-Z][a-z]+)\s*:\s*(.+)/
    ];

    for (const pattern of patterns) {
        const match = sentence.match(pattern);
        if (match) {
            return {
                type: 'short-answer',
                question: `What is ${match[1]}?`,
                correctAnswer: match[2].replace(/[.!?]$/, ''),
                originalSentence: sentence
            };
        }
    }

    return null;
}

/**
 * Main function to generate questions from text
 * @param {string} text - Text content to generate questions from
 * @param {number} numQuestions - Desired number of questions (default: 10)
 * @returns {Array<Object>} - Array of question objects
 */
export function generateQuestions(text, numQuestions = 10) {
    if (!text || text.trim().length < 50) {
        throw new Error('Text is too short to generate questions');
    }

    const sentences = splitIntoSentences(text);
    const keyTerms = extractKeyTerms(text);

    if (sentences.length === 0) {
        throw new Error('Could not extract meaningful sentences from the text');
    }

    const questions = [];
    const questionTypes = [
        { fn: generateFillInBlank, weight: 3 },
        { fn: generateTrueFalse, weight: 2 },
        { fn: generateMultipleChoice, weight: 3 },
        { fn: generateWhatIsQuestion, weight: 2 }
    ];

    // Shuffle sentences
    const shuffledSentences = [...sentences].sort(() => Math.random() - 0.5);

    let attempts = 0;
    const maxAttempts = sentences.length * 2;

    while (questions.length < numQuestions && attempts < maxAttempts) {
        attempts++;

        const sentence = shuffledSentences[attempts % shuffledSentences.length];

        // Select a random question type based on weights
        const totalWeight = questionTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedType = questionTypes[0];

        for (const type of questionTypes) {
            random -= type.weight;
            if (random <= 0) {
                selectedType = type;
                break;
            }
        }

        try {
            const question = selectedType.fn === generateFillInBlank ||
                selectedType.fn === generateMultipleChoice ?
                selectedType.fn(sentence, keyTerms) :
                selectedType.fn === generateWhatIsQuestion ?
                    selectedType.fn(sentence, keyTerms) :
                    selectedType.fn(sentence);

            if (question && !questions.find(q => q.question === question.question)) {
                questions.push({
                    ...question,
                    id: questions.length + 1,
                    points: question.type === 'multiple-choice' ? 10 :
                        question.type === 'fill-in-blank' ? 15 :
                            question.type === 'short-answer' ? 20 : 5
                });
            }
        } catch (error) {
            console.warn('Failed to generate question:', error);
        }
    }

    return questions;
}

/**
 * Validate answer with fuzzy matching for lenient grading
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @param {number} threshold - Similarity threshold (0-1, default: 0.8)
 * @returns {Object} - { isCorrect: boolean, similarity: number }
 */
export function validateAnswer(userAnswer, correctAnswer, threshold = 0.75) {
    if (!userAnswer || !correctAnswer) {
        return { isCorrect: false, similarity: 0 };
    }

    // Normalize answers
    const normalize = (str) => str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    // Exact match (after normalization)
    if (normalizedUser === normalizedCorrect) {
        return { isCorrect: true, similarity: 1.0 };
    }

    // Calculate similarity using Levenshtein distance
    const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

    return {
        isCorrect: similarity >= threshold,
        similarity: similarity
    };
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
        return 1.0;
    }

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) {
        matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
        matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    return matrix[str2.length][str1.length];
}
