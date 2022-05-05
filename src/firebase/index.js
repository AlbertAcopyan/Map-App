import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-q36Yj3toj8GEMfsETgl7L-yWUr1N21Y",
  authDomain: "map-app-d5401.firebaseapp.com",
  projectId: "map-app-d5401",
  storageBucket: "map-app-d5401.appspot.com",
  messagingSenderId: "772248938009",
  appId: "1:772248938009:web:b0a9c906aa458fdf502c88",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDB = getFirestore();
