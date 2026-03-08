// ============================================
// MASTERY & ACHIEVEMENT SYSTEM
// ============================================

/* =========================================================
   MASTERY TRACKING
   ========================================================= */

const MasterySystem = {
    // Mastery milestones (first-try correct, no hints)
    milestones: {
        novice: 25,      // 🥉 Bronze
        apprentice: 50,
        expert: 100,     // 🥈 Silver
        master: 200,     // 🥇 Gold
        grandmaster: 400 // 💎 Platinum
    },

    // Get mastery data for a topic + difficulty
    getMastery(subskill, difficulty) {
        if (!storage) return { count: 0, level: 'beginner', nextMilestone: 25, progress: 0 };

        const progress = storage.getProgress();
        const key = `${subskill}_${difficulty}`;

        // Count first-try correct without hints
        let count = 0;

        if (progress.problems && window.allStaticProblems) {
            Object.entries(progress.problems).forEach(([problemId, data]) => {
                // Find the problem to check subskill/difficulty
                const problem = window.allStaticProblems.find(p => p.id === problemId);

                if (problem &&
                    problem.subskill === subskill &&
                    problem.difficulty.toLowerCase() === difficulty &&
                    data.correct === true &&
                    data.firstTry === true &&
                    data.noHints === true) {
                    count++;
                }
            });
        }

        // Determine level
        let level = 'beginner';
        let nextMilestone = this.milestones.novice;
        let progressPercent = 0;

        if (count >= this.milestones.grandmaster) {
            level = 'grandmaster';
            nextMilestone = null; // Max level
            progressPercent = 100;
        } else if (count >= this.milestones.master) {
            level = 'master';
            nextMilestone = this.milestones.grandmaster;
            progressPercent = ((count - this.milestones.master) / (this.milestones.grandmaster - this.milestones.master)) * 100;
        } else if (count >= this.milestones.expert) {
            level = 'expert';
            nextMilestone = this.milestones.master;
            progressPercent = ((count - this.milestones.expert) / (this.milestones.master - this.milestones.expert)) * 100;
        } else if (count >= this.milestones.apprentice) {
            level = 'apprentice';
            nextMilestone = this.milestones.expert;
            progressPercent = ((count - this.milestones.apprentice) / (this.milestones.expert - this.milestones.apprentice)) * 100;
        } else if (count >= this.milestones.novice) {
            level = 'novice';
            nextMilestone = this.milestones.apprentice;
            progressPercent = ((count - this.milestones.novice) / (this.milestones.apprentice - this.milestones.novice)) * 100;
        } else {
            level = 'beginner';
            nextMilestone = this.milestones.novice;
            progressPercent = (count / this.milestones.novice) * 100;
        }

        return {
            count,
            level,
            nextMilestone,
            progress: Math.min(progressPercent, 100)
        };
    },

    // Get overall topic mastery (all difficulties combined)
    getTopicMastery(subskill) {
        const easy = this.getMastery(subskill, 'easy');
        const medium = this.getMastery(subskill, 'medium');
        const hard = this.getMastery(subskill, 'hard');

        const totalCount = easy.count + medium.count + hard.count;

        // Determine overall level based on total
        let level = 'beginner';
        if (totalCount >= this.milestones.grandmaster) level = 'grandmaster';
        else if (totalCount >= this.milestones.master) level = 'master';
        else if (totalCount >= this.milestones.expert) level = 'expert';
        else if (totalCount >= this.milestones.apprentice) level = 'apprentice';
        else if (totalCount >= this.milestones.novice) level = 'novice';

        return {
            count: totalCount,
            level,
            easy,
            medium,
            hard
        };
    },

    // Get badge emoji for level
    getBadge(level) {
        const badges = {
            beginner: '📚',
            novice: '🥉',
            apprentice: '📘',
            expert: '🥈',
            master: '🥇',
            grandmaster: '💎'
        };
        return badges[level] || '📚';
    },

    // Get color for level
    getColor(level) {
        const colors = {
            beginner: '#9CA3AF',
            novice: '#CD7F32',
            apprentice: '#3B82F6',
            expert: '#C0C0C0',
            master: '#FFD700',
            grandmaster: '#B9F2FF'
        };
        return colors[level] || '#9CA3AF';
    },

    // Get display name for level
    getLevelName(level) {
        const names = {
            beginner: 'Beginner',
            novice: 'Novice',
            apprentice: 'Apprentice',
            expert: 'Expert',
            master: 'Master',
            grandmaster: 'Grandmaster'
        };
        return names[level] || 'Beginner';
    }
};

/* =========================================================
   ACHIEVEMENT SYSTEM
   ========================================================= */

const AchievementSystem = {
    achievements: [
        // First steps
        {
            id: 'first_correct',
            name: 'First Steps',
            description: 'Solve your first problem correctly',
            icon: '🎯',
            check: (stats) => stats.correctAnswers >= 1
        },
        {
            id: 'ten_correct',
            name: 'Getting Started',
            description: 'Solve 10 problems correctly',
            icon: '⭐',
            check: (stats) => stats.correctAnswers >= 10
        },

        // Milestones
        {
            id: 'fifty_correct',
            name: 'Half Century',
            description: 'Solve 50 problems correctly',
            icon: '🎖️',
            check: (stats) => stats.correctAnswers >= 50
        },
        {
            id: 'hundred_correct',
            name: 'Centurion',
            description: 'Solve 100 problems correctly',
            icon: '💯',
            check: (stats) => stats.correctAnswers >= 100
        },
        {
            id: 'two_hundred_correct',
            name: 'Double Century',
            description: 'Solve 200 problems correctly',
            icon: '🏆',
            check: (stats) => stats.correctAnswers >= 200
        },
        {
            id: 'five_hundred_correct',
            name: 'Elite Solver',
            description: 'Solve 500 problems correctly',
            icon: '👑',
            check: (stats) => stats.correctAnswers >= 500
        },

        // Accuracy
        {
            id: 'perfect_ten',
            name: 'Perfect Ten',
            description: 'Get 10 problems correct in a row',
            icon: '🔥',
            check: (stats) => stats.streak >= 10
        },
        {
            id: 'accuracy_master',
            name: 'Accuracy Master',
            description: 'Maintain 90%+ accuracy with 50+ problems solved',
            icon: '🎯',
            check: (stats) => stats.accuracy >= 90 && stats.uniqueProblems >= 50
        },

        // Topic mastery
        {
            id: 'topic_master',
            name: 'Topic Master',
            description: 'Reach Master level in any topic',
            icon: '🥇',
            check: (stats) => {
                // Check if any topic has master level
                const topics = [
                    'linear-equations-one-variable',
                    'linear-functions',
                    'linear-equations-two-variables',
                    'systems-linear-equations'
                ];
                return topics.some(topic => {
                    const mastery = MasterySystem.getTopicMastery(topic);
                    return mastery.level === 'master' || mastery.level === 'grandmaster';
                });
            }
        },
        {
            id: 'grandmaster',
            name: 'Grandmaster',
            description: 'Reach Grandmaster level in any topic',
            icon: '💎',
            check: (stats) => {
                const topics = [
                    'linear-equations-one-variable',
                    'linear-functions',
                    'linear-equations-two-variables',
                    'systems-linear-equations'
                ];
                return topics.some(topic => {
                    const mastery = MasterySystem.getTopicMastery(topic);
                    return mastery.level === 'grandmaster';
                });
            }
        },

        // Dedication
        {
            id: 'dedicated',
            name: 'Dedicated Student',
            description: 'Practice on 7 different days',
            icon: '📅',
            check: (stats) => stats.practiceDays >= 7
        },
        {
            id: 'marathon',
            name: 'Marathon Runner',
            description: 'Solve 50 problems in a single day',
            icon: '🏃',
            check: (stats) => stats.maxProblemsInDay >= 50
        }
    ],

    // Get all unlocked achievements
    getUnlocked() {
        if (!storage) return [];

        const stats = storage.getStats();
        const unlocked = [];

        this.achievements.forEach(achievement => {
            if (achievement.check(stats)) {
                unlocked.push(achievement);
            }
        });

        return unlocked;
    },

    // Get next achievements to unlock
    getNext(limit = 3) {
        if (!storage) return [];

        const stats = storage.getStats();
        const locked = [];

        this.achievements.forEach(achievement => {
            if (!achievement.check(stats)) {
                locked.push(achievement);
            }
        });

        return locked.slice(0, limit);
    },

    // Check if new achievement unlocked
    checkNewAchievements() {
        const unlocked = this.getUnlocked();
        const previouslyUnlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');

        const newAchievements = unlocked.filter(a => !previouslyUnlocked.includes(a.id));

        if (newAchievements.length > 0) {
            // Save new state
            localStorage.setItem('unlockedAchievements', JSON.stringify(unlocked.map(a => a.id)));

            // Show notification for each new achievement
            newAchievements.forEach(achievement => {
                this.showAchievementNotification(achievement);
            });
        }
    },

    // Show achievement notification
    showAchievementNotification(achievement) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-toast-content">
                <div class="achievement-toast-icon">${achievement.icon}</div>
                <div class="achievement-toast-text">
                    <div class="achievement-toast-title">Achievement Unlocked!</div>
                    <div class="achievement-toast-name">${achievement.name}</div>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
};

/* =========================================================
   PRACTICE SIMILAR BUTTON LOGIC
   ========================================================= */

function updatePracticeSimilarButton() {
    const btn = document.getElementById('generateSimilarBtn');
    if (!btn) return;

    const stats = SmartQueue.getStats();
    const topicMastery = MasterySystem.getTopicMastery(selectedSubskill);

    // Show button when:
    // 1. All static problems solved (mastered topic), OR
    // 2. At a mastery milestone boundary
    const allStaticSolved = stats.unsolvedStatic === 0;
    const atMilestone = topicMastery.count > 0 &&
        (topicMastery.count % 25 === 0 || // Every 25 problems
            topicMastery.count === MasterySystem.milestones.novice ||
            topicMastery.count === MasterySystem.milestones.apprentice ||
            topicMastery.count === MasterySystem.milestones.expert ||
            topicMastery.count === MasterySystem.milestones.master);

    if (allStaticSolved || atMilestone) {
        btn.style.display = 'inline-block';

        // Update button text based on context
        if (allStaticSolved) {
            btn.textContent = 'Practice More';
        } else {
            btn.textContent = 'Practice Similar';
        }
    } else {
        btn.style.display = 'none';
    }
}

/* =========================================================
   ENHANCED SIDEBAR WITH MASTERY
   ========================================================= */

function updateSidebarWithMastery() {
    if (!window.allStaticProblems) return; // Wait for problems to load

    const progress = storage ? storage.getProgress() : { problems: {} };

    document.querySelectorAll('.nav-item').forEach(item => {
        const subskill = item.dataset.subskill;
        if (!subskill) return;

        // Get total static count
        const totalStatic = window.allStaticProblems.filter(p => p.subskill === subskill).length;
        const unsolvedStatic = window.allStaticProblems.filter(p => {
            const matchesSubskill = p.subskill === subskill;
            const isCompleted = progress.problems && progress.problems[p.id]?.correct === true;
            return matchesSubskill && !isCompleted;
        }).length;

        // Get mastery level
        const topicMastery = MasterySystem.getTopicMastery(subskill);

        const badge = item.querySelector('.nav-item-badge');
        if (badge) {
            if (topicMastery.level !== 'beginner') {
                // Show mastery badge
                const emoji = MasterySystem.getBadge(topicMastery.level);
                badge.textContent = emoji;
                badge.style.background = 'transparent';
                badge.style.color = MasterySystem.getColor(topicMastery.level);
                badge.style.fontSize = '1.25rem';
                badge.title = `${MasterySystem.getLevelName(topicMastery.level)} - ${topicMastery.count} mastered`;
            } else if (unsolvedStatic === 0 && totalStatic > 0) {
                // All static solved but no mastery yet
                badge.textContent = '✓';
                badge.style.background = 'rgba(16, 185, 129, 0.15)';
                badge.style.color = '#10b981';
                badge.style.fontSize = '';
                badge.title = `All ${totalStatic} problems completed`;
            } else if (unsolvedStatic < totalStatic * 0.3 && unsolvedStatic > 0) {
                // Almost done
                badge.textContent = unsolvedStatic;
                badge.style.background = 'rgba(245, 158, 11, 0.15)';
                badge.style.color = '#F59E0B';
                badge.style.fontSize = '';
                badge.title = `${unsolvedStatic} of ${totalStatic} remaining`;
            } else {
                // Normal
                badge.textContent = unsolvedStatic;
                badge.style.background = '';
                badge.style.color = '';
                badge.style.fontSize = '';
                badge.title = `${unsolvedStatic} of ${totalStatic} unsolved`;
            }
        }
    });
}

/* =========================================================
   MODIFIED RECORD ATTEMPT TO TRACK MASTERY
   ========================================================= */

// This will be integrated into storage-manager.js
// For now, document the requirements:

/*
STORAGE REQUIREMENTS:

When recording an attempt, track:
- problemId
- correct (boolean)
- firstTry (boolean) - was this the first attempt on this problem?
- noHints (boolean) - did user view answer or explanation before solving?
- timestamp

Example structure:
problems: {
    "ALG-LEQ1V-E-001": {
        correct: true,
        firstTry: true,
        noHints: true,
        attempts: 1,
        timestamp: 1234567890
    }
}

This allows MasterySystem to count ONLY first-try, no-hint correct answers
*/

// Export to window
window.MasterySystem = MasterySystem;
window.AchievementSystem = AchievementSystem;
window.updatePracticeSimilarButton = updatePracticeSimilarButton;
window.updateSidebarWithMastery = updateSidebarWithMastery;

console.log('✅ Mastery & Achievement System loaded');