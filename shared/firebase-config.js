// sat/firebase-config.js

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCgVk46fNU4lX5T5WYdk7XLqTxOnnJyphM",
    authDomain: "sat-math-practice-67601.firebaseapp.com",
    projectId: "sat-math-practice-67601",
    storageBucket: "sat-math-practice-67601.firebasestorage.app",
    messagingSenderId: "123350253823",
    appId: "1:123350253823:web:6d330c0e3bbf517b204cca"
};

firebase.initializeApp(firebaseConfig);

// Get references
const auth = firebase.auth();
const db = firebase.firestore();

console.log('🔥 Firebase initialized successfully');