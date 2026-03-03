import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDK4ASn1oE2kKi2FMZIDQrKGx8kWxKjIPg",
    authDomain: "labourlink-da32c.firebaseapp.com",
    projectId: "labourlink-da32c",
    storageBucket: "labourlink-da32c.firebasestorage.app",
    messagingSenderId: "877042053061",
    appId: "1:877042053061:web:7b8539b96e05155aa865ac",
    measurementId: "G-S9TYCDEXFJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
