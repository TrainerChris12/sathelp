// public/storage-manager.js

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'satMathProgress';
        this.isLoggedIn = false;
        this.userId = null;
        this.user = null;
    }

    // Initialize - check if user is logged in
    async init() {
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.isLoggedIn = true;
                    this.userId = user.uid;
                    this.user = user;
                    console.log('✅ Logged in as:', user.email);

                    // Sync localStorage to Firebase on login
                    await this.syncLocalToCloud();

                    resolve(true);
                } else {
                    this.isLoggedIn = false;
                    this.userId = null;
                    this.user = null;
                    console.log('📱 Guest mode (localStorage only)');
                    resolve(false);
                }
            });
        });
    }

    // Save problem attempt
    async saveAttempt(problemId, correct, timeSpent = 0) {
        const progress = await this.getProgress();

        // Initialize problem data if doesn't exist
        if (!progress.problems[problemId]) {
            progress.problems[problemId] = {
                attempts: 0,
                correct: false,
                everIncorrect: false,
                firstAttempted: Date.now(),
                lastAttempted: Date.now(),
                totalTimeSpent: 0
            };
            console.log(`NEW problem tracked: ${problemId}`);
        }

        // Update problem data
        const problem = progress.problems[problemId];
        problem.attempts++;
        problem.lastAttempted = Date.now();
        problem.totalTimeSpent += timeSpent;

        // If they get it wrong, mark it permanently
        if (!correct) {
            problem.everIncorrect = true;
        }

        // Only update to correct if they got it right and never got it wrong
        if (correct && !problem.everIncorrect && !problem.correct) {
            problem.correct = true;
        }

        // Update overall stats
        this.updateStats(progress);

        // Save to both localStorage and Firebase (if logged in)
        await this.saveProgress(progress);

        console.log(`Saved: ${problemId} - ${correct ? 'Correct answer' : 'Incorrect answer'} | Counted as correct: ${problem.correct} | Ever wrong: ${problem.everIncorrect}`);
    }

    // Get all progress data
    async getProgress() {
        if (this.isLoggedIn) {
            // Get from Firebase
            try {
                const doc = await db.collection('userProgress').doc(this.userId).get();
                if (doc.exists) {
                    return doc.data();
                }
            } catch (error) {
                console.error('Error loading from Firebase:', error);
            }
        }

        // Fallback to localStorage (or if not logged in)
        return this.getLocalProgress();
    }

    // Get progress from localStorage
    getLocalProgress() {
        const stored = localStorage.getItem(this.STORAGE_KEY);

        if (stored) {
            return JSON.parse(stored);
        }

        // Return default structure
        return {
            problems: {},
            stats: {
                totalAttempts: 0,
                uniqueProblems: 0,
                correctAnswers: 0,
                accuracy: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalTimeMinutes: 0,
                lastActive: null
            },
            sessions: []
        };
    }

    // Save progress to localStorage and/or Firebase
    async saveProgress(progress) {
        // Always save to localStorage (instant, local backup)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));

        // If logged in, also save to Firebase
        if (this.isLoggedIn) {
            try {
                await db.collection('userProgress').doc(this.userId).set(progress);
                console.log('☁️ Synced to cloud');
            } catch (error) {
                console.error('❌ Cloud sync failed:', error);
            }
        }
    }

    // Sync localStorage to cloud when user logs in
    async syncLocalToCloud() {
        const localData = this.getLocalProgress();
        const cloudDoc = await db.collection('userProgress').doc(this.userId).get();

        if (!cloudDoc.exists && Object.keys(localData.problems).length > 0) {
            // User has local progress but nothing in cloud - upload it
            await db.collection('userProgress').doc(this.userId).set(localData);
            console.log('📤 Uploaded local progress to cloud');
        } else if (cloudDoc.exists) {
            // Cloud data exists - use it
            console.log('📥 Using cloud progress');
        }
    }

    // Update overall statistics
    updateStats(progress) {
        const problems = Object.values(progress.problems);

        progress.stats.uniqueProblems = problems.length;
        progress.stats.totalAttempts = problems.reduce((sum, p) => sum + p.attempts, 0);
        progress.stats.correctAnswers = problems.filter(p => p.correct === true).length;
        progress.stats.accuracy = progress.stats.uniqueProblems > 0
            ? Math.round((progress.stats.correctAnswers / progress.stats.uniqueProblems) * 100)
            : 0;
        progress.stats.totalTimeMinutes = Math.round(
            problems.reduce((sum, p) => sum + p.totalTimeSpent, 0) / 60
        );
        progress.stats.lastActive = Date.now();

        // Calculate streak
        this.calculateStreak(progress);

        console.log('Stats calculated:', {
            uniqueProblems: progress.stats.uniqueProblems,
            correctAnswers: progress.stats.correctAnswers,
            totalAttempts: progress.stats.totalAttempts,
            accuracy: progress.stats.accuracy
        });
    }

    // Calculate current streak
    calculateStreak(progress) {
        const problems = Object.values(progress.problems)
            .sort((a, b) => b.lastAttempted - a.lastAttempted);

        let currentStreak = 0;
        for (const problem of problems) {
            if (problem.correct) {
                currentStreak++;
            } else {
                break;
            }
        }

        progress.stats.currentStreak = currentStreak;
        progress.stats.longestStreak = Math.max(
            progress.stats.longestStreak,
            currentStreak
        );
    }

    // Check if problem was attempted
    async wasAttempted(problemId) {
        const progress = await this.getProgress();
        return progress.problems[problemId] !== undefined;
    }

    // Check if problem was solved correctly
    async wasSolvedCorrectly(problemId) {
        const progress = await this.getProgress();
        return progress.problems[problemId]?.correct === true;
    }

    // Get stats for display
    getStats() {
        // This needs to be sync for display updates, so we use cached data
        const cached = this.getLocalProgress();
        return cached.stats;
    }

    // Reset all progress
    async resetProgress() {
        if (confirm('⚠️ Are you sure? This will delete all your progress!')) {
            // Clear localStorage
            localStorage.removeItem(this.STORAGE_KEY);

            // Clear Firebase if logged in
            if (this.isLoggedIn) {
                try {
                    await db.collection('userProgress').doc(this.userId).delete();
                    console.log('☁️ Cloud progress deleted');
                } catch (error) {
                    console.error('Error deleting cloud data:', error);
                }
            }

            console.log('Progress reset');
            return true;
        }
        return false;
    }

    // Logout
    async logout() {
        try {
            await firebase.auth().signOut();
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('👋 Logged out');
            window.location.href = 'auth.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Create single instance
const storage = new StorageManager();

// Initialize on page load
storage.init();

// Make available globally
window.storage = storage;