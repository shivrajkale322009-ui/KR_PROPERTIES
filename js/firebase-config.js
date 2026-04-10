// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADKeKflAlbIrm66UDSBJ7alfTT-Yt3dS0",
  authDomain: "estate-83e8c.firebaseapp.com",
  projectId: "estate-83e8c",
  storageBucket: "estate-83e8c.firebasestorage.app",
  messagingSenderId: "645143571943",
  appId: "1:645143571943:web:37a4b818dceac1078a6142",
  measurementId: "G-E9VFLKXE76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// FORCE LOGOUT ON TAB CLOSE
setPersistence(auth, browserSessionPersistence)
  .catch((error) => console.error("Persistence error:", error));

export const db = getFirestore(app);
