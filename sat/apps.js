// apps-single-problem.js - Delta Math Style Single Problem View

/* =========================================================
   STATE
   ========================================================= */

let problems = [];
let filteredProblems = [];
let currentIndex = 0;
let selectedSubskill = 'linear-equations-one-variable';
let selectedDifficulties = new Set(['easy', 'medium', 'hard']);

/* =========================================================
   LOAD PROBLEMS
   ========================================================= */

async function loadProblems() {
    console.log('Loading problems...');
    try {
        const response = await fetch('../data/problems.json');
        problems = await response.json();
        console.log('Loaded', problems.length, 'problems');
        filterProblems();
        showCurrentProblem();
    } catch (error) {
        console.error('Error loading problems:', error);
        const container = document.getElementById('problemContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--error);">
                    <p>Error loading problems.</p>
                    <p style="margin-top: 1rem; font-family: monospace;">python -m http.server 8000</p>
                </div>
            `;
        }
    }
}

function filterProblems() {
    const progress = storage ? storage.getProgress() : { problems: {} };

    filteredProblems = problems.filter(p => {
        const matchesSubskill = p.subskill === selectedSubskill;
        const matchesDifficulty = selectedDifficulties.has(p.difficulty.toLowerCase());

        // Hide completed STATIC problems (keep generated ones always)
        const isCompleted = progress.problems && progress.problems[p.id]?.correct === true;
        const isStatic = p.type !== 'generated';
        const shouldHide = isStatic && isCompleted;

        return matchesSubskill && matchesDifficulty && !shouldHide;
    });

    // RANDOMIZE problems if multiple difficulties selected
    if (selectedDifficulties.size > 1) {
        // Fisher-Yates shuffle
        for (let i = filteredProblems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredProblems[i], filteredProblems[j]] = [filteredProblems[j], filteredProblems[i]];
        }
    } else {
        // Single difficulty - keep order but shuffle within same difficulty
        const shuffled = [];
        const byDifficulty = {};

        filteredProblems.forEach(p => {
            const diff = p.difficulty.toLowerCase();
            if (!byDifficulty[diff]) byDifficulty[diff] = [];
            byDifficulty[diff].push(p);
        });

        // Shuffle each difficulty group
        Object.values(byDifficulty).forEach(group => {
            for (let i = group.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [group[i], group[j]] = [group[j], group[i]];
            }
            shuffled.push(...group);
        });

        filteredProblems = shuffled;
    }

    currentIndex = Math.min(currentIndex, filteredProblems.length - 1);
    if (currentIndex < 0) currentIndex = 0;

    updateProgressIndicator();
    updateNavigationButtons();
    updateSidebarCounts(); // Update accurate counts
}

/* =========================================================
   DISPLAY PROBLEM
   ========================================================= */

function showCurrentProblem() {
    const container = document.getElementById('problemContainer');
    if (!container) return;

    if (filteredProblems.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <p style="color: var(--text-light);">No problems available.</p>
                <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.875rem;">
                    Try selecting different difficulty levels.
                </p>
            </div>
        `;
        return;
    }

    const problem = filteredProblems[currentIndex];
    const progress = storage ? storage.getProgress() : { problems: {} };
    const problemProgress = progress.problems ? progress.problems[problem.id] : null;

    // Determine difficulty badge color
    const difficultyClass = problem.difficulty.toLowerCase();
    const difficultyDisplay = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);

    // Check if this is a short answer (no choices)
    const isShortAnswer = !problem.choices || problem.choices.length === 0;

    container.innerHTML = `
        <div class="problem-header">
            <div class="problem-id">${problem.id}</div>
            <div class="problem-badges">
                <span class="badge badge-difficulty badge-${difficultyClass}">${difficultyDisplay}</span>
                ${problemProgress?.correct ? '<span class="badge badge-solved">✓ Solved</span>' : ''}
            </div>
        </div>

        <div class="problem-content">${problem.question}</div>

        ${problem.imageUrl ? `<img src="../${problem.imageUrl}" alt="Problem diagram" style="max-width: 100%; height: auto; margin-bottom: 2rem; border-radius: 8px;">` : ''}

        ${isShortAnswer ? `
            <!-- Short Answer Input -->
            <div class="answer-input-group">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text);">Your Answer:</label>
                <input type="text" 
                       class="answer-input" 
                       id="shortAnswerInput"
                       placeholder="Enter your answer" 
                       data-correct="${problem.answer}">
                <button class="check-answer-btn" onclick="checkShortAnswer()">Check Answer</button>
                <div class="answer-feedback" id="answerFeedback"></div>
            </div>
        ` : `
            <!-- Multiple Choice -->
            <div class="problem-choices">
                ${problem.choices.map((choice, idx) => `
                    <div class="choice" data-choice="${String.fromCharCode(65 + idx)}" onclick="selectChoice('${String.fromCharCode(65 + idx)}')">
                        ${choice}
                    </div>
                `).join('')}
            </div>
        `}

        ${problem.explanation ? `
            <div class="explanation" id="explanation" style="display: none;">
                <div class="explanation-header">💡 Explanation</div>
                <div class="explanation-content">${problem.explanation}</div>
            </div>
        ` : ''}
    `;

    // Update show explanation button
    const showExplanationBtn = document.getElementById('showExplanationBtn');
    if (showExplanationBtn) {
        if (problem.explanation) {
            showExplanationBtn.style.display = 'block';
            showExplanationBtn.textContent = 'Show Explanation';
        } else {
            showExplanationBtn.style.display = 'none';
        }
    }

    // Render MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    // Emit event for button state reset
    window.dispatchEvent(new Event('problemChanged'));

    updateStatsDisplay();
}

/* =========================================================
   ANSWER SELECTION
   ========================================================= */

window.selectChoice = function(choiceLetter) {
    const problem = filteredProblems[currentIndex];
    if (!problem) return;

    const container = document.getElementById('problemContainer');
    const choices = container.querySelectorAll('.choice');

    // Remove previous states
    choices.forEach(c => {
        c.classList.remove('selected', 'correct', 'incorrect');
    });

    // Add selected state
    const selectedChoice = container.querySelector(`[data-choice="${choiceLetter}"]`);
    if (selectedChoice) {
        selectedChoice.classList.add('selected');
    }

    // Check if correct
    const isCorrect = choiceLetter === problem.answer;

    if (isCorrect) {
        selectedChoice.classList.remove('selected');
        selectedChoice.classList.add('correct');

        // Save progress
        if (storage) {
            storage.recordAttempt(problem.id, true, 0);
            updateStatsDisplay();
        }

        // Show explanation automatically
        const explanation = document.getElementById('explanation');
        if (explanation) {
            explanation.style.display = 'block';
            const showExplanationBtn = document.getElementById('showExplanationBtn');
            if (showExplanationBtn) {
                showExplanationBtn.textContent = 'Hide Explanation';
            }
        }
    } else {
        selectedChoice.classList.add('incorrect');

        if (storage) {
            storage.recordAttempt(problem.id, false, 0);
            updateStatsDisplay();
        }
    }
};

// Short answer checking
window.checkShortAnswer = function() {
    const problem = filteredProblems[currentIndex];
    if (!problem) return;

    const input = document.getElementById('shortAnswerInput');
    const feedback = document.getElementById('answerFeedback');

    if (!input || !feedback) return;

    const userAnswer = input.value.trim();
    const correctAnswer = String(problem.answer).trim();

    if (!userAnswer) {
        feedback.textContent = 'Please enter an answer';
        feedback.className = 'answer-feedback';
        return;
    }

    // Show confirmation dialog
    const confirmed = confirm(`Are you sure your answer is "${userAnswer}"?`);
    if (!confirmed) {
        input.focus();
        return;
    }

    // Check if correct (handle numeric answers)
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase() ||
        parseFloat(userAnswer) === parseFloat(correctAnswer);

    if (isCorrect) {
        feedback.textContent = '✓ Correct!';
        feedback.className = 'answer-feedback correct';
        input.disabled = true;

        // Save progress
        if (storage) {
            storage.recordAttempt(problem.id, true, 0);
            updateStatsDisplay();
        }

        // Show explanation
        const explanation = document.getElementById('explanation');
        if (explanation) {
            explanation.style.display = 'block';
            const showExplanationBtn = document.getElementById('showExplanationBtn');
            if (showExplanationBtn) {
                showExplanationBtn.textContent = 'Hide Explanation';
            }
        }
    } else {
        feedback.textContent = `✗ Incorrect. Try again!`;
        feedback.className = 'answer-feedback incorrect';

        if (storage) {
            storage.recordAttempt(problem.id, false, 0);
            updateStatsDisplay();
        }
    }
};

// Add Enter key listener for short answer input
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('shortAnswerInput');
        if (input && document.activeElement === input && !input.disabled) {
            e.preventDefault();
            checkShortAnswer();
        }
    }
});

/* =========================================================
   NAVIGATION
   ========================================================= */

function goToNext() {
    if (currentIndex < filteredProblems.length - 1) {
        currentIndex++;
        showCurrentProblem();
        updateProgressIndicator();
        updateNavigationButtons();
        scrollToTop();
    }
}

function goToPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        showCurrentProblem();
        updateProgressIndicator();
        updateNavigationButtons();
        scrollToTop();
    }
}

function updateProgressIndicator() {
    const indicator = document.getElementById('progressIndicator');
    if (indicator) {
        indicator.textContent = `${currentIndex + 1} / ${filteredProblems.length}`;
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
    }

    if (nextBtn) {
        nextBtn.disabled = currentIndex === filteredProblems.length - 1;
    }
}

function scrollToTop() {
    const problemArea = document.querySelector('.problem-area');
    if (problemArea) {
        problemArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function updateSidebarCounts() {
    // Update badges with ACTUAL problem counts
    const progress = storage ? storage.getProgress() : { problems: {} };

    document.querySelectorAll('.nav-item').forEach(item => {
        const subskill = item.dataset.subskill;
        if (!subskill) return;

        // Count available problems (not completed static ones)
        const available = problems.filter(p => {
            const matchesSubskill = p.subskill === subskill;
            const isCompleted = progress.problems && progress.problems[p.id]?.correct === true;
            const isStatic = p.type !== 'generated';
            const shouldHide = isStatic && isCompleted;
            return matchesSubskill && !shouldHide;
        }).length;

        const badge = item.querySelector('.nav-item-badge');
        if (badge) {
            badge.textContent = available;

            // Highlight if no problems left
            if (available === 0) {
                badge.style.background = 'rgba(220, 38, 38, 0.1)';
                badge.style.color = 'var(--error)';
            } else {
                badge.style.background = '';
                badge.style.color = '';
            }
        }
    });
}

function initializeSidebar() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const subskill = item.dataset.subskill;
            if (subskill) {
                selectSubskill(subskill);
            }
        });
    });

    // Mobile toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    if (window.innerWidth <= 768 && menuToggle) {
        menuToggle.style.display = 'flex';
    }
}

function selectSubskill(subskill) {
    selectedSubskill = subskill;

    // Update active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const selectedItem = document.querySelector(`[data-subskill="${subskill}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }

    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }

    currentIndex = 0;
    filterProblems();
    showCurrentProblem();
}

/* =========================================================
   DIFFICULTY TABS
   ========================================================= */

function initializeDifficultyTabs() {
    document.querySelectorAll('.difficulty-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const difficulty = tab.dataset.difficulty;
            toggleDifficulty(difficulty, tab);
        });
    });
}

function toggleDifficulty(difficulty, tab) {
    if (selectedDifficulties.has(difficulty)) {
        selectedDifficulties.delete(difficulty);
        tab.classList.remove('active');
    } else {
        selectedDifficulties.add(difficulty);
        tab.classList.add('active');
    }

    currentIndex = 0;
    filterProblems();
    showCurrentProblem();
}

/* =========================================================
   ACTION BUTTONS
   ========================================================= */

function initializeActionButtons() {
    // Generate Practice - Create multiple new problems at once
    const generatePracticeBtn = document.getElementById('generatePracticeBtn');
    if (generatePracticeBtn) {
        generatePracticeBtn.addEventListener('click', () => {
            if (!window.problemGenerator) {
                alert('Problem generator not available!');
                return;
            }

            const COUNT = 10; // Generate 10 fresh problems
            let generated = 0;

            // Create template problem from current topic
            const template = {
                subskill: selectedSubskill,
                topic: getTopicFromSubskill(selectedSubskill),
                difficulty: Array.from(selectedDifficulties)[0] || 'easy'
            };

            for (let i = 0; i < COUNT; i++) {
                const newProblem = window.problemGenerator.generate(template);
                if (newProblem) {
                    newProblem.type = 'generated';
                    problems.unshift(newProblem);
                    generated++;
                }
            }

            if (generated > 0) {
                filterProblems();
                currentIndex = 0;
                showCurrentProblem();

                // Show notification
                const notification = document.createElement('div');
                notification.style.cssText = 'position: fixed; top: 80px; right: 20px; background: var(--success); color: white; padding: 1rem 1.5rem; border-radius: 8px; font-weight: 600; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
                notification.textContent = `✨ Generated ${generated} fresh problems!`;
                document.body.appendChild(notification);

                setTimeout(() => notification.remove(), 3000);
            } else {
                alert('Could not generate problems for this topic yet!');
            }
        });
    }

    // Show/Hide Answer
    const showAnswerBtn = document.getElementById('showAnswerBtn');
    let answerShown = false;

    if (showAnswerBtn) {
        showAnswerBtn.addEventListener('click', () => {
            const problem = filteredProblems[currentIndex];
            if (!problem) return;

            const container = document.getElementById('problemContainer');

            // Check if this is short answer or multiple choice
            const isShortAnswer = !problem.choices || problem.choices.length === 0;

            if (!answerShown) {
                // SHOW ANSWER
                if (isShortAnswer) {
                    // Short answer: show answer in feedback
                    const feedback = document.getElementById('answerFeedback');
                    if (feedback) {
                        feedback.textContent = `Answer: ${problem.answer}`;
                        feedback.className = 'answer-feedback correct';
                    }
                } else {
                    // Multiple choice: highlight correct answer
                    const choices = container.querySelectorAll('.choice');
                    choices.forEach(choice => {
                        if (choice.dataset.choice === problem.answer) {
                            choice.classList.add('correct');
                        }
                    });
                }

                // Show explanation
                const explanation = document.getElementById('explanation');
                if (explanation) {
                    explanation.style.display = 'block';
                    const showExplanationBtn = document.getElementById('showExplanationBtn');
                    if (showExplanationBtn) {
                        showExplanationBtn.textContent = 'Hide Explanation';
                    }
                }

                showAnswerBtn.textContent = 'Hide Answer';
                answerShown = true;
            } else {
                // HIDE ANSWER
                if (isShortAnswer) {
                    // Short answer: clear feedback (unless they got it right)
                    const feedback = document.getElementById('answerFeedback');
                    const input = document.getElementById('shortAnswerInput');
                    if (feedback && !input?.disabled) {
                        feedback.textContent = '';
                        feedback.className = 'answer-feedback';
                    }
                } else {
                    // Multiple choice: remove highlights
                    const choices = container.querySelectorAll('.choice');
                    choices.forEach(choice => {
                        choice.classList.remove('correct', 'incorrect', 'selected');
                    });
                }

                // Hide explanation
                const explanation = document.getElementById('explanation');
                if (explanation) {
                    explanation.style.display = 'none';
                    const showExplanationBtn = document.getElementById('showExplanationBtn');
                    if (showExplanationBtn) {
                        showExplanationBtn.textContent = 'Show Explanation';
                    }
                }

                showAnswerBtn.textContent = 'Show Answer';
                answerShown = false;
            }
        });
    }

    // Reset answer state when navigating
    window.addEventListener('problemChanged', () => {
        answerShown = false;
        if (showAnswerBtn) {
            showAnswerBtn.textContent = 'Show Answer';
        }
    });

    // Show/Hide Explanation
    const showExplanationBtn = document.getElementById('showExplanationBtn');
    if (showExplanationBtn) {
        showExplanationBtn.addEventListener('click', () => {
            const explanation = document.getElementById('explanation');
            if (!explanation) return;

            if (explanation.style.display === 'none') {
                explanation.style.display = 'block';
                showExplanationBtn.textContent = 'Hide Explanation';
            } else {
                explanation.style.display = 'none';
                showExplanationBtn.textContent = 'Show Explanation';
            }
        });
    }

    // Generate Similar
    const generateSimilarBtn = document.getElementById('generateSimilarBtn');
    if (generateSimilarBtn) {
        generateSimilarBtn.addEventListener('click', () => {
            const problem = filteredProblems[currentIndex];
            if (!problem || !window.problemGenerator) {
                alert('Problem generator not available!');
                return;
            }

            const newProblem = window.problemGenerator.generate(problem);
            if (!newProblem) {
                alert('Could not generate a similar problem for this topic yet!');
                return;
            }

            newProblem.type = 'generated';
            problems.unshift(newProblem);
            filterProblems();
            currentIndex = 0;
            showCurrentProblem();
        });
    }

    // Navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevious);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', goToNext);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goToNext();
        }
    });
}

/* =========================================================
   CALCULATOR
   ========================================================= */

function initializeCalculator() {
    const calculatorBtn = document.getElementById('calculatorBtn');
    const calculatorOverlay = document.getElementById('calculatorOverlay');
    const calculatorClose = document.getElementById('calculatorClose');

    if (calculatorBtn && calculatorOverlay) {
        calculatorBtn.addEventListener('click', () => {
            calculatorOverlay.classList.add('active');
        });
    }

    if (calculatorClose && calculatorOverlay) {
        calculatorClose.addEventListener('click', () => {
            calculatorOverlay.classList.remove('active');
        });
    }

    if (calculatorOverlay) {
        calculatorOverlay.addEventListener('click', (e) => {
            if (e.target === calculatorOverlay) {
                calculatorOverlay.classList.remove('active');
            }
        });
    }
}

/* =========================================================
   THEME
   ========================================================= */

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '☾';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '☾';
        });
    }
}

/* =========================================================
   USER AUTHENTICATION
   ========================================================= */

function updateUserUI() {
    const userAuthSection = document.getElementById('userAuthSection');
    if (!userAuthSection) return;

    if (storage && storage.isLoggedIn && storage.user) {
        // User is logged in
        const user = storage.user;
        const displayName = user.displayName || user.email.split('@')[0];

        userAuthSection.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                ${user.photoURL ? `<img src="${user.photoURL}" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%;">` : ''}
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <span style="font-size: 0.875rem; font-weight: 600; color: var(--text);">${displayName}</span>
                    <button onclick="signOut()" style="font-size: 0.75rem; color: var(--text-light); background: none; border: none; cursor: pointer; padding: 0;">
                        Sign Out
                    </button>
                </div>
            </div>
        `;
    } else {
        // User not logged in
        userAuthSection.innerHTML = `
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="goToAuth('login')" class="action-btn" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                    Login
                </button>
                <button onclick="goToAuth('signup')" class="action-btn primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                    Sign Up
                </button>
            </div>
        `;
    }
}

window.goToAuth = function(mode) {
    // Save current state
    localStorage.setItem('returnToPath', window.location.pathname);
    localStorage.setItem('authMode', mode); // Save login or signup mode

    // Go to single auth page
    window.location.href = './auth.html';
};

window.signOut = async function() {
    if (storage) {
        await storage.logout();
        updateUserUI();
        updateStatsDisplay();
        updateAdaptiveDashboard();
    }
};

/* =========================================================
   STATS
   ========================================================= */

function updateStatsDisplay() {
    if (!storage) return;

    const stats = storage.getStats();

    const statCorrect = document.getElementById('statCorrect');
    const statTotal = document.getElementById('statTotal');
    const statAccuracy = document.getElementById('statAccuracy');

    if (statCorrect) statCorrect.textContent = stats.correctAnswers || 0;
    if (statTotal) statTotal.textContent = stats.uniqueProblems || 0;
    if (statAccuracy) statAccuracy.textContent = `${stats.accuracy || 0}%`;

    // Update adaptive dashboard
    updateAdaptiveDashboard();
}

/* =========================================================
   ADAPTIVE LEARNING DASHBOARD
   ========================================================= */

function updateAdaptiveDashboard() {
    const sidebarDash = document.getElementById('sidebarAdaptiveDashboard');

    if (!sidebarDash || !window.createGamificationDisplay) return;

    // Only show in sidebar after some progress
    const stats = storage ? storage.getStats() : { uniqueProblems: 0 };

    if (stats.uniqueProblems < 1) {
        sidebarDash.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: var(--text-light); font-size: 0.8125rem;">
                Answer a problem to see your progress
            </div>
        `;
        return;
    }

    // Create compact version for sidebar
    const engine = new AdaptiveLearningEngine();
    const level = engine.getStudentLevel();
    const streak = engine.getCurrentStreak();
    const analysis = engine.analyzePerformance();

    let html = '<div style="padding: 1rem; border-top: 1px solid var(--border);">';

    // Compact Stats
    html += `
        <div style="margin-bottom: 0.75rem;">
            <div style="font-size: 0.6875rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.25rem;">Level</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--primary);">${level.level}</div>
            <div style="height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; margin-top: 0.25rem;">
                <div style="height: 100%; background: var(--primary); border-radius: 2px; width: ${(level.xp % 25) / 25 * 100}%;"></div>
            </div>
        </div>
    `;

    if (streak > 0) {
        html += `
            <div style="margin-bottom: 0.75rem;">
                <div style="font-size: 0.6875rem; text-transform: uppercase; color: var(--text-muted);">Streak</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b;">${streak} 🔥</div>
            </div>
        `;
    }

    // Show immediate feedback for strengths/weaknesses
    if (analysis && analysis.weaknesses && analysis.weaknesses.length > 0) {
        const weakness = analysis.weaknesses[0];
        const subskillNames = {
            'linear-equations-one-variable': 'Linear Eq',
            'linear-functions': 'Functions',
            'systems-linear-equations': 'Systems'
        };
        const name = subskillNames[weakness.subskill] || weakness.subskill;

        html += `
            <div style="padding: 0.5rem; background: rgba(220, 38, 38, 0.1); border-radius: 4px; margin-top: 0.75rem;">
                <div style="font-size: 0.6875rem; color: var(--error); font-weight: 600;">⚠ Focus Area</div>
                <div style="font-size: 0.8125rem; font-weight: 600; color: var(--text);">${name} (${Math.round(weakness.accuracy * 100)}%)</div>
            </div>
        `;
    } else if (analysis && analysis.strengths && analysis.strengths.length > 0) {
        const strength = analysis.strengths[0];
        const subskillNames = {
            'linear-equations-one-variable': 'Linear Eq',
            'linear-functions': 'Functions',
            'systems-linear-equations': 'Systems'
        };
        const name = subskillNames[strength.subskill] || strength.subskill;

        html += `
            <div style="padding: 0.5rem; background: rgba(5, 150, 105, 0.1); border-radius: 4px; margin-top: 0.75rem;">
                <div style="font-size: 0.6875rem; color: var(--success); font-weight: 600;">⭐ Strength</div>
                <div style="font-size: 0.8125rem; font-weight: 600; color: var(--text);">${name} (${Math.round(strength.accuracy * 100)}%)</div>
            </div>
        `;
    }

    html += `
        <a href="dashboard.html" style="display: block; margin-top: 0.75rem; text-align: center; color: var(--primary); font-size: 0.8125rem; text-decoration: none; font-weight: 600;">
            View Full Dashboard →
        </a>
    `;

    html += '</div>';

    sidebarDash.innerHTML = html;
}

/* =========================================================
   RESET
   ========================================================= */

function initializeReset() {
    const resetBtn = document.getElementById('resetProgress');
    if (resetBtn && storage) {
        resetBtn.addEventListener('click', async () => {
            if (!confirm('Reset all progress? This cannot be undone.')) return;

            await storage.resetProgress();
            updateStatsDisplay();
            showCurrentProblem();
        });
    }
}

/* =========================================================
   INIT
   ========================================================= */

async function init() {
    console.log('Initializing app...');

    if (window.storage) {
        await storage.init();
        console.log('Storage initialized');
        updateUserUI();
        updateStatsDisplay();
        updateAdaptiveDashboard();

        // Listen for auth state changes
        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('Auth state changed:', user ? 'logged in' : 'logged out');
                updateUserUI();
                if (user) {
                    // Reload progress for new user
                    updateStatsDisplay();
                    updateAdaptiveDashboard();
                }
            });
        }
    }

    initializeTheme();
    initializeSidebar();
    initializeDifficultyTabs();
    initializeActionButtons();
    initializeCalculator();
    initializeReset();

    await loadProblems();
    updateSidebarCounts(); // Update accurate problem counts

    // Check if coming from recommendation
    checkRecommendation();

    console.log('App ready!');
}

function checkRecommendation() {
    const recommendedSubskill = localStorage.getItem('recommendedSubskill');
    const recommendedDifficulty = localStorage.getItem('recommendedDifficulty');
    const viewProblemId = localStorage.getItem('viewProblemId');

    if (viewProblemId) {
        // Clear the flag
        localStorage.removeItem('viewProblemId');

        // Find and show the specific problem
        const problemIndex = problems.findIndex(p => p.id === viewProblemId);
        if (problemIndex !== -1) {
            const problem = problems[problemIndex];

            // Set filters to match this problem
            selectedSubskill = problem.subskill;
            selectedDifficulties.clear();
            selectedDifficulties.add(problem.difficulty.toLowerCase());

            // Update UI
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.subskill === problem.subskill);
            });

            document.querySelectorAll('.difficulty-tab').forEach(tab => {
                const diff = tab.dataset.difficulty;
                tab.classList.toggle('active', diff === problem.difficulty.toLowerCase());
            });

            // Filter and find index
            filterProblems();
            const newIndex = filteredProblems.findIndex(p => p.id === viewProblemId);
            currentIndex = newIndex >= 0 ? newIndex : 0;
            showCurrentProblem();

            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = 'position: fixed; top: 80px; right: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 700; z-index: 1000; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);';
            notification.textContent = `✓ Viewing completed problem: ${viewProblemId}`;
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 3000);
        }
        return;
    }

    if (recommendedSubskill && recommendedDifficulty) {
        // Clear the recommendation
        localStorage.removeItem('recommendedSubskill');
        localStorage.removeItem('recommendedDifficulty');

        // Set the subskill and difficulty
        selectedSubskill = recommendedSubskill;
        selectedDifficulties.clear();
        selectedDifficulties.add(recommendedDifficulty);

        // Update UI
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.subskill === recommendedSubskill);
        });

        document.querySelectorAll('.difficulty-tab').forEach(tab => {
            const diff = tab.dataset.difficulty;
            tab.classList.toggle('active', diff === recommendedDifficulty);
        });

        // Filter and show
        filterProblems();
        showCurrentProblem();

        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 80px; right: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 700; z-index: 1000; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);';
        notification.textContent = '🎯 Starting your recommended practice!';
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

window.addEventListener('resize', () => {
    const menuToggle = document.getElementById('menuToggle');

    if (window.innerWidth <= 768) {
        if (menuToggle) menuToggle.style.display = 'flex';
    } else {
        if (menuToggle) menuToggle.style.display = 'none';
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
});

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function getTopicFromSubskill(subskill) {
    const mapping = {
        'linear-equations-one-variable': 'algebra',
        'linear-functions': 'algebra',
        'linear-equations-two-variables': 'algebra',
        'systems-linear-equations': 'algebra',
        'linear-inequalities': 'algebra',
        'nonlinear-functions': 'advanced-math',
        'nonlinear-equations': 'advanced-math',
        'equivalent-expressions': 'advanced-math',
        'ratios-rates': 'problem-solving',
        'percentages': 'problem-solving',
        'one-variable-data': 'problem-solving',
        'two-variable-data': 'problem-solving',
        'probability': 'problem-solving',
        'inference': 'problem-solving',
        'statistical-claims': 'problem-solving',
        'area-volume': 'geometry',
        'lines-angles-triangles': 'geometry',
        'right-triangles': 'geometry',
        'circles': 'geometry'
    };
    return mapping[subskill] || 'algebra';
}
// Append this to your existing apps.js or replace the relevant functions

/* =========================================================
   MOBILE-ENHANCED FUNCTIONS
   ========================================================= */

// Override checkShortAnswer with modal confirmation
window.checkShortAnswer = async function() {
    const problem = filteredProblems[currentIndex];
    if (!problem) return;

    const input = document.getElementById('shortAnswerInput');
    const feedback = document.getElementById('answerFeedback');

    if (!input || !feedback) return;

    const userAnswer = input.value.trim();
    const correctAnswer = String(problem.answer).trim();

    if (!userAnswer) {
        feedback.textContent = 'Please enter an answer';
        feedback.className = 'answer-feedback';
        return;
    }

    // Use styled modal instead of browser confirm
    const confirmed = await ModalSystem.confirm(
        `Submit your answer: "${userAnswer}"?`,
        'Check Answer'
    );

    if (!confirmed) {
        input.focus();
        return;
    }

    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase() ||
        parseFloat(userAnswer) === parseFloat(correctAnswer);

    if (isCorrect) {
        feedback.textContent = '✓ Correct!';
        feedback.className = 'answer-feedback correct';
        input.disabled = true;

        if (storage) {
            storage.recordAttempt(problem.id, true, 0);
            updateStatsDisplay();
        }

        const explanation = document.getElementById('explanation');
        if (explanation) {
            explanation.style.display = 'block';
            const showExplanationBtn = document.getElementById('showExplanationBtn');
            if (showExplanationBtn) {
                showExplanationBtn.textContent = 'Hide Explanation';
            }
        }
    } else {
        feedback.textContent = `✗ Incorrect. Try again!`;
        feedback.className = 'answer-feedback incorrect';

        if (storage) {
            storage.recordAttempt(problem.id, false, 0);
            updateStatsDisplay();
        }
    }
};

// Enhanced initializeReset with modal
function initializeReset() {
    const resetBtn = document.getElementById('resetProgress');
    if (resetBtn && storage) {
        resetBtn.addEventListener('click', async () => {
            const confirmed = await ModalSystem.confirm(
                'This will permanently delete all your progress, stats, and achievements. This action cannot be undone.',
                'Reset All Progress?',
                true // danger mode
            );

            if (!confirmed) return;

            await storage.resetProgress();
            updateStatsDisplay();
            showCurrentProblem();
            Toast.success('✅ Progress reset successfully!');
        });
    }
}

// Enhanced action buttons with modals/toasts
function initializeActionButtons() {
    // Generate Similar - with toast
    const generateSimilarBtn = document.getElementById('generateSimilarBtn');
    if (generateSimilarBtn) {
        generateSimilarBtn.addEventListener('click', () => {
            const problem = filteredProblems[currentIndex];
            if (!problem || !window.problemGenerator) {
                Toast.error('❌ Problem generator not available!');
                return;
            }

            const newProblem = window.problemGenerator.generate(problem);
            if (!newProblem) {
                Toast.error('❌ Could not generate a similar problem for this topic yet!');
                return;
            }

            newProblem.type = 'generated';
            problems.unshift(newProblem);
            filterProblems();
            currentIndex = 0;
            showCurrentProblem();
            Toast.success('✨ Generated similar problem!');
        });
    }

    // Show/Hide Answer
    const showAnswerBtn = document.getElementById('showAnswerBtn');
    let answerShown = false;

    if (showAnswerBtn) {
        showAnswerBtn.addEventListener('click', () => {
            const problem = filteredProblems[currentIndex];
            if (!problem) return;

            const container = document.getElementById('problemContainer');
            const isShortAnswer = !problem.choices || problem.choices.length === 0;

            if (!answerShown) {
                // SHOW ANSWER
                if (isShortAnswer) {
                    const feedback = document.getElementById('answerFeedback');
                    if (feedback) {
                        feedback.textContent = `Answer: ${problem.answer}`;
                        feedback.className = 'answer-feedback correct';
                    }
                } else {
                    const choices = container.querySelectorAll('.choice');
                    choices.forEach(choice => {
                        if (choice.dataset.choice === problem.answer) {
                            choice.classList.add('correct');
                        }
                    });
                }

                const explanation = document.getElementById('explanation');
                if (explanation) {
                    explanation.style.display = 'block';
                    const showExplanationBtn = document.getElementById('showExplanationBtn');
                    if (showExplanationBtn) {
                        showExplanationBtn.textContent = 'Hide Explanation';
                    }
                }

                showAnswerBtn.textContent = 'Hide Answer';
                answerShown = true;
            } else {
                // HIDE ANSWER
                if (isShortAnswer) {
                    const feedback = document.getElementById('answerFeedback');
                    const input = document.getElementById('shortAnswerInput');
                    if (feedback && !input?.disabled) {
                        feedback.textContent = '';
                        feedback.className = 'answer-feedback';
                    }
                } else {
                    const choices = container.querySelectorAll('.choice');
                    choices.forEach(choice => {
                        choice.classList.remove('correct', 'incorrect', 'selected');
                    });
                }

                const explanation = document.getElementById('explanation');
                if (explanation) {
                    explanation.style.display = 'none';
                    const showExplanationBtn = document.getElementById('showExplanationBtn');
                    if (showExplanationBtn) {
                        showExplanationBtn.textContent = 'Show Explanation';
                    }
                }

                showAnswerBtn.textContent = 'Show Answer';
                answerShown = false;
            }
        });
    }

    // Reset answer state when navigating
    window.addEventListener('problemChanged', () => {
        answerShown = false;
        if (showAnswerBtn) {
            showAnswerBtn.textContent = 'Show Answer';
        }
    });

    // Show/Hide Explanation
    const showExplanationBtn = document.getElementById('showExplanationBtn');
    if (showExplanationBtn) {
        showExplanationBtn.addEventListener('click', () => {
            const explanation = document.getElementById('explanation');
            if (!explanation) return;

            if (explanation.style.display === 'none') {
                explanation.style.display = 'block';
                showExplanationBtn.textContent = 'Hide Explanation';
            } else {
                explanation.style.display = 'none';
                showExplanationBtn.textContent = 'Show Explanation';
            }
        });
    }

    // Navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevious);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', goToNext);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goToNext();
        }
    });
}

// Enhanced checkRecommendation with toast
function checkRecommendation() {
    const recommendedSubskill = localStorage.getItem('recommendedSubskill');
    const recommendedDifficulty = localStorage.getItem('recommendedDifficulty');
    const viewProblemId = localStorage.getItem('viewProblemId');

    if (viewProblemId) {
        localStorage.removeItem('viewProblemId');

        const problemIndex = problems.findIndex(p => p.id === viewProblemId);
        if (problemIndex !== -1) {
            const problem = problems[problemIndex];

            selectedSubskill = problem.subskill;
            selectedDifficulties.clear();
            selectedDifficulties.add(problem.difficulty.toLowerCase());

            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.subskill === problem.subskill);
            });

            document.querySelectorAll('.difficulty-tab').forEach(tab => {
                const diff = tab.dataset.difficulty;
                tab.classList.toggle('active', diff === problem.difficulty.toLowerCase());
            });

            filterProblems();
            const newIndex = filteredProblems.findIndex(p => p.id === viewProblemId);
            currentIndex = newIndex >= 0 ? newIndex : 0;
            showCurrentProblem();

            Toast.info(`✓ Viewing completed problem: ${viewProblemId}`);
        }
        return;
    }

    if (recommendedSubskill && recommendedDifficulty) {
        localStorage.removeItem('recommendedSubskill');
        localStorage.removeItem('recommendedDifficulty');

        selectedSubskill = recommendedSubskill;
        selectedDifficulties.clear();
        selectedDifficulties.add(recommendedDifficulty);

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.subskill === recommendedSubskill);
        });

        document.querySelectorAll('.difficulty-tab').forEach(tab => {
            const diff = tab.dataset.difficulty;
            tab.classList.toggle('active', diff === recommendedDifficulty);
        });

        filterProblems();
        showCurrentProblem();

        Toast.success('🎯 Starting your recommended practice!');
    }
}
// Cross-Out and Bookmark Feature
// Add this to your apps.js or include as separate file

/* =========================================================
   BOOKMARK SYSTEM
   ========================================================= */

const BookmarkSystem = {
    bookmarks: new Set(),

    init() {
        // Load bookmarks from localStorage
        const saved = localStorage.getItem('bookmarkedProblems');
        if (saved) {
            this.bookmarks = new Set(JSON.parse(saved));
        }
    },

    toggle(problemId) {
        if (this.bookmarks.has(problemId)) {
            this.bookmarks.delete(problemId);
            Toast.info('📑 Bookmark removed');
        } else {
            this.bookmarks.add(problemId);
            Toast.success('⭐ Problem bookmarked!');
        }
        this.save();
        return this.bookmarks.has(problemId);
    },

    isBookmarked(problemId) {
        return this.bookmarks.has(problemId);
    },

    getAll() {
        return Array.from(this.bookmarks);
    },

    save() {
        localStorage.setItem('bookmarkedProblems', JSON.stringify(Array.from(this.bookmarks)));
    },

    clear() {
        this.bookmarks.clear();
        this.save();
    }
};

/* =========================================================
   CROSS-OUT SYSTEM
   ========================================================= */

const CrossOutSystem = {
    crossedOut: new Map(), // problemId -> Set of choice letters

    toggle(problemId, choiceLetter) {
        if (!this.crossedOut.has(problemId)) {
            this.crossedOut.set(problemId, new Set());
        }

        const crossed = this.crossedOut.get(problemId);
        if (crossed.has(choiceLetter)) {
            crossed.delete(choiceLetter);
        } else {
            crossed.add(choiceLetter);
        }
    },

    isCrossedOut(problemId, choiceLetter) {
        return this.crossedOut.has(problemId) && this.crossedOut.get(problemId).has(choiceLetter);
    },

    clear(problemId) {
        this.crossedOut.delete(problemId);
    },

    clearAll() {
        this.crossedOut.clear();
    }
};

/* =========================================================
   ENHANCED showCurrentProblem WITH BOOKMARKS + CROSS-OUT
   ========================================================= */

function showCurrentProblem() {
    const container = document.getElementById('problemContainer');
    if (!container) return;

    if (filteredProblems.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <p style="color: var(--text-light);">No problems available.</p>
                <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.875rem;">
                    Try selecting different difficulty levels.
                </p>
            </div>
        `;
        return;
    }

    const problem = filteredProblems[currentIndex];
    const progress = storage ? storage.getProgress() : { problems: {} };
    const problemProgress = progress.problems ? progress.problems[problem.id] : null;

    const difficultyClass = problem.difficulty.toLowerCase();
    const difficultyDisplay = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);
    const isShortAnswer = !problem.choices || problem.choices.length === 0;
    const isBookmarked = BookmarkSystem.isBookmarked(problem.id);

    container.innerHTML = `
        <div class="problem-header">
            <div class="problem-id">${problem.id}</div>
            <div class="problem-badges">
                <span class="badge badge-difficulty badge-${difficultyClass}">${difficultyDisplay}</span>
                ${problemProgress?.correct ? '<span class="badge badge-solved">✓ Solved</span>' : ''}
                ${isBookmarked ? '<span class="bookmarked-badge">⭐ Bookmarked</span>' : ''}
            </div>
        </div>

        <!-- Bookmark Button -->
        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                onclick="toggleBookmark('${problem.id}')"
                title="${isBookmarked ? 'Remove bookmark' : 'Bookmark this problem'}">
            ${isBookmarked ? '⭐' : '☆'}
        </button>

        <div class="problem-content">${problem.question}</div>

        ${problem.imageUrl ? `<img src="../${problem.imageUrl}" alt="Problem diagram" style="max-width: 100%; height: auto; margin-bottom: 2rem; border-radius: 8px;">` : ''}

        ${isShortAnswer ? `
            <!-- Short Answer Input -->
            <div class="answer-input-group">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text);">Your Answer:</label>
                <input type="text" 
                       class="answer-input" 
                       id="shortAnswerInput"
                       placeholder="Enter your answer" 
                       data-correct="${problem.answer}">
                <button class="check-answer-btn" onclick="checkShortAnswer()">Check Answer</button>
                <div class="answer-feedback" id="answerFeedback"></div>
            </div>
        ` : `
            <!-- Multiple Choice with Cross-Out -->
            <div class="problem-choices">
                ${problem.choices.map((choice, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const isCrossed = CrossOutSystem.isCrossedOut(problem.id, letter);
        return `
                        <div class="choice-wrapper">
                            <div class="choice ${isCrossed ? 'crossed-out' : ''}" 
                                 data-choice="${letter}" 
                                 onclick="selectChoice('${letter}')">
                                ${choice}
                            </div>
                            <div class="choice-actions">
                                <button class="choice-action-btn" 
                                        onclick="toggleCrossOut('${problem.id}', '${letter}')"
                                        title="Cross out this answer">
                                    ${isCrossed ? '↺' : '✕'}
                                </button>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        `}

        ${problem.explanation ? `
            <div class="explanation" id="explanation" style="display: none;">
                <div class="explanation-header">💡 Explanation</div>
                <div class="explanation-content">${problem.explanation}</div>
            </div>
        ` : ''}
    `;

    const showExplanationBtn = document.getElementById('showExplanationBtn');
    if (showExplanationBtn) {
        if (problem.explanation) {
            showExplanationBtn.style.display = 'block';
            showExplanationBtn.textContent = 'Show Explanation';
        } else {
            showExplanationBtn.style.display = 'none';
        }
    }

    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    window.dispatchEvent(new Event('problemChanged'));
    updateStatsDisplay();
}

/* =========================================================
   BOOKMARK FUNCTIONS
   ========================================================= */

window.toggleBookmark = function(problemId) {
    const isBookmarked = BookmarkSystem.toggle(problemId);

    // Update button
    const btn = document.querySelector('.bookmark-btn');
    if (btn) {
        btn.classList.toggle('bookmarked', isBookmarked);
        btn.textContent = isBookmarked ? '⭐' : '☆';
        btn.title = isBookmarked ? 'Remove bookmark' : 'Bookmark this problem';
    }

    // Update badge
    const badges = document.querySelector('.problem-badges');
    if (badges) {
        const existingBadge = badges.querySelector('.bookmarked-badge');
        if (isBookmarked && !existingBadge) {
            badges.insertAdjacentHTML('beforeend', '<span class="bookmarked-badge">⭐ Bookmarked</span>');
        } else if (!isBookmarked && existingBadge) {
            existingBadge.remove();
        }
    }
};

window.goToBookmarkedProblems = function() {
    const bookmarked = BookmarkSystem.getAll();

    if (bookmarked.length === 0) {
        Toast.info('📑 No bookmarked problems yet!');
        return;
    }

    // Filter to show only bookmarked problems
    filteredProblems = problems.filter(p => bookmarked.includes(p.id));

    if (filteredProblems.length === 0) {
        Toast.error('Bookmarked problems not found in current filters');
        return;
    }

    currentIndex = 0;
    showCurrentProblem();
    Toast.success(`📚 Viewing ${filteredProblems.length} bookmarked problem(s)`);
};

/* =========================================================
   CROSS-OUT FUNCTIONS
   ========================================================= */

window.toggleCrossOut = function(problemId, choiceLetter) {
    CrossOutSystem.toggle(problemId, choiceLetter);

    // Update the choice element
    const choice = document.querySelector(`[data-choice="${choiceLetter}"]`);
    const btn = choice?.parentElement.querySelector('.choice-action-btn');

    if (choice) {
        choice.classList.toggle('crossed-out');
    }

    if (btn) {
        const isCrossed = CrossOutSystem.isCrossedOut(problemId, choiceLetter);
        btn.textContent = isCrossed ? '↺' : '✕';
        btn.title = isCrossed ? 'Undo cross-out' : 'Cross out this answer';
    }
};

/* =========================================================
   INITIALIZE
   ========================================================= */

// Call this in your init() function
function initializeBookmarkSystem() {
    BookmarkSystem.init();

    // Add bookmarks link to sidebar if needed
    const sidebarAdaptive = document.getElementById('sidebarAdaptiveDashboard');
    if (sidebarAdaptive) {
        // Add bookmark counter to adaptive section
        const updateBookmarkCount = () => {
            const count = BookmarkSystem.getAll().length;
            let bookmarkSection = document.getElementById('bookmarkSection');

            if (count > 0) {
                if (!bookmarkSection) {
                    const html = `
                        <div id="bookmarkSection" style="padding: 1rem; border-top: 1px solid var(--border); cursor: pointer;" onclick="goToBookmarkedProblems()">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-size: 0.875rem; font-weight: 600; color: var(--text);">
                                    ⭐ Bookmarks
                                </span>
                                <span style="font-size: 0.875rem; font-weight: 700; color: #F59E0B;">
                                    ${count}
                                </span>
                            </div>
                        </div>
                    `;
                    sidebarAdaptive.insertAdjacentHTML('afterbegin', html);
                } else {
                    const countSpan = bookmarkSection.querySelector('span:last-child');
                    if (countSpan) countSpan.textContent = count;
                }
            } else if (bookmarkSection) {
                bookmarkSection.remove();
            }
        };

        // Update on init and when bookmarks change
        updateBookmarkCount();

        // Override toggle to update count
        const originalToggle = BookmarkSystem.toggle;
        BookmarkSystem.toggle = function(problemId) {
            const result = originalToggle.call(this, problemId);
            updateBookmarkCount();
            return result;
        };
    }
}

// Add to your existing init() function:
// initializeBookmarkSystem();

/* =========================================================
   EXPORT
   ========================================================= */

window.BookmarkSystem = BookmarkSystem;
window.CrossOutSystem = CrossOutSystem;