/**
 * Local storage utility for persisting exams and user progress
 */

const STORAGE_KEYS = {
    EXAMS: 'study_game_exams',
    PROGRESS: 'study_game_progress',
    STATS: 'study_game_stats'
};

/**
 * Save an exam to local storage
 * @param {Object} exam - Exam object to save
 */
export function saveExam(exam) {
    try {
        const exams = getExams();
        const existingIndex = exams.findIndex(e => e.id === exam.id);

        if (existingIndex !== -1) {
            exams[existingIndex] = exam;
        } else {
            exams.push(exam);
        }

        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
        return true;
    } catch (error) {
        console.error('Error saving exam:', error);
        return false;
    }
}

/**
 * Get all saved exams
 * @returns {Array<Object>} - Array of exam objects
 */
export function getExams() {
    try {
        const examsJson = localStorage.getItem(STORAGE_KEYS.EXAMS);
        return examsJson ? JSON.parse(examsJson) : [];
    } catch (error) {
        console.error('Error loading exams:', error);
        return [];
    }
}

/**
 * Get a specific exam by ID
 * @param {string} examId - Exam ID
 * @returns {Object|null} - Exam object or null
 */
export function getExamById(examId) {
    const exams = getExams();
    return exams.find(e => e.id === examId) || null;
}

/**
 * Delete an exam
 * @param {string} examId - Exam ID to delete
 */
export function deleteExam(examId) {
    try {
        const exams = getExams();
        const filtered = exams.filter(e => e.id !== examId);
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting exam:', error);
        return false;
    }
}

/**
 * Save exam progress
 * @param {string} examId - Exam ID
 * @param {Object} progress - Progress object
 */
export function saveProgress(examId, progress) {
    try {
        const allProgress = getProgress();
        allProgress[examId] = {
            ...progress,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
        return true;
    } catch (error) {
        console.error('Error saving progress:', error);
        return false;
    }
}

/**
 * Get progress for a specific exam
 * @param {string} examId - Exam ID
 * @returns {Object|null} - Progress object or null
 */
export function getExamProgress(examId) {
    const allProgress = getProgress();
    return allProgress[examId] || null;
}

/**
 * Get all progress data
 * @returns {Object} - All progress data
 */
export function getProgress() {
    try {
        const progressJson = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        return progressJson ? JSON.parse(progressJson) : {};
    } catch (error) {
        console.error('Error loading progress:', error);
        return {};
    }
}

/**
 * Save user statistics
 * @param {Object} stats - Statistics object
 */
export function saveStats(stats) {
    try {
        const currentStats = getStats();
        const updatedStats = {
            ...currentStats,
            ...stats,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
        return true;
    } catch (error) {
        console.error('Error saving stats:', error);
        return false;
    }
}

/**
 * Get user statistics
 * @returns {Object} - Statistics object
 */
export function getStats() {
    try {
        const statsJson = localStorage.getItem(STORAGE_KEYS.STATS);
        return statsJson ? JSON.parse(statsJson) : {
            totalExamsTaken: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalPoints: 0
        };
    } catch (error) {
        console.error('Error loading stats:', error);
        return {
            totalExamsTaken: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalPoints: 0
        };
    }
}

/**
 * Update statistics after completing an exam
 * @param {number} questionsCount - Number of questions
 * @param {number} correctCount - Number of correct answers
 * @param {number} points - Points earned
 */
export function updateStatsAfterExam(questionsCount, correctCount, points) {
    const stats = getStats();

    const newStreak = correctCount === questionsCount ?
        (stats.currentStreak || 0) + 1 : 0;

    const updatedStats = {
        totalExamsTaken: (stats.totalExamsTaken || 0) + 1,
        totalQuestions: (stats.totalQuestions || 0) + questionsCount,
        correctAnswers: (stats.correctAnswers || 0) + correctCount,
        currentStreak: newStreak,
        bestStreak: Math.max(stats.bestStreak || 0, newStreak),
        totalPoints: (stats.totalPoints || 0) + points
    };

    saveStats(updatedStats);
    return updatedStats;
}

/**
 * Clear all data (for testing or reset)
 */
export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.EXAMS);
        localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.STATS);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}
