"use client";

import { getFirebaseApp } from "./client";
import { ensureUserDocument, type UserProfile } from "./firestore";
import { validateCredentials } from "@/lib/utils/validation";
import { getAuthErrorMessage } from "@/lib/utils/auth-errors";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User,
} from "firebase/auth";

export type AuthUser = Pick<
  User,
  | "uid"
  | "displayName"
  | "email"
  | "photoURL"
  | "phoneNumber"
  | "providerId"
> & { isAnonymous: boolean };

export function getAuthClient() {
  const app = getFirebaseApp();
  return getAuth(app);
}

/**
 * Autenticación con Google mediante popup
 * @throws Error con mensaje traducido si falla
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const auth = getAuthClient();
    const provider = new GoogleAuthProvider();
    
    // Forzar selección de cuenta cada vez
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    await ensureUserDocument(toUserProfile(u));
    return toAuthUser(u);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signOutCurrentUser(): Promise<void> {
  const auth = getAuthClient();
  await signOut(auth);
}

/**
 * Registro con email y contraseña
 * @throws Error con mensaje traducido si falla o si las credenciales son inválidas
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  // Validación antes de llamar a Firebase
  const validation = validateCredentials(email, password);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    const auth = getAuthClient();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const u = cred.user;

    // Enviar email de verificación
    try {
      await sendEmailVerification(u);
    } catch (e) {
      // No bloquear el registro si falla el envío del email
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to send verification email", e);
      }
    }

    await ensureUserDocument(toUserProfile(u));
    return toAuthUser(u);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/**
 * Inicio de sesión con email y contraseña
 * @throws Error con mensaje traducido si falla o si las credenciales son inválidas
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  // Validación antes de llamar a Firebase
  const validation = validateCredentials(email, password);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    const auth = getAuthClient();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const u = cred.user;
    await ensureUserDocument(toUserProfile(u));
    return toAuthUser(u);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/**
 * Envía un email de recuperación de contraseña
 * @throws Error con mensaje traducido si falla
 */
export async function resetPassword(email: string): Promise<void> {
  const validation = { isValid: true };
  if (!email || email.trim().length === 0) {
    throw new Error("El correo electrónico es requerido");
  }

  if (validation.isValid) {
    try {
      const auth = getAuthClient();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }
}

/**
 * Suscribe a cambios en el estado de autenticación
 * @returns Función para cancelar la suscripción
 */
export function subscribeToAuthChanges(
  callback: (user: AuthUser | null) => void
) {
  const auth = getAuthClient();
  return onAuthStateChanged(auth, async (u) => {
    if (!u) {
      callback(null);
      return;
    }
    try {
      await ensureUserDocument(toUserProfile(u));
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("ensureUserDocument on auth change failed", e);
      }
    }
    callback(toAuthUser(u));
  });
}

/**
 * Convierte un User de Firebase a AuthUser
 */
function toAuthUser(u: User): AuthUser {
  return {
    uid: u.uid,
    displayName: u.displayName ?? null,
    email: u.email ?? null,
    photoURL: u.photoURL ?? null,
    phoneNumber: u.phoneNumber ?? null,
    providerId: u.providerId,
    isAnonymous: u.isAnonymous,
  };
}

/**
 * Convierte un User de Firebase a UserProfile para Firestore
 */
function toUserProfile(u: User): UserProfile {
  return {
    uid: u.uid,
    email: u.email ?? null,
    displayName: u.displayName ?? null,
    photoURL: u.photoURL ?? null,
    provider: u.providerData?.[0]?.providerId ?? u.providerId ?? null,
    onboardingStatus: "pending", // Nuevos usuarios siempre empiezan con pending
  };
}


