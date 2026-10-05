import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCoVxY6Pxphhqryek2YFBGviuUDOdLUFhk",
    authDomain: "taskearn-27d45.firebaseapp.com",
    projectId: "taskearn-27d45",
    storageBucket: "taskearn-27d45.firebasestorage.app",
    messagingSenderId: "812806534642",
    appId: "1:812806534642:web:4b2d061b8125ef49c1a76b",
    measurementId: "G-ESH7ZQBNQC"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
