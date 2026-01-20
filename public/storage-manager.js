// public/storage-manager.js - VERIFIED

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'satMathProgress';
        this.isLoggedIn = false;
        this.userId = null;
        this.user = null;
        this.cachedProgress = null;
    }

    async init() {
        console.log('StorageManager: Initializing...');

        return new Promise((resolve) => {
            if (typeof firebase === 'undefined' || !firebase.auth) {
                console.warn('Firebase not available, using localStorage only');
                this.cachedProgress = this.loadFromLocalStorage();
                resolve(false);
                return;
            }

            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.isLoggedIn = true;
                    this.userId = user.uid;
                    this.user = user;
                    console.log('✅ Logged in as:', user.email);

                    await this.loadFromCloud();
                    resolve(true);
                } else {
                    this.isLoggedIn = false;
                    this.userId = null;
                    this.user = null;
                    this.cachedProgress = this.loadFromLocalStorage();
                    console.log('📱 Guest mode');
                    resolve(false);
                }
            });
        });
    }

    async loadFromCloud() {
        try {
            const doc = await db.collection('userProgress').doc(this.userId).get();

            if (doc.exists) {
                this.cachedProgress = doc.data();
                console.log('📥 Loaded from cloud');
            } else {
                const localData = this.loadFromLocalStorage();

                if (Object.keys(localData.problems).length > 0) {
                    this.cachedProgress = localData;
                    await this.saveToCloud();
                    console.log('📤 Uploaded local to cloud');
                } else {
                    this.cachedProgress = this.getEmptyProgress();
                }
            }
        } catch (error) {
            console.error('Cloud load error:', error);
            this.cachedProgress = this.loadFromLocalStorage();
        }
    }

    getEmptyProgress() {
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
            }
        };
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Parse error:', e);
                return this.getEmptyProgress();
            }
        }
        return this.getEmptyProgress();
    }

    saveToLocalStorage(progress) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    }

    async saveToCloud() {
        if (!this.isLoggedIn || !this.cachedProgress) return;

        try {
            await db.collection('userProgress').doc(this.userId).set(this.cachedProgress);
            console.log('☁️ Saved to cloud');
        } catch (error) {
            console.error('Cloud save error:', error);
        }
    }

    async recordAttempt(problemId, wasCorrect, timeSpent = 0) {
        const progress = this.cachedProgress || this.loadFromLocalStorage();

        // ✅ Use LET because we may create it
        let problemData = progress.problems[problemId];

        if (!problemData) {
            // NEW PROBLEM
            progress.problems[problemId] = {
                id: problemId,
                attempts: 1,
                correct: wasCorrect,
                everIncorrect: !wasCorrect,
                firstAttempted: Date.now(),
                lastAttempted: Date.now(),
                totalTimeSpent: timeSpent
            };

            problemData = progress.problems[problemId]; // ✅ IMPORTANT

            console.log(`🆕 ${problemId} | First try: ${wasCorrect ? '✅ CORRECT' : '❌ WRONG'}`);

        } else {
            // EXISTING PROBLEM
            problemData.attempts++;
            problemData.lastAttempted = Date.now();
            problemData.totalTimeSpent += timeSpent;

            if (!wasCorrect) {
                problemData.everIncorrect = true;
                problemData.correct = false;
                console.log(`❌ ${problemId} | Wrong (attempt #${problemData.attempts})`);
            } else {
                if (!problemData.everIncorrect) {
                    problemData.correct = true;
                    console.log(`✅ ${problemId} | Right (attempt #${problemData.attempts}) - COUNTS!`);
                } else {
                    problemData.correct = false;
                    console.log(`⚠️ ${problemId} | Right but doesn't count (was wrong before)`);
                }
            }
        }

        this.calculateStats(progress);
        this.cachedProgress = progress;
        this.saveToLocalStorage(progress);
        await this.saveToCloud();

        return progress.problems[problemId].correct; // ✅ always valid now
    }


    calculateStats(progress) {
        const allProblems = Object.values(progress.problems);

        progress.stats.uniqueProblems = allProblems.length;
        progress.stats.totalAttempts = allProblems.reduce((sum, p) => sum + p.attempts, 0);
        progress.stats.correctAnswers = allProblems.filter(p => p.correct === true).length;
        progress.stats.accuracy = progress.stats.uniqueProblems > 0
            ? Math.round((progress.stats.correctAnswers / progress.stats.uniqueProblems) * 100)
            : 0;
        progress.stats.totalTimeMinutes = Math.round(
            allProblems.reduce((sum, p) => sum + p.totalTimeSpent, 0) / 60
        );

        const sortedByTime = allProblems.sort((a, b) => b.lastAttempted - a.lastAttempted);
        let streak = 0;
        for (const problem of sortedByTime) {
            if (problem.correct === true) {
                streak++;
            } else {
                break;
            }
        }
        progress.stats.currentStreak = streak;
        progress.stats.longestStreak = Math.max(progress.stats.longestStreak || 0, streak);
        progress.stats.lastActive = Date.now();

        console.log('📊', {
            unique: progress.stats.uniqueProblems,
            correct: progress.stats.correctAnswers,
            accuracy: progress.stats.accuracy + '%'
        });
    }

    getProgress() {
        return this.cachedProgress || this.loadFromLocalStorage();
    }

    getStats() {
        const progress = this.getProgress();
        return progress.stats;
    }

    async resetProgress() {
        if (!confirm('⚠️ Delete ALL progress? Cannot be undone!')) {
            return false;
        }

        this.cachedProgress = this.getEmptyProgress();
        this.saveToLocalStorage(this.cachedProgress);

        if (this.isLoggedIn) {
            await this.saveToCloud();
        }

        console.log('🗑️ Reset');
        location.reload();
        return true;
    }

    async logout() {
        try {
            await firebase.auth().signOut();
            this.cachedProgress = null;
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('👋 Logged out');
            window.location.href = 'auth.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

const storage = new StorageManager();
window.storage = storage;