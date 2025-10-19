"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
};

function getClientConfig(): FirebaseClientConfig {
  // Next.js inlines ONLY direct references to process.env.NEXT_PUBLIC_*
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  const config: FirebaseClientConfig = {
    apiKey: apiKey ?? "",
    authDomain: authDomain ?? "",
    projectId: projectId ?? "",
    storageBucket,
    messagingSenderId,
    appId: appId ?? "",
    measurementId,
  };

  const missing: string[] = [];
  if (!config.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!config.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!config.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!config.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  if (missing.length > 0) {
    throw new Error(
      `Firebase client env vars are missing. Add the following to .env.local: ${missing.join(", ")}`
    );
  }

  return config;
}

let firebaseAppSingleton: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseAppSingleton) return firebaseAppSingleton;
  const existing = getApps();
  if (existing.length > 0) {
    firebaseAppSingleton = existing[0] as FirebaseApp;
    return firebaseAppSingleton;
  }
  const config = getClientConfig();
  firebaseAppSingleton = initializeApp(config);
  return firebaseAppSingleton;
}


