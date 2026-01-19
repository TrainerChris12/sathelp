// public/auth-handler.js

// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding form
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tabName}Form`).classList.add('active');

        // Clear error
        hideError();
    });
});

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('show');
}

// Login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Redirect to main app
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error.code));
    }
});

// Signup form
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupPasswordConfirm').value;

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Initialize user data in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            stats: {
                totalProblems: 0,
                correctAnswers: 0,
                accuracy: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalTimeMinutes: 0
            }
        });

        // Redirect to main app
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Signup error:', error);
        showError(getErrorMessage(error.code));
    }
});

// Google Sign-In
document.getElementById('googleSignIn').addEventListener('click', async () => {
    hideError();

    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        const result = await auth.signInWithPopup(provider);

        // Check if user document exists, create if not
        const userDoc = await db.collection('users').doc(result.user.uid).get();

        if (!userDoc.exists) {
            await db.collection('users').doc(result.user.uid).set({
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                stats: {
                    totalProblems: 0,
                    correctAnswers: 0,
                    accuracy: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalTimeMinutes: 0
                }
            });
        }

        // Redirect to main app
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Google sign-in error:', error);
        showError(getErrorMessage(error.code));
    }
});

// Error message helper
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in cancelled.';
        default:
            return 'An error occurred. Please try again.';
    }
}