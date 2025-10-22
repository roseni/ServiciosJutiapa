"use client";
// Solo una vez en cliente
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!, // clave para GA4
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

import { getFirebaseApp } from "./client";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

export function getDb(): Firestore {
  const app = getFirebaseApp();
  return getFirestore(app);
}

export type OnboardingStatus = "pending" | "completed";
export type UserRole = "cliente" | "tecnico";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
  // Datos de onboarding
  onboardingStatus: OnboardingStatus;
  role?: UserRole | null; // Rol del usuario en la plataforma
  fullName?: string | null;
  phoneNumber?: string | null;
  dpi?: string | null; // Documento Personal de Identificación (Guatemala)
  onboardingCompletedAt?: unknown;
  // Datos de perfil editables
  bio?: string | null; // Biografía del usuario
  skills?: string[] | null; // Habilidades/especialidades
  // Estadísticas de calificación
  averageRating?: number;
  totalReviews?: number;
  ratingsBreakdown?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export async function ensureUserDocument(profile: UserProfile): Promise<void> {
  try {
    const db = getDb();
    const ref = doc(db, "users", profile.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        provider: profile.provider,
        onboardingStatus: profile.onboardingStatus || "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }
    // Update minimal fields that may change over time
    await setDoc(
      ref,
      {
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        provider: profile.provider,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    // Surface Firestore errors during development
    if (process.env.NODE_ENV === "development") {
      console.error("ensureUserDocument failed", err);
    }
    throw err;
  }
}


