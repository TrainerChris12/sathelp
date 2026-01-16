let problems = [];

// Load problems from localStorage or fall back to JSON file
async function loadProblems() {
    const stored = localStorage.getItem('satMathProblems');
    if (stored) {
        problems = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('../data/problems.json');
            problems = await response.json();
            saveProblems();
        } catch (error) {
            console.error('Error loading problems:', error);
            problems = [];
        }
    }
    updateRecentList();
}

// Save problems to localStorage
function saveProblems() {
    localStorage.setItem('satMathProblems', JSON.stringify(problems));
}

// Update preview based on form
function updatePreview() {
    const previewCard = document.getElementById('previewCard');

    const id = document.getElementById('problemId').value;
    const year = document.getElementById('year').value;
    const questionNumber = document.getElementById('questionNumber').value;
    const topic = document.getElementById('topic').value;
    const difficulty = document.getElementById('difficulty').value;
    const type = document.getElementById('type').value;
    const question = document.getElementById('question').value;
    const choiceA = document.getElementById('choiceA').value;
    const choiceB = document.getElementById('choiceB').value;
    const choiceC = document.getElementById('choiceC').value;
    const choiceD = document.getElementById('choiceD').value;
    const answer = document.getElementById('answer').value;
    const basedOn = document.getElementById('basedOn').value;

    if (!id && !question) {
        previewCard.className = 'preview-empty';
        previewCard.innerHTML = 'Fill out the form to see a preview';
        return;
    }

    const isPractice = type === 'practice';
    const sourceText = isPractice
        ? `Practice Problem${basedOn ? ' (based on ' + basedOn + ')' : ''}`
        : year && questionNumber ? `SAT ${year} #${questionNumber}` : 'SAT Question';

    previewCard.className = 'preview-card';
    previewCard.innerHTML = `
        <div class="preview-header">
            <div class="preview-meta">
                <span class="badge ${isPractice ? 'badge-practice' : 'badge-source'}">${sourceText}</span>
                ${difficulty ? `<span class="badge badge-${difficulty}">${difficulty}</span>` : ''}
            </div>
            ${id ? `<div class="preview-id">${id}</div>` : ''}
        </div>
        ${question ? `<div class="preview-question">${question}</div>` : ''}
        ${choiceA || choiceB || choiceC || choiceD ? `
            <div class="preview-choices">
                ${choiceA ? `<div class="preview-choice ${answer === 'A' ? 'correct' : ''}">${choiceA}</div>` : ''}
                ${choiceB ? `<div class="preview-choice ${answer === 'B' ? 'correct' : ''}">${choiceB}</div>` : ''}
                ${choiceC ? `<div class="preview-choice ${answer === 'C' ? 'correct' : ''}">${choiceC}</div>` : ''}
                ${choiceD ? `<div class="preview-choice ${answer === 'D' ? 'correct' : ''}">${choiceD}</div>` : ''}
            </div>
        ` : ''}
    `;
}

// Add new problem
document.getElementById('problemForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const newProblem = {
        id: document.getElementById('problemId').value,
        year: parseInt(document.getElementById('year').value) || null,
        questionNumber: parseInt(document.getElementById('questionNumber').value) || null,
        topic: document.getElementById('topic').value,
        difficulty: document.getElementById('difficulty').value,
        type: document.getElementById('type').value,
        question: document.getElementById('question').value,
        choices: [
            document.getElementById('choiceA').value,
            document.getElementById('choiceB').value,
            document.getElementById('choiceC').value,
            document.getElementById('choiceD').value
        ],
        answer: document.getElementById('answer').value
    };

    if (newProblem.type === 'practice') {
        const basedOn = document.getElementById('basedOn').value;
        if (basedOn) {
            newProblem.basedOn = basedOn;
        }
    }

    // Check if ID already exists
    const existingIndex = problems.findIndex(p => p.id === newProblem.id);
    if (existingIndex !== -1) {
        if (confirm('A problem with this ID already exists. Do you want to replace it?')) {
            problems[existingIndex] = newProblem;
        } else {
            return;
        }
    } else {
        problems.push(newProblem);
    }

    saveProblems();
    updateRecentList();

    // Reset form
    document.getElementById('problemForm').reset();
    updatePreview();

    alert('Problem added successfully!');
});

// Reset form
document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('problemForm').reset();
    updatePreview();
});

// Show/hide based on field
document.getElementById('type').addEventListener('change', (e) => {
    const basedOnGroup = document.getElementById('basedOnGroup');
    if (e.target.value === 'practice') {
        basedOnGroup.style.display = 'block';
    } else {
        basedOnGroup.style.display = 'none';
    }
    updatePreview();
});

// Update preview on any input change
document.querySelectorAll('input, select, textarea').forEach(element => {
    element.addEventListener('input', updatePreview);
    element.addEventListener('change', updatePreview);
});

// Update recent problems list
function updateRecentList() {
    const recentList = document.getElementById('recentList');
    const recent = problems.slice(-10).reverse();

    if (recent.length === 0) {
        recentList.innerHTML = '<p style="color: var(--text-light); text-align: center;">No problems added yet</p>';
        return;
    }

    recentList.innerHTML = recent.map(problem => `
        <div class="recent-item">
            <div class="recent-info">
                <div class="recent-id">${problem.id}</div>
                <div class="recent-desc">
                    ${problem.topic} • ${problem.difficulty} • 
                    ${problem.type === 'official' ? `SAT ${problem.year} #${problem.questionNumber}` : 'Practice'}
                </div>
            </div>
            <button class="recent-action" onclick="deleteProblem('${problem.id}')">Delete</button>
        </div>
    `).join('');
}

// Delete problem
window.deleteProblem = function(id) {
    if (confirm('Are you sure you want to delete this problem?')) {
        problems = problems.filter(p => p.id !== id);
        saveProblems();
        updateRecentList();
    }
};

// Export to JSON
document.getElementById('exportBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(problems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sat-math-problems-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
});

// Import from JSON
document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedProblems = JSON.parse(event.target.result);

            if (!Array.isArray(importedProblems)) {
                throw new Error('Invalid format: JSON must be an array of problems');
            }

            // Merge with existing problems
            const newProblems = importedProblems.filter(ip =>
                !problems.some(p => p.id === ip.id)
            );

            problems = [...problems, ...newProblems];
            saveProblems();
            updateRecentList();

            const status = document.getElementById('importStatus');
            status.className = 'success';
            status.textContent = `Successfully imported ${newProblems.length} new problems!`;

            setTimeout(() => {
                status.textContent = '';
                status.className = '';
            }, 5000);

        } catch (error) {
            const status = document.getElementById('importStatus');
            status.className = 'error';
            status.textContent = `Error: ${error.message}`;
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// Initialize
loadProblems();