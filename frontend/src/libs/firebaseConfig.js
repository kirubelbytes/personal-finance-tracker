// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvu-3YdQF2E-0qh62bK3zo7nLNZEuTq9M",
  authDomain: "expense-tracker-8d489.firebaseapp.com",
  projectId: "expense-tracker-8d489",
  storageBucket: "expense-tracker-8d489.firebasestorage.app",
  messagingSenderId: "1075634937505",
  appId: "1:1075634937505:web:b0c36dffedcf9ea81d1ae0",
  measurementId: "G-44H2E9ED5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);