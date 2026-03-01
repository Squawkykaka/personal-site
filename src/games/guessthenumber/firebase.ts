import { initializeApp } from "firebase/app";
import { browserSessionPersistence, initializeAuth, type User } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBjjSwm8ARN8jb-Z23XXMEymlCgLzv7qOI",
    authDomain: "comp-database-assesment.firebaseapp.com",
    projectId: "comp-database-assesment",
    storageBucket: "comp-database-assesment.firebasestorage.app",
    messagingSenderId: "744210310754",
    appId: "1:744210310754:web:b149d717995dc26375533b"
};

// Initialize Firebase
const APP = initializeApp(firebaseConfig);
const DB = initializeFirestore(APP, {});
const AUTH = initializeAuth(APP)
AUTH.setPersistence(browserSessionPersistence)

let currentUser: User | null = null;
AUTH.onAuthStateChanged(user => {
    currentUser = user
    console.log(user);
})

export function getUser() {
    return currentUser    
}

export { DB, AUTH }