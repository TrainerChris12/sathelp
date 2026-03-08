// apps.js - SAT Math Practice Hub - Smart Hybrid System

/* =========================================================
   STATE - SMART HYBRID
   ========================================================= */

let allStaticProblems = []; // Original static problems from JSON
let problemQueue = []; // Active queue (smart mix)
let currentIndex = 0;
let selectedSubskill = 'linear-equations-one-variable';
let selectedDifficulties = new Set(['easy', 'medium', 'hard']);

// Bookmark mode state
let isBookmarkMode = false;
let previousQueue = []; // Store queue before entering bookmark mode
let previousIndex = 0;

// Make allStaticProblems globally available for mastery system
window.allStaticProblems = allStaticProblems;

// Track generation preferences
let autoGenerateEnabled = true; // Auto-fill queue when low
let minQueueSize = 10; // Keep at least this many problems ahead

/* =========================================================
   SMART PROBLEM QUEUE
   ========================================================= */

const SmartQueue = {
    // Initialize with static problems
    init(staticProblems) {
        allStaticProblems = staticProblems;
        window.allStaticProblems = allStaticProblems; // Update global reference
        this.rebuildQueue();
    },

    // Rebuild queue based on filters
    rebuildQueue() {
        const progress = storage ? storage.getProgress() : { problems: {} };

        // Get unsolved static problems
        const unsolvedStatic = allStaticProblems.filter(p => {
            const matchesSubskill = p.subskill === selectedSubskill;
            const matchesDifficulty = selectedDifficulties.has(p.difficulty.toLowerCase());
            const isCompleted = progress.problems && progress.problems[p.id]?.correct === true;
            return matchesSubskill && matchesDifficulty && !isCompleted;
        });

        // Get existing generated problems that match filters
        const existingGenerated = problemQueue.filter(p =>
            p.type === 'generated' &&
            p.subskill === selectedSubskill &&
            selectedDifficulties.has(p.difficulty.toLowerCase())
        );

        // SMART MIXING LOGIC:
        if (unsolvedStatic.length >= 5) {
            // Plenty of static problems - show mostly static with some generated mixed in
            const shuffledStatic = this.shuffle([...unsolvedStatic]);
            const generatedToMix = existingGenerated.slice(0, Math.min(3, existingGenerated.length));
            problemQueue = [...shuffledStatic, ...generatedToMix];
        } else if (unsolvedStatic.length > 0) {
            // Few static left - mix 50/50 with generated
            const shuffledStatic = this.shuffle([...unsolvedStatic]);
            problemQueue = this.interleave(shuffledStatic, existingGenerated);
        } else {
            // No static left - all generated
            problemQueue = [...existingGenerated];

            // CRITICAL: If queue is empty (switching topics with all static done), 
            // immediately generate the minimum queue size
            if (problemQueue.length === 0 && autoGenerateEnabled) {
                this.autoFillQueue();
            } else if (problemQueue.length < minQueueSize && autoGenerateEnabled) {
                // Otherwise just top up if low
                this.autoFillQueue();
            }
        }

        // Keep current index valid
        currentIndex = Math.min(currentIndex, Math.max(0, problemQueue.length - 1));
    },

    // Interleave two arrays (mix evenly)
    interleave(arr1, arr2) {
        const result = [];
        const maxLen = Math.max(arr1.length, arr2.length);

        for (let i = 0; i < maxLen; i++) {
            if (i < arr1.length) result.push(arr1[i]);
            if (i < arr2.length) result.push(arr2[i]);
        }

        return result;
    },

    // Auto-fill queue with generated problems
    autoFillQueue() {
        if (!window.problemGenerator) return;

        const needed = minQueueSize - problemQueue.length;
        if (needed <= 0) return;

        const difficulties = Array.from(selectedDifficulties);

        for (let i = 0; i < needed; i++) {
            const difficulty = difficulties[i % difficulties.length];
            const template = {
                id: 'TEMPLATE',
                topic: 'algebra',
                subskill: selectedSubskill,
                difficulty: difficulty
            };

            const newProblem = window.problemGenerator.generate(template);
            if (newProblem) {
                newProblem.type = 'generated';
                newProblem.generatedAt = Date.now();
                problemQueue.push(newProblem);
            }
        }

        console.log(`📝 Auto-filled queue with ${needed} generated problems`);
    },

    // Add a single generated problem after current
    addGenerated(problem) {
        problem.type = 'generated';
        problem.generatedAt = Date.now();

        // Insert RIGHT AFTER current position
        problemQueue.splice(currentIndex + 1, 0, problem);

        // Move to the new problem
        currentIndex = currentIndex + 1;

        this.cleanupOldGenerated();
    },

    // Check if we need to auto-generate more
    checkAndAutoFill() {
        const remainingProblems = problemQueue.length - currentIndex - 1;

        if (remainingProblems < 3 && autoGenerateEnabled) {
            this.autoFillQueue();
        }
    },

    // Clean up old generated to prevent bloat
    cleanupOldGenerated() {
        const generated = problemQueue.filter(p => p.type === 'generated');

        if (generated.length > 50) {
            generated.sort((a, b) => a.generatedAt - b.generatedAt);

            const toRemove = generated.slice(0, generated.length - 50);
            const removeIds = new Set(toRemove.map(p => p.id));

            problemQueue = problemQueue.filter(p => !removeIds.has(p.id));

            if (currentIndex >= problemQueue.length) {
                currentIndex = Math.max(0, problemQueue.length - 1);
            }
        }
    },

    // Shuffle helper
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    getCurrent() {
        return problemQueue[currentIndex];
    },

    getStats() {
        const progress = storage ? storage.getProgress() : { problems: {} };

        const unsolvedStatic = allStaticProblems.filter(p => {
            const matchesSubskill = p.subskill === selectedSubskill;
            const isCompleted = progress.problems && progress.problems[p.id]?.correct === true;
            return matchesSubskill && !isCompleted;
        });

        const generated = problemQueue.filter(p => p.type === 'generated').length;
        const static_ = problemQueue.filter(p => p.type !== 'generated').length;

        return {
            total: problemQueue.length,
            generated: generated,
            static: static_,
            unsolvedStatic: unsolvedStatic.length,
            currentType: this.getCurrent()?.type || 'none'
        };
    }
};

/* =========================================================
   BOOKMARK SYSTEM
   ========================================================= */

const BookmarkSystem = {
    bookmarks: new Set(),

    init() {
        const saved = localStorage.getItem('bookmarkedProblems');
        if (saved) {
            this.bookmarks = new Set(JSON.parse(saved));
        }
    },

    toggle(problemId) {
        if (this.bookmarks.has(problemId)) {
            this.bookmarks.delete(problemId);
        } else {
            this.bookmarks.add(problemId);
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
    crossedOut: new Map(),

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
   LOAD PROBLEMS
   ========================================================= */

async function loadProblems() {
    console.log('Loading problems...');
    try {
        const response = await fetch('../data/problems.json');
        const staticProblems = await response.json();
        console.log('Loaded', staticProblems.length, 'static problems');

        SmartQueue.init(staticProblems);
        showCurrentProblem();
    } catch (error) {
        console.error('Error loading problems:', error);
        const container = document.getElementById('problemContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--error);">
                    <p>Error loading problems.</p>
                    <p style="margin-top: 1rem;">Check console for details</p>
                </div>
            `;
        }
    }
}

function filterProblems() {
    SmartQueue.rebuildQueue();
    currentIndex = 0;
    showCurrentProblem();
    updateProgressIndicator();
    updateNavigationButtons();
    updateSidebarCounts();
}

/* =========================================================
   DISPLAY PROBLEM
   ========================================================= */

function showCurrentProblem() {
    const container = document.getElementById('problemContainer');
    if (!container) return;

    const problem = SmartQueue.getCurrent();

    if (!problem) {
        const stats = SmartQueue.getStats();

        // If all static mastered and queue empty, auto-generate now
        if (stats.unsolvedStatic === 0 && problemQueue.length === 0 && window.problemGenerator) {
            console.log('🎉 All static mastered! Auto-generating practice problems...');
            SmartQueue.autoFillQueue();

            // Try to show problem again after generating
            const newProblem = SmartQueue.getCurrent();
            if (newProblem) {
                // Recursively call to display the newly generated problem
                showCurrentProblem();
                return;
            }
        }

        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <p style="color: var(--text-light); font-size: 1.5rem; margin-bottom: 1rem;">
                    ${stats.unsolvedStatic === 0 ? '🎉 All Problems Mastered!' : 'No Problems Available'}
                </p>
                <p style="color: var(--text-muted); font-size: 0.875rem;">
                    ${stats.unsolvedStatic === 0 ?
            'Click "Practice Similar" for infinite practice!' :
            'Try selecting different difficulty levels.'}
                </p>
            </div>
        `;
        return;
    }

    const progress = storage ? storage.getProgress() : { problems: {} };
    const problemProgress = progress.problems ? progress.problems[problem.id] : null;

    const difficultyClass = problem.difficulty.toLowerCase();
    const difficultyDisplay = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);
    const isShortAnswer = !problem.choices || problem.choices.length === 0;
    const isBookmarked = BookmarkSystem.isBookmarked(problem.id);

    let typeBadge = '';
    if (problem.type === 'generated') {
        typeBadge = '<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981;">Practice</span>';
    }

    container.innerHTML = `
        <div class="problem-header">
            <div class="problem-id">${problem.id}</div>
            <div class="problem-badges">
                <span class="badge badge-difficulty badge-${difficultyClass}">${difficultyDisplay}</span>
                ${typeBadge}
                ${problemProgress?.correct ? '<span class="badge badge-solved">✓ Solved</span>' : ''}
                ${isBookmarked ? '<span class="bookmarked-badge">⭐ Bookmarked</span>' : ''}
                <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                        onclick="toggleBookmark('${problem.id}')"
                        title="${isBookmarked ? 'Remove bookmark' : 'Bookmark this problem'}">
                    ${isBookmarked ? '⭐' : '☆'}
                </button>
            </div>
        </div>

        <div class="problem-content">${problem.question}</div>

        ${problem.imageUrl ? `<img src="../${problem.imageUrl}" alt="Problem diagram" style="max-width: 100%; height: auto; margin-bottom: 2rem; border-radius: 8px;">` : ''}

        ${isShortAnswer ? `
            <div class="answer-input-group">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text);">Your Answer:</label>
                <input type="text" 
                       class="answer-input" 
                       id="shortAnswerInput"
                       placeholder="Enter your answer" 
                       data-correct="${problem.answer}">
                <button class="check-answer-btn" id="checkAnswerBtn">Check Answer</button>
                <div class="answer-feedback" id="answerFeedback"></div>
            </div>
        ` : `
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
                                <button class="choice-action-btn ${isCrossed ? 'crossed' : ''}" 
                                        onclick="toggleCrossOut('${problem.id}', '${letter}')"
                                        title="${isCrossed ? 'Undo cross-out' : 'Cross out this answer'}">
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
        showExplanationBtn.style.display = problem.explanation ? 'block' : 'none';
        showExplanationBtn.textContent = 'Show Explanation';
    }

    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    window.dispatchEvent(new Event('problemChanged'));
    updateStatsDisplay();
}

/* =========================================================
   ANSWER SELECTION
   ========================================================= */

window.selectChoice = function(choiceLetter) {
    const problem = SmartQueue.getCurrent();
    if (!problem) return;

    const container = document.getElementById('problemContainer');
    const choices = container.querySelectorAll('.choice');

    choices.forEach(c => c.classList.remove('selected', 'correct', 'incorrect'));

    const selectedChoice = container.querySelector(`[data-choice="${choiceLetter}"]`);
    if (selectedChoice) {
        selectedChoice.classList.add('selected');
    }

    const isCorrect = choiceLetter === problem.answer;

    if (isCorrect) {
        selectedChoice.classList.remove('selected');
        selectedChoice.classList.add('correct');

        if (storage) {
            storage.recordAttempt(problem.id, true, 0);
            updateStatsDisplay();
            updateSidebarCounts();

            // Check for new achievements
            if (window.AchievementSystem) {
                AchievementSystem.checkNewAchievements();
            }

            // Update Practice Similar button visibility
            if (window.updatePracticeSimilarButton) {
                updatePracticeSimilarButton();
            }
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
        selectedChoice.classList.add('incorrect');

        if (storage) {
            storage.recordAttempt(problem.id, false, 0);
            updateStatsDisplay();
        }
    }
};

window.checkShortAnswer = async function() {
    const problem = SmartQueue.getCurrent();
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

    const confirmed = await ModalSystem.confirm(
        'Confirm Answer',
        `Are you sure your answer is "<strong>${userAnswer}</strong>"?`
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
            updateSidebarCounts();

            // Check for new achievements
            if (window.AchievementSystem) {
                AchievementSystem.checkNewAchievements();
            }

            // Update Practice Similar button visibility
            if (window.updatePracticeSimilarButton) {
                updatePracticeSimilarButton();
            }
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

/* =========================================================
   BOOKMARK & CROSS-OUT FUNCTIONS
   ========================================================= */

window.toggleBookmark = function(problemId) {
    const isBookmarked = BookmarkSystem.toggle(problemId);

    BookmarkSystem.save();

    const btn = document.querySelector('.bookmark-btn');
    if (btn) {
        btn.classList.toggle('bookmarked', isBookmarked);
        btn.textContent = isBookmarked ? '⭐' : '☆';
        btn.title = isBookmarked ? 'Remove bookmark' : 'Bookmark this problem';
    }

    const badges = document.querySelector('.problem-badges');
    if (badges) {
        const existingBadge = badges.querySelector('.bookmarked-badge');
        if (isBookmarked && !existingBadge) {
            const bookmarkBtn = badges.querySelector('.bookmark-btn');
            bookmarkBtn.insertAdjacentHTML('beforebegin', '<span class="bookmarked-badge">⭐ Bookmarked</span>');
        } else if (!isBookmarked && existingBadge) {
            existingBadge.remove();
        }
    }

    // Update bookmark count in sidebar
    updateBookmarkCount();

    // Update bookmark mode banner if in bookmark mode
    if (isBookmarkMode) {
        updateBookmarkModeUI();
    }
};

window.toggleCrossOut = function(problemId, choiceLetter) {
    CrossOutSystem.toggle(problemId, choiceLetter);

    const choice = document.querySelector(`[data-choice="${choiceLetter}"]`);
    const btn = choice?.parentElement.querySelector('.choice-action-btn');

    const isCrossed = CrossOutSystem.isCrossedOut(problemId, choiceLetter);

    if (choice) {
        choice.classList.toggle('crossed-out', isCrossed);
    }

    if (btn) {
        btn.textContent = isCrossed ? '↺' : '✕';
        btn.classList.toggle('crossed', isCrossed);
        btn.title = isCrossed ? 'Undo cross-out' : 'Cross out this answer';
    }
};

window.goToBookmarkedProblems = function() {
    const bookmarked = BookmarkSystem.getAll();

    if (bookmarked.length === 0) {
        ModalSystem.alert('No Bookmarks', 'You haven\'t bookmarked any problems yet!');
        return;
    }

    // Filter only bookmarked problems from all static problems
    const bookmarkedProblems = allStaticProblems.filter(p => bookmarked.includes(p.id));

    if (bookmarkedProblems.length === 0) {
        ModalSystem.alert('Error', 'Bookmarked problems not found.');
        return;
    }

    // Save current state before entering bookmark mode
    previousQueue = [...problemQueue];
    previousIndex = currentIndex;

    // Enter bookmark mode
    isBookmarkMode = true;
    problemQueue = bookmarkedProblems;
    currentIndex = 0;

    showCurrentProblem();
    updateProgressIndicator();
    updateNavigationButtons();
    updateBookmarkModeUI();
};

window.exitBookmarkMode = function() {
    if (!isBookmarkMode) return;

    // Restore previous state
    isBookmarkMode = false;
    problemQueue = previousQueue;
    currentIndex = previousIndex;

    showCurrentProblem();
    updateProgressIndicator();
    updateNavigationButtons();
    updateBookmarkModeUI();
};

/* =========================================================
   NAVIGATION
   ========================================================= */

function goToNext() {
    if (currentIndex < problemQueue.length - 1) {
        currentIndex++;

        // Only auto-fill in normal mode, not bookmark mode
        if (!isBookmarkMode) {
            SmartQueue.checkAndAutoFill();
        }
    } else {
        // At the very end
        if (isBookmarkMode) {
            // In bookmark mode, just stay at the last problem
            return;
        } else {
            // In normal mode, auto-generate one more
            generateSimilarProblem();
            return;
        }
    }

    showCurrentProblem();
    updateProgressIndicator();
    updateNavigationButtons();

    // Update Practice Similar button
    if (window.updatePracticeSimilarButton) {
        updatePracticeSimilarButton();
    }

    scrollToTop();
}

function goToPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        showCurrentProblem();
        updateProgressIndicator();
        updateNavigationButtons();

        // Update Practice Similar button
        if (window.updatePracticeSimilarButton) {
            updatePracticeSimilarButton();
        }

        scrollToTop();
    }
}

function updateProgressIndicator() {
    const indicator = document.getElementById('progressIndicator');
    if (!indicator) return;

    if (isBookmarkMode) {
        indicator.textContent = `${currentIndex + 1} / ${problemQueue.length}`;
        indicator.style.color = '#F59E0B';
        indicator.title = 'Bookmark mode - viewing bookmarked problems';
        return;
    }

    const stats = SmartQueue.getStats();
    const problem = SmartQueue.getCurrent();

    if (problem?.type === 'generated') {
        indicator.textContent = `${currentIndex + 1} / ${problemQueue.length}`;
        indicator.style.color = '#10b981';
        indicator.title = 'Generated problem - infinite practice!';
    } else {
        indicator.textContent = `${currentIndex + 1} / ${problemQueue.length}`;
        indicator.style.color = '';
        indicator.title = stats.unsolvedStatic > 0 ?
            `${stats.unsolvedStatic} static problems remaining` :
            'Infinite practice mode';
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = false; // Never disabled
}

function scrollToTop() {
    const problemArea = document.querySelector('.problem-area');
    if (problemArea) {
        problemArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* =========================================================
   GENERATE SIMILAR
   ========================================================= */

function generateSimilarProblem() {
    const currentProblem = SmartQueue.getCurrent();

    if (!currentProblem || !window.problemGenerator) {
        ModalSystem.alert('Error', 'Problem generator not available!');
        return;
    }

    const newProblem = window.problemGenerator.generate(currentProblem);

    if (!newProblem) {
        ModalSystem.alert('Error', 'Could not generate a similar problem. Try again!');
        return;
    }

    SmartQueue.addGenerated(newProblem);

    showCurrentProblem();
    updateProgressIndicator();
    updateNavigationButtons();
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function updateSidebarCounts() {
    // Use mastery system if available
    if (window.updateSidebarWithMastery) {
        updateSidebarWithMastery();
        return;
    }

    // Fallback to original
    const progress = storage ? storage.getProgress() : { problems: {} };

    document.querySelectorAll('.nav-item').forEach(item => {
        const subskill = item.dataset.subskill;
        if (!subskill) return;

        const totalStatic = allStaticProblems.filter(p => p.subskill === subskill).length;
        const unsolvedStatic = allStaticProblems.filter(p => {
            const matchesSubskill = p.subskill === subskill;
            const isCompleted = progress.problems && progress.problems[p.id]?.correct === true;
            return matchesSubskill && !isCompleted;
        }).length;

        const badge = item.querySelector('.nav-item-badge');
        if (badge) {
            if (unsolvedStatic === 0) {
                // All solved - show checkmark
                badge.textContent = '✓';
                badge.style.background = 'rgba(16, 185, 129, 0.15)';
                badge.style.color = '#10b981';
                badge.title = `All ${totalStatic} problems mastered! Infinite practice available.`;
            } else if (unsolvedStatic < totalStatic * 0.3) {
                // Almost done - show count with special color
                badge.textContent = unsolvedStatic;
                badge.style.background = 'rgba(245, 158, 11, 0.15)';
                badge.style.color = '#F59E0B';
                badge.title = `${unsolvedStatic} of ${totalStatic} remaining`;
            } else {
                // Normal - show count
                badge.textContent = unsolvedStatic;
                badge.style.background = '';
                badge.style.color = '';
                badge.title = `${unsolvedStatic} of ${totalStatic} unsolved`;
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

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    let sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.id = 'sidebarOverlay';
        sidebarOverlay.className = 'sidebar-overlay';
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.insertBefore(sidebarOverlay, appContainer.firstChild);
        }
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    if (window.innerWidth <= 768 && menuToggle) {
        menuToggle.style.display = 'flex';
    }
}

function selectSubskill(subskill) {
    // Exit bookmark mode if active
    if (isBookmarkMode) {
        exitBookmarkMode();
    }

    selectedSubskill = subskill;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const selectedItem = document.querySelector(`[data-subskill="${subskill}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    currentIndex = 0;
    filterProblems();
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
    // Exit bookmark mode if active
    if (isBookmarkMode) {
        exitBookmarkMode();
    }

    if (selectedDifficulties.has(difficulty)) {
        selectedDifficulties.delete(difficulty);
        tab.classList.remove('active');
    } else {
        selectedDifficulties.add(difficulty);
        tab.classList.add('active');
    }

    currentIndex = 0;
    filterProblems();
}

/* =========================================================
   ACTION BUTTONS
   ========================================================= */

function initializeActionButtons() {
    const showAnswerBtn = document.getElementById('showAnswerBtn');
    let answerShown = false;

    if (showAnswerBtn) {
        showAnswerBtn.addEventListener('click', () => {
            const problem = SmartQueue.getCurrent();
            if (!problem) return;

            const container = document.getElementById('problemContainer');
            const isShortAnswer = !problem.choices || problem.choices.length === 0;

            if (!answerShown) {
                // Mark that hints were viewed
                if (storage && storage.markHintViewed) {
                    storage.markHintViewed(problem.id);
                }

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

    window.addEventListener('problemChanged', () => {
        answerShown = false;
        if (showAnswerBtn) {
            showAnswerBtn.textContent = 'Show Answer';
        }

        // Attach check answer button listener
        const checkAnswerBtn = document.getElementById('checkAnswerBtn');
        if (checkAnswerBtn) {
            checkAnswerBtn.onclick = async () => {
                await window.checkShortAnswer();
            };
        }
    });

    const showExplanationBtn = document.getElementById('showExplanationBtn');
    if (showExplanationBtn) {
        showExplanationBtn.addEventListener('click', () => {
            const explanation = document.getElementById('explanation');
            if (!explanation) return;

            if (explanation.style.display === 'none') {
                // Mark hint viewed when showing explanation
                const problem = SmartQueue.getCurrent();
                if (problem && storage && storage.markHintViewed) {
                    storage.markHintViewed(problem.id);
                }

                explanation.style.display = 'block';
                showExplanationBtn.textContent = 'Hide Explanation';
            } else {
                explanation.style.display = 'none';
                showExplanationBtn.textContent = 'Show Explanation';
            }
        });
    }

    const generateSimilarBtn = document.getElementById('generateSimilarBtn');
    if (generateSimilarBtn) {
        generateSimilarBtn.addEventListener('click', generateSimilarProblem);
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.addEventListener('click', goToPrevious);
    if (nextBtn) nextBtn.addEventListener('click', goToNext);

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goToNext();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const input = document.getElementById('shortAnswerInput');
            if (input && document.activeElement === input && !input.disabled) {
                e.preventDefault();
                checkShortAnswer();
            }
        }
    });
}

/* =========================================================
   OTHER FEATURES
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

function initializeReset() {
    const resetBtn = document.getElementById('resetProgress');
    if (resetBtn && storage) {
        resetBtn.addEventListener('click', async () => {
            const confirmed = await ModalSystem.confirm(
                'Reset Progress',
                'Are you sure you want to reset <strong>all</strong> your progress? This cannot be undone!',
                { danger: true, confirmText: 'Reset All', cancelText: 'Cancel' }
            );

            if (!confirmed) return;

            await storage.resetProgress();
            updateStatsDisplay();
            updateSidebarCounts();
            showCurrentProblem();
        });
    }
}

function updateStatsDisplay() {
    if (!storage) return;

    const stats = storage.getStats();

    const statCorrect = document.getElementById('statCorrect');
    const statTotal = document.getElementById('statTotal');
    const statAccuracy = document.getElementById('statAccuracy');

    if (statCorrect) statCorrect.textContent = stats.correctAnswers || 0;
    if (statTotal) statTotal.textContent = stats.uniqueProblems || 0;
    if (statAccuracy) statAccuracy.textContent = `${stats.accuracy || 0}%`;

    if (window.updateAdaptiveDashboard) {
        updateAdaptiveDashboard();
    }
}

function updateAdaptiveDashboard() {
    const sidebarDash = document.getElementById('sidebarAdaptiveDashboard');

    if (!sidebarDash) return;

    const stats = storage ? storage.getStats() : { uniqueProblems: 0 };

    if (stats.uniqueProblems < 1) {
        sidebarDash.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: var(--text-light); font-size: 0.8125rem;">
                Answer a problem to see your progress
            </div>
        `;
        return;
    }

    if (!window.AdaptiveLearningEngine) {
        sidebarDash.innerHTML = '';
        return;
    }

    const engine = new AdaptiveLearningEngine();
    const level = engine.getStudentLevel();
    const streak = engine.getCurrentStreak();

    let html = '<div style="padding: 1rem; border-top: 1px solid var(--border);">';

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

    html += `
        <a href="dashboard.html" style="display: block; margin-top: 0.75rem; text-align: center; color: var(--primary); font-size: 0.8125rem; text-decoration: none; font-weight: 600;">
            View Full Dashboard →
        </a>
    `;

    html += '</div>';

    sidebarDash.innerHTML = html;

    updateBookmarkCount();
}

function updateBookmarkCount() {
    const sidebarDash = document.getElementById('sidebarAdaptiveDashboard');
    if (!sidebarDash) return;

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
            sidebarDash.insertAdjacentHTML('beforeend', html);
        } else {
            const countSpan = bookmarkSection.querySelector('span:last-child');
            if (countSpan) countSpan.textContent = count;
        }
    } else if (bookmarkSection) {
        bookmarkSection.remove();
    }
}

function updateBookmarkModeUI() {
    let banner = document.getElementById('bookmarkModeBanner');

    if (isBookmarkMode) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'bookmarkModeBanner';
            banner.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 260px;
                right: 0;
                z-index: 50;
                background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                color: white;
                padding: 0.75rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 -2px 12px rgba(245, 158, 11, 0.3);
                animation: slideUp 0.3s ease;
                border-top: 2px solid rgba(255, 255, 255, 0.2);
            `;

            banner.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.25rem;">⭐</span>
                    <div>
                        <div style="font-weight: 700; font-size: 0.9375rem;">Bookmark Mode</div>
                        <div style="font-size: 0.8125rem; opacity: 0.9;">Viewing ${problemQueue.length} bookmarked problem${problemQueue.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                <button onclick="exitBookmarkMode()" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.875rem;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    Exit Bookmark Mode
                </button>
            `;

            document.body.appendChild(banner);
        } else {
            // Update count in existing banner
            const countText = banner.querySelector('div div:last-child');
            if (countText) {
                countText.textContent = `Viewing ${problemQueue.length} bookmarked problem${problemQueue.length !== 1 ? 's' : ''}`;
            }
        }
    } else {
        if (banner) {
            banner.remove();
        }
    }
}

function updateUserUI() {
    const userAuthSection = document.getElementById('userAuthSection');
    if (!userAuthSection) return;

    if (storage && storage.isLoggedIn && storage.user) {
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
    localStorage.setItem('returnToPath', window.location.pathname);
    localStorage.setItem('authMode', mode);
    window.location.href = './auth.html';
};

window.signOut = async function() {
    if (storage) {
        await storage.logout();
        updateUserUI();
        updateStatsDisplay();
    }
};

/* =========================================================
   INIT
   ========================================================= */

async function init() {
    console.log('Initializing app...');
    console.log('📊 Smart Hybrid System: Static = curriculum, Generated = practice');

    BookmarkSystem.init();

    if (window.storage) {
        await storage.init();
        console.log('Storage initialized');
        updateUserUI();
        updateStatsDisplay();

        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('Auth state changed:', user ? 'logged in' : 'logged out');
                updateUserUI();
                if (user) {
                    updateStatsDisplay();
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
    updateSidebarCounts();

    // Initialize Practice Similar button (hide initially)
    if (window.updatePracticeSimilarButton) {
        updatePracticeSimilarButton();
    }

    console.log('App ready!');
    console.log('🏆 Mastery System: ' + (window.MasterySystem ? 'Enabled ✅' : 'Not loaded'));
    console.log('🎖️ Achievements: ' + (window.AchievementSystem ? 'Enabled ✅' : 'Not loaded'));
}

window.addEventListener('resize', () => {
    const menuToggle = document.getElementById('menuToggle');

    if (window.innerWidth <= 768) {
        if (menuToggle) menuToggle.style.display = 'flex';
    } else {
        if (menuToggle) menuToggle.style.display = 'none';
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.BookmarkSystem = BookmarkSystem;
window.CrossOutSystem = CrossOutSystem;