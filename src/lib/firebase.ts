// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwLTr3MJVaKISvivqEsY2UfoBNhu7OTPg",
  authDomain: "floorballlive.firebaseapp.com",
  projectId: "floorballlive",
  storageBucket: "floorballlive.appspot.com",
  messagingSenderId: "935077431603",
  appId: "1:935077431603:web:cbfe8e4d3f56f6d3165646"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
