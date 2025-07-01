// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAP71GFs3rAbCI92ukHcWI0-Y-qN956vDg",
  authDomain: "internview-c36e2.firebaseapp.com",
  projectId: "internview-c36e2",
  storageBucket: "internview-c36e2.appspot.com",
  messagingSenderId: "399554552443",
  appId: "1:399554552443:web:c118ed9f379df98520b8de",
  measurementId: "G-N24VL18VFR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
