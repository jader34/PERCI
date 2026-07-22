import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

let app;
let db: any = null;
let auth: any = null;
let isFirebaseConfigured = false;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    const config = {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain || "perci-47ab0.firebaseapp.com",
      projectId: firebaseConfig.projectId && firebaseConfig.projectId !== "dummy-project-id" ? firebaseConfig.projectId : "perci-47ab0",
      storageBucket: firebaseConfig.storageBucket || "perci-47ab0.firebasestorage.app",
      messagingSenderId: firebaseConfig.messagingSenderId || "374364901745",
      appId: firebaseConfig.appId || "1:374364901745:web:0406739a886dc5a912e6d0"
    };
    app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully with project:", config.projectId);
  } catch (err) {
    console.error("Failed to initialize Firebase", err);
  }
} else {
  console.log("Firebase in fallback/offline mode (not configured)");
}

export { db, auth, isFirebaseConfigured };
