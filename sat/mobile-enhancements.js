// Mobile Responsive Enhancements + Modal System

/* =========================================================
   MODAL SYSTEM (Replace all alerts/confirms)
   ========================================================= */

const ModalSystem = {
    overlay: null,

    init() {
        // Create modal overlay if it doesn't exist
        if (!document.getElementById('modalOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'modalOverlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
            this.overlay = overlay;

            // Click outside to close
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        } else {
            this.overlay = document.getElementById('modalOverlay');
        }
    },

    show(options) {
        this.init();

        const modal = document.createElement('div');
        modal.className = 'modal';

        let html = `
            <div class="modal-header">${options.title || 'Confirm'}</div>
            <div class="modal-message">${options.message || ''}</div>
        `;

        if (options.input) {
            html += `<input type="text" class="modal-input" id="modalInput" placeholder="${options.inputPlaceholder || ''}" value="${options.inputValue || ''}">`;
        }

        html += '<div class="modal-actions">';

        if (options.showCancel !== false) {
            html += `<button class="modal-btn cancel" id="modalCancel">Cancel</button>`;
        }

        const confirmClass = options.danger ? 'danger' : 'confirm';
        html += `<button class="modal-btn ${confirmClass}" id="modalConfirm">${options.confirmText || 'Confirm'}</button>`;

        html += '</div>';

        modal.innerHTML = html;
        this.overlay.innerHTML = '';
        this.overlay.appendChild(modal);
        this.overlay.classList.add('active');

        // Focus input if present
        if (options.input) {
            setTimeout(() => {
                const input = document.getElementById('modalInput');
                if (input) input.focus();
            }, 100);
        }

        return new Promise((resolve) => {
            const confirmBtn = document.getElementById('modalConfirm');
            const cancelBtn = document.getElementById('modalCancel');
            const input = document.getElementById('modalInput');

            const handleConfirm = () => {
                if (options.input) {
                    resolve({ confirmed: true, value: input.value });
                } else {
                    resolve({ confirmed: true });
                }
                this.close();
            };

            const handleCancel = () => {
                resolve({ confirmed: false });
                this.close();
            };

            confirmBtn.addEventListener('click', handleConfirm);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', handleCancel);
            }

            // Enter key to confirm
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        handleConfirm();
                    }
                });
            }
        });
    },

    close() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    },

    async confirm(message, title = 'Confirm', danger = false) {
        const result = await this.show({
            title,
            message,
            danger,
            confirmText: danger ? 'Delete' : 'Confirm'
        });
        return result.confirmed;
    },

    async prompt(message, defaultValue = '', title = 'Input Required') {
        const result = await this.show({
            title,
            message,
            input: true,
            inputValue: defaultValue,
            confirmText: 'Submit'
        });
        return result.confirmed ? result.value : null;
    }
};

/* =========================================================
   TOAST NOTIFICATIONS (Replace alerts)
   ========================================================= */

const Toast = {
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

/* =========================================================
   MOBILE MENU HANDLING
   ========================================================= */

function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    // Create sidebar overlay if it doesn't exist
    let sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.id = 'sidebarOverlay';
        sidebarOverlay.className = 'sidebar-overlay';
        document.body.insertBefore(sidebarOverlay, document.body.firstChild);
    }

    // Toggle sidebar
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    // Close sidebar when overlay clicked
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Close sidebar when nav item clicked on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // Show/hide menu toggle based on screen size
    function updateMenuToggle() {
        if (menuToggle) {
            if (window.innerWidth <= 768) {
                menuToggle.style.display = 'flex';
            } else {
                menuToggle.style.display = 'none';
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        }
    }

    updateMenuToggle();
    window.addEventListener('resize', updateMenuToggle);
}

/* =========================================================
   REPLACE ALL ALERTS/CONFIRMS IN EXISTING CODE
   ========================================================= */

// Override checkShortAnswer to use modal
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

    // Show confirmation modal instead of alert
    const confirmed = await ModalSystem.confirm(
        `Are you sure your answer is "${userAnswer}"?`,
        'Check Answer'
    );

    if (!confirmed) {
        input.focus();
        return;
    }

    // Check if correct
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

// Override reset progress to use modal
async function handleResetProgress() {
    const confirmed = await ModalSystem.confirm(
        'Reset all progress? This cannot be undone.',
        'Reset Progress',
        true // danger mode
    );

    if (!confirmed) return;

    if (storage) {
        await storage.resetProgress();
        updateStatsDisplay();
        showCurrentProblem();
        Toast.success('Progress reset successfully!');
    }
}

// Override generatePracticeBtn to use toasts
function handleGeneratePractice() {
    if (!window.problemGenerator) {
        Toast.error('Problem generator not available!');
        return;
    }

    const COUNT = 10;
    let generated = 0;

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
        Toast.success(`✨ Generated ${generated} fresh problems!`);
    } else {
        Toast.error('Could not generate problems for this topic yet!');
    }
}

// Override generateSimilar to use toasts
function handleGenerateSimilar() {
    const problem = filteredProblems[currentIndex];
    if (!problem || !window.problemGenerator) {
        Toast.error('Problem generator not available!');
        return;
    }

    const newProblem = window.problemGenerator.generate(problem);
    if (!newProblem) {
        Toast.error('Could not generate a similar problem for this topic yet!');
        return;
    }

    newProblem.type = 'generated';
    problems.unshift(newProblem);
    filterProblems();
    currentIndex = 0;
    showCurrentProblem();
    Toast.success('✨ Generated similar problem!');
}

/* =========================================================
   ENHANCED INITIALIZATION
   ========================================================= */

// Call this after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    ModalSystem.init();
    initializeMobileMenu();

    // Update reset button handler
    const resetBtn = document.getElementById('resetProgress');
    if (resetBtn) {
        resetBtn.removeEventListener('click', handleResetProgress);
        resetBtn.addEventListener('click', handleResetProgress);
    }

    // Update generate practice handler
    const generatePracticeBtn = document.getElementById('generatePracticeBtn');
    if (generatePracticeBtn) {
        generatePracticeBtn.removeEventListener('click', handleGeneratePractice);
        generatePracticeBtn.addEventListener('click', handleGeneratePractice);
    }

    // Update generate similar handler
    const generateSimilarBtn = document.getElementById('generateSimilarBtn');
    if (generateSimilarBtn) {
        generateSimilarBtn.removeEventListener('click', handleGenerateSimilar);
        generateSimilarBtn.addEventListener('click', handleGenerateSimilar);
    }
});

/* =========================================================
   PREVENT OVERFLOW ON MOBILE
   ========================================================= */

// Fix math rendering overflow on mobile
if (window.MathJax) {
    MathJax.Hub?.Register?.StartupHook?.("End", () => {
        const mathElements = document.querySelectorAll('.MathJax');
        mathElements.forEach(el => {
            el.style.maxWidth = '100%';
            el.style.overflow = 'auto';
        });
    });
}

// Export for use in other files
window.ModalSystem = ModalSystem;
window.Toast = Toast;