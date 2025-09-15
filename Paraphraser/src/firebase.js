// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDpupNzOppR65aZ10uTSWBsVxjdhHdQuAo",
  authDomain: "arregmatica.firebaseapp.com",
  databaseURL: "https://arregmatica-default-rtdb.firebaseio.com",
  projectId: "arregmatica",
  storageBucket: "gs://arregmatica.firebasestorage.app",
  messagingSenderId: "146077788944",
  appId: "1:146077788944:web:cf60a2a718acff3ead5395",
  measurementId: "G-85Q2KL31GM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Auth, Storage, and Database
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
