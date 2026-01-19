let problems = [];
let activeTopics = new Set(['all', 'algebra', 'geometry', 'trigonometry', 'statistics', 'functions', 'problem-solving']);
let activeDifficulties = new Set(['easy', 'medium', 'hard']);
let searchQuery = '';
const problemTimers = {}; // ADD THIS - Track time spent

// Shuffle array function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
// Load problems from JSON
async function loadProblems() {
    try {
        const response = await fetch('../data/problems.json');
        problems = await response.json();
        renderProblems();
        updateStatsDisplay();
    } catch (error) {
        console.error('Error loading problems:', error);
        document.getElementById('problemsList').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--error);">
                <p>Error loading problems. Make sure you're running a local server.</p>
                <p style="margin-top: 1rem; font-family: monospace;">python3 -m http.server 8000</p>
            </div>
        `;
    }
}

function getYearRange() {
    if (problems.length === 0) return 'N/A';
    const officialProblems = problems.filter(p => p.type === 'official');
    if (officialProblems.length === 0) return 'N/A';
    const years = officialProblems.map(p => p.year).sort((a, b) => a - b);
    const min = years[0];
    const max = years[years.length - 1];
    return min === max ? `${min}` : `${min}-${max}`;
}

function getUniqueTopics() {
    return [...new Set(problems.map(p => p.topic))];
}

function filterProblems() {
    return problems.filter(p => {
        const topicMatch = activeTopics.has('all') || activeTopics.has(p.topic);
        const difficultyMatch = activeDifficulties.has(p.difficulty);
        const searchMatch = searchQuery === '' ||
            p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.year && p.year.toString().includes(searchQuery)) ||
            (p.questionNumber && p.questionNumber.toString().includes(searchQuery)) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase());
        return topicMatch && difficultyMatch && searchMatch;
    });
}

function organizeByTopic(problemsList) {
    const organized = {};

    // Shuffle the problems first
    const shuffledProblems = shuffleArray(problemsList);

    shuffledProblems.forEach(p => {
        if (!organized[p.topic]) {
            organized[p.topic] = [];
        }
        organized[p.topic].push(p);
    });

    // No sorting - keep them random!
    // The shuffled order is already applied

    return organized;
}

function renderProblems() {
    const container = document.getElementById('problemsContainer');
    const filteredProblems = filterProblems();

    if (filteredProblems.length === 0) {
        container.innerHTML = '<div class="no-results">No problems match your filters. Try adjusting your selection or search terms.</div>';
        document.getElementById('visibleProblems').textContent = '0';
        return;
    }

    const organized = organizeByTopic(filteredProblems);
    let html = '';

    const topicNames = {
        'algebra': 'Algebra',
        'geometry': 'Geometry',
        'trigonometry': 'Trigonometry',
        'statistics': 'Statistics & Probability',
        'functions': 'Functions',
        'problem-solving': 'Problem Solving & Data Analysis'
    };

    Object.keys(organized).sort().forEach(topic => {
        const topicProblems = organized[topic];
        html += `
            <div class="topic-section">
                <h2 class="topic-header">
                    ${topicNames[topic] || topic}
                    <span class="topic-count">(${topicProblems.length})</span>
                </h2>
                <div class="problems-grid">
                    ${topicProblems.map(problem => {
            const isPractice = problem.type === 'practice';
            return `
                            <div class="problem-card ${isPractice ? 'practice-problem' : ''}" data-id="${problem.id}">
                                <div class="problem-header">
                                    <div class="problem-meta">
                                        <span class="badge badge-difficulty badge-${problem.difficulty}">${problem.difficulty}</span>
                                    </div>
                                    <div class="problem-id">${problem.id}</div>
                                </div>
                                ${problem.imageUrl ? `<img src="../${problem.imageUrl}" alt="Problem diagram" class="problem-image">` : ''}
                                <div class="problem-content">${problem.question}</div>
                                ${problem.choices && problem.choices.length > 0 ? `
                                    <div class="problem-choices">
                                        ${problem.choices.map(choice => `
                                            <div class="choice">${choice}</div>
                                        `).join('')}
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
                        `;
        }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('visibleProblems').textContent = filteredProblems.length;
}


// Topic filter buttons
document.getElementById('topicFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        const topic = e.target.dataset.topic;

        if (topic === 'all') {
            if (activeTopics.has('all')) {
                activeTopics.clear();
                document.querySelectorAll('#topicFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
            } else {
                activeTopics = new Set(['all', 'algebra', 'geometry', 'trigonometry', 'statistics', 'functions', 'problem-solving']);
                document.querySelectorAll('#topicFilters .filter-btn').forEach(btn => btn.classList.add('active'));
            }
        } else {
            if (activeTopics.has(topic)) {
                activeTopics.delete(topic);
                e.target.classList.remove('active');
                activeTopics.delete('all');
                document.querySelector('[data-topic="all"]').classList.remove('active');
            } else {
                activeTopics.add(topic);
                e.target.classList.add('active');
                const allTopicsSelected = ['algebra', 'geometry', 'trigonometry', 'statistics', 'functions', 'problem-solving']
                    .every(t => activeTopics.has(t));
                if (allTopicsSelected) {
                    activeTopics.add('all');
                    document.querySelector('[data-topic="all"]').classList.add('active');
                }
            }
        }

        renderProblems();
    }
});

// Difficulty filter buttons
document.getElementById('difficultyFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        const difficulty = e.target.dataset.difficulty;

        if (activeDifficulties.has(difficulty)) {
            activeDifficulties.delete(difficulty);
            e.target.classList.remove('active');
        } else {
            activeDifficulties.add(difficulty);
            e.target.classList.add('active');
        }

        renderProblems();
    }
});

// Search input
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProblems();
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
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('choice')) {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;
        const problem = problems.find(p => p.id === problemId);

        // Start timer on first click
        if (!problemTimers[problemId]) {
            problemTimers[problemId] = Date.now();
        }

        // Check if correct answer already found
        const alreadyCorrect = card.querySelector('.choice.correct:not([data-from-show-answer])');
        if (alreadyCorrect) {
            return;
        }

        // If clicking the same choice, deselect it
        if (e.target.classList.contains('selected')) {
            e.target.classList.remove('selected', 'incorrect');
            return;
        }

        // Remove previous incorrect selection
        card.querySelectorAll('.choice').forEach(c => {
            c.classList.remove('selected', 'incorrect');
        });

        // Mark selected
        e.target.classList.add('selected');

        // Check if correct
        const selectedLetter = e.target.textContent.trim().charAt(0);
        const isCorrect = selectedLetter === problem.answer;

        // Calculate time spent
        const timeSpent = Math.round((Date.now() - problemTimers[problemId]) / 1000);

        if (isCorrect) {
            e.target.classList.add('correct');
            e.target.classList.remove('selected');

            storage.saveAttempt(problemId, true, timeSpent);
            updateStatsDisplay();

            const showAnswerBtn = card.querySelector('.show-answer');
            showAnswerBtn.textContent = 'Hide Answer';
            showAnswerBtn.classList.remove('secondary');
            showAnswerBtn.classList.add('answered');

            console.log(`✓ Correct! Problem ${problemId} saved. Time: ${timeSpent}s`);
            delete problemTimers[problemId];
        } else {
            e.target.classList.add('incorrect');

            storage.saveAttempt(problemId, false, timeSpent);
            updateStatsDisplay();

            console.log(`✗ Incorrect. Problem ${problemId} attempt saved. Time: ${timeSpent}s`);
        }
    }
});

// Check answer for input fields
document.addEventListener('click', (e) => {
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

        // Start timer on first interaction
        if (!problemTimers[problemId]) {
            problemTimers[problemId] = Date.now();
        }

        const timeSpent = Math.round((Date.now() - problemTimers[problemId]) / 1000);

        if (parseFloat(userAnswer) === parseFloat(correctAnswer)) {
            feedback.textContent = '✓ Correct!';
            feedback.className = 'answer-feedback correct';
            input.disabled = true;
            e.target.disabled = true;

            storage.saveAttempt(problemId, true, timeSpent);
            updateStatsDisplay();

            console.log(`✓ Correct! Problem ${problemId} saved. Time: ${timeSpent}s`);
            delete problemTimers[problemId];
        } else {
            feedback.textContent = `✗ Incorrect. The answer is ${correctAnswer}`;
            feedback.className = 'answer-feedback incorrect';

            storage.saveAttempt(problemId, false, timeSpent);
            updateStatsDisplay();

            console.log(`✗ Incorrect. Problem ${problemId} attempt saved. Time: ${timeSpent}s`);
        }
    }
});

// Update stats display
function updateStatsDisplay() {
    if (!document.getElementById('statAttempts')) {
        console.warn('Stats elements not yet loaded');
        return;
    }

    const stats = storage.getStats();

    document.getElementById('statAttempts').textContent = `${stats.correctAnswers}/${stats.uniqueProblems}`;
    document.getElementById('statAccuracy').textContent = stats.accuracy + '%';
    document.getElementById('statStreak').textContent = stats.currentStreak;
    document.getElementById('statTime').textContent = stats.totalTimeMinutes;

    console.log('Stats updated:', stats);
}

// Initialize
loadProblems();

// Practice Similar button
document.addEventListener('click', (e) => {
    if (e.target.textContent === 'Practice Similar') {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;
        const originalProblem = problems.find(p => p.id === problemId);

        if (!originalProblem) {
            console.error('Original problem not found');
            return;
        }

        const newProblem = problemGenerator.generate(originalProblem);

        if (!newProblem) {
            alert('Problem generation not yet available for this topic. Coming soon!');
            return;
        }

        console.log('Generated problem:', newProblem);

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
                    ${newProblem.choices.map(choice => `
                        <div class="choice">${choice}</div>
                    `).join('')}
                </div>
                <div class="problem-footer">
                    <button class="action-btn secondary show-answer">Show Answer</button>
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

// Remove generated problem button
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

// Reset progress button
document.addEventListener('click', (e) => {
    if (e.target.id === 'resetProgress' || e.target.closest('#resetProgress')) {
        if (confirm('⚠️ Are you sure you want to reset ALL your progress?\n\nThis will delete:\n• All problem attempts\n• Your accuracy stats\n• Your streak\n• Time practiced\n\nThis cannot be undone!')) {
            localStorage.clear();
            console.log('Progress reset by user');
            location.reload();
        }
    }
});

// Update user UI based on auth state
async function updateUserUI() {
    const userSection = document.getElementById('userSection');

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

// Wait for storage to initialize, then update UI
storage.init().then(() => {
    updateUserUI();
    updateStatsDisplay();
});