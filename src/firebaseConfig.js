import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJ28mGyKYA_TMS-SAreZHjz-FbhJvVAho",
    authDomain: "e-commerce-70adb.firebaseapp.com",
    projectId: "e-commerce-70adb",
    storageBucket: "e-commerce-70adb.firebasestorage.app",
    messagingSenderId: "870658501942",
    appId: "1:870658501942:web:ef40fbd33bd9ac6b231797"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
