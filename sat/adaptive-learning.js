// adaptive-learning.js - True Adaptive Practice Engine

/* =========================================================
   ADAPTIVE LEARNING ENGINE
   ========================================================= */

class AdaptiveLearningEngine {
    constructor() {
        this.performanceWindow = 5; // Look at last 5 attempts
        this.masteryThreshold = 0.80; // 80% = mastered (lowered from 85%)
        this.strugglingThreshold = 0.60; // Below 60% = struggling (raised from 50%)
    }

    // =========================================================
    // ANALYZE STUDENT PERFORMANCE
    // =========================================================

    analyzePerformance(userId) {
        if (!window.storage) {
            console.log('❌ Storage not available');
            return null;
        }

        const progress = storage.getProgress();
        if (!progress || !progress.problems) {
            console.log('❌ No progress data found');
            return null;
        }

        console.log('✅ Progress found:', Object.keys(progress.problems).length, 'problems');

        const analysis = {
            bySubskill: {},
            byDifficulty: {},
            recentPerformance: [],
            weaknesses: [],
            strengths: [],
            recommendedNext: null,
            adaptiveDifficulty: 'medium'
        };

        // Analyze by subskill
        Object.entries(progress.problems).forEach(([problemId, data]) => {
            const problem = this.findProblem(problemId);

            // If problem not found in global array, try to extract from ID
            let subskill, difficulty;

            if (problem) {
                subskill = problem.subskill;
                difficulty = problem.difficulty.toLowerCase();
            } else {
                // Extract from problem ID pattern: MATH-ALG-LE-E-001
                // Format: MATH-{topic}-{subskill}-{difficulty}-{number}
                const parts = problemId.split('-');

                if (parts.length >= 4) {
                    // Map abbreviations to full subskill names
                    const abbrevMap = {
                        'LE': 'linear-equations-one-variable',
                        'LF': 'linear-functions',
                        'L2V': 'linear-equations-two-variables',
                        'SYS': 'systems-linear-equations',
                        'LI': 'linear-inequalities',
                        'NF': 'nonlinear-functions',
                        'NE': 'nonlinear-equations',
                        'EE': 'equivalent-expressions',
                        'RR': 'ratios-rates',
                        'PCT': 'percentages',
                        'OVD': 'one-variable-data',
                        'TVD': 'two-variable-data',
                        'PROB': 'probability',
                        'INF': 'inference',
                        'SC': 'statistical-claims',
                        'AV': 'area-volume',
                        'LAT': 'lines-angles-triangles',
                        'RT': 'right-triangles',
                        'CIRC': 'circles'
                    };

                    const abbrev = parts[2]; // e.g., "LE", "LF"
                    const diffLetter = parts[3]; // e.g., "E", "M", "H"

                    subskill = abbrevMap[abbrev] || 'linear-equations-one-variable'; // Default to linear equations instead of unknown
                    difficulty = diffLetter === 'E' ? 'easy' :
                        diffLetter === 'M' ? 'medium' :
                            diffLetter === 'H' ? 'hard' : 'easy';
                } else if (problemId.startsWith('GEN-SAT')) {
                    // Generated problems - use a default
                    subskill = 'linear-equations-one-variable';
                    difficulty = 'easy';
                } else {
                    // Skip this problem if we can't parse it
                    console.warn('Could not parse problem ID:', problemId);
                    return;
                }
            }

            // Initialize subskill tracking
            if (!analysis.bySubskill[subskill]) {
                analysis.bySubskill[subskill] = {
                    total: 0,
                    correct: 0,
                    accuracy: 0,
                    recentAttempts: []
                };
            }

            // Initialize difficulty tracking
            if (!analysis.byDifficulty[difficulty]) {
                analysis.byDifficulty[difficulty] = {
                    total: 0,
                    correct: 0,
                    accuracy: 0
                };
            }

            // Track stats
            analysis.bySubskill[subskill].total++;
            analysis.byDifficulty[difficulty].total++;

            if (data.correct) {
                analysis.bySubskill[subskill].correct++;
                analysis.byDifficulty[difficulty].correct++;
            }

            // Track recent attempts
            analysis.bySubskill[subskill].recentAttempts.push({
                correct: data.correct,
                timestamp: data.timestamp
            });

            // Keep only recent attempts
            if (analysis.bySubskill[subskill].recentAttempts.length > this.performanceWindow) {
                analysis.bySubskill[subskill].recentAttempts.shift();
            }
        });

        // Calculate accuracies
        Object.keys(analysis.bySubskill).forEach(subskill => {
            const data = analysis.bySubskill[subskill];
            data.accuracy = data.total > 0 ? data.correct / data.total : 0;
        });

        Object.keys(analysis.byDifficulty).forEach(difficulty => {
            const data = analysis.byDifficulty[difficulty];
            data.accuracy = data.total > 0 ? data.correct / data.total : 0;
        });

        // Identify weaknesses and strengths
        Object.entries(analysis.bySubskill).forEach(([subskill, data]) => {
            if (data.total >= 1) { // Need at least 1 attempt (changed from 3)
                if (data.accuracy < this.strugglingThreshold) {
                    analysis.weaknesses.push({
                        subskill,
                        accuracy: data.accuracy,
                        attempts: data.total
                    });
                } else if (data.accuracy >= this.masteryThreshold) {
                    analysis.strengths.push({
                        subskill,
                        accuracy: data.accuracy,
                        attempts: data.total
                    });
                }
            }
        });

        // Sort weaknesses by severity
        analysis.weaknesses.sort((a, b) => a.accuracy - b.accuracy);

        // Sort strengths by mastery
        analysis.strengths.sort((a, b) => b.accuracy - a.accuracy);

        // Calculate recent performance trend
        analysis.recentPerformance = this.getRecentPerformanceTrend(progress);

        // Recommend next difficulty
        analysis.adaptiveDifficulty = this.recommendDifficulty(analysis);

        // Recommend next topic
        analysis.recommendedNext = this.recommendNextTopic(analysis);

        return analysis;
    }

    // =========================================================
    // GET RECENT PERFORMANCE TREND
    // =========================================================

    getRecentPerformanceTrend(progress) {
        const recentAttempts = [];

        Object.entries(progress.problems).forEach(([problemId, data]) => {
            recentAttempts.push({
                problemId,
                correct: data.correct,
                timestamp: data.timestamp || Date.now()
            });
        });

        // Sort by timestamp, most recent first
        recentAttempts.sort((a, b) => b.timestamp - a.timestamp);

        // Return last 10 attempts
        return recentAttempts.slice(0, 10);
    }

    // =========================================================
    // ADAPTIVE DIFFICULTY RECOMMENDATION
    // =========================================================

    recommendDifficulty(analysis) {
        const recent = analysis.recentPerformance.slice(0, this.performanceWindow);
        if (recent.length < 3) return 'medium'; // Default

        const recentCorrect = recent.filter(a => a.correct).length;
        const recentAccuracy = recentCorrect / recent.length;

        if (recentAccuracy < 0.40) {
            return 'easy'; // Struggling - go easier
        } else if (recentAccuracy > 0.85) {
            return 'hard'; // Mastering - challenge them
        } else if (recentAccuracy > 0.70) {
            return 'medium'; // Solid - increase difficulty
        } else {
            return 'easy'; // Below 70% - practice fundamentals
        }
    }

    // =========================================================
    // RECOMMEND NEXT TOPIC
    // =========================================================

    recommendNextTopic(analysis) {
        // Priority 1: Address biggest weakness
        if (analysis.weaknesses.length > 0) {
            const weakness = analysis.weaknesses[0];
            return {
                type: 'weakness',
                subskill: weakness.subskill,
                reason: `You're at ${Math.round(weakness.accuracy * 100)}% accuracy. Let's improve this!`,
                difficulty: 'easy' // Start with fundamentals
            };
        }

        // Priority 2: Practice areas with low attempt count
        const lowPracticeAreas = Object.entries(analysis.bySubskill)
            .filter(([_, data]) => data.total < 3) // Changed from 5
            .map(([subskill, data]) => ({ subskill, attempts: data.total }));

        if (lowPracticeAreas.length > 0) {
            const area = lowPracticeAreas[0];
            return {
                type: 'explore',
                subskill: area.subskill,
                reason: 'New topic - let\'s explore!',
                difficulty: 'easy'
            };
        }

        // Priority 3: Challenge strengths
        if (analysis.strengths.length > 0) {
            const strength = analysis.strengths[0];
            return {
                type: 'challenge',
                subskill: strength.subskill,
                reason: `You're doing great (${Math.round(strength.accuracy * 100)}%)! Ready for harder problems?`,
                difficulty: 'hard'
            };
        }

        // Default: Continue current topic
        return null;
    }

    // =========================================================
    // HELPER: FIND PROBLEM BY ID
    // =========================================================

    findProblem(problemId) {
        // This should reference the global problems array
        if (typeof problems !== 'undefined') {
            return problems.find(p => p.id === problemId);
        }
        return null;
    }

    // =========================================================
    // GET MASTERY LEVEL BY SUBSKILL
    // =========================================================

    getMasteryLevels() {
        const analysis = this.analyzePerformance();
        if (!analysis) return {};

        const masteryLevels = {};

        Object.entries(analysis.bySubskill).forEach(([subskill, data]) => {
            let level = 'beginner';
            let percentage = Math.round(data.accuracy * 100);

            if (data.total < 1) {
                level = 'exploring';
            } else if (data.accuracy >= 0.90) {
                level = 'master';
            } else if (data.accuracy >= 0.75) {
                level = 'proficient';
            } else if (data.accuracy >= 0.50) {
                level = 'developing';
            } else {
                level = 'struggling';
            }

            masteryLevels[subskill] = {
                level,
                percentage,
                attempts: data.total,
                correct: data.correct
            };
        });

        return masteryLevels;
    }

    // =========================================================
    // CALCULATE STREAK
    // =========================================================

    getCurrentStreak() {
        if (!window.storage) return 0;

        const progress = storage.getProgress();
        if (!progress || !progress.problems) return 0;

        const recent = this.getRecentPerformanceTrend(progress);

        if (recent.length === 0) return 0;

        let streak = 0;

        // Count from most recent backward
        for (const attempt of recent) {
            if (attempt.correct) {
                streak++;
            } else {
                break; // Stop at first incorrect
            }
        }

        return streak;
    }

    // =========================================================
    // GET STUDENT LEVEL
    // =========================================================

    getStudentLevel() {
        if (!window.storage) return { level: 'Beginner', xp: 0, nextLevel: 'Apprentice', xpToNext: 10, totalNeeded: 10, progress: 0 };

        const stats = storage.getStats();
        const xp = stats.correctAnswers || 0; // 1 correct answer = 1 XP

        let level = 'Beginner';
        let nextLevel = 'Apprentice';
        let levelMin = 0;
        let levelMax = 10;

        if (xp >= 100) {
            level = 'Master';
            nextLevel = 'Legend';
            levelMin = 100;
            levelMax = 200;
        } else if (xp >= 50) {
            level = 'Expert';
            nextLevel = 'Master';
            levelMin = 50;
            levelMax = 100;
        } else if (xp >= 25) {
            level = 'Proficient';
            nextLevel = 'Expert';
            levelMin = 25;
            levelMax = 50;
        } else if (xp >= 10) {
            level = 'Apprentice';
            nextLevel = 'Proficient';
            levelMin = 10;
            levelMax = 25;
        } else {
            level = 'Beginner';
            nextLevel = 'Apprentice';
            levelMin = 0;
            levelMax = 10;
        }

        const xpInLevel = xp - levelMin;
        const xpNeededForLevel = levelMax - levelMin;
        const xpToNext = levelMax - xp;
        const progress = (xpInLevel / xpNeededForLevel) * 100;

        return {
            level,
            nextLevel,
            xp,
            xpToNext,
            totalNeeded: levelMax,
            currentLevelMin: levelMin,
            progress: Math.min(progress, 100)
        };
    }
}

/* =========================================================
   WEAKNESS RADAR CHART
   ========================================================= */

function createWeaknessRadar() {
    const engine = new AdaptiveLearningEngine();
    const masteryLevels = engine.getMasteryLevels();

    const subskillNames = {
        'linear-equations-one-variable': 'Linear Equations',
        'linear-functions': 'Linear Functions',
        'systems-linear-equations': 'Systems of Equations',
        'nonlinear-functions': 'Quadratics',
        'ratios-rates': 'Ratios',
        'percentages': 'Percentages',
        'probability': 'Probability'
    };

    let html = '<div class="weakness-radar-fun">';
    html += '<h3 class="radar-title-fun">📊 Your Math Powers</h3>';

    const entries = Object.entries(masteryLevels)
        .filter(([_, data]) => data.attempts >= 1)
        .sort((a, b) => a[1].percentage - b[1].percentage)
        .slice(0, 7);

    if (entries.length === 0) {
        html += '<p class="radar-empty-fun">🎮 Start solving to unlock your stats!</p>';
    } else {
        entries.forEach(([subskill, data]) => {
            const displayName = subskillNames[subskill] || subskill;
            const barWidth = data.percentage;

            // Big emoji indicators
            const emoji = data.percentage >= 80 ? '🔥' :
                data.percentage >= 60 ? '⚡' :
                    data.percentage >= 40 ? '💪' : '🌱';

            // Color and message
            const colorClass = data.percentage >= 80 ? 'strength' :
                data.percentage >= 60 ? 'okay' : 'weakness';

            const message = data.percentage >= 80 ? 'Crushing it!' :
                data.percentage >= 60 ? 'Good progress!' :
                    data.percentage >= 40 ? 'Keep practicing!' : 'Let\'s work on this!';

            html += `
                <div class="radar-row-fun">
                    <div class="radar-emoji">${emoji}</div>
                    <div class="radar-content">
                        <div class="radar-label-fun">${displayName}</div>
                        <div class="radar-bar-container-fun">
                            <div class="radar-bar-fun ${colorClass}" style="width: ${barWidth}%">
                                <span class="radar-bar-label">${data.percentage}%</span>
                            </div>
                        </div>
                        <div class="radar-message">${message}</div>
                    </div>
                </div>
            `;
        });

        // Show biggest weakness with big callout
        const weakest = entries[0];
        const weakestName = subskillNames[weakest[0]] || weakest[0];

        html += `
            <div class="radar-insight-fun">
                <div class="insight-icon">🎯</div>
                <div class="insight-text">
                    <strong>Focus Here:</strong> ${weakestName}
                    <div class="insight-subtext">You're at ${weakest[1].percentage}% - let's level this up!</div>
                </div>
            </div>
        `;
    }

    html += '</div>';

    return html;
}

/* =========================================================
   GAMIFICATION DISPLAY
   ========================================================= */

function createGamificationDisplay() {
    const engine = new AdaptiveLearningEngine();
    const level = engine.getStudentLevel();
    const streak = engine.getCurrentStreak();
    const stats = storage ? storage.getStats() : { accuracy: 0 };

    const streakEmoji = streak >= 10 ? '🔥' : streak >= 5 ? '⚡' : streak >= 3 ? '✨' : '⭐';
    const levelEmoji = level.level === 'Master' ? '👑' :
        level.level === 'Expert' ? '🏆' :
            level.level === 'Proficient' ? '⭐' :
                level.level === 'Apprentice' ? '🌟' : '🎯';

    let html = '<div class="gamification-panel-fun">';

    // Big Level Display
    const problemsToNext = Math.ceil(level.xpToNext); // 1 XP = 1 correct answer
    html += `
        <div class="game-stat-fun level-stat">
            <div class="game-emoji">${levelEmoji}</div>
            <div class="game-stat-main">
                <div class="game-stat-label-fun">YOUR LEVEL</div>
                <div class="game-stat-value-big">${level.level}</div>
            </div>
            <div class="level-progress-fun">
                <div class="progress-bar-fun">
                    <div class="progress-fill-fun" style="width: ${((level.xp % 100) / 100) * 100}%">
                        <span class="progress-label">${level.xp} XP</span>
                    </div>
                </div>
                <div class="progress-text-fun">Answer ${problemsToNext} more correct to reach ${level.nextLevel}!</div>
            </div>
        </div>
    `;

    // Big Streak Display
    html += `
        <div class="game-stat-fun streak-stat">
            <div class="game-emoji streak-emoji">${streakEmoji}</div>
            <div class="game-stat-main">
                <div class="game-stat-label-fun">STREAK</div>
                <div class="game-stat-value-huge">${streak}</div>
                <div class="game-stat-subtitle-fun">${streak === 1 ? 'problem' : 'problems'} in a row!</div>
            </div>
        </div>
    `;

    // Big Accuracy Display with Color
    const accuracyColor = stats.accuracy >= 80 ? '#10b981' :
        stats.accuracy >= 60 ? '#f59e0b' :
            stats.accuracy >= 40 ? '#fb923c' : '#ef4444';
    const accuracyEmoji = stats.accuracy >= 80 ? '🎯' :
        stats.accuracy >= 60 ? '📈' :
            stats.accuracy >= 40 ? '💪' : '🌱';

    html += `
        <div class="game-stat-fun accuracy-stat">
            <div class="game-emoji">${accuracyEmoji}</div>
            <div class="game-stat-main">
                <div class="game-stat-label-fun">ACCURACY</div>
                <div class="game-stat-value-huge" style="color: ${accuracyColor};">${stats.accuracy}%</div>
                <div class="game-stat-subtitle-fun">${stats.correctAnswers || 0} / ${stats.uniqueProblems || 0} correct</div>
            </div>
        </div>
    `;

    html += '</div>';

    return html;
}

/* =========================================================
   ADAPTIVE RECOMMENDATION DISPLAY
   ========================================================= */

function createAdaptiveRecommendation() {
    const engine = new AdaptiveLearningEngine();
    const analysis = engine.analyzePerformance();

    if (!analysis || !analysis.recommendedNext) {
        return `
            <div class="adaptive-recommendation-fun empty">
                <div class="rec-emoji-big">🎮</div>
                <div class="rec-text">
                    <h3>Keep Going!</h3>
                    <p>Answer more problems to unlock personalized recommendations</p>
                </div>
            </div>
        `;
    }

    const rec = analysis.recommendedNext;
    const subskillNames = {
        'linear-equations-one-variable': 'Linear Equations',
        'linear-functions': 'Linear Functions',
        'systems-linear-equations': 'Systems of Equations',
        'linear-equations-two-variables': 'Linear Equations (2 Vars)',
        'linear-inequalities': 'Linear Inequalities'
    };

    const displayName = subskillNames[rec.subskill] || rec.subskill;

    // Big fun icons based on type
    const icon = rec.type === 'weakness' ? '🎯' :
        rec.type === 'challenge' ? '🚀' : '🌟';

    const bgColor = rec.type === 'weakness' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
        rec.type === 'challenge' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' :
            'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';

    const title = rec.type === 'weakness' ? 'Let\'s Power Up!' :
        rec.type === 'challenge' ? 'Ready for a Challenge?' :
            'Try Something New!';

    let html = `<div class="adaptive-recommendation-fun" style="background: ${bgColor};">`;
    html += `<div class="rec-emoji-big">${icon}</div>`;
    html += `<div class="rec-content-fun">`;
    html += `<h3 class="rec-title-fun">${title}</h3>`;
    html += `<div class="rec-topic-fun">${displayName}</div>`;
    html += `<div class="rec-reason-fun">${rec.reason}</div>`;
    html += `<div class="rec-difficulty-badge ${rec.difficulty}">${rec.difficulty.toUpperCase()}</div>`;
    html += `<button class="rec-start-btn" onclick="jumpToPractice('${rec.subskill}', '${rec.difficulty}')">🎯 Start Practicing!</button>`;
    html += `</div>`;
    html += '</div>';

    return html;
}

// Jump to practice with specific topic and difficulty
window.jumpToPractice = function(subskill, difficulty) {
    // Save the recommendation
    localStorage.setItem('recommendedSubskill', subskill);
    localStorage.setItem('recommendedDifficulty', difficulty);

    // Go to practice page
    window.location.href = './index-single-problem.html';
};

// Export for use in main app
window.AdaptiveLearningEngine = AdaptiveLearningEngine;
window.createWeaknessRadar = createWeaknessRadar;
window.createGamificationDisplay = createGamificationDisplay;
window.createAdaptiveRecommendation = createAdaptiveRecommendation;