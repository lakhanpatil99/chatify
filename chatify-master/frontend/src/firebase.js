// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvRdC0yDjO4mOVdAidpf1cuhj8wZCF344",
  authDomain: "quatify-auth.firebaseapp.com",
  projectId: "quatify-auth",
  storageBucket: "quatify-auth.firebasestorage.app",
  messagingSenderId: "948115004546",
  appId: "1:948115004546:web:0e3f717cb6ba4badc5689b",
  measurementId: "G-LM02ZKCMLN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
