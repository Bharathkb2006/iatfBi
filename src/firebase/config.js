import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// This file is the single place to export `app`, `db`, and `auth`.
// In Vercel, set the build-time env vars (Vite reads them from import.meta.env).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasAllConfig = Object.values(firebaseConfig).every((v) => typeof v === 'string' && v.trim().length > 0);

let app = null;
let db = null;
let auth = null;

if (hasAllConfig) {
  // Avoid "Firebase app named '[DEFAULT]' already exists" in dev HMR.
  const apps = getApps();
  app = apps.length ? apps[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
export const firebaseReady = hasAllConfig;
