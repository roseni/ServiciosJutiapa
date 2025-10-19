"use client";

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


