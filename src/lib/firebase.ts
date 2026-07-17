import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

let app;
let db: any = null;
let auth: any = null;
let isFirebaseConfigured = false;

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully");
  } catch (err) {
    console.error("Failed to initialize Firebase", err);
  }
} else {
  console.log("Firebase in fallback/offline mode (not configured)");
}

export { db, auth, isFirebaseConfigured };
