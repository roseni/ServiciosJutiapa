"use client";

import { create } from "zustand";
import { subscribeToAuthChanges, type AuthUser } from "@/lib/firebase/auth";
import { getUserProfile } from "@/lib/firebase/onboarding";
import type { UserProfile } from "@/lib/firebase/firestore";

type AuthState = {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  ensureSubscribed: () => () => void;
  refreshUserProfile: () => Promise<void>;
};

// Variable global para mantener referencia a la función de unsubscribe
let authUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  initialized: false,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  refreshUserProfile: async () => {
    const { user } = get();
    if (!user) {
      set({ userProfile: null });
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      set({ userProfile: profile });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to refresh user profile", error);
      }
    }
  },
  ensureSubscribed: () => {
    // Si ya está inicializado, retornar función de cleanup vacía
    if (get().initialized) {
      return () => {
        // No hacer nada si ya hay una suscripción activa
      };
    }

    // Limpiar suscripción previa si existe
    if (authUnsubscribe) {
      authUnsubscribe();
      authUnsubscribe = null;
    }

    // Crear nueva suscripción
    const unsub = subscribeToAuthChanges(async (u) => {
      set({ user: u, initialized: true, loading: false });
      
      // Cargar perfil de usuario si existe
      if (u) {
        try {
          const profile = await getUserProfile(u.uid);
          set({ userProfile: profile });
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to load user profile", error);
          }
        }
      } else {
        set({ userProfile: null });
      }
    });

    authUnsubscribe = unsub;

    // Cleanup en beforeunload
    if (typeof window !== "undefined") {
      const handleUnload = () => {
        if (authUnsubscribe) {
          authUnsubscribe();
          authUnsubscribe = null;
        }
      };
      window.addEventListener("beforeunload", handleUnload);
    }

    // Retornar función de cleanup
    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
        authUnsubscribe = null;
      }
    };
  },
}));


