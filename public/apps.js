// public/app.js - COMPLETE WITH COLLAPSIBLE ACTIVE FILTERS

let problems = [];
let activeSubskills = new Set();
let activeDifficulties = new Set(['easy', 'medium', 'hard']);
let activeProgress = 'all';
let searchQuery = '';
const problemTimers = {};

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
            p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase());

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
                        <div class="problem-card" data-id="${problem.id}">
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
                                <button class="action-btn">Practice Similar</button>
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
        btn.addEventListener('click', (e) => {
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
                document.querySelectorAll('#progressFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
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
        });
    });
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Active Filters Toggle
    const activeFiltersToggle = document.getElementById('activeFiltersToggle');
    const activeFiltersSection = document.querySelector('.active-filters-section');
    const activeFiltersContent = document.getElementById('activeFiltersContent');

    if (activeFiltersToggle) {
        activeFiltersToggle.addEventListener('click', (e) => {
            // Don't toggle if clicking "Clear All" button
            if (e.target.id === 'clearAllFilters' || e.target.closest('#clearAllFilters')) {
                return;
            }

            activeFiltersSection.classList.toggle('collapsed');
            activeFiltersContent.classList.toggle('active');
        });
    }

    // Keep active filters open by default
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

    // Open first accordion by default
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
        });
    });

    // Initialize all subskills as active
    document.querySelectorAll('[data-subskill]').forEach(checkbox => {
        activeSubskills.add(checkbox.dataset.subskill);
    });

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
            }
        });
    }

    // Progress filters
    const progressFilters = document.getElementById('progressFilters');
    if (progressFilters) {
        progressFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const progress = e.target.dataset.progress;

                // If clicking "all", just activate it
                if (progress === 'all') {
                    document.querySelectorAll('#progressFilters .filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    activeProgress = 'all';
                } else {
                    // For "solved" or "unsolved", toggle behavior
                    if (e.target.classList.contains('active')) {
                        // If already active, deactivate and go back to "all"
                        e.target.classList.remove('active');
                        const allBtn = document.querySelector('[data-progress="all"]');
                        if (allBtn) allBtn.classList.add('active');
                        activeProgress = 'all';
                    } else {
                        // If not active, activate it and deactivate others
                        document.querySelectorAll('#progressFilters .filter-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        e.target.classList.add('active');
                        activeProgress = progress;
                    }
                }

                updateActiveFilterTags();
                renderProblems();
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
        });
    }

    // Clear all filters
    const clearAllBtn = document.getElementById('clearAllFilters');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggling the accordion

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
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            searchQuery = '';

            updateSelectedCounts();
            updateActiveFilterTags();
            renderProblems();
        });
    }

    // Initialize
    updateSelectedCounts();
    updateActiveFilterTags();
});

// Show/hide answer
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('show-answer')) {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;
        const problem = problems.find(p => p.id === problemId);

        if (e.target.textContent === 'Show Answer') {
            card.querySelectorAll('.choice').forEach(c => {
                c.classList.remove('selected', 'incorrect');
            });

            const choices = card.querySelectorAll('.choice');
            choices.forEach(choice => {
                if (choice.textContent.startsWith(problem.answer + ')')) {
                    choice.classList.add('correct');
                    choice.dataset.fromShowAnswer = 'true';
                }
            });
            e.target.textContent = 'Hide Answer';
            e.target.classList.remove('secondary');
            e.target.classList.add('answered');
        } else {
            const choices = card.querySelectorAll('.choice');
            choices.forEach(choice => {
                choice.classList.remove('correct');
                delete choice.dataset.fromShowAnswer;
            });
            e.target.textContent = 'Show Answer';
            e.target.classList.add('secondary');
            e.target.classList.remove('answered');
        }
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

// Click to select answer
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('choice')) {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;
        const problem = problems.find(p => p.id === problemId);

        if (!problemTimers[problemId]) {
            problemTimers[problemId] = Date.now();
        }

        const progress = storage.getProgress();
        const problemData = progress.problems[problemId];

        if (problemData && problemData.correct === true) {
            console.log('Problem already solved correctly - locked');
            return;
        }

        if (e.target.classList.contains('selected')) {
            e.target.classList.remove('selected', 'incorrect');
            return;
        }

        card.querySelectorAll('.choice').forEach(c => {
            c.classList.remove('selected', 'incorrect');
            if (!c.dataset.fromShowAnswer) {
                c.classList.remove('correct');
            }
        });

        e.target.classList.add('selected');

        const selectedLetter = e.target.textContent.trim().charAt(0);
        const isCorrect = selectedLetter === problem.answer;
        const timeSpent = Math.round((Date.now() - problemTimers[problemId]) / 1000);

        if (isCorrect) {
            e.target.classList.add('correct');
            e.target.classList.remove('selected');

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

            const showAnswerBtn = card.querySelector('.show-answer');
            if (showAnswerBtn) {
                showAnswerBtn.textContent = 'Hide Answer';
                showAnswerBtn.classList.remove('secondary');
                showAnswerBtn.classList.add('answered');
            }

            delete problemTimers[problemId];
        } else {
            e.target.classList.add('incorrect');

            await storage.recordAttempt(problemId, false, timeSpent);
            updateStatsDisplay();

            if (!problemData) {
                const metaSection = card.querySelector('.problem-meta');
                const oldBadge = metaSection.querySelector('.badge-solved, .badge-attempted');
                if (!oldBadge) {
                    metaSection.insertAdjacentHTML('beforeend', '<span class="badge badge-attempted" title="Attempted but not solved">Attempted</span>');
                }
            }

            console.log(`❌ ${problemId} - Incorrect`);
        }
    }
});

// Check answer for input fields
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

            console.log(`✅ Correct answer for ${problemId}`);
            delete problemTimers[problemId];
        } else {
            feedback.textContent = `✗ Incorrect. The answer is ${correctAnswer}`;
            feedback.className = 'answer-feedback incorrect';

            await storage.recordAttempt(problemId, false, timeSpent);
            updateStatsDisplay();

            console.log(`❌ Incorrect answer for ${problemId}`);
        }
    }
});

// Practice Similar
document.addEventListener('click', (e) => {
    if (e.target.textContent === 'Practice Similar') {
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

        const newCardHTML = `
            <div class="problem-card generated-problem" data-id="${newProblem.id}">
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
                    <button class="action-btn">Practice Similar</button>
                    <button class="action-btn remove-generated">Remove</button>
                </div>
            </div>
        `;

        card.insertAdjacentHTML('afterend', newCardHTML);
        const newCard = card.nextElementSibling;
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// Remove generated problem
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-generated')) {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;

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