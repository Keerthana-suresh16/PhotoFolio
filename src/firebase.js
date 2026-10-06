import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace these values with the configuration from your Firebase project.
// Firebase Console -> Project settings -> Your apps -> Web app -> SDK setup.
const firebaseConfig = {
  apiKey: "AIzaSyCtEhio9a_XclHvc6DEgM-eGDCJSZkSASE",
  authDomain: "photofolio-4f71e.firebaseapp.com",
  projectId: "photofolio-4f71e",
  storageBucket: "photofolio-4f71e.firebasestorage.app",
  messagingSenderId: "301512174168",
  appId: "1:301512174168:web:5f20fc4bc27f0df716b82d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
