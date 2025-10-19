"use client";

import { getDb } from "./firestore";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export type UpdateProfileData = {
  bio?: string | null;
  skills?: string[];
};

/**
 * Actualiza el perfil del usuario
 * @param uid - ID del usuario
 * @param data - Datos a actualizar
 * @throws Error si la actualización falla
 */
export async function updateUserProfile(
  uid: string,
  data: UpdateProfileData
): Promise<void> {
  try {
    const db = getDb();
    const userRef = doc(db, "users", uid);

    const updateData = {
      updatedAt: serverTimestamp(),
      ...(data.bio !== undefined && { bio: data.bio?.trim() || null }),
      ...(data.skills !== undefined && {
        skills: data.skills.length > 0 ? data.skills : null,
      }),
    };

    await updateDoc(userRef, updateData);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al actualizar el perfil");
  }
}
