
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKvfdFY6GlCcND4vDsf1t40A-ChGqpmPw",
  authDomain: "talktotextpro-e9f34.firebaseapp.com",
  projectId: "talktotextpro-e9f34",
  storageBucket: "talktotextpro-e9f34.firebasestorage.app",
  messagingSenderId: "534911791683",
  appId: "1:534911791683:web:30a1b7b152f94659a45af6",
  measurementId: "G-6W469RHVCL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Analytics only in the browser
let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((error) => {
      console.error("Error initializing Firebase Analytics:", error);
    });
}

export { app, auth, googleProvider, analytics };
