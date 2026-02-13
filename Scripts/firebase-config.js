// ============================================
// FIREBASE CONFIGURATION (SHARED)
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCiS9TwRDxlpQ1Z_A6QcBi0f6307vI49ws",
    authDomain: "auth.zeronux.store",
    databaseURL: "https://zeronuxstore-default-rtdb.firebaseio.com",
    projectId: "zeronuxstore",
    storageBucket: "zeronuxstore.firebasestorage.app",
    messagingSenderId: "372553296362",
    appId: "1:372553296362:web:4bca9efd5bc12e3f0f6a93",
    measurementId: "G-HSL9HN8V61"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized Successfully (Shared Config)");
} else {
    console.log("Firebase already initialized, skipping...");
}

// Export services globally
// Note: We check if the service is available in the SDK before accessing it
// This prevents errors if a specific page doesn't import the Auth SDK, for example.

if (firebase.database) {
    window.database = firebase.database();
} else {
    console.warn("Firebase Database SDK not loaded.");
}

if (firebase.auth) {
    window.auth = firebase.auth();
}

// Optional: Analytics
if (firebase.analytics) {
    window.analytics = firebase.analytics();
}
