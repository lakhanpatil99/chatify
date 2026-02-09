import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvRdC0yDjO4mOVdAidpf1cuhj8wZCF344",
  authDomain: "quatify-auth.firebaseapp.com",
  projectId: "quatify-auth",
  storageBucket: "quatify-auth.firebasestorage.app",
  messagingSenderId: "948115004546",
  appId: "1:948115004546:web:0e3f717cb6ba4badc5689b",
  measurementId: "G-LM02ZKCMLN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
