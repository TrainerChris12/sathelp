let problems = [];
let activeTopics = new Set(['all', 'algebra', 'geometry', 'trigonometry', 'statistics', 'functions', 'problem-solving']);
let activeDifficulties = new Set(['easy', 'medium', 'hard']);
let searchQuery = '';

// Load problems from JSON file
async function loadProblems() {
    try {
        const response = await fetch('../data/problems.json');
        problems = await response.json();
        renderProblems();
        updateStats();
    } catch (error) {
        console.error('Error loading problems:', error);
        document.getElementById('problemsContainer').innerHTML =
            '<div class="no-results">Error loading problems. Please refresh the page.</div>';
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
    problemsList.forEach(p => {
        if (!organized[p.topic]) {
            organized[p.topic] = [];
        }
        organized[p.topic].push(p);
    });

    // Sort problems within each topic by year and question number
    Object.keys(organized).forEach(topic => {
        organized[topic].sort((a, b) => {
            // Official problems first
            if (a.type !== b.type) {
                return a.type === 'official' ? -1 : 1;
            }
            // Then by year (newest first)
            if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
            // Then by question number
            return (b.questionNumber || 0) - (a.questionNumber || 0);
        });
    });

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
            const sourceText = isPractice ? 'Practice Problem' : 'Practice Problem';

            return `
                            <div class="problem-card ${isPractice ? 'practice-problem' : ''}" data-id="${problem.id}">
                                <div class="problem-header">
                                    <div class="problem-meta">
                                        <span class="badge ${isPractice ? 'badge-practice' : 'badge-source'}">${sourceText}</span>
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
                                <div class="problem-footer">
                                    <button class="action-btn secondary show-answer">Show Answer</button>
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
    updateStats();
}

function updateStats() {
    document.getElementById('totalProblems').textContent = problems.length;
    document.getElementById('topicCount').textContent = getUniqueTopics().length;
    document.getElementById('yearRange').textContent = getYearRange();
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
                // Check if all topics are selected
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
// Show/hide answer
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('show-answer')) {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;
        const problem = problems.find(p => p.id === problemId);

        if (e.target.textContent === 'Show Answer') {
            // Clear all user selections first
            card.querySelectorAll('.choice').forEach(c => {
                c.classList.remove('selected', 'incorrect');
            });

            // Show correct answer
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
            // Hide answer
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

// Click to select answer

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('choice')) {
        const card = e.target.closest('.problem-card');
        const problemId = card.dataset.id;
        const problem = problems.find(p => p.id === problemId);

        // Check if correct answer already found
        const alreadyCorrect = card.querySelector('.choice.correct:not([data-from-show-answer])');
        if (alreadyCorrect) {
            return; // Lock the problem, no more clicks allowed
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

        if (selectedLetter === problem.answer) {
            e.target.classList.add('correct');
            e.target.classList.remove('selected');

            // Change "Show Answer" to "Hide Answer"
            const showAnswerBtn = card.querySelector('.show-answer');
            showAnswerBtn.textContent = 'Hide Answer';
            showAnswerBtn.classList.remove('secondary');
            showAnswerBtn.classList.add('answered');

            // LOCKED - no more clicks allowed
        } else {
            e.target.classList.add('incorrect');
        }
    }
});
// Initialize
loadProblems();