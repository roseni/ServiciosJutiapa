"use client";

import { getDb } from "./firestore";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { validateOnboardingData } from "@/lib/utils/onboarding-validation";
import type { UserProfile } from "./firestore";

export type OnboardingData = {
  role: "cliente" | "tecnico";
  fullName: string;
  phoneNumber: string;
  dpi: string;
};

/**
 * Completa el onboarding de un usuario
 * @throws Error si la validación falla o si hay un error en Firestore
 */
export async function completeOnboarding(
  uid: string,
  data: OnboardingData
): Promise<void> {
  // Validar datos
  const validation = validateOnboardingData(data);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    const db = getDb();
    const userRef = doc(db, "users", uid);

    // Verificar que el usuario existe
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error("Usuario no encontrado");
    }

    // Actualizar datos de onboarding
    await updateDoc(userRef, {
      role: data.role,
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber.replace(/[\s\-\(\)]/g, ""), // Guardar sin formato
      dpi: data.dpi.replace(/[\s\-]/g, ""), // Guardar sin formato
      onboardingStatus: "completed",
      onboardingCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al completar el onboarding");
  }
}

/**
 * Obtiene el perfil completo de un usuario desde Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const db = getDb();
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as UserProfile;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("getUserProfile failed", error);
    }
    return null;
  }
}

/**
 * Verifica si un usuario ha completado el onboarding
 */
export async function hasCompletedOnboarding(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  return profile?.onboardingStatus === "completed";
}
