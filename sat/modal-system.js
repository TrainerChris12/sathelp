// modal-system.js - Universal Modal System

const ModalSystem = {
    overlay: null,
    currentResolve: null,

    init() {
        // Create modal overlay if it doesn't exist
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'modal-overlay';
            this.overlay.id = 'modalOverlay';
            document.body.appendChild(this.overlay);

            // Close on overlay click
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close(false);
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                    this.close(false);
                }
            });
        }
    },

    // Confirm dialog - returns Promise<boolean>
    confirm(title, message, options = {}) {
        if (!this.overlay) {
            console.error('ModalSystem not initialized');
            this.init();
        }

        return new Promise((resolve) => {
            this.currentResolve = resolve;

            const confirmText = options.confirmText || 'Confirm';
            const cancelText = options.cancelText || 'Cancel';
            const isDanger = options.danger || false;

            this.overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-secondary" id="modalCancel">
                            ${cancelText}
                        </button>
                        <button class="modal-btn ${isDanger ? 'modal-btn-danger' : 'modal-btn-primary'}" id="modalConfirm">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('modalCancel').addEventListener('click', () => this.close(false));
            document.getElementById('modalConfirm').addEventListener('click', () => this.close(true));

            this.show();
        });
    },

    // Alert dialog - returns Promise<void>
    alert(title, message, options = {}) {
        if (!this.overlay) {
            console.error('ModalSystem not initialized');
            this.init();
        }

        return new Promise((resolve) => {
            this.currentResolve = () => resolve();

            const buttonText = options.buttonText || 'OK';

            this.overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-primary" id="modalOk">
                            ${buttonText}
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('modalOk').addEventListener('click', () => this.close(true));

            this.show();
        });
    },

    // Prompt dialog - returns Promise<string|null>
    prompt(title, message, options = {}) {
        return new Promise((resolve) => {
            this.currentResolve = resolve;

            const placeholder = options.placeholder || '';
            const defaultValue = options.defaultValue || '';
            const confirmText = options.confirmText || 'OK';
            const cancelText = options.cancelText || 'Cancel';

            this.overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <input type="text" class="modal-input" id="modalInput" 
                               placeholder="${placeholder}" value="${defaultValue}">
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-secondary" id="modalCancel">
                            ${cancelText}
                        </button>
                        <button class="modal-btn modal-btn-primary" id="modalConfirm">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            const input = document.getElementById('modalInput');
            document.getElementById('modalCancel').addEventListener('click', () => this.close(null));
            document.getElementById('modalConfirm').addEventListener('click', () => {
                this.close(input.value);
            });

            // Submit on Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.close(input.value);
                }
            });

            this.show();

            // Focus input after animation
            setTimeout(() => input.focus(), 100);
        });
    },

    show() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close(result) {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';

        if (this.currentResolve) {
            this.currentResolve(result);
            this.currentResolve = null;
        }
    }
};

// Make available globally IMMEDIATELY
window.ModalSystem = ModalSystem;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModalSystem.init());
} else {
    ModalSystem.init();
}