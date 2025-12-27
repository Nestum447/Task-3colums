// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5iLXD-lyu6PZ0x0LrmK9khxWqrPPlPcA",
  authDomain: "gestor-tareas-36fc5.firebaseapp.com",
  projectId: "gestor-tareas-36fc5",
  storageBucket: "gestor-tareas-36fc5.firebasestorage.app",
  messagingSenderId: "326368524776",
  appId: "1:326368524776:web:531cea029c0afde8b28c5d",
  measurementId: "G-667RSDXM8Q",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

