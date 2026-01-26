// public/app.js - COMPLETE WITH FILTER PERSISTENCE
// ✅ Filters now save to localStorage and restore on page reload

let problems = [];
let activeSubskills = new Set();
let activeDifficulties = new Set(['easy', 'medium', 'hard']);
let activeProgress = 'all';
let searchQuery = '';
const problemTimers = {};

// ✅ UI cap for generated problems (keeps the page fast)
const MAX_GENERATED_UI = 150;
let generatedUIQueue = []; // newest first

// Display name mappings
const topicDisplayNames = {
    'algebra': 'Algebra',
    'advanced-math': 'Advanced Math',
    'problem-solving': 'Problem Solving & Data Analysis',
    'geometry': 'Geometry & Trigonometry'
};

const subskillDisplayNames = {
    'linear-equations-one-variable': 'Linear Equations (1 var)',
    'linear-functions': 'Linear Functions',
    'linear-equations-two-variables': 'Linear Equations (2 vars)',
    'systems-linear-equations': 'Systems of Equations',
    'linear-inequalities': 'Linear Inequalities',
    'nonlinear-functions': 'Nonlinear Functions',
    'nonlinear-equations': 'Nonlinear Equations',
    'equivalent-expressions': 'Equivalent Expressions',
    'ratios-rates': 'Ratios & Rates',
    'percentages': 'Percentages',
    'one-variable-data': 'One-Variable Data',
    'two-variable-data': 'Two-Variable Data',
    'probability': 'Probability',
    'inference': 'Inference',
    'statistical-claims': 'Statistical Claims',
    'area-volume': 'Area & Volume',
    'lines-angles-triangles': 'Lines & Angles',
    'right-triangles': 'Right Triangles & Trig',
    'circles': 'Circles'
};

// =========================================================
// ✅ FILTER PERSISTENCE
// =========================================================

// Save filters to localStorage
function saveFiltersToStorage() {
    const filterState = {
        subskills: Array.from(activeSubskills),
        difficulties: Array.from(activeDifficulties),
        progress: activeProgress,
        search: searchQuery
    };
    localStorage.setItem('satPracticeFilters', JSON.stringify(filterState));
}

// Load filters from localStorage
function loadFiltersFromStorage() {
    const saved = localStorage.getItem('satPracticeFilters');
    if (!saved) return false;

    try {
        const filterState = JSON.parse(saved);

        // Restore subskills
        if (filterState.subskills && Array.isArray(filterState.subskills)) {
            activeSubskills = new Set(filterState.subskills);
            document.querySelectorAll('[data-subskill]').forEach(checkbox => {
                checkbox.checked = activeSubskills.has(checkbox.dataset.subskill);
            });
        }

        // Restore difficulties
        if (filterState.difficulties && Array.isArray(filterState.difficulties)) {
            activeDifficulties = new Set(filterState.difficulties);
            document.querySelectorAll('#difficultyFilters .filter-btn').forEach(btn => {
                btn.classList.toggle('active', activeDifficulties.has(btn.dataset.difficulty));
            });
        }

        // Restore progress filter
        if (filterState.progress) {
            activeProgress = filterState.progress;
            document.querySelectorAll('#progressFilters .filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.progress === activeProgress);
            });
        }

        // Restore search
        if (filterState.search) {
            searchQuery = filterState.search;
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = searchQuery;
        }

        return true;
    } catch (e) {
        console.error('Error loading saved filters:', e);
        return false;
    }
}

// =========================================================
// UTILITY FUNCTIONS
// =========================================================

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get progress badge for a problem
function getProgressBadge(problemId) {
    if (!window.storage) return '';

    const progress = storage.getProgress();
    if (!progress || !progress.problems) return '';

    const problem = progress.problems[problemId];

    if (!problem) {
        return '';
    }

    if (problem.correct) {
        return '<span class="badge badge-solved" title="Solved correctly">✓ Solved</span>';
    }

    return '<span class="badge badge-attempted" title="Attempted but not solved">Attempted</span>';
}

// Load problems from JSON
async function loadProblems() {
    console.log('Loading problems...');
    try {
        const response = await fetch('../data/problems.json');
        problems = await response.json();
        console.log('Loaded', problems.length, 'problems');
        renderProblems();
    } catch (error) {
        console.error('Error loading problems:', error);
        const container = document.getElementById('problemsContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc2626;">
                    <p>Error loading problems. Make sure you're running a local server.</p>
                    <p style="margin-top: 1rem; font-family: monospace;">python -m http.server 8000</p>
                </div>
            `;
        }
    }
}

// Filter problems
function filterProblems() {
    const progress = storage ? storage.getProgress() : { problems: {} };

    return problems.filter(p => {
        // Subskill filter
        let subskillMatch = true;
        if (activeSubskills.size > 0) {
            subskillMatch = activeSubskills.has(p.subskill);
        }

        // Difficulty filter
        const difficultyMatch = activeDifficulties.has(p.difficulty);

        // Progress filter
        let progressMatch = true;
        if (activeProgress === 'solved') {
            progressMatch = progress.problems[p.id]?.correct === true;
        } else if (activeProgress === 'unsolved') {
            progressMatch = !progress.problems[p.id]?.correct;
        }

        // Search filter
        const searchMatch = searchQuery === '' ||
            (p.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.id || '').toLowerCase().includes(searchQuery.toLowerCase());

        return subskillMatch && difficultyMatch && progressMatch && searchMatch;
    });
}

// Organize by topic and subskill
function organizeByTopicAndSubskill(problemsList) {
    const organized = {};

    problemsList.forEach(p => {
        const key = `${p.topic}|||${p.subskill}`;
        if (!organized[key]) {
            organized[key] = [];
        }
        organized[key].push(p);
    });

    Object.keys(organized).forEach(key => {
        organized[key] = shuffleArray(organized[key]);
    });

    return organized;
}

// Render problems
function renderProblems() {
    console.log('Rendering problems...');
    const container = document.getElementById('problemsContainer');
    if (!container) {
        console.error('problemsContainer not found!');
        return;
    }

    const filteredProblems = filterProblems();
    console.log('Filtered to', filteredProblems.length, 'problems');

    if (filteredProblems.length === 0) {
        container.innerHTML = '<div class="no-results">No problems match your filters. Try adjusting your selection.</div>';
        const visibleElem = document.getElementById('visibleProblems');
        if (visibleElem) visibleElem.textContent = '0';
        return;
    }

    const organized = organizeByTopicAndSubskill(filteredProblems);
    let html = '';

    Object.keys(organized).sort().forEach(key => {
        const [topic, subskill] = key.split('|||');
        const topicProblems = organized[key];

        html += `
            <div class="topic-section">
                <h2 class="topic-header">
                    ${topicDisplayNames[topic] || topic} › ${subskillDisplayNames[subskill] || subskill}
                    <span class="topic-count">(${topicProblems.length})</span>
                </h2>
                <div class="problems-grid">
                    ${topicProblems.map(problem => `
                        <div class="problem-card" data-id="${problem.id}" data-answer-shown="false" data-answer-source="">
                            <div class="problem-header">
                                <div class="problem-meta">
                                    <span class="badge badge-difficulty badge-${problem.difficulty}">${problem.difficulty}</span>
                                    ${getProgressBadge(problem.id)}
                                </div>
                                <div class="problem-id">${problem.id}</div>
                            </div>
                            ${problem.imageUrl ? `<img src="../${problem.imageUrl}" alt="Problem diagram" class="problem-image">` : ''}
                            <div class="problem-content">${problem.question}</div>
                            ${problem.choices && problem.choices.length > 0 ? `
                                <div class="problem-choices">
                                    ${problem.choices.map(choice => `<div class="choice">${choice}</div>`).join('')}
                                </div>
                            ` : problem.answerType === 'number' ? `
                                <div class="answer-input-group">
                                    <label>Your Answer:</label>
                                    <input type="number" class="answer-input" placeholder="Enter your answer" data-correct="${problem.answer}">
                                    <button class="check-answer-btn">Check Answer</button>
                                    <div class="answer-feedback"></div>
                                </div>
                            ` : ''}

                            ${problem.explanation ? `
                                <div class="explanation-section" style="display: none;">
                                    <div class="explanation-header">
                                        <span class="explanation-icon">💡</span>
                                        <strong>Explanation:</strong>
                                    </div>
                                    <div class="explanation-content">${problem.explanation}</div>
                                </div>
                            ` : ''}
                            <div class="problem-footer">
                                <button class="action-btn secondary show-answer">Show Answer</button>
                                ${problem.explanation ? `<button class="action-btn show-explanation">Show Explanation</button>` : ''}
                                <button class="action-btn practice-similar">Practice Similar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    const visibleElem = document.getElementById('visibleProblems');
    if (visibleElem) visibleElem.textContent = filteredProblems.length;
}

// Update stats display
function updateStatsDisplay() {
    if (!storage) return;

    const statAttempts = document.getElementById('statAttempts');
    const statAccuracy = document.getElementById('statAccuracy');
    const statStreak = document.getElementById('statStreak');
    const statTime = document.getElementById('statTime');

    if (!statAttempts) return;

    const stats = storage.getStats();

    statAttempts.textContent = `${stats.correctAnswers}/${stats.uniqueProblems}`;
    statAccuracy.textContent = stats.accuracy + '%';
    statStreak.textContent = stats.currentStreak;
    statTime.textContent = stats.totalTimeMinutes;

    console.log('📊 Stats updated:', stats);
}

// Update user UI
function updateUserUI() {
    const userSection = document.getElementById('userSection');
    if (!userSection || !storage) return;

    if (storage.isLoggedIn && storage.user) {
        const user = storage.user;
        userSection.innerHTML = `
            <div class="user-info">
                ${user.photoURL ? `<img src="${user.photoURL}" alt="Profile" class="user-avatar">` : ''}
                <div>
                    <div class="user-email">${user.email}</div>
                    <div class="sync-status">☁️ Synced</div>
                </div>
            </div>
            <button class="logout-btn" onclick="storage.logout()">Logout</button>
        `;
    } else {
        userSection.innerHTML = `
            <button class="auth-btn" onclick="window.location.href='auth.html'">Login / Sign Up</button>
        `;
    }
}

// Update selected counts for each topic
function updateSelectedCounts() {
    const topicSubskills = {
        'algebra': ['linear-equations-one-variable', 'linear-functions', 'linear-equations-two-variables', 'systems-linear-equations', 'linear-inequalities'],
        'advanced-math': ['nonlinear-functions', 'nonlinear-equations', 'equivalent-expressions'],
        'problem-solving': ['ratios-rates', 'percentages', 'one-variable-data', 'two-variable-data', 'probability', 'inference', 'statistical-claims'],
        'geometry': ['area-volume', 'lines-angles-triangles', 'right-triangles', 'circles']
    };

    Object.keys(topicSubskills).forEach(topic => {
        const subskills = topicSubskills[topic];
        const selectedCount = subskills.filter(s => activeSubskills.has(s)).length;
        const totalCount = subskills.length;

        const countElement = document.querySelector(`[data-topic-count="${topic}"]`);
        if (countElement) {
            countElement.textContent = `${selectedCount}/${totalCount} selected`;
        }
    });
}

// Update active filter tags display
function updateActiveFilterTags() {
    const tagsContainer = document.getElementById('activeFiltersTags');
    if (!tagsContainer) return;

    let tagsHTML = '';

    // Subskill tags
    activeSubskills.forEach(subskill => {
        const displayName = subskillDisplayNames[subskill] || subskill;
        tagsHTML += `
            <div class="filter-tag">
                <span>${displayName}</span>
                <span class="filter-tag-remove" data-remove-subskill="${subskill}">×</span>
            </div>
        `;
    });

    // Difficulty tags
    activeDifficulties.forEach(difficulty => {
        tagsHTML += `
            <div class="filter-tag difficulty-${difficulty}">
                <span>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                <span class="filter-tag-remove" data-remove-difficulty="${difficulty}">×</span>
            </div>
        `;
    });

    // Progress tag (if not "all")
    if (activeProgress !== 'all') {
        tagsHTML += `
            <div class="filter-tag progress">
                <span>${activeProgress === 'solved' ? 'Solved Only' : 'Unsolved Only'}</span>
                <span class="filter-tag-remove" data-remove-progress="true">×</span>
            </div>
        `;
    }

    // Search tag
    if (searchQuery) {
        tagsHTML += `
            <div class="filter-tag">
                <span>Search: "${searchQuery}"</span>
                <span class="filter-tag-remove" data-remove-search="true">×</span>
            </div>
        `;
    }

    if (tagsHTML === '') {
        tagsHTML = '<span class="no-filters-message">All problems shown</span>';
    }

    tagsContainer.innerHTML = tagsHTML;

    // Add event listeners to remove buttons
    tagsContainer.querySelectorAll('.filter-tag-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.removeSubskill) {
                const subskill = btn.dataset.removeSubskill;
                activeSubskills.delete(subskill);
                const checkbox = document.querySelector(`[data-subskill="${subskill}"]`);
                if (checkbox) checkbox.checked = false;
            } else if (btn.dataset.removeDifficulty) {
                const difficulty = btn.dataset.removeDifficulty;
                activeDifficulties.delete(difficulty);
                const diffBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
                if (diffBtn) diffBtn.classList.remove('active');
            } else if (btn.dataset.removeProgress) {
                activeProgress = 'all';
                document.querySelectorAll('#progressFilters .filter-btn').forEach(b => b.classList.remove('active'));
                const allBtn = document.querySelector('[data-progress="all"]');
                if (allBtn) allBtn.classList.add('active');
            } else if (btn.dataset.removeSearch) {
                searchQuery = '';
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
            }

            updateSelectedCounts();
            updateActiveFilterTags();
            renderProblems();
            saveFiltersToStorage(); // ✅ Save after removing filter tag
        });
    });
}

/* =========================
   ✅ MC Helpers
   ========================= */
function getCorrectLetter(problem) {
    return String(problem.answer ?? '').trim().toUpperCase();
}

function getChoiceLetter(choiceText) {
    const t = (choiceText || '').trim();
    return t ? t.charAt(0).toUpperCase() : '';
}

function setShowAnswerButtonState(card, show) {
    const btn = card.querySelector('.show-answer');
    if (!btn) return;

    if (show) {
        btn.textContent = 'Hide Answer';
        btn.classList.remove('secondary');
        btn.classList.add('answered');
    } else {
        btn.textContent = 'Show Answer';
        btn.classList.add('secondary');
        btn.classList.remove('answered');
    }
}

/* =========================
   DOM Content Loaded
   ========================= */
document.addEventListener('DOMContentLoaded', async () => {
    // ========== BACK TO TOP BUTTON ==========
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========== DARK MODE TOGGLE ==========
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');

    if (themeToggle && themeIcon) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☾';

        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            themeIcon.textContent = next === 'dark' ? '☀' : '☾';
        });
    }

    // ========== ACTIVE FILTERS TOGGLE ==========
    const activeFiltersToggle = document.getElementById('activeFiltersToggle');
    const activeFiltersSection = document.querySelector('.active-filters-section');
    const activeFiltersContent = document.getElementById('activeFiltersContent');

    if (activeFiltersToggle) {
        activeFiltersToggle.addEventListener('click', (e) => {
            if (e.target.id === 'clearAllFilters' || e.target.closest('#clearAllFilters')) {
                return;
            }
            activeFiltersSection.classList.toggle('collapsed');
            activeFiltersContent.classList.toggle('active');
        });
    }

    if (activeFiltersSection) {
        activeFiltersSection.classList.remove('collapsed');
    }
    if (activeFiltersContent) {
        activeFiltersContent.classList.add('active');
    }

    // Accordion functionality
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.closest('.accordion-item');
            accordionItem.classList.toggle('active');
        });
    });

    const firstAccordion = document.querySelector('.accordion-item');
    if (firstAccordion) {
        firstAccordion.classList.add('active');
    }

    // Subskill checkbox handling
    document.querySelectorAll('[data-subskill]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const subskill = e.target.dataset.subskill;

            if (e.target.checked) {
                activeSubskills.add(subskill);
            } else {
                activeSubskills.delete(subskill);
            }

            updateSelectedCounts();
            updateActiveFilterTags();
            renderProblems();
            saveFiltersToStorage(); // ✅ Save after subskill change
        });
    });

    // ✅ Load saved filters OR initialize all as active
    const loadedFilters = loadFiltersFromStorage();
    if (!loadedFilters) {
        // Default: all subskills active, all difficulties active
        document.querySelectorAll('[data-subskill]').forEach(checkbox => {
            checkbox.checked = true;
            activeSubskills.add(checkbox.dataset.subskill);
        });
        // Difficulties are already initialized to all active
        document.querySelectorAll('#difficultyFilters .filter-btn').forEach(btn => {
            btn.classList.add('active');
        });
    }

    // Difficulty filters
    const difficultyFilters = document.getElementById('difficultyFilters');
    if (difficultyFilters) {
        difficultyFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const difficulty = e.target.dataset.difficulty;

                if (activeDifficulties.has(difficulty)) {
                    activeDifficulties.delete(difficulty);
                    e.target.classList.remove('active');
                } else {
                    activeDifficulties.add(difficulty);
                    e.target.classList.add('active');
                }

                updateActiveFilterTags();
                renderProblems();
                saveFiltersToStorage(); // ✅ Save after difficulty change
            }
        });
    }

    // Progress filters
    const progressFilters = document.getElementById('progressFilters');
    if (progressFilters) {
        progressFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const progress = e.target.dataset.progress;

                if (progress === 'all') {
                    document.querySelectorAll('#progressFilters .filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    activeProgress = 'all';
                } else {
                    if (e.target.classList.contains('active')) {
                        e.target.classList.remove('active');
                        const allBtn = document.querySelector('[data-progress="all"]');
                        if (allBtn) allBtn.classList.add('active');
                        activeProgress = 'all';
                    } else {
                        document.querySelectorAll('#progressFilters .filter-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        e.target.classList.add('active');
                        activeProgress = progress;
                    }
                }

                updateActiveFilterTags();
                renderProblems();
                saveFiltersToStorage(); // ✅ Save after progress change
            }
        });
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateActiveFilterTags();
            renderProblems();
            saveFiltersToStorage(); // ✅ Save after search change
        });
    }

    // Clear all filters
    const clearAllBtn = document.getElementById('clearAllFilters');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Uncheck all subskills
            document.querySelectorAll('[data-subskill]').forEach(checkbox => {
                checkbox.checked = false;
            });
            activeSubskills.clear();

            // Reset difficulty
            document.querySelectorAll('#difficultyFilters .filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            activeDifficulties.clear();

            // Reset progress to "all"
            document.querySelectorAll('#progressFilters .filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const allProgressBtn = document.querySelector('[data-progress="all"]');
            if (allProgressBtn) allProgressBtn.classList.add('active');
            activeProgress = 'all';

            // Clear search
            if (searchInput) searchInput.value = '';
            searchQuery = '';

            updateSelectedCounts();
            updateActiveFilterTags();
            renderProblems();
            saveFiltersToStorage(); // ✅ Save after clearing all
        });
    }

    // Initialize
    updateSelectedCounts();
    updateActiveFilterTags();
});

// ✅ Show/hide answer (MULTIPLE CHOICE + SHORT ANSWER)
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('show-answer')) return;

    const card = e.target.closest('.problem-card');
    if (!card) return;

    const problemId = card.dataset.id;
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;

    const currentlyShown = card.dataset.answerShown === 'true';
    const nextShown = !currentlyShown;

    card.dataset.answerShown = nextShown ? 'true' : 'false';
    card.dataset.answerSource = nextShown ? 'button' : '';

    // MULTIPLE CHOICE
    if (problem.choices && problem.choices.length > 0) {
        const choices = card.querySelectorAll('.choice');
        const correctLetter = getCorrectLetter(problem);

        if (nextShown) {
            choices.forEach(c => c.classList.remove('incorrect', 'selected'));

            choices.forEach(choice => {
                if (getChoiceLetter(choice.textContent) === correctLetter) {
                    choice.classList.add('correct');
                    choice.dataset.fromShowAnswer = 'true';
                }
            });

            setShowAnswerButtonState(card, true);
        } else {
            choices.forEach(choice => {
                if (choice.dataset.fromShowAnswer === 'true') {
                    choice.classList.remove('correct');
                    delete choice.dataset.fromShowAnswer;
                }
            });

            setShowAnswerButtonState(card, false);
        }

        return;
    }

    // SHORT ANSWER (number input)
    const inputGroup = card.querySelector('.answer-input-group');
    if (!inputGroup) return;

    const input = inputGroup.querySelector('.answer-input');
    const feedback = inputGroup.querySelector('.answer-feedback');

    const correctAnswer = input?.dataset.correct ?? problem.answer;

    if (nextShown) {
        feedback.textContent = `Answer: ${correctAnswer}`;
        feedback.className = 'answer-feedback correct';
        feedback.dataset.fromShowAnswer = "true";

        setShowAnswerButtonState(card, true);
    } else {
        if (feedback.dataset.fromShowAnswer === "true") {
            feedback.textContent = '';
            feedback.className = 'answer-feedback';
            delete feedback.dataset.fromShowAnswer;
        }

        setShowAnswerButtonState(card, false);
    }
});

// Show/hide explanation
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('show-explanation')) {
        const card = e.target.closest('.problem-card');
        const explanationSection = card.querySelector('.explanation-section');

        if (e.target.textContent === 'Show Explanation') {
            explanationSection.style.display = 'block';
            e.target.textContent = 'Hide Explanation';
            e.target.classList.add('answered');
        } else {
            explanationSection.style.display = 'none';
            e.target.textContent = 'Show Explanation';
            e.target.classList.remove('answered');
        }
    }
});

// ✅ Click to select answer (MC)
document.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('choice')) return;

    const card = e.target.closest('.problem-card');
    const problemId = card.dataset.id;
    const problem = problems.find(p => p.id === problemId);

    if (!problemTimers[problemId]) {
        problemTimers[problemId] = Date.now();
    }

    const progress = storage.getProgress();
    const problemData = progress?.problems?.[problemId];
    const alreadySolved = problemData && problemData.correct === true;

    const clicked = e.target;

    const answerShown = card.dataset.answerShown === 'true';
    const answerSource = card.dataset.answerSource || '';

    if (answerSource === 'button') {
        card.querySelectorAll('.choice').forEach(c => c.classList.remove('selected', 'incorrect'));
        clicked.classList.add('selected');
        return;
    }

    card.querySelectorAll('.choice').forEach(c => {
        c.classList.remove('selected', 'incorrect', 'correct');
        delete c.dataset.fromShowAnswer;
    });

    clicked.classList.add('selected');

    const selectedLetter = getChoiceLetter(clicked.textContent);
    const correctLetter = getCorrectLetter(problem);
    const isCorrect = selectedLetter === correctLetter;
    const timeSpent = Math.round((Date.now() - problemTimers[problemId]) / 1000);

    if (isCorrect) {
        clicked.classList.add('correct');
        clicked.classList.remove('selected');

        card.dataset.answerShown = 'true';
        card.dataset.answerSource = 'correctClick';

        clicked.dataset.fromShowAnswer = 'true';

        setShowAnswerButtonState(card, true);

        if (!alreadySolved) {
            const counted = await storage.recordAttempt(problemId, true, timeSpent);
            updateStatsDisplay();

            const metaSection = card.querySelector('.problem-meta');
            const oldBadge = metaSection.querySelector('.badge-solved, .badge-attempted');
            if (oldBadge) oldBadge.remove();

            if (counted) {
                metaSection.insertAdjacentHTML('beforeend', '<span class="badge badge-solved" title="Solved correctly">✓ Solved</span>');
                console.log(`✅ ${problemId} - Correct and COUNTED`);
            } else {
                metaSection.insertAdjacentHTML('beforeend', '<span class="badge badge-attempted" title="Got it right but was wrong before">Attempted</span>');
                console.log(`⚠️ ${problemId} - Correct but doesn't count (was wrong before)`);
            }
        }

        delete problemTimers[problemId];
    } else {
        card.dataset.answerShown = 'false';
        card.dataset.answerSource = '';
        setShowAnswerButtonState(card, false);

        clicked.classList.add('incorrect');
        clicked.classList.remove('selected');

        if (!alreadySolved) {
            await storage.recordAttempt(problemId, false, timeSpent);
            updateStatsDisplay();

            if (!problemData) {
                const metaSection = card.querySelector('.problem-meta');
                const oldBadge = metaSection.querySelector('.badge-solved, .badge-attempted');
                if (!oldBadge) {
                    metaSection.insertAdjacentHTML('beforeend', '<span class="badge badge-attempted" title="Attempted but not solved">Attempted</span>');
                }
            }
        }

        console.log(`❌ ${problemId} - Incorrect`);
    }
});

// Check answer for input fields (number)
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('check-answer-btn')) {
        const inputGroup = e.target.closest('.answer-input-group');
        const input = inputGroup.querySelector('.answer-input');
        const feedback = inputGroup.querySelector('.answer-feedback');
        const correctAnswer = input.dataset.correct;
        const userAnswer = input.value.trim();

        if (!userAnswer) {
            feedback.textContent = 'Please enter an answer';
            feedback.className = 'answer-feedback';
            return;
        }

        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;

        if (!problemTimers[problemId]) {
            problemTimers[problemId] = Date.now();
        }

        const timeSpent = Math.round((Date.now() - problemTimers[problemId]) / 1000);

        if (parseFloat(userAnswer) === parseFloat(correctAnswer)) {
            feedback.textContent = '✓ Correct!';
            feedback.className = 'answer-feedback correct';
            input.disabled = true;
            e.target.disabled = true;

            await storage.recordAttempt(problemId, true, timeSpent);
            updateStatsDisplay();

            const metaSection = card.querySelector('.problem-meta');
            const oldBadge = metaSection.querySelector('.badge-solved, .badge-attempted');
            if (oldBadge) oldBadge.remove();
            metaSection.insertAdjacentHTML('beforeend', '<span class="badge badge-solved" title="Solved correctly">✓ Solved</span>');

            card.dataset.answerShown = 'true';
            card.dataset.answerSource = 'correctClick';
            setShowAnswerButtonState(card, true);

            console.log(`✅ Correct answer for ${problemId}`);
            delete problemTimers[problemId];
        } else {
            feedback.textContent = `✗ Incorrect. Try again!`;
            feedback.className = 'answer-feedback incorrect';

            await storage.recordAttempt(problemId, false, timeSpent);
            updateStatsDisplay();

            console.log(`❌ Incorrect answer for ${problemId}`);
        }
    }
});

// Practice Similar
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('practice-similar')) return;

    const card = e.target.closest('.problem-card');
    const problemId = card.dataset.id;
    const originalProblem = problems.find(p => p.id === problemId);

    if (!originalProblem) {
        console.error('Original problem not found');
        return;
    }

    if (!window.problemGenerator) {
        alert('Problem generator not loaded');
        return;
    }

    const newProblem = problemGenerator.generate(originalProblem);

    if (!newProblem) {
        alert('Problem generation not yet available for this topic. Coming soon!');
        return;
    }

    problems.push(newProblem);

    generatedUIQueue.unshift(newProblem.id);

    if (generatedUIQueue.length > MAX_GENERATED_UI) {
        const oldestId = generatedUIQueue.pop();

        const idx = problems.findIndex(p => p.id === oldestId);
        if (idx > -1) problems.splice(idx, 1);

        const oldCard = document.querySelector(`.problem-card[data-id="${oldestId}"]`);
        if (oldCard) oldCard.remove();
    }

    const newCardHTML = `
        <div class="problem-card generated-problem" data-id="${newProblem.id}" data-answer-shown="false" data-answer-source="">
            <div class="problem-header">
                <div class="problem-meta">
                    <span class="badge badge-generated">Generated</span>
                    <span class="badge badge-difficulty badge-${newProblem.difficulty}">${newProblem.difficulty}</span>
                </div>
                <div class="problem-id">${newProblem.id}</div>
            </div>
            <div class="problem-content">${newProblem.question}</div>
            <div class="problem-choices">
                ${newProblem.choices.map(choice => `<div class="choice">${choice}</div>`).join('')}
            </div>
            ${newProblem.explanation ? `
                <div class="explanation-section" style="display: none;">
                    <div class="explanation-header">
                        <span class="explanation-icon">💡</span>
                        <strong>Explanation:</strong>
                    </div>
                    <div class="explanation-content">${newProblem.explanation}</div>
                </div>
            ` : ''}
            <div class="problem-footer">
                <button class="action-btn secondary show-answer">Show Answer</button>
                ${newProblem.explanation ? `<button class="action-btn show-explanation">Show Explanation</button>` : ''}
                <button class="action-btn practice-similar">Practice Similar</button>
                <button class="action-btn remove-generated">Remove</button>
            </div>
        </div>
    `;

    card.insertAdjacentHTML('afterend', newCardHTML);
    const newCard = card.nextElementSibling;
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Remove generated problem
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-generated')) {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;

        generatedUIQueue = generatedUIQueue.filter(id => id !== problemId);

        const index = problems.findIndex(p => p.id === problemId);
        if (index > -1) {
            problems.splice(index, 1);
        }

        card.remove();
    }
});

// Reset progress
document.addEventListener('click', async (e) => {
    if (e.target.id === 'resetProgress' || e.target.closest('#resetProgress')) {
        if (storage) {
            await storage.resetProgress();
        }
    }
});

// Initialize
async function init() {
    console.log('Initializing app...');

    if (window.storage) {
        await storage.init();
        console.log('Storage initialized');
    }

    await loadProblems();
    updateUserUI();
    updateStatsDisplay();

    console.log('App ready!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/* =========================================================
   RESIZABLE CALCULATOR PANEL JS (FIXED)
   - No nested buttons
   - Icon swaps light/dark + open/close
   - Keeps button size stable (CSS handles sizing)
   ========================================================= */

(function () {
    const calculatorToggle = document.getElementById('calculatorToggle');
    const calculatorPanel = document.getElementById('calculatorPanel');
    const calculatorClose = document.getElementById('calculatorClose');
    const calculatorTabs = document.querySelectorAll('.calculator-tab');
    const calculatorFrames = document.querySelectorAll('.calculator-frame');
    const resizeHandle = document.getElementById('calculatorResizeHandle');
    const widthDisplay = document.getElementById('calculatorWidthDisplay');

    if (!calculatorToggle || !calculatorPanel) return;

    // ✅ icon element INSIDE the button
    const iconImg = calculatorToggle.querySelector('img');

    // ====== ICON PATHS (edit these to match your files) ======
    const ICONS = {
        light: {
            closed: '/images/icons/black-calc.png',
            open:   '/images/icons/black-x.png'     // optional (or use calc icon still)
        },
        dark: {
            closed: '/images/icons/white-calc.png',
            open:   '/images/icons/white-x.png'     // optional
        }
    };

    // Default and saved width
    const DEFAULT_WIDTH = 500;
    const MIN_WIDTH = 350;
    const MAX_WIDTH = 800;

    let calculatorWidth = parseInt(localStorage.getItem('calculatorWidth'), 10) || DEFAULT_WIDTH;
    let isResizing = false;

    // Apply initial width
    setCalculatorWidth(calculatorWidth);

    // ====== Helpers ======
    function getTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function isOpen() {
        return calculatorPanel.classList.contains('open');
    }

    function setToggleIcon() {
        if (!iconImg) return;

        const theme = getTheme();
        const open = isOpen();

        // Use X icons if you have them; otherwise fall back to calc icons
        const src =
            open
                ? (ICONS[theme].open || ICONS[theme].closed)
                : ICONS[theme].closed;

        iconImg.src = src;
    }

    function openCalculator() {
        calculatorPanel.classList.add('open');
        document.body.classList.add('calculator-open');
        calculatorToggle.classList.add('active');
        calculatorToggle.title = 'Close Calculator';

        localStorage.setItem('calculatorOpen', 'true');
        setToggleIcon();
    }

    function closeCalculator() {
        calculatorPanel.classList.remove('open');
        document.body.classList.remove('calculator-open');
        calculatorToggle.classList.remove('active');
        calculatorToggle.title = 'Open Calculator';

        localStorage.setItem('calculatorOpen', 'false');
        setToggleIcon();
    }

    function setCalculatorWidth(width) {
        calculatorWidth = width;
        document.documentElement.style.setProperty('--calculator-width', `${width}px`);
        if (widthDisplay) widthDisplay.textContent = `${width}px`;
    }

    // ====== Toggle click ======
    calculatorToggle.addEventListener('click', () => {
        if (isOpen()) closeCalculator();
        else openCalculator();
    });

    // Close button
    if (calculatorClose) calculatorClose.addEventListener('click', closeCalculator);

    // Escape closes
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) closeCalculator();
    });

    // ====== Tabs ======
    calculatorTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const calcType = tab.dataset.calc;

            calculatorTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            calculatorFrames.forEach((frame) => {
                frame.classList.remove('active');

                const frameType = frame.id.replace('calc', '').toLowerCase();
                if (frameType === calcType) {
                    frame.classList.add('active');

                    // Lazy load iframe
                    if (frame.src === 'about:blank' && frame.dataset.src) {
                        frame.src = frame.dataset.src;
                    }
                }
            });

            localStorage.setItem('calculatorTab', calcType);
        });
    });

    // Restore tab
    const savedTab = localStorage.getItem('calculatorTab');
    if (savedTab) {
        const tabToActivate = document.querySelector(`.calculator-tab[data-calc="${savedTab}"]`);
        if (tabToActivate) tabToActivate.click();
    }

    // ====== Resizing ======
    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', startResize);
        resizeHandle.addEventListener('touchstart', startResize, { passive: false });
    }

    function startResize(e) {
        e.preventDefault();
        isResizing = true;

        document.body.classList.add('calculator-resizing');
        resizeHandle.classList.add('dragging');

        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('touchend', stopResize);
    }

    function doResize(e) {
        if (!isResizing) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const windowWidth = window.innerWidth;
        let newWidth = windowWidth - clientX;

        newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
        setCalculatorWidth(newWidth);
    }

    function stopResize() {
        if (!isResizing) return;

        isResizing = false;
        document.body.classList.remove('calculator-resizing');
        resizeHandle.classList.remove('dragging');

        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', doResize);
        document.removeEventListener('touchend', stopResize);

        localStorage.setItem('calculatorWidth', calculatorWidth);
    }

    // ====== Restore open state ======
    const savedCalcState = localStorage.getItem('calculatorOpen');
    if (savedCalcState === 'true') openCalculator();
    else closeCalculator(); // ensures icon is correct on load

    // ====== Window resize behavior ======
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            document.documentElement.style.setProperty('--calculator-width', '100%');
        } else {
            setCalculatorWidth(calculatorWidth);
        }
    });

    // ====== Update icon if theme changes elsewhere ======
    // If your theme toggle sets data-theme, this will keep the icon synced.
    const themeObserver = new MutationObserver(() => setToggleIcon());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Initial icon set
    setToggleIcon();
})();

const calcIcon = calculatorToggle.querySelector('.calc-icon');

function updateCalcIcon() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light';

    calcIcon.src =
        theme === 'dark'
            ? 'images/icons/white-calc.png'
            : 'images/icons/black-calc.png';
}

// run once on load
updateCalcIcon();

// update when theme changes
const themeObserver = new MutationObserver(updateCalcIcon);
themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});


